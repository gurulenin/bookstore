import { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen, Headphones, ShoppingBag, FileText, Info, Mail, Settings, Menu, X, Heart, PenLine, ChevronDown, BookMarked } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import LanguageSwitcher from './LanguageSwitcher';
import FontSizeSwitcher from './FontSizeSwitcher';
import ThemeToggle from './ThemeToggle';
import { supabase } from '../lib/supabase';

type AppView = 'home' | 'books' | 'ebooks' | 'audiobooks' | 'contribute' | 'blog' | 'about' | 'contact' | 'admin' | 'publish';

interface NavbarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

interface MenuSetting {
  menu_key: string;
  menu_label: string;
  is_enabled: boolean;
  order_index: number;
}

const BOOKS_SUBKEYS = new Set(['books', 'ebooks', 'audiobooks']);

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [booksDropdownOpen, setBooksDropdownOpen] = useState(false);
  const [mobileBooksOpen, setMobileBooksOpen] = useState(false);
  const [menus, setMenus] = useState<MenuSetting[]>([]);
  const desktopSettingsRef = useRef<HTMLDivElement>(null);
  const mobileSettingsRef = useRef<HTMLDivElement>(null);
  const booksDropdownRef = useRef<HTMLDivElement>(null);
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { loadMenus(); }, []);

  const loadMenus = async () => {
    const { data } = await supabase
      .from('menu_settings')
      .select('*')
      .eq('is_enabled', true)
      .order('order_index');
    if (data) setMenus(data.filter((m: MenuSetting) => m.menu_key !== 'admin'));
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

  const booksMenus = menus.filter(m => BOOKS_SUBKEYS.has(m.menu_key));
  const otherMenus = menus.filter(m => !BOOKS_SUBKEYS.has(m.menu_key));
  const hasBooksMenu = booksMenus.length > 0;
  const isBooksActive = BOOKS_SUBKEYS.has(currentView);

  const booksSubItems = [
    { key: 'books' as AppView, label: 'Printed Books', icon: <ShoppingBag className="h-4 w-4" /> },
    { key: 'ebooks' as AppView, label: 'E-Books', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'audiobooks' as AppView, label: 'Audiobooks', icon: <Headphones className="h-4 w-4" /> },
  ].filter(item => booksMenus.some(m => m.menu_key === item.key));

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
                  <span>Books</span>
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
                <span>{menu.menu_label}</span>
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
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Settings</p>
                  </div>
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Language</p>
                    <LanguageSwitcher />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Font Size</p>
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
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Settings</p>
                  </div>
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Language</p>
                    <LanguageSwitcher />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Font Size</p>
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
                    <span>Books</span>
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
                <span>{menu.menu_label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
