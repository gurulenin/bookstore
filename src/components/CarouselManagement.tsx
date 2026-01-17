import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CarouselSlide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  order_index: number;
  is_active: boolean;
}

export default function CarouselManagement() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    subtitle: '',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    const { data } = await supabase
      .from('hero_carousel')
      .select('*')
      .order('order_index', { ascending: true });
    if (data) setSlides(data);
  };

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      subtitle: '',
      order_index: slides.length,
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (slide: CarouselSlide) => {
    setFormData({
      image_url: slide.image_url,
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      order_index: slide.order_index,
      is_active: slide.is_active
    });
    setEditingId(slide.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (slides.length >= 5 && !editingId) {
      alert('Maximum of 5 carousel images allowed');
      return;
    }

    const slideData = {
      image_url: formData.image_url,
      title: formData.title || null,
      subtitle: formData.subtitle || null,
      order_index: formData.order_index,
      is_active: formData.is_active,
      updated_at: new Date().toISOString()
    };

    if (editingId) {
      await supabase.from('hero_carousel').update(slideData).eq('id', editingId);
    } else {
      await supabase.from('hero_carousel').insert([slideData]);
    }

    loadSlides();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this carousel image?')) {
      await supabase.from('hero_carousel').delete().eq('id', id);
      loadSlides();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('hero_carousel')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    loadSlides();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Hero Carousel Management</h2>
          <p className="text-slate-600 mt-2">
            Manage carousel images for the home page (Maximum 5 images)
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={slides.length >= 5}
          className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center space-x-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          <span>Add Slide</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingId ? 'Edit Carousel Slide' : 'Add Carousel Slide'}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image URL *</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  placeholder="https://example.com/hero-image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Preview:</p>
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  placeholder="Welcome to BookHub"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label>
                <textarea
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  placeholder="Discover thousands of books across all formats"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Display Order (0-4)</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded mr-2"
                />
                <label className="text-sm text-slate-700">Active (visible on website)</label>
              </div>

              <div className="flex space-x-4 pt-6 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingId ? 'Update Slide' : 'Add Slide'}</span>
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
        {slides.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 text-lg">No carousel slides yet. Add your first slide to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {slides.map((slide) => (
              <div key={slide.id} className="bg-slate-50 rounded-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={slide.image_url}
                    alt={slide.title || 'Carousel slide'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded">
                      Order: {slide.order_index}
                    </span>
                    {slide.is_active ? (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Active</span>
                    ) : (
                      <span className="bg-slate-400 text-white text-xs px-2 py-1 rounded">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  {slide.title && (
                    <h3 className="font-semibold text-slate-800 mb-1">{slide.title}</h3>
                  )}
                  {slide.subtitle && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{slide.subtitle}</p>
                  )}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(slide)}
                      className="flex-1 text-blue-500 hover:text-blue-700 py-2 border border-blue-500 rounded hover:bg-blue-50 transition text-sm font-medium"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(slide.id, slide.is_active)}
                      className="flex-1 text-slate-600 hover:text-slate-800 py-2 border border-slate-300 rounded hover:bg-slate-50 transition text-sm font-medium"
                    >
                      {slide.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 inline mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 inline mr-1" />
                          Show
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="text-red-500 hover:text-red-700 py-2 px-3 border border-red-500 rounded hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
