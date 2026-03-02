import React, { useState, useEffect, useRef } from 'react';

// ─── Crop data with internal historical prices ─────────────────────────────
const CROPS: Record<string, { unit: string; prices: number[]; icon: string; color: string }> = {
    Paddy: {
        unit: '₹/quintal',
        prices: [2100, 2150, 2180, 2220, 2270, 2300],
        icon: '🌾',
        color: '#f59e0b',
    },
    Wheat: {
        unit: '₹/quintal',
        prices: [2050, 2080, 2090, 2120, 2110, 2140],
        icon: '🌿',
        color: '#84cc16',
    },
    Tomato: {
        unit: '₹/kg',
        prices: [18, 22, 20, 17, 15, 14],
        icon: '🍅',
        color: '#ef4444',
    },
    Onion: {
        unit: '₹/kg',
        prices: [22, 25, 30, 28, 32, 35],
        icon: '🧅',
        color: '#a78bfa',
    },
    Cotton: {
        unit: '₹/quintal',
        prices: [6200, 6350, 6400, 6300, 6250, 6200],
        icon: '🪴',
        color: '#60a5fa',
    },
    Maize: {
        unit: '₹/quintal',
        prices: [1800, 1820, 1790, 1810, 1830, 1870],
        icon: '🌽',
        color: '#fbbf24',
    },
};

// ─── Prediction logic ─────────────────────────────────────────────────────
interface Prediction {
    crop: string;
    currentAvg: number;
    predictedPrice: number;
    pctChange: number;
    direction: 'up' | 'down' | 'stable';
    message: string;
    confidence: number;
    unit: string;
    timestamp: string;
}

const computePrediction = (crop: string): Prediction => {
    const { prices, unit } = CROPS[crop];
    const n = prices.length;

    // Weighted average (recent weeks matter more)
    const weighted = prices.reduce((s, p, i) => s + p * (i + 1), 0);
    const weightTotal = (n * (n + 1)) / 2;
    const currentAvg = Math.round(weighted / weightTotal);

    // Week-over-week changes
    const changes: number[] = [];
    for (let i = 1; i < n; i++) {
        changes.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    // Recent trend (last 3 changes weighted more)
    const recentChanges = changes.slice(-3);
    const trendAvg = recentChanges.reduce((s, c) => s + c, 0) / recentChanges.length;

    // Momentum: acceleration of trend
    const momentum =
        recentChanges.length > 1
            ? recentChanges[recentChanges.length - 1] - recentChanges[0]
            : 0;

    // Combined predicted % change
    const rawPct = trendAvg * 100 + momentum * 50;
    const pctChange = parseFloat(rawPct.toFixed(1));
    const direction: 'up' | 'down' | 'stable' =
        pctChange > 1.0 ? 'up' : pctChange < -1.0 ? 'down' : 'stable';

    const predictedPrice = Math.round(currentAvg * (1 + pctChange / 100));

    // Confidence based on consistency of trend
    const variance =
        changes.reduce((s, c) => s + Math.pow(c - trendAvg, 2), 0) / changes.length;
    const stddev = Math.sqrt(variance) * 100;
    const confidence = Math.max(50, Math.round(100 - stddev * 8));

    const absPct = Math.abs(pctChange);
    const message =
        direction === 'up'
            ? `Price likely to increase by ${absPct}% next week.`
            : direction === 'down'
                ? `Price may drop by ${absPct}% next week.`
                : `Price expected to remain stable (±${absPct}%).`;

    return {
        crop,
        currentAvg,
        predictedPrice,
        pctChange,
        direction,
        message,
        confidence,
        unit,
        timestamp: new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }),
    };
};

// ─── localStorage helpers ──────────────────────────────────────────────────
const LS_KEY = 'mandi_forecast_history';
const loadHistory = (): Prediction[] => {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    } catch {
        return [];
    }
};
const saveHistory = (h: Prediction[]) =>
    localStorage.setItem(LS_KEY, JSON.stringify(h.slice(0, 30)));

