from pydantic import BaseModel, Field, computed_field
from typing import Optional
from uuid import UUID
from datetime import datetime


class ProfileBase(BaseModel):
    age: int = Field(..., ge=10, le=120, description="Age in years")
    gender: str = Field(..., min_length=1, max_length=50, description="Gender identity")
    height_cm: float = Field(..., gt=50, lt=300, description="Height in centimeters")
    weight_kg: float = Field(..., gt=20, lt=500, description="Current weight in kilograms")
    target_weight_kg: float = Field(..., gt=20, lt=500, description="Target weight in kilograms")
    dietary_preference: str = Field(..., min_length=1, max_length=100, description="Dietary preference")
    primary_goal: Optional[str] = Field(default=None, max_length=100, description="Primary fitness goal")
    activity_level: Optional[str] = Field(default=None, max_length=100, description="Activity level")


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    age: Optional[int] = Field(default=None, ge=10, le=120)
    gender: Optional[str] = Field(default=None, min_length=1, max_length=50)
    height_cm: Optional[float] = Field(default=None, gt=50, lt=300)
    weight_kg: Optional[float] = Field(default=None, gt=20, lt=500)
    target_weight_kg: Optional[float] = Field(default=None, gt=20, lt=500)
    dietary_preference: Optional[str] = Field(default=None, min_length=1, max_length=100)
    primary_goal: Optional[str] = Field(default=None, max_length=100)
    activity_level: Optional[str] = Field(default=None, max_length=100)


class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @computed_field
    @property
    def bmi(self) -> float:
        if self.height_cm and self.height_cm > 0:
            height_m = self.height_cm / 100.0
            return round(self.weight_kg / (height_m * height_m), 1)
        return 0.0

    @computed_field
    @property
    def bmi_category(self) -> str:
        val = self.bmi
        if val < 18.5:
            return "Underweight"
        elif val < 25.0:
            return "Normal weight"
        elif val < 30.0:
            return "Overweight"
        else:
            return "Obese"

    model_config = {"from_attributes": True}


class ProfileStatus(BaseModel):
    has_profile: bool
    profile: Optional[ProfileResponse] = None
