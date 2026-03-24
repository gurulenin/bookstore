import { useEffect, useState } from 'react';
import { X, BookOpen, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/translations';

interface BookOfTheDay {
  id: string;
  book_id: string | null;
  title_en: string;
  title_ta: string;
  subtitle_en: string;
  subtitle_ta: string;
  is_active: boolean;
  show_once_per_day: boolean;
  book?: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string;
    description: string;
    genre?: string;
  };
}

interface SplashScreenProps {
  onClose: () => void;
  onViewBook?: (bookId: string) => void;
}

const STORAGE_KEY = 'book_of_the_day_seen';

function hasSeenToday(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (!val) return false;
    return val === new Date().toDateString();
  } catch {
    return false;
  }
}

function markSeenToday() {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toDateString());
  } catch {
    // ignore
  }
}

export function shouldShowSplash(entry: BookOfTheDay): boolean {
  if (!entry.is_active) return false;
  if (entry.show_once_per_day && hasSeenToday()) return false;
  return true;
}

export default function SplashScreen({ onClose, onViewBook }: SplashScreenProps) {
  const { language } = useTranslation();
  const [entry, setEntry] = useState<BookOfTheDay | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    loadEntry();
  }, []);

  const loadEntry = async () => {
    const { data } = await supabase
      .from('book_of_the_day')
      .select(`
        *,
        book:book_id (
          id, title, author, cover_image_url, description, genre
        )
      `)
      .eq('is_active', true)
      .maybeSingle();

    if (data && shouldShowSplash(data as BookOfTheDay)) {
      setEntry(data as BookOfTheDay);
      setTimeout(() => setVisible(true), 50);
      if (data.show_once_per_day) markSeenToday();
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleViewBook = () => {
    if (entry?.book_id && onViewBook) {
      handleClose();
      setTimeout(() => onViewBook(entry.book_id!), 350);
    }
  };

  if (!entry) return null;

  const title = language === 'ta' ? entry.title_ta : entry.title_en;
  const subtitle = language === 'ta' ? entry.subtitle_ta : entry.subtitle_en;
  const book = entry.book;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300 ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition"
        >
          <X className="h-4 w-4 text-slate-700 dark:text-slate-200" />
        </button>

        <div className="px-6 pt-6 pb-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              {title}
            </span>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>

        {book ? (
          <div className="px-6 pb-6">
            <div className="flex gap-4 mt-4">
              {book.cover_image_url && (
                <div className="flex-shrink-0">
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-24 h-36 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {book.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{book.author}</p>
                {book.genre && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                    {book.genre}
                  </span>
                )}
                {book.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-4 leading-relaxed">
                    {book.description}
                  </p>
                )}
              </div>
            </div>

            {entry.book_id && onViewBook && (
              <button
                onClick={handleViewBook}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-800 rounded-xl font-semibold text-sm hover:bg-slate-700 dark:hover:bg-white transition"
              >
                <BookOpen className="h-4 w-4" />
                {language === 'ta' ? 'புத்தகத்தை காண்க' : 'View Book'}
              </button>
            )}

            <button
              onClick={handleClose}
              className="mt-2 w-full py-2 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
            >
              {language === 'ta' ? 'தொடர்க' : 'Continue browsing'}
            </button>
          </div>
        ) : (
          <div className="px-6 pb-6 text-center">
            <div className="py-8 text-slate-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No book selected for today.</p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Continue browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
