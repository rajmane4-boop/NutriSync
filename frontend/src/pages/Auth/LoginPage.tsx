import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Logo from '../../components/Logo';
import StudioPanel from '../../components/StudioPanel';
import { EyeIcon, GoogleIcon, SuccessCheckmark } from '../../components/icons';
import { triggerGoogleAuth, initGoogleOneTap } from '../../services/googleAuth';

/* ──────────────────────────────────────────
   Main Login Page Component
   ────────────────────────────────────────── */
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isColdStarting, setIsColdStarting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();

    // Detect if network request is taking > 2.8s (Render cold start)
    useEffect(() => {
        let timer: any;
        if (isLoading || isGoogleLoading) {
            timer = setTimeout(() => {
                setIsColdStarting(true);
            }, 2800);
        } else {
            setIsColdStarting(false);
        }
        return () => clearTimeout(timer);
    }, [isLoading, isGoogleLoading]);

    const handlePostLogin = async (token: string) => {
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
    };

    useEffect(() => {
        // Optional Google One Tap prompt
        const timer = setTimeout(() => {
            initGoogleOneTap(
                (token) => handlePostLogin(token),
                () => {}
            );
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleGoogleSignIn = () => {
        setError('');
        triggerGoogleAuth(
            (token) => handlePostLogin(token),
            (errorMsg) => setError(errorMsg),
            setIsGoogleLoading
        );
    };

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
            await handlePostLogin(token);
            
        } catch (err: any) {
            if (!err.response) {
                setError('Cloud server is waking up (takes ~30s on first visit). Please tap Sign in again in a few seconds!');
            } else if (err.response.status === 500) {
                setError('Database connection error. Please try again shortly.');
            } else {
                setError(err.response?.data?.detail || 'Failed to sign in. Please try again.');
            }
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
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || isGoogleLoading}
                    >
                        <GoogleIcon />
                        {isGoogleLoading
                            ? (isColdStarting ? 'Waking up cloud server...' : 'Connecting to Google...')
                            : 'Continue with Google'}
                    </button>

                    {/* Cold start reassurance banner */}
                    {isColdStarting && (
                        <div className="cold-start-banner" role="status">
                            <span className="cold-start-dot" />
                            <span>
                                <strong>Connecting to cloud server:</strong> Free-tier backend is spinning up (~15–20s initial boot). Almost there...
                            </span>
                        </div>
                    )}

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
                                {isLoading 
                                    ? (isColdStarting ? 'Waking up cloud server...' : 'Signing in...') 
                                    : <>Sign in <span>→</span></>}
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
