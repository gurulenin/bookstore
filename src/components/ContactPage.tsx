import { useState, useEffect } from 'react';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ContactPage() {
  const [content, setContent] = useState({
    title: 'Contact Us',
    content: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error: err } = await supabase.from('contact_submissions').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
    });

    setSubmitting(false);
    if (err) {
      setError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-8">{content.title}</h1>

          <div className="prose prose-slate max-w-none mb-8">
            {content.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {content.email && (
              <div className="flex items-center space-x-4 p-6 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <Mail className="h-8 w-8 text-blue-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Email</h3>
                  <a href={`mailto:${content.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {content.email}
                  </a>
                </div>
              </div>
            )}

            {content.phone && (
              <div className="flex items-center space-x-4 p-6 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <Phone className="h-8 w-8 text-green-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Phone</h3>
                  <a href={`tel:${content.phone}`} className="text-green-600 dark:text-green-400 hover:underline">
                    {content.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Send us a Message</h2>

          {submitted ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Message Sent!</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Thank you for reaching out. We will get back to you soon.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:border-slate-500 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:border-slate-500 focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:border-slate-500 focus:outline-none"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:border-slate-500 focus:outline-none"
                    placeholder="What's this about?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:border-slate-500 focus:outline-none resize-none"
                  placeholder="Write your message here..."
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
