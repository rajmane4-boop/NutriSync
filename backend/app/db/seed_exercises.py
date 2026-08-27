"""
NutriSync Exercise Catalog Seeding Script
Populates the `exercises` table with a rich catalog of compound and isolation exercises.
"""
import uuid
from app.db.database import SessionLocal
from app.models.workout import Exercise, EquipmentEnum, DifficultyEnum

EXERCISES_DATA = [
    # ── CHEST ──
    {
        "name": "Barbell Bench Press",
        "category": "Strength",
        "primary_muscle": "Chest",
        "secondary_muscles": ["Triceps", "Anterior Deltoid"],
        "equipment": EquipmentEnum.barbell,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Lie flat on the bench with your eyes under the bar.",
            "Grip the bar slightly wider than shoulder-width with wrists straight.",
            "Unrack the bar and lower it with control to the mid-chest.",
            "Press the bar back up explosively until arms are extended."
        ],
        "gif_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
        "calories_per_minute_est": 6.5
    },
    {
        "name": "Incline Dumbbell Press",
        "category": "Hypertrophy",
        "primary_muscle": "Chest",
        "secondary_muscles": ["Anterior Deltoid", "Triceps"],
        "equipment": EquipmentEnum.dumbbell,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Set bench to a 30-45 degree incline.",
            "Hold dumbbells at shoulder level with palms facing forward.",
            "Press weights upward until arms are straight without locking elbows.",
            "Lower with control back to upper chest level."
        ],
        "gif_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800",
        "calories_per_minute_est": 6.0
    },
    {
        "name": "Cable Chest Flye",
        "category": "Hypertrophy",
        "primary_muscle": "Chest",
        "secondary_muscles": ["Anterior Deltoid"],
        "equipment": EquipmentEnum.cable,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Set pulleys at chest height, grab handles, and take one step forward.",
            "Keep a slight bend in your elbows and bring your hands together in an arc.",
            "Squeeze the chest at peak contraction, then slowly reverse the motion."
        ],
        "gif_url": None,
        "calories_per_minute_est": 5.0
    },
    {
        "name": "Push-Up",
        "category": "Strength",
        "primary_muscle": "Chest",
        "secondary_muscles": ["Triceps", "Core", "Anterior Deltoid"],
        "equipment": EquipmentEnum.bodyweight,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Assume a high plank position with hands slightly wider than shoulder-width.",
            "Brace core and lower chest until 1 inch off the floor.",
            "Push through palms to return to starting plank position."
        ],
        "gif_url": None,
        "calories_per_minute_est": 5.5
    },

    # ── BACK ──
    {
        "name": "Conventional Barbell Deadlift",
        "category": "Strength",
        "primary_muscle": "Back",
        "secondary_muscles": ["Hamstrings", "Glutes", "Traps", "Forearms", "Core"],
        "equipment": EquipmentEnum.barbell,
        "difficulty": DifficultyEnum.advanced,
        "instructions": [
            "Stand with feet hip-width apart, midfoot under the barbell.",
            "Hinge at hips, grip the bar just outside knees, and pull chest up.",
            "Drive feet through the floor, extending hips and knees simultaneously.",
            "Lock out hips at the top with tall posture, then return bar under control."
        ],
        "gif_url": "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800",
        "calories_per_minute_est": 8.5
    },
    {
        "name": "Barbell Bent-Over Row",
        "category": "Strength",
        "primary_muscle": "Back",
        "secondary_muscles": ["Biceps", "Rear Deltoid", "Core"],
        "equipment": EquipmentEnum.barbell,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Hinge at the hips with a flat back at approximately 45 degrees.",
            "Grip bar with overhand grip and pull towards the lower ribcage/belly button.",
            "Squeeze shoulder blades together, then lower with control."
        ],
        "gif_url": None,
        "calories_per_minute_est": 6.8
    },
    {
        "name": "Pull-Up",
        "category": "Strength",
        "primary_muscle": "Back",
        "secondary_muscles": ["Biceps", "Forearms", "Core"],
        "equipment": EquipmentEnum.bodyweight,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Hang from pull-up bar with overhand grip wider than shoulders.",
            "Engage lats and pull chest toward the bar until chin clears the bar.",
            "Lower slowly back to full hang extension."
        ],
        "gif_url": None,
        "calories_per_minute_est": 7.0
    },
    {
        "name": "Lat Pulldown",
        "category": "Hypertrophy",
        "primary_muscle": "Back",
        "secondary_muscles": ["Biceps", "Rear Deltoid"],
        "equipment": EquipmentEnum.cable,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Sit at machine with thighs snug under the pads.",
            "Grip wide bar, lean back slightly (10-15 degrees), and pull bar to upper chest.",
            "Squeeze lats at the bottom, then allow bar to return with controlled stretch."
        ],
        "gif_url": None,
        "calories_per_minute_est": 5.5
    },
    {
        "name": "Face Pull",
        "category": "Mobility",
        "primary_muscle": "Back",
        "secondary_muscles": ["Rear Deltoid", "Rotator Cuff", "Traps"],
        "equipment": EquipmentEnum.cable,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Attach rope to high cable pulley.",
            "Pull rope toward face, pulling hands apart and externally rotating shoulders.",
            "Hold for 1 second, then control back to starting position."
        ],
        "gif_url": None,
        "calories_per_minute_est": 4.5
    },

    # ── LEGS ──
    {
        "name": "Barbell Back Squat",
        "category": "Strength",
        "primary_muscle": "Quads",
        "secondary_muscles": ["Glutes", "Hamstrings", "Core", "Calves"],
        "equipment": EquipmentEnum.barbell,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Place bar across upper traps, feet shoulder-width apart, toes angled slightly out.",
            "Brace core, push hips back and knees out, descending until thighs are parallel to floor.",
            "Drive up through mid-foot to starting standing position."
        ],
        "gif_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800",
        "calories_per_minute_est": 8.0
    },
    {
        "name": "Romanian Deadlift (RDL)",
        "category": "Strength",
        "primary_muscle": "Hamstrings",
        "secondary_muscles": ["Glutes", "Lower Back", "Forearms"],
        "equipment": EquipmentEnum.barbell,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Stand tall holding barbell at hip level with soft knees.",
            "Push hips straight back while keeping spine neutral and bar close to legs.",
            "Descend until deep hamstring stretch is felt (just below knees).",
            "Drive hips forward to return to standing lockout."
        ],
        "gif_url": None,
        "calories_per_minute_est": 7.0
    },
    {
        "name": "Bulgarian Split Squat",
        "category": "Hypertrophy",
        "primary_muscle": "Quads",
        "secondary_muscles": ["Glutes", "Hamstrings", "Calves"],
        "equipment": EquipmentEnum.dumbbell,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Place top of rear foot on a bench behind you.",
            "Hold dumbbells at sides and lower front knee until thigh is parallel to ground.",
            "Push through front heel to return to top position."
        ],
        "gif_url": None,
        "calories_per_minute_est": 6.8
    },
    {
        "name": "Leg Press",
        "category": "Hypertrophy",
        "primary_muscle": "Quads",
        "secondary_muscles": ["Glutes", "Hamstrings"],
        "equipment": EquipmentEnum.machine,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Sit on machine with feet shoulder-width on platform.",
            "Release safety catches and lower platform until knees are at 90 degrees.",
            "Press platform back up without hyper-extending or locking knees."
        ],
        "gif_url": None,
        "calories_per_minute_est": 6.0
    },
    {
        "name": "Lying Leg Curl",
        "category": "Hypertrophy",
        "primary_muscle": "Hamstrings",
        "secondary_muscles": ["Calves"],
        "equipment": EquipmentEnum.machine,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Lie face down with roller pad positioned just below calf muscles.",
            "Curl legs upwards toward glutes, pausing briefly at peak contraction.",
            "Slowly lower back to starting position."
        ],
        "gif_url": None,
        "calories_per_minute_est": 4.8
    },
    {
        "name": "Standing Calf Raise",
        "category": "Hypertrophy",
        "primary_muscle": "Calves",
        "secondary_muscles": ["Ankles"],
        "equipment": EquipmentEnum.machine,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Position balls of feet on edge of platform with pads on shoulders.",
            "Lower heels for deep calf stretch, then raise up onto toes as high as possible.",
            "Hold top contraction for 1 second before descending."
        ],
        "gif_url": None,
        "calories_per_minute_est": 4.2
    },

    # ── SHOULDERS ──
    {
        "name": "Overhead Barbell Military Press",
        "category": "Strength",
        "primary_muscle": "Shoulders",
        "secondary_muscles": ["Triceps", "Upper Chest", "Core"],
        "equipment": EquipmentEnum.barbell,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Hold bar at collarbone level with hands just outside shoulders.",
            "Brace core and glutes, and press bar straight overhead in a direct vertical path.",
            "Lock out overhead with head pushed slightly through, then lower under control."
        ],
        "gif_url": None,
        "calories_per_minute_est": 6.5
    },
    {
        "name": "Dumbbell Lateral Raise",
        "category": "Hypertrophy",
        "primary_muscle": "Shoulders",
        "secondary_muscles": ["Traps"],
        "equipment": EquipmentEnum.dumbbell,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Stand holding dumbbells at your sides with slight forward torso lean.",
            "Raise arms out to sides with soft elbows until parallel to floor.",
            "Pause briefly at shoulder height, then lower with a 2-second negative."
        ],
        "gif_url": None,
        "calories_per_minute_est": 4.5
    },

    # ── ARMS (BICEPS & TRICEPS) ──
    {
        "name": "Barbell Bicep Curl",
        "category": "Hypertrophy",
        "primary_muscle": "Arms",
        "secondary_muscles": ["Forearms"],
        "equipment": EquipmentEnum.barbell,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Hold bar with underhand grip, elbows pinned to sides.",
            "Curl bar up toward chest while squeezing biceps.",
            "Lower slowly back to full elbow extension without swinging."
        ],
        "gif_url": None,
        "calories_per_minute_est": 5.0
    },
    {
        "name": "Incline Dumbbell Curl",
        "category": "Hypertrophy",
        "primary_muscle": "Arms",
        "secondary_muscles": ["Forearms"],
        "equipment": EquipmentEnum.dumbbell,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Sit on 45-degree incline bench with arms hanging fully extended.",
            "Curl dumbbells upward while keeping elbows back for deep long-head stretch.",
            "Squeeze at top, then lower with strict control."
        ],
        "gif_url": None,
        "calories_per_minute_est": 4.8
    },
    {
        "name": "Tricep Rope Pushdown",
        "category": "Hypertrophy",
        "primary_muscle": "Arms",
        "secondary_muscles": ["Forearms"],
        "equipment": EquipmentEnum.cable,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Attach rope to high pulley, hold handles with neutral grip, elbows tucked.",
            "Push rope down, spreading handles apart at the bottom for full tricep lockout.",
            "Return to 90-degree elbow bend under control."
        ],
        "gif_url": None,
        "calories_per_minute_est": 4.5
    },
    {
        "name": "Dips (Tricep & Chest Focus)",
        "category": "Strength",
        "primary_muscle": "Arms",
        "secondary_muscles": ["Chest", "Anterior Deltoid"],
        "equipment": EquipmentEnum.bodyweight,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Support body on parallel bars with arms locked.",
            "Lower body by bending elbows until upper arms are parallel to floor.",
            "Push back up to starting position by extending elbows."
        ],
        "gif_url": None,
        "calories_per_minute_est": 6.5
    },

    # ── CORE ──
    {
        "name": "Hanging Knee / Leg Raise",
        "category": "Strength",
        "primary_muscle": "Core",
        "secondary_muscles": ["Hip Flexors", "Forearms"],
        "equipment": EquipmentEnum.bodyweight,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Hang from bar with overhand grip.",
            "Engage abs and curl knees/legs up toward chest without using swinging momentum.",
            "Pause at the top, then slowly lower back down."
        ],
        "gif_url": None,
        "calories_per_minute_est": 5.0
    },
    {
        "name": "Plank",
        "category": "Mobility",
        "primary_muscle": "Core",
        "secondary_muscles": ["Shoulders", "Glutes"],
        "equipment": EquipmentEnum.bodyweight,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Rest on forearms and toes with body in a straight line from head to heels.",
            "Squeeze glutes, brace abs, and maintain neutral neck.",
            "Hold position for targeted duration."
        ],
        "gif_url": None,
        "calories_per_minute_est": 3.8
    },

    # ── CARDIO & FUNCTIONAL ──
    {
        "name": "Kettlebell Swing",
        "category": "Cardio",
        "primary_muscle": "Hamstrings",
        "secondary_muscles": ["Glutes", "Core", "Shoulders", "Back"],
        "equipment": EquipmentEnum.kettlebell,
        "difficulty": DifficultyEnum.intermediate,
        "instructions": [
            "Stand with feet shoulder-width, kettlebell on ground slightly in front.",
            "Hinge hips, hike bell between legs, and snap hips forward explosively.",
            "Allow bell to float to chest height before following it back into the hinge."
        ],
        "gif_url": None,
        "calories_per_minute_est": 9.5
    },
    {
        "name": "Jump Rope",
        "category": "Cardio",
        "primary_muscle": "Calves",
        "secondary_muscles": ["Forearms", "Cardiovascular"],
        "equipment": EquipmentEnum.none,
        "difficulty": DifficultyEnum.beginner,
        "instructions": [
            "Hold handles at hip height and swing rope with wrist rotation.",
            "Jump lightly on the balls of your feet just high enough to clear the rope.",
            "Maintain steady rhythm and relaxed breathing."
        ],
        "gif_url": None,
        "calories_per_minute_est": 11.0
    }
]


