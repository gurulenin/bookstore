/*
  # Add Audiobook Chapters Support

  ## Overview
  This migration adds support for chapter-wise audiobooks, allowing long audiobooks to be split into multiple chapters.

  ## New Tables
    - `audiobook_chapters`
      - `id` (uuid, primary key) - Unique identifier for the chapter
      - `book_format_id` (uuid, foreign key) - References the audiobook format this chapter belongs to
      - `chapter_number` (integer) - Chapter sequence number
      - `chapter_title` (text) - Title of the chapter
      - `chapter_title_translations` (jsonb) - Translations for chapter title
      - `file_url` (text) - URL to the chapter audio file
      - `duration_minutes` (integer, optional) - Duration of the chapter in minutes
      - `created_at` (timestamptz) - Timestamp when the chapter was created
      - `updated_at` (timestamptz) - Timestamp when the chapter was last updated

  ## Security
    - Enable RLS on `audiobook_chapters` table
    - Add policy for public read access
    - Add policy for authenticated admins to manage chapters
*/

-- Create audiobook_chapters table
CREATE TABLE IF NOT EXISTS audiobook_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_format_id uuid NOT NULL REFERENCES book_formats(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL,
  chapter_title text NOT NULL,
  chapter_title_translations jsonb DEFAULT '{}'::jsonb,
  file_url text NOT NULL,
  duration_minutes integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_audiobook_chapters_book_format_id ON audiobook_chapters(book_format_id);
CREATE INDEX IF NOT EXISTS idx_audiobook_chapters_chapter_number ON audiobook_chapters(book_format_id, chapter_number);

-- Enable RLS
ALTER TABLE audiobook_chapters ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Anyone can view audiobook chapters"
  ON audiobook_chapters
  FOR SELECT
  TO public
  USING (true);

-- Policy for authenticated users to insert chapters (admins only)
CREATE POLICY "Authenticated users can insert audiobook chapters"
  ON audiobook_chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy for authenticated users to update chapters (admins only)
CREATE POLICY "Authenticated users can update audiobook chapters"
  ON audiobook_chapters
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy for authenticated users to delete chapters (admins only)
CREATE POLICY "Authenticated users can delete audiobook chapters"
  ON audiobook_chapters
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );