import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';
import { SparklesIcon } from '../components/icons';

interface UserProfileData {
  id: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  dietary_preference: string;
  primary_goal?: string;
  activity_level?: string;
  bmi?: number;
  bmi_category?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await api.get('/profile/me');
        setProfile(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // No profile yet, redirect to onboarding
          navigate('/onboarding');
        } else if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        } else {
          setError('Failed to fetch your biometric profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading your NutriSync telemetry...</p>
      </div>
    );
  }

  // Calculate calorie estimation for dashboard preview
  const bmr = profile
    ? Math.round(
        10 * profile.weight_kg +
          6.25 * profile.height_cm -
          5 * profile.age +
          (profile.gender === 'Male' ? 5 : profile.gender === 'Female' ? -161 : -78)
      )
    : 0;

  const multiplierMap: Record<string, number> = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Extra Active': 1.9,
  };

  const mult = (profile?.activity_level && multiplierMap[profile.activity_level]) || 1.55;
  const tdee = Math.round(bmr * mult);
  let targetCals = tdee;
  if (profile?.primary_goal === 'Build strength') targetCals += 250;
  if (profile?.primary_goal === 'Lose weight') targetCals -= 450;

  const protein = profile ? Math.round(profile.weight_kg * 2.0) : 0;
  const fats = Math.round((targetCals * 0.25) / 9);
  const carbs = Math.max(50, Math.round((targetCals - (protein * 4 + fats * 9)) / 4));

  return (
    <div className="dashboard-shell">
      {/* Navigation Header */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Logo />
          <span className="nav-edition">ATHLETE DASHBOARD &bull; 01</span>
        </div>
        <div className="nav-actions">
          <Link to="/workouts/active" className="nav-link-btn accent">
            + Start Workout
          </Link>
          <Link to="/workouts/history" className="nav-link-btn">
            History
          </Link>
          <Link to="/onboarding" className="nav-link-btn">
            Recalibrate
          </Link>
          <button type="button" onClick={handleLogout} className="logout-btn">
            Sign out
          </button>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <header className="dashboard-welcome">
          <div className="eyebrow"><span /> ACTIVE SYNC &bull; TELEMETRY</div>
          <h1>System Overview</h1>
          <p className="intro">
            Biometric telemetry calibrated. Your nutritional targets and metabolic baselines are synchronized.
          </p>
        </header>

        {error && <p className="error-message">{error}</p>}

        {profile && (
          <div className="dashboard-grid">
            {/* 1. Biometrics Card */}
            <section className="dash-card">
              <div className="card-top">
                <span className="card-tag">BIOMETRIC MATRIX</span>
                <span className="card-status-dot" />
              </div>
              <h3>Physical Baseline</h3>
              <div className="metrics-row">
                <div className="metric-box">
                  <span>AGE</span>
                  <strong>{profile.age} <small>yrs</small></strong>
                </div>
                <div className="metric-box">
                  <span>HEIGHT</span>
                  <strong>{profile.height_cm} <small>cm</small></strong>
                </div>
                <div className="metric-box">
                  <span>WEIGHT</span>
                  <strong>{profile.weight_kg} <small>kg</small></strong>
                </div>
                <div className="metric-box">
                  <span>TARGET</span>
                  <strong>{profile.target_weight_kg} <small>kg</small></strong>
                </div>
              </div>

              {/* BMI Readout */}
              <div className="dash-bmi-bar">
                <div className="bmi-title-row">
                  <span>BODY MASS INDEX (BMI)</span>
                  <span className="bmi-tag">{profile.bmi_category}</span>
                </div>
                <div className="bmi-big-num">
                  <strong>{profile.bmi}</strong>
                  <span className="bmi-scale-note">Healthy Reference: 18.5 – 24.9</span>
                </div>
              </div>
            </section>

            {/* 2. Target Trajectory & Ambition */}
            <section className="dash-card">
              <div className="card-top">
                <span className="card-tag">TRAJECTORY</span>
                <span className="card-badge-pill">{profile.primary_goal || 'Build strength'}</span>
              </div>
              <h3>Ambition & Lifestyle</h3>
              <div className="lifestyle-specs">
                <div className="spec-item">
                  <span className="spec-label">Primary Goal</span>
                  <span className="spec-value">{profile.primary_goal || 'Build Strength'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Dietary Mode</span>
                  <span className="spec-value">{profile.dietary_preference}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Activity Level</span>
                  <span className="spec-value">{profile.activity_level || 'Moderately Active'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Weight Delta</span>
                  <span className="spec-value highlight">
                    {profile.target_weight_kg - profile.weight_kg > 0
                      ? `+${(profile.target_weight_kg - profile.weight_kg).toFixed(1)} kg Lean Gain`
                      : profile.target_weight_kg - profile.weight_kg < 0
                      ? `${(profile.target_weight_kg - profile.weight_kg).toFixed(1)} kg Fat Loss`
                      : '0.0 kg Maintenance'}
                  </span>
                </div>
              </div>
            </section>

            {/* 3. Daily AI Macro Target Card */}
            <section className="dash-card full-span">
              <div className="card-top">
                <span className="card-tag"><SparklesIcon /> DAILY MACRONUTRIENT TARGETS</span>
                <span className="card-live-pill">LIVE ENGINE</span>
              </div>
              <div className="macro-dashboard-grid">
                <div className="macro-hero-box">
                  <span>TARGET DAILY INTAKE</span>
                  <h2>{targetCals} <small>kcal</small></h2>
                  <p>BMR Baseline: {bmr} kcal &bull; TDEE: {tdee} kcal</p>
                </div>
                <div className="macro-splits">
                  <div className="macro-split-card protein">
                    <span>PROTEIN (HIGH DENSITY)</span>
                    <strong>{protein}g</strong>
                    <div className="macro-bar"><div style={{ width: '35%' }} /></div>
                  </div>
                  <div className="macro-split-card carbs">
                    <span>CARBOHYDRATES</span>
                    <strong>{carbs}g</strong>
                    <div className="macro-bar"><div style={{ width: '45%' }} /></div>
                  </div>
                  <div className="macro-split-card fats">
                    <span>HEALTHY FATS</span>
                    <strong>{fats}g</strong>
                    <div className="macro-bar"><div style={{ width: '20%' }} /></div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Start Workout CTA */}
            <section className="dash-card full-span workout-cta-card">
              <div className="workout-cta-inner">
                <div>
                  <h3>Ready to Train?</h3>
                  <p>Build your routine from 25+ exercises, log sets & reps in real time, and track your total volume.</p>
                </div>
                <Link to="/workouts/active" className="workout-cta-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5h11M12 3v3M4 12h2m12 0h2M6.5 17.5h11M12 18v3M7 12a5 5 0 0110 0"/></svg>
                  Launch Workout
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
