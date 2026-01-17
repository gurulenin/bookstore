import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save } from 'lucide-react';

interface HomePageSettings {
  id: string;
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
}

export default function HomePageSettingsManagement() {
  const [settings, setSettings] = useState<HomePageSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('homepage_settings')
      .select('*')
      .single();

    if (data) {
      setSettings(data);
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
        show_featured_books_card: settings.show_featured_books_card,
        physical_books_title_en: settings.physical_books_title_en,
        physical_books_title_ta: settings.physical_books_title_ta,
        physical_books_desc_en: settings.physical_books_desc_en,
        physical_books_desc_ta: settings.physical_books_desc_ta,
        ebooks_title_en: settings.ebooks_title_en,
        ebooks_title_ta: settings.ebooks_title_ta,
        ebooks_desc_en: settings.ebooks_desc_en,
        ebooks_desc_ta: settings.ebooks_desc_ta,
        audiobooks_title_en: settings.audiobooks_title_en,
        audiobooks_title_ta: settings.audiobooks_title_ta,
        audiobooks_desc_en: settings.audiobooks_desc_en,
        audiobooks_desc_ta: settings.audiobooks_desc_ta,
        featured_books_card_title_en: settings.featured_books_card_title_en,
        featured_books_card_title_ta: settings.featured_books_card_title_ta,
        featured_books_card_desc_en: settings.featured_books_card_desc_en,
        featured_books_card_desc_ta: settings.featured_books_card_desc_ta,
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


  if (!settings) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Format Cards Settings</h2>

        <div className="space-y-8">
          <div className="border-l-4 border-blue-500 pl-4">
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={settings.show_physical_books_card}
                onChange={(e) => setSettings({ ...settings, show_physical_books_card: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="font-bold text-slate-800 text-lg">Physical Books Card</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={settings.physical_books_title_en}
                  onChange={(e) => setSettings({ ...settings, physical_books_title_en: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (Tamil)</label>
                <input
                  type="text"
                  value={settings.physical_books_title_ta}
                  onChange={(e) => setSettings({ ...settings, physical_books_title_ta: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (English)</label>
                <textarea
                  value={settings.physical_books_desc_en}
                  onChange={(e) => setSettings({ ...settings, physical_books_desc_en: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Tamil)</label>
                <textarea
                  value={settings.physical_books_desc_ta}
                  onChange={(e) => setSettings({ ...settings, physical_books_desc_ta: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={settings.show_ebooks_card}
                onChange={(e) => setSettings({ ...settings, show_ebooks_card: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="font-bold text-slate-800 text-lg">E-Books Card</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={settings.ebooks_title_en}
                  onChange={(e) => setSettings({ ...settings, ebooks_title_en: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (Tamil)</label>
                <input
                  type="text"
                  value={settings.ebooks_title_ta}
                  onChange={(e) => setSettings({ ...settings, ebooks_title_ta: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (English)</label>
                <textarea
                  value={settings.ebooks_desc_en}
                  onChange={(e) => setSettings({ ...settings, ebooks_desc_en: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Tamil)</label>
                <textarea
                  value={settings.ebooks_desc_ta}
                  onChange={(e) => setSettings({ ...settings, ebooks_desc_ta: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={settings.show_audiobooks_card}
                onChange={(e) => setSettings({ ...settings, show_audiobooks_card: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="font-bold text-slate-800 text-lg">Audiobooks Card</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={settings.audiobooks_title_en}
                  onChange={(e) => setSettings({ ...settings, audiobooks_title_en: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (Tamil)</label>
                <input
                  type="text"
                  value={settings.audiobooks_title_ta}
                  onChange={(e) => setSettings({ ...settings, audiobooks_title_ta: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (English)</label>
                <textarea
                  value={settings.audiobooks_desc_en}
                  onChange={(e) => setSettings({ ...settings, audiobooks_desc_en: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Tamil)</label>
                <textarea
                  value={settings.audiobooks_desc_ta}
                  onChange={(e) => setSettings({ ...settings, audiobooks_desc_ta: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={settings.show_featured_books_card}
                onChange={(e) => setSettings({ ...settings, show_featured_books_card: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="font-bold text-slate-800 text-lg">Featured Books Card</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={settings.featured_books_card_title_en}
                  onChange={(e) => setSettings({ ...settings, featured_books_card_title_en: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (Tamil)</label>
                <input
                  type="text"
                  value={settings.featured_books_card_title_ta}
                  onChange={(e) => setSettings({ ...settings, featured_books_card_title_ta: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (English)</label>
                <textarea
                  value={settings.featured_books_card_desc_en}
                  onChange={(e) => setSettings({ ...settings, featured_books_card_desc_en: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Tamil)</label>
                <textarea
                  value={settings.featured_books_card_desc_ta}
                  onChange={(e) => setSettings({ ...settings, featured_books_card_desc_ta: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Format Cards Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
