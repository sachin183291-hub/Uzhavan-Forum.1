
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { useLanguage } from '../context/LanguageContext.tsx';

interface RecentLocation {
  name: string;
  lat: number;
  lon: number;
}

interface WeatherData {
  temp: string;
  conditionKey: string;
  icon: string;
  humidity: string;
  windSpeed: number;
  locationName: string;
  advisory: string;
  impacts: { label: string; action: string }[];
  forecast: { day: string; temp: string; icon: string; conditionKey: string }[];
}

interface PlantingRecord {
  id: string;
  crop: string;
  verdict: string;
  reasoning: string;
  scientificBasis: string;
  scientificDetails: {
    optimalPh: string;
    waterReq: string;
    tempThresholds: string;
  };
  timestamp: string;
}

const CROPS = ['Paddy', 'Rubber', 'Coconut', 'Pepper', 'Banana', 'Coffee', 'Arecanut', 'Cardamom', 'Vegetables', 'Ginger', 'Turmeric'];
const CROP_KEYS = ['crop_paddy', 'crop_rubber', 'crop_coconut', 'crop_pepper', 'crop_banana', 'crop_coffee', 'crop_arecanut', 'crop_cardamom', 'crop_vegetables', 'crop_ginger', 'crop_turmeric'];

const WMO_CODE_MAP: Record<number, { key: string, icon: string }> = {
  0: { key: 'wmo_0', icon: 'fa-sun text-amber-400' },
  1: { key: 'wmo_1', icon: 'fa-cloud-sun text-amber-300' },
  2: { key: 'wmo_2', icon: 'fa-cloud-sun text-stone-400' },
  3: { key: 'wmo_3', icon: 'fa-cloud text-stone-500' },
  45: { key: 'wmo_45', icon: 'fa-smog text-stone-300' },
  48: { key: 'wmo_48', icon: 'fa-smog text-stone-400' },
  51: { key: 'wmo_51', icon: 'fa-cloud-rain text-blue-300' },
  53: { key: 'wmo_53', icon: 'fa-cloud-rain text-blue-400' },
  55: { key: 'wmo_55', icon: 'fa-cloud-showers-heavy text-blue-500' },
  61: { key: 'wmo_61', icon: 'fa-cloud-rain text-blue-400' },
  63: { key: 'wmo_63', icon: 'fa-cloud-showers-heavy text-blue-500' },
  65: { key: 'wmo_65', icon: 'fa-cloud-showers-water text-blue-600' },
  80: { key: 'wmo_80', icon: 'fa-cloud-showers-heavy text-blue-400' },
  81: { key: 'wmo_81', icon: 'fa-cloud-showers-heavy text-blue-500' },
  82: { key: 'wmo_82', icon: 'fa-cloud-bolt text-blue-700' },
  95: { key: 'wmo_95', icon: 'fa-cloud-bolt text-amber-500' },
};

const WeatherPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);

  const [selectedCropKey, setSelectedCropKey] = useState(CROP_KEYS[0]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningHistory, setPlanningHistory] = useState<PlantingRecord[]>([]);

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem('planting_records');
    if (storedHistory) setPlanningHistory(JSON.parse(storedHistory));

    const storedRecents = localStorage.getItem('recent_weather_locations');
    if (storedRecents) setRecentLocations(JSON.parse(storedRecents));

    const cachedWeather = sessionStorage.getItem('weather_cache_v2');
    if (cachedWeather) {
      setWeather(JSON.parse(cachedWeather));
    } else {
      initGeolocation();
    }

    return () => stopAudio();
  }, []);

  const saveToRecent = (name: string, lat: number, lon: number) => {
    setRecentLocations(prev => {
      const filtered = prev.filter(loc => loc.name !== name);
      const updated = [{ name, lat, lon }, ...filtered].slice(0, 5);
      localStorage.setItem('recent_weather_locations', JSON.stringify(updated));
      return updated;
    });
  };

  const initGeolocation = () => {
    setIsLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherData(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          setIsLoading(false);
          setError("GPS access denied. Use manual search.");
        },
        { timeout: 8000 }
      );
    } else {
      setIsLoading(false);
      setError("GPS not supported.");
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) { }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlayingAudio(false);
    setIsSynthesizing(false);
    setActiveAudioId(null);
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const fetchWeatherData = async (lat?: number, lon?: number, locationQuery?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let targetLat = lat;
      let targetLon = lon;
      let locationName = 'Your Farm';

      // Fetch location data if query provided
      if (locationQuery) {
        try {
          const geoRes = await Promise.race([
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=1`, {
              headers: { 'User-Agent': 'UzhavanForum/1.1' }
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Geo timeout')), 5000))
          ]);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            targetLat = parseFloat(geoData[0].lat);
            targetLon = parseFloat(geoData[0].lon);
            locationName = geoData[0].display_name.split(',')[0];
          } else {
            throw new Error("Location not recognized.");
          }
        } catch (geoErr) {
          throw new Error("Location search failed. Try again.");
        }
      } else if (lat !== undefined && lon !== undefined) {
        try {
          const revRes = await Promise.race([
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
              headers: { 'User-Agent': 'UzhavanForum/1.1' }
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Reverse geo timeout')), 5000))
          ]);
          const revData = await revRes.json();
          locationName = revData.address?.city || revData.address?.town || revData.address?.village || revData.address?.suburb || 'Local Farm';
        } catch (e) {
          locationName = 'Your Farm';
        }
      }

      if (targetLat === undefined || targetLon === undefined) throw new Error("GPS Signal Missing.");

      saveToRecent(locationName, targetLat, targetLon);

      // Fetch weather with timeout
      const weatherRes = await Promise.race([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Weather timeout')), 8000))
      ]);
      const rawWeather = await weatherRes.json();

      const currentWmo = WMO_CODE_MAP[rawWeather.current.weather_code] || { key: 'wmo_3', icon: 'fa-cloud' };

      const forecast3Day = rawWeather.daily.time.slice(1, 4).map((time: string, i: number) => {
        const date = new Date(time);
        const dayName = date.toLocaleDateString(language === 'English' ? 'en-US' : language === 'Tamil' ? 'ta-IN' : 'ml-IN', { weekday: 'short' });
        const code = rawWeather.daily.weather_code[i + 1];
        return {
          day: dayName,
          temp: `${Math.round(rawWeather.daily.temperature_2m_max[i + 1])}°C`,
          icon: (WMO_CODE_MAP[code] || { icon: 'fa-cloud', key: 'wmo_3' }).icon,
          conditionKey: (WMO_CODE_MAP[code] || { key: 'wmo_3' }).key
        };
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const profileStr = localStorage.getItem('farmerProfile');
      const profile = profileStr ? JSON.parse(profileStr) : {};

      const langInstruction = language === 'Tamil'
        ? 'தமிழில் மட்டுமே பதிலளிக்கவும் (Respond ONLY in Tamil)'
        : language === 'Malayalam'
          ? 'മലയാളത്തിൽ മാത്രം മറുപടി നൽകുക (Respond ONLY in Malayalam)'
          : 'Respond ONLY in English';

      const advisoryPrompt = `Analyze weather metrics for ${profile.primaryCrop || 'crops'} in ${locationName}.
      Temp: ${rawWeather.current.temperature_2m}°C, Humidity: ${rawWeather.current.relative_humidity_2m}%, Condition: ${currentWmo.key}, Wind: ${rawWeather.current.wind_speed_10m} km/h.
      IMPORTANT: ALL text in the response MUST be written in ${language} language. ${langInstruction}.
      Provide: 1. Agricultural advisory in ${language} (1-2 sentences). 2. 3 action items in ${language} as JSON array {label, action}.
      Return JSON: { "advisory": "...", "impacts": [{"label": "...", "action": "..."}] }`;

      let aiResponse;
      try {
        aiResponse = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ parts: [{ text: advisoryPrompt }] }],
            config: { systemInstruction: `You are an agronomy advisor. CRITICAL: Respond ONLY in ${language} language. ${langInstruction}. Return JSON only.`, responseMimeType: "application/json" }
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 12000))
        ]);
      } catch (aiErr) {
        console.warn('AI advisory failed, using fallback');
        aiResponse = { text: '{"advisory": "Weather data retrieved. Check forecast for planting decisions.", "impacts": []}' };
      }

      const aiRawText = aiResponse?.text ||
        aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text ||
        '{"advisory": "Data sync complete.", "impacts": []}';
      let aiData;
      try {
        aiData = typeof aiRawText === 'string' ? JSON.parse(aiRawText) : aiRawText;
      } catch (e) {
        aiData = { advisory: 'Weather data available.', impacts: [] };
      }

      const processedWeather: WeatherData = {
        temp: `${Math.round(rawWeather.current.temperature_2m)}°C`,
        conditionKey: currentWmo.key,
        icon: currentWmo.icon,
        humidity: `${rawWeather.current.relative_humidity_2m}%`,
        windSpeed: rawWeather.current.wind_speed_10m,
        locationName,
        advisory: aiData.advisory || "Weather patterns are stable.",
        impacts: aiData.impacts || [],
        forecast: forecast3Day
      };

      setWeather(processedWeather);
      sessionStorage.setItem('weather_cache_v2', JSON.stringify(processedWeather));
      setManualLocation('');
    } catch (err: any) {
      console.error('Weather Error:', err);
      setError(err.message || "Atmospheric sync failed. Try manual search.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = async (text: string, id: string) => {
    if (activeAudioId === id && (isPlayingAudio || isSynthesizing)) { stopAudio(); return; }
    stopAudio();
    setActiveAudioId(id);
    setIsSynthesizing(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) throw new Error('API key not configured');
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      const ai = new GoogleGenAI({ apiKey });
      const response = await Promise.race([
        ai.models.generateContent({
          model: "gemini-2.0-flash-preview-tts",
          contents: [{ parts: [{ text: `Report: ${text}` }] }],
          config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TTS timeout')), 10000))
      ]);
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio || activeAudioId !== id) { stopAudio(); return; }
      const audioData = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => { setIsPlayingAudio(false); setActiveAudioId(null); };
      sourceNodeRef.current = source;
      setIsSynthesizing(false);
      setIsPlayingAudio(true);
      source.start(0);
    } catch (err) { stopAudio(); }
  };

  const checkPlantingSuitability = async () => {
    if (!weather) return;
    setIsPlanning(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) throw new Error('API key not configured');
      const ai = new GoogleGenAI({ apiKey });
      const langInstruction2 = language === 'Tamil'
        ? 'தமிழில் மட்டுமே பதிலளிக்கவும் (Respond ONLY in Tamil)'
        : language === 'Malayalam'
          ? 'മലയാളത്തിൽ മാത്രം മറുപടി നൽകുക (Respond ONLY in Malayalam)'
          : 'Respond ONLY in English';

      const prompt = `SCIENTIFIC CROP ANALYSIS for ${t(selectedCropKey)} in ${weather.locationName}. 
      Current: ${weather.temp}, ${t(weather.conditionKey)}, ${weather.humidity} humidity.
      CRITICAL: ALL text values in the JSON response MUST be written in ${language} language. ${langInstruction2}.
      Determine if TODAY is suitable for planting. 
      You MUST provide specific scientific data.
      Return strictly JSON with ALL text in ${language}: 
      {
        "verdict": "Suitable/Not Suitable",
        "reasoning": "... in ${language} ...",
        "scientificBasis": "... in ${language} ...",
        "scientificDetails": {
          "optimalPh": "e.g. 5.5 - 6.5",
          "waterReq": "e.g. 1200mm/year",
          "tempThresholds": "e.g. 20C to 35C"
        }
      }`;

      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [{ parts: [{ text: prompt }] }],
          config: { systemInstruction: `Agronomy AI. CRITICAL: You MUST respond in ${language} language for all text fields. ${language === 'Tamil' ? 'தமிழில் மட்டுமே பதிலளிக்கவும்.' : language === 'Malayalam' ? 'മലയാളത്തിൽ മാത്രം മറുപടി നൽകുക.' : 'Respond in English only.'} Return JSON only.`, responseMimeType: "application/json" }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 12000))
      ]);

      const plantRawText = response.text ||
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        "{}";
      let data;
      try {
        data = typeof plantRawText === 'string' ? JSON.parse(plantRawText) : plantRawText;
      } catch (parseErr) {
        console.error('Parse error:', parseErr);
        data = { verdict: 'Check conditions', reasoning: 'Analysis unavailable', scientificBasis: 'Try again later' };
      }
      const newRecord: PlantingRecord = {
        id: 'PL-' + Date.now(),
        crop: t(selectedCropKey),
        verdict: data.verdict || 'Unknown',
        reasoning: data.reasoning || 'No reasoning provided.',
        scientificBasis: data.scientificBasis || 'No data.',
        scientificDetails: {
          optimalPh: data.scientificDetails?.optimalPh || 'N/A',
          waterReq: data.scientificDetails?.waterReq || 'N/A',
          tempThresholds: data.scientificDetails?.tempThresholds || 'N/A'
        },
        timestamp: new Date().toLocaleString()
      };

      const updated = [newRecord, ...planningHistory].slice(0, 15);
      setPlanningHistory(updated);
      localStorage.setItem('planting_records', JSON.stringify(updated));
    } catch (err) {
      console.error("Suitability check error:", err);
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-16 px-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-3 bg-emerald-900 text-white px-5 py-2 rounded-full mb-6 shadow-xl border border-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('weather_title')}</span>
            </div>
            <h1 className="heading-font text-5xl md:text-7xl font-black text-stone-900 dark:text-stone-100 tracking-tighter leading-[0.9]">
              {t('weather_feed_title').split(' ')[0]} <span className="text-emerald-600">{t('weather_feed_title').split(' ')[1] || 'Feed.'}</span> {t('weather_feed_title').split(' ').slice(2).join(' ')}
            </h1>
          </div>
          <div className="w-full md:w-auto flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group w-full sm:w-96">
                <i className="fas fa-search absolute left-14 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-emerald-500 transition-colors"></i>
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && manualLocation && fetchWeatherData(undefined, undefined, manualLocation)}
                  placeholder="..."
                  className="w-full pl-14 pr-16 py-6 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2.5rem] outline-none font-bold text-base shadow-sm dark:text-stone-100"
                />
                <button onClick={initGeolocation} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-400 hover:text-emerald-500"><i className="fas fa-crosshairs"></i></button>
              </div>
              <button onClick={() => manualLocation ? fetchWeatherData(undefined, undefined, manualLocation) : initGeolocation()} disabled={isLoading} className="px-10 py-6 bg-emerald-900 dark:bg-emerald-700 text-white rounded-[2.5rem] flex items-center justify-center space-x-4 shadow-3xl hover:bg-black transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50">
                {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-satellite-dish"></i>}
                <span>{isLoading ? 'Syncing...' : t('weather_btn_fetch')}</span>
              </button>
            </div>
            {recentLocations.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 px-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mr-2">{t('weather_recent')}</span>
                {recentLocations.map((loc, idx) => (
                  <button key={idx} onClick={() => fetchWeatherData(loc.lat, loc.lon)} className="px-5 py-2 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-full text-[10px] font-bold text-stone-500 dark:text-stone-400 hover:border-emerald-500 hover:text-emerald-600 shadow-sm transition-all">{loc.name}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-10">
            <div className="w-40 h-40 bg-emerald-100 dark:bg-emerald-950/30 rounded-[4rem] flex items-center justify-center shadow-inner relative">
              <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-[4rem] animate-ping"></div>
              <i className="fas fa-bolt-lightning text-6xl text-emerald-600 dark:text-emerald-400"></i>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.6em] text-emerald-900 dark:text-emerald-400">{t('weather_scanning')}</p>
          </div>
        ) : weather ? (
          <div className="space-y-12 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-8 flex flex-col space-y-8">
                <div className="bg-emerald-900 dark:bg-stone-900 rounded-[5rem] p-16 text-white shadow-3xl overflow-hidden relative group flex-1 transition-all">
                  <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-16 text-center lg:text-left h-full">
                    <div className="flex-1">
                      <h2 className="text-[8rem] lg:text-[12rem] font-black tracking-tighter leading-none mb-4">{weather.temp}</h2>
                      <p className="text-4xl font-black uppercase tracking-[0.3em] text-emerald-400">{t(weather.conditionKey)}</p>
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 mt-10">
                        <div className="flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                          <i className="fas fa-droplet text-blue-400"></i>
                          <span className="font-black tracking-widest text-xs uppercase">{t('weather_humidity')}: {weather.humidity}</span>
                        </div>
                        <div className="flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                          <i className="fas fa-wind text-stone-300"></i>
                          <span className="font-black tracking-widest text-xs uppercase">{weather.windSpeed} {t('weather_km_h')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      {/* Fix: use processed weather.icon instead of undefined rawWeather */}
                      <i className={`fas ${weather.icon} text-[15rem] lg:text-[20rem] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]`}></i>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-stone-900 rounded-[4rem] p-12 shadow-sm border border-stone-100 dark:border-stone-800">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.5em]">{t('weather_system_suitability_ai')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3">
                      <select value={selectedCropKey} onChange={(e) => setSelectedCropKey(e.target.value)} className="w-full px-8 py-6 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-3xl outline-none font-black text-xl text-emerald-950 dark:text-stone-100 appearance-none shadow-sm">
                        {CROP_KEYS.map(k => <option key={k} value={k}>{t(k)}</option>)}
                      </select>
                    </div>
                    <button onClick={checkPlantingSuitability} disabled={isPlanning} className="bg-emerald-900 dark:bg-emerald-700 text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-3xl hover:bg-black transition-all disabled:opacity-50">
                      {isPlanning ? <i className="fas fa-atom fa-spin"></i> : t('weather_verify_now')}
                    </button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 flex flex-col space-y-8 h-full">
                <div className="bg-white dark:bg-stone-900 rounded-[4rem] p-12 shadow-sm border border-stone-100 dark:border-stone-800 flex-1">
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] mb-12 flex items-center"><i className="fas fa-calendar-days mr-3 text-emerald-500"></i> {t('weather_weekly')}</h3>
                  <div className="space-y-10">
                    {weather.forecast?.map((f, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center space-x-8">
                          <div className="w-16 h-16 bg-stone-50 dark:bg-stone-950 rounded-2xl flex items-center justify-center text-stone-600 dark:text-stone-400 shadow-inner"><i className={`fas ${f.icon} text-2xl`}></i></div>
                          <span className="font-black text-stone-900 dark:text-stone-100 text-xl uppercase tracking-tighter">{f.day}</span>
                        </div>
                        <span className="text-2xl font-black text-emerald-900 dark:text-emerald-400">{f.temp}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-emerald-900 dark:bg-emerald-800 rounded-[4rem] p-12 text-white shadow-3xl relative overflow-hidden">
                  <h4 className="text-xl font-black mb-4 tracking-tight">{t('weather_advisory_title')}</h4>
                  <p className="text-base font-bold text-emerald-100/80 leading-relaxed italic">"{weather.advisory}"</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-stone-900 rounded-[5rem] p-16 shadow-sm border border-stone-100 dark:border-stone-800 transition-all overflow-x-auto">
              <h3 className="heading-font text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight mb-12">{t('weather_log')}</h3>
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-800">
                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">{t('weather_spec')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">{t('weather_verdict')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">{t('weather_matrix')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">{t('weather_logic')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50">
                  {planningHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-stone-50 dark:hover:bg-stone-950/50 transition-colors">
                      <td className="px-8 py-10">
                        <span className="font-black text-stone-900 dark:text-stone-100 text-2xl uppercase tracking-tighter">{rec.crop}</span>
                        <p className="text-[10px] font-black text-stone-300 mt-1 tracking-widest">{rec.timestamp}</p>
                      </td>
                      <td className="px-8 py-10"><span className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-100 text-emerald-700">{rec.verdict}</span></td>
                      <td className="px-8 py-10 text-xs font-black text-stone-600 dark:text-stone-400">
                        <p><span className="text-stone-400 uppercase text-[8px] tracking-widest block mb-0.5">pH:</span> {rec.scientificDetails?.optimalPh}</p>
                        <p className="mt-2"><span className="text-stone-400 uppercase text-[8px] tracking-widest block mb-0.5">Water:</span> {rec.scientificDetails?.waterReq}</p>
                        <p className="mt-2"><span className="text-stone-400 uppercase text-[8px] tracking-widest block mb-0.5">Temp:</span> {rec.scientificDetails?.tempThresholds}</p>
                      </td>
                      <td className="px-8 py-10 max-w-md">
                        <p className="text-stone-700 dark:text-stone-300 font-bold text-sm leading-snug">{rec.reasoning}</p>
                        <button onClick={() => handlePlayVoice(`${rec.verdict}. ${rec.reasoning}`, rec.id)} className="mt-4 flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest"><i className="fas fa-volume-high"></i> {t('weather_hear_analysis')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default WeatherPage;
