import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchWorkoutHistory, deleteWorkout, type WorkoutLogResponse } from '../services/workout';
import Logo from '../components/Logo';

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWorkoutHistory();
        setWorkouts(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkout(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('Failed to delete workout:', err);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return '—';
    const diff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading workout history...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-shell history-shell">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Logo />
          <span className="nav-edition">WORKOUT HISTORY</span>
        </div>
        <div className="nav-actions">
          <Link to="/workouts/active" className="nav-link-btn accent">
            + New Workout
          </Link>
          <Link to="/dashboard" className="nav-link-btn">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="dashboard-main">
        <header className="dashboard-welcome">
          <div className="eyebrow"><span />SESSION ARCHIVE</div>
          <h1>Workout History</h1>
          <p className="intro">
            Review past sessions, volumes, and performance trends.
          </p>
        </header>

        {workouts.length === 0 ? (
          <div className="history-empty">
            <p>No workouts logged yet. Start your first session!</p>
            <button type="button" className="az-start-btn" onClick={() => navigate('/workouts/active')}>
              Start Workout
            </button>
          </div>
        ) : (
          <div className="history-list">
            {workouts.map(w => (
              <div key={w.id} className="history-card">
                <div className="hc-main" onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}>
                  <div className="hc-left">
                    <h3>{w.title}</h3>
                    <div className="hc-meta">
                      <span className="hc-date">{formatDate(w.started_at)}</span>
                      {w.routine_tag && <span className="hc-tag">{w.routine_tag}</span>}
                      <span className="hc-status">{w.status}</span>
                    </div>
                  </div>
                  <div className="hc-stats">
                    <div className="hc-stat">
                      <span>VOLUME</span>
                      <strong>{w.total_volume_kg.toLocaleString()} kg</strong>
                    </div>
                    <div className="hc-stat">
                      <span>DURATION</span>
                      <strong>{formatDuration(w.started_at, w.completed_at)}</strong>
                    </div>
                    <div className="hc-stat">
                      <span>EXERCISES</span>
                      <strong>{w.exercise_logs.length}</strong>
                    </div>
                  </div>
                  <svg className={`hc-chevron ${expandedId === w.id ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>

                {/* Expanded Detail */}
                {expandedId === w.id && (
                  <div className="hc-detail">
                    {w.exercise_logs
                      .sort((a, b) => a.order_index - b.order_index)
                      .map(exLog => (
                        <div key={exLog.id} className="hc-exercise">
                          <div className="hce-title">
                            <strong>{exLog.exercise?.name || 'Unknown'}</strong>
                            <span>{exLog.exercise?.primary_muscle} &bull; {exLog.exercise?.equipment}</span>
                          </div>
                          <div className="hce-sets">
                            {exLog.sets_data.map((set: any, i: number) => (
                              <span key={i} className={`hce-set ${set.completed ? 'done' : ''}`}>
                                {set.reps} x {set.weight_kg}kg
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    {w.notes && (
                      <div className="hc-notes">
                        <span>NOTES:</span> {w.notes}
                      </div>
                    )}
                    <button type="button" className="hc-delete" onClick={() => handleDelete(w.id)}>
                      Delete Session
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
