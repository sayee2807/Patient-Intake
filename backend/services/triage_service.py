from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_triage_suggestion(age:int, gender: str, symptoms: str) -> dict:
    prompt = f"""
    You are a medical triage assistant. Based on the data and symptoms described below, 
    provide a triage assessment.
    Age:{age}
    Gender:{gender}
    Symptoms: {symptoms}

    Respond ONLY with a valid JSON object in this exact format, nothing else:
    {{
        "urgency": "Routine" or "Priority" or "Urgent",
        "department": one of ["General Medicine", "Cardiology", "Orthopedics", "Neurology", "Pediatrics", "Emergency", "ENT", "Dermatology"],
        "reasoning": "one sentence explanation"
    }}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        text = response.choices[0].message.content.strip()

        # Clean markdown fences if model adds them
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        return json.loads(text)

    except Exception as e:
        print(f"GROQ ERROR: {e}")
        return {
            "urgency": "Priority",
            "department": "General Medicine",
            "reasoning": "Could not process symptoms automatically. Please assess manually."
        }