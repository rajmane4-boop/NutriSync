import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Logo from '../../components/Logo';
import StudioPanel from '../../components/StudioPanel';
import { EyeIcon, GoogleIcon, SuccessCheckmark } from '../../components/icons';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agree) return;
        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/register', {
                email,
                password,
                first_name: firstName,
                last_name: lastName
            });
            const loginResponse = await api.post('/auth/login', { email, password });
            localStorage.setItem('access_token', loginResponse.data.access_token);
            setSubmitted(true);
            setTimeout(() => { navigate('/onboarding'); }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="auth-shell">
            <StudioPanel
                edition="02 &#x2014; NEW MEMBER"
                quote={<>Begin where you are.<br />Grow into who you'll be.</>}
                tag="ONBOARDING, IN SYNC"
            />

            <section className="form-panel">
                <div className="mobile-brand"><Logo /></div>

                <div className="form-wrap">
                    <div className="eyebrow stagger stagger-1"><span /> CREATE ACCOUNT</div>
                    <h1 className="stagger stagger-2">Start your sync.</h1>
                    <p className="intro stagger stagger-3">Ninety seconds to set up. A lifetime of momentum.</p>

                    <button type="button" className="google-button stagger stagger-4">
                        <GoogleIcon /> Sign up with Google
                    </button>

                    <div className="or stagger stagger-5"><span /> OR SIGN UP WITH EMAIL <span /></div>

                    <form onSubmit={handleRegister}>
                        <div className="field-row stagger stagger-6">
                            <label>First name<input type="text" placeholder="Maya" required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
                            <label>Last name<input type="text" placeholder="Okafor" required value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
                        </div>

                        <label className="stagger stagger-6">Email address<input type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>

                        <label className="stagger stagger-7">
                            Password
                            <div className="password-field">
                                <input type={showPassword ? "text" : "password"} placeholder="Create a password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}><EyeIcon closed={!showPassword} /></button>
                            </div>
                            <span className="hint">At least 8 characters, one number.</span>
                        </label>

                        {error && <p className="error-message">{error}</p>}

                        <label className="remember stagger stagger-8">
                            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
                            <span className="check" />
                            I agree to the <a href="#terms">Terms</a> &amp; <a href="#privacy">Privacy Policy</a>
                        </label>

                        <button className="submit-button stagger stagger-8" type="submit" disabled={isLoading || !agree}>
                            {isLoading ? 'Creating account...' : <>Create account <span>&rarr;</span></>}
                        </button>

                        {submitted && (
                            <p className="success" role="status">
                                <SuccessCheckmark />
                                Account created &#x2014; welcome to NutriSync.
                            </p>
                        )}
                    </form>

                    <p className="signup stagger stagger-8">Already a member? <Link to="/login">Sign in</Link></p>
                </div>

                <footer>Free for 14 days. No card required to start.</footer>
            </section>
        </main>
    );
}
