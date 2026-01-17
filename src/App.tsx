import { useState, useEffect } from 'react';
import { supabase, BookWithFormats } from './lib/supabase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import BooksView from './components/BooksView';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import ContactPage from './components/ContactPage';
import CheckoutFlow from './components/CheckoutFlow';
import ContentPage from './components/ContentPage';
import BookDetailModal from './components/BookDetailModal';

type View = 'home' | 'books' | 'ebooks' | 'audiobooks' | 'featured' | 'contribute' | 'blog' | 'about' | 'contact' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [books, setBooks] = useState<BookWithFormats[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<BookWithFormats[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [checkoutBook, setCheckoutBook] = useState<BookWithFormats | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    loadBooks();
    loadFeaturedBooks();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdminAuthenticated(!!session);
  };

  const loadBooks = async () => {
    const { data: booksData, error: booksError } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (booksError) {
      console.error('Error loading books:', booksError);
      return;
    }

    if (booksData) {
      const { data: formatsData, error: formatsError } = await supabase
        .from('book_formats')
        .select('*');

      if (formatsError) {
        console.error('Error loading formats:', formatsError);
        return;
      }

      const booksWithFormats: BookWithFormats[] = booksData.map(book => ({
        ...book,
        formats: formatsData?.filter(f => f.book_id === book.id) || []
      }));

      setBooks(booksWithFormats);
    }
  };

  const loadFeaturedBooks = async () => {
    const { data: featuredData, error: featuredError } = await supabase
      .from('featured_books')
      .select('book_id')
      .order('display_order');

    if (featuredError) {
      console.error('Error loading featured books:', featuredError);
      return;
    }

    if (!featuredData || featuredData.length === 0) {
      setFeaturedBooks([]);
      return;
    }

    const featuredBookIds = featuredData.map(f => f.book_id);

    const { data: booksData, error: booksError } = await supabase
      .from('books')
      .select('*')
      .in('id', featuredBookIds);

    if (booksError) {
      console.error('Error loading featured books data:', booksError);
      return;
    }

    if (booksData) {
      const { data: formatsData, error: formatsError } = await supabase
        .from('book_formats')
        .select('*')
        .in('book_id', featuredBookIds);

      if (formatsError) {
        console.error('Error loading featured book formats:', formatsError);
        return;
      }

      const booksWithFormats: BookWithFormats[] = featuredBookIds
        .map(id => {
          const book = booksData.find(b => b.id === id);
          if (!book) return null;
          return {
            ...book,
            formats: formatsData?.filter(f => f.book_id === book.id) || []
          };
        })
        .filter((book): book is BookWithFormats => book !== null);

      setFeaturedBooks(booksWithFormats);
    }
  };

  const handleAdminLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!adminData) {
      await supabase.auth.signOut();
      throw new Error('Not authorized as admin');
    }

    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    setCurrentView('home');
  };

  const handleAddBook = async (bookData: Omit<BookWithFormats, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: newBook, error: bookError } = await supabase
      .from('books')
      .insert([{
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        isbn: bookData.isbn,
        cover_image_url: bookData.cover_image_url,
        publisher: bookData.publisher,
        published_date: bookData.published_date,
      }])
      .select()
      .single();

    if (bookError) {
      console.error('Error adding book:', bookError);
      return;
    }

    if (bookData.formats.length > 0) {
      const formatsToInsert = bookData.formats.map(f => ({
        book_id: newBook.id,
        format_type: f.format_type,
        price: f.price,
        file_url: f.file_url,
        file_format: f.file_format,
        file_size: f.file_size,
        stock_quantity: f.stock_quantity,
        is_available: f.is_available,
      }));

      await supabase.from('book_formats').insert(formatsToInsert);
    }

    await loadBooks();
    await loadFeaturedBooks();
  };

  const handleUpdateBook = async (id: string, bookData: Partial<BookWithFormats>) => {
    const { error: bookError } = await supabase
      .from('books')
      .update({
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        isbn: bookData.isbn,
        cover_image_url: bookData.cover_image_url,
        publisher: bookData.publisher,
        published_date: bookData.published_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (bookError) {
      console.error('Error updating book:', bookError);
      return;
    }

    await supabase.from('book_formats').delete().eq('book_id', id);

    if (bookData.formats && bookData.formats.length > 0) {
      const formatsToInsert = bookData.formats.map(f => ({
        book_id: id,
        format_type: f.format_type,
        price: f.price,
        file_url: f.file_url,
        file_format: f.file_format,
        file_size: f.file_size,
        stock_quantity: f.stock_quantity,
        is_available: f.is_available,
      }));

      await supabase.from('book_formats').insert(formatsToInsert);
    }

    await loadBooks();
    await loadFeaturedBooks();
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    const { error } = await supabase.from('books').delete().eq('id', id);

    if (error) {
      console.error('Error deleting book:', error);
      return;
    }

    await loadBooks();
    await loadFeaturedBooks();
  };

  const handlePurchase = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setCheckoutBook(book);
    }
  };

  const handleDownload = (formatId: string, url: string, fileFormat?: string) => {
    if (!url) {
      alert('File URL not available');
      return;
    }

    const format = fileFormat?.toLowerCase();

    if (format === 'html') {
      window.open(url, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1">
        {currentView === 'home' && (
          <LandingPage
            onNavigate={setCurrentView}
            onViewBook={setSelectedBookId}
          />
        )}

        {currentView === 'books' && (
          <BooksView
            books={books}
            formatFilter="physical"
            onPurchase={handlePurchase}
            onDownload={handleDownload}
          />
        )}

        {currentView === 'ebooks' && (
          <BooksView
            books={books}
            formatFilter="ebook"
            onPurchase={handlePurchase}
            onDownload={handleDownload}
          />
        )}

        {currentView === 'audiobooks' && (
          <BooksView
            books={books}
            formatFilter="audiobook"
            onPurchase={handlePurchase}
            onDownload={handleDownload}
          />
        )}

        {currentView === 'featured' && (
          <BooksView
            books={featuredBooks}
            formatFilter="all"
            onPurchase={handlePurchase}
            onDownload={handleDownload}
          />
        )}

        {currentView === 'admin' && !isAdminAuthenticated && (
          <AdminLogin onLogin={handleAdminLogin} />
        )}

        {currentView === 'admin' && isAdminAuthenticated && (
          <AdminPanel
            books={books}
            onLogout={handleAdminLogout}
            onAddBook={handleAddBook}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
          />
        )}

        {currentView === 'blog' && !selectedBlogId && (
          <BlogList onSelectBlog={setSelectedBlogId} />
        )}

        {currentView === 'blog' && selectedBlogId && (
          <BlogDetail blogId={selectedBlogId} onBack={() => setSelectedBlogId(null)} />
        )}

        {currentView === 'contribute' && <ContentPage pageKey="contribute" />}

        {currentView === 'about' && <ContentPage pageKey="about" />}

        {currentView === 'contact' && <ContactPage />}

        {checkoutBook && (
          <CheckoutFlow
            book={checkoutBook}
            onClose={() => setCheckoutBook(null)}
          />
        )}

        {selectedBookId && (
          <BookDetailModal
            bookId={selectedBookId}
            onClose={() => setSelectedBookId(null)}
            onPurchase={handlePurchase}
            onDownload={handleDownload}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
