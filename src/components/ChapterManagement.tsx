import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Music } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Chapter {
  id: string;
  chapter_number: number;
  chapter_title: string;
  file_url: string;
  duration_minutes?: number;
}

interface ChapterManagementProps {
  formatId: string;
  onClose: () => void;
}

export default function ChapterManagement({ formatId, onClose }: ChapterManagementProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    chapter_number: '',
    chapter_title: '',
    file_url: '',
    duration_minutes: ''
  });

  useEffect(() => {
    loadChapters();
  }, [formatId]);

  const loadChapters = async () => {
    const { data, error } = await supabase
      .from('audiobook_chapters')
      .select('*')
      .eq('book_format_id', formatId)
      .order('chapter_number', { ascending: true });

    if (!error && data) {
      setChapters(data);
    }
  };

  const resetForm = () => {
    setFormData({
      chapter_number: '',
      chapter_title: '',
      file_url: '',
      duration_minutes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (chapter: Chapter) => {
    setFormData({
      chapter_number: chapter.chapter_number.toString(),
      chapter_title: chapter.chapter_title,
      file_url: chapter.file_url,
      duration_minutes: chapter.duration_minutes?.toString() || ''
    });
    setEditingId(chapter.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const chapterData = {
      book_format_id: formatId,
      chapter_number: parseInt(formData.chapter_number),
      chapter_title: formData.chapter_title,
      file_url: formData.file_url,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      updated_at: new Date().toISOString()
    };

    if (editingId) {
      const { error } = await supabase
        .from('audiobook_chapters')
        .update(chapterData)
        .eq('id', editingId);

      if (error) {
        alert('Error updating chapter: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('audiobook_chapters')
        .insert(chapterData);

      if (error) {
        alert('Error creating chapter: ' + error.message);
        return;
      }
    }

    resetForm();
    loadChapters();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    const { error } = await supabase
      .from('audiobook_chapters')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting chapter: ' + error.message);
      return;
    }

    loadChapters();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Music className="h-7 w-7 mr-2 text-orange-500" />
            Manage Audiobook Chapters
          </h2>
          <button
            onClick={onClose}
            className="bg-slate-100 rounded-full p-2 hover:bg-slate-200 transition"
          >
            <X className="h-6 w-6 text-slate-700" />
          </button>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="mb-4 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Chapter
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Chapter Number
                </label>
                <input
                  type="number"
                  value={formData.chapter_number}
                  onChange={(e) => setFormData({ ...formData, chapter_number: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Chapter Title
              </label>
              <input
                type="text"
                value={formData.chapter_title}
                onChange={(e) => setFormData({ ...formData, chapter_title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Audio File URL
              </label>
              <input
                type="url"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {chapters.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No chapters added yet</p>
          ) : (
            chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Ch. {chapter.chapter_number}
                    </span>
                    <h3 className="font-semibold text-slate-800">{chapter.chapter_title}</h3>
                  </div>
                  {chapter.duration_minutes && (
                    <p className="text-sm text-slate-500 mt-1">{chapter.duration_minutes} minutes</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1 truncate">{chapter.file_url}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(chapter)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(chapter.id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
