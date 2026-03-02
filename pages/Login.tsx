
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.tsx';

/* ── Fixed credentials ── */
const FIXED_OFFICER_ID = 'officer_admin';
const FIXED_OFFICER_PASS = 'sachin123';

enum TabRole {
  Farmer = 'Farmer',
  Officer = 'Officer',
  Irrigation = 'Irrigation',
}

/* ═══════════════════════════════════════════
   MAIN LOGIN COMPONENT
═══════════════════════════════════════════ */
const Login: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  /* tab state */
  const [role, setRole] = useState<TabRole>(TabRole.Farmer);
  const [formData, setForm] = useState({ phone: '', password: '' });
  const [irrigUsername, setIrrigUsername] = useState('');
  const [showPass, setShow] = useState(false);
  const [isLoading, setLoad] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProg] = useState(0);

  /* init DB */
  useEffect(() => {
    if (!localStorage.getItem('farmers_db')) localStorage.setItem('farmers_db', JSON.stringify({}));
  }, []);

  /* reset errors on tab switch */
  const switchTab = (r: TabRole) => {
    setRole(r);
    setError('');
    setForm({ phone: '', password: '' });
    setIrrigUsername('');
  };

  /* ── Irrigation login (username only, no password) ── */
  const handleIrrigationLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const name = irrigUsername.trim();
    if (!name) { setError('Please enter your username.'); return; }
    setLoad(true);
    setTimeout(() => {
      localStorage.setItem('esp32_user', name);
      setLoad(false);
      navigate('/smart-irrigation-dashboard');
    }, 700);
  };

  /* progress bar */
  useEffect(() => {
    if (!isLoading) { setProg(0); return; }
    const i = setInterval(() => setProg(v => Math.min(v + Math.random() * 12, 90)), 120);
    return () => clearInterval(i);
  }, [isLoading]);

  /* ── Standard login (Farmer / Officer) ── */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { phone, password } = formData;
    if (!phone || !password) { setError('All credentials are required.'); return; }
    setLoad(true);
    setTimeout(() => {
      if (role === 'Officer') {
        if (phone === FIXED_OFFICER_ID && password === FIXED_OFFICER_PASS) {
          localStorage.setItem('userRole', 'Officer');
          window.dispatchEvent(new Event('storage'));
          setLoad(false);
          navigate('/dashboard');
        } else {
          setLoad(false);
          setError('Invalid Officer authentication code.');
        }
        return;
      }
      // Farmer
      const users = JSON.parse(localStorage.getItem('farmers_db') || '{}');
      let curUser = users[phone];
      if (!curUser) {
        const newProfile = { id: `F-${Math.floor(Math.random() * 90000) + 10000}`, name: '', age: '', address: '', primaryCrop: 'crop_paddy', landSize: '', soilType: 'soil_alluvial', irrigationMethod: 'irr_drip', experience: '5', state: '', district: '', onboardingDate: new Date().toISOString(), trustScore: 85, onboardingComplete: false };
        curUser = { password, profile: newProfile };
        users[phone] = curUser;
        localStorage.setItem('farmers_db', JSON.stringify(users));
        localStorage.setItem('userRole', 'Farmer');
        localStorage.setItem('currentUserPhone', phone);
        localStorage.setItem('farmerProfile', JSON.stringify(newProfile));
        window.dispatchEvent(new Event('storage'));
        setLoad(false);
        navigate('/onboarding');
      } else {
        if (curUser.password === password) {
          localStorage.setItem('userRole', 'Farmer');
          localStorage.setItem('currentUserPhone', phone);
          localStorage.setItem('farmerProfile', JSON.stringify(curUser.profile));
          window.dispatchEvent(new Event('storage'));
          setLoad(false);
          navigate(curUser.profile.onboardingComplete ? '/query' : '/onboarding');
        } else {
          setLoad(false);
          setError('Authentication failed. Incorrect PIN/Password.');
        }
      }
    }, 1000);
  };

  const accentColor = role === TabRole.Irrigation ? 'from-cyan-600 to-blue-700' : 'from-emerald-600 to-emerald-800';

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden transition-all duration-700 bg-stone-100 dark:bg-stone-950`}
    >
      {/* ── Background glows ── */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-emerald-600/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-600/5 rounded-full blur-[100px] -ml-32 -mb-32" />

      {/* ════════════════════════════════════
          CARD
      ════════════════════════════════════ */}
      <div className={`max-w-md w-full relative z-10 transition-all duration-500`}>

        {/* Progress bar (top of card) */}
        {isLoading && (
          <div className="absolute -top-1 left-0 h-0.5 rounded-full z-20 transition-all duration-200"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#10b981,#059669)' }} />
        )}

        <div className={`relative w-full rounded-[3rem] overflow-hidden shadow-2xl border transition-all duration-500 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800`}>

          {/* Top gradient line */}
          <div className={`h-px w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent`} />

          <div className="p-8 md:p-12">

            {/* ── LOGO + TITLE ── */}
            <div className="text-center mb-8">
              <div className={`mx-auto h-20 w-20 rounded-[2.2rem] flex items-center justify-center mb-5 shadow-2xl rotate-3 hover:rotate-0 transition-transform cursor-pointer bg-gradient-to-br ${accentColor}`}>
                <i className={`text-white text-3xl fas fa-leaf`} />
              </div>
              <h1 className={`text-5xl font-black tracking-tighter mb-2 heading-font text-stone-900 dark:text-stone-100`}>
                {t('login_title')}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500`} />
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 dark:text-stone-500`}>
                  {t('login_subtitle')}
                </p>
              </div>
            </div>

            {/* ═════════ 3-TAB SWITCHER ═════════ */}
            <div className={`flex p-1.5 rounded-[2rem] mb-8 border shadow-inner bg-stone-100 dark:bg-stone-950 border-stone-200 dark:border-stone-800`}>
              {([TabRole.Farmer, TabRole.Officer] as TabRole[]).map(tab => {
                const active = role === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => switchTab(tab as TabRole)}
                    className={`flex-1 py-3.5 text-[8px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center justify-center gap-1.5 ${active
                      ? 'bg-white dark:bg-stone-800 text-emerald-900 dark:text-emerald-400 shadow-xl'
                      : 'text-stone-400 dark:text-stone-600 hover:text-stone-500'
                      }`}
                  >
                    <i className={`fas text-[9px] ${tab === TabRole.Farmer ? 'fa-seedling' : 'fa-shield-halved'}`} />
                    {tab}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => switchTab(TabRole.Irrigation)}
                className={`flex-1 py-3.5 text-[8px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center justify-center gap-1.5 ${role === TabRole.Irrigation
                  ? 'bg-white dark:bg-stone-800 text-cyan-700 dark:text-cyan-400 shadow-xl'
                  : 'text-stone-400 dark:text-stone-600 hover:text-stone-500'
                  }`}
              >
                <i className="fas text-[9px] fa-droplet" />
                Irrigation
              </button>
            </div>

            {/* ═══════════════════════════════════════
                IRRIGATION PANEL (username only)
            ════════════════════════════════════════ */}
            {role === TabRole.Irrigation && (
              <form className="space-y-5" onSubmit={handleIrrigationLogin}>
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-5 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                    <i className="fas fa-circle-exclamation" /> {error}
                  </div>
                )}
                <div className="relative group">
                  <i className="fas fa-user absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-700 group-focus-within:text-cyan-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={irrigUsername}
                    onChange={e => setIrrigUsername(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-[2.2rem] text-stone-900 dark:text-stone-100 outline-none focus:ring-4 focus:ring-cyan-500/10 font-bold text-sm transition-all"
                    placeholder="Enter your name or username"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center min-h-[66px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Connecting…</span>
                    </div>
                  ) : 'Open Irrigation Dashboard'}
                </button>
                <p className="text-[8px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest text-center px-4 leading-relaxed opacity-60">
                  No password required · Enter any username to access
                </p>
              </form>
            )}

            {/* ═══════════════════════════════════════
                FARMER / OFFICER PANEL
            ════════════════════════════════════════ */}
            {role !== TabRole.Irrigation && <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-5 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                  <i className="fas fa-circle-exclamation" /> {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="relative group">
                  <i className="fas fa-id-card absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-700 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setForm({ ...formData, phone: e.target.value })}
                    className="w-full pl-14 pr-5 py-5 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-[2.2rem] text-stone-900 dark:text-stone-100 outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-sm transition-all"
                    placeholder={role === TabRole.Farmer ? t('login_placeholder_phone') : 'Officer ID'}
                  />
                </div>
                <div className="relative group">
                  <i className="fas fa-lock-keyhole absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-700 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={e => setForm({ ...formData, password: e.target.value })}
                    className="w-full pl-14 pr-12 py-5 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-[2.2rem] text-stone-900 dark:text-stone-100 outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-sm transition-all"
                    placeholder={t('login_placeholder_pass')}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(v => !v)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                  >
                    <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 bg-emerald-900 dark:bg-emerald-700 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center min-h-[66px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Syncing…</span>
                    </div>
                  ) : t('login_btn_enter')}
                </button>
                <p className="text-[8px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest text-center px-4 leading-relaxed opacity-60">
                  {role === 'Farmer'
                    ? 'New users will be automatically registered into the Krishi Network upon first visit.'
                    : 'Restricted to certified agricultural officers with authorized credentials.'}
                </p>
              </div>
            </form>}
          </div>

          {/* Bottom accent line */}
          <div className={`h-px w-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent`} />
        </div>

        {/* Below-card caption */}
        <p className={`text-center text-[9px] font-mono mt-4 text-stone-400 dark:text-stone-700`}>
          UzhavanForum · Secure Farmer & Officer Portal
        </p>
      </div>
    </div>
  );
};

export default Login;
