import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { loadGenres, translateGenre as translateGenreFn } from './genreTranslations';

type Language = 'en' | 'ta';

interface Translation {
  key: string;
  english: string;
  tamil: string;
  category: string;
}

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateGenre: (genreName: string) => string;
  translations: Translation[];
  loadTranslations: () => Promise<void>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'ta' || saved === 'en') ? saved : 'en';
  });
  const [translations, setTranslations] = useState<Translation[]>([]);

  useEffect(() => {
    loadTranslations();
    loadGenres();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.body.lang = language;
  }, [language]);

  const loadTranslations = async () => {
    const { data } = await supabase
      .from('ui_translations')
      .select('*')
      .order('category', { ascending: true });

    if (data) {
      setTranslations(data);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const translation = translations.find(t => t.key === key);
    if (!translation) {
      return key;
    }
    return language === 'en' ? translation.english : translation.tamil;
  };

  const translateGenre = (genreName: string): string => {
    return translateGenreFn(genreName, language);
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, translateGenre, translations, loadTranslations }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