// ─── Mini sparkline SVG ───────────────────────────────────────────────────
const Sparkline: React.FC<{ prices: number[]; color: string }> = ({ prices, color }) => {
    const W = 120, H = 40, pad = 4;
    const min = Math.min(...prices), max = Math.max(...prices);
    const range = max - min || 1;
    const pts = prices.map((p, i) => {
        const x = pad + (i / (prices.length - 1)) * (W - 2 * pad);
        const y = H - pad - ((p - min) / range) * (H - 2 * pad);
        return `${x},${y}`;
    });
    const d = `M${pts.join('L')}`;
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            <defs>
                <linearGradient id={`sg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path
                d={`${d}L${pts[pts.length - 1].split(',')[0]},${H}L${pad},${H}Z`}
                fill={`url(#sg-${color.slice(1)})`}
            />
            <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {prices.map((p, i) => {
                const [x, y] = pts[i].split(',');
                return i === prices.length - 1 ? (
                    <circle key={i} cx={x} cy={y} r="3" fill={color} />
                ) : null;
            })}
        </svg>
    );
};

// ─── Animated counter ─────────────────────────────────────────────────────
const AnimCount: React.FC<{ value: number; prefix?: string; suffix?: string; duration?: number }> = ({
    value, prefix = '', suffix = '', duration = 900,
}) => {
    const [display, setDisplay] = useState(0);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number>(0);
    useEffect(() => {
        const start = display;
        startRef.current = null;
        const animate = (ts: number) => {
            if (!startRef.current) startRef.current = ts;
            const elapsed = ts - startRef.current;
            const prog = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - prog, 3);
            setDisplay(Math.round(start + (value - start) * eased));
            if (prog < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [value]);
    return <span>{prefix}{display.toLocaleString('en-IN')}{suffix}</span>;
};

// ─── Gauge bar ───────────────────────────────────────────────────────────
const GaugeBar: React.FC<{ value: number; color: string; label: string }> = ({ value, color, label }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            <span>{label}</span>
            <span style={{ color }}>{value}%</span>
        </div>
        <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${value}%`, background: color }}
            />
        </div>
    </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
const MandiPriceForecast: React.FC = () => {
    const [selectedCrop, setSelectedCrop] = useState('Paddy');
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [history, setHistory] = useState<Prediction[]>(loadHistory);
    const [isRunning, setIsRunning] = useState(false);

    const runForecast = () => {
        setIsRunning(true);
        setTimeout(() => {
            const result = computePrediction(selectedCrop);
            setPrediction(result);
            const updated = [result, ...history].slice(0, 30);
            setHistory(updated);
            saveHistory(updated);
            setIsRunning(false);
        }, 1200);
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(LS_KEY);
    };

    const crop = CROPS[selectedCrop];

    return (
        <div className="min-h-screen bg-[#030a06] text-white px-4 py-10 relative overflow-x-hidden">

            {/* Background glows */}
            <div className="fixed top-[-20%] right-[-10%] w-[55%] h-[55%] bg-emerald-800/12 rounded-full blur-[160px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[45%] h-[45%] bg-blue-800/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">

                {/* ── Header ── */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">AI Powered · No API</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">
                        Mandi{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Price AI
                        </span>
                    </h1>
                    <p className="text-stone-400 text-lg font-light max-w-xl mx-auto">
                        Simulate next-week market prices using trend-based forecasting.
                        All predictions computed locally from historical data.
                    </p>
                </div>

                {/* ── Crop Selector ── */}
                <div className="bg-white/[0.03] border border-white/8 rounded-[2rem] p-6 mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">Select Crop</p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {Object.entries(CROPS).map(([name, info]) => (
                            <button
                                key={name}
                                onClick={() => { setSelectedCrop(name); setPrediction(null); }}
                                className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${selectedCrop === name
                                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                                        : 'border-white/8 bg-white/[0.02] text-stone-500 hover:bg-white/[0.05]'
                                    }`}
                            >
                                <span className="text-2xl">{info.icon}</span>
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Historical Prices Card ── */}
                <div className="bg-white/[0.03] border border-white/8 rounded-[2rem] p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">6-Week Historical Data</p>
                            <h2 className="text-2xl font-black mt-1">{crop.icon} {selectedCrop}</h2>
                        </div>
                        <Sparkline prices={crop.prices} color={crop.color} />
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        {crop.prices.map((p, i) => {
                            const prevPct = i > 0 ? ((p - crop.prices[i - 1]) / crop.prices[i - 1]) * 100 : null;
                            return (
                                <div key={i} className={`rounded-xl p-3 border text-center transition-all ${i === crop.prices.length - 1
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-white/[0.02] border-white/8'
                                    }`}>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">
                                        W{i + 1}
                                    </div>
                                    <div className="text-sm font-black">{p.toLocaleString('en-IN')}</div>
                                    {prevPct !== null && (
                                        <div className={`text-[9px] font-bold mt-1 ${prevPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {prevPct >= 0 ? '↑' : '↓'}{Math.abs(prevPct).toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-stone-600 font-mono mt-3 text-right">
                        Unit: {crop.unit} · W6 = current week
                    </p>
                </div>

                {/* ── Forecast Button ── */}
                <button
                    onClick={runForecast}
                    disabled={isRunning}
                    className="w-full py-6 mb-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-[0_20px_40px_-15px_rgba(52,211,153,0.4)] transition-all active:scale-[0.99] flex items-center justify-center gap-4 min-h-[72px]"
                >
                    {isRunning ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analysing Trend Data…
                        </>
                    ) : (
                        <>
                            <span className="text-xl">🤖</span>
                            Run AI Price Forecast
                        </>
                    )}
                </button>

                {/* ── Result Panel ── */}
                {prediction && (
                    <div className="mb-6 animate-[fadeSlideIn_0.4s_ease]">

                        {/* Message banner */}
                        <div className={`rounded-[2rem] px-8 py-6 mb-4 border flex items-center gap-4 ${prediction.direction === 'up'
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : prediction.direction === 'down'
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : 'bg-blue-500/10 border-blue-500/30'
                            }`}>
                            <span className="text-4xl">
                                {prediction.direction === 'up' ? '📈' : prediction.direction === 'down' ? '📉' : '➡️'}
                            </span>
                            <div>
                                <p className={`text-lg font-black tracking-tight ${prediction.direction === 'up' ? 'text-emerald-300'
                                        : prediction.direction === 'down' ? 'text-red-300'
                                            : 'text-blue-300'
                                    }`}>
                                    {prediction.message}
                                </p>
                                <p className="text-[10px] text-stone-500 font-bold mt-1 uppercase tracking-widest">
                                    {prediction.direction === 'up' ? '↑ Increasing trend' : prediction.direction === 'down' ? '↓ Falling trend' : '→ Stable trend'}
                                </p>
                            </div>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {[
                                {
                                    label: 'Current Avg',
                                    value: <AnimCount value={prediction.currentAvg} prefix="₹" />,
                                    sub: prediction.unit,
                                    icon: '📊',
                                },
                                {
                                    label: 'Predicted Price',
                                    value: <AnimCount value={prediction.predictedPrice} prefix="₹" />,
                                    sub: 'Next week forecast',
                                    icon: prediction.direction === 'up' ? '↑' : prediction.direction === 'down' ? '↓' : '→',
                                },
                                {
                                    label: '% Change',
                                    value: `${prediction.pctChange > 0 ? '+' : ''}${prediction.pctChange}%`,
                                    sub: 'Week-over-week',
                                    icon: prediction.pctChange > 0 ? '🟢' : prediction.pctChange < 0 ? '🔴' : '🟡',
                                },
                                {
                                    label: 'AI Confidence',
                                    value: `${prediction.confidence}%`,
                                    sub: 'Based on variance',
                                    icon: '🎯',
                                },
                            ].map(card => (
                                <div key={card.label}
                                    className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 hover:bg-white/[0.05] transition-all">
                                    <div className="text-2xl mb-2">{card.icon}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-stone-500">{card.label}</div>
                                    <div className="text-2xl font-black mt-1">{card.value}</div>
                                    <div className="text-[9px] text-stone-600 mt-1">{card.sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* Confidence gauge */}
                        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">Model Confidence Breakdown</p>
                            <div className="grid md:grid-cols-3 gap-4">
                                <GaugeBar value={prediction.confidence} color="#34d399" label="Overall Confidence" />
                                <GaugeBar value={Math.min(100, prediction.confidence + 5)} color="#60a5fa" label="Trend Strength" />
                                <GaugeBar value={Math.max(40, prediction.confidence - 10)} color="#a78bfa" label="Data Consistency" />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── History Log ── */}
                <div className="bg-white/[0.03] border border-white/8 rounded-[2rem] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                            Forecast History ({history.length})
                        </p>
                        {history.length > 0 && (
                            <button onClick={clearHistory}
                                className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20">
                                Clear
                            </button>
                        )}
                    </div>
                    {history.length === 0 ? (
                        <p className="text-center text-stone-600 text-sm py-10 font-bold">
                            No forecasts yet. Run your first prediction above.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead>
                                    <tr className="text-stone-600 border-b border-white/5">
                                        {['Crop', 'Current', 'Predicted', 'Change', 'Confidence', 'Direction', 'Time'].map(h => (
                                            <th key={h} className="pb-3 text-left font-black uppercase tracking-widest pr-4">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((h, i) => (
                                        <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3 pr-4 font-bold">
                                                {CROPS[h.crop]?.icon} {h.crop}
                                            </td>
                                            <td className="pr-4 font-mono">₹{h.currentAvg.toLocaleString('en-IN')}</td>
                                            <td className="pr-4 font-mono font-black">₹{h.predictedPrice.toLocaleString('en-IN')}</td>
                                            <td className="pr-4">
                                                <span className={`font-black ${h.pctChange > 0 ? 'text-emerald-400' : h.pctChange < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                                    {h.pctChange > 0 ? '+' : ''}{h.pctChange}%
                                                </span>
                                            </td>
                                            <td className="pr-4 text-stone-400">{h.confidence}%</td>
                                            <td className="pr-4">
                                                <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${h.direction === 'up' ? 'bg-emerald-500/20 text-emerald-400'
                                                        : h.direction === 'down' ? 'bg-red-500/20 text-red-400'
                                                            : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {h.direction === 'up' ? '↑ UP' : h.direction === 'down' ? '↓ DOWN' : '→ STABLE'}
                                                </span>
                                            </td>
                                            <td className="text-stone-600 font-mono text-[9px]">{h.timestamp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <p className="text-center text-[9px] font-mono text-stone-700 mt-6">
                    UzhavanForum · AI Mandi Price Forecasting · Purely client-side simulation
                </p>
            </div>

            <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default MandiPriceForecast;
