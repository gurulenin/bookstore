/*
  # Add Translation System

  ## New Tables
  
  ### `ui_translations`
  - `id` (uuid, primary key)
  - `key` (text, unique) - Translation key (e.g., 'nav.home', 'book.title')
  - `english` (text) - English text
  - `tamil` (text) - Tamil text
  - `category` (text) - Category for organization (e.g., 'navigation', 'book', 'common')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `genres`
  - `id` (uuid, primary key)
  - `name_en` (text) - Genre name in English
  - `name_ta` (text) - Genre name in Tamil
  - `created_at` (timestamptz)
  
  ## Security
  - Enable RLS on new tables
  - Public can read translations and genres
  - Only authenticated admins can modify
*/

-- Create ui_translations table
CREATE TABLE IF NOT EXISTS ui_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  english text NOT NULL,
  tamil text NOT NULL,
  category text DEFAULT 'common',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on key for fast lookups
CREATE INDEX IF NOT EXISTS idx_ui_translations_key ON ui_translations(key);
CREATE INDEX IF NOT EXISTS idx_ui_translations_category ON ui_translations(category);

-- Create genres table
CREATE TABLE IF NOT EXISTS genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text UNIQUE NOT NULL,
  name_ta text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ui_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- UI translations policies
CREATE POLICY "Public can view translations"
  ON ui_translations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage translations"
  ON ui_translations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Genres policies
CREATE POLICY "Public can view genres"
  ON genres FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage genres"
  ON genres FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Insert default genres
INSERT INTO genres (name_en, name_ta) VALUES
  ('Fiction', 'புனைகதை'),
  ('Non-Fiction', 'புனைகதை அல்லாதவை'),
  ('Science Fiction', 'அறிவியல் புனைகதை'),
  ('Fantasy', 'கற்பனை'),
  ('Mystery', 'மர்மம்'),
  ('Thriller', 'த்ரில்லர்'),
  ('Romance', 'காதல்'),
  ('Horror', 'திகில்'),
  ('Biography', 'வாழ்க்கை வரலாறு'),
  ('History', 'வரலாறு'),
  ('Self-Help', 'சுய முன்னேற்றம்'),
  ('Business', 'வணிகம்'),
  ('Science', 'அறிவியல்'),
  ('Technology', 'தொழில்நுட்பம்'),
  ('Philosophy', 'தத்துவம்'),
  ('Poetry', 'கவிதை'),
  ('Drama', 'நாடகம்'),
  ('Children', 'குழந்தைகள்'),
  ('Young Adult', 'இளைஞர்'),
  ('Classics', 'கிளாசிக்')
ON CONFLICT (name_en) DO NOTHING;

