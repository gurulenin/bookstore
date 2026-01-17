import { useState, useEffect } from 'react';
import { Plus, Edit, Save, X, Languages } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/translations';

interface Translation {
  id: string;
  key: string;
  english: string;
  tamil: string;
  category: string;
}

export default function TranslationManagement() {
  const { loadTranslations } = useTranslation();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    key: '',
    english: '',
    tamil: '',
    category: 'common'
  });

  useEffect(() => {
    loadAllTranslations();
  }, []);

  const loadAllTranslations = async () => {
    const { data } = await supabase
      .from('ui_translations')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });
    if (data) setTranslations(data);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      english: '',
      tamil: '',
      category: 'common'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (translation: Translation) => {
    setFormData({
      key: translation.key,
      english: translation.english,
      tamil: translation.tamil,
      category: translation.category
    });
    setEditingId(translation.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const translationData = {
      key: formData.key,
      english: formData.english,
      tamil: formData.tamil,
      category: formData.category,
      updated_at: new Date().toISOString()
    };

    if (editingId) {
      await supabase
        .from('ui_translations')
        .update(translationData)
        .eq('id', editingId);
    } else {
      await supabase.from('ui_translations').insert([translationData]);
    }

    await loadAllTranslations();
    await loadTranslations();
    resetForm();
  };

  const filteredTranslations = translations.filter((t) => {
    const matchesSearch =
      t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tamil.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(translations.map((t) => t.category)));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Translation Management</h2>
          <p className="text-slate-600 mt-2">Manage bilingual translations (English & Tamil)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Translation</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            placeholder="Search translations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Key</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">English</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tamil</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Category</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTranslations.map((translation) => (
                <tr key={translation.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono">{translation.key}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{translation.english}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{translation.tamil}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 rounded">{translation.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(translation)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
                <Languages className="h-6 w-6" />
                <span>{editingId ? 'Edit Translation' : 'Add Translation'}</span>
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Translation Key *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  required
                  disabled={!!editingId}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none font-mono disabled:bg-slate-100"
                  placeholder="e.g., nav.home, book.title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  English Text *
                </label>
                <input
                  type="text"
                  value={formData.english}
                  onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  placeholder="Home"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tamil Text *
                </label>
                <input
                  type="text"
                  value={formData.tamil}
                  onChange={(e) => setFormData({ ...formData, tamil: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  placeholder="முகப்பு"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                >
                  <option value="common">Common</option>
                  <option value="navigation">Navigation</option>
                  <option value="book">Book</option>
                  <option value="format">Format</option>
                  <option value="action">Action</option>
                  <option value="admin">Admin</option>
                  <option value="filter">Filter</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-6 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingId ? 'Update Translation' : 'Add Translation'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
