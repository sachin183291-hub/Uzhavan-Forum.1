
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmerProfile } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

// ─── Voice Input Hook ────────────────────────────────────────────────
function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback((fieldName: string, onResult: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('உங்கள் browser-ல் Voice Input support இல்லை. Chrome browser use பண்ணுங்கள்.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ta-IN'; // Tamil voice recognition
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setActiveField(fieldName);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
      setActiveField(null);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setActiveField(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setActiveField(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setActiveField(null);
  }, []);

  return { isListening, activeField, startListening, stopListening };
}

// ─── Voice Select Hook (for dropdowns) ──────────────────────────────
function useVoiceSelect() {
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startSelectListening = useCallback((
    fieldName: string,
    options: { value: string; label: string }[],
    onSelect: (value: string, label: string) => void
  ) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) recognitionRef.current.stop();

    const recognition = new SpeechRecognition();
    recognition.lang = 'ta-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setActiveField(fieldName);
    };

    recognition.onresult = (event: any) => {
      // Try all alternatives to find best match
      for (let alt = 0; alt < event.results[0].length; alt++) {
        const spoken = event.results[0][alt].transcript.toLowerCase().trim();
        // Find matching option
        const matched = options.find(opt =>
          opt.label.toLowerCase().includes(spoken) ||
          spoken.includes(opt.label.toLowerCase()) ||
          opt.value.toLowerCase().includes(spoken)
        );
        if (matched) {
          onSelect(matched.value, matched.label);
          break;
        }
      }
      setIsListening(false);
      setActiveField(null);
    };

    recognition.onerror = () => { setIsListening(false); setActiveField(null); };
    recognition.onend = () => { setIsListening(false); setActiveField(null); };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  return { isListening, activeField, startSelectListening };
}

// ─── Mic Button Component ────────────────────────────────────────────
const MicButton: React.FC<{
  fieldName: string;
  isActive: boolean;
  onClick: () => void;
  title?: string;
}> = ({ fieldName, isActive, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title || 'பேசுங்கள்'}
    className={`
      absolute right-4 top-1/2 -translate-y-1/2 z-10
      w-11 h-11 rounded-2xl flex items-center justify-center
      transition-all duration-300 shadow-lg
      ${isActive
        ? 'bg-red-500 text-white scale-110 shadow-red-500/40 shadow-xl'
        : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105'
      }
    `}
  >
    <i className={`fas ${isActive ? 'fa-stop text-sm animate-pulse' : 'fa-microphone text-sm'}`}></i>
    {isActive && (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
    )}
  </button>
);

// ─── Voice Status Banner ─────────────────────────────────────────────
const VoiceStatusBanner: React.FC<{ isListening: boolean; activeField: string | null }> = ({
  isListening,
  activeField,
}) => {
  if (!isListening) return null;

  const fieldLabels: Record<string, string> = {
    name: 'பெயர்',
    age: 'வயது',
    experience: 'அனுபவம்',
    address: 'முகவரி',
    landSize: 'நிலம் அளவு',
    primaryCrop: 'பயிர் வகை',
    irrigationMethod: 'நீர்ப்பாசன முறை',
    soilType: 'மண் வகை',
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-stone-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-emerald-500/30">
        {/* Animated waveform */}
        <div className="flex items-end gap-1 h-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-emerald-400 rounded-full"
              style={{
                animation: `voiceBar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                height: `${8 + i * 4}px`,
              }}
            />
          ))}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
            🎤 கேட்கிறேன்...
          </p>
          {activeField && (
            <p className="text-sm font-bold text-stone-300">
              "{fieldLabels[activeField] || activeField}" field-க்கு பேசுங்கள்
            </p>
          )}
        </div>
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse ml-2" />
      </div>

      <style>{`
        @keyframes voiceBar {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────
const Profile: React.FC = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const { isListening: isVoiceListening, activeField: voiceField, startListening, stopListening } = useVoiceInput();
  const { isListening: isSelectListening, activeField: selectField, startSelectListening } = useVoiceSelect();

  const isAnyListening = isVoiceListening || isSelectListening;
  const currentActiveField = voiceField || selectField;

  useEffect(() => {
    const profileStr = localStorage.getItem('farmerProfile');
    const role = localStorage.getItem('userRole');
    if (!role || role !== 'Farmer') {
      navigate('/login');
      return;
    }
    if (profileStr) {
      const parsed = JSON.parse(profileStr);
      setProfile(parsed);
      setEditedProfile(parsed);
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

  const handleSave = () => {
    if (!editedProfile) return;
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('farmerProfile', JSON.stringify(editedProfile));
      const phone = localStorage.getItem('currentUserPhone');
      if (phone) {
        const users = JSON.parse(localStorage.getItem('farmers_db') || '{}');
        if (users[phone]) {
          users[phone].profile = editedProfile;
          localStorage.setItem('farmers_db', JSON.stringify(users));
        }
      }
      setProfile(editedProfile);
      setIsEditing(false);
      setIsSaving(false);
      window.dispatchEvent(new Event('storage'));
    }, 1200);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  // Voice input for text fields
  const handleVoiceMic = (fieldName: string) => {
    if (isVoiceListening && voiceField === fieldName) {
      stopListening();
      return;
    }
    startListening(fieldName, (text) => {
      // For numeric fields, parse numbers
      if (fieldName === 'age' || fieldName === 'experience' || fieldName === 'landSize') {
        const num = text.replace(/[^0-9]/g, '');
        if (num) handleInputChange(fieldName, num);
      } else {
        handleInputChange(fieldName, text);
      }
    });
  };

  // Crop options for voice select
  const cropOptions = [
    { value: 'crop_paddy', label: t('crop_paddy') || 'Paddy' },
    { value: 'crop_rubber', label: t('crop_rubber') || 'Rubber' },
    { value: 'crop_coconut', label: t('crop_coconut') || 'Coconut' },
    { value: 'crop_pepper', label: t('crop_pepper') || 'Pepper' },
    { value: 'crop_banana', label: t('crop_banana') || 'Banana' },
    { value: 'crop_coffee', label: t('crop_coffee') || 'Coffee' },
    { value: 'crop_arecanut', label: t('crop_arecanut') || 'Arecanut' },
    { value: 'crop_cardamom', label: t('crop_cardamom') || 'Cardamom' },
    { value: 'crop_vegetables', label: t('crop_vegetables') || 'Vegetables' },
    { value: 'crop_ginger', label: t('crop_ginger') || 'Ginger' },
    { value: 'crop_turmeric', label: t('crop_turmeric') || 'Turmeric' },
  ];

  const irrigationOptions = [
    { value: 'irr_drip', label: t('irr_drip') || 'Drip' },
    { value: 'irr_sprinkler', label: t('irr_sprinkler') || 'Sprinkler' },
    { value: 'irr_canal', label: t('irr_canal') || 'Canal' },
    { value: 'irr_well', label: t('irr_well') || 'Well' },
    { value: 'irr_rain', label: t('irr_rain') || 'Rain' },
  ];

  const soilOptions = [
    { value: 'soil_red', label: t('soil_red') || 'Red Soil' },
    { value: 'soil_black', label: t('soil_black') || 'Black Soil' },
    { value: 'soil_clay', label: t('soil_clay') || 'Clay' },
    { value: 'soil_loamy', label: t('soil_loamy') || 'Loamy' },
    { value: 'soil_sandy', label: t('soil_sandy') || 'Sandy' },
  ];

  if (!profile || !editedProfile) return null;

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-10 px-4 transition-colors duration-500 overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-emerald-500/5 rounded-full blur-[120px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[100px] -ml-20 -mb-20" />

      {/* Global Voice Status Banner */}
      <VoiceStatusBanner isListening={isAnyListening} activeField={currentActiveField} />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 animate-fade-in">
          <div>
            <div className="inline-flex items-center space-x-3 bg-white dark:bg-stone-900 px-4 py-2 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{t('profile_registry')}</span>
            </div>
            <h1 className="heading-font text-6xl md:text-8xl font-black text-stone-900 dark:text-stone-100 tracking-tighter leading-none">
              {isEditing ? 'Syncing' : 'Farmer'} <span className="text-emerald-600">Profile.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Voice mode indicator while editing */}
            {isEditing && (
              <div className="hidden md:flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-end gap-0.5 h-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-500 rounded-full opacity-60"
                      style={{
                        height: `${6 + i * 3}px`,
                        animation: isAnyListening ? `voiceBar 0.5s ease-in-out ${i * 0.12}s infinite alternate` : 'none',
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                  🎤 Voice Mode ON
                </span>
              </div>
            )}

            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest text-stone-400 hover:text-stone-600 transition-all"
                >
                  {t('login_btn_cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-900 dark:bg-emerald-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center gap-3"
                >
                  {isSaving ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-cloud-arrow-up" />}
                  <span>{isSaving ? 'Updating...' : t('btn_save_changes')}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.4em] shadow-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
              >
                <i className="fas fa-pen-nib mr-3" /> {t('btn_edit_profile')}
              </button>
            )}
          </div>
        </div>

        {/* ── Voice Instructions Banner (shown when editing starts) ── */}
        {isEditing && (
          <div className="mb-10 animate-fade-in">
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-[2.5rem] px-10 py-6 flex items-center gap-6 shadow-2xl">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                <i className="fas fa-microphone text-2xl text-emerald-300" />
              </div>
              <div>
                <p className="text-white font-black text-lg tracking-tight mb-1">
                  🎤 Voice Assistant இப்போது Active!
                </p>
                <p className="text-emerald-200/80 text-sm font-bold leading-relaxed">
                  ஒவ்வொரு field-க்கும் 🎤 button-ஐ click பண்ணி பேசுங்கள் → தன்னிச்சையாக type ஆகும்.
                  Dropdown fields-க்கு பேசினால் அந்த option select ஆகும்.
                </p>
              </div>
              <div className="ml-auto flex gap-1.5 items-end h-8 shrink-0">
                {[3, 6, 9, 6, 3, 8, 5, 10, 4, 7].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-400/60 rounded-full"
                    style={{
                      height: `${h * 2}px`,
                      animation: `voiceBar 0.7s ease-in-out ${i * 0.08}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Main Content ── */}
          <div className="lg:col-span-8 space-y-10">

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Land Size', value: profile.landSize + ' Acres', icon: 'fa-vector-square', color: 'emerald' },
                { label: 'Experience', value: profile.experience + ' Years', icon: 'fa-seedling', color: 'amber' },
                { label: 'Soil Type', value: t(profile.soilType), icon: 'fa-vial', color: 'blue' },
                { label: 'Trust Score', value: profile.trustScore + '%', icon: 'fa-shield-halved', color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-stone-900 p-8 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col items-center text-center group hover:border-emerald-500/50 transition-all animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`w-14 h-14 bg-stone-50 dark:bg-stone-950 text-stone-400 group-hover:text-${stat.color}-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-colors`}>
                    <i className={`fas ${stat.icon} text-xl`} />
                  </div>
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-stone-900 dark:text-stone-100 tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* ── Identity + Farm Spec Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              {/* Profile / Identity Card */}
              <div className="bg-white dark:bg-stone-900 p-10 rounded-[4rem] border border-stone-100 dark:border-stone-800 shadow-sm animate-fade-in">
                <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 mb-10 flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  {t('profile_identity')}
                  {isEditing && (
                    <span className="ml-auto text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <i className="fas fa-microphone text-[8px]" /> VOICE READY
                    </span>
                  )}
                </h3>

                <div className="space-y-8">

                  {/* Name Field */}
                  <div className="relative group">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">{t('profile_name_label')}</p>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={editedProfile.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full px-8 py-5 pr-16 bg-stone-50 dark:bg-stone-950 border rounded-3xl outline-none font-bold text-lg focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-stone-100 ${isVoiceListening && voiceField === 'name'
                              ? 'border-red-400 ring-4 ring-red-500/20'
                              : 'border-stone-100 dark:border-stone-800'
                            }`}
                        />
                        <MicButton
                          fieldName="name"
                          isActive={isVoiceListening && voiceField === 'name'}
                          onClick={() => handleVoiceMic('name')}
                          title="பெயர் சொல்லுங்கள்"
                        />
                      </div>
                    ) : (
                      <div className="px-8 py-5 bg-stone-50/50 dark:bg-stone-950/50 rounded-3xl border border-transparent font-black text-2xl text-stone-900 dark:text-stone-100 tracking-tight">
                        {profile.name}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">

                    {/* Age Field */}
                    <div className="relative group">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">{t('profile_age_label')}</p>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="number"
                            value={editedProfile.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                            className={`w-full px-8 py-5 pr-16 bg-stone-50 dark:bg-stone-950 border rounded-3xl outline-none font-bold text-lg dark:text-stone-100 transition-all ${isVoiceListening && voiceField === 'age'
                                ? 'border-red-400 ring-4 ring-red-500/20'
                                : 'border-stone-100 dark:border-stone-800'
                              }`}
                          />
                          <MicButton
                            fieldName="age"
                            isActive={isVoiceListening && voiceField === 'age'}
                            onClick={() => handleVoiceMic('age')}
                            title="வயது சொல்லுங்கள்"
                          />
                        </div>
                      ) : (
                        <div className="px-8 py-5 bg-stone-50/50 dark:bg-stone-950/50 rounded-3xl border border-transparent font-black text-2xl text-stone-900 dark:text-stone-100 tracking-tight">
                          {profile.age}
                        </div>
                      )}
                    </div>

                    {/* Experience Field */}
                    <div className="relative group">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Experience</p>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="number"
                            value={editedProfile.experience}
                            onChange={(e) => handleInputChange('experience', e.target.value)}
                            className={`w-full px-8 py-5 pr-16 bg-stone-50 dark:bg-stone-950 border rounded-3xl outline-none font-bold text-lg dark:text-stone-100 transition-all ${isVoiceListening && voiceField === 'experience'
                                ? 'border-red-400 ring-4 ring-red-500/20'
                                : 'border-stone-100 dark:border-stone-800'
                              }`}
                          />
                          <MicButton
                            fieldName="experience"
                            isActive={isVoiceListening && voiceField === 'experience'}
                            onClick={() => handleVoiceMic('experience')}
                            title="அனுபவம் சொல்லுங்கள்"
                          />
                        </div>
                      ) : (
                        <div className="px-8 py-5 bg-stone-50/50 dark:bg-stone-950/50 rounded-3xl border border-transparent font-black text-2xl text-stone-900 dark:text-stone-100 tracking-tight">
                          {profile.experience} Yrs
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className="relative group">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">{t('profile_address_label')}</p>
                    {isEditing ? (
                      <div className="relative">
                        <textarea
                          value={editedProfile.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          rows={3}
                          className={`w-full px-8 py-5 pr-16 bg-stone-50 dark:bg-stone-950 border rounded-3xl outline-none font-bold text-lg resize-none dark:text-stone-100 transition-all ${isVoiceListening && voiceField === 'address'
                              ? 'border-red-400 ring-4 ring-red-500/20'
                              : 'border-stone-100 dark:border-stone-800'
                            }`}
                        />
                        <MicButton
                          fieldName="address"
                          isActive={isVoiceListening && voiceField === 'address'}
                          onClick={() => handleVoiceMic('address')}
                          title="முகவரி சொல்லுங்கள்"
                        />
                      </div>
                    ) : (
                      <div className="px-8 py-5 bg-stone-50/50 dark:bg-stone-950/50 rounded-3xl border border-transparent font-bold text-lg text-stone-600 dark:text-stone-400 leading-snug">
                        {profile.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Agriculture Spec Card */}
              <div className="bg-white dark:bg-stone-900 p-10 rounded-[4rem] border border-stone-100 dark:border-stone-800 shadow-sm animate-fade-in delay-100">
                <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 mb-10 flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  Farm Specifications
                  {isEditing && (
                    <span className="ml-auto text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      <i className="fas fa-microphone text-[8px]" /> VOICE SELECT
                    </span>
                  )}
                </h3>

                <div className="space-y-8">

                  {/* Primary Crop - Voice Select */}
                  <div className="relative group">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">
                      {t('onboarding_label_crop')}
                      {isEditing && <span className="ml-2 text-emerald-500">🎤 Voice Select</span>}
                    </p>
                    {isEditing ? (
                      <div className="relative">
                        <select
                          value={editedProfile.primaryCrop}
                          onChange={(e) => handleInputChange('primaryCrop', e.target.value)}
                          className={`w-full px-8 py-5 pr-16 bg-stone-50 dark:bg-stone-950 border rounded-3xl outline-none font-bold text-lg dark:text-stone-100 appearance-none transition-all ${isSelectListening && selectField === 'primaryCrop'
                              ? 'border-red-400 ring-4 ring-red-500/20'
                              : 'border-stone-100 dark:border-stone-800'
                            }`}
                        >
                          {cropOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {/* Voice-select mic */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelectListening && selectField === 'primaryCrop') return;
                            startSelectListening('primaryCrop', cropOptions, (val) => {
                              handleInputChange('primaryCrop', val);
                            });
                          }}
                          title="பயிர் வகை சொல்லுங்கள்"
                          className={`absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isSelectListening && selectField === 'primaryCrop'
                              ? 'bg-red-500 text-white scale-110'
                              : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                        >
                          <i className={`fas ${isSelectListening && selectField === 'primaryCrop' ? 'fa-stop animate-pulse' : 'fa-microphone'} text-sm`} />
                          {isSelectListening && selectField === 'primaryCrop' && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-6 px-8 py-5 bg-stone-50/50 dark:bg-stone-950/50 rounded-3xl border border-transparent">
                        <div className="w-12 h-12 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                          <i className="fas fa-leaf" />
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                          {t(profile.primaryCrop)}
                        </p>
                      </div>
                    )}
                    {/* Voice hint label */}
                    {isEditing && isSelectListening && selectField === 'primaryCrop' && (
                      <div className="mt-2 ml-2">
                        <p className="text-[10px] font-bold text-red-500">
                          🎤 பயிர் பெயர் சொல்லுங்கள்: {cropOptions.map(o => o.label).join(' / ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Irrigation Method - Voice Select */}
                  <div className="relative group">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">
                      {t('onboarding_label_irrigation')}
                      {isEditing && <span className="ml-2 text-emerald-500">🎤 Voice Select</span>}
                    </p>
                    {isEditing ? (
                      <div className="relative">
                        <select
                          value={editedProfile.irrigationMethod}
                          onChange={(e) => handleInputChange('irrigationMethod', e.target.value)}
                          className={`w-full px-8 py-5 pr-16 bg-stone-50 dark:bg-stone-950 border rounded-3xl outline-none font-bold text-lg dark:text-stone-100 appearance-none transition-all ${isSelectListening && selectField === 'irrigationMethod'
                              ? 'border-red-400 ring-4 ring-red-500/20'
                              : 'border-stone-100 dark:border-stone-800'
                            }`}
                        >
                          {irrigationOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelectListening && selectField === 'irrigationMethod') return;
                            startSelectListening('irrigationMethod', irrigationOptions, (val) => {
                              handleInputChange('irrigationMethod', val);
                            });
                          }}
                          title="நீர்ப்பாசன முறை சொல்லுங்கள்"
                          className={`absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isSelectListening && selectField === 'irrigationMethod'
                              ? 'bg-red-500 text-white scale-110'
                              : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                        >
                          <i className={`fas ${isSelectListening && selectField === 'irrigationMethod' ? 'fa-stop animate-pulse' : 'fa-microphone'} text-sm`} />
                          {isSelectListening && selectField === 'irrigationMethod' && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-6 px-8 py-5 bg-stone-50/50 dark:bg-stone-950/50 rounded-3xl border border-transparent">
                        <div className="w-12 h-12 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                          <i className="fas fa-faucet-drip" />
                        </div>
                        <p className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                          {t(profile.irrigationMethod)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Member Since</p>
                      <div className="px-8 py-5 bg-stone-50/50 dark:bg-stone-950/50 rounded-3xl border border-transparent font-black text-xl text-stone-900 dark:text-stone-100 tracking-tighter">
                        {new Date(profile.onboardingDate).getFullYear()}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Verification Status</p>
                      <div className="px-8 py-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                        <i className="fas fa-circle-check text-emerald-500 text-sm" />
                        <span className="font-black text-[10px] uppercase text-emerald-700 dark:text-emerald-400 tracking-widest">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Land Size + Soil Type ── (extra voice fields) */}
            {isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
                {/* Land Size */}
                <div className="bg-white dark:bg-stone-900 p-10 rounded-[4rem] border border-stone-100 dark:border-stone-800 shadow-sm">
                  <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 mb-8 flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                    Land & Soil
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Land Size (Acres) 🎤</p>
                      <div className="relative">
                        <input
                          type="number"
                          value={editedProfile.landSize}
                          onChange={(e) => handleInputChange('landSize', e.target.value)}
                          className={`w-full px-8 py-5 pr-16 bg-stone-50 dark:bg-stone-950 border rounded-3xl outline-none font-bold text-lg dark:text-stone-100 transition-all ${isVoiceListening && voiceField === 'landSize'
                              ? 'border-red-400 ring-4 ring-red-500/20'
                              : 'border-stone-100 dark:border-stone-800'
                            }`}
                        />
                        <MicButton
                          fieldName="landSize"
                          isActive={isVoiceListening && voiceField === 'landSize'}
                          onClick={() => handleVoiceMic('landSize')}
                          title="நிலம் அளவு சொல்லுங்கள்"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">
                        Soil Type 🎤 Voice Select
                      </p>
                      <div className="relative">
                        <select
                          value={editedProfile.soilType}
                          onChange={(e) => handleInputChange('soilType', e.target.value)}
                          className={`w-full px-8 py-5 pr-16 bg-stone-50 dark:bg-stone-950 border rounded-3xl outline-none font-bold text-lg dark:text-stone-100 appearance-none transition-all ${isSelectListening && selectField === 'soilType'
                              ? 'border-red-400 ring-4 ring-red-500/20'
                              : 'border-stone-100 dark:border-stone-800'
                            }`}
                        >
                          {soilOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelectListening && selectField === 'soilType') return;
                            startSelectListening('soilType', soilOptions, (val) => {
                              handleInputChange('soilType', val);
                            });
                          }}
                          title="மண் வகை சொல்லுங்கள்"
                          className={`absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isSelectListening && selectField === 'soilType'
                              ? 'bg-red-500 text-white scale-110'
                              : 'bg-amber-500 text-white hover:bg-amber-400'
                            }`}
                        >
                          <i className={`fas ${isSelectListening && selectField === 'soilType' ? 'fa-stop animate-pulse' : 'fa-microphone'} text-sm`} />
                          {isSelectListening && selectField === 'soilType' && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voice Tips Card */}
                <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-10 rounded-[4rem] shadow-2xl text-white">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30">
                    <i className="fas fa-circle-info text-emerald-400 text-lg" />
                  </div>
                  <h4 className="font-black text-lg text-white mb-4 tracking-tight">Voice Tips 🎤</h4>
                  <ul className="space-y-4 text-sm font-bold text-stone-300 leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      Text fields: 🟢 Microphone click → பேசுங்கள் → Auto type ஆகும்
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-0.5">✓</span>
                      Dropdown fields: 🔵 Mic click → Option பெயர் சொல்லுங்கள் → Auto select
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-400 mt-0.5">✓</span>
                      Tamil-ல் பேசலாம், English-லயும் பேசலாம்
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-0.5">✓</span>
                      Red glow = கேட்கிறேன் | Stop பண்ண மீண்டும் click செய்யுங்கள்
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-4 space-y-8">

            {/* Farmer ID Card */}
            <div className="bg-emerald-900 p-12 rounded-[5rem] text-white shadow-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -ml-16 -mb-16" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-16">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <i className="fas fa-leaf text-2xl text-emerald-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Status</p>
                    <p className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 px-3 py-1 rounded-full">Certified</p>
                  </div>
                </div>
                <div className="mb-12">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-50 mb-3">Farmer Registry ID</p>
                  <p className="text-4xl font-black font-mono tracking-tighter group-hover:tracking-widest transition-all duration-700">{profile.id}</p>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Digital Identity</p>
                    <p className="text-sm font-bold truncate max-w-[150px]">{profile.name}</p>
                  </div>
                  <div className="w-16 h-16 bg-white p-2 rounded-2xl flex items-center justify-center shadow-2xl">
                    <i className="fas fa-qrcode text-emerald-950 text-3xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-stone-900 rounded-[4rem] p-10 border border-stone-100 dark:border-stone-800 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] mb-4">Command Actions</h4>
              <button onClick={() => navigate('/query')} className="w-full flex items-center justify-between p-6 bg-stone-50 dark:bg-stone-950 rounded-[2rem] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-stone-900 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><i className="fas fa-robot" /></div>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">AI Consultation</span>
                </div>
                <i className="fas fa-arrow-right text-stone-200 group-hover:text-emerald-500 transition-colors" />
              </button>
              <button onClick={() => navigate('/store')} className="w-full flex items-center justify-between p-6 bg-stone-50 dark:bg-stone-950 rounded-[2rem] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-stone-900 rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><i className="fas fa-store" /></div>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">Supply Store</span>
                </div>
                <i className="fas fa-arrow-right text-stone-200 group-hover:text-emerald-500 transition-colors" />
              </button>
              <button onClick={() => navigate('/schemes')} className="w-full flex items-center justify-between p-6 bg-stone-50 dark:bg-stone-950 rounded-[2rem] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-stone-900 rounded-xl flex items-center justify-center text-amber-600 shadow-sm"><i className="fas fa-landmark" /></div>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">Govt Schemes</span>
                </div>
                <i className="fas fa-arrow-right text-stone-200 group-hover:text-emerald-500 transition-colors" />
              </button>
            </div>

            {/* Security Badge */}
            <div className="bg-stone-50 dark:bg-stone-900/50 p-8 rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-stone-800 text-center">
              <i className="fas fa-shield-halved text-emerald-600 text-3xl mb-4" />
              <h5 className="font-black text-stone-900 dark:text-stone-100 text-sm mb-2">Secure Data Protection</h5>
              <p className="text-[10px] text-stone-400 font-bold leading-relaxed px-4">Your farm profile is secured via blockchain encryption and only accessible to verified agricultural officers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global animation styles */}
      <style>{`
        @keyframes voiceBar {
          from { transform: scaleY(0.3); opacity: 0.4; }
          to { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
