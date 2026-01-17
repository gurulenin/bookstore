import { useState } from 'react';
import { Type } from 'lucide-react';
import { useFontSettings } from '../lib/fontSettings';
import { useTranslation } from '../lib/translations';

export default function FontSizeSwitcher() {
  const { fontSize, setFontSize } = useFontSettings();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const fontSizes = [
    { value: 'small' as const, label: t('settings.font_small') },
    { value: 'medium' as const, label: t('settings.font_medium') },
    { value: 'large' as const, label: t('settings.font_large') },
    { value: 'extra-large' as const, label: t('settings.font_extra_large') }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition font-medium"
        title={t('settings.font_size')}
      >
        <Type className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-700">{t('settings.font_size')}</span>
            </div>
            {fontSizes.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  setFontSize(value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left transition ${
                  fontSize === value
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
