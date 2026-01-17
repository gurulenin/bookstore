import { useState } from 'react';
import { Download, Upload, Database, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function BackupRestore() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const exportBooks = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { data: books } = await supabase.from('books').select('*').order('title');
      const { data: formats } = await supabase.from('book_formats').select('*');

      const booksWithFormats = books?.map((book) => ({
        ...book,
        formats: formats?.filter((f) => f.book_id === book.id) || []
      }));

      const dataStr = JSON.stringify(booksWithFormats, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `books-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage('Books exported successfully!');
    } catch (error) {
      setMessage('Error exporting books: ' + (error as Error).message);
    }
    setLoading(false);
  };

  const importBooks = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');
    try {
      const text = await file.text();
      const books = JSON.parse(text);

      for (const book of books) {
        const formats = book.formats;
        delete book.formats;

        const { data: newBook } = await supabase
          .from('books')
          .upsert({ ...book, id: undefined }, { onConflict: 'sku' })
          .select()
          .single();

        if (newBook && formats) {
          const formatsToInsert = formats.map((f: any) => ({
            ...f,
            id: undefined,
            book_id: newBook.id
          }));
          await supabase.from('book_formats').insert(formatsToInsert);
        }
      }

      setMessage(`Successfully imported ${books.length} books!`);
    } catch (error) {
      setMessage('Error importing books: ' + (error as Error).message);
    }
    setLoading(false);
    e.target.value = '';
  };

  const exportSiteSettings = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { data: settings } = await supabase.from('site_settings').select('*');
      const { data: carousel } = await supabase.from('hero_carousel').select('*');

      const exportData = {
        settings,
        carousel
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `site-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage('Site settings exported successfully!');
    } catch (error) {
      setMessage('Error exporting settings: ' + (error as Error).message);
    }
    setLoading(false);
  };

  const importSiteSettings = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.settings && data.settings.length > 0) {
        await supabase.from('site_settings').upsert(data.settings);
      }

      if (data.carousel && data.carousel.length > 0) {
        await supabase.from('hero_carousel').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('hero_carousel').insert(data.carousel.map((c: any) => ({ ...c, id: undefined })));
      }

      setMessage('Site settings imported successfully!');
    } catch (error) {
      setMessage('Error importing settings: ' + (error as Error).message);
    }
    setLoading(false);
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Backup & Restore</h2>
        <p className="text-slate-600 mt-2">
          Export and import your books and site settings as JSON files
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('Error')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="h-8 w-8 text-blue-500" />
            <h3 className="text-2xl font-bold text-slate-800">Books Database</h3>
          </div>

          <p className="text-slate-600 mb-6">
            Export all books with their formats, or import books from a backup file.
          </p>

          <div className="space-y-4">
            <button
              onClick={exportBooks}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center space-x-2 disabled:bg-blue-300"
            >
              <Download className="h-5 w-5" />
              <span>Export Books</span>
            </button>

            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={importBooks}
                disabled={loading}
                className="hidden"
                id="import-books"
              />
              <div className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-lg font-semibold hover:bg-slate-200 transition flex items-center justify-center space-x-2 cursor-pointer disabled:bg-slate-50">
                <Upload className="h-5 w-5" />
                <span>Import Books</span>
              </div>
            </label>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Note:</strong> Importing books will merge with existing books. Books with
              matching SKUs will be updated.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-8 w-8 text-green-500" />
            <h3 className="text-2xl font-bold text-slate-800">Site Settings</h3>
          </div>

          <p className="text-slate-600 mb-6">
            Export site settings and carousel images, or restore from a backup file.
          </p>

          <div className="space-y-4">
            <button
              onClick={exportSiteSettings}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center space-x-2 disabled:bg-green-300"
            >
              <Download className="h-5 w-5" />
              <span>Export Settings</span>
            </button>

            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={importSiteSettings}
                disabled={loading}
                className="hidden"
                id="import-settings"
              />
              <div className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-lg font-semibold hover:bg-slate-200 transition flex items-center justify-center space-x-2 cursor-pointer">
                <Upload className="h-5 w-5" />
                <span>Import Settings</span>
              </div>
            </label>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Note:</strong> Importing settings will replace existing site settings and
              carousel images.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-3">Best Practices</h4>
        <ul className="space-y-2 text-slate-600">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Export backups regularly to prevent data loss</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Store backup files in a safe location</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Test restore functionality with sample data first</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Books and settings are exported separately for flexibility</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
