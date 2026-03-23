import { X, ExternalLink } from 'lucide-react';

interface HtmlReaderModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function HtmlReaderModal({ url, title, onClose }: HtmlReaderModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[70%]">{title}</h2>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in new tab
          </a>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <iframe
        src={url}
        title={title}
        className="flex-1 w-full border-0"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
}
