import { useState, useEffect } from 'react';
import { BookOpen, PenLine, Upload, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/translations';

interface PublishContent {
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

const defaults: PublishContent = {
  title_en: 'Publish Your Book',
  title_ta: 'உங்கள் புத்தகத்தை வெளியிடுங்கள்',
  subtitle_en: 'Are you an author? Share your work with thousands of readers. Fill out the form below and our team will get in touch with you.',
  subtitle_ta: 'நீங்கள் ஒரு எழுத்தாளரா? ஆயிரக்கணக்கான வாசகர்களுடன் உங்கள் படைப்பை பகிருங்கள். கீழே உள்ள படிவத்தை நிரப்புங்கள், எங்கள் குழு உங்களை தொடர்பு கொள்ளும்.',
  step1_title_en: 'Submit Request',
  step1_title_ta: 'விண்ணப்பம் சமர்ப்பிக்கவும்',
  step1_desc_en: 'Fill out the form with your book details and contact info.',
  step1_desc_ta: 'உங்கள் புத்தக விவரங்கள் மற்றும் தொடர்பு தகவலுடன் படிவத்தை நிரப்புங்கள்.',
  step2_title_en: 'We Review',
  step2_title_ta: 'நாங்கள் மதிப்பாய்வு செய்கிறோம்',
  step2_desc_en: 'Our editorial team reviews your submission and contacts you.',
  step2_desc_ta: 'எங்கள் தலையங்க குழு உங்கள் சமர்ப்பிப்பை மதிப்பாய்வு செய்து உங்களை தொடர்பு கொள்ளும்.',
  step3_title_en: 'Get Published',
  step3_title_ta: 'வெளியீடு பெறுங்கள்',
  step3_desc_en: 'Your book goes live and reaches thousands of readers.',
  step3_desc_ta: 'உங்கள் புத்தகம் வெளியாகி ஆயிரக்கணக்கான வாசகர்களை சென்றடையும்.',
  form_title_en: 'Writer Request Form',
  form_title_ta: 'எழுத்தாளர் விண்ணப்பப் படிவம்',
  form_desc_en: 'Please complete all fields. We typically respond within 3-5 business days.',
  form_desc_ta: 'அனைத்து புலங்களையும் நிரப்பவும். நாங்கள் பொதுவாக 3-5 வணிக நாட்களுக்குள் பதில் அளிப்போம்.',
};

export default function PublishPage() {
  const { language } = useTranslation();
  const [formUrl, setFormUrl] = useState<string | null>(null);
  const [content, setContent] = useState<PublishContent>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('site_settings').select('publish_form_url').maybeSingle(),
      supabase.from('publish_page_content').select('*').maybeSingle(),
    ]).then(([settingsRes, contentRes]) => {
      setFormUrl(settingsRes.data?.publish_form_url || null);
      if (contentRes.data) setContent({ ...defaults, ...contentRes.data });
      setLoading(false);
    });
  }, []);

  const tx = (enKey: keyof PublishContent, taKey: keyof PublishContent) =>
    language === 'ta' ? (content[taKey] || content[enKey]) : content[enKey];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl mb-4">
            <PenLine className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3">
            {tx('title_en', 'title_ta')}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto">
            {tx('subtitle_en', 'subtitle_ta')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              {tx('step1_title_en', 'step1_title_ta')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {tx('step1_desc_en', 'step1_desc_ta')}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
            <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              {tx('step2_title_en', 'step2_title_ta')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {tx('step2_desc_en', 'step2_desc_ta')}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
            <Upload className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              {tx('step3_title_en', 'step3_title_ta')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {tx('step3_desc_en', 'step3_desc_ta')}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {tx('form_title_en', 'form_title_ta')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {tx('form_desc_en', 'form_desc_ta')}
            </p>
          </div>
          <div className="p-2 md:p-4">
            {loading ? (
              <div className="w-full flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : formUrl ? (
              <iframe
                src={formUrl}
                title="Writer Request Form"
                width="100%"
                height="700"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                className="block rounded-xl"
              >
                Loading…
              </iframe>
            ) : (
              <div className="w-full flex items-center justify-center min-h-[400px] bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div className="text-center px-6 py-10">
                  <PenLine className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">
                    {language === 'ta' ? 'படிவம் இன்னும் அமைக்கப்படவில்லை' : 'Form not configured yet'}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs max-w-xs mx-auto">
                    {language === 'ta'
                      ? 'நிர்வாகி Google Form URL ஐ சேர்க்க வேண்டும்.'
                      : 'An administrator needs to add the Google Form URL in the admin panel.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
