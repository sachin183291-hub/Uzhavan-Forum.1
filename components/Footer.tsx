
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.tsx';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    const currentRole = localStorage.getItem('userRole');
    const profileStr = localStorage.getItem('farmerProfile');
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      setIsOnboarding(!profile.onboardingComplete && currentRole === 'Farmer');
    } else if (currentRole === 'Farmer') {
      setIsOnboarding(true);
    } else {
      setIsOnboarding(false);
    }
  }, [location.pathname]);

  if (isOnboarding && location.pathname === '/onboarding') {
    return null;
  }

  return (
    <footer className="bg-stone-900 text-stone-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">UzhavanForum</h3>
            <p className="text-sm">
              {t('footer_desc')}
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t('footer_quick_links')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#/about" className="hover:text-emerald-400 transition-colors">{t('nav_about')}</a></li>
              <li><a href="#/technical" className="hover:text-emerald-400 transition-colors">{t('nav_tech')}</a></li>
              <li><a href="#/query" className="hover:text-emerald-400 transition-colors">{t('nav_query')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t('footer_contact_support')}</h3>
            <p className="text-sm mb-4">
              For expert assistance and partnership inquiries:<br />
              Email: support@uzhavanforum.com<br />
              Location: Global Agri-Intelligence Network
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"><i className="fab fa-twitter"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"><i className="fab fa-linkedin"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"><i className="fab fa-github"></i></a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0">
          <p>&copy; {new Date().getFullYear()} UzhavanForum. All Rights Reserved.</p>
          <div className="px-4 py-1 bg-emerald-900/50 border border-emerald-800 text-emerald-400 rounded-full font-black uppercase tracking-widest text-[10px]">
            Student Innovation Project
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
