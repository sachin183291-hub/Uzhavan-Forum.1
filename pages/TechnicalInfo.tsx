import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

const TechnicalInfo: React.FC = () => {
  const { t } = useLanguage();
  
  const sqlExamples = [
    {
      table: 'Farmer',
      sql: `CREATE TABLE Farmer (
  FarmerID INT PRIMARY KEY AUTO_INCREMENT,
  Name VARCHAR(100),
  Location VARCHAR(100),
  State VARCHAR(100),
  PrimaryCrop VARCHAR(50),
  TrustScore INT DEFAULT 0,
  RegistrationDate DATE
);`
    },
    {
      table: 'Farmer_Query',
      sql: `CREATE TABLE Farmer_Query (
  QueryID INT PRIMARY KEY AUTO_INCREMENT,
  FarmerID INT,
  CropType VARCHAR(50),
  Category ENUM('Disease', 'Pest', 'Fertilizer', 'General'),
  State VARCHAR(100),
  Content TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID)
);`
    },
    {
      table: 'Farmer_Reply',
      sql: `CREATE TABLE Farmer_Reply (
  ReplyID INT PRIMARY KEY AUTO_INCREMENT,
  QueryID INT,
  FarmerID INT,
  Content TEXT,
  HelpfulCount INT DEFAULT 0,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (QueryID) REFERENCES Farmer_Query(QueryID),
  FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID)
);`
    },
    {
      table: 'Reply_Feedback',
      sql: `CREATE TABLE Reply_Feedback (
  FeedbackID INT PRIMARY KEY AUTO_INCREMENT,
  ReplyID INT,
  VoterFarmerID INT,
  VoteType ENUM('Helpful', 'Report'),
  FOREIGN KEY (ReplyID) REFERENCES Farmer_Reply(ReplyID)
);`
    }
  ];

  return (
    <div className="py-20 bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="heading-font text-5xl font-black text-emerald-900 dark:text-emerald-400 mb-4 tracking-tighter">{t('tech_info_title')}</h1>
          <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto font-bold">{t('tech_info_subtitle')}</p>
        </div>

        {/* Database Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-black text-stone-800 dark:text-stone-100 mb-8 border-l-8 border-emerald-600 pl-6 tracking-tight">{t('tech_info_db_title')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-bold text-lg">
                {t('tech_info_db_p1')}
              </p>
              <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-xl transition-all">
                  <h4 className="font-black text-emerald-700 dark:text-emerald-400 mb-3 uppercase text-xs tracking-widest">Forum Relational Model</h4>
                  <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-bold">Peer feedback loops directly influence farmer trust scores within the DBMS, ensuring community-driven authority.</p>
                </div>
                <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-xl transition-all">
                  <h4 className="font-black text-emerald-700 dark:text-emerald-400 mb-3 uppercase text-xs tracking-widest">{t('tech_info_db_feedback_title')}</h4>
                  <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-bold">{t('tech_info_db_feedback_desc')}</p>
                </div>
              </div>
            </div>
            <div className="bg-stone-900 rounded-[3rem] p-10 overflow-hidden shadow-3xl border border-emerald-800/30 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
              <div className="flex items-center space-x-2 mb-8 pb-4 border-b border-white/10">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <span className="text-stone-500 text-[10px] font-black uppercase tracking-[0.3em] ml-6">krishi_forum_schema.sql</span>
              </div>
              <div className="space-y-10 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                {sqlExamples.map((item, idx) => (
                  <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="text-emerald-400 text-[10px] font-black uppercase mb-3 flex items-center tracking-widest opacity-80">
                      <i className="fas fa-table mr-3"></i> {item.table} Table
                    </div>
                    <pre className="text-stone-300 font-mono text-[11px] leading-relaxed overflow-x-auto bg-stone-800/80 p-6 rounded-2xl border border-white/5 shadow-inner">
                      <code>{item.sql}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Personalization Section */}
        <section className="mb-20 bg-emerald-900 dark:bg-stone-900 text-white rounded-[4rem] p-12 md:p-20 shadow-3xl relative overflow-hidden transition-colors duration-300">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[150px] opacity-10 -mr-48 -mb-48"></div>
          <div className="max-w-4xl relative z-10">
            <h2 className="text-4xl font-black mb-10 tracking-tighter">{t('tech_info_personalization_title')}</h2>
            <p className="text-emerald-100/80 dark:text-stone-300 text-xl mb-14 leading-relaxed font-bold">
              {t('tech_info_personalization_p1')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { key: 'agro', icon: 'fa-map-location-dot', color: 'amber' },
                { key: 'phytosanitary', icon: 'fa-shield-virus', color: 'blue' },
                { key: 'memory', icon: 'fa-microchip', color: 'emerald' }
              ].map(item => (
                <div key={item.key} className="border border-white/10 p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all hover:-translate-y-2">
                  <div className={`w-14 h-14 bg-${item.color}-400/20 text-${item.color}-400 rounded-2xl flex items-center justify-center mb-8 shadow-inner`}>
                    <i className={`fas ${item.icon} text-2xl`}></i>
                  </div>
                  <h4 className="font-black mb-4 text-xl tracking-tight">{t(`tech_info_${item.key}_title`)}</h4>
                  <p className="text-xs text-emerald-200/60 dark:text-stone-400 leading-relaxed font-bold">{t(`tech_info_${item.key}_desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="animate-fade-in">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tighter">{t('tech_info_roadmap_title')}</h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2 font-black uppercase text-[10px] tracking-[0.4em]">{t('tech_info_roadmap_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { key: 'iot', icon: 'fa-satellite-dish', color: 'blue' },
              { key: 'supply', icon: 'fa-truck-ramp-box', color: 'orange' }
            ].map(item => (
              <div key={item.key} className="bg-white dark:bg-stone-900 p-12 rounded-[3.5rem] border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-center md:items-start group hover:border-emerald-500 transition-all">
                <div className={`w-20 h-20 bg-${item.color}-50 dark:bg-${item.color}-950/30 text-${item.color}-600 dark:text-${item.color}-400 rounded-[2rem] flex items-center justify-center mb-8 md:mb-0 md:mr-10 shrink-0 group-hover:scale-110 transition-all`}>
                  <i className={`fas ${item.icon} text-3xl`}></i>
                </div>
                <div>
                  <h4 className="font-black text-2xl mb-4 text-stone-900 dark:text-stone-100 tracking-tight">{t(`tech_info_${item.key}_title`)}</h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-bold">{t(`tech_info_${item.key}_desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TechnicalInfo;