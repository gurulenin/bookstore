import { useState, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ContactPage() {
  const [content, setContent] = useState({
    title: 'Contact Us',
    content: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('contact_us_title, contact_us_content, contact_email, contact_phone')
      .single();

    if (data) {
      setContent({
        title: data.contact_us_title,
        content: data.contact_us_content,
        email: data.contact_email || '',
        phone: data.contact_phone || ''
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

          <div className="prose prose-slate max-w-none mb-8">
            {content.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-slate-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {content.email && (
              <div className="flex items-center space-x-4 p-6 bg-slate-50 rounded-lg">
                <Mail className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Email</h3>
                  <a
                    href={`mailto:${content.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {content.email}
                  </a>
                </div>
              </div>
            )}

            {content.phone && (
              <div className="flex items-center space-x-4 p-6 bg-slate-50 rounded-lg">
                <Phone className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Phone</h3>
                  <a
                    href={`tel:${content.phone}`}
                    className="text-green-600 hover:underline"
                  >
                    {content.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