-- Insert default UI translations
INSERT INTO ui_translations (key, english, tamil, category) VALUES
  ('nav.home', 'Home', 'முகப்பு', 'navigation'),
  ('nav.books', 'Books', 'புத்தகங்கள்', 'navigation'),
  ('nav.ebooks', 'Ebooks', 'மின்புத்தகங்கள்', 'navigation'),
  ('nav.audiobooks', 'Audiobooks', 'ஆடியோ புத்தகங்கள்', 'navigation'),
  ('nav.blog', 'Blog', 'வலைப்பதிவு', 'navigation'),
  ('nav.about', 'About', 'எங்களை பற்றி', 'navigation'),
  ('nav.contact', 'Contact', 'தொடர்பு', 'navigation'),
  ('nav.admin', 'Admin', 'நிர்வாகம்', 'navigation'),
  
  ('common.search', 'Search', 'தேடு', 'common'),
  ('common.filter', 'Filter', 'வடிகட்டு', 'common'),
  ('common.all', 'All', 'அனைத்தும்', 'common'),
  ('common.save', 'Save', 'சேமி', 'common'),
  ('common.cancel', 'Cancel', 'ரத்து செய்', 'common'),
  ('common.delete', 'Delete', 'நீக்கு', 'common'),
  ('common.edit', 'Edit', 'திருத்து', 'common'),
  ('common.add', 'Add', 'சேர்', 'common'),
  ('common.back', 'Back', 'பின்செல்', 'common'),
  ('common.next', 'Next', 'அடுத்து', 'common'),
  ('common.previous', 'Previous', 'முந்தையது', 'common'),
  ('common.loading', 'Loading...', 'ஏற்றுகிறது...', 'common'),
  ('common.error', 'Error', 'பிழை', 'common'),
  ('common.success', 'Success', 'வெற்றி', 'common'),
  
  ('book.title', 'Title', 'தலைப்பு', 'book'),
  ('book.author', 'Author', 'எழுத்தாளர்', 'book'),
  ('book.genre', 'Genre', 'வகை', 'book'),
  ('book.price', 'Price', 'விலை', 'book'),
  ('book.description', 'Description', 'விவரம்', 'book'),
  ('book.isbn', 'ISBN', 'ISBN', 'book'),
  ('book.sku', 'SKU', 'SKU', 'book'),
  ('book.publisher', 'Publisher', 'வெளியீட்டாளர்', 'book'),
  ('book.published_date', 'Published Date', 'வெளியீட்டு தேதி', 'book'),
  ('book.cover_image', 'Cover Image', 'அட்டைப்படம்', 'book'),
  ('book.formats', 'Formats', 'வடிவங்கள்', 'book'),
  ('book.license', 'License', 'உரிமம்', 'book'),
  
  ('format.print', 'Print', 'அச்சு', 'format'),
  ('format.ebook', 'Ebook', 'மின்புத்தகம்', 'format'),
  ('format.audiobook', 'Audiobook', 'ஆடியோ புத்தகம்', 'format'),
  ('format.pdf', 'PDF', 'PDF', 'format'),
  ('format.epub', 'EPUB', 'EPUB', 'format'),
  ('format.html', 'HTML', 'HTML', 'format'),
  ('format.mp3', 'MP3', 'MP3', 'format'),
  
  ('action.view_details', 'View Details', 'விவரங்களை காண்க', 'action'),
  ('action.add_to_cart', 'Add to Cart', 'கூடையில் சேர்', 'action'),
  ('action.checkout', 'Checkout', 'கணக்கீடு', 'action'),
  ('action.download', 'Download', 'பதிவிறக்கு', 'action'),
  ('action.play', 'Play', 'இயக்கு', 'action'),
  ('action.pause', 'Pause', 'இடைநிறுத்து', 'action'),
  ('action.browse', 'Browse', 'உலாவு', 'action'),
  
  ('admin.dashboard', 'Dashboard', 'கட்டுப்பாட்டு பலகை', 'admin'),
  ('admin.books', 'Books', 'புத்தகங்கள்', 'admin'),
  ('admin.blogs', 'Blogs', 'வலைப்பதிவுகள்', 'admin'),
  ('admin.orders', 'Orders', 'ஆர்டர்கள்', 'admin'),
  ('admin.carousel', 'Carousel', 'சுழல்படம்', 'admin'),
  ('admin.settings', 'Settings', 'அமைப்புகள்', 'admin'),
  ('admin.translations', 'Translations', 'மொழிபெயர்ப்புகள்', 'admin'),
  ('admin.backup', 'Backup & Restore', 'காப்பு & மீட்டமை', 'admin'),
  ('admin.logout', 'Logout', 'வெளியேறு', 'admin'),
  
  ('filter.by_author', 'By Author', 'எழுத்தாளர் வாரியாக', 'filter'),
  ('filter.by_genre', 'By Genre', 'வகை வாரியாக', 'filter'),
  ('filter.all_authors', 'All Authors', 'அனைத்து எழுத்தாளர்கள்', 'filter'),
  ('filter.all_genres', 'All Genres', 'அனைத்து வகைகள்', 'filter')
ON CONFLICT (key) DO NOTHING;