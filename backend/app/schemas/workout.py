from pydantic import BaseModel, Field
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime
from app.models.workout import EquipmentEnum, DifficultyEnum, SessionStatusEnum


# --- Exercise Schemas ---
class ExerciseBase(BaseModel):
    name: str
    category: str
    primary_muscle: str
    secondary_muscles: List[str] = Field(default_factory=list)
    equipment: EquipmentEnum
    difficulty: DifficultyEnum
    instructions: List[str] = Field(default_factory=list)
    gif_url: Optional[str] = None
    calories_per_minute_est: float = 5.0


class ExerciseResponse(ExerciseBase):
    id: UUID

    model_config = {"from_attributes": True}


# --- Set Detail in JSONB ---
class SetDetail(BaseModel):
    set_number: int = Field(..., ge=1)
    reps: int = Field(..., ge=0)
    weight_kg: float = Field(default=0.0, ge=0)
    completed: bool = True


# --- Workout Exercise Log Schemas ---
class WorkoutExerciseLogCreate(BaseModel):
    exercise_id: UUID
    order_index: int = Field(default=1, ge=1)
    sets_data: List[SetDetail] = Field(default_factory=list)
    target_rest_seconds: int = Field(default=90, ge=0)


class WorkoutExerciseLogResponse(BaseModel):
    id: UUID
    workout_log_id: UUID
    exercise_id: UUID
    order_index: int
    sets_data: List[Any] = Field(default_factory=list)
    target_rest_seconds: int
    exercise: Optional[ExerciseResponse] = None

    model_config = {"from_attributes": True}


# --- Workout Log Schemas ---
class WorkoutLogCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    routine_tag: Optional[str] = Field(default=None, max_length=100)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_volume_kg: Optional[float] = Field(default=0.0, ge=0)
    calories_burned: Optional[float] = Field(default=0.0, ge=0)
    notes: Optional[str] = None
    status: SessionStatusEnum = SessionStatusEnum.in_progress
    exercise_logs: List[WorkoutExerciseLogCreate] = Field(default_factory=list)


class WorkoutLogUpdate(BaseModel):
    title: Optional[str] = None
    routine_tag: Optional[str] = None
    completed_at: Optional[datetime] = None
    total_volume_kg: Optional[float] = None
    calories_burned: Optional[float] = None
    notes: Optional[str] = None
    status: Optional[SessionStatusEnum] = None
    exercise_logs: Optional[List[WorkoutExerciseLogCreate]] = None


class WorkoutLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    routine_tag: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_volume_kg: float = 0.0
    calories_burned: float = 0.0
    notes: Optional[str] = None
    status: SessionStatusEnum
    exercise_logs: List[WorkoutExerciseLogResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}
