
import React, { useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { motion, useScroll, useTransform } from 'framer-motion';
import Guardian3DViewer from '../components/Guardian3DViewer.tsx';

const Guardian: React.FC = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const stats = [
    { value: '84%', label: 'Water Saved' },
    { value: '3×', label: 'Yield Increase' },
    { value: '24/7', label: 'Auto Monitoring' },
    { value: '₹3,999', label: 'Starting Price' },
  ];

  const scrollToPricing = useCallback(() => {
    document.getElementById('guardian-pricing')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollTo3D = useCallback(() => {
    document.getElementById('guardian-3d')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleContact = useCallback(() => {
    window.location.href = 'mailto:support@uzhavanforum.com?subject=AgriSense Enquiry';
  }, []);

  const features = [
    { icon: 'fa-microchip', title: t('guardian_feature_soil'), desc: 'Real-time capacitive soil measurement with ±2% accuracy across all soil types.' },
    { icon: 'fa-tint', title: t('guardian_feature_irrigation'), desc: 'AI-driven valve control based on crop type, weather, and soil data.' },
    { icon: 'fa-desktop', title: t('guardian_feature_dashboard'), desc: 'Beautiful real-time dashboard accessible from any device, anywhere.' },
    { icon: 'fa-mobile-alt', title: t('guardian_feature_mobile'), desc: 'Push alerts, remote control, and live charts from your smartphone.' },
    { icon: 'fa-leaf', title: t('guardian_feature_energy'), desc: 'Solar-powered with 72-hour battery backup. Truly off-grid ready.' },
    { icon: 'fa-tools', title: t('guardian_feature_install'), desc: 'Tool-free setup in under 20 minutes. No electrician required.' },
  ];

  const specs = [
    { label: 'MCU', value: 'ESP32 Dual-Core 240MHz' },
    { label: 'Soil Sensor', value: 'Capacitive, 0–100% RH' },
    { label: 'Environment', value: 'DHT22 Temp + Humidity' },
    { label: 'Power', value: 'Solar + Li-Ion 3600mAh' },
    { label: 'Connectivity', value: 'WiFi 802.11 b/g/n' },
    { label: 'Output', value: '5A Relay, Solenoid Support' },
  ];

  const benefits = [
    { icon: 'fa-droplet-slash', text: t('guardian_benefit_water') },
    { icon: 'fa-chart-line', text: t('guardian_benefit_yield') },
    { icon: 'fa-user-clock', text: t('guardian_benefit_effort') },
    { icon: 'fa-exclamation-triangle', text: t('guardian_benefit_stress') },
    { icon: 'fa-wallet', text: t('guardian_benefit_cost') },
  ];

  const steps = [
    { num: '01', title: 'Plant Installation', text: t('guardian_step_1') },
    { num: '02', title: 'WiFi Connect', text: t('guardian_step_2') },
    { num: '03', title: 'Sensor Calibration', text: t('guardian_step_3') },
    { num: '04', title: 'Set Thresholds', text: t('guardian_step_4') },
    { num: '05', title: 'Auto Mode', text: t('guardian_step_5') },
  ];

  const pricing = [
    { name: t('guardian_basic'), price: '₹3,999', features: ['ESP32 Core', 'Soil Sensor', 'WiFi Dashboard'] },
    { name: t('guardian_pro'), price: '₹5,499', features: ['Solar Support', 'DHT22 Sensor', 'Mobile App Access', 'Priority Support'], popular: true },
    { name: t('guardian_enterprise'), price: 'Custom', features: ['Multi-field Sync', 'API Access', 'On-site Installation', '24/7 Monitoring'] },
  ];

  return (
    <div className="bg-stone-950 text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO — Full-screen product cinematic
          ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-emerald-700/10 rounded-full blur-[100px]" />
        </div>

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#10b981 1px,transparent 1px),linear-gradient(90deg,#10b981 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-6xl mx-auto pt-24">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm mb-8">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">New Generation Smart Farming</span>
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="heading-font text-[clamp(4rem,12vw,10rem)] font-black leading-[0.85] tracking-tighter mb-8">
            <span className="block text-white">AGRISENSE</span>
            <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Smart Field
            </span>
            <span className="block text-white/20">System</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
            className="text-xl md:text-2xl text-stone-400 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('guardian_tagline')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center mb-20">
            <button onClick={scrollToPricing} className="group px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95">
              <span className="flex items-center gap-3">
                <i className="fas fa-shopping-cart" />
                {t('guardian_buy_now')}
              </span>
            </button>
            <button onClick={scrollTo3D} className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-sm rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95">
              <span className="flex items-center gap-3">
                <i className="fas fa-play-circle text-emerald-400" />
                Watch Demo
              </span>
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5 backdrop-blur-sm">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center py-8 px-4 bg-stone-950/60 hover:bg-emerald-950/30 transition-colors">
                <span className="text-3xl md:text-4xl font-black text-emerald-400 mb-1">{s.value}</span>
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-stone-600">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-stone-600 to-transparent" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          3-D INTERACTIVE — Centrepiece
          ══════════════════════════════════════════ */}
      <section id="guardian-3d" className="py-24 bg-stone-950 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-3 block">Interactive 3D Model</span>
            <h2 className="heading-font text-4xl md:text-6xl font-black tracking-tighter">
              Explore Every <span className="text-emerald-400">Component</span> of AgriSense
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <Guardian3DViewer />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRODUCT SHOWCASE — Split cinematic
          ══════════════════════════════════════════ */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[50vw] h-[80vh] bg-emerald-600/5 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left — spec icon grid instead of broken image */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative">
              <div className="absolute inset-8 bg-emerald-500/10 rounded-full blur-[60px]" />
              <div className="relative rounded-[3rem] border border-white/8 bg-white/[0.03] p-10 grid grid-cols-2 gap-4">
                {[
                  { icon: 'fa-seedling', label: 'Soil Moisture', val: '84%', color: 'emerald' },
                  { icon: 'fa-wifi', label: 'WiFi 2.4GHz', val: 'Online', color: 'blue' },
                  { icon: 'fa-thermometer-half', label: 'Temperature', val: '24°C', color: 'amber' },
                  { icon: 'fa-bolt', label: 'Solar Power', val: 'Active', color: 'yellow' },
                  { icon: 'fa-tint', label: 'Auto Pump', val: 'ON', color: 'cyan' },
                  { icon: 'fa-microchip', label: 'ESP32 MCU', val: 'Running', color: 'purple' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-4 transition-all group hover:bg-white/8">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-${s.color}-500/10`}>
                      <i className={`fas ${s.icon} text-${s.color}-400 text-sm`} />
                    </div>
                    <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest">{s.label}</p>
                    <p className="text-white font-black text-lg mt-0.5">{s.val}</p>
                  </div>
                ))}
              </div>
              {/* Pulsing active badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-stone-900 border border-emerald-500/30 backdrop-blur-sm px-5 py-2.5 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Active</span>
                </div>
              </div>
            </motion.div>

            {/* Right — copy */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Product Overview</span>
              <h2 className="heading-font text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
                {t('guardian_overview_title')}
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed mb-10">
                {t('guardian_overview_desc')}
              </p>

              {/* Live data cards */}
              <div className="space-y-3 mb-10">
                {[
                  { label: t('guardian_soil_moisture'), val: '84%', icon: 'fa-seedling' },
                  { label: t('guardian_temp_humidity'), val: '24°C / 62%', icon: 'fa-thermometer-half' },
                  { label: t('guardian_auto_motor'), val: 'Active', icon: 'fa-tint' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/8 border border-white/5 hover:border-emerald-500/20 rounded-2xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <i className={`fas ${item.icon} text-emerald-400 text-sm`} />
                      </div>
                      <span className="text-sm font-bold text-stone-300">{item.label}</span>
                    </div>
                    <span className="font-mono text-xs text-emerald-400 font-black uppercase bg-emerald-500/10 px-3 py-1 rounded-lg">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={scrollToPricing} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-xl shadow-emerald-500/20">
                  {t('guardian_buy_now')}
                </button>
                <button onClick={handleContact} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                  {t('guardian_contact_us')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — Dark card grid
          ══════════════════════════════════════════ */}
      <section className="py-32 bg-stone-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-3 block">What It Does</span>
              <h2 className="heading-font text-5xl md:text-8xl font-black tracking-tighter leading-none">
                {t('guardian_features_title')}
              </h2>
            </div>
            <p className="text-stone-500 text-lg font-light max-w-xs text-right">
              Precision engineering meets agricultural wisdom.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`group relative p-10 rounded-[2.5rem] border overflow-hidden transition-all duration-500 cursor-default hover:-translate-y-1 hover:shadow-2xl
                  ${i === 1
                    ? 'bg-emerald-500 border-emerald-400 text-stone-950 hover:shadow-emerald-500/20'
                    : 'bg-white/3 border-white/5 hover:border-emerald-500/20 hover:bg-white/5'
                  }`}>
                <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-7xl`}>
                  <i className={`fas ${f.icon}`} />
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl mb-8 group-hover:scale-110 transition-transform
                  ${i === 1 ? 'bg-stone-950/20 text-stone-950' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  <i className={`fas ${f.icon}`} />
                </div>
                <h3 className={`text-xl font-black mb-3 tracking-tight ${i === 1 ? 'text-stone-950' : 'text-white'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${i === 1 ? 'text-stone-800' : 'text-stone-500'}`}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — Numbered steps
          ══════════════════════════════════════════ */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-emerald-500/15 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Setup Journey</span>
              <h2 className="heading-font text-5xl md:text-8xl font-black tracking-tighter mb-16 leading-none">
                {t('guardian_how_it_works')}
              </h2>
              <div className="relative">
                {/* vertical line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500 via-emerald-500/30 to-transparent" />
                <div className="space-y-0">
                  {steps.map((s, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-8 py-6 group cursor-default">
                      {/* dot */}
                      <div className="w-10 h-10 rounded-full border-2 border-emerald-500/40 group-hover:border-emerald-500 group-hover:bg-emerald-500/10 flex items-center justify-center shrink-0 transition-all z-10 bg-black">
                        <span className="text-[10px] font-black text-emerald-400">{s.num}</span>
                      </div>
                      <div className="pt-1">
                        <h4 className="text-lg font-black text-white mb-1 group-hover:text-emerald-400 transition-colors">{s.title}</h4>
                        <p className="text-stone-500 text-sm leading-relaxed">{s.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — annotated product image */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative">

              {/* Ambient glow layers */}
              <div className="absolute inset-0 bg-emerald-500/12 rounded-full blur-[100px]" />
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-teal-500/10 rounded-full blur-[60px]" />

              {/* Main image card */}
              <div className="relative border border-emerald-500/20 p-6 rounded-[3rem] backdrop-blur-sm bg-gradient-to-b from-white/5 to-white/2 shadow-2xl shadow-emerald-900/30">

                {/* Top label bar */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em]">AgriSense Device</span>
                  </div>
                  <span className="text-stone-600 text-[9px] font-mono uppercase tracking-widest">v2.0 Pro</span>
                </div>

                {/* Product image */}
                <div className="relative">
                  <img
                    src="https://res.cloudinary.com/dwi2j4pju/image/upload/v1740230130/o5ftrg25rkdo9ccm97a1.png"
                    className="rounded-[2rem] w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(16,185,129,0.15)]"
                    alt="AgriSense Smart Irrigation Device"
                  />

                  {/* Step annotation badges — floating over the image */}
                  <div className="absolute top-[8%] left-[5%]">
                    <div className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-md border border-amber-500/40 rounded-xl px-3 py-1.5 shadow-lg">
                      <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-black text-amber-400">01</span>
                      </div>
                      <span className="text-[9px] font-black text-amber-300 uppercase tracking-wide whitespace-nowrap">Plant Install</span>
                    </div>
                  </div>

                  <div className="absolute top-[8%] right-[5%]">
                    <div className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-md border border-blue-500/40 rounded-xl px-3 py-1.5 shadow-lg">
                      <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-black text-blue-400">02</span>
                      </div>
                      <span className="text-[9px] font-black text-blue-300 uppercase tracking-wide whitespace-nowrap">WiFi Connect</span>
                    </div>
                  </div>

                  <div className="absolute top-[42%] right-[-2%]">
                    <div className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-md border border-purple-500/40 rounded-xl px-3 py-1.5 shadow-lg">
                      <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-black text-purple-400">03</span>
                      </div>
                      <span className="text-[9px] font-black text-purple-300 uppercase tracking-wide whitespace-nowrap">Calibrate</span>
                    </div>
                  </div>

                  <div className="absolute bottom-[22%] left-[2%]">
                    <div className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-md border border-emerald-500/40 rounded-xl px-3 py-1.5 shadow-lg">
                      <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-black text-emerald-400">04</span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-300 uppercase tracking-wide whitespace-nowrap">Set Threshold</span>
                    </div>
                  </div>

                  <div className="absolute bottom-[5%] right-[8%]">
                    <div className="flex items-center gap-2 bg-emerald-600/90 backdrop-blur-md border border-emerald-400/60 rounded-xl px-3 py-1.5 shadow-lg shadow-emerald-500/20">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse flex-shrink-0" />
                      <span className="text-[9px] font-black text-emerald-100 uppercase tracking-wide whitespace-nowrap">05 Auto Mode ✓</span>
                    </div>
                  </div>
                </div>

                {/* Bottom live status strip */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Soil', val: '78%', icon: 'fa-seedling', color: 'text-emerald-400' },
                    { label: 'Temp', val: '27°C', icon: 'fa-thermometer-half', color: 'text-orange-400' },
                    { label: 'Pump', val: 'ON', icon: 'fa-tint', color: 'text-blue-400' },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center py-2 px-3 bg-stone-900/60 border border-white/5 rounded-xl">
                      <i className={`fas ${s.icon} ${s.color} text-xs mb-1`} />
                      <span className={`font-black text-sm ${s.color}`}>{s.val}</span>
                      <span className="text-stone-600 text-[8px] uppercase tracking-widest">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom corner badge */}
              <div className="absolute -bottom-4 -left-4 bg-stone-900 border border-white/10 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 backdrop-blur-sm">
                <i className="fas fa-wifi text-emerald-400 text-sm" />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">System Active</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SPECS + BENEFITS — Two-column
          ══════════════════════════════════════════ */}
      <section className="py-32 bg-stone-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-3 block">Under the Hood</span>
            <h2 className="heading-font text-5xl md:text-7xl font-black tracking-tighter">
              {t('guardian_tech_specs')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Specs table */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-white/3 border border-white/5 rounded-[2.5rem] overflow-hidden">
              <div className="px-10 py-8 border-b border-white/5">
                <h3 className="font-black text-xs uppercase tracking-[0.25em] text-emerald-400">Technical Specifications</h3>
              </div>
              <div className="divide-y divide-white/5">
                {specs.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-10 py-5 hover:bg-white/3 transition-colors group">
                    <span className="font-mono text-xs uppercase tracking-widest text-stone-500 group-hover:text-stone-400 transition-colors">{s.label}</span>
                    <span className="font-bold text-sm text-right text-stone-200">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex flex-col gap-4">
              <div className="px-2 pb-4">
                <h3 className="font-black text-xs uppercase tracking-[0.25em] text-emerald-400">{t('guardian_benefits')}</h3>
              </div>
              {benefits.map((b, i) => (
                <motion.div key={i} whileHover={{ x: 8, scale: 1.01 }}
                  className="flex items-center gap-5 p-6 bg-white/3 hover:bg-emerald-500/8 border border-white/5 hover:border-emerald-500/20 rounded-2xl transition-all cursor-default group">
                  <div className="w-12 h-12 bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 transition-colors">
                    <i className={`fas ${b.icon}`} />
                  </div>
                  <span className="font-black text-stone-200 tracking-tight">{b.text}</span>
                  <i className="fas fa-arrow-right ml-auto text-stone-700 group-hover:text-emerald-400 transition-colors text-sm" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ANATOMY — Component breakdown
          ══════════════════════════════════════════ */}
      <section className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Component Breakdown</span>
              <h2 className="heading-font text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
                Anatomy of the <span className="text-emerald-400">AgriSense</span>
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed mb-10">
                Every component is selected for durability and precision. From the high-efficiency solar panels to the industrial-grade sensors, the Guardian is built to last.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['Solar Panel', 'LCD Display', 'Sensor Box', 'Soil Moisture Sensor', 'Water Sprinkler', 'Stand'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white/3 hover:bg-emerald-500/8 border border-white/5 hover:border-emerald-500/20 rounded-2xl transition-all group cursor-default">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:scale-150 transition-transform" />
                    <span className="text-sm font-bold text-stone-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative">
              <div className="absolute inset-0 bg-emerald-500/8 rounded-full blur-[80px]" />
              <div className="relative p-8 bg-white/2 rounded-[3rem] border border-white/5 shadow-inner">
                <img
                  src="https://res.cloudinary.com/dwi2j4pju/image/upload/v1740230130/o5ftrg25rkdo9ccm97a1.png"
                  alt="AgriSense Component Breakdown"
                  className="w-full h-auto object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING — Premium cards
          ══════════════════════════════════════════ */}
      <section id="guardian-pricing" className="py-32 bg-stone-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-3 block">Simple Pricing</span>
            <h2 className="heading-font text-5xl md:text-8xl font-black tracking-tighter mb-4">
              {t('guardian_pricing')}
            </h2>
            <p className="text-stone-500 text-lg font-light">Flexible solutions for every scale of agriculture.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {pricing.map((p, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-[2.5rem] border overflow-hidden transition-all duration-500 hover:-translate-y-2
                  ${p.popular
                    ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-900/10 border-emerald-500/40 shadow-2xl shadow-emerald-500/10 scale-105'
                    : 'bg-white/3 border-white/5 hover:border-white/10'
                  }`}>
                {p.popular && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                )}
                {p.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-stone-950 text-[9px] font-black px-5 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/30">
                    Most Popular
                  </div>
                )}
                <div className="p-10">
                  <h3 className="text-2xl font-black mb-2 tracking-tight text-white">{p.name}</h3>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className={`text-5xl font-black ${p.popular ? 'text-emerald-400' : 'text-white'}`}>{p.price}</span>
                    {p.price !== 'Custom' && <span className="text-stone-500 text-sm font-bold">/ unit</span>}
                  </div>
                  <div className="w-12 h-0.5 bg-emerald-500/40 mb-8 rounded-full" />
                  <ul className="space-y-4 mb-10">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${p.popular ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-stone-400'}`}>
                          <i className="fas fa-check text-[8px]" />
                        </div>
                        <span className={p.popular ? 'text-stone-200' : 'text-stone-400'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={p.price === 'Custom' ? handleContact : scrollToPricing}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all hover:scale-105 active:scale-95
                    ${p.popular
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-xl shadow-emerald-500/20'
                        : 'bg-white/8 hover:bg-white/12 text-white border border-white/10'
                      }`}>
                    {p.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA — Bold full-bleed
          ══════════════════════════════════════════ */}
      <section className="relative py-40 overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1600"
            className="w-full h-full object-cover opacity-20"
            alt="Farm field"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-3xl">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-6 block">Get Yours Today</span>
            <h2 className="heading-font text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85]">
              {t('guardian_cta')}
            </h2>
            <p className="text-stone-400 text-xl font-light mb-12 leading-relaxed">
              Join the thousands of farmers already optimizing their yields with Uzhavan technology. Backed by 1-year warranty and free installation support.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={scrollToPricing} className="group px-14 py-6 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-2xl shadow-emerald-500/30">
                <span className="flex items-center gap-3">
                  {t('guardian_buy_now')}
                  <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button onClick={handleContact} className="px-14 py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-sm transition-all">
                {t('guardian_contact_us')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Guardian;
