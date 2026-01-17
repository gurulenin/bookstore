import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SiteSettings {
  id: string;
  about_us_title: string;
  about_us_content: string;
  contact_us_title: string;
  contact_us_content: string;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  payment_qr_code_url: string | null;
  payment_instructions: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  github_url: string | null;
}

export default function SiteSettingsManagement() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    if (data) setSettings(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    await supabase
      .from('site_settings')
      .update({
        about_us_title: settings.about_us_title,
        about_us_content: settings.about_us_content,
        contact_us_title: settings.contact_us_title,
        contact_us_content: settings.contact_us_content,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        whatsapp_number: settings.whatsapp_number,
        payment_qr_code_url: settings.payment_qr_code_url,
        payment_instructions: settings.payment_instructions,
        facebook_url: settings.facebook_url,
        twitter_url: settings.twitter_url,
        instagram_url: settings.instagram_url,
        linkedin_url: settings.linkedin_url,
        youtube_url: settings.youtube_url,
        github_url: settings.github_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', settings.id);

    setSaving(false);
    alert('Settings saved successfully!');
  };

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Site Settings</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-3">About Us Page</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Page Title</label>
            <input
              type="text"
              value={settings.about_us_title}
              onChange={(e) => setSettings({ ...settings, about_us_title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
            <textarea
              value={settings.about_us_content}
              onChange={(e) => setSettings({ ...settings, about_us_content: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-3">Contact Us Page</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Page Title</label>
            <input
              type="text"
              value={settings.contact_us_title}
              onChange={(e) => setSettings({ ...settings, contact_us_title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
            <textarea
              value={settings.contact_us_content}
              onChange={(e) => setSettings({ ...settings, contact_us_content: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={settings.contact_phone || ''}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                placeholder="+91 1234567890"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-3">Order Settings</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              WhatsApp Number (for orders)
            </label>
            <input
              type="tel"
              value={settings.whatsapp_number || ''}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
              placeholder="+91 1234567890"
            />
            <p className="text-sm text-slate-500 mt-1">
              This number will receive order notifications via WhatsApp
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-3">Payment Settings</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment QR Code URL
            </label>
            <input
              type="url"
              value={settings.payment_qr_code_url || ''}
              onChange={(e) => setSettings({ ...settings, payment_qr_code_url: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
              placeholder="https://example.com/qr-code.png"
            />
            {settings.payment_qr_code_url && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">QR Code Preview:</p>
                <img
                  src={settings.payment_qr_code_url}
                  alt="Payment QR Code"
                  className="w-64 h-64 border rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Instructions
            </label>
            <textarea
              value={settings.payment_instructions || ''}
              onChange={(e) => setSettings({ ...settings, payment_instructions: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
              placeholder="Instructions for customers on how to make payment..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-3">Social Media Links</h3>
          <p className="text-sm text-slate-500">Add your social media profile URLs. These will appear in the footer.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Facebook</label>
              <input
                type="url"
                value={settings.facebook_url || ''}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                placeholder="https://facebook.com/your-page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Twitter/X</label>
              <input
                type="url"
                value={settings.twitter_url || ''}
                onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                placeholder="https://twitter.com/your-handle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Instagram</label>
              <input
                type="url"
                value={settings.instagram_url || ''}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                placeholder="https://instagram.com/your-profile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn</label>
              <input
                type="url"
                value={settings.linkedin_url || ''}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">YouTube</label>
              <input
                type="url"
                value={settings.youtube_url || ''}
                onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                placeholder="https://youtube.com/@your-channel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">GitHub</label>
              <input
                type="url"
                value={settings.github_url || ''}
                onChange={(e) => setSettings({ ...settings, github_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                placeholder="https://github.com/your-username"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center space-x-2 disabled:bg-slate-400"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
