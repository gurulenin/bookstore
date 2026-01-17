import { useState, useEffect } from 'react';
import { X, Download, ShoppingCart, BookOpen, Headphones, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { BookWithFormats, supabase } from '../lib/supabase';
import AudiobookPlayer from './AudiobookPlayer';

interface BookDetailModalProps {
  book: BookWithFormats;
  onClose: () => void;
  onPurchase?: (bookId: string) => void;
  onDownload?: (formatId: string, url: string, fileFormat?: string) => void;
}

interface AudioChapter {
  id: string;
  chapter_number: number;
  chapter_title: string;
  file_url: string;
  duration_minutes?: number;
}

export default function BookDetailModal({ book, onClose, onPurchase, onDownload }: BookDetailModalProps) {
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [playingChapterTitle, setPlayingChapterTitle] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Record<string, AudioChapter[]>>({});
  const [expandedFormats, setExpandedFormats] = useState<Record<string, boolean>>({});
  const physicalFormat = book.formats.find(f => f.format_type === 'physical');
  const ebookFormats = book.formats.filter(f => f.format_type === 'ebook');
  const audiobookFormats = book.formats.filter(f => f.format_type === 'audiobook');

  useEffect(() => {
    const fetchChapters = async () => {
      const formatIds = audiobookFormats.map(f => f.id);
      if (formatIds.length === 0) return;

      const { data, error } = await supabase
        .from('audiobook_chapters')
        .select('*')
        .in('book_format_id', formatIds)
        .order('chapter_number', { ascending: true });

      if (!error && data) {
        const chaptersByFormat: Record<string, AudioChapter[]> = {};
        data.forEach((chapter: any) => {
          if (!chaptersByFormat[chapter.book_format_id]) {
            chaptersByFormat[chapter.book_format_id] = [];
          }
          chaptersByFormat[chapter.book_format_id].push(chapter);
        });
        setChapters(chaptersByFormat);
      }
    };

    fetchChapters();
  }, [audiobookFormats]);

  const toggleFormatExpanded = (formatId: string) => {
    setExpandedFormats(prev => ({ ...prev, [formatId]: !prev[formatId] }));
  };

  const playAudio = (url: string, title?: string) => {
    setPlayingAudioUrl(url);
    setPlayingChapterTitle(title || null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full my-4 sm:my-8">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
          </button>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
            <div>
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full rounded-lg shadow-lg object-contain bg-gradient-to-br from-slate-50 to-slate-100"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-24 w-24 sm:h-32 sm:w-32 text-slate-400" />
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-2">{book.title}</h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-3 sm:mb-4">{book.author}</p>

              {book.publisher && (
                <p className="text-slate-500 mb-1.5 sm:mb-2 text-sm sm:text-base">
                  <span className="font-medium">Publisher:</span> {book.publisher}
                </p>
              )}

              {book.published_date && (
                <p className="text-slate-500 mb-1.5 sm:mb-2 text-sm sm:text-base">
                  <span className="font-medium">Published:</span> {book.published_date}
                </p>
              )}

              {book.isbn && (
                <p className="text-slate-500 mb-3 sm:mb-4 text-sm sm:text-base">
                  <span className="font-medium">ISBN:</span> {book.isbn}
                </p>
              )}

              {book.description && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">Description</h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{book.description}</p>
                </div>
              )}

              <div className="mt-auto space-y-3 sm:space-y-4">
                {physicalFormat && (
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                        <span className="text-base sm:text-lg font-semibold text-slate-700">Printed Book</span>
                      </div>
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">
                        ${physicalFormat.price.toFixed(2)}
                      </span>
                    </div>
                    {physicalFormat.stock_quantity !== undefined && (
                      <p className="text-xs sm:text-sm text-slate-500 mb-2">
                        Stock: {physicalFormat.stock_quantity} available
                      </p>
                    )}
                    <button
                      onClick={() => onPurchase?.(book.id)}
                      disabled={!physicalFormat.is_available}
                      className="w-full bg-blue-500 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-slate-300 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {physicalFormat.is_available ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                )}

                {ebookFormats.length > 0 && (
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                      <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                      <span className="text-base sm:text-lg font-semibold text-slate-700">Ebook - FREE</span>
                    </div>
                    <div className="space-y-2">
                      {ebookFormats.map((format) => {
                        const fileFormat = format.file_format?.toLowerCase();
                        const displayName = fileFormat === 'html' ? 'Read Online' : `Download ${format.file_format?.toUpperCase()}`;

                        return (
                          <button
                            key={format.id}
                            onClick={() => onDownload?.(format.id, format.file_url || '', format.file_format || '')}
                            disabled={!format.is_available}
                            className="w-full bg-green-500 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                          >
                            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>{displayName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {audiobookFormats.length > 0 && (
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                      <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                      <span className="text-base sm:text-lg font-semibold text-slate-700">Audiobook - FREE</span>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {audiobookFormats.map((format) => {
                        const formatChapters = chapters[format.id] || [];
                        const hasChapters = formatChapters.length > 0;
                        const isExpanded = expandedFormats[format.id];

                        return (
                          <div key={format.id} className="space-y-2">
                            {hasChapters ? (
                              <>
                                <button
                                  onClick={() => toggleFormatExpanded(format.id)}
                                  className="w-full bg-orange-500 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-between px-3 sm:px-4 text-sm sm:text-base"
                                >
                                  <span className="flex items-center space-x-2">
                                    <Headphones className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span>{formatChapters.length} Chapters Available</span>
                                  </span>
                                  {isExpanded ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
                                </button>

                                {isExpanded && (
                                  <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-orange-200">
                                    {formatChapters.map((chapter) => (
                                      <div key={chapter.id} className="bg-slate-50 rounded-lg p-2 sm:p-3">
                                        <div className="flex items-start justify-between mb-2">
                                          <div>
                                            <p className="font-medium text-slate-800 text-xs sm:text-sm">
                                              Chapter {chapter.chapter_number}: {chapter.chapter_title}
                                            </p>
                                            {chapter.duration_minutes && (
                                              <p className="text-xs text-slate-500">{chapter.duration_minutes} min</p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => playAudio(chapter.file_url, `Chapter ${chapter.chapter_number}: ${chapter.chapter_title}`)}
                                            className="flex-1 bg-orange-500 text-white py-1.5 sm:py-2 rounded-lg font-medium hover:bg-orange-600 transition flex items-center justify-center space-x-1 text-xs sm:text-sm"
                                          >
                                            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span>Play</span>
                                          </button>
                                          <button
                                            onClick={() => window.open(chapter.file_url, '_blank')}
                                            className="flex-1 bg-slate-600 text-white py-1.5 sm:py-2 rounded-lg font-medium hover:bg-slate-700 transition flex items-center justify-center space-x-1 text-xs sm:text-sm"
                                          >
                                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span>Download</span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => playAudio(format.file_url || '', book.title)}
                                  disabled={!format.is_available || !format.file_url}
                                  className="w-full bg-orange-500 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                                >
                                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                                  <span>Play Audio</span>
                                </button>
                                <button
                                  onClick={() => onDownload?.(format.id, format.file_url || '', format.file_format || '')}
                                  disabled={!format.is_available || !format.file_url}
                                  className="w-full bg-slate-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-slate-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                                >
                                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                  <span>Download Audio</span>
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {playingAudioUrl && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-2 sm:p-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 line-clamp-1">
                          {playingChapterTitle || 'Now Playing'}
                        </h2>
                        <button
                          onClick={() => {
                            setPlayingAudioUrl(null);
                            setPlayingChapterTitle(null);
                          }}
                          className="bg-slate-100 rounded-full p-1.5 sm:p-2 hover:bg-slate-200 transition flex-shrink-0"
                        >
                          <X className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
                        </button>
                      </div>
                      <AudiobookPlayer url={playingAudioUrl} title={playingChapterTitle || book.title} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
