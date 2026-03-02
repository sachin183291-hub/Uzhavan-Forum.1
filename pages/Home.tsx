
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.tsx';
import Guardian3DViewer from '../components/Guardian3DViewer.tsx';

const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen transition-colors duration-300">
      {/* Immersive Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920"
            alt="Vibrant field"
            className="w-full h-full object-cover brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/90 via-emerald-950/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-3 bg-emerald-500/10 backdrop-blur-2xl border border-emerald-400/30 px-6 py-2.5 rounded-full mb-10 animate-fade-in shadow-2xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-100">{t('home_ai_center')}</span>
            </div>

            <h1 className="heading-font text-5xl md:text-[10rem] font-bold text-white mb-10 leading-[0.85] tracking-tighter">
              {t('hero_title_1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-200">{t('hero_title_2')}</span>
            </h1>

            <p className="text-xl md:text-3xl text-stone-200/80 mb-16 max-w-2xl leading-snug font-light">
              {t('hero_subtitle')}
            </p>

            <div className="flex flex-wrap gap-8">
              <Link
                to="/login"
                className="group bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-14 py-7 rounded-[2rem] font-black transition-all shadow-3xl shadow-emerald-500/20 flex items-center space-x-5 active:scale-95"
              >
                <span className="text-lg uppercase tracking-widest">{t('btn_login')}</span>
                <i className="fas fa-chevron-right group-hover:translate-x-2 transition-transform"></i>
              </Link>
              <Link
                to="/about"
                className="bg-white/5 backdrop-blur-xl hover:bg-white/10 text-white border border-white/20 px-12 py-7 rounded-[2rem] font-black text-lg transition-all tracking-widest uppercase active:scale-95"
              >
                {t('btn_strategy')}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <i className="fas fa-chevron-down text-white text-2xl"></i>
        </div>
      </section>

      {/* Feature Architecture — Meet the Guardian */}
      <section className="py-40 bg-stone-50 dark:bg-stone-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <div className="inline-block px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
                New Hardware
              </div>
              <h2 className="heading-font text-5xl md:text-7xl font-black tracking-tighter leading-none dark:text-white">
                Meet the <span className="text-emerald-600">Guardian</span>
              </h2>
              <p className="text-xl text-stone-500 dark:text-stone-400 font-light max-w-xl">
                Our flagship IoT device for precision irrigation. Real-time soil monitoring, automatic motor control, and solar autonomy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-stone-800 p-8 rounded-[2.5rem] border border-stone-200/60 dark:border-stone-700/60 shadow-sm transition-colors duration-300 group hover:border-emerald-500/50">
                  <div className="text-emerald-600 mb-4 text-2xl group-hover:scale-110 transition-transform"><i className="fas fa-vial"></i></div>
                  <h5 className="font-bold text-lg mb-2 dark:text-stone-100">{t('soil_specific')}</h5>
                  <p className="text-xs text-stone-400 leading-relaxed">Tailored advice based on pH, nitrogen, and drainage records from your profile.</p>
                </div>
                <div className="bg-white dark:bg-stone-800 p-8 rounded-[2.5rem] border border-stone-200/60 dark:border-stone-700/60 shadow-sm transition-colors duration-300 group hover:border-emerald-500/50">
                  <div className="text-emerald-600 mb-4 text-2xl group-hover:scale-110 transition-transform"><i className="fas fa-cloud-sun"></i></div>
                  <h5 className="font-bold text-lg mb-2 dark:text-stone-100">{t('micro_climate')}</h5>
                  <p className="text-xs text-stone-400 leading-relaxed">Live local atmospheric data used to suggest irrigation timing and pesticide application.</p>
                </div>
              </div>
              <Link to="/guardian" className="inline-flex items-center space-x-4 text-emerald-600 font-black uppercase tracking-widest text-xs group">
                <span>Explore Guardian Technology</span>
                <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
              </Link>
            </div>

            {/* ── Interactive 3D Model Card ── */}
            <div className="relative">
              {/* Ambient glow */}
              <div className="absolute inset-0 bg-emerald-500 rounded-[3rem] blur-[100px] opacity-10" />

              {/* Dark card wrapping the 3D viewer */}
              <div className="relative rounded-[2.5rem] bg-gradient-to-b from-stone-900 to-stone-950 border border-emerald-500/20 shadow-2xl shadow-emerald-900/30 overflow-hidden">

                {/* Top label bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em]">Interactive 3D Model</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                </div>

                {/* 3D Viewer — full width */}
                <div className="w-full">
                  <Guardian3DViewer />
                </div>

                {/* Bottom hint bar */}
                <div className="flex items-center justify-center gap-2 px-6 py-3 border-t border-white/5 bg-black/30">
                  <i className="fas fa-mouse-pointer text-stone-500 text-xs" />
                  <span className="text-stone-500 text-[9px] font-bold uppercase tracking-widest">Click to interact &middot; Drag to rotate &middot; Scroll to zoom</span>
                </div>
              </div>

              {/* "Made in India" corner badge */}
              <div className="absolute -bottom-3 -left-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                <span className="text-lg">🇮🇳</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-600 dark:text-stone-400">Made in India</span>
              </div>

              {/* Price badge */}
              <div className="absolute -top-4 -right-2 bg-emerald-500 text-stone-950 px-4 py-2 rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center gap-1.5 font-black text-sm">
                <i className="fas fa-tag text-xs" />
                &#8377;3,999
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── AI Mandi Price Forecasting Feature Card ── */}
      <section className="py-28 bg-stone-50 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-4">
              AI Powered · No API
            </div>
            <h2 className="heading-font text-5xl md:text-7xl font-black tracking-tighter leading-none dark:text-white">
              Mandi <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Price AI</span>
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-lg font-light max-w-xl mx-auto mt-6">
              Predict next-week market prices for paddy, wheat, tomato & more — 100% local, no internet needed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '📈', title: 'Trend Analysis', desc: 'Computes week-over-week price momentum from 6 weeks of historical data.' },
              { icon: '🎯', title: 'Confidence Score', desc: 'AI-style confidence level based on price variance and consistency.' },
              { icon: '💾', title: 'Forecast History', desc: 'Every prediction auto-saved to localStorage for future reference.' },
            ].map(f => (
              <div key={f.title} className="bg-white dark:bg-stone-800 p-8 rounded-[2.5rem] border border-stone-200/60 dark:border-stone-700/60 shadow-sm group hover:border-emerald-500/50 transition-all duration-300">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h5 className="font-bold text-lg mb-2 dark:text-stone-100">{f.title}</h5>
                <p className="text-xs text-stone-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/mandi-forecast"
              className="inline-flex items-center gap-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-14 py-7 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span>Open Mandi Price AI</span>
              <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* Founder Spotlight Section */}
      <section className="py-40 bg-white dark:bg-stone-950 transition-colors duration-300 border-t border-stone-100 dark:border-stone-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 opacity-40"></div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[80px] opacity-10 scale-125"></div>
            <div className="w-64 h-64 md:w-80 md:h-80 relative rounded-full p-2 bg-gradient-to-tr from-emerald-500 to-lime-400 shadow-2xl group hover:scale-[1.05] transition-transform duration-700">
              <img
                src="https://res.cloudinary.com/dwi2j4pju/image/upload/v1770999560/y5ftrg25rkdo9ccm97a1.jpg"
                alt="Sachin S - Founder"
                className="w-full h-full object-cover object-top rounded-full border-4 border-white dark:border-stone-950 transition-all duration-700"
              />
              <div className="absolute inset-0 rounded-full bg-emerald-500/5 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
            </div>
          </div>

          <div className="space-y-6 animate-fade-in max-w-4xl">
            <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.5em] mb-4">{t('founder_label')}</h4>
            <h3 className="heading-font text-6xl md:text-8xl font-black text-stone-900 dark:text-stone-100 tracking-tighter mb-10">SACHIN S</h3>
            <div className="w-24 h-1.5 bg-emerald-500 mx-auto rounded-full mb-14 shadow-lg shadow-emerald-500/30"></div>
            <p className="text-stone-700 dark:text-stone-300 font-bold leading-relaxed italic text-2xl md:text-4xl tracking-tight max-w-4xl mx-auto">
              "Building the digital infrastructure for Bharat's agricultural renaissance. Every query we answer is a step towards a more resilient farming community."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
