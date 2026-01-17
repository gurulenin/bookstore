import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, LogOut, Save, X, BookOpen, FileText, Package, Settings, Image, Languages, Database, Music, Layout, Menu as MenuIcon } from 'lucide-react';
import { BookWithFormats, BookFormat, supabase } from '../lib/supabase';
import BlogManagement from './BlogManagement';
import OrderManagement from './OrderManagement';
import SiteSettingsManagement from './SiteSettingsManagement';
import CarouselManagement from './CarouselManagement';
import TranslationManagement from './TranslationManagement';
import BackupRestore from './BackupRestore';
import ChapterManagement from './ChapterManagement';
import PageContentManagement from './PageContentManagement';
import MenuSettingsManagement from './MenuSettingsManagement';

interface AdminPanelProps {
  books: BookWithFormats[];
  onLogout: () => void;
  onAddBook: (book: Omit<BookWithFormats, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateBook: (id: string, book: Partial<BookWithFormats>) => void;
  onDeleteBook: (id: string) => void;
}

type AdminTab = 'books' | 'blogs' | 'pages' | 'menus' | 'orders' | 'carousel' | 'translations' | 'backup' | 'settings';

interface BookFormData {
  title: string;
  author: string;
  description: string;
  isbn: string;
  sku: string;
  genre: string;
  cover_image_url: string;
  publisher: string;
  published_date: string;
  formats: Array<{
    format_type: 'physical' | 'ebook' | 'audiobook';
    price: string;
    file_url: string;
    file_format: string;
    stock_quantity: string;
    is_available: boolean;
    license_info: string;
  }>;
}

export default function AdminPanel({ books, onLogout, onAddBook, onUpdateBook, onDeleteBook }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('books');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [genres, setGenres] = useState<Array<{ name_en: string; name_ta: string }>>([]);
  const [managingChaptersFormatId, setManagingChaptersFormatId] = useState<string | null>(null);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    const { data } = await supabase.from('genres').select('name_en, name_ta').order('name_en');
    if (data) setGenres(data);
  };
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    description: '',
    isbn: '',
    sku: '',
    genre: '',
    cover_image_url: '',
    publisher: '',
    published_date: '',
    formats: []
  });

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      isbn: '',
      sku: '',
      genre: '',
      cover_image_url: '',
      publisher: '',
      published_date: '',
      formats: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (book: BookWithFormats) => {
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      isbn: book.isbn || '',
      sku: book.sku || '',
      genre: book.genre || '',
      cover_image_url: book.cover_image_url,
      publisher: book.publisher,
      published_date: book.published_date || '',
      formats: book.formats.map(f => ({
        format_type: f.format_type,
        price: f.price.toString(),
        file_url: f.file_url || '',
        file_format: f.file_format || '',
        stock_quantity: f.stock_quantity?.toString() || '0',
        is_available: f.is_available,
        license_info: f.license_info || ''
      }))
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bookData = {
      title: formData.title,
      author: formData.author,
      description: formData.description,
      isbn: formData.isbn,
      sku: formData.sku || `SKU-${Date.now()}`,
      genre: formData.genre,
      cover_image_url: formData.cover_image_url,
      publisher: formData.publisher,
      published_date: formData.published_date,
      formats: formData.formats.map((f, idx) => ({
        id: `format-${Date.now()}-${idx}`,
        book_id: editingId || '',
        format_type: f.format_type,
        price: parseFloat(f.price) || 0,
        file_url: f.file_url,
        file_format: f.file_format,
        file_size: 0,
        stock_quantity: parseInt(f.stock_quantity) || 0,
        is_available: f.is_available,
        license_info: f.license_info,
        created_at: new Date().toISOString()
      }))
    };

    if (editingId) {
      onUpdateBook(editingId, bookData);
    } else {
      onAddBook(bookData as any);
    }

    resetForm();
  };

  const addFormat = () => {
    setFormData({
      ...formData,
      formats: [
        ...formData.formats,
        {
          format_type: 'ebook',
          price: '0',
          file_url: '',
          file_format: 'pdf',
          stock_quantity: '0',
          is_available: true,
          license_info: ''
        }
      ]
    });
  };

  const removeFormat = (index: number) => {
    setFormData({
      ...formData,
      formats: formData.formats.filter((_, i) => i !== index)
    });
  };

  const updateFormat = (index: number, field: string, value: any) => {
    const newFormats = [...formData.formats];
    newFormats[index] = { ...newFormats[index], [field]: value };
    setFormData({ ...formData, formats: newFormats });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Admin Panel</h1>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition flex items-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition ${
                activeTab === 'books'
                  ? 'text-slate-800 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>Books</span>
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition ${
                activeTab === 'blogs'
                  ? 'text-slate-800 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Blogs</span>
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition ${
                activeTab === 'pages'
                  ? 'text-slate-800 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layout className="h-5 w-5" />
              <span>Pages</span>
            </button>
            <button
              onClick={() => setActiveTab('menus')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition ${
                activeTab === 'menus'
                  ? 'text-slate-800 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MenuIcon className="h-5 w-5" />
              <span>Menus</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition ${
                activeTab === 'orders'
                  ? 'text-slate-800 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Package className="h-5 w-5" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('carousel')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition ${
                activeTab === 'carousel'
                  ? 'text-slate-800 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Image className="h-5 w-5" />
              <span>Carousel</span>
            </button>
            <button
              onClick={() => setActiveTab('translations')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition ${
                activeTab === 'translations'
                  ? 'text-slate-800 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Languages className="h-5 w-5" />
              <span>Translations</span>
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition ${
                activeTab === 'backup'
                  ? 'text-slate-800 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Database className="h-5 w-5" />
              <span>Backup</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition ${
                activeTab === 'settings'
                  ? 'text-slate-800 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {activeTab === 'books' && (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowForm(true)}
                className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Book</span>
              </button>
            </div>

            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">
                      {editingId ? 'Edit Book' : 'Add New Book'}
                    </h2>
                    <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Author *</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ISBN</label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Genre</label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                    >
                      <option value="">Select a genre</option>
                      {genres.map((g) => (
                        <option key={g.name_en} value={g.name_en}>{g.name_en}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Publisher</label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Published Date</label>
                    <input
                      type="date"
                      value={formData.published_date}
                      onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
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
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Book Formats</h3>
                    <button
                      type="button"
                      onClick={addFormat}
                      className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Format</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.formats.map((format, index) => {
                      const editingBook = editingId ? books.find(b => b.id === editingId) : null;
                      const existingFormat = editingBook?.formats[index];
                      const canManageChapters = format.format_type === 'audiobook' && existingFormat?.id;

                      return (
                      <div key={index} className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-700">Format #{index + 1}</h4>
                          {canManageChapters && (
                            <button
                              type="button"
                              onClick={() => setManagingChaptersFormatId(existingFormat.id)}
                              className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-600 transition flex items-center space-x-1"
                            >
                              <Music className="h-4 w-4" />
                              <span>Manage Chapters</span>
                            </button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                            <select
                              value={format.format_type}
                              onChange={(e) => updateFormat(index, 'format_type', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                            >
                              <option value="physical">Physical</option>
                              <option value="ebook">Ebook</option>
                              <option value="audiobook">Audiobook</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
                            <input
                              type="number"
                              step="0.01"
                              value={format.price}
                              onChange={(e) => updateFormat(index, 'price', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">File Format</label>
                            {format.format_type === 'ebook' ? (
                              <select
                                value={format.file_format}
                                onChange={(e) => updateFormat(index, 'file_format', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                              >
                                <option value="">Select Format</option>
                                <option value="pdf">PDF</option>
                                <option value="epub">EPUB</option>
                                <option value="html">HTML (Read Online)</option>
                              </select>
                            ) : format.format_type === 'audiobook' ? (
                              <input
                                type="text"
                                value="mp3"
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-100 text-slate-500"
                              />
                            ) : (
                              <input
                                type="text"
                                value="N/A"
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-100 text-slate-500"
                              />
                            )}
                          </div>

                          {format.format_type === 'physical' && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Stock</label>
                              <input
                                type="number"
                                value={format.stock_quantity}
                                onChange={(e) => updateFormat(index, 'stock_quantity', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                              />
                            </div>
                          )}

                          {format.format_type !== 'physical' && (
                            <>
                              <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-slate-700 mb-2">File URL</label>
                                <input
                                  type="url"
                                  value={format.file_url}
                                  onChange={(e) => updateFormat(index, 'file_url', e.target.value)}
                                  placeholder={format.format_type === 'audiobook' ? 'https://example.com/audio.mp3' : 'https://example.com/file.pdf'}
                                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                                />
                              </div>
                              <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-slate-700 mb-2">License Info</label>
                                <input
                                  type="text"
                                  value={format.license_info}
                                  onChange={(e) => updateFormat(index, 'license_info', e.target.value)}
                                  placeholder="e.g., CC-BY-SA, Public Domain, GPL, etc."
                                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                                />
                              </div>
                            </>
                          )}

                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={format.is_available}
                                onChange={(e) => updateFormat(index, 'is_available', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm text-slate-700">Available</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => removeFormat(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{editingId ? 'Update Book' : 'Add Book'}</span>
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

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Author</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Formats</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ISBN</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {books.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-800">{book.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{book.author}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {book.formats.map(f => f.format_type).join(', ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{book.isbn || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(book)}
                              className="text-blue-500 hover:text-blue-700 p-2"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => onDeleteBook(book.id)}
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
          </>
        )}

        {activeTab === 'blogs' && <BlogManagement />}
        {activeTab === 'pages' && <PageContentManagement />}
        {activeTab === 'menus' && <MenuSettingsManagement />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'carousel' && <CarouselManagement />}
        {activeTab === 'translations' && <TranslationManagement />}
        {activeTab === 'backup' && <BackupRestore />}
        {activeTab === 'settings' && <SiteSettingsManagement />}
      </div>

      {managingChaptersFormatId && (
        <ChapterManagement
          formatId={managingChaptersFormatId}
          onClose={() => setManagingChaptersFormatId(null)}
        />
      )}
    </div>
  );
}
