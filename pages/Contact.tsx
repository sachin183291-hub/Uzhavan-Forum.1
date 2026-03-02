import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

const Contact: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-stone-50 dark:bg-stone-950 py-20 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="heading-font text-5xl font-black text-emerald-900 dark:text-emerald-400 mb-4 tracking-tighter">{t('contact_title')}</h1>
          <p className="text-stone-600 dark:text-stone-400 font-bold">{t('contact_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-stone-900 p-8 rounded-[3rem] shadow-sm border border-stone-100 dark:border-stone-800 flex items-start group">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mr-6 shrink-0 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
                <i className="fas fa-envelope text-xl"></i>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{t('contact_label_email')}</h4>
                <p className="text-lg font-black text-emerald-950 dark:text-stone-100">support@digitalkrishi.com</p>
              </div>
            </div>
            
            <div className="bg-emerald-900 dark:bg-stone-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden transition-colors duration-300">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <h4 className="font-black uppercase text-[10px] tracking-widest mb-4 opacity-60">Emergency Advisory</h4>
               <p className="text-xl font-bold leading-snug">Our AI engine monitors queries 24/7. Critical escalations are handled within 4 hours by certified officers.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-10 rounded-[4rem] shadow-sm border border-stone-100 dark:border-stone-800 transition-colors duration-300">
            <form className="space-y-6">
              <div className="group">
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4">{t('contact_placeholder_name')}</label>
                <input type="text" placeholder={t('contact_placeholder_name')} className="w-full px-8 py-5 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/20 font-bold dark:text-stone-100" />
              </div>
              <div className="group">
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4">{t('contact_placeholder_msg')}</label>
                <textarea rows={4} placeholder={t('contact_placeholder_msg')} className="w-full px-8 py-5 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-3xl outline-none resize-none focus:ring-4 focus:ring-emerald-500/20 font-bold dark:text-stone-100"></textarea>
              </div>
              <button className="w-full bg-emerald-900 dark:bg-emerald-700 text-white font-black uppercase tracking-[0.4em] text-xs py-7 rounded-[2rem] shadow-2xl hover:bg-black transition-all active:scale-95">
                {t('contact_send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;