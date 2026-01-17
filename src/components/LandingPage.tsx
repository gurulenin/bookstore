import { useState, useEffect } from 'react';
import { BookOpen, Headphones, ShoppingBag, Download, DollarSign } from 'lucide-react';
import HeroCarousel from './HeroCarousel';
import BookCard from './BookCard';
import { useTranslation } from '../lib/translations';
import { supabase } from '../lib/supabase';

interface LandingPageProps {
  onNavigate: (view: 'books' | 'ebooks' | 'audiobooks') => void;
  onViewBook: (bookId: string) => void;
}

interface HomePageSettings {
  show_physical_books_card: boolean;
  show_ebooks_card: boolean;
  show_audiobooks_card: boolean;
  show_featured_books: boolean;
  featured_books_title_en: string;
  featured_books_title_ta: string;
  featured_books_limit: number;
}

interface FeaturedBook {
  id: string;
  title: string;
  author: string;
  cover_image_url: string;
  genre: string;
}

export default function LandingPage({ onNavigate, onViewBook }: LandingPageProps) {
  const { t, language } = useTranslation();
  const [settings, setSettings] = useState<HomePageSettings>({
    show_physical_books_card: true,
    show_ebooks_card: true,
    show_audiobooks_card: true,
    show_featured_books: false,
    featured_books_title_en: 'Featured Books',
    featured_books_title_ta: 'சிறப்பு புத்தகங்கள்',
    featured_books_limit: 3,
  });
  const [featuredBooks, setFeaturedBooks] = useState<FeaturedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadSettings(), loadFeaturedBooks()]);
    } catch (error) {
      console.error('Error loading home page data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const loadFeaturedBooks = async () => {
    const { data, error } = await supabase
      .from('featured_books')
      .select('book_id, books!inner(id, title, author, cover_image_url, genre)')
      .order('display_order');

    if (error) {
      console.error('Error loading featured books:', error);
      return;
    }

    if (data) {
      const books = data
        .map((item: any) => item.books)
        .filter((book: any) => book !== null);
      setFeaturedBooks(books);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <HeroCarousel />

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-4 md:mb-6 px-4">
            {t('landing.collection.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4">
            {t('landing.hero.subtitle')}
          </p>
        </div>

        {(settings.show_physical_books_card || settings.show_ebooks_card || settings.show_audiobooks_card) && (
          <div className={`grid gap-6 md:gap-8 max-w-6xl mx-auto ${
            [settings.show_physical_books_card, settings.show_ebooks_card, settings.show_audiobooks_card].filter(Boolean).length === 3
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : [settings.show_physical_books_card, settings.show_ebooks_card, settings.show_audiobooks_card].filter(Boolean).length === 2
              ? 'sm:grid-cols-2'
              : 'grid-cols-1 max-w-md'
          }`}>
            {settings.show_physical_books_card && (
              <div
                onClick={() => onNavigate('books')}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 md:p-8 text-white">
                  <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('landing.printed.title')}</h2>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-slate-600 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                    {t('landing.printed.desc')}
                  </p>
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    <li className="flex items-center text-slate-700 text-sm md:text-base">
                      <DollarSign className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-500 flex-shrink-0" />
                      <span>{t('landing.printed.price')}</span>
                    </li>
                    <li className="flex items-center text-slate-700 text-sm md:text-base">
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

            {settings.show_ebooks_card && (
              <div
                onClick={() => onNavigate('ebooks')}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 md:p-8 text-white">
                  <BookOpen className="h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('landing.ebooks.title')}</h2>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-slate-600 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                    {t('landing.ebooks.desc')}
                  </p>
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    <li className="flex items-center text-slate-700 text-sm md:text-base">
                      <Download className="h-4 w-4 md:h-5 md:w-5 mr-2 text-green-500 flex-shrink-0" />
                      <span>{t('landing.ebooks.instant')}</span>
                    </li>
                    <li className="flex items-center text-slate-700 text-sm md:text-base">
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

            {settings.show_audiobooks_card && (
              <div
                onClick={() => onNavigate('audiobooks')}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 md:p-8 text-white">
                  <Headphones className="h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('landing.audiobooks.title')}</h2>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-slate-600 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
                    {t('landing.audiobooks.desc')}
                  </p>
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    <li className="flex items-center text-slate-700 text-sm md:text-base">
                      <Download className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-500 flex-shrink-0" />
                      <span>{t('landing.audiobooks.free')}</span>
                    </li>
                    <li className="flex items-center text-slate-700 text-sm md:text-base">
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
          </div>
        )}

        {settings.show_featured_books && featuredBooks.length > 0 && (
          <div className="mt-12 md:mt-16 lg:mt-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-8 md:mb-12">
              {language === 'en' ? settings.featured_books_title_en : settings.featured_books_title_ta}
            </h2>
            <div className={`grid gap-6 md:gap-8 max-w-6xl mx-auto ${
              settings.featured_books_limit === 3
                ? 'sm:grid-cols-2 lg:grid-cols-3'
                : settings.featured_books_limit === 5
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
            }`}>
              {featuredBooks.slice(0, settings.featured_books_limit).map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  coverImage={book.cover_image_url}
                  genre={book.genre}
                  onClick={() => onViewBook(book.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 md:mt-16 lg:mt-20 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
              {t('landing.why.title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">10,000+</div>
                <div className="text-slate-600 text-sm md:text-base">{t('landing.stats.books')}</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2">{t('landing.why.free.title')}</div>
                <div className="text-slate-600 text-sm md:text-base">{t('landing.stats.free')}</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">24/7</div>
                <div className="text-slate-600 text-sm md:text-base">{t('landing.stats.access')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
