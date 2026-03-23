import { Languages } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useTheme } from '../lib/themeContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const { theme } = useTheme();

  const handleToggle = () => {
    const newLang = language === 'en' ? 'ta' : 'en';
    setLanguage(newLang);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        theme === 'dark'
          ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
      }`}
      title={language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
      aria-label={language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
    >
      <Languages className="h-5 w-5" />
      <span className="font-medium">
        {language === 'en' ? 'EN' : 'த'}
      </span>
    </button>
  );
}
