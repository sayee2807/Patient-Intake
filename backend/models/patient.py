from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, func
from database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    contact = Column(String(15), nullable=False)
    symptoms = Column(Text, nullable=False)

    # AI suggestion fields
    ai_urgency = Column(String(20))
    ai_department = Column(String(50))
    ai_reasoning = Column(Text)

    # Receptionist final decision
    final_urgency = Column(String(20))
    final_department = Column(String(50))
    was_overridden = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())