import { useState, useEffect } from 'react';
import { Save, Search, Star, BookOpen, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Book {
  id: string;
  title: string;
  author: string;
  cover_image_url: string;
}

interface BookOfTheDayEntry {
  id: string;
  book_id: string | null;
  title_en: string;
  title_ta: string;
  subtitle_en: string;
  subtitle_ta: string;
  is_active: boolean;
  show_once_per_day: boolean;
  book?: Book;
}

const DEFAULT_ENTRY: Omit<BookOfTheDayEntry, 'id'> = {
  book_id: null,
  title_en: 'Book of the Day',
  title_ta: 'தினம் ஒரு புத்தகம்',
  subtitle_en: '',
  subtitle_ta: '',
  is_active: true,
  show_once_per_day: true,
};

export default function BookOfTheDayManagement() {
  const [entry, setEntry] = useState<BookOfTheDayEntry | null>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [bookSearch, setBookSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntry();
    loadBooks();
  }, []);

  useEffect(() => {
    const q = bookSearch.toLowerCase();
    if (!q) {
      setFilteredBooks(allBooks.slice(0, 20));
    } else {
      setFilteredBooks(
        allBooks.filter(
          b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
        ).slice(0, 20)
      );
    }
  }, [bookSearch, allBooks]);

  const loadEntry = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('book_of_the_day')
      .select(`*, book:book_id (id, title, author, cover_image_url)`)
      .maybeSingle();

    if (data) {
      setEntry(data as BookOfTheDayEntry);
    }
    setLoading(false);
  };

  const loadBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('id, title, author, cover_image_url')
      .order('title');
    if (data) setAllBooks(data);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      book_id: entry?.book_id ?? null,
      title_en: entry?.title_en ?? DEFAULT_ENTRY.title_en,
      title_ta: entry?.title_ta ?? DEFAULT_ENTRY.title_ta,
      subtitle_en: entry?.subtitle_en ?? '',
      subtitle_ta: entry?.subtitle_ta ?? '',
      is_active: entry?.is_active ?? true,
      show_once_per_day: entry?.show_once_per_day ?? true,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (entry?.id) {
      ({ error } = await supabase
        .from('book_of_the_day')
        .update(payload)
        .eq('id', entry.id));
    } else {
      const { data: newEntry, error: insertError } = await supabase
        .from('book_of_the_day')
        .insert([payload])
        .select()
        .maybeSingle();
      error = insertError;
      if (newEntry) setEntry({ ...payload, id: newEntry.id });
    }

    setSaving(false);
    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      alert('Saved successfully!');
      loadEntry();
    }
  };

  const selectBook = (book: Book) => {
    setEntry(prev => prev
      ? { ...prev, book_id: book.id, book }
      : { ...DEFAULT_ENTRY, id: '', book_id: book.id, book }
    );
    setBookSearch('');
  };

  const clearBook = () => {
    setEntry(prev => prev ? { ...prev, book_id: null, book: undefined } : null);
  };

  const updateField = <K extends keyof BookOfTheDayEntry>(key: K, value: BookOfTheDayEntry[K]) => {
    setEntry(prev => {
      if (!prev) return { ...DEFAULT_ENTRY, id: '', [key]: value } as BookOfTheDayEntry;
      return { ...prev, [key]: value };
    });
  };

  const currentEntry = entry ?? { ...DEFAULT_ENTRY, id: '' };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            <h2 className="text-2xl font-bold text-slate-800">Book of the Day</h2>
            <span className="text-sm text-slate-500">/ தினம் ஒரு புத்தகம்</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm font-medium text-slate-700">
              {currentEntry.is_active ? 'Splash Enabled' : 'Splash Disabled'}
            </span>
            <button
              type="button"
              onClick={() => updateField('is_active', !currentEntry.is_active)}
              className={`transition-colors ${currentEntry.is_active ? 'text-green-600' : 'text-slate-400'}`}
            >
              {currentEntry.is_active
                ? <ToggleRight className="h-7 w-7" />
                : <ToggleLeft className="h-7 w-7" />}
            </button>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Splash Title</h3>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Title (English)</label>
              <input
                type="text"
                value={currentEntry.title_en}
                onChange={e => updateField('title_en', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Title (Tamil)</label>
              <input
                type="text"
                value={currentEntry.title_ta}
                onChange={e => updateField('title_ta', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Subtitle (English) <span className="text-slate-400 text-xs">optional</span></label>
              <input
                type="text"
                value={currentEntry.subtitle_en}
                onChange={e => updateField('subtitle_en', e.target.value)}
                placeholder="e.g. Today's featured read"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Subtitle (Tamil) <span className="text-slate-400 text-xs">optional</span></label>
              <input
                type="text"
                value={currentEntry.subtitle_ta}
                onChange={e => updateField('subtitle_ta', e.target.value)}
                placeholder="e.g. இன்றைய சிறப்பு புத்தகம்"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={currentEntry.show_once_per_day}
                  onChange={e => updateField('show_once_per_day', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Show once per day</span>
                  <p className="text-xs text-slate-500">If enabled, the splash will only appear once per day per browser. If disabled, it shows on every page load.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Featured Book</h3>

            {currentEntry.book ? (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                {currentEntry.book.cover_image_url && (
                  <img
                    src={currentEntry.book.cover_image_url}
                    alt={currentEntry.book.title}
                    className="w-14 h-20 object-cover rounded shadow-sm flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{currentEntry.book.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{currentEntry.book.author}</p>
                </div>
                <button
                  type="button"
                  onClick={clearBook}
                  className="p-1 text-red-400 hover:text-red-600 flex-shrink-0"
                  title="Remove book"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-400">
                <BookOpen className="h-6 w-6 flex-shrink-0" />
                <span className="text-sm">No book selected. Search below to pick one.</span>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={bookSearch}
                onChange={e => setBookSearch(e.target.value)}
                placeholder="Search books by title or author..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none text-sm"
              />
            </div>

            {(bookSearch || filteredBooks.length > 0) && (
              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {filteredBooks.length === 0 ? (
                  <p className="text-center py-4 text-sm text-slate-400">No books found</p>
                ) : (
                  filteredBooks.map(book => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => selectBook(book)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-amber-50 transition ${
                        currentEntry.book_id === book.id ? 'bg-amber-50' : ''
                      }`}
                    >
                      {book.cover_image_url && (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-8 h-12 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{book.title}</p>
                        <p className="text-xs text-slate-500 truncate">{book.author}</p>
                      </div>
                      {currentEntry.book_id === book.id && (
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Book of the Day'}
          </button>
        </div>
      </div>
    </div>
  );
}
