import { BookOpen, Download, ShoppingCart, Headphones, FileText, ExternalLink } from 'lucide-react';
import { BookWithFormats } from '../lib/supabase';

interface BookCardProps {
  book: BookWithFormats;
  onPurchase?: (bookId: string) => void;
  onDownload?: (formatId: string, url: string, fileFormat?: string) => void;
  onViewDetails?: (book: BookWithFormats) => void;
  showAllFormats?: boolean;
}

export default function BookCard({ book, onPurchase, onDownload, onViewDetails, showAllFormats }: BookCardProps) {
  const physicalFormat = book.formats.find(f => f.format_type === 'physical');
  const ebookFormats = book.formats.filter(f => f.format_type === 'ebook');
  const audiobookFormats = book.formats.filter(f => f.format_type === 'audiobook');

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div
        className="relative cursor-pointer group"
        onClick={() => onViewDetails?.(book)}
      >
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-80 object-contain bg-gradient-to-br from-slate-50 to-slate-100"
          />
        ) : (
          <div className="w-full h-80 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <BookOpen className="h-24 w-24 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-lg shadow-lg">
            <span className="text-slate-800 font-medium">View Details</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-slate-600 text-sm">{book.author}</p>
      </div>
    </div>
  );
}
