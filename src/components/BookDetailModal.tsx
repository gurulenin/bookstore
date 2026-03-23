import { useState, useEffect } from 'react';
import { X, ShoppingCart, BookOpen, Headphones, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { BookWithFormats, supabase } from '../lib/supabase';
import AudiobookPlayer from './AudiobookPlayer';
import ShareButton from './ShareButton';

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
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full my-4 sm:my-8">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white dark:bg-slate-700 rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700 dark:text-slate-200" />
          </button>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
            <div className="relative">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full rounded-lg shadow-lg object-contain bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-24 w-24 sm:h-32 sm:w-32 text-slate-400 dark:text-slate-500" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <ShareButton bookId={book.id} bookTitle={book.title} bookAuthor={book.author} />
              </div>

              {(book.publisher || book.published_date || book.isbn) && (
                <div className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {book.publisher && (
                    <p><span className="font-semibold">Publisher:</span> {book.publisher}</p>
                  )}
                  {book.published_date && (
                    <p><span className="font-semibold">Published:</span> {book.published_date}</p>
                  )}
                  {book.isbn && (
                    <p><span className="font-semibold">ISBN:</span> {book.isbn}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{book.title}</h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-3 sm:mb-4">{book.author}</p>

              {book.description && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Description</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">{book.description}</p>
                </div>
              )}

              <div className="mt-auto space-y-3 sm:space-y-4">
                {physicalFormat && (
                  <div className="border-t dark:border-slate-700 pt-3 sm:pt-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Printed Book</span>
                      </div>
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">
                        ₹{physicalFormat.price.toFixed(2)}
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
                  <div className="border-t dark:border-slate-700 pt-3 sm:pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ebook - FREE</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {ebookFormats.map((format) => {
                          const fileFormat = format.file_format?.toLowerCase();
                          const label = fileFormat === 'html' ? 'Read Online' : format.file_format?.toUpperCase();
                          return (
                            <button
                              key={format.id}
                              onClick={() => onDownload?.(format.id, format.file_url || '', format.file_format || '')}
                              disabled={!format.is_available}
                              className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap"
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {audiobookFormats.length > 0 && (
                  <div className="border-t dark:border-slate-700 pt-3 sm:pt-4">
                    {audiobookFormats.map((format) => {
                      const formatChapters = chapters[format.id] || [];
                      const hasChapters = formatChapters.length > 0;
                      const isExpanded = expandedFormats[format.id];

                      return (
                        <div key={format.id}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Headphones className="h-5 w-5 text-orange-500" />
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Audiobook - FREE</span>
                            </div>
                            {hasChapters ? (
                              <button
                                onClick={() => toggleFormatExpanded(format.id)}
                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition flex items-center gap-1"
                              >
                                <span>{formatChapters.length} Chapters</span>
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => playAudio(format.file_url || '', book.title)}
                                  disabled={!format.is_available || !format.file_url}
                                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
                                >
                                  Play
                                </button>
                                <button
                                  onClick={() => onDownload?.(format.id, format.file_url || '', format.file_format || '')}
                                  disabled={!format.is_available || !format.file_url}
                                  className="bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
                                >
                                  Download
                                </button>
                              </div>
                            )}
                          </div>

                          {hasChapters && isExpanded && (
                            <div className="mt-3 space-y-2 pl-2 sm:pl-4 border-l-2 border-orange-200">
                              {formatChapters.map((chapter) => (
                                <div key={chapter.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2 sm:p-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="font-medium text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                                        Ch.{chapter.chapter_number}: {chapter.chapter_title}
                                      </p>
                                      {chapter.duration_minutes && (
                                        <p className="text-xs text-slate-500">{chapter.duration_minutes} min</p>
                                      )}
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                      <button
                                        onClick={() => playAudio(chapter.file_url, `Chapter ${chapter.chapter_number}: ${chapter.chapter_title}`)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full transition"
                                      >
                                        Play
                                      </button>
                                      <button
                                        onClick={() => window.open(chapter.file_url, '_blank')}
                                        className="bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full transition"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
