from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models.patient import Patient
from services.triage_service import get_triage_suggestion
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# --- Request/Response Schemas ---

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    contact: str
    symptoms: str

class TriageOverride(BaseModel):
    final_urgency: str
    final_department: str
    was_overridden: bool

# --- Routes ---

@router.post("/patients")
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    # Step 1: Get AI suggestion
    triage = get_triage_suggestion(patient.symptoms)

    # Step 2: Save to database
    db_patient = Patient(
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        contact=patient.contact,
        symptoms=patient.symptoms,
        ai_urgency=triage["urgency"],
        ai_department=triage["department"],
        ai_reasoning=triage["reasoning"],
        final_urgency=triage["urgency"],
        final_department=triage["department"],
        was_overridden=False
    )

    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("/patients")
def get_all_patients(db: Session = Depends(get_db)):
    return db.query(Patient).order_by(Patient.created_at.desc()).all()


@router.get("/patients/search")
def search_patients(q: str, db: Session = Depends(get_db)):
    results = db.query(Patient).filter(
        or_(
            Patient.name.ilike(f"%{q}%"),
            Patient.symptoms.ilike(f"%{q}%"),
            Patient.final_department.ilike(f"%{q}%")
        )
    ).all()
    return results


@router.patch("/patients/{patient_id}/override")
def override_triage(patient_id: int, override: TriageOverride, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient.final_urgency = override.final_urgency
    patient.final_department = override.final_department
    patient.was_overridden = override.was_overridden

    db.commit()
    db.refresh(patient)
    return patient


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Patient).count()
    urgent = db.query(Patient).filter(Patient.final_urgency == "Urgent").count()
    priority = db.query(Patient).filter(Patient.final_urgency == "Priority").count()
    routine = db.query(Patient).filter(Patient.final_urgency == "Routine").count()
    overridden = db.query(Patient).filter(Patient.was_overridden == True).count()

    return {
        "total": total,
        "urgent": urgent,
        "priority": priority,
        "routine": routine,
        "overridden": overridden
    }