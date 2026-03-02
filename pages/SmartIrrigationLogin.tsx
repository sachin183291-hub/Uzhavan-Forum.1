import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Credentials ─── */
const VALID_USERS: Record<string, string> = {
    sachin: 'sachin123',
    admin: 'admin123',
};

const SmartIrrigationLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            const valid = VALID_USERS[username.trim().toLowerCase()];
            if (valid && valid === password) {
                localStorage.setItem('esp32_user', username.trim());
                navigate('/smart-irrigation-dashboard');
            } else {
                setError('Invalid username or password.');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#060e0a] relative overflow-hidden px-4">

            {/* Background glows */}
            <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-emerald-600/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/15 rounded-full blur-[130px]" />

            <div className="relative z-10 w-full max-w-md">

                {/* Card */}
                <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">

                    {/* Icon + title */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 rounded-[1.6rem] bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(52,211,153,0.35)] rotate-3 hover:rotate-0 transition-transform duration-300">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Smart Irrigation</h1>
                        <p className="text-emerald-400/80 text-[11px] font-black uppercase tracking-[0.35em] mt-2">ESP32 Control Panel</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">

                        {/* Error */}
                        {error && (
                            <div className="px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center tracking-wide">
                                ⚠ {error}
                            </div>
                        )}

                        {/* Username */}
                        <div className="relative group">
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <input
                                type="text"
                                value={username}
                                onChange={e => { setUsername(e.target.value); setError(''); }}
                                className="w-full bg-black/30 border border-white/10 text-white pl-12 pr-5 py-4 rounded-2xl text-sm font-semibold placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
                                placeholder="Username"
                                required
                                autoComplete="username"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                className="w-full bg-black/30 border border-white/10 text-white pl-12 pr-12 py-4 rounded-2xl text-sm font-semibold placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
                                placeholder="Password"
                                required
                                autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setShowPass(v => !v)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors">
                                {showPass
                                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                }
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_10px_30px_-10px_rgba(52,211,153,0.5)] transition-all active:scale-95 flex items-center justify-center gap-3 min-h-[56px]"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Authenticating…</span>
                                </>
                            ) : 'Access Control Panel'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[10px] text-stone-600 font-mono">
                        sachin / sachin123 &nbsp;·&nbsp; admin / admin123
                    </p>
                </div>

                <p className="text-center text-[9px] text-stone-700 font-mono mt-4">
                    UzhavanForum · ESP32 Smart Irrigation System
                </p>
            </div>
        </div>
    );
};

export default SmartIrrigationLogin;
