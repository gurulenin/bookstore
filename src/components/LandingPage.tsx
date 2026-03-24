import { useState, useEffect } from 'react';
import { BookOpen, Headphones, ShoppingBag, Download, IndianRupee, Star } from 'lucide-react';
import HeroCarousel from './HeroCarousel';
import { useTranslation } from '../lib/translations';
import { supabase } from '../lib/supabase';

interface LandingPageProps {
  onNavigate: (view: 'books' | 'ebooks' | 'audiobooks' | 'featured') => void;
  onViewBook: (bookId: string) => void;
}

interface WhyChooseStat {
  value_en: string;
  value_ta: string;
  label_en: string;
  label_ta: string;
  color: string;
}

interface HomePageSettings {
  show_physical_books_card: boolean;
  show_ebooks_card: boolean;
  show_audiobooks_card: boolean;
  show_featured_books_card: boolean;
  physical_books_title_en: string;
  physical_books_title_ta: string;
  physical_books_desc_en: string;
  physical_books_desc_ta: string;
  ebooks_title_en: string;
  ebooks_title_ta: string;
  ebooks_desc_en: string;
  ebooks_desc_ta: string;
  audiobooks_title_en: string;
  audiobooks_title_ta: string;
  audiobooks_desc_en: string;
  audiobooks_desc_ta: string;
  featured_books_card_title_en: string;
  featured_books_card_title_ta: string;
  featured_books_card_desc_en: string;
  featured_books_card_desc_ta: string;
  show_why_choose_us: boolean;
  why_choose_us_title_en: string;
  why_choose_us_title_ta: string;
  why_choose_us_stats: WhyChooseStat[] | null;
}

