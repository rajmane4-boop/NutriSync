import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Logo from '../../components/Logo';
import StudioPanel from '../../components/StudioPanel';
import { EyeIcon, GoogleIcon, SuccessCheckmark } from '../../components/icons';

/* ──────────────────────────────────────────
   Main Login Page Component
   ────────────────────────────────────────── */
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            const token = response.data.access_token;
            localStorage.setItem('access_token', token);
            setSubmitted(true);

            // Query profile status to determine routing
            try {
                const statusRes = await api.get('/profile/status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setTimeout(() => {
                    if (statusRes.data?.has_profile) {
                        navigate('/dashboard');
                    } else {
                        navigate('/onboarding');
                    }
                }, 800);
            } catch {
                // Fallback to onboarding if status check fails
                setTimeout(() => {
                    navigate('/onboarding');
                }, 800);
            }
            
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to sign in. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="auth-shell">
            {/* ── Left Panel: Branding & Art ── */}
            <StudioPanel
                edition="01 — COACHING SYSTEM"
                quote={<>Move with purpose.<br />Recover with intention.</>}
                tag="YOUR WELLNESS, IN SYNC"
            />

            {/* ── Right Panel: Login Form ── */}
            <section className="form-panel">
                <div className="mobile-brand">
                    <Logo />
                </div>

                <div className="form-wrap">
                    {/* Header */}
                    <div className="eyebrow stagger stagger-1">
                        <span /> MEMBER ACCESS
                    </div>
                    <h1 className="stagger stagger-2">Welcome back.</h1>
                    <p className="intro stagger stagger-3">
                        Your next best day is already in motion.
                    </p>

                    {/* Google Sign-In */}
                    <button
                        type="button"
                        className="google-button stagger stagger-4"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="or stagger stagger-5">
                        <span /> OR CONTINUE WITH EMAIL <span />
                    </div>

                    {/* Email & Password Form */}
                    <form onSubmit={handleLogin}>
                        <label className="stagger stagger-6">
                            Email address
                            <input 
                                type="email" 
                                placeholder="you@example.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>

                        <label className="stagger stagger-7">
                            Password
                            <span className="label-link">Forgot password?</span>
                            <div className="password-field">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <EyeIcon closed={!showPassword} />
                                </button>
                            </div>
                        </label>
                        
                        {error && <p className="error-message">{error}</p>}

                        <div className="stagger stagger-8">
                            <label className="remember">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                />
                                <span className="check" />
                                Keep me signed in
                            </label>

                            <button className="submit-button" type="submit" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : <>Sign in <span>→</span></>}
                            </button>
                        </div>

                        {/* Success feedback */}
                        {submitted && (
                            <p className="success" role="status">
                                <SuccessCheckmark />
                                You're signed in — welcome back.
                            </p>
                        )}
                    </form>

                    <p className="signup stagger stagger-8">
                        New to NutriSync? <Link to="/register">Create an account</Link>
                    </p>
                </div>

                <footer>
                    By continuing, you agree to our{" "}
                    <a href="#terms">Terms</a> and{" "}
                    <a href="#privacy">Privacy Policy</a>.
                </footer>
            </section>
        </main>
    );
}
