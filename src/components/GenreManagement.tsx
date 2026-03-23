import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Genre {
  id: string;
  name_en: string;
  name_ta: string;
}

export default function GenreManagement() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name_en: '', name_ta: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    setLoading(true);
    const { data } = await supabase.from('genres').select('*').order('name_en');
    if (data) setGenres(data);
    setLoading(false);
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name_en: '', name_ta: '' });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (genre: Genre) => {
    setEditingId(genre.id);
    setFormData({ name_en: genre.name_en, name_ta: genre.name_ta });
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.name_en.trim()) {
      setError('English name is required.');
      return;
    }
    if (!formData.name_ta.trim()) {
      setError('Tamil name is required.');
      return;
    }
    setSaving(true);
    setError(null);

    if (editingId) {
      const { error: err } = await supabase
        .from('genres')
        .update({ name_en: formData.name_en.trim(), name_ta: formData.name_ta.trim() })
        .eq('id', editingId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase
        .from('genres')
        .insert({ name_en: formData.name_en.trim(), name_ta: formData.name_ta.trim() });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    closeForm();
    loadGenres();
  };

  const handleDelete = async (id: string, nameEn: string) => {
    if (!confirm(`Delete genre "${nameEn}"? Books using this genre will retain the text value but it won't appear in filters.`)) return;
    await supabase.from('genres').delete().eq('id', id);
    loadGenres();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Genre Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add, edit, or remove genres with English and Tamil names</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-800 px-4 py-2 rounded-lg font-semibold hover:bg-slate-700 dark:hover:bg-slate-200 transition"
        >
          <Plus className="h-4 w-4" />
          Add Genre
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading genres...</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">English Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tamil Name</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {genres.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    <Tag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No genres yet. Add your first genre.</p>
                  </td>
                </tr>
              )}
              {genres.map((genre) => (
                <tr key={genre.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{genre.name_en}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{genre.name_ta}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(genre)}
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-600"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(genre.id, genre.name_en)}
                        className="text-red-400 hover:text-red-600 transition p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingId ? 'Edit Genre' : 'Add Genre'}
              </h3>
              <button onClick={closeForm} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  English Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Fiction"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-slate-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Tamil Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_ta}
                  onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
                  placeholder="e.g. கதைசாகித்யம்"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-slate-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeForm}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-800 font-semibold hover:bg-slate-700 dark:hover:bg-slate-200 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add Genre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
