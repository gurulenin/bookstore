import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  author_name: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface BlogComment {
  id: string;
  blog_id: string;
  user_name: string;
  user_email: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image_url: '',
    author_name: 'Admin',
    is_published: false
  });

  useEffect(() => {
    loadBlogs();
    loadComments();
  }, []);

  const loadBlogs = async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBlogs(data);
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from('blog_comments')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setComments(data);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      cover_image_url: '',
      author_name: 'Admin',
      is_published: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (blog: Blog) => {
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt || '',
      cover_image_url: blog.cover_image_url || '',
      author_name: blog.author_name,
      is_published: blog.is_published
    });
    setEditingId(blog.id);
    setShowForm(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = formData.slug || generateSlug(formData.title);
    const blogData = {
      ...formData,
      slug,
      published_at: formData.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    if (editingId) {
      await supabase.from('blogs').update(blogData).eq('id', editingId);
    } else {
      await supabase.from('blogs').insert([blogData]);
    }

    loadBlogs();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      await supabase.from('blogs').delete().eq('id', id);
      loadBlogs();
    }
  };

  const toggleCommentApproval = async (commentId: string, currentStatus: boolean) => {
    await supabase
      .from('blog_comments')
      .update({ is_approved: !currentStatus })
      .eq('id', commentId);
    loadComments();
  };

  const deleteComment = async (id: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await supabase.from('blog_comments').delete().eq('id', id);
      loadComments();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Blog Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            {showComments ? 'View Blogs' : 'View Comments'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Blog</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingId ? 'Edit Blog' : 'Add New Blog'}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
                    }}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Author Name</label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded mr-2"
                  />
                  <label className="text-sm text-slate-700">Publish immediately</label>
                </div>
              </div>

              <div className="flex space-x-4 pt-6 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingId ? 'Update Blog' : 'Add Blog'}</span>
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

      {showComments ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-slate-100 border-b">
            <h3 className="text-xl font-bold text-slate-800">Comments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Comment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-800">{comment.user_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{comment.user_email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">{comment.comment}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        comment.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {comment.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleCommentApproval(comment.id, comment.is_approved)}
                          className={`p-2 ${comment.is_approved ? 'text-yellow-500' : 'text-green-500'}`}
                          title={comment.is_approved ? 'Unapprove' : 'Approve'}
                        >
                          {comment.is_approved ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Author</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Created</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-800">{blog.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{blog.author_name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        blog.is_published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {blog.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="text-blue-500 hover:text-blue-700 p-2"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
