
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { Language } from '../types.ts';

const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(localStorage.getItem('userRole'));
  const [farmerName, setFarmerName] = useState('Farmer');
  const [isOnboarding, setIsOnboarding] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const currentRole = localStorage.getItem('userRole');
      setRole(currentRole);

      const profileStr = localStorage.getItem('farmerProfile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        setFarmerName(profile.name || t('nav_farmer_role'));
        setIsOnboarding(!profile.onboardingComplete && currentRole === 'Farmer');
      } else if (currentRole === 'Farmer') {
        setIsOnboarding(true);
      } else {
        setIsOnboarding(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location.pathname, t]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) docEl.requestFullscreen();
    } else {
      const doc = document as any;
      if (doc.exitFullscreen) doc.exitFullscreen();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUserPhone');
    localStorage.removeItem('farmerProfile');
    setRole(null);
    setIsOpen(false);
    setProfileOpen(false);
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const navItems = useMemo(() => {
    const baseItems = [
      { label: t('nav_home'), path: '/' },
      { label: t('nav_guardian'), path: '/guardian' }
    ];

    if (role === 'Officer') {
      return [
        ...baseItems,
        { label: t('nav_dashboard'), path: '/dashboard' },
        { label: t('nav_tech'), path: '/technical' }
      ];
    }

    if (role === 'Farmer') {
      // Primary (always visible in desktop bar)
      return [
        { label: t('nav_home'), path: '/' },
        { label: t('nav_guardian'), path: '/guardian' },
        { label: t('nav_elam'), path: '/elam' },
        { label: t('nav_query'), path: '/query' },
      ];
    }

    return baseItems;
  }, [role, t]);

  // Secondary items shown in "More" dropdown for Farmer
  const secondaryItems = useMemo(() => {
    if (role !== 'Farmer') return [];
    return [
      { label: t('nav_live'), path: '/live-chat', icon: 'fa-comments' },
      { label: t('nav_community'), path: '/community', icon: 'fa-users' },
      { label: t('nav_schemes'), path: '/schemes', icon: 'fa-file-invoice' },
      { label: t('nav_weather'), path: '/weather', icon: 'fa-cloud-sun' },
      { label: t('nav_loans'), path: '/loans', icon: 'fa-landmark' },
      { label: t('nav_store'), path: '/store', icon: 'fa-store' },
    ];
  }, [role, t]);

  const languages: Language[] = ['English', 'Malayalam', 'Tamil'];

  // Hide Navbar during onboarding for farmers
  if (isOnboarding && location.pathname === '/onboarding') {
    return null;
  }

  return (
    <nav className="bg-emerald-900 text-white shadow-2xl sticky top-0 z-50 border-b border-emerald-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="bg-emerald-500 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
              <i className="fas fa-leaf text-white text-xl"></i>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic hidden lg:block">UzhavanForum</span>
          </Link>

          {role && (
            <div className="hidden md:flex flex-grow max-w-xs mx-6">
              <form onSubmit={handleSearch} className="relative w-full">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60 text-xs"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav_search_placeholder')}
                  className="w-full bg-emerald-800/40 border border-emerald-700/50 rounded-xl py-2 pl-9 pr-3 text-xs font-medium placeholder:text-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </form>
            </div>
          )}

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-xs font-bold tracking-wide transition-all hover:text-emerald-400 whitespace-nowrap ${location.pathname === item.path ? 'text-emerald-400' : 'text-stone-300'
                    }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* More dropdown for Farmer secondary links */}
              {secondaryItems.length > 0 && (
                <div className="relative" ref={moreRef}>
                  <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={`flex items-center gap-1.5 text-xs font-bold tracking-wide transition-all hover:text-emerald-400 ${secondaryItems.some(i => location.pathname === i.path) ? 'text-emerald-400' : 'text-stone-300'
                      }`}
                  >
                    More
                    <i className={`fas fa-chevron-down text-[9px] transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {moreOpen && (
                    <div className="absolute left-0 top-full mt-3 w-44 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-100 dark:border-stone-800 py-2 animate-fade-in z-50">
                      {secondaryItems.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMoreOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors ${location.pathname === item.path
                            ? 'text-emerald-600'
                            : 'text-stone-600 dark:text-stone-300'
                            }`}
                        >
                          <i className={`fas ${item.icon} text-emerald-500 w-4 text-center`} />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {role === 'Farmer' && (
                <Link to="/checkout" className="relative group p-2">
                  <i className="fas fa-shopping-cart text-base text-emerald-400 group-hover:text-emerald-300"></i>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={toggleFullscreen}
                className="w-8 h-8 flex items-center justify-center bg-emerald-800/30 border border-emerald-700/50 hover:bg-emerald-800/60 rounded-lg transition-all text-emerald-400"
                title="Toggle Fullscreen"
              >
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-xs`}></i>
              </button>

              <button
                onClick={() => setIsDark(!isDark)}
                className="w-8 h-8 flex items-center justify-center bg-emerald-800/30 border border-emerald-700/50 hover:bg-emerald-800/60 rounded-lg transition-all text-emerald-400"
                title="Toggle Theme"
              >
                <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-xs`}></i>
              </button>

              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center space-x-1 bg-emerald-800/30 hover:bg-emerald-800/50 px-2.5 py-1.5 rounded-lg border border-emerald-700 transition-all text-xs font-bold"
                >
                  <i className="fas fa-globe text-xs"></i>
                  <span>{language === 'English' ? 'EN' : language === 'Malayalam' ? 'ML' : 'TA'}</span>
                  <i className="fas fa-caret-down text-[9px]"></i>
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-stone-100 py-2 text-stone-800 animate-fade-in dark:bg-stone-900 dark:border-stone-800 dark:text-stone-200">
                    {languages.map((l) => (
                      <button
                        key={l}
                        onClick={() => { setLanguage(l); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-emerald-50 transition-colors dark:hover:bg-emerald-950 ${language === l ? 'text-emerald-600' : 'text-stone-600 dark:text-stone-400'}`}
                      >
                        {l === 'English' ? 'English' : l === 'Malayalam' ? 'മലയാളം' : 'தமிழ்'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {role === 'Farmer' ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 bg-emerald-800/50 hover:bg-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-700 transition-all"
                >
                  <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-black shadow-inner">
                    {farmerName.charAt(0)}
                  </div>
                  <span className="text-xs font-bold truncate max-w-[70px]">{farmerName}</span>
                  <i className={`fas fa-chevron-down text-[9px] transition-transform ${profileOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-stone-100 py-3 text-stone-800 animate-fade-in dark:bg-stone-900 dark:border-stone-800 dark:text-stone-200">
                    <div className="px-6 py-3 border-b border-stone-100 mb-2 dark:border-stone-800">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('nav_farmer_role')}</p>
                      <p className="font-bold text-sm truncate">{farmerName}</p>
                    </div>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center px-6 py-3 text-sm font-bold hover:bg-stone-50 transition-colors dark:hover:bg-stone-800">
                      <i className="fas fa-user-circle mr-3 text-emerald-600"></i> {t('nav_profile')}
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center px-6 py-3 text-sm font-bold hover:bg-red-50 text-red-600 transition-colors border-t border-stone-50 mt-2 dark:border-stone-800 dark:hover:bg-red-950/20">
                      <i className="fas fa-sign-out-alt mr-3"></i> {t('nav_logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : role === 'Officer' ? (
              <button onClick={handleLogout} className="bg-white text-emerald-900 px-5 py-2 rounded-xl text-xs font-black hover:bg-stone-100 transition-all shadow-xl">
                {t('nav_officer_logout')}
              </button>
            ) : (
              <Link to="/login" className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                {t('btn_login')}
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-3">
            {role === 'Farmer' && (
              <Link to="/checkout" className="relative p-2">
                <i className="fas fa-shopping-cart text-lg text-emerald-400"></i>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <button onClick={toggleFullscreen} className="w-9 h-9 flex items-center justify-center bg-emerald-800 p-2 rounded-lg text-emerald-400">
              <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>
            <button onClick={() => setIsDark(!isDark)} className="w-9 h-9 flex items-center justify-center bg-emerald-800 p-2 rounded-lg text-emerald-400">
              <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-xl bg-emerald-800 text-white">
              <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-emerald-950 border-t border-emerald-800 px-4 pt-4 pb-8 space-y-4 animate-fade-in">
          {role && (
            <form onSubmit={handleSearch} className="relative mx-4">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/60 text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav_search_placeholder')}
                className="w-full bg-emerald-900 border border-emerald-800 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </form>
          )}
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-bold ${location.pathname === item.path ? 'bg-emerald-800 text-white' : 'text-stone-300'
                  }`}
              >
                {item.label}
              </Link>
            ))}
            {!role && (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-bold text-emerald-400 bg-emerald-900"
              >
                {t('btn_login')}
              </Link>
            )}
            {/* AXIS Hardware shortcut in mobile drawer */}
            <Link
              to="/axis-login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-cyan-300 bg-cyan-900/20 border border-cyan-500/20"
            >
              <i className="fas fa-microchip text-cyan-400" />
              AXIS Hardware Access
            </Link>
          </div>
          {role && (
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-base font-bold text-red-400 bg-red-950/20">
              {t('nav_logout')}
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
