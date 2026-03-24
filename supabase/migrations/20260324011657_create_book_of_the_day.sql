/*
  # Create Book of the Day Table

  ## Summary
  Creates a table to manage the "Book of the Day" (தினம் ஒரு புத்தகம்) splash screen feature.
  Admins can assign any book as the featured "Book of the Day", control display settings,
  and the splash screen shows automatically to users on their first daily visit.

  ## New Tables
  - `book_of_the_day`
    - `id` (uuid, primary key)
    - `book_id` (uuid, FK to books) - the featured book
    - `title_en` (text) - custom overlay title in English
    - `title_ta` (text) - custom overlay title in Tamil
    - `subtitle_en` (text) - optional subtitle in English
    - `subtitle_ta` (text) - optional subtitle in Tamil
    - `is_active` (boolean) - whether splash is enabled
    - `show_once_per_day` (boolean) - show once per day per browser, or always
    - `updated_at` (timestamptz)
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public SELECT for all visitors (splash screen must load without auth)
  - Authenticated admins can INSERT/UPDATE/DELETE (checked via admin_users email match)
*/

CREATE TABLE IF NOT EXISTS book_of_the_day (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE SET NULL,
  title_en text NOT NULL DEFAULT 'Book of the Day',
  title_ta text NOT NULL DEFAULT 'தினம் ஒரு புத்தகம்',
  subtitle_en text DEFAULT '',
  subtitle_ta text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  show_once_per_day boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE book_of_the_day ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view book of the day"
  ON book_of_the_day
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert book of the day"
  ON book_of_the_day
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can update book of the day"
  ON book_of_the_day
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can delete book of the day"
  ON book_of_the_day
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
