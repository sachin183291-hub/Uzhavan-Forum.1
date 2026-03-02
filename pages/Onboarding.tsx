
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.tsx';

const STATE_DISTRICTS: Record<string, string[]> = {
  'Kerala': ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul'],
};

const SOIL_TYPES = [
  { key: 'soil_black', icon: 'fa-vial' },
  { key: 'soil_red', icon: 'fa-vial' },
  { key: 'soil_alluvial', icon: 'fa-vial' },
  { key: 'soil_laterite', icon: 'fa-vial' },
  { key: 'soil_sandy', icon: 'fa-vial' },
  { key: 'soil_clay', icon: 'fa-vial' }
];

const IRRIGATION_METHODS = [
  { key: 'irr_drip', icon: 'fa-faucet-drip' },
  { key: 'irr_sprinkler', icon: 'fa-shower' },
  { key: 'irr_canal', icon: 'fa-water' },
  { key: 'irr_well', icon: 'fa-bore-hole' },
  { key: 'irr_rain', icon: 'fa-cloud-rain' }
];

const CROPS = [
  { key: 'crop_paddy', icon: 'fa-seedling' },
  { key: 'crop_rubber', icon: 'fa-tree' },
  { key: 'crop_coconut', icon: 'fa-tree' },
  { key: 'crop_pepper', icon: 'fa-leaf' },
  { key: 'crop_banana', icon: 'fa-leaf' },
  { key: 'crop_coffee', icon: 'fa-mug-hot' },
  { key: 'crop_arecanut', icon: 'fa-tree' },
  { key: 'crop_cardamom', icon: 'fa-leaf' },
  { key: 'crop_vegetables', icon: 'fa-carrot' },
  { key: 'crop_ginger', icon: 'fa-leaf' },
  { key: 'crop_turmeric', icon: 'fa-leaf' }
];

