import { useState, useEffect } from 'react';
import { Save, BookOpen, Image, Headphones, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

type PageKey = 'making_ebooks' | 'making_covers' | 'making_audiobooks' | 'donate';

interface PageContent {
  id: string;
  page_key: PageKey;
  title_en: string;
  title_ta: string;
  subtitle_en: string;
  subtitle_ta: string;
  body_en: string;
  body_ta: string;
}

const pageDefs: Array<{ key: PageKey; labelEn: string; icon: typeof BookOpen }> = [
  { key: 'making_ebooks', labelEn: 'Making E-Books', icon: BookOpen },
  { key: 'making_covers', labelEn: 'Making Book Covers', icon: Image },
  { key: 'making_audiobooks', labelEn: 'Making Audio Books', icon: Headphones },
  { key: 'donate', labelEn: 'Donate', icon: Heart },
];

const emptyContent = (key: PageKey): PageContent => ({
  id: '', page_key: key,
  title_en: '', title_ta: '',
  subtitle_en: '', subtitle_ta: '',
  body_en: '', body_ta: '',
});

interface BilingualFieldProps {
  label: string;
  enValue: string;
  taValue: string;
  onEnChange: (v: string) => void;
  onTaChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}

function BilingualField({ label, enValue, taValue, onEnChange, onTaChange, multiline, rows = 3 }: BilingualFieldProps) {
  const cls = "w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm";
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">English</p>
          {multiline
            ? <textarea rows={rows} value={enValue} onChange={e => onEnChange(e.target.value)} className={cls} />
            : <input type="text" value={enValue} onChange={e => onEnChange(e.target.value)} className={cls} />}
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tamil (தமிழ்)</p>
          {multiline
            ? <textarea rows={rows} value={taValue} onChange={e => onTaChange(e.target.value)} className={cls} />
            : <input type="text" value={taValue} onChange={e => onTaChange(e.target.value)} className={cls} />}
        </div>
      </div>
    </div>
  );
}

export default function ContributePageManagement() {
  const [activeKey, setActiveKey] = useState<PageKey>('making_ebooks');
  const [contents, setContents] = useState<Record<PageKey, PageContent>>({
    making_ebooks: emptyContent('making_ebooks'),
    making_covers: emptyContent('making_covers'),
    making_audiobooks: emptyContent('making_audiobooks'),
    donate: emptyContent('donate'),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from('contribute_page_content').select('*');
    if (data) {
      const updated = { ...contents };
      data.forEach((row: PageContent) => {
        if (row.page_key in updated) updated[row.page_key] = row;
      });
      setContents(updated);
    }
  };

  const setField = (key: keyof Omit<PageContent, 'id' | 'page_key'>, value: string) => {
    setContents(prev => ({ ...prev, [activeKey]: { ...prev[activeKey], [key]: value } }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const row = contents[activeKey];
    if (row.id) {
      const { id, page_key, ...fields } = row;
      await supabase
        .from('contribute_page_content')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id);
    } else {
      const { data } = await supabase
        .from('contribute_page_content')
        .insert({ ...row })
        .select()
        .single();
      if (data) setContents(prev => ({ ...prev, [activeKey]: data }));
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const current = contents[activeKey];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Contribute Page</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage content for each Contribute sub-page in English and Tamil.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {pageDefs.map(def => {
          const DefIcon = def.icon;
          return (
            <button
              key={def.key}
              onClick={() => { setActiveKey(def.key); setSaved(false); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeKey === def.key
                  ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-800'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <DefIcon className="h-4 w-4" />
              <span>{def.labelEn}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3">
            {pageDefs.find(d => d.key === activeKey)?.labelEn}
          </h3>
          <BilingualField
            label="Title"
            enValue={current.title_en}
            taValue={current.title_ta}
            onEnChange={v => setField('title_en', v)}
            onTaChange={v => setField('title_ta', v)}
          />
          <BilingualField
            label="Subtitle"
            enValue={current.subtitle_en}
            taValue={current.subtitle_ta}
            onEnChange={v => setField('subtitle_en', v)}
            onTaChange={v => setField('subtitle_ta', v)}
            multiline
            rows={3}
          />
          <BilingualField
            label="Body Content"
            enValue={current.body_en}
            taValue={current.body_ta}
            onEnChange={v => setField('body_en', v)}
            onTaChange={v => setField('body_ta', v)}
            multiline
            rows={8}
          />
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
            <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