def seed_exercises():
    db = SessionLocal()
    try:
        inserted_count = 0
        updated_count = 0

        for ex_data in EXERCISES_DATA:
            existing = db.query(Exercise).filter(Exercise.name == ex_data["name"]).first()
            if not existing:
                exercise = Exercise(
                    id=uuid.uuid4(),
                    name=ex_data["name"],
                    category=ex_data["category"],
                    primary_muscle=ex_data["primary_muscle"],
                    secondary_muscles=ex_data["secondary_muscles"],
                    equipment=ex_data["equipment"],
                    difficulty=ex_data["difficulty"],
                    instructions=ex_data["instructions"],
                    gif_url=ex_data.get("gif_url"),
                    calories_per_minute_est=ex_data.get("calories_per_minute_est", 5.0)
                )
                db.add(exercise)
                inserted_count += 1
            else:
                existing.category = ex_data["category"]
                existing.primary_muscle = ex_data["primary_muscle"]
                existing.secondary_muscles = ex_data["secondary_muscles"]
                existing.equipment = ex_data["equipment"]
                existing.difficulty = ex_data["difficulty"]
                existing.instructions = ex_data["instructions"]
                existing.calories_per_minute_est = ex_data.get("calories_per_minute_est", 5.0)
                updated_count += 1

        db.commit()
        print(f"[SUCCESS] Successfully seeded exercises! Added: {inserted_count}, Updated: {updated_count}, Total in dataset: {len(EXERCISES_DATA)}")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding exercises: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_exercises()
