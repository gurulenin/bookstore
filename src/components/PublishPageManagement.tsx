import { useState, useEffect } from 'react';
import { Save, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PublishPageManagement() {
  const [formUrl, setFormUrl] = useState('');
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('id, publish_form_url')
      .maybeSingle();
    if (data) {
      setSettingsId(data.id);
      setFormUrl(data.publish_form_url || '');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsId) return;
    setSaving(true);
    await supabase
      .from('site_settings')
      .update({ publish_form_url: formUrl || null, updated_at: new Date().toISOString() })
      .eq('id', settingsId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Publish Your Book Page</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Configure the Google Form that appears on the "Publish Your Book" page.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3">
            Google Form Settings
          </h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Google Form Embed URL
            </label>
            <input
              type="url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              In Google Forms, click Send &rarr; Embed (&lt;&gt;) &rarr; copy the <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">src</code> URL from the iframe code.
            </p>
          </div>

          {formUrl && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Preview</p>
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Open in new tab</span>
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <iframe
                  src={formUrl}
                  title="Google Form Preview"
                  width="100%"
                  height="500"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  className="block"
                >
                  Loading…
                </iframe>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-400'
            }`}
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
