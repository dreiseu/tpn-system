import { Head, useForm } from '@inertiajs/react';
import { Lock, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import './login.css';
import dohLogoUrl from '../../../images/DOH Logo.png';
import bghmcLogoUrl from '../../../images/BGHMC logo hi-res.png';
import bagongPilipinasLogoUrl from '../../../images/Bagong_Pilipinas_logo.png';

export default function Login() {
    const [particles, setParticles] = useState<number[]>([]);

    useEffect(() => {
        // Create 20 random particles for the background animation
        setParticles(Array.from({ length: 20 }, (_, i) => i));
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        bioid: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="login-page">
            <Head title="Log in" />

            {/* Animated Background */}
            <div className="animated-bg">
                {particles.map((i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 20}s`,
                            animationDuration: `${15 + Math.random() * 10}s`,
                        }}
                    />
                ))}
            </div>

            <div className="login-card">
                {/* Top Section */}
                <div className="login-top">
                    <div className="logo-strip">
                        <img src={dohLogoUrl} alt="DOH" />
                        <img src={bghmcLogoUrl} alt="BGHMC" />
                        <img src={bagongPilipinasLogoUrl} alt="Bagong Pilipinas" />
                    </div>

                    {/* S-Curve SVG */}
                    <svg className="s-curve" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,25 C25,0 75,100 100,50 L100,100 L0,100 Z" fill="white" />
                    </svg>
                </div>

                {/* Bottom Section */}
                <div className="login-bottom">
                    <div className="system-titles">
                        <span className="hospital-name">Bataan General Hospital and Medical Center</span>
                        <h1 className="system-name">
                            Total Parenteral<br />
                            Nutrition System
                        </h1>
                        <p className="system-motto">
                            Streamlining TPN Management<br />
                            for Enhanced Patient Care.
                        </p>
                    </div>

                    <form onSubmit={submit} className="login-form">
                        {/* Biometric ID */}
                        <div className="input-group">
                            <User className="input-icon" />
                            <input
                                type="text"
                                id="bioid"
                                name="bioid"
                                value={data.bioid}
                                onChange={(e) => setData('bioid', e.target.value)}
                                placeholder="Biometric ID / Username"
                                required
                                autoFocus
                            />
                            <InputError message={errors.bioid} />
                        </div>

                        {/* Password */}
                        <div className="input-group">
                            <Lock className="input-icon" />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                                required
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="btn-login"
                            disabled={processing}
                        >
                            {processing ? 'Logging in...' : 'Login'}
                        </button>

                        <div className="login-note">
                            Please use your <b>Employee's Portal</b> account.<br />
                            No account yet? Register{' '}
                            <a
                                href="http://192.168.42.245:8085/Register.aspx"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                here
                            </a>.
                        </div>

                        <div className="login-footer">
                            <p>Copyright &copy; Bataan General Hospital and Medical Center 2026</p>
                            <p>App Code: TPNS</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


Login.layout = null;
