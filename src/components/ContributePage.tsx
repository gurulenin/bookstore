import { useState, useEffect } from 'react';
import { BookOpen, Image, Headphones, Heart, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/translations';

type ContributeSubView = 'making_ebooks' | 'making_covers' | 'making_audiobooks' | 'donate';

interface ContributePageProps {
  subView: ContributeSubView;
  onSubViewChange: (view: ContributeSubView) => void;
}

interface PageContent {
  page_key: string;
  title_en: string;
  title_ta: string;
  subtitle_en: string;
  subtitle_ta: string;
  body_en: string;
  body_ta: string;
}

const subPageDefs: Array<{ key: ContributeSubView; labelEn: string; labelTa: string; icon: typeof BookOpen; color: string }> = [
  { key: 'making_ebooks', labelEn: 'Making E-Books', labelTa: 'மின்-புத்தகங்கள்', icon: BookOpen, color: 'blue' },
  { key: 'making_covers', labelEn: 'Making Book Covers', labelTa: 'புத்தக அட்டைகள்', icon: Image, color: 'green' },
  { key: 'making_audiobooks', labelEn: 'Making Audio Books', labelTa: 'ஆடியோ புத்தகங்கள்', icon: Headphones, color: 'orange' },
  { key: 'donate', labelEn: 'Donate', labelTa: 'நன்கொடை', icon: Heart, color: 'red' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
  orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
  red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
};

const activeBorderMap: Record<string, string> = {
  blue: 'border-blue-500',
  green: 'border-green-500',
  orange: 'border-orange-500',
  red: 'border-red-500',
};

export default function ContributePage({ subView, onSubViewChange }: ContributePageProps) {
  const { language } = useTranslation();
  const [contents, setContents] = useState<Record<string, PageContent>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('contribute_page_content')
      .select('*')
      .then(({ data }) => {
        if (data) {
          const map: Record<string, PageContent> = {};
          data.forEach((row: PageContent) => { map[row.page_key] = row; });
          setContents(map);
        }
        setLoading(false);
      });
  }, []);

  const tx = (content: PageContent | undefined, enKey: keyof PageContent, taKey: keyof PageContent) => {
    if (!content) return '';
    return language === 'ta' ? (content[taKey] as string || content[enKey] as string) : content[enKey] as string;
  };

  const active = subPageDefs.find(d => d.key === subView)!;
  const content = contents[subView];
  const Icon = active.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          {subPageDefs.map(def => {
            const DefIcon = def.icon;
            const isActive = subView === def.key;
            return (
              <button
                key={def.key}
                onClick={() => onSubViewChange(def.key)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm border-2 transition ${
                  isActive
                    ? `${activeBorderMap[def.color]} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm`
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <DefIcon className="h-4 w-4" />
                <span>{language === 'ta' ? def.labelTa : def.labelEn}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="h-8 w-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 py-8 border-b border-slate-200 dark:border-slate-700">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 ${colorMap[active.color]}`}>
                <Icon className="h-7 w-7" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                {tx(content, 'title_en', 'title_ta')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
                {tx(content, 'subtitle_en', 'subtitle_ta')}
              </p>
            </div>
            <div className="px-8 py-8">
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {tx(content, 'body_en', 'body_ta')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export type { ContributeSubView };
