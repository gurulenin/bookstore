import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { BookOpen, Headphones, ShoppingBag, FileText, Info, Mail, Settings, Menu, X, Heart, PenLine, ChevronDown, BookMarked, Image } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import LanguageSwitcher from './LanguageSwitcher';
import FontSizeSwitcher from './FontSizeSwitcher';
import ThemeToggle from './ThemeToggle';
import { supabase } from '../lib/supabase';

type AppView = 'home' | 'books' | 'ebooks' | 'audiobooks' | 'contribute' | 'contribute_ebooks' | 'contribute_covers' | 'contribute_audiobooks' | 'donate' | 'blog' | 'about' | 'about_us' | 'kaniyam' | 'freetamilebooks' | 'nutpagam' | 'printhink' | 'contact' | 'admin' | 'publish' | string;

interface NavbarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

interface MenuSetting {
  menu_key: string;
  menu_label: string;
  menu_label_tamil: string;
  is_enabled: boolean;
  order_index: number;
  parent_key?: string | null;
}

const BOOKS_SUBKEYS = new Set(['books', 'ebooks', 'audiobooks']);
const CONTRIBUTE_VIEWS = new Set(['contribute', 'contribute_ebooks', 'contribute_covers', 'contribute_audiobooks', 'donate']);
const ABOUT_VIEWS = new Set(['about', 'about_us', 'kaniyam', 'freetamilebooks', 'nutpagam', 'printhink']);

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { language } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [booksDropdownOpen, setBooksDropdownOpen] = useState(false);
  const [mobileBooksOpen, setMobileBooksOpen] = useState(false);
  const [contributeDropdownOpen, setContributeDropdownOpen] = useState(false);
  const [mobileContributeOpen, setMobileContributeOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [menus, setMenus] = useState<MenuSetting[]>([]);
  const desktopSettingsRef = useRef<HTMLDivElement>(null);
  const mobileSettingsRef = useRef<HTMLDivElement>(null);
  const booksDropdownRef = useRef<HTMLDivElement>(null);
  const contributeDropdownRef = useRef<HTMLDivElement>(null);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!desktopSettingsRef.current?.contains(target) && !mobileSettingsRef.current?.contains(target)) {
        setSettingsOpen(false);
      }
      if (!booksDropdownRef.current?.contains(target)) {
        setBooksDropdownOpen(false);
      }
      if (!contributeDropdownRef.current?.contains(target)) {
        setContributeDropdownOpen(false);
      }
      if (!aboutDropdownRef.current?.contains(target)) {
        setAboutDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { loadMenus(); }, []);

  const loadMenus = async () => {
    const { data } = await supabase
      .from('menu_settings')
      .select('*')
      .order('order_index');
    if (data) setMenus(data);
  };

  const handleLogoClick = useCallback(() => {
    logoClickCountRef.current += 1;
    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
    if (logoClickCountRef.current >= 3) {
      logoClickCountRef.current = 0;
      onViewChange('admin');
      setMobileMenuOpen(false);
      return;
    }
    logoClickTimerRef.current = setTimeout(() => {
      if (logoClickCountRef.current < 3) {
        onViewChange('home');
        setMobileMenuOpen(false);
      }
      logoClickCountRef.current = 0;
    }, 400);
  }, [onViewChange]);

  const handleNavClick = (view: AppView) => {
    onViewChange(view);
    setMobileMenuOpen(false);
    setBooksDropdownOpen(false);
    setContributeDropdownOpen(false);
    setAboutDropdownOpen(false);
  };

  const getMenuIcon = (menuKey: string, className: string) => {
    switch (menuKey) {
      case 'books': return <ShoppingBag className={className} />;
      case 'ebooks': return <BookOpen className={className} />;
      case 'audiobooks': return <Headphones className={className} />;
      case 'contribute': return <Heart className={className} />;
      case 'blog': return <FileText className={className} />;
      case 'about': return <Info className={className} />;
      case 'contact': return <Mail className={className} />;
      case 'publish': return <PenLine className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const topLevelEnabled = menus.filter(m => m.is_enabled && !m.parent_key && m.menu_key !== 'admin');
  const booksMenus = topLevelEnabled.filter(m => BOOKS_SUBKEYS.has(m.menu_key));
  const contributeMenu = topLevelEnabled.find(m => m.menu_key === 'contribute');
  const aboutMenu = topLevelEnabled.find(m => m.menu_key === 'about');
  const otherMenus = topLevelEnabled.filter(m => !BOOKS_SUBKEYS.has(m.menu_key) && m.menu_key !== 'contribute' && m.menu_key !== 'about');
  const hasBooksMenu = booksMenus.length > 0;
  const isBooksActive = BOOKS_SUBKEYS.has(currentView);
  const isContributeActive = CONTRIBUTE_VIEWS.has(currentView);
  const isAboutActive = ABOUT_VIEWS.has(currentView);

  const getMenuLabel = (menu: MenuSetting) =>
    language === 'ta' && menu.menu_label_tamil ? menu.menu_label_tamil : menu.menu_label;

  const booksSubItemDefs = [
    { key: 'books' as AppView, labelEn: 'Printed Books', labelTa: 'அச்சு புத்தகங்கள்', icon: <ShoppingBag className="h-4 w-4" /> },
    { key: 'ebooks' as AppView, labelEn: 'E-Books', labelTa: 'மின்-புத்தகங்கள்', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'audiobooks' as AppView, labelEn: 'Audiobooks', labelTa: 'ஆடியோபுக்ஸ்', icon: <Headphones className="h-4 w-4" /> },
  ];

  const booksSubItems = booksSubItemDefs
    .filter(item => booksMenus.some(m => m.menu_key === item.key))
    .map(item => {
      const menu = booksMenus.find(m => m.menu_key === item.key);
      const label = language === 'ta'
        ? (menu?.menu_label_tamil || item.labelTa)
        : (menu?.menu_label || item.labelEn);
      return { ...item, label };
    });

  const contributeIconMap: Record<string, ReactNode> = {
    contribute_ebooks: <BookOpen className="h-4 w-4" />,
    contribute_covers: <Image className="h-4 w-4" />,
    contribute_audiobooks: <Headphones className="h-4 w-4" />,
    donate: <Heart className="h-4 w-4" />,
  };

  const contributeSubItems = menus
    .filter(m => m.parent_key === 'contribute' && m.is_enabled)
    .sort((a, b) => a.order_index - b.order_index)
    .map(m => ({
      key: m.menu_key as AppView,
      label: language === 'ta' && m.menu_label_tamil ? m.menu_label_tamil : m.menu_label,
      icon: contributeIconMap[m.menu_key] ?? <FileText className="h-4 w-4" />,
    }));

  const aboutIconMap: Record<string, ReactNode> = {
    about_us: <Info className="h-4 w-4" />,
    kaniyam: <BookMarked className="h-4 w-4" />,
    freetamilebooks: <BookOpen className="h-4 w-4" />,
    nutpagam: <BookOpen className="h-4 w-4" />,
    printhink: <FileText className="h-4 w-4" />,
  };

  const aboutSubItems = menus
    .filter(m => m.parent_key === 'about' && m.is_enabled)
    .sort((a, b) => a.order_index - b.order_index)
    .map(m => ({
      key: m.menu_key as AppView,
      label: language === 'ta' && m.menu_label_tamil ? m.menu_label_tamil : m.menu_label,
      icon: aboutIconMap[m.menu_key] ?? <Info className="h-4 w-4" />,
    }));

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
            <span>BookHub</span>
          </button>

          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {hasBooksMenu && (
              <div ref={booksDropdownRef} className="relative">
                <button
                  onClick={() => setBooksDropdownOpen(!booksDropdownOpen)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition text-sm xl:text-base ${
                    isBooksActive
                      ? 'bg-slate-800 dark:bg-slate-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookMarked className="h-4 w-4 xl:h-5 xl:w-5" />
                  <span>{language === 'ta' ? 'புத்தகங்கள்' : 'Books'}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${booksDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {booksDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    {booksSubItems.map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleNavClick(item.key)}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium transition ${
                          currentView === item.key
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {contributeMenu && (
              <div ref={contributeDropdownRef} className="relative">
                <button
                  onClick={() => setContributeDropdownOpen(!contributeDropdownOpen)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition text-sm xl:text-base ${
                    isContributeActive
                      ? 'bg-slate-800 dark:bg-slate-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Heart className="h-4 w-4 xl:h-5 xl:w-5" />
                  <span>{getMenuLabel(contributeMenu)}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${contributeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {contributeDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    {contributeSubItems.map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleNavClick(item.key)}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium transition ${
                          currentView === item.key
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {aboutMenu && (
              <div ref={aboutDropdownRef} className="relative">
                <button
                  onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition text-sm xl:text-base ${
                    isAboutActive
                      ? 'bg-slate-800 dark:bg-slate-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Info className="h-4 w-4 xl:h-5 xl:w-5" />
                  <span>{getMenuLabel(aboutMenu)}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {aboutDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    {aboutSubItems.map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleNavClick(item.key)}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium transition ${
                          currentView === item.key
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {otherMenus.map((menu) => (
              <button
                key={menu.menu_key}
                onClick={() => onViewChange(menu.menu_key as AppView)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition text-sm xl:text-base ${
                  currentView === menu.menu_key
                    ? 'bg-slate-800 dark:bg-slate-700 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {getMenuIcon(menu.menu_key, 'h-4 w-4 xl:h-5 xl:w-5')}
                <span>{getMenuLabel(menu)}</span>
              </button>
            ))}

            <ThemeToggle />

            <div ref={desktopSettingsRef} className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center justify-center p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5 xl:h-6 xl:w-6" />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{language === 'ta' ? 'அமைப்புகள்' : 'Settings'}</p>
                  </div>
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{language === 'ta' ? 'மொழி' : 'Language'}</p>
                    <LanguageSwitcher />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{language === 'ta' ? 'எழுத்து அளவு' : 'Font Size'}</p>
                    <FontSizeSwitcher />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex lg:hidden items-center space-x-2">
            <ThemeToggle />

            <div ref={mobileSettingsRef} className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center justify-center p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{language === 'ta' ? 'அமைப்புகள்' : 'Settings'}</p>
                  </div>
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{language === 'ta' ? 'மொழி' : 'Language'}</p>
                    <LanguageSwitcher />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{language === 'ta' ? 'எழுத்து அளவு' : 'Font Size'}</p>
                    <FontSizeSwitcher />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 py-4 space-y-1">
            {hasBooksMenu && (
              <div>
                <button
                  onClick={() => setMobileBooksOpen(!mobileBooksOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition ${
                    isBooksActive
                      ? 'bg-slate-800 dark:bg-slate-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <BookMarked className="h-5 w-5" />
                    <span>{language === 'ta' ? 'புத்தகங்கள்' : 'Books'}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileBooksOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileBooksOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                    {booksSubItems.map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleNavClick(item.key)}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium transition text-sm ${
                          currentView === item.key
                            ? 'bg-slate-800 dark:bg-slate-700 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {contributeMenu && (
              <div>
                <button
                  onClick={() => setMobileContributeOpen(!mobileContributeOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition ${
                    isContributeActive
                      ? 'bg-slate-800 dark:bg-slate-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5" />
                    <span>{getMenuLabel(contributeMenu)}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileContributeOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileContributeOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                    {contributeSubItems.map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleNavClick(item.key)}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium transition text-sm ${
                          currentView === item.key
                            ? 'bg-slate-800 dark:bg-slate-700 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {aboutMenu && (
              <div>
                <button
                  onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition ${
                    isAboutActive
                      ? 'bg-slate-800 dark:bg-slate-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Info className="h-5 w-5" />
                    <span>{getMenuLabel(aboutMenu)}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileAboutOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileAboutOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                    {aboutSubItems.map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleNavClick(item.key)}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium transition text-sm ${
                          currentView === item.key
                            ? 'bg-slate-800 dark:bg-slate-700 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {otherMenus.map((menu) => (
              <button
                key={menu.menu_key}
                onClick={() => handleNavClick(menu.menu_key as AppView)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition ${
                  currentView === menu.menu_key
                    ? 'bg-slate-800 dark:bg-slate-700 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {getMenuIcon(menu.menu_key, 'h-5 w-5')}
                <span>{getMenuLabel(menu)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
