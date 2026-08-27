# NutriSync Biometrics & Onboarding System Architecture

This guide explains the biometric data foundation, mathematical algorithms, database schema, API contracts, and UX architecture powering Phase 2 of NutriSync.

---

## 🏛️ Database Schema & Relationships

### Entity-Relationship Diagram

```
┌─────────────────────────────────────────┐
│                 users                   │
├─────────────────────────────────────────┤
│ id: UUID (PK)                           │
│ email: VARCHAR (Unique, Index)          │
│ hashed_password: VARCHAR                │
│ first_name: VARCHAR (Nullable)          │
│ last_name: VARCHAR (Nullable)           │
│ goal: VARCHAR (Nullable)                │
└───────────────────┬─────────────────────┘
                    │ 1
                    │
                    │ 1 (CASCADE DELETE)
                    ▼
┌─────────────────────────────────────────┐
│              user_profiles              │
├─────────────────────────────────────────┤
│ id: UUID (PK)                           │
│ user_id: UUID (FK -> users.id, Unique)  │
│ age: INTEGER                            │
│ gender: VARCHAR                         │
│ height_cm: FLOAT                        │
│ weight_kg: FLOAT                        │
│ target_weight_kg: FLOAT                 │
│ dietary_preference: VARCHAR             │
│ primary_goal: VARCHAR (Nullable)        │
│ activity_level: VARCHAR (Nullable)      │
│ created_at: TIMESTAMP WITH TIME ZONE    │
│ updated_at: TIMESTAMP WITH TIME ZONE    │
└─────────────────────────────────────────┘
```

### Key Database Design Decisions:
1. **1-to-1 Relationship**: Each user has exactly one `UserProfile`. `user_id` has a `UNIQUE` constraint and index in PostgreSQL.
2. **Cascade Delete (`ondelete="CASCADE"`)**: If a user account is deleted, PostgreSQL automatically cleans up their associated biometric profile, preventing orphaned biometric records.
3. **Database Version Control (Alembic)**:
   - Migration Revision `70edf587c2b8_add_profile.py` created the table `user_profiles` with foreign key constraints.

---

## 🧮 Biometric & Metabolic Formulas

NutriSync incorporates verified sports science and clinical nutrition formulas directly into the application layer:

### 1. Body Mass Index (BMI) & Classification
The BMI calculation is computed dynamically in Python (via Pydantic `@computed_field`) and in real-time within the React wizard:

$$\text{BMI} = \frac{\text{Weight (kg)}}{(\text{Height (m)})^2} = \frac{\text{Weight (kg)}}{\left(\frac{\text{Height (cm)}}{100}\right)^2}$$

| BMI Value | Clinical Category | Visual Badge in App |
| :--- | :--- | :--- |
| **< 18.5** | Underweight | Amber Badge (`#feecc0`) |
| **18.5 – 24.9** | Optimal / Normal Weight | Forest Green Badge (`#d4f3cc`) |
| **25.0 – 29.9** | Overweight / High Density | Warm Orange Badge (`#fedecb`) |
| **≥ 30.0** | High BMI | Soft Red Badge (`#fcd5d3`) |

---

### 2. Basal Metabolic Rate (BMR) — Mifflin-St Jeor Equation
BMR represents the calories burned at complete rest over 24 hours:

$$\text{BMR}_{\text{Male}} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age (yrs)} + 5$$

$$\text{BMR}_{\text{Female}} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age (yrs)} - 161$$

$$\text{BMR}_{\text{Non-Binary / Other}} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age (yrs)} - 78$$

---

### 3. Total Daily Energy Expenditure (TDEE) & Physical Activity Level (PAL)
TDEE multiplies baseline BMR by the user's weekly activity factor:

$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$

| Activity Tier | Lifestyle Description | Multiplier ($M$) |
| :--- | :--- | :--- |
| **Sedentary** | Desk life, minimal daily movement (< 5,000 steps) | $\times 1.200$ |
| **Lightly Active** | 1–2 light sessions or 6,000–8,000 steps/day | $\times 1.375$ |
| **Moderately Active** | 3–5 workouts/week with dynamic daily cadence | $\times 1.550$ |
| **Very Active** | 6–7 intense training days or physical occupation | $\times 1.725$ |
| **Extra Active** | Two-a-day workouts or competitive endurance athletics | $\times 1.900$ |

---

### 4. Goal-Oriented Caloric Intake Target

$$\text{Target Calories} = \begin{cases} \text{TDEE} + 250 \text{ kcal} & \text{Goal: Build Strength \& Muscle (Lean Surplus)} \\ \text{TDEE} - 450 \text{ kcal} & \text{Goal: Fat Loss \& Lean Definition (Moderate Deficit)} \\ \text{TDEE} & \text{Goal: Daily Movement / Longevity (Maintenance)} \end{cases}$$

---

### 5. Daily Macronutrient Breakdown
- **Protein**: Prioritized at **$2.0\text{ g per kg}$** of current body weight for muscle protein synthesis and tissue repair ($1\text{g protein} = 4\text{ kcal}$).
- **Fats**: Sized at **$25\%$** of total daily caloric target ($1\text{g fat} = 9\text{ kcal}$).
- **Carbohydrates**: Sized from remaining caloric budget ($1\text{g carb} = 4\text{ kcal}$):

