import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';
import { SparklesIcon } from '../components/icons';
import ProgressCharts from '../components/ProgressCharts';
import { fetchProgressStats, ProgressStatsResponse } from '../services/progress';
import { biometricsService } from '../services/biometrics';
import { recommendationService, RecommendedRoutineResponse } from '../services/recommendation';

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
  const [progressStats, setProgressStats] = useState<ProgressStatsResponse | null>(null);
  const [recommendedRoutine, setRecommendedRoutine] = useState<RecommendedRoutineResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [progressLoading, setProgressLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Goal & Biometrics Quick Calibration Modal 
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [editGoal, setEditGoal] = useState<string>('');
  const [editTargetWeight, setEditTargetWeight] = useState<string>('');
  const [editActivity, setEditActivity] = useState<string>('');
  const [editDiet, setEditDiet] = useState<string>('');
  const [savingGoal, setSavingGoal] = useState<boolean>(false);
  const [activeModuleTab, setActiveModuleTab] = useState<'diet' | 'cheat'>('diet');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [profileRes, statsRes, routineRes] = await Promise.allSettled([
          api.get('/profile/me'),
          fetchProgressStats(),
          recommendationService.getRecommendation('auto'),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data);
        } else {
          const err: any = profileRes.reason;
          if (err.response?.status === 404) {
            navigate('/onboarding');
            return;
          } else if (err.response?.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/login');
            return;
          } else {
            setError('Failed to fetch your biometric profile.');
          }
        }

        if (statsRes.status === 'fulfilled') {
          setProgressStats(statsRes.value);
        }

        if (routineRes.status === 'fulfilled') {
          setRecommendedRoutine(routineRes.value);
        }
      } catch (err: any) {
        console.error('Failed to load dashboard telemetry:', err);
      } finally {
        setLoading(false);
        setProgressLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const openGoalModal = () => {
    if (profile) {
      setEditGoal(profile.primary_goal || 'Muscle Hypertrophy');
      setEditTargetWeight(String(profile.target_weight_kg));
      setEditActivity(profile.activity_level || 'Moderately Active');
      setEditDiet(profile.dietary_preference || 'High-Protein Athlete');
      setShowGoalModal(true);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingGoal(true);
    try {
      const updated = await biometricsService.updateProfile({
        primary_goal: editGoal,
        target_weight_kg: parseFloat(editTargetWeight) || profile.target_weight_kg,
        activity_level: editActivity,
        dietary_preference: editDiet,
      });
      setProfile(prev => prev ? { ...prev, ...updated } : null);
      setShowGoalModal(false);
    } catch (err) {
      console.error('Failed to update profile ambitions:', err);
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Logo />
        <p>SYNCHRONIZING TELEMETRY PIPELINE...</p>
      </div>
    );
  }

  // Energy & Macronutrient calculation
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
  if (profile?.primary_goal === 'Build strength' || profile?.primary_goal === 'Muscle Hypertrophy') targetCals += 250;
  if (profile?.primary_goal === 'Lose weight') targetCals -= 450;

  const protein = profile ? Math.round(profile.weight_kg * 2.0) : 0;
  const fats = Math.round((targetCals * 0.25) / 9);
  const carbs = Math.max(50, Math.round((targetCals - (protein * 4 + fats * 9)) / 4));

  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatsCals = fats * 9;
  const totalMacroCals = Math.max(1, proteinCals + carbsCals + fatsCals);

  const proteinPct = Math.round((proteinCals / totalMacroCals) * 100);
  const carbsPct = Math.round((carbsCals / totalMacroCals) * 100);
  const fatsPct = Math.max(0, 100 - proteinPct - carbsPct);

  const weightDelta = profile ? profile.target_weight_kg - profile.weight_kg : 0;

  const routineTitle = recommendedRoutine?.routine_title || 'Push Protocol: Chest, Delts & Triceps';
  const routineDuration = recommendedRoutine?.estimated_duration_min || 50;
  const routineBurn = Math.round(recommendedRoutine?.estimated_calories_burned || 350);
  const exerciseCount = recommendedRoutine?.exercises?.length || 3;
  const routineSplit = recommendedRoutine?.split_category ? recommendedRoutine.split_category.toUpperCase() : 'PUSH';

  return (
    <div className="dashboard-shell">
      {/* ── Refined Top Navigation Bar ── */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Logo />
          <span className="nav-edition">ATHLETE DASHBOARD &bull; 01</span>
          <span className="nav-live-indicator">
            <span className="live-dot" /> LIVE SYNC
          </span>
        </div>

        {/* Structured Central Nav Menu */}
        <div className="nav-links-menu">
          <Link to="/dashboard" className="nav-tab-link active">
            Overview
          </Link>
          <Link to="/workouts/active" className="nav-tab-link">
            Workout HUD
          </Link>
          <Link to="/workouts/history" className="nav-tab-link">
            History
          </Link>
          <Link to="/diet" className="nav-tab-link">
            Pantry &amp; Diet
          </Link>
          <Link to="/cheat-meals" className="nav-tab-link">
            Cheat Balancer
          </Link>
        </div>

        {/* Clean Utility Actions */}
        <div className="nav-user-actions">
          <button type="button" onClick={openGoalModal} className="nav-ghost-btn">
            <span>✎</span> Recalibrate
          </button>
          <button type="button" onClick={handleLogout} className="nav-logout-btn">
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main Dashboard Workspace ── */}
      <main className="dashboard-main">
        {/* Clean Welcome Header without floating buttons */}
        <header className="dashboard-welcome-bar">
          <div className="welcome-headline">
            <div className="eyebrow"><span /> ACTIVE SYNC &bull; TELEMETRY MATRIX</div>
            <h1>System Overview</h1>
            <p className="intro">
              Welcome back. Biometrics, nutritional targets, and workout progression are synchronized for{' '}
              <strong style={{ color: '#cbed3e' }}>{profile?.primary_goal || 'Muscle Hypertrophy'}</strong>.
            </p>
          </div>
          {profile && (
            <div className="welcome-status-chips">
              <div className="status-chip">
                <span className="status-chip-label">Goal</span>
                <span className="status-chip-val">{profile.primary_goal || 'Hypertrophy'}</span>
              </div>
              <div className="status-chip">
                <span className="status-chip-label">Daily Burn</span>
                <span className="status-chip-val">{tdee} kcal</span>
              </div>
              <div className="status-chip">
                <span className="status-chip-label">Activity</span>
                <span className="status-chip-val">{profile.activity_level || 'Active'}</span>
              </div>
            </div>
          )}
        </header>

        {error && <p className="error-message">{error}</p>}

        {profile && (
          <>
            {/* ── Top 4-Metric HUD Ribbon (Non-Redundant) ── */}
            <section className="dashboard-hud-ribbon motion-stagger-1">
              {/* 1. Body Composition */}
              <div className="hud-card">
                <div className="hud-card-top">
                  <span className="hud-label">BODY COMPOSITION</span>
                  <button type="button" onClick={openGoalModal} className="hud-action-pill">
                    ✎ Edit Target
                  </button>
                </div>
                <div className="hud-metric">
                  <strong>{profile.weight_kg}</strong> <small>kg</small>
                  <span className="hud-target-badge">&rarr; {profile.target_weight_kg} kg</span>
                </div>
                <div className="hud-sub">
                  {weightDelta > 0
                    ? `+${weightDelta.toFixed(1)} kg Surplus (Lean Bulk)`
                    : weightDelta < 0
                    ? `${weightDelta.toFixed(1)} kg Deficit (Cut)`
                    : 'Target Achieved • Equilibrium'}
                </div>
              </div>

              {/* 2. Body Mass Index */}
              <div className="hud-card">
                <div className="hud-card-top">
                  <span className="hud-label">BODY MASS INDEX</span>
                  <span className="hud-pill green">{profile.bmi_category || 'Normal'}</span>
                </div>
                <div className="hud-metric">
                  <strong>{profile.bmi}</strong> <small>BMI</small>
                </div>
                <div className="hud-sub">Healthy Reference: 18.5 – 24.9</div>
              </div>

              {/* 3. Daily Energy Target */}
              <div className="hud-card">
                <div className="hud-card-top">
                  <span className="hud-label">DAILY ENERGY TARGET</span>
                  <span className="hud-pill volt">ACTIVE</span>
                </div>
                <div className="hud-metric">
                  <strong>{targetCals.toLocaleString()}</strong> <small>kcal</small>
                </div>
                <div className="hud-sub">BMR: {bmr} &bull; TDEE: {tdee} kcal</div>
              </div>

              {/* 4. Training Progression */}
              <div className="hud-card">
                <div className="hud-card-top">
                  <span className="hud-label">TRAINING VOLUME</span>
                  <span className="hud-pill volt">
                    {progressStats?.summary.total_workouts || 0} SESSIONS
                  </span>
                </div>
                <div className="hud-metric">
                  <strong>
                    {progressStats?.summary.total_volume_kg
                      ? progressStats.summary.total_volume_kg.toLocaleString()
                      : 0}
                  </strong>{' '}
                  <small>kg moved</small>
                </div>
                <div className="hud-sub">
                  Avg {progressStats?.summary.avg_volume_per_session || 0} kg / session
                </div>
              </div>
            </section>

            {/* ── Asymmetric 2-Column Balanced Workspace ── */}
            <div className="dashboard-content-layout">
              {/* PRIMARY COLUMN (Left / 62%): Unified Nutrition Architecture & Progress Charts */}
              <div className="dashboard-primary-column">
                {/* 1. Cohesive Daily Nutrition & Macronutrient Blueprint */}
                <section className="dash-card macro-architecture-card motion-stagger-2">
                  <div className="card-top">
                    <div className="card-tag-group">
                      <span className="card-tag volt">
                        <SparklesIcon /> DAILY NUTRITION BLUEPRINT
                      </span>
                      <span className="card-live-pill">LIVE TARGETS</span>
                    </div>
                    <div className="macro-cal-badge">
                      Total Intake:{' '}
                      <strong style={{ color: '#cbed3e' }}>{targetCals.toLocaleString()}</strong> kcal/day
                    </div>
                  </div>

                  {/* 3 Balanced Macronutrient Cards */}
                  <div className="macro-splits-grid">
                    {/* Protein */}
                    <div className="macro-split-card protein">
                      <div className="macro-split-header">
                        <div className="macro-name-tag">
                          <span className="macro-circle-dot protein" />
                          <span>PROTEIN</span>
                        </div>
                        <span className="macro-pct-pill protein">{proteinPct}%</span>
                      </div>
                      <div className="macro-split-grams">
                        <strong>{protein}</strong> <small>g</small>
                      </div>
                      <div className="macro-bar">
                        <div style={{ width: `${proteinPct}%` }} />
                      </div>
                      <div className="macro-split-footer">
                        <span>{proteinCals} kcal</span>
                        <span>2.0g/kg target</span>
                      </div>
                    </div>

                    {/* Carbs */}
                    <div className="macro-split-card carbs">
                      <div className="macro-split-header">
                        <div className="macro-name-tag">
                          <span className="macro-circle-dot carbs" />
                          <span>CARBOHYDRATES</span>
                        </div>
                        <span className="macro-pct-pill carbs">{carbsPct}%</span>
                      </div>
                      <div className="macro-split-grams">
                        <strong>{carbs}</strong> <small>g</small>
                      </div>
                      <div className="macro-bar">
                        <div style={{ width: `${carbsPct}%` }} />
                      </div>
                      <div className="macro-split-footer">
                        <span>{carbsCals} kcal</span>
                        <span>Clean Glycogen</span>
                      </div>
                    </div>

                    {/* Fats */}
                    <div className="macro-split-card fats">
                      <div className="macro-split-header">
                        <div className="macro-name-tag">
                          <span className="macro-circle-dot fats" />
                          <span>HEALTHY FATS</span>
                        </div>
                        <span className="macro-pct-pill fats">{fatsPct}%</span>
                      </div>
                      <div className="macro-split-grams">
                        <strong>{fats}</strong> <small>g</small>
                      </div>
                      <div className="macro-bar">
                        <div style={{ width: `${fatsPct}%` }} />
                      </div>
                      <div className="macro-split-footer">
                        <span>{fatsCals} kcal</span>
                        <span>Hormonal Health</span>
                      </div>
                    </div>
                  </div>

                  {/* Proportional Segmented Progress Strip */}
                  <div className="macro-ratio-track" title={`Protein: ${proteinPct}% | Carbs: ${carbsPct}% | Fats: ${fatsPct}%`}>
                    <div className="macro-ratio-fill protein" style={{ width: `${proteinPct}%` }} />
                    <div className="macro-ratio-fill carbs" style={{ width: `${carbsPct}%` }} />
                    <div className="macro-ratio-fill fats" style={{ width: `${fatsPct}%` }} />
                  </div>

                  {/* Direct Protocol Links */}
                  <div className="nutrition-actions-footer">
                    <Link to="/diet" className="nutrition-footer-btn">
                      <span>🥫</span> Smart Pantry Diet (Zero-Waste) &rarr;
                    </Link>
                    <Link to="/cheat-meals" className="nutrition-footer-btn">
                      <span>🍕</span> Cheat Balancer &amp; Caloric Deficit &rarr;
                    </Link>
                  </div>
                </section>

                {/* 2. Progress Analytics & Performance Visualizations */}
                <div className="motion-stagger-3">
                  <ProgressCharts
                    stats={progressStats}
                    loading={progressLoading}
                    onWeightLogged={(newWt) => setProfile(prev => prev ? { ...prev, weight_kg: newWt } : null)}
                  />
                </div>
              </div>

              {/* SIDEBAR COLUMN (Right / 38%): Training Hub, Protocols & Athlete Baseline */}
              <aside className="dashboard-sidebar-column">
                {/* 1. Workout Command Center — Hero Card with ONE Primary Neon Button */}
                <section className="dash-card workout-action-card motion-stagger-2">
                  <div className="action-card-glow" />
                  <div className="action-card-top">
                    <span className="card-tag volt">
                      <span className="pulse-dot" /> TODAY'S AI PROTOCOL
                    </span>
                    <span className="card-badge-pill">{routineSplit}</span>
                  </div>

                  <h3>{routineTitle}</h3>

                  <div className="workout-meta-pills">
                    <span className="meta-pill">⏱ {routineDuration} min</span>
                    <span className="meta-pill">🔥 ~{routineBurn} kcal</span>
                    <span className="meta-pill">🏋️ {exerciseCount} movements</span>
                  </div>

                  <p className="action-card-desc">
                    Goal-calibrated volume &amp; automated rest intervals optimized for muscle hypertrophy. Track sets &amp; tonnage in real time.
                  </p>

                  <div className="action-card-buttons">
                    {/* The ONLY high-contrast neon CTA button */}
                    <Link to="/workouts/active?routine=auto" className="workout-cta-primary">
                      <span>⚡</span> Start AI Workout Routine &rarr;
                    </Link>
                    <div className="workout-secondary-actions">
                      <Link to="/workouts/active" className="workout-cta-ghost">
                        Custom Workout
                      </Link>
                      <Link to="/workouts/history" className="workout-cta-ghost">
                        History &amp; Logs &rarr;
                      </Link>
                    </div>
                  </div>
                </section>

                {/* 2. Unified Nutrition & Metabolic Balance Deck */}
                <section className="dash-card nutrition-deck-card motion-stagger-3">
                  <div className="deck-header">
                    <div className="deck-nav-pills">
                      <button
                        type="button"
                        className={`deck-pill-btn ${activeModuleTab === 'diet' ? 'active diet' : ''}`}
                        onClick={() => setActiveModuleTab('diet')}
                      >
                        <span>🥫</span> Smart Pantry Diet
                      </button>
                      <button
                        type="button"
                        className={`deck-pill-btn ${activeModuleTab === 'cheat' ? 'active cheat' : ''}`}
                        onClick={() => setActiveModuleTab('cheat')}
                      >
                        <span>🍕</span> Cheat Balancer
                      </button>
                    </div>
                  </div>

                  <div key={activeModuleTab} className="nutrition-deck-content">
                    {activeModuleTab === 'diet' ? (
                      <div className="deck-pane diet-pane">
                        <div className="card-top">
                          <span className="card-tag volt">
                            <span className="pulse-dot" /> SMART DIET PLANNER
                          </span>
                          <span className="card-badge-pill" style={{ color: '#cbed3e', borderColor: '#cbed3e' }}>
                            PANTRY-AWARE
                          </span>
                        </div>
                        <h4 style={{ color: '#ffffff', margin: '4px 0 8px', fontSize: '16px' }}>Zero-Waste Nutrition</h4>
                        <p className="action-card-desc">
                          Generate healthy athletic meals using <i>only</i> groceries on hand in your pantry. Detect nutritional protein gaps automatically.
                        </p>
                        <div className="action-card-buttons">
                          <Link to="/diet" className="deck-action-ghost-btn">
                            <span>🥫</span> Open Diet Planner &rarr;
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="deck-pane cheat-pane">
                        <div className="card-top">
                          <span className="card-tag" style={{ color: '#fbbf24' }}>
                            <span className="pulse-dot" style={{ background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }} /> ADAPTIVE METABOLIC BALANCER
                          </span>
                          <span className="card-badge-pill" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>
                            NON-PUNITIVE
                          </span>
                        </div>
                        <h4 style={{ color: '#ffffff', margin: '4px 0 8px', fontSize: '16px' }}>Cheat Meal Balancer</h4>
                        <p className="action-card-desc" style={{ color: '#d4cebe' }}>
                          Track off-plan meals guilt-free. Automatically distributes surplus calories across 2–4 days via safe buffers and steps.
                        </p>
                        <div className="action-card-buttons">
                          <Link to="/cheat-meals" className="deck-action-ghost-btn gold">
                            <span>🍕</span> Manage Indulgence &rarr;
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* 3. Unified Biometric Matrix & Baseline */}
                <section className="dash-card baseline-card motion-stagger-4">
                  <div className="card-top">
                    <span className="card-tag">BIOMETRIC MATRIX</span>
                    <button
                      type="button"
                      onClick={openGoalModal}
                      className="recalibrate-btn"
                    >
                      ✎ Edit Targets
                    </button>
                  </div>
                  <h3>Physical Baseline &amp; Ambition</h3>
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

                  {/* High-Density Lifestyle Chips */}
                  <div className="lifestyle-chips-row">
                    <div className="lifestyle-chip">
                      <span className="chip-k">Primary Goal</span>
                      <span className="chip-v">{profile.primary_goal || 'Build Strength'}</span>
                    </div>
                    <div className="lifestyle-chip">
                      <span className="chip-k">Dietary Framework</span>
                      <span className="chip-v">{profile.dietary_preference}</span>
                    </div>
                    <div className="lifestyle-chip">
                      <span className="chip-k">Activity Tier</span>
                      <span className="chip-v">{profile.activity_level || 'Moderately Active'}</span>
                    </div>
                    <div className="lifestyle-chip delta">
                      <span className="chip-k">Weight Delta</span>
                      <span className="chip-v highlight">
                        {weightDelta > 0
                          ? `+${weightDelta.toFixed(1)} kg Gain`
                          : weightDelta < 0
                          ? `${weightDelta.toFixed(1)} kg Cut`
                          : '0.0 kg Maintenance'}
                      </span>
                    </div>
                  </div>

                  {/* BMI Readout & Visual Meter */}
                  <div className="dash-bmi-bar">
                    <div className="bmi-title-row">
                      <span>BODY MASS INDEX (BMI)</span>
                      <span className="bmi-tag">{profile.bmi_category}</span>
                    </div>
                    <div className="bmi-big-num">
                      <strong>{profile.bmi}</strong>
                      <span className="bmi-scale-note">Reference: 18.5 – 24.9</span>
                    </div>
                    {/* Visual Color-Coded BMI Gauge */}
                    <div className="bmi-gauge-track">
                      <div className="bmi-gauge-segment under" title="Underweight (<18.5)" />
                      <div className="bmi-gauge-segment normal" title="Normal (18.5-24.9)" />
                      <div className="bmi-gauge-segment over" title="Overweight (25-29.9)" />
                      <div className="bmi-gauge-segment obese" title="Obese (30+)" />
                      <div
                        className="bmi-gauge-pin"
                        style={{
                          left: `${Math.min(97, Math.max(3, (((profile.bmi || 22) - 15) / (35 - 15)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}

        {/* ── GOAL & BIOMETRIC CALIBRATION MODAL  ── */}
        {showGoalModal && (
          <div className="diet-modal-overlay">
            <div className="diet-modal-box" style={{ maxWidth: 500 }}>
              <div className="diet-modal-header">
                <div>
                  <h3 className="diet-modal-title">Edit Goals &amp; Biometrics</h3>
                  <span style={{ font: '11px "DM Mono", monospace', color: '#6a7e71', display: 'block', marginTop: 2 }}>
                    RECALIBRATE METABOLIC TARGETS
                  </span>
                </div>
                <button onClick={() => setShowGoalModal(false)} className="diet-modal-close">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveGoal} className="diet-form">
                <div className="diet-field">
                  <label className="diet-label">Primary Fitness Goal</label>
                  <select
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    className="diet-input"
                  >
                    <option value="Muscle Hypertrophy">Muscle Hypertrophy (Lean Bulk)</option>
                    <option value="Lose Weight">Lose Weight (Fat Loss Deficit)</option>
                    <option value="Build Strength">Build Strength (Heavy Power)</option>
                    <option value="Athletic Endurance">Athletic Endurance &amp; Stamina</option>
                    <option value="Maintenance">Maintenance &amp; Longevity</option>
                  </select>
                </div>

                <div className="diet-form-row">
                  <div className="diet-field">
                    <label className="diet-label">Target Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="250"
                      required
                      value={editTargetWeight}
                      onChange={(e) => setEditTargetWeight(e.target.value)}
                      className="diet-input"
                    />
                  </div>
                  <div className="diet-field">
                    <label className="diet-label">Activity Level</label>
                    <select
                      value={editActivity}
                      onChange={(e) => setEditActivity(e.target.value)}
                      className="diet-input"
                    >
                      <option value="Sedentary">Sedentary (Desk Job)</option>
                      <option value="Lightly Active">Lightly Active (1-3 days/wk)</option>
                      <option value="Moderately Active">Moderately Active (3-5 days/wk)</option>
                      <option value="Very Active">Very Active (6-7 days/wk)</option>
                      <option value="Extra Active">Extra Active (2x/day / Labor)</option>
                    </select>
                  </div>
                </div>

                <div className="diet-field">
                  <label className="diet-label">Dietary Preference</label>
                  <select
                    value={editDiet}
                    onChange={(e) => setEditDiet(e.target.value)}
                    className="diet-input"
                  >
                    <option value="High-Protein Athlete">High-Protein Athlete</option>
                    <option value="Omnivore">Omnivore</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Pescatarian">Pescatarian</option>
                    <option value="Keto">Keto / Low-Carb</option>
                  </select>
                </div>

                <div className="diet-modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="diet-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingGoal}
                    className="diet-btn-submit"
                  >
                    {savingGoal ? 'Calibrating...' : '✓ Recalibrate Targets'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}