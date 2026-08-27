import api from './api';

// ═══════════════════════════════════════════════════════════════
// TypeScript Interfaces — mirroring Pydantic schemas
// ═══════════════════════════════════════════════════════════════

export interface Exercise {
  id: string;
  name: string;
  category: string;
  primary_muscle: string;
  secondary_muscles: string[];
  equipment: string;
  difficulty: string;
  instructions: string[];
  gif_url: string | null;
  calories_per_minute_est: number;
}

export interface SetDetail {
  set_number: number;
  reps: number;
  weight_kg: number;
  completed: boolean;
}

export interface WorkoutExerciseLogCreate {
  exercise_id: string;
  order_index: number;
  sets_data: SetDetail[];
  target_rest_seconds: number;
}

export interface WorkoutExerciseLogResponse {
  id: string;
  workout_log_id: string;
  exercise_id: string;
  order_index: number;
  sets_data: SetDetail[];
  target_rest_seconds: number;
  exercise: Exercise | null;
}

export interface WorkoutLogCreate {
  title: string;
  routine_tag?: string;
  started_at?: string;
  completed_at?: string;
  total_volume_kg?: number;
  calories_burned?: number;
  notes?: string;
  status: 'in_progress' | 'completed' | 'skipped';
  exercise_logs: WorkoutExerciseLogCreate[];
}

export interface WorkoutLogResponse {
  id: string;
  user_id: string;
  title: string;
  routine_tag: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_volume_kg: number;
  calories_burned: number;
  notes: string | null;
  status: 'in_progress' | 'completed' | 'skipped';
  exercise_logs: WorkoutExerciseLogResponse[];
}

// ═══════════════════════════════════════════════════════════════
// Exercise Catalog Filters
// ═══════════════════════════════════════════════════════════════

export interface ExerciseFilters {
  primary_muscle?: string;
  equipment?: string;
  category?: string;
  difficulty?: string;
  q?: string;
}

// ═══════════════════════════════════════════════════════════════
// API Functions
// ═══════════════════════════════════════════════════════════════

export async function fetchExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
  const params = new URLSearchParams();
  if (filters?.primary_muscle) params.append('primary_muscle', filters.primary_muscle);
  if (filters?.equipment) params.append('equipment', filters.equipment);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.q) params.append('q', filters.q);

  const res = await api.get('/exercises', { params });
  return res.data;
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  const res = await api.get(`/exercises/${id}`);
  return res.data;
}

export async function submitWorkout(payload: WorkoutLogCreate): Promise<WorkoutLogResponse> {
  const res = await api.post('/workouts', payload);
  return res.data;
}

export async function fetchWorkoutHistory(): Promise<WorkoutLogResponse[]> {
  const res = await api.get('/workouts');
  return res.data;
}

export async function fetchWorkoutById(id: string): Promise<WorkoutLogResponse> {
  const res = await api.get(`/workouts/${id}`);
  return res.data;
}

export async function deleteWorkout(id: string): Promise<void> {
  await api.delete(`/workouts/${id}`);
}