$$\text{Carb Grams} = \frac{\text{Target Calories} - (\text{Protein Grams} \times 4 + \text{Fat Grams} \times 9)}{4}$$

---

## 📡 API Reference & Endpoints

All endpoints are mounted under `/api/v1/profile` and require a valid Bearer JWT in the `Authorization` header.

### 1. `POST /api/v1/profile`
Creates or updates the authenticated user's biometric profile (Upsert pattern).

**Headers:**
```http
Authorization: Bearer <jwt_access_token>
Content-Type: application/json
```

**Request Payload:**
```json
{
  "age": 24,
  "gender": "Male",
  "height_cm": 180.0,
  "weight_kg": 78.0,
  "target_weight_kg": 82.0,
  "dietary_preference": "High-Protein / Athlete",
  "primary_goal": "Build strength",
  "activity_level": "Moderately Active"
}
```

**Response (`201 Created`):**
```json
{
  "id": "70b3e514-4fb8-4b72-9721-a128e4695dd1",
  "user_id": "d21a4539-a1d2-4955-8c4c-4fd2da08298a",
  "age": 24,
  "gender": "Male",
  "height_cm": 180.0,
  "weight_kg": 78.0,
  "target_weight_kg": 82.0,
  "dietary_preference": "High-Protein / Athlete",
  "primary_goal": "Build strength",
  "activity_level": "Moderately Active",
  "bmi": 24.1,
  "bmi_category": "Optimal / Healthy",
  "created_at": "2026-08-26T16:55:00.000Z",
  "updated_at": "2026-08-26T16:55:00.000Z"
}
```

---

### 2. `GET /api/v1/profile/me`
Retrieves the active user's saved biometric profile. Returns `404 Not Found` if no profile exists yet.

---

### 3. `GET /api/v1/profile/status`
Lightweight endpoint consumed during login to facilitate instant route guarding.

**Response (`200 OK`):**
```json
{
  "has_profile": true,
  "profile": { ... }
}
```

---

## 🚦 Frontend Route Guarding & User Flow

```
                 ┌──────────────┐
                 │  User Enters │
                 └──────┬───────┘
                        │
                        ▼
                [ Has JWT Token? ]
                 /             \
            No  /               \  Yes
               ▼                 ▼
          [/login]        [ GET /profile/status ]
          [/register]      /                   \
                          /                     \
                   has_profile: false       has_profile: true
                        /                         \
                       ▼                           ▼
                 [/onboarding]                [/dashboard]
            (4-Phase Guided Wizard)      (Active Telemetry Screen)
```

1. **New Member Registration** (`/register`):
   - Creates user in PostgreSQL.
   - Automatically signs user in, stores JWT `access_token` in `localStorage`.
   - Navigates immediately to `/onboarding`.

2. **Existing Member Login** (`/login`):
   - Authenticates credentials against password hash.
   - Queries `GET /api/v1/profile/status`.
   - If profile exists &rarr; navigates to `/dashboard`.
   - If profile is incomplete &rarr; navigates to `/onboarding`.

3. **Protected Routes (`ProtectedRoute`)**:
   - Both `/onboarding` and `/dashboard` enforce token checks; unauthenticated requests are immediately bounced back to `/login`.

---

## 🧭 The 4-Phase Onboarding Wizard

The onboarding UI is split across 4 dedicated, focused steps with vertical optical centering and a rich typography hierarchy:

| Step | Focus Area | Inputs / Choices | Visual Telemetry Output |
| :--- | :--- | :--- | :--- |
| **Phase 01** | **Baseline Metrics** | Gender (4 chips), Age (stepper), Height (cm with ft/in display), Weight (kg with lbs display) | **Real-time BMI Score Gauge** with clinical classification badges |
| **Phase 02** | **Performance Ambitions** | Primary Goal (4 cards with badges), Target Weight (kg) | **Trajectory Delta Pill** (e.g. `+4.0 kg Muscle Gain Target` / `-5.0 kg Fat Loss Target`) |
| **Phase 03** | **Nutritional Fuel** | 6 Framework Cards (*Standard Omnivore, High-Protein, Vegetarian, Vegan, Pescatarian, Keto*) | **Dietary Badges** (`2.0G+ / KG PROTEIN`, `<50G NET CARBS`, etc.) |
| **Phase 04** | **Metabolic Output** | 5 Activity Tiers (*Sedentary to Athletic*) | **Live AI Blueprint Card** displaying calculated BMR, TDEE, Calorie target, and Macro grams |

---

## 🧪 Testing & Verification

1. **Automated Backend Suite**:
   ```powershell
   & "d:\MCA\NutriSync\backend\venv\Scripts\python.exe" "C:\Users\Pushkaraj mane\.gemini\antigravity-ide\brain\aea5fe1a-24be-4156-b960-a33fa37b6853\scratch\test_phase2_backend.py"
   ```
   *Validates registration, token issuance, status check, profile creation, computed properties, and cascade deletion.*

2. **Vite Production Build**:
   ```powershell
   cd d:\MCA\NutriSync\frontend
   npm run build
   ```
   *Validates strict TypeScript types and CSS bundle integrity.*
