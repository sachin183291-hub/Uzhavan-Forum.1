
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FarmerQuery } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

type SortField = 'farmerName' | 'timestamp' | 'rating' | 'priority' | 'dueDate';
type SortOrder = 'asc' | 'desc';

// --- Sub-component: Enhanced Audio Player Bar ---
const AudioPlayerBar: React.FC<{ query: FarmerQuery; mode: 'farmer' | 'officer'; onClose: () => void }> = ({ query, mode, onClose }) => {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const data = mode === 'farmer' ? query.audioData : query.officerAudioData;
    if (!data) return;
    
    let url = '';
    if (data.startsWith('data:')) {
      url = data;
    } else {
      const decodeBase64 = (base64: string) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes;
      };

      const pcmData = decodeBase64(data);
      const sampleRate = 24000;
      const header = new ArrayBuffer(44);
      const view = new DataView(header);
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
      };
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + pcmData.length, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); 
      view.setUint16(22, 1, true); 
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true); 
      view.setUint16(32, 2, true); 
      view.setUint16(34, 16, true); 
      writeString(36, 'data');
      view.setUint32(40, pcmData.length, true);
      url = URL.createObjectURL(new Blob([header, pcmData], { type: 'audio/wav' }));
    }
    
    setAudioUrl(url);

    return () => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    };
  }, [query, mode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-emerald-950/98 backdrop-blur-3xl p-8 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 z-[100] animate-slide-up flex flex-col md:flex-row items-center gap-10">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onPlay={() => setIsPlaying(true)} 
        onPause={() => setIsPlaying(false)} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex items-center gap-6">
        <button 
          onClick={togglePlay}
          className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-emerald-900 shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-3xl`}></i>
        </button>
        <div className="hidden md:block">
           <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em] mb-1">
            {mode === 'farmer' ? t('dash_input_stream') : t('dash_officer_feedback')}
          </p>
          <p className="text-white font-bold text-sm truncate max-w-[150px]">{query.farmerName}</p>
        </div>
      </div>

      <div className="flex-grow space-y-3 w-full">
        <div className="flex justify-between items-end">
          <span className="text-[11px] font-mono text-white/50">{formatTime(currentTime)}</span>
          <span className="text-[11px] font-mono text-white/50">{formatTime(duration)}</span>
        </div>
        <div className="relative group">
          <input 
            type="range" 
            min="0" 
            max={duration || 0} 
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-white/10 rounded-full appearance-none accent-white cursor-pointer hover:h-3 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0 w-full md:w-auto">
        <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-[2rem] border border-white/5">
          <i className={`fas ${volume === 0 ? 'fa-volume-mute' : volume < 0.5 ? 'fa-volume-down' : 'fa-volume-up'} text-white/60 text-sm w-5`}></i>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-white/20 rounded-full appearance-none accent-emerald-400 cursor-pointer"
          />
        </div>
        <button onClick={onClose} className="w-14 h-14 rounded-[1.5rem] bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'Queries' | 'Farmers' | 'Alerts'>('Queries');
  const [queries, setQueries] = useState<FarmerQuery[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [playerQuery, setPlayerQuery] = useState<{ query: FarmerQuery; mode: 'farmer' | 'officer' } | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const refreshData = () => {
    try {
      const qStr = localStorage.getItem('queries_db');
      if (qStr) setQueries(JSON.parse(qStr));
      const uStr = localStorage.getItem('farmers_db');
      if (uStr) {
        const u = JSON.parse(uStr);
        setFarmers(Object.keys(u).map(k => ({ phone: k, ...u[k] })));
      }
    } catch (e) {}
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const startRecording = async (queryId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          saveOfficerFeedback(queryId, base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingId(queryId);
    } catch (err) {
      alert("Microphone access is required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingId(null);
    }
  };

  const saveOfficerFeedback = (queryId: string, audioData: string) => {
    const updatedQueries = queries.map(q => {
      if (q.id === queryId) {
        return {
          ...q,
          officerAudioData: audioData,
          status: 'Solved' as const,
          aiResponse: 'Officer feedback recorded.'
        };
      }
      return q;
    });
    localStorage.setItem('queries_db', JSON.stringify(updatedQueries));
    setQueries(updatedQueries);
  };

  const processedQueries = useMemo(() => {
    let filtered = Array.isArray(queries) ? [...queries] : [];
    if (statusFilter !== 'All') filtered = filtered.filter(q => q.status === statusFilter);
    if (priorityFilter !== 'All') filtered = filtered.filter(q => (q.priority || 'Low') === priorityFilter);

    filtered.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (sortField === 'priority') {
        const weights: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        valA = weights[a.priority as string] || 0;
        valB = weights[b.priority as string] || 0;
      }
      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
    return filtered;
  }, [queries, statusFilter, priorityFilter, sortField, sortOrder]);

  const callRequests = useMemo(() => Array.isArray(queries) ? queries.filter(q => q.callRequested) : [], [queries]);

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div>
            <div className="inline-flex px-4 py-2 bg-emerald-900 text-emerald-100 rounded-full text-[10px] font-black uppercase mb-4 tracking-widest">Krishi Command Center</div>
            <h1 className="heading-font text-6xl font-black text-stone-900 dark:text-stone-100 tracking-tighter">{t('nav_dashboard')}</h1>
          </div>
          <div className="flex bg-stone-200/50 dark:bg-stone-900 p-2 rounded-[2rem]">
             <button onClick={() => setTab('Queries')} className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${tab === 'Queries' ? 'bg-white dark:bg-stone-800 text-emerald-900 shadow-xl' : 'text-stone-400'}`}>
                {t('dash_tab_queries')}
             </button>
             <button onClick={() => setTab('Farmers')} className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${tab === 'Farmers' ? 'bg-white dark:bg-stone-800 text-emerald-900 shadow-xl' : 'text-stone-400'}`}>
                {t('dash_tab_farmers')}
             </button>
             <button onClick={() => setTab('Alerts')} className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase relative transition-all ${tab === 'Alerts' ? 'bg-white dark:bg-stone-800 text-emerald-900 shadow-xl' : 'text-stone-400'}`}>
                {callRequests.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px]">{callRequests.length}</span>}
                {t('dash_tab_alerts')}
             </button>
          </div>
        </div>

        {tab === 'Queries' && (
          <div className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] mb-8 border border-stone-100 dark:border-stone-800 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
             <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">{t('dash_filter_status')}</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-xs font-bold outline-none dark:text-stone-100">
                  <option value="All">All Statuses</option>
                  <option value="Solved">Solved</option>
                  <option value="Pending">Pending</option>
                </select>
             </div>
             <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">{t('dash_filter_priority')}</label>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-xs font-bold outline-none dark:text-stone-100">
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
             </div>
             <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">{t('dash_sort_by')}</label>
                <select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)} className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-xs font-bold outline-none dark:text-stone-100">
                  <option value="priority">{t('dash_sort_priority')}</option>
                  <option value="timestamp">{t('dash_sort_date')}</option>
                  <option value="farmerName">{t('dash_sort_name')}</option>
                </select>
             </div>
             <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/30">
                {sortOrder === 'asc' ? 'Asc' : 'Desc'} <i className="fas fa-sort ml-2"></i>
             </button>
          </div>
        )}

        <div className="bg-white dark:bg-stone-900 rounded-[4rem] shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
          {tab === 'Queries' ? (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800">
                    <tr>
                      <th className="px-12 py-8 text-[10px] font-black text-stone-500 uppercase tracking-widest">{t('dash_col_priority')}</th>
                      <th className="px-12 py-8 text-[10px] font-black text-stone-500 uppercase tracking-widest">{t('dash_col_farmer')}</th>
                      <th className="px-12 py-8 text-[10px] font-black text-stone-500 uppercase tracking-widest">{t('dash_col_issue')}</th>
                      <th className="px-12 py-8 text-[10px] font-black text-stone-500 uppercase tracking-widest">{t('dash_col_action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {processedQueries.map(q => {
                      const isCurrentPlayer = playerQuery?.query.id === q.id;
                      const isRec = recordingId === q.id;
                      return (
                        <tr key={q.id} className={`${isCurrentPlayer ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'hover:bg-stone-50/50'} transition-all`}>
                          <td className="px-12 py-8">
                             <span className="px-4 py-2 rounded-full text-[9px] font-black uppercase border tracking-widest bg-stone-100 dark:bg-stone-800 dark:border-stone-700">
                                {q.priority || 'Low'}
                             </span>
                          </td>
                          <td className="px-12 py-8">
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="text-sm font-black text-stone-900 dark:text-stone-100">{q.farmerName}</p>
                                <p className="text-[9px] text-stone-400 uppercase tracking-widest">{q.cropType}</p>
                              </div>
                              {q.callRequested && (
                                <div className="flex items-center space-x-2 px-2 py-1 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900/40 animate-pulse">
                                  <i className="fas fa-phone-volume text-red-600 text-[10px]"></i>
                                  <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter">Call Req.</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-12 py-8">
                            <p className="text-sm font-bold text-stone-600 dark:text-stone-400 line-clamp-1 max-w-[300px]">{q.question}</p>
                            <div className="flex items-center gap-4 mt-3">
                               {q.audioData && (
                                 <button 
                                   onClick={() => setPlayerQuery({ query: q, mode: 'farmer' })}
                                   className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-2"
                                 >
                                    <i className="fas fa-play-circle text-xs"></i> {t('voice_farmer')}
                                 </button>
                               )}
                               {q.officerAudioData && (
                                 <button 
                                   onClick={() => setPlayerQuery({ query: q, mode: 'officer' })}
                                   className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                                 >
                                    <i className="fas fa-play-circle text-xs"></i> {t('voice_response')}
                                 </button>
                               )}
                            </div>
                          </td>
                          <td className="px-12 py-8">
                             <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${q.status === 'Solved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}`}>
                                  {q.status}
                                </span>
                                {q.status !== 'Solved' && (
                                  <button onClick={() => isRec ? stopRecording() : startRecording(q.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isRec ? 'bg-red-500 text-white animate-pulse shadow-lg' : 'bg-stone-100 text-stone-400 hover:bg-emerald-900 hover:text-white dark:bg-stone-800'}`}>
                                    <i className={`fas ${isRec ? 'fa-stop' : 'fa-microphone'} text-xs`}></i>
                                  </button>
                                )}
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          ) : tab === 'Alerts' ? (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800">
                   <tr>
                     <th className="px-12 py-8 text-[10px] font-black text-stone-500 uppercase tracking-widest">Escalation</th>
                     <th className="px-12 py-8 text-[10px] font-black text-stone-500 uppercase tracking-widest">Farmer</th>
                     <th className="px-12 py-8 text-[10px] font-black text-stone-500 uppercase tracking-widest">Location</th>
                     <th className="px-12 py-8 text-[10px] font-black text-stone-500 uppercase tracking-widest">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                   {callRequests.map(q => (
                     <tr key={q.id} className="bg-red-50/30 dark:bg-red-950/10 transition-colors">
                       <td className="px-12 py-8">
                          <div className="flex items-center space-x-3 text-red-600">
                             <i className="fas fa-phone-volume animate-bounce"></i>
                             <span className="text-[10px] font-black uppercase tracking-widest">Voice Escalation</span>
                          </div>
                       </td>
                       <td className="px-12 py-8">
                          <p className="text-sm font-black text-stone-900 dark:text-stone-100">{q.farmerName}</p>
                       </td>
                       <td className="px-12 py-8">
                          <p className="text-sm font-bold text-stone-500">{q.location}</p>
                       </td>
                       <td className="px-12 py-8">
                          <button 
                            onClick={() => window.location.href = `tel:${q.farmerId}`}
                            className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95"
                          >
                            {t('btn_call_now')}
                          </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          ) : (
            <div className="p-12 text-center text-stone-400 font-bold">
               No records found.
            </div>
          )}
        </div>
      </div>

      {playerQuery && (
        <AudioPlayerBar 
          query={playerQuery.query} 
          mode={playerQuery.mode} 
          onClose={() => setPlayerQuery(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
