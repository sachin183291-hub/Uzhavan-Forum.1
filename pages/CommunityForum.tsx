
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CommunityQuery, CommunityReply, FarmerProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

const STATE_DISTRICTS: Record<string, string[]> = {
  'Kerala': ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul'],
};

const CATEGORIES = ['Disease', 'Pest', 'Fertilizer', 'Weather', 'Market', 'General'];

const CommunityForum: React.FC = () => {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [queries, setQueries] = useState<CommunityQuery[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      setNewQuery(prev => ({ ...prev, imageData: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setNewQuery(prev => ({ ...prev, imageData: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [newQuery, setNewQuery] = useState({
    cropType: '',
    category: 'General' as CommunityQuery['category'],
    content: '',
    district: '',
    imageData: ''
  });

  useEffect(() => {
    const profileStr = localStorage.getItem('farmerProfile');
    if (profileStr) {
      const p = JSON.parse(profileStr);
      setProfile(p);
      setNewQuery(prev => ({ ...prev, district: p.district || '' }));
    }
    loadForum();
  }, []);

  const loadForum = () => {
    const db = JSON.parse(localStorage.getItem('community_forum_db') || '[]');
    setQueries(Array.isArray(db) ? db : []);
  };

  const handlePostQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const query: CommunityQuery = {
      id: 'FQ-' + Date.now(),
      farmerId: profile.id,
      farmerName: profile.name,
      location: profile.address,
      state: profile.state,
      district: newQuery.district || profile.district,
      cropType: newQuery.cropType,
      category: newQuery.category,
      content: newQuery.content,
      imageUrl: newQuery.imageData,
      timestamp: new Date().toLocaleString(),
      replies: [],
      status: 'Open'
    };

    const updated = [query, ...queries];
    localStorage.setItem('community_forum_db', JSON.stringify(updated));
    setQueries(updated);
    setShowPostForm(false);
    setImagePreview(null);
    setNewQuery({ cropType: '', category: 'General', content: '', district: '', imageData: '' });
  };

  const handleReply = (queryId: string, content: string) => {
    if (!profile || !content.trim()) return;
    const reply: CommunityReply = {
      id: 'FR-' + Date.now(),
      queryId,
      farmerId: profile.id,
      farmerName: profile.name,
      farmerLocation: profile.address,
      farmerExp: profile.experience,
      content,
      helpfulCount: 0,
      timestamp: new Date().toLocaleString(),
      votedBy: []
    };
    const updated = queries.map(q => q.id === queryId ? { ...q, replies: [...(q.replies || []), reply] } : q);
    localStorage.setItem('community_forum_db', JSON.stringify(updated));
    setQueries(updated);
  };

  const filteredQueries = useMemo(() => {
    let results = Array.isArray(queries) ? queries : [];
    if (profile?.state) results = results.filter(q => q.state === profile.state);
    if (selectedDistrict !== 'All') results = results.filter(q => q.district === selectedDistrict);
    return results;
  }, [queries, selectedDistrict, profile]);

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-12 transition-colors">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.4em] mb-2 block">{t('forum_peer_network')}</span>
            <h1 className="heading-font text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tighter">{t('forum_title')}</h1>
          </div>
          <button onClick={() => setShowPostForm(!showPostForm)} className="bg-emerald-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl">
            {showPostForm ? t('login_btn_cancel') : t('forum_btn_post')}
          </button>
        </div>

        {showPostForm && (
          <div className="bg-white dark:bg-stone-900 p-10 rounded-[3rem] shadow-xl border border-stone-100 dark:border-stone-800 mb-12 animate-fade-in">
            <form onSubmit={handlePostQuery} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4">{t('forum_label_crop')}</label>
                  <input type="text" value={newQuery.cropType} onChange={(e) => setNewQuery({ ...newQuery, cropType: e.target.value })} className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4">{t('forum_label_category')}</label>
                  <select value={newQuery.category} onChange={(e) => setNewQuery({ ...newQuery, category: e.target.value as any })} className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl outline-none font-bold">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4">{t('forum_label_district')}</label>
                  <select value={newQuery.district} onChange={(e) => setNewQuery({ ...newQuery, district: e.target.value })} className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl outline-none font-bold">
                    {(STATE_DISTRICTS[profile?.state || ''] || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <textarea rows={5} value={newQuery.content} onChange={(e) => setNewQuery({ ...newQuery, content: e.target.value })} placeholder={t('forum_label_inquiry')} className="w-full px-8 py-6 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-[2rem] outline-none font-bold" />
              {/* Photo Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative rounded-[2rem] overflow-hidden border-2 border-emerald-400/40 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white text-stone-900 rounded-xl font-black text-xs uppercase tracking-widest">
                      <i className="fas fa-redo mr-1" />Change
                    </button>
                    <button type="button" onClick={clearImage} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest">
                      <i className="fas fa-times mr-1" />Remove
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-emerald-600/90 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <i className="fas fa-check" />Photo Added
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-[2rem] flex items-center justify-center gap-4 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group"
                >
                  <div className="w-11 h-11 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                    <i className="fas fa-camera text-stone-400 group-hover:text-emerald-500 text-lg transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-stone-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Add Photo (optional)</p>
                    <p className="text-[10px] text-stone-400 font-bold mt-0.5">JPG, PNG up to 5MB</p>
                  </div>
                </button>
              )}
              <button type="submit" className="w-full py-6 bg-emerald-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px]">
                {t('forum_btn_submit')}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-12">
          {filteredQueries.map(q => (
            <div key={q.id} className="bg-white dark:bg-stone-900 rounded-[3.5rem] shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden group p-10">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-xl font-black text-stone-900 dark:text-stone-100">{q.farmerName}</h4>
                <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[8px] font-black uppercase rounded-full tracking-widest">{q.category}</span>
              </div>
              <p className="text-lg font-bold text-stone-700 dark:text-stone-300 leading-relaxed mb-6">{q.content}</p>
              {q.imageUrl && (
                <div className="mb-6 rounded-[2rem] overflow-hidden">
                  <img src={q.imageUrl} alt="Post photo" className="w-full max-h-72 object-cover" />
                </div>
              )}
              <div className="flex gap-4 text-xs font-bold text-stone-400 mb-6">
                <span><i className="fas fa-layer-group mr-2"></i> {t('forum_label_category')}: {q.category}</span>
                <span><i className="fas fa-location-dot mr-2"></i> {t('forum_label_district')}: {q.district}</span>
              </div>
              <div className="space-y-6 pt-10 border-t border-stone-50 dark:border-stone-800">
                <h5 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">{t('forum_suggestions_title')} ({(q.replies || []).length})</h5>
                {q.replies?.map(r => (
                  <div key={r.id} className="bg-stone-50 dark:bg-stone-950 p-6 rounded-[2.5rem] border border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-black text-emerald-600 mb-2">{r.farmerName} • {r.farmerExp} Yrs Exp</p>
                    <p className="text-sm font-bold text-stone-600 dark:text-stone-400">{r.content}</p>
                  </div>
                ))}
                <input onKeyDown={(e) => { if (e.key === 'Enter') { handleReply(q.id, (e.target as any).value); (e.target as any).value = ''; } }} placeholder={t('forum_reply_placeholder')} className="w-full px-8 py-5 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-3xl outline-none text-sm font-bold" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;
