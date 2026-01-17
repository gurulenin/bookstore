import { Languages } from 'lucide-react';
import { useTranslation } from '../lib/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
      title={language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
    >
      <Languages className="h-5 w-5 text-slate-700" />
      <span className="font-medium text-slate-700">
        {language === 'en' ? 'EN' : 'த'}
      </span>
    </button>
  );
}
