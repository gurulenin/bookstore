import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';

interface HomePageSettings {
  id: string;
  show_physical_books_card: boolean;
  show_ebooks_card: boolean;
  show_audiobooks_card: boolean;
  show_featured_books: boolean;
  featured_books_title_en: string;
  featured_books_title_ta: string;
  featured_books_limit: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover_image_url: string;
}

interface FeaturedBook {
  id: string;
  book_id: string;
  display_order: number;
  books?: Book;
}

export default function HomePageSettingsManagement() {
  const [settings, setSettings] = useState<HomePageSettings | null>(null);
  const [featuredBooks, setFeaturedBooks] = useState<FeaturedBook[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    loadFeaturedBooks();
    loadAvailableBooks();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('homepage_settings')
      .select('*')
      .single();

    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const loadFeaturedBooks = async () => {
    const { data, error } = await supabase
      .from('featured_books')
      .select('id, book_id, display_order, books!inner(id, title, author, cover_image_url)')
      .order('display_order');

    if (error) {
      console.error('Error loading featured books:', error);
      return;
    }

    if (data) {
      setFeaturedBooks(data);
    }
  };

  const loadAvailableBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('id, title, author, cover_image_url')
      .order('title');

    if (data) {
      setAvailableBooks(data);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    const { error } = await supabase
      .from('homepage_settings')
      .update({
        show_physical_books_card: settings.show_physical_books_card,
        show_ebooks_card: settings.show_ebooks_card,
        show_audiobooks_card: settings.show_audiobooks_card,
        show_featured_books: settings.show_featured_books,
        featured_books_title_en: settings.featured_books_title_en,
        featured_books_title_ta: settings.featured_books_title_ta,
        featured_books_limit: settings.featured_books_limit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);

    setSaving(false);

    if (error) {
      alert('Error saving settings: ' + error.message);
    } else {
      alert('Settings saved successfully!');
    }
  };

  const addFeaturedBook = async () => {
    if (!selectedBookId) {
      alert('Please select a book');
      return;
    }

    if (settings && featuredBooks.length >= settings.featured_books_limit) {
      alert(`Maximum of ${settings.featured_books_limit} featured books allowed`);
      return;
    }

    const alreadyFeatured = featuredBooks.some(fb => fb.book_id === selectedBookId);
    if (alreadyFeatured) {
      alert('This book is already featured');
      return;
    }

    const { error } = await supabase
      .from('featured_books')
      .insert({
        book_id: selectedBookId,
        display_order: featuredBooks.length,
      });

    if (error) {
      alert('Error adding featured book: ' + error.message);
    } else {
      setSelectedBookId('');
      loadFeaturedBooks();
    }
  };

  const removeFeaturedBook = async (id: string) => {
    const { error } = await supabase
      .from('featured_books')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error removing featured book: ' + error.message);
    } else {
      loadFeaturedBooks();
    }
  };

  const moveBook = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === featuredBooks.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newFeaturedBooks = [...featuredBooks];
    [newFeaturedBooks[index], newFeaturedBooks[newIndex]] = [
      newFeaturedBooks[newIndex],
      newFeaturedBooks[index],
    ];

    await Promise.all(
      newFeaturedBooks.map((fb, i) =>
        supabase
          .from('featured_books')
          .update({ display_order: i })
          .eq('id', fb.id)
      )
    );

    loadFeaturedBooks();
  };

  if (loading || !settings) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Format Cards Settings</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.show_physical_books_card}
              onChange={(e) => setSettings({ ...settings, show_physical_books_card: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">Show Physical Books Card</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.show_ebooks_card}
              onChange={(e) => setSettings({ ...settings, show_ebooks_card: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">Show E-Books Card</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.show_audiobooks_card}
              onChange={(e) => setSettings({ ...settings, show_audiobooks_card: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">Show Audiobooks Card</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Featured Books Settings</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.show_featured_books}
              onChange={(e) => setSettings({ ...settings, show_featured_books: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">Show Featured Books Section</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Section Title (English)
            </label>
            <input
              type="text"
              value={settings.featured_books_title_en}
              onChange={(e) => setSettings({ ...settings, featured_books_title_en: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Section Title (Tamil)
            </label>
            <input
              type="text"
              value={settings.featured_books_title_ta}
              onChange={(e) => setSettings({ ...settings, featured_books_title_ta: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Maximum Featured Books
            </label>
            <select
              value={settings.featured_books_limit}
              onChange={(e) => setSettings({ ...settings, featured_books_limit: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="3">3 Books</option>
              <option value="5">5 Books</option>
              <option value="6">6 Books</option>
            </select>
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="mt-6 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {settings.show_featured_books && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Featured Books</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Add Featured Book ({featuredBooks.length}/{settings.featured_books_limit})
            </label>
            <div className="flex gap-2">
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a book</option>
                {availableBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} by {book.author}
                  </option>
                ))}
              </select>
              <button
                onClick={addFeaturedBook}
                disabled={!selectedBookId || featuredBooks.length >= settings.featured_books_limit}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {featuredBooks.map((featured, index) => (
              <div key={featured.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveBook(index, 'up')}
                    disabled={index === 0}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <button
                    onClick={() => moveBook(index, 'down')}
                    disabled={index === featuredBooks.length - 1}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                <img
                  src={featured.books?.cover_image_url}
                  alt={featured.books?.title}
                  className="w-16 h-24 object-cover rounded"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{featured.books?.title}</h3>
                  <p className="text-sm text-slate-600">{featured.books?.author}</p>
                  <p className="text-xs text-slate-500 mt-1">Display Order: {index + 1}</p>
                </div>

                <button
                  onClick={() => removeFeaturedBook(featured.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}

            {featuredBooks.length === 0 && (
              <p className="text-center text-slate-500 py-8">No featured books added yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
