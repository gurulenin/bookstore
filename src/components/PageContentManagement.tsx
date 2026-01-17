import { useState, useEffect } from 'react';
import { Save, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PageContent {
  id: string;
  page_key: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function PageContentManagement() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    page_key: '',
    title: '',
    content: '',
    is_published: true
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    const { data } = await supabase
      .from('page_contents')
      .select('*')
      .order('page_key');

    if (data) setPages(data);
  };

  const handleEdit = (page: PageContent) => {
    setSelectedPage(page);
    setFormData({
      page_key: page.page_key,
      title: page.title,
      content: page.content,
      is_published: page.is_published
    });
    setIsEditing(true);
  };

  const handleNew = () => {
    setSelectedPage(null);
    setFormData({
      page_key: '',
      title: '',
      content: '',
      is_published: true
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.page_key || !formData.title) {
      alert('Page key and title are required');
      return;
    }

    if (selectedPage) {
      const { error } = await supabase
        .from('page_contents')
        .update({
          title: formData.title,
          content: formData.content,
          is_published: formData.is_published
        })
        .eq('id', selectedPage.id);

      if (error) {
        alert('Error updating page: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('page_contents')
        .insert([formData]);

      if (error) {
        alert('Error creating page: ' + error.message);
        return;
      }
    }

    setIsEditing(false);
    setSelectedPage(null);
    loadPages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    const { error } = await supabase
      .from('page_contents')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting page: ' + error.message);
      return;
    }

    loadPages();
  };

  const togglePublished = async (page: PageContent) => {
    const { error } = await supabase
      .from('page_contents')
      .update({ is_published: !page.is_published })
      .eq('id', page.id);

    if (error) {
      alert('Error updating page: ' + error.message);
      return;
    }

    loadPages();
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {selectedPage ? 'Edit Page' : 'New Page'}
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Page Key (unique identifier) *
            </label>
            <input
              type="text"
              value={formData.page_key}
              onChange={(e) => setFormData({ ...formData, page_key: e.target.value })}
              disabled={!!selectedPage}
              placeholder="e.g., about, contribute, donate"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none disabled:bg-slate-100"
            />
            <p className="text-xs text-slate-500 mt-1">
              Cannot be changed after creation. Use lowercase with underscores.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Page title"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Content (Markdown) *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={20}
              placeholder="Write your content in markdown format..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Supports markdown formatting: # Heading, **bold**, *italic*, [link](url), etc.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4 text-slate-800 rounded focus:ring-slate-500"
            />
            <label htmlFor="is_published" className="text-sm text-slate-700">
              Published (visible to public)
            </label>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center justify-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>Save Page</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Page Content Management</h2>
        <button
          onClick={handleNew}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Page</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Page Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {page.page_key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {page.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      page.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {page.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(page.updated_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => togglePublished(page)}
                      className="text-slate-600 hover:text-slate-900"
                      title={page.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {page.is_published ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(page)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No pages yet. Create your first page!</p>
          </div>
        )}
      </div>
    </div>
  );
}
