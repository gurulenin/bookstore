/*
  # Create Foundation Tables

  ## New Tables
  
  ### `books`
  - `id` (uuid, primary key) - Unique book identifier
  - `title` (text) - Book title
  - `author` (text) - Book author name
  - `description` (text) - Book description
  - `isbn` (text, nullable) - International Standard Book Number
  - `sku` (text, unique, nullable) - Stock keeping unit
  - `genre` (text, nullable) - Book genre/category
  - `cover_image_url` (text) - URL to book cover image
  - `publisher` (text) - Publisher name
  - `published_date` (text, nullable) - Publication date
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `book_formats`
  - `id` (uuid, primary key) - Unique format identifier
  - `book_id` (uuid) - Foreign key to books table
  - `format_type` (text) - Type: physical, ebook, or audiobook
  - `price` (numeric) - Format price
  - `file_url` (text, nullable) - URL to digital file
  - `file_format` (text, nullable) - File format (PDF, EPUB, MP3, etc.)
  - `file_size` (integer, nullable) - File size in bytes
  - `stock_quantity` (integer, nullable) - Stock for physical books
  - `is_available` (boolean) - Availability status
  - `license_info` (text, nullable) - License information
  - `created_at` (timestamptz) - Creation timestamp
  
  ### `admin_users`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - Admin email
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Books and formats readable by public
  - Only authenticated admins can modify books and formats
  - Admin users table only readable by authenticated users checking their own admin status
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  description text NOT NULL,
  isbn text,
  sku text UNIQUE,
  genre text,
  cover_image_url text NOT NULL,
  publisher text NOT NULL,
  published_date text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create book_formats table
CREATE TABLE IF NOT EXISTS book_formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  format_type text NOT NULL CHECK (format_type IN ('physical', 'ebook', 'audiobook')),
  price numeric NOT NULL DEFAULT 0,
  file_url text,
  file_format text,
  file_size integer,
  stock_quantity integer,
  is_available boolean DEFAULT true,
  license_info text,
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_book_formats_book_id ON book_formats(book_id);
CREATE INDEX IF NOT EXISTS idx_book_formats_type ON book_formats(format_type);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Books policies
CREATE POLICY "Anyone can view books"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update books"
  ON books FOR UPDATE
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

CREATE POLICY "Admins can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Book formats policies
CREATE POLICY "Anyone can view book formats"
  ON book_formats FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert book formats"
  ON book_formats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update book formats"
  ON book_formats FOR UPDATE
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

CREATE POLICY "Admins can delete book formats"
  ON book_formats FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users policy
CREATE POLICY "Users can view own admin record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());