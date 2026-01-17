import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import BookCard from './BookCard';
import BookDetailModal from './BookDetailModal';
import { BookWithFormats, supabase } from '../lib/supabase';
import { useTranslation } from '../lib/translations';

interface BooksViewProps {
  books: BookWithFormats[];
  formatFilter: 'physical' | 'ebook' | 'audiobook' | 'all';
  onPurchase?: (bookId: string) => void;
  onDownload?: (formatId: string, url: string, fileFormat?: string) => void;
}

export default function BooksView({ books, formatFilter, onPurchase, onDownload }: BooksViewProps) {
  const { t, translateGenre } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookWithFormats | null>(null);
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    const { data } = await supabase.from('genres').select('name_en').order('name_en');
    if (data) setGenres(data.map(g => g.name_en));
  };

  const uniqueAuthors = Array.from(new Set(books.map(b => b.author))).sort();

  const filteredBooks = books
    .filter(book => formatFilter === 'all' || book.formats.some(f => f.format_type === formatFilter))
    .filter(book => {
      const query = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
      );
    })
    .filter(book => genreFilter === 'all' || book.genre === genreFilter)
    .filter(book => authorFilter === 'all' || book.author === authorFilter);

  const getTitle = () => {
    switch (formatFilter) {
      case 'physical':
        return 'Printed Books';
      case 'ebook':
        return 'Free Ebooks';
      case 'audiobook':
        return 'Free Audiobooks';
      case 'all':
        return 'Featured Books';
    }
  };

  const getDescription = () => {
    switch (formatFilter) {
      case 'physical':
        return 'Browse our collection of printed books available for purchase';
      case 'ebook':
        return 'Download free ebooks in PDF, EPUB, and HTML formats';
      case 'audiobook':
        return 'Download free audiobooks in MP3 format';
      case 'all':
        return 'Discover our hand-picked collection of featured books';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">{getTitle()}</h1>
          <p className="text-xl text-slate-600 mb-8">{getDescription()}</p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-lg"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">{t('common.filter')}</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('filter.by_genre')}
              </label>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
              >
                <option value="all">{t('filter.all_genres')}</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{translateGenre(genre)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('filter.by_author')}
              </label>
              <select
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
              >
                <option value="all">{t('filter.all_authors')}</option>
                {uniqueAuthors.map((author) => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-500">
              {searchQuery ? 'No books found matching your search' : 'No books available yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-slate-600">
              <p>{filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onPurchase={onPurchase}
                  onDownload={onDownload}
                  onViewDetails={setSelectedBook}
                  showAllFormats={false}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onPurchase={onPurchase}
          onDownload={onDownload}
        />
      )}
    </div>
  );
}
