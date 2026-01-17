import { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  author_name: string;
  published_at: string;
}

interface BlogListProps {
  onSelectBlog: (blogId: string) => void;
}

export default function BlogList({ onSelectBlog }: BlogListProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blogs')
      .select('id, title, slug, excerpt, cover_image_url, author_name, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (data) setBlogs(data);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-20">Loading blogs...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Our Blog</h1>
          <p className="text-xl text-slate-600">
            Discover the latest news, updates, and insights
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-500">No blog posts yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => onSelectBlog(blog.id)}
              >
                {blog.cover_image_url && (
                  <img
                    src={blog.cover_image_url}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-3 line-clamp-2">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-slate-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{blog.author_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold">
                    <span>Read More</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
