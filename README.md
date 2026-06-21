# 🏥 Patient Intake System
> AI-powered patient registration and triage system built for clinic front-desk workflows.

---

## Overview

Patient Intake is a full-stack web application that streamlines patient registration at clinic reception desks. When a patient arrives, the receptionist fills in their details and symptoms. An AI model instantly analyzes the symptoms and suggests an urgency level (Urgent / Priority / Routine) and the appropriate department. The receptionist can accept or override the AI suggestion before saving the record.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| React Router DOM | v6 | Client-side routing |
| Axios | latest | HTTP client for API calls |
| Recharts | latest | Bar chart and donut chart on dashboard |
| CSS Modules | — | Per-component styling, no CSS-in-JS |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10 | Runtime |
| FastAPI | latest | REST API framework |
| SQLAlchemy | 2.x | ORM for database interactions |
| PostgreSQL | 16/17 | Primary database |

### AI Layer
| Technology | Purpose |
|---|---|
| Groq API | LLM inference provider (free tier) |
| Llama 3.3 70B Versatile | Language model for triage |

---

### Key Architecture Decisions

**1. AI is abstracted into a service layer**
The triage logic lives entirely in `backend/services/triage_service.py`. Swapping Groq for Claude, GPT-4, or Gemini requires changing only this one file — nothing else in the codebase changes. This is intentional.

**2. Two-stage AI flow**
- `POST /patients/suggest` — calls AI but does NOT save to DB. Used for live preview while the receptionist is still typing (debounced).
- `POST /patients` — calls AI AND saves the final record to DB. Used on form submit.

**3. Human-in-the-loop by design**
The AI never makes a final decision. Every triage suggestion must be explicitly accepted or overridden by the receptionist before it is saved. The `was_overridden` boolean field tracks when a human changed the AI's recommendation — this data can be used to improve the AI prompt over time.

**4. Fallback on AI failure**
The triage service wraps every AI call in try/except. If the API is down, rate-limited, or returns malformed JSON, it returns a safe default (`Priority / General Medicine`) with a note to assess manually. The app never crashes due to AI failure.

**5. Structured JSON prompt**
Claude/Groq is instructed to return only a JSON object with three fields: `urgency`, `department`, and `reasoning`. The urgency is constrained to exactly three values and the department to a predefined list. This makes parsing reliable and prevents hallucinated department names.

---

## Project Structure

```
patient-intake-system/
│
├── backend/
│   ├── main.py                  # App entry point, CORS, route registration
│   ├── database.py              # SQLAlchemy engine and session factory
│   ├── dependencies.py          # JWT auth dependency (get_current_user)
│   ├── .env                     # Secret keys (never committed)
│   ├── requirements.txt
│   │
│   ├── models/
│   │   ├── patient.py           # patients table schema
│   │   └── user.py              # users table schema
│   │
│   ├── routers/
│   │   ├── auth.py              # /auth/register, /auth/login
│   │   └── patients.py          # All patient endpoints
│   │
│   └── services/
│       ├── triage_service.py    # Groq AI integration
│       └── auth_service.py      # Password hashing, JWT creation
│
├── frontend/
│   └── src/
│       ├── api/
│       │   └── patients.js      # All API calls (single source of truth)
│       │
│       ├── components/
│       │   ├── Navbar.js        # Sidebar navigation with user info
│       │   └── TopBar.js        # Per-page top header
│       │
│       └── pages/
│           ├── Landing.js       # Marketing/home page
│           ├── Login.js         # Staff login
│           ├── RegisterUser.js  # New staff account creation
│           ├── Register.js      # Patient intake form + AI triage panel
│           ├── Dashboard.js     # Stats, charts, waiting list
│           └── PatientsList.js  # Searchable, filterable patient table
│
└── .gitignore
```

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 16 or 17
- A free [Groq API key](https://console.groq.com)

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd patient-intake-system
```

---

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:

```env
DATABASE_URL=postgresql://intake_user:intake123@localhost:5432/patient_intake
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your-long-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

---

### 3. PostgreSQL setup

Open psql and run:

```sql
CREATE DATABASE patient_intake;
CREATE USER intake_user WITH PASSWORD 'intake123';
GRANT ALL PRIVILEGES ON DATABASE patient_intake TO intake_user;
GRANT ALL ON SCHEMA public TO intake_user;
ALTER DATABASE patient_intake OWNER TO intake_user;
\q
```

---

### 4. Start the backend

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

---

### 5. Create your first admin account

Using the Swagger UI at `http://localhost:8000/docs`:

```json
POST /api/auth/register
{
  "email": "admin@clinic.com",
  "full_name": "Dr Admin",
  "password": "admin123",
  "role": "admin"
}
```

---

### 6. Frontend setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

---

### 7. Login and test

Open `http://localhost:3000` and sign in with the admin account you created.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | API key from console.groq.com |
| `SECRET_KEY` | Random string for JWT signing (keep secret) |
| `ALGORITHM` | JWT algorithm — use `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes (480 = 8 hours) |

---

## Assumptions Made

1. **Single clinic deployment** — the system is designed for one clinic. Multi-tenant support (multiple clinics) would require adding a `clinic_id` to all tables.

2. **Receptionist always present** — the AI triage is a suggestion tool, not an autonomous system. A human receptionist must always be in the loop to accept or override.

3. **Symptoms entered in English** — the Groq/Llama model performs best with English symptom descriptions. Multi-language support would require translation preprocessing.

4. **No real-time sync between tabs** — if two receptionists are logged in simultaneously, the dashboard does not auto-refresh when the other registers a patient. WebSockets would be needed for true real-time sync.

5. **Groq free tier is sufficient** — for a clinic demo with moderate traffic, Groq's free tier (14,400 requests/day) is more than adequate. Production would need a paid plan or a self-hosted model.

6. **Departments are fixed** — the 8 departments (General Medicine, Cardiology, Orthopedics, Neurology, Pediatrics, Emergency, ENT, Dermatology) are hardcoded in the AI prompt. A real system would let admins manage the department list.

7. **Password policy is minimal** — passwords have a minimum length of 6 characters. Production would enforce stronger policies (uppercase, numbers, special characters).

8. **No email verification** — staff accounts are created directly without email confirmation. In production, a verification email would be sent before the account is activated.

---

## Author

**Sayee Rananaware**
---
## License

Built as a technical assessment project. Not intended for production medical use.

---

*Built with FastAPI · React · PostgreSQL · Groq AI · Llama 3.3*
