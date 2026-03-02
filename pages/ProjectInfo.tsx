import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

const ProjectInfo: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="py-20 bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="heading-font text-5xl font-black text-emerald-900 dark:text-emerald-400 mb-4 tracking-tighter">{t('project_info_title')}</h1>
          <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto font-medium">{t('project_info_subtitle')}</p>
        </div>

        {/* Sections */}
        <div className="space-y-20">
          
          {/* About Project */}
          <section id="about" className="bg-white dark:bg-stone-900 p-8 md:p-12 rounded-[3rem] shadow-sm border border-stone-100 dark:border-stone-800 transition-colors duration-300">
            <h2 className="text-3xl font-black text-emerald-800 dark:text-emerald-400 mb-6 flex items-center tracking-tight">
              <i className="fas fa-info-circle mr-4"></i> {t('project_info_about_title')}
            </h2>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed mb-8 font-medium">
              {t('project_info_about_p1')}
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-8 rounded-3xl border-l-8 border-emerald-500 shadow-inner">
              <p className="text-emerald-900 dark:text-emerald-400 font-black uppercase text-xs tracking-widest">{t('project_info_goal')}</p>
            </div>
          </section>

          {/* Problem Statement */}
          <section id="problem" className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-black text-stone-800 dark:text-stone-100 mb-6 flex items-center tracking-tight">
                <i className="fas fa-exclamation-triangle text-amber-500 mr-4"></i> {t('project_info_problem_title')}
              </h2>
              <ul className="space-y-6">
                {[1, 2, 3].map(num => (
                  <li key={num} className="flex items-start group">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mt-1 mr-4 shrink-0 transition-transform group-hover:scale-110">
                      <i className="fas fa-check text-xs"></i>
                    </div>
                    <span className="text-stone-700 dark:text-stone-300 font-bold leading-relaxed">{t(`project_info_problem_${num}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-stone-200 dark:bg-stone-800 rounded-[3rem] overflow-hidden shadow-inner h-80 flex items-center justify-center transition-colors duration-300 border-4 border-white dark:border-stone-700">
              <i className="fas fa-cloud-sun-rain text-9xl text-stone-400 dark:text-stone-600 animate-pulse"></i>
            </div>
          </section>

          {/* Proposed Solution */}
          <section id="solution" className="bg-emerald-900 dark:bg-stone-900 text-white p-8 md:p-16 rounded-[4rem] shadow-3xl border border-emerald-800 dark:border-stone-800 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <h2 className="text-4xl font-black mb-12 flex items-center tracking-tighter relative z-10">
              <i className="fas fa-lightbulb text-amber-400 mr-6"></i> {t('project_info_solution_title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {[
                { key: 'ai', icon: 'fa-brain-circuit' },
                { key: 'personalization', icon: 'fa-user-gear' },
                { key: 'officer', icon: 'fa-headset' },
                { key: 'dbms', icon: 'fa-database' }
              ].map(item => (
                <div key={item.key} className="bg-emerald-800/40 dark:bg-stone-800/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-colors">
                  <i className={`fas ${item.icon} text-emerald-400 text-2xl mb-4`}></i>
                  <h3 className="text-xl font-black mb-3 tracking-tight">{t(`project_info_solution_${item.key}_title`)}</h3>
                  <p className="text-emerald-100/70 dark:text-stone-400 text-sm leading-relaxed font-medium">{t(`project_info_solution_${item.key}_desc`)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it Works */}
          <section id="how-it-works" className="animate-fade-in">
            <h2 className="text-4xl font-black text-emerald-900 dark:text-stone-100 mb-16 text-center tracking-tighter">{t('project_info_how_title')}</h2>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0 md:space-x-4 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 dark:bg-stone-800 hidden md:block -translate-y-1/2 -z-10"></div>
              {[1, 2, 3, 4].map(num => (
                <div key={num} className="flex flex-col items-center text-center max-w-[220px] bg-stone-50 dark:bg-stone-950 px-4">
                  <div className="w-20 h-20 bg-white dark:bg-stone-900 rounded-[2rem] shadow-xl flex items-center justify-center mb-6 border-4 border-emerald-600 transition-transform hover:scale-110">
                    <span className="font-black text-2xl text-emerald-600">{num}</span>
                  </div>
                  <h4 className="font-black text-stone-900 dark:text-stone-100 mb-2 uppercase text-xs tracking-widest">{t(`project_info_step_${num}_title`)}</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-bold leading-relaxed">{t(`project_info_step_${num}_desc`)}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;