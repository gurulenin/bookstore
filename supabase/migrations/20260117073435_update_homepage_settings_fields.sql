/*
  # Update Homepage Settings Schema

  1. Changes
    - Add `show_featured_books` field to control featured books section visibility
    - Add `featured_books_title_en` for English title
    - Add `featured_books_title_ta` for Tamil title
    
  2. Notes
    - All changes use IF NOT EXISTS to prevent errors on rerun
    - Default values set for smooth migration
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'show_featured_books'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN show_featured_books boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'featured_books_title_en'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN featured_books_title_en text DEFAULT 'Featured Books';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'featured_books_title_ta'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN featured_books_title_ta text DEFAULT 'சிறப்பு புத்தகங்கள்';
  END IF;
END $$;
