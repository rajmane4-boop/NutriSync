from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Enum as SAEnum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timezone
from app.db.database import Base


# --- Enums for Data Integrity ---
class DifficultyEnum(str, enum.Enum):
    beginner = "Beginner"
    intermediate = "Intermediate"
    advanced = "Advanced"


class EquipmentEnum(str, enum.Enum):
    barbell = "Barbell"
    dumbbell = "Dumbbell"
    bodyweight = "Bodyweight"
    cable = "Cable"
    machine = "Machine"
    kettlebell = "Kettlebell"
    bands = "Bands"
    none = "None"


class SessionStatusEnum(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"
    skipped = "skipped"


# --- Models ---
class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)  # e.g., Strength, Hypertrophy, Cardio, Mobility
    primary_muscle = Column(String, index=True, nullable=False)
    secondary_muscles = Column(JSONB, default=list)
    equipment = Column(SAEnum(EquipmentEnum, name="equipment_enum"), nullable=False)
    difficulty = Column(SAEnum(DifficultyEnum, name="difficulty_enum"), nullable=False)
    instructions = Column(JSONB, default=list)  # Array of step-by-step strings
    gif_url = Column(String, nullable=True)
    calories_per_minute_est = Column(Float, default=5.0)

    # Relationships
    workout_logs = relationship("WorkoutExerciseLog", back_populates="exercise")


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    routine_tag = Column(String, nullable=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    total_volume_kg = Column(Float, default=0.0)
    calories_burned = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    status = Column(SAEnum(SessionStatusEnum, name="session_status_enum"), default=SessionStatusEnum.in_progress)

    # Relationships
    user = relationship("User", back_populates="workout_logs")
    exercise_logs = relationship("WorkoutExerciseLog", back_populates="workout_log", cascade="all, delete-orphan")


class WorkoutExerciseLog(Base):
    __tablename__ = "workout_exercise_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    workout_log_id = Column(UUID(as_uuid=True), ForeignKey("workout_logs.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False, index=True)
    order_index = Column(Integer, nullable=False)

    # JSONB array for sets: [{"set_number": 1, "reps": 12, "weight_kg": 60.0, "completed": true}]
    sets_data = Column(JSONB, default=list)
    target_rest_seconds = Column(Integer, default=90)

    # Relationships
    workout_log = relationship("WorkoutLog", back_populates="exercise_logs")
    exercise = relationship("Exercise", back_populates="workout_logs")
