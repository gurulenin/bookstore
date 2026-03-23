import { useState, useEffect } from 'react';
import { Save, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PublishContent {
  id: string;
  title_en: string;
  title_ta: string;
  subtitle_en: string;
  subtitle_ta: string;
  step1_title_en: string;
  step1_title_ta: string;
  step1_desc_en: string;
  step1_desc_ta: string;
  step2_title_en: string;
  step2_title_ta: string;
  step2_desc_en: string;
  step2_desc_ta: string;
  step3_title_en: string;
  step3_title_ta: string;
  step3_desc_en: string;
  step3_desc_ta: string;
  form_title_en: string;
  form_title_ta: string;
  form_desc_en: string;
  form_desc_ta: string;
}

const emptyContent: Omit<PublishContent, 'id'> = {
  title_en: '', title_ta: '',
  subtitle_en: '', subtitle_ta: '',
  step1_title_en: '', step1_title_ta: '',
  step1_desc_en: '', step1_desc_ta: '',
  step2_title_en: '', step2_title_ta: '',
  step2_desc_en: '', step2_desc_ta: '',
  step3_title_en: '', step3_title_ta: '',
  step3_desc_en: '', step3_desc_ta: '',
  form_title_en: '', form_title_ta: '',
  form_desc_en: '', form_desc_ta: '',
};

interface BilingualFieldProps {
  label: string;
  enValue: string;
  taValue: string;
  onEnChange: (v: string) => void;
  onTaChange: (v: string) => void;
  multiline?: boolean;
}

function BilingualField({ label, enValue, taValue, onEnChange, onTaChange, multiline }: BilingualFieldProps) {
  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm";
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">English</p>
          {multiline ? (
            <textarea rows={3} value={enValue} onChange={e => onEnChange(e.target.value)} className={inputClass} />
          ) : (
            <input type="text" value={enValue} onChange={e => onEnChange(e.target.value)} className={inputClass} />
          )}
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tamil (தமிழ்)</p>
          {multiline ? (
            <textarea rows={3} value={taValue} onChange={e => onTaChange(e.target.value)} className={inputClass} />
          ) : (
            <input type="text" value={taValue} onChange={e => onTaChange(e.target.value)} className={inputClass} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublishPageManagement() {
  const [formUrl, setFormUrl] = useState('');
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [content, setContent] = useState<PublishContent>({ id: '', ...emptyContent });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [settingsRes, contentRes] = await Promise.all([
      supabase.from('site_settings').select('id, publish_form_url').maybeSingle(),
      supabase.from('publish_page_content').select('*').maybeSingle(),
    ]);
    if (settingsRes.data) {
      setSettingsId(settingsRes.data.id);
      setFormUrl(settingsRes.data.publish_form_url || '');
    }
    if (contentRes.data) {
      setContent(contentRes.data);
    }
  };

  const setField = (key: keyof Omit<PublishContent, 'id'>, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const promises: Promise<unknown>[] = [];

    if (settingsId) {
      promises.push(
        supabase
          .from('site_settings')
          .update({ publish_form_url: formUrl || null, updated_at: new Date().toISOString() })
          .eq('id', settingsId)
      );
    }

    if (content.id) {
      const { id, ...fields } = content;
      promises.push(
        supabase
          .from('publish_page_content')
          .update({ ...fields, updated_at: new Date().toISOString() })
          .eq('id', id)
      );
    }

    await Promise.all(promises);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Publish Your Book Page</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage all content on the Publish Your Book page in English and Tamil.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3">
            Hero Section
          </h3>
          <BilingualField
            label="Page Title"
            enValue={content.title_en}
            taValue={content.title_ta}
            onEnChange={v => setField('title_en', v)}
            onTaChange={v => setField('title_ta', v)}
          />
          <BilingualField
            label="Page Subtitle"
            enValue={content.subtitle_en}
            taValue={content.subtitle_ta}
            onEnChange={v => setField('subtitle_en', v)}
            onTaChange={v => setField('subtitle_ta', v)}
            multiline
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3">
            Step Cards
          </h3>
          <BilingualField
            label="Step 1 Title"
            enValue={content.step1_title_en}
            taValue={content.step1_title_ta}
            onEnChange={v => setField('step1_title_en', v)}
            onTaChange={v => setField('step1_title_ta', v)}
          />
          <BilingualField
            label="Step 1 Description"
            enValue={content.step1_desc_en}
            taValue={content.step1_desc_ta}
            onEnChange={v => setField('step1_desc_en', v)}
            onTaChange={v => setField('step1_desc_ta', v)}
            multiline
          />
          <BilingualField
            label="Step 2 Title"
            enValue={content.step2_title_en}
            taValue={content.step2_title_ta}
            onEnChange={v => setField('step2_title_en', v)}
            onTaChange={v => setField('step2_title_ta', v)}
          />
          <BilingualField
            label="Step 2 Description"
            enValue={content.step2_desc_en}
            taValue={content.step2_desc_ta}
            onEnChange={v => setField('step2_desc_en', v)}
            onTaChange={v => setField('step2_desc_ta', v)}
            multiline
          />
          <BilingualField
            label="Step 3 Title"
            enValue={content.step3_title_en}
            taValue={content.step3_title_ta}
            onEnChange={v => setField('step3_title_en', v)}
            onTaChange={v => setField('step3_title_ta', v)}
          />
          <BilingualField
            label="Step 3 Description"
            enValue={content.step3_desc_en}
            taValue={content.step3_desc_ta}
            onEnChange={v => setField('step3_desc_en', v)}
            onTaChange={v => setField('step3_desc_ta', v)}
            multiline
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3">
            Form Section
          </h3>
          <BilingualField
            label="Form Title"
            enValue={content.form_title_en}
            taValue={content.form_title_ta}
            onEnChange={v => setField('form_title_en', v)}
            onTaChange={v => setField('form_title_ta', v)}
          />
          <BilingualField
            label="Form Description"
            enValue={content.form_desc_en}
            taValue={content.form_desc_ta}
            onEnChange={v => setField('form_desc_en', v)}
            onTaChange={v => setField('form_desc_ta', v)}
            multiline
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-4">
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
            <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save All'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
