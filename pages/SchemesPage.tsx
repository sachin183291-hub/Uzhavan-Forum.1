
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Scheme, FarmerProfile } from '../types';

const SchemesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [search, setSearch] = useState('');
  const [redirectingTo, setRedirectingTo] = useState<string | null>(null);

  useEffect(() => {
    const profileStr = localStorage.getItem('farmerProfile');
    if (profileStr) setProfile(JSON.parse(profileStr));
  }, []);

  const SCHEMES_LIST = [
    {
      id: 's1',
      nameKey: 'scheme_pmkisan_name',
      descKey: 'scheme_pmkisan_desc',
      authority: t('schemes_central'),
      url: 'https://pmkisan.gov.in/'
    },
    {
      id: 's2',
      nameKey: 'scheme_pmfby_name',
      descKey: 'scheme_pmfby_desc',
      authority: t('schemes_central'),
      url: 'https://pmfby.gov.in/'
    },
    {
      id: 's3',
      nameKey: 'scheme_kcc_name',
      descKey: 'scheme_kcc_desc',
      authority: t('schemes_central'),
      url: 'https://www.myscheme.gov.in/schemes/kcc'
    },
    {
      id: 's4',
      nameKey: 'scheme_shc_name',
      descKey: 'scheme_shc_desc',
      authority: t('schemes_central'),
      url: 'https://soilhealth.dac.gov.in/'
    },
    {
      id: 's5',
      nameKey: 'scheme_pkvy_name',
      descKey: 'scheme_pkvy_desc',
      authority: t('schemes_central'),
      url: 'https://pgsindia-ncof.dac.gov.in/pkvy/index.aspx'
    },
    {
      id: 's6',
      nameKey: 'scheme_pmksy_name',
      descKey: 'scheme_pmksy_desc',
      authority: t('schemes_central'),
      url: 'https://pmksy.gov.in/'
    },
    {
      id: 's7',
      nameKey: 'scheme_nmsa_name',
      descKey: 'scheme_nmsa_desc',
      authority: t('schemes_central'),
      url: 'https://nmsa.dac.gov.in/'
    }
  ];

  const handleRedirection = (url: string) => {
    setRedirectingTo(url);
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
      setRedirectingTo(null);
    }, 1500);
  };

  const filteredSchemes = useMemo(() => {
    return SCHEMES_LIST.filter(s => 
      t(s.nameKey).toLowerCase().includes(search.toLowerCase()) || 
      t(s.descKey).toLowerCase().includes(search.toLowerCase())
    );
  }, [search, t]);

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-16 transition-colors duration-300">
      {redirectingTo && (
        <div className="fixed inset-0 bg-emerald-950/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white animate-fade-in">
           <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl animate-pulse">
             <i className="fas fa-external-link-alt text-3xl"></i>
           </div>
           <h3 className="heading-font text-4xl font-black mb-4">Connecting...</h3>
           <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Secure Gateway Redirection</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 animate-fade-in">
          <div className="inline-flex px-4 py-1.5 bg-emerald-900 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-6">Agri-Registry Verified</div>
          <h1 className="heading-font text-6xl md:text-8xl font-black text-stone-900 dark:text-stone-100 tracking-tighter leading-[0.85]">
            {t('schemes_title')} <span className="text-emerald-600">{t('schemes_discovery')}.</span>
          </h1>
          <p className="text-xl text-stone-500 dark:text-stone-400 font-medium mt-8 max-w-2xl leading-relaxed">
            {t('schemes_subtitle')}
          </p>
        </div>

        <div className="mb-16 relative max-w-2xl group">
           <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-emerald-600 transition-colors"></i>
           <input 
             type="text" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder={t('nav_search_placeholder')}
             className="w-full pl-16 pr-8 py-7 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2.5rem] outline-none font-bold shadow-xl shadow-stone-100 dark:shadow-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredSchemes.map((scheme) => (
             <div key={scheme.id} className="bg-white dark:bg-stone-900 rounded-[4rem] border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden animate-fade-in flex flex-col group hover:shadow-3xl transition-all">
                <div className="p-12 flex-grow">
                   <div className="flex justify-between items-start mb-8">
                      <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                         {scheme.authority}
                      </div>
                      <div className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-300 group-hover:text-emerald-500 transition-colors">
                        <i className="fas fa-shield-heart text-lg"></i>
                      </div>
                   </div>
                   <h3 className="text-3xl font-black text-stone-900 dark:text-stone-100 mb-6 tracking-tighter leading-[0.95] group-hover:text-emerald-900 dark:group-hover:text-emerald-400 transition-colors">{t(scheme.nameKey)}</h3>
                   <p className="text-stone-500 dark:text-stone-400 font-bold mb-10 leading-relaxed text-sm">{t(scheme.descKey)}</p>
                </div>
                <div className="px-12 py-10 bg-stone-50 dark:bg-stone-800/30 border-t border-stone-100 dark:border-stone-800">
                   <button onClick={() => handleRedirection(scheme.url)} className="w-full bg-emerald-900 dark:bg-emerald-700 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:bg-black transition-all">
                      {t('schemes_proceed_portal')}
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default SchemesPage;