const Onboarding: React.FC = () => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    address: '',
    state: '',
    district: '',
    primaryCrop: CROPS[0].key,
    landSize: '',
    soilType: SOIL_TYPES[0].key,
    irrigationMethod: IRRIGATION_METHODS[0].key,
    experience: '5',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const phone = localStorage.getItem('currentUserPhone');
    if (!phone) {
      navigate('/login');
      return;
    }
    const stored = localStorage.getItem('farmerProfile');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.onboardingComplete) {
        navigate('/query');
      } else {
        setProfile(prev => ({ ...prev, ...parsed }));
      }
    }
  }, [navigate]);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = localStorage.getItem('currentUserPhone');
    if (!phone) return;

    const finalProfile = { 
      ...profile, 
      onboardingComplete: true, 
      onboardingDate: new Date().toISOString(),
      trustScore: 85,
      id: profile.id || `F-${Math.floor(Math.random() * 90000) + 10000}`
    };
    
    const users = JSON.parse(localStorage.getItem('farmers_db') || '{}');
    if (users[phone]) {
      users[phone].profile = finalProfile;
      localStorage.setItem('farmers_db', JSON.stringify(users));
      localStorage.setItem('farmerProfile', JSON.stringify(finalProfile));
      
      // Critical: Dispatch event so Navbar/Footer can update their visibility
      window.dispatchEvent(new Event('storage'));
      
      navigate('/query');
    }
  };

  const progressWidth = `${(step / 4) * 100}%`;

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col items-center justify-center py-12 px-4 transition-colors relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-emerald-500/5 rounded-full blur-[120px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>

      <div className="max-w-4xl w-full relative z-10">
        
        {/* Progress Bar Container */}
        <div className="mb-12 bg-white dark:bg-stone-900 p-8 rounded-[3rem] shadow-sm border border-stone-200/60 dark:border-stone-800">
           <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.4em]">{t('onboarding_step')} {step} / 4</span>
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-[0.4em]">{Math.round((step/4)*100)}% {t('onboarding_completed')}</span>
           </div>
           <div className="h-3 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                style={{ width: progressWidth }}
              ></div>
           </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-[4rem] shadow-3xl p-10 md:p-16 border border-stone-100 dark:border-stone-800 animate-fade-in">
          
          {step === 1 && (
            <div className="space-y-10 animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="heading-font text-5xl font-black text-stone-900 dark:text-stone-100 mb-4 tracking-tighter">{t('onboarding_identity_sync')}.</h2>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">{t('onboarding_start_digital_record')}</p>
              </div>
              <div className="space-y-6">
                <div className="relative group">
                   <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4">{t('onboarding_full_name')}</p>
                   <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                    className="w-full px-8 py-6 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-3xl outline-none font-bold text-xl focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-stone-100" 
                    placeholder={t('onboarding_example_name')}
                   />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="relative group">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4">{t('onboarding_age')}</p>
                      <input 
                        type="number" 
                        value={profile.age} 
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })} 
                        className="w-full px-8 py-6 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-3xl outline-none font-bold text-xl dark:text-stone-100"
                        placeholder="24"
                      />
                   </div>
                   <div className="relative group">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4">{t('onboarding_experience')}</p>
                      <input 
                        type="number" 
                        value={profile.experience} 
                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })} 
                        className="w-full px-8 py-6 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-3xl outline-none font-bold text-xl dark:text-stone-100"
                        placeholder="5"
                      />
                   </div>
                </div>
                <div className="relative group">
                   <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4">{t('onboarding_farm_address')}</p>
                   <textarea 
                    value={profile.address} 
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })} 
                    rows={3}
                    className="w-full px-8 py-6 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-3xl outline-none font-bold text-xl resize-none dark:text-stone-100"
                    placeholder={t('onboarding_address_placeholder')}
                   />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!profile.name || !profile.age} className="w-full bg-emerald-900 dark:bg-emerald-700 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                {t('onboarding_btn_location')} <i className="fas fa-arrow-right ml-4"></i>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="heading-font text-5xl font-black text-stone-900 dark:text-stone-100 mb-4 tracking-tighter">{t('onboarding_geo_center')}.</h2>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">{t('onboarding_sync_weather')}</p>
              </div>
              <div className="space-y-8">
                <div className="relative">
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-3 ml-4">{t('onboarding_state')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {Object.keys(STATE_DISTRICTS).map(s => (
                       <button 
                        key={s} 
                        onClick={() => setProfile({ ...profile, state: s, district: '' })}
                        className={`p-6 rounded-3xl border text-left transition-all ${profile.state === s ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-400 shadow-lg' : 'bg-stone-50 dark:bg-stone-950 border-stone-100 dark:border-stone-800 text-stone-400 hover:border-emerald-200'}`}
                       >
                         <i className={`fas fa-map-location-dot mr-3 ${profile.state === s ? 'text-emerald-500' : 'text-stone-300'}`}></i>
                         <span className="font-black tracking-tight">{s}</span>
                       </button>
                     ))}
                  </div>
                </div>

                {profile.state && (
                  <div className="animate-fade-in">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-3 ml-4">{t('onboarding_district')}</p>
                    <select 
                      value={profile.district} 
                      onChange={(e) => setProfile({ ...profile, district: e.target.value })} 
                      className="w-full px-8 py-6 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-3xl outline-none font-black text-xl dark:text-stone-100 appearance-none shadow-sm"
                    >
                      <option value="">{t('onboarding_select')}</option>
                      {(STATE_DISTRICTS[profile.state] || []).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => setStep(1)} className="px-10 py-7 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px]">{t('onboarding_btn_back')}</button>
                <button onClick={() => setStep(3)} disabled={!profile.state || !profile.district} className="flex-grow bg-emerald-900 dark:bg-emerald-700 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-black transition-all disabled:opacity-50">
                  {t('onboarding_agri_dna_profile')} <i className="fas fa-arrow-right ml-4"></i>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="heading-font text-5xl font-black text-stone-900 dark:text-stone-100 mb-4 tracking-tighter">{t('onboarding_agri_dna')}.</h2>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">{t('onboarding_define_genetics')}</p>
              </div>
              
              <div className="space-y-10">
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6 ml-4">{t('onboarding_primary_crop_cultivation')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                     {CROPS.map(crop => (
                       <button 
                        key={crop.key}
                        onClick={() => setProfile({...profile, primaryCrop: crop.key})}
                        className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] border transition-all ${profile.primaryCrop === crop.key ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-400 shadow-xl' : 'bg-stone-50 dark:bg-stone-950 border-stone-100 dark:border-stone-800 text-stone-400 hover:border-emerald-200'}`}
                       >
                         <i className={`fas ${crop.icon} text-2xl mb-3`}></i>
                         <span className="text-[10px] font-black uppercase tracking-widest">{t(crop.key)}</span>
                       </button>
                     ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6 ml-4">{t('onboarding_soil_profile')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {SOIL_TYPES.map(soil => (
                       <button 
                        key={soil.key}
                        onClick={() => setProfile({...profile, soilType: soil.key})}
                        className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${profile.soilType === soil.key ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-900 dark:text-blue-400 shadow-lg' : 'bg-stone-50 dark:bg-stone-950 border-stone-100 dark:border-stone-800 text-stone-400 hover:border-blue-200'}`}
                       >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile.soilType === soil.key ? 'bg-blue-100 text-blue-600' : 'bg-stone-100 text-stone-300'}`}>
                           <i className={`fas ${soil.icon}`}></i>
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest">{t(soil.key)}</span>
                       </button>
                     ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={() => setStep(2)} className="px-10 py-7 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px]">{t('onboarding_btn_back')}</button>
                <button onClick={() => setStep(4)} className="flex-grow bg-emerald-900 dark:bg-emerald-700 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-black transition-all">
                  {t('onboarding_btn_finalize')} <i className="fas fa-arrow-right ml-4"></i>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="heading-font text-5xl font-black text-stone-900 dark:text-stone-100 mb-4 tracking-tighter">{t('onboarding_operational_status')}.</h2>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">{t('onboarding_finalizing_management')}</p>
              </div>
              
              <div className="space-y-10">
                <div className="relative group">
                   <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-3 ml-4">{t('onboarding_total_land_size')}</p>
                   <div className="relative">
                      <input 
                        type="number" 
                        value={profile.landSize} 
                        onChange={(e) => setProfile({ ...profile, landSize: e.target.value })} 
                        className="w-full px-8 py-7 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-[2.5rem] outline-none font-black text-3xl dark:text-stone-100 pr-24" 
                        placeholder="0.00"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-stone-300 uppercase text-xs tracking-[0.2em]">{t('onboarding_acres')}</span>
                   </div>
                </div>

                <div>
                   <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-6 ml-4">{t('onboarding_irrigation_infrastructure')}</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {IRRIGATION_METHODS.map(irr => (
                        <button 
                          key={irr.key}
                          onClick={() => setProfile({...profile, irrigationMethod: irr.key})}
                          className={`flex items-center justify-between p-6 rounded-[2.5rem] border transition-all ${profile.irrigationMethod === irr.key ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-900 dark:text-amber-400 shadow-xl' : 'bg-stone-50 dark:bg-stone-950 border-stone-100 dark:border-stone-800 text-stone-400 hover:border-amber-200'}`}
                        >
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profile.irrigationMethod === irr.key ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-300'}`}>
                               <i className={`fas ${irr.icon} text-lg`}></i>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest">{t(irr.key)}</span>
                          </div>
                          {profile.irrigationMethod === irr.key && <i className="fas fa-circle-check text-amber-500"></i>}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="flex gap-4 pt-10">
                <button onClick={() => setStep(3)} className="px-10 py-7 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px]">{t('onboarding_btn_back')}</button>
                <button onClick={handleComplete} disabled={!profile.landSize} className="flex-grow bg-emerald-600 dark:bg-emerald-500 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-3xl hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                  {t('onboarding_btn_start_center')} <i className="fas fa-check-double ml-4"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Support Badge */}
        <div className="mt-12 text-center">
           <p className="text-[9px] font-black text-stone-400 dark:text-stone-600 uppercase tracking-[0.5em] mb-4">{t('onboarding_protected_badge')}</p>
           <div className="flex justify-center space-x-6 opacity-30">
              <i className="fas fa-shield-halved text-2xl"></i>
              <i className="fas fa-satellite text-2xl"></i>
              <i className="fas fa-tower-broadcast text-2xl"></i>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
