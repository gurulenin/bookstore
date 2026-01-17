/*
  # Create page content and menu settings tables

  1. New Tables
    - `page_contents`
      - `id` (uuid, primary key)
      - `page_key` (text, unique) - identifies the page (contribute, donate, about)
      - `title` (text) - page title
      - `content` (text) - markdown content
      - `is_published` (boolean) - whether the page is visible
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `menu_settings`
      - `id` (uuid, primary key)
      - `menu_key` (text, unique) - menu identifier
      - `menu_label` (text) - display label
      - `is_enabled` (boolean) - whether menu is visible
      - `order_index` (integer) - menu order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public can read published content
    - Only authenticated users (admins) can modify
*/

-- Create page_contents table
CREATE TABLE IF NOT EXISTS page_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_settings table
CREATE TABLE IF NOT EXISTS menu_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_key text UNIQUE NOT NULL,
  menu_label text NOT NULL,
  is_enabled boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_settings ENABLE ROW LEVEL SECURITY;

-- Policies for page_contents
CREATE POLICY "Anyone can view published page content"
  ON page_contents
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can view all page content"
  ON page_contents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert page content"
  ON page_contents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update page content"
  ON page_contents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete page content"
  ON page_contents
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for menu_settings
CREATE POLICY "Anyone can view menu settings"
  ON menu_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert menu settings"
  ON menu_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update menu settings"
  ON menu_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete menu settings"
  ON menu_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default menu settings
INSERT INTO menu_settings (menu_key, menu_label, is_enabled, order_index) VALUES
  ('books', 'Books', true, 1),
  ('ebooks', 'E-books', true, 2),
  ('audiobooks', 'Audiobooks', true, 3),
  ('contribute', 'Contribute & Donate', true, 4),
  ('blog', 'Blog', true, 5),
  ('about', 'About', true, 6),
  ('contact', 'Contact', true, 7),
  ('admin', 'Admin', true, 8)
ON CONFLICT (menu_key) DO NOTHING;

-- Insert default page contents
INSERT INTO page_contents (page_key, title, content, is_published) VALUES
  ('about', 'About Us', '# About Us

Welcome to BookHub! We are dedicated to providing access to books in various formats.

## Our Mission

To make reading accessible to everyone through printed books, ebooks, and audiobooks.', true),
  ('contribute', 'Contribute & Donate', '# Contribute & Donate

## How You Can Help

Your support helps us maintain and expand our collection of books.

### Ways to Contribute

- Donate books
- Financial contributions
- Volunteer your time

### Make a Donation

Your generous donations help us continue our mission.', true)
ON CONFLICT (page_key) DO NOTHING;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_page_contents_updated_at ON page_contents;
CREATE TRIGGER update_page_contents_updated_at
  BEFORE UPDATE ON page_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_settings_updated_at ON menu_settings;
CREATE TRIGGER update_menu_settings_updated_at
  BEFORE UPDATE ON menu_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();