export default function LandingPage({ onNavigate, onViewBook }: LandingPageProps) {
  const { t, language } = useTranslation();
  const [settings, setSettings] = useState<HomePageSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('homepage_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error loading homepage settings:', error);
      return;
    }

    if (data) {
      setSettings(data);
    }
  };

  const showPhysicalBooks = settings?.show_physical_books_card ?? true;
  const showEbooks = settings?.show_ebooks_card ?? true;
  const showAudiobooks = settings?.show_audiobooks_card ?? true;
  const showFeaturedBooksCard = settings?.show_featured_books_card ?? true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <HeroCarousel />

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h1 className={`font-bold text-slate-800 dark:text-slate-100 mb-4 md:mb-6 px-4 ${language === 'ta' ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl' : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'}`}>
            {t('landing.collection.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-4">
            {t('landing.hero.subtitle')}
          </p>
        </div>

        {(showPhysicalBooks || showEbooks || showAudiobooks || showFeaturedBooksCard) && (
          <div className={`grid gap-6 md:gap-8 max-w-6xl mx-auto ${
            [showPhysicalBooks, showEbooks, showAudiobooks, showFeaturedBooksCard].filter(Boolean).length === 4
              ? 'sm:grid-cols-2 lg:grid-cols-4'
              : [showPhysicalBooks, showEbooks, showAudiobooks, showFeaturedBooksCard].filter(Boolean).length === 3
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : [showPhysicalBooks, showEbooks, showAudiobooks, showFeaturedBooksCard].filter(Boolean).length === 2
              ? 'sm:grid-cols-2'
              : 'grid-cols-1 max-w-md'
          }`}>
            {showPhysicalBooks && settings && (
              <div
                onClick={() => onNavigate('books')}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 md:p-8 text-white">
                  <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {language === 'en' ? settings.physical_books_title_en : settings.physical_books_title_ta}
                  </h2>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-slate-600 dark:text-slate-300 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                    {language === 'en' ? settings.physical_books_desc_en : settings.physical_books_desc_ta}
                  </p>
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm md:text-base">
                      <IndianRupee className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-500 flex-shrink-0" />
                      <span>{t('landing.printed.price')}</span>
                    </li>
                    <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm md:text-base">
                      <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-500 flex-shrink-0" />
                      <span>{t('landing.printed.checkout')}</span>
                    </li>
                  </ul>
                  <button className="w-full bg-blue-500 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-blue-600 transition text-sm md:text-base">
                    {t('landing.printed.browse')}
                  </button>
                </div>
              </div>
            )}

            {showEbooks && settings && (
              <div
                onClick={() => onNavigate('ebooks')}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 md:p-8 text-white">
                  <BookOpen className="h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {language === 'en' ? settings.ebooks_title_en : settings.ebooks_title_ta}
                  </h2>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-slate-600 dark:text-slate-300 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                    {language === 'en' ? settings.ebooks_desc_en : settings.ebooks_desc_ta}
                  </p>
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm md:text-base">
                      <Download className="h-4 w-4 md:h-5 md:w-5 mr-2 text-green-500 flex-shrink-0" />
                      <span>{t('landing.ebooks.instant')}</span>
                    </li>
                    <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm md:text-base">
                      <BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-2 text-green-500 flex-shrink-0" />
                      <span>{t('landing.ebooks.formats')}</span>
                    </li>
                  </ul>
                  <button className="w-full bg-green-500 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-green-600 transition text-sm md:text-base">
                    {t('landing.ebooks.browse')}
                  </button>
                </div>
              </div>
            )}

            {showAudiobooks && settings && (
              <div
                onClick={() => onNavigate('audiobooks')}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 md:p-8 text-white">
                  <Headphones className="h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {language === 'en' ? settings.audiobooks_title_en : settings.audiobooks_title_ta}
                  </h2>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-slate-600 dark:text-slate-300 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                    {language === 'en' ? settings.audiobooks_desc_en : settings.audiobooks_desc_ta}
                  </p>
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm md:text-base">
                      <Download className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-500 flex-shrink-0" />
                      <span>{t('landing.audiobooks.free')}</span>
                    </li>
                    <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm md:text-base">
                      <Headphones className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-500 flex-shrink-0" />
                      <span>{t('landing.audiobooks.quality')}</span>
                    </li>
                  </ul>
                  <button className="w-full bg-orange-500 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-orange-600 transition text-sm md:text-base">
                    {t('landing.audiobooks.browse')}
                  </button>
                </div>
              </div>
            )}

            {showFeaturedBooksCard && settings && (
              <div
                onClick={() => onNavigate('featured')}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 md:p-8 text-white">
                  <Star className="h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {language === 'en' ? settings.featured_books_card_title_en : settings.featured_books_card_title_ta}
                  </h2>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-slate-600 dark:text-slate-300 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                    {language === 'en' ? settings.featured_books_card_desc_en : settings.featured_books_card_desc_ta}
                  </p>
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm md:text-base">
                      <Star className="h-4 w-4 md:h-5 md:w-5 mr-2 text-purple-500 flex-shrink-0" />
                      <span>{t('landing.featured.curated')}</span>
                    </li>
                    <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm md:text-base">
                      <Star className="h-4 w-4 md:h-5 md:w-5 mr-2 text-purple-500 flex-shrink-0" />
                      <span>{t('landing.featured.popular')}</span>
                    </li>
                  </ul>
                  <button className="w-full bg-purple-500 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-purple-600 transition text-sm md:text-base">
                    {t('landing.featured.browse')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {(settings?.show_why_choose_us ?? true) && (() => {
          const colorMap: Record<string, string> = {
            blue: 'text-blue-500', green: 'text-green-500', orange: 'text-orange-500',
            red: 'text-red-500', teal: 'text-teal-500', amber: 'text-amber-500',
          };
          const stats: WhyChooseStat[] = settings?.why_choose_us_stats ?? [
            { value_en: '10,000+', value_ta: '10,000+', label_en: t('landing.stats.books'), label_ta: t('landing.stats.books'), color: 'blue' },
            { value_en: t('landing.why.free.title'), value_ta: t('landing.why.free.title'), label_en: t('landing.stats.free'), label_ta: t('landing.stats.free'), color: 'green' },
            { value_en: '24/7', value_ta: '24/7', label_en: t('landing.stats.access'), label_ta: t('landing.stats.access'), color: 'orange' },
          ];
          const colCount = Math.min(stats.length, 6);
          const gridClass = colCount <= 1 ? 'grid-cols-1' : colCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : colCount === 3 ? 'grid-cols-1 sm:grid-cols-3' : colCount === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
          return (
            <div className="mt-12 md:mt-16 lg:mt-20 text-center">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
                <h3 className={`font-bold text-slate-800 dark:text-slate-100 mb-4 ${language === 'ta' ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'}`}>
                  {settings
                    ? (language === 'ta' ? settings.why_choose_us_title_ta : settings.why_choose_us_title_en)
                    : t('landing.why.title')}
                </h3>
                <div className={`grid ${gridClass} gap-6 md:gap-8 mt-6 md:mt-8`}>
                  {stats.map((stat, i) => (
                    <div key={i}>
                      <div className={`text-3xl md:text-4xl font-bold mb-2 ${colorMap[stat.color] ?? 'text-blue-500'}`}>
                        {language === 'ta' ? stat.value_ta : stat.value_en}
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
                        {language === 'ta' ? stat.label_ta : stat.label_en}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
