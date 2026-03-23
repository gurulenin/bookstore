import { BookOpen, PenLine, Upload, Users } from 'lucide-react';
import { useTranslation } from '../lib/translations';

export default function PublishPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl mb-4">
            <PenLine className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3">
            {t('publish.title') || 'Publish Your Book'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto">
            {t('publish.subtitle') || 'Are you an author? Share your work with thousands of readers. Fill out the form below and our team will get in touch with you.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              {t('publish.step1.title') || 'Submit Request'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('publish.step1.desc') || 'Fill out the form with your book details and contact info.'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
            <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              {t('publish.step2.title') || 'We Review'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('publish.step2.desc') || 'Our editorial team reviews your submission and contacts you.'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
            <Upload className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              {t('publish.step3.title') || 'Get Published'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('publish.step3.desc') || 'Your book goes live and reaches thousands of readers.'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {t('publish.form.title') || 'Writer Request Form'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('publish.form.desc') || 'Please complete all fields. We typically respond within 3-5 business days.'}
            </p>
          </div>
          <div className="p-2 md:p-4">
            <div className="w-full flex items-center justify-center min-h-[500px] bg-slate-50 dark:bg-slate-900 rounded-xl">
              <div className="text-center px-6 py-10">
                <PenLine className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">
                  {t('publish.form.placeholder.title') || 'Google Form will appear here'}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs max-w-xs mx-auto">
                  {t('publish.form.placeholder.desc') || 'Paste your Google Form embed URL in the admin panel to display the form here.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
