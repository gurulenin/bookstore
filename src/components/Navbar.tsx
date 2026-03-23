import { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen, Headphones, ShoppingBag, FileText, Info, Mail, Settings, Menu, X, Heart, PenLine } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import LanguageSwitcher from './LanguageSwitcher';
import FontSizeSwitcher from './FontSizeSwitcher';
import ThemeToggle from './ThemeToggle';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  currentView: 'home' | 'books' | 'ebooks' | 'audiobooks' | 'contribute' | 'blog' | 'about' | 'contact' | 'admin' | 'publish';
  onViewChange: (view: 'home' | 'books' | 'ebooks' | 'audiobooks' | 'contribute' | 'blog' | 'about' | 'contact' | 'admin' | 'publish') => void;
}

interface MenuSetting {
  menu_key: string;
  menu_label: string;
  is_enabled: boolean;
  order_index: number;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menus, setMenus] = useState<MenuSetting[]>([]);
  const desktopSettingsRef = useRef<HTMLDivElement>(null);
  const mobileSettingsRef = useRef<HTMLDivElement>(null);
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inDesktop = desktopSettingsRef.current?.contains(target);
      const inMobile = mobileSettingsRef.current?.contains(target);
      if (!inDesktop && !inMobile) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadMenus();
  }, []);

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

    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

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

  const handleNavClick = (view: 'home' | 'books' | 'ebooks' | 'audiobooks' | 'contribute' | 'blog' | 'about' | 'contact' | 'admin' | 'publish') => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  const getMenuIcon = (menuKey: string, className: string) => {
    switch (menuKey) {
      case 'books':
        return <ShoppingBag className={className} />;
      case 'ebooks':
        return <BookOpen className={className} />;
      case 'audiobooks':
        return <Headphones className={className} />;
      case 'contribute':
        return <Heart className={className} />;
      case 'blog':
        return <FileText className={className} />;
      case 'about':
        return <Info className={className} />;
      case 'contact':
        return <Mail className={className} />;
      case 'publish':
        return <PenLine className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

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

          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {menus.map((menu) => (
              <button
                key={menu.menu_key}
                onClick={() => onViewChange(menu.menu_key as any)}
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
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 py-4 space-y-2">
            {menus.map((menu) => (
              <button
                key={menu.menu_key}
                onClick={() => handleNavClick(menu.menu_key as any)}
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
