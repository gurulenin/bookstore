import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AboutPage() {
  const [content, setContent] = useState({ title: 'About Us', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('about_us_title, about_us_content')
      .single();

    if (data) {
      setContent({
        title: data.about_us_title,
        content: data.about_us_content
      });
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-8">{content.title}</h1>
          <div className="prose prose-slate max-w-none">
            {content.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-slate-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
