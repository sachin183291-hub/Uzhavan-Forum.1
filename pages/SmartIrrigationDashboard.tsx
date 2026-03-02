import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   ESP32 Config
   The ESP32 serves on port 80.  Because browsers block direct
   HTTP requests to LAN IPs from an HTTPS page we proxy through
   Vite's "/hw" proxy (already configured in vite.config.ts).
   All fetch calls below use the /hw prefix.
───────────────────────────────────────────────────────────────*/
const HW = '/hw'; // proxied to http://10.57.97.215

interface SensorData {
    moistureValue: number;
    soilCondition: 'DRY' | 'WET' | 'UNKNOWN';
    mode: 'AUTO' | 'MANUAL' | 'UNKNOWN';
    motorState: 'ON' | 'OFF' | 'UNKNOWN';
    lastUpdated: Date | null;
}

const parsePage = (html: string): Partial<SensorData> => {
    /* The ESP32 root page contains:
       Moisture Value: <b>2340</b>
       Soil Condition: <b>WET</b>
       Mode: <b>AUTO</b>
       Motor: <b>OFF</b>
    */
    const get = (label: string) => {
        const m = html.match(new RegExp(`${label}.*?<b>(.*?)<\\/b>`, 'i'));
        return m ? m[1].trim() : null;
    };
    const mv = get('Moisture Value');
    const sc = get('Soil Condition');
    const mode = get('Mode');
    const motor = get('Motor');
    return {
        moistureValue: mv ? parseInt(mv, 10) : 0,
        soilCondition: (sc as 'DRY' | 'WET') || 'UNKNOWN',
        mode: (mode as 'AUTO' | 'MANUAL') || 'UNKNOWN',
        motorState: (motor as 'ON' | 'OFF') || 'UNKNOWN',
    };
};

// ── Moisture bar colour ──────────────────────────────────────
const moistureColor = (v: number) => {
    if (v > 2500) return '#f87171'; // dry → red
    if (v > 1800) return '#fb923c'; // medium-dry → orange
    if (v > 1200) return '#facc15'; // medium-wet → yellow
    return '#34d399';               // wet → green
};

const moistureLabel = (v: number) => {
    if (v > 2500) return 'Very Dry';
    if (v > 1800) return 'Dry';
    if (v > 1200) return 'Moist';
    return 'Wet';
};

// ─── History entry ────────────────────────────────────────────
interface HistoryEntry {
    time: string;
    value: number;
    motor: string;
    mode: string;
}

const SmartIrrigationDashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = localStorage.getItem('esp32_user') || 'User';

    const [data, setData] = useState<SensorData>({
        moistureValue: 0,
        soilCondition: 'UNKNOWN',
        mode: 'UNKNOWN',
        motorState: 'UNKNOWN',
        lastUpdated: null,
    });
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [cmdLoading, setCmdLoading] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [connected, setConnected] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // ── Fetch sensor data from ESP32 root ──────────────────────
    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(HW + '/', { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            const parsed = parsePage(html);
            const now = new Date();
            setData(prev => ({
                ...prev,
                ...parsed,
                lastUpdated: now,
            }));
            setConnected(true);
            setError('');
            setHistory(prev => {
                const entry: HistoryEntry = {
                    time: now.toLocaleTimeString(),
                    value: parsed.moistureValue ?? 0,
                    motor: parsed.motorState ?? 'UNKNOWN',
                    mode: parsed.mode ?? 'UNKNOWN',
                };
                const next = [entry, ...prev].slice(0, 20);
                return next;
            });
        } catch (err) {
            setConnected(false);
            setError('Cannot reach ESP32. Check that device is online and WiFi is connected.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Send command to ESP32 ────────────────────────────────────
    const sendCommand = async (endpoint: '/auto' | '/manual' | '/on' | '/off') => {
        setCmdLoading(endpoint);
        setError('');
        try {
            /* ESP32 redirects 303 → / after each action.
               We follow the redirect and parse the resulting page. */
            const res = await fetch(HW + endpoint, { redirect: 'follow', cache: 'no-store' });
            const html = await res.text();
            const parsed = parsePage(html);
            const now = new Date();
            setData(prev => ({ ...prev, ...parsed, lastUpdated: now }));
            setConnected(true);
            setHistory(prev => {
                const entry: HistoryEntry = {
                    time: now.toLocaleTimeString(),
                    value: parsed.moistureValue ?? 0,
                    motor: parsed.motorState ?? 'UNKNOWN',
                    mode: parsed.mode ?? 'UNKNOWN',
                };
                return [entry, ...prev].slice(0, 20);
            });
        } catch {
            setError('Command failed. Device may be offline.');
        } finally {
            setCmdLoading(null);
        }
    };

    // ── Auto-refresh every 5 s ───────────────────────────────────
    useEffect(() => {
        fetchData();
        if (!autoRefresh) return;
        const id = setInterval(fetchData, 5000);
        return () => clearInterval(id);
    }, [fetchData, autoRefresh]);

    // ── Logout ────────────────────────────────────────────────────
    const logout = () => {
        localStorage.removeItem('esp32_user');
        navigate('/smart-irrigation-login');
    };

    // ── Moisture percentage (0 – 4095) ───────────────────────────
    const moisturePct = Math.max(0, Math.min(100, Math.round(((4095 - data.moistureValue) / 4095) * 100)));

    return (
        <div className="min-h-screen bg-[#060e0a] text-white px-4 py-8 relative overflow-x-hidden">

            {/* Background glows */}
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-700/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[45%] h-[45%] bg-cyan-700/10 rounded-full blur-[130px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Smart Irrigation</h1>
                        <p className="text-emerald-400/70 text-[11px] uppercase font-black tracking-[0.35em] mt-1">
                            ESP32 · Live Dashboard
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Connection badge */}
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${connected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            {connected ? 'Online' : 'Offline'}
                        </span>
                        {/* User + logout */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-500 font-bold capitalize">{user}</span>
                            <button onClick={logout}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-stone-400 uppercase tracking-widest transition-all">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Error banner ── */}
                {error && (
                    <div className="mb-6 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                        ⚠ {error}
                    </div>
                )}

                {/* ══════════════════════════════════════
            TOP STAT CARDS
        ══════════════════════════════════════ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        {
                            label: 'Raw ADC Value',
                            value: loading ? '—' : String(data.moistureValue),
                            sub: 'out of 4095',
                            icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            ),
                            accent: 'from-emerald-500 to-teal-600',
                        },
                        {
                            label: 'Soil Condition',
                            value: loading ? '—' : data.soilCondition,
                            sub: data.soilCondition === 'DRY' ? 'Needs water' : 'Adequate moisture',
                            icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                            ),
                            accent: data.soilCondition === 'DRY' ? 'from-orange-500 to-red-600' : 'from-cyan-500 to-blue-600',
                        },
                        {
                            label: 'Mode',
                            value: loading ? '—' : data.mode,
                            sub: data.mode === 'AUTO' ? 'Auto-controlling pump' : 'Manual control active',
                            icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            ),
                            accent: 'from-violet-500 to-purple-600',
                        },
                        {
                            label: 'Motor',
                            value: loading ? '—' : data.motorState,
                            sub: data.motorState === 'ON' ? 'Pump running' : 'Pump stopped',
                            icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            ),
                            accent: data.motorState === 'ON' ? 'from-green-400 to-emerald-600' : 'from-stone-500 to-stone-700',
                        },
                    ].map(card => (
                        <div key={card.label}
                            className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/[0.05] transition-all">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center shadow-lg`}>
                                {card.icon}
                            </div>
                            <div>
                                <div className="text-[10px] text-stone-500 uppercase font-black tracking-widest">{card.label}</div>
                                <div className="text-2xl font-black mt-0.5 tracking-tight">{card.value}</div>
                                <div className="text-[10px] text-stone-600 mt-0.5 font-semibold">{card.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ══════════════════════════════════════
            MOISTURE GAUGE + CONTROLS
        ══════════════════════════════════════ */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">

                    {/* Moisture visual */}
                    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-stone-400">Moisture Level</h2>
                            <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                                style={{ background: `${moistureColor(data.moistureValue)}22`, color: moistureColor(data.moistureValue) }}>
                                {moistureLabel(data.moistureValue)}
                            </span>
                        </div>

                        {/* Circular gauge */}
                        <div className="flex items-center justify-center my-4">
                            <div className="relative w-36 h-36">
                                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="10" />
                                    <circle cx="50" cy="50" r="40" fill="none"
                                        stroke={moistureColor(data.moistureValue)}
                                        strokeWidth="10"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - moisturePct / 100)}`}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-3xl font-black" style={{ color: moistureColor(data.moistureValue) }}>
                                        {loading ? '—' : `${moisturePct}%`}
                                    </div>
                                    <div className="text-[9px] text-stone-500 uppercase font-black tracking-widest">moisture</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-stone-600 font-bold mt-2 px-2">
                            <span>Dry (4095)</span>
                            <span>Threshold: 2500</span>
                            <span>Wet (0)</span>
                        </div>

                        {/* Last updated */}
                        <div className="text-center mt-4 text-[10px] text-stone-600 font-mono">
                            {data.lastUpdated
                                ? `Last update: ${data.lastUpdated.toLocaleTimeString()}`
                                : 'Fetching data…'}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
                        <h2 className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-1">Controls</h2>

                        {/* Mode buttons */}
                        <div>
                            <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-2">Mode</p>
                            <div className="grid grid-cols-2 gap-3">
                                {(['/auto', '/manual'] as const).map(ep => {
                                    const label = ep === '/auto' ? 'Auto Mode' : 'Manual Mode';
                                    const icon = ep === '/auto'
                                        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
                                    const isActive = (ep === '/auto' && data.mode === 'AUTO') || (ep === '/manual' && data.mode === 'MANUAL');
                                    return (
                                        <button key={ep}
                                            onClick={() => sendCommand(ep)}
                                            disabled={!!cmdLoading}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border ${isActive
                                                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                                                : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'}`}>
                                            {cmdLoading === ep
                                                ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                : icon}
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Motor buttons */}
                        <div>
                            <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-2">Motor (Manual)</p>
                            <div className="grid grid-cols-2 gap-3">
                                {(['/on', '/off'] as const).map(ep => {
                                    const label = ep === '/on' ? 'Motor ON' : 'Motor OFF';
                                    const isActive = (ep === '/on' && data.motorState === 'ON') || (ep === '/off' && data.motorState === 'OFF');
                                    const colour = ep === '/on'
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                        : 'bg-red-500/20 border-red-500/40 text-red-300';
                                    return (
                                        <button key={ep}
                                            onClick={() => sendCommand(ep)}
                                            disabled={!!cmdLoading}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border ${isActive ? colour : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'}`}>
                                            {cmdLoading === ep
                                                ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                : <span>{ep === '/on' ? '⚡' : '⏹'}</span>}
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Refresh controls */}
                        <div className="mt-auto flex items-center gap-3">
                            <button onClick={fetchData} disabled={loading || !!cmdLoading}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-400 transition-all active:scale-95">
                                <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                            <button onClick={() => setAutoRefresh(v => !v)}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${autoRefresh
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : 'bg-white/5 border-white/10 text-stone-500'}`}>
                                {autoRefresh ? '⏺ Auto ON' : '⏸ Auto OFF'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════
            HISTORY LOG
        ══════════════════════════════════════ */}
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-4">Reading History</h2>
                    {history.length === 0 ? (
                        <p className="text-stone-600 text-sm text-center py-8 font-bold">No readings yet…</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead>
                                    <tr className="text-stone-600 border-b border-white/5">
                                        <th className="pb-3 text-left font-black uppercase tracking-widest">Time</th>
                                        <th className="pb-3 text-right font-black uppercase tracking-widest">ADC</th>
                                        <th className="pb-3 text-right font-black uppercase tracking-widest">Moisture %</th>
                                        <th className="pb-3 text-right font-black uppercase tracking-widest">Motor</th>
                                        <th className="pb-3 text-right font-black uppercase tracking-widest">Mode</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((h, i) => {
                                        const pct = Math.max(0, Math.min(100, Math.round(((4095 - h.value) / 4095) * 100)));
                                        return (
                                            <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                                <td className="py-2.5 font-mono text-stone-500">{h.time}</td>
                                                <td className="text-right font-bold text-white">{h.value}</td>
                                                <td className="text-right">
                                                    <span className="font-bold" style={{ color: moistureColor(h.value) }}>{pct}%</span>
                                                </td>
                                                <td className="text-right">
                                                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${h.motor === 'ON'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-stone-700/40 text-stone-500'}`}>
                                                        {h.motor}
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${h.mode === 'AUTO'
                                                        ? 'bg-violet-500/20 text-violet-400'
                                                        : 'bg-orange-500/20 text-orange-400'}`}>
                                                        {h.mode}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-[9px] font-mono text-stone-700 mt-6">
                    UzhavanForum · ESP32 @ 10.57.97.215 · Soil Pin 34 · Relay Pin 26
                </p>
            </div>
        </div>
    );
};

export default SmartIrrigationDashboard;
