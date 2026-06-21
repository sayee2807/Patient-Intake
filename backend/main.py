from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import patients
from routers import auth
import models.patient
import models.user 

# Create all tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Patient Intake System")

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Patient Intake System API is running"}