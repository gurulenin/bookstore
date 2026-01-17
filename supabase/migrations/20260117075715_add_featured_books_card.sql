/*
  # Add Featured Books Card Settings

  1. Changes
    - Add fields for Featured Books card (title and description in English and Tamil)
    - Add show_featured_books_card boolean flag
    - Remove old featured books section fields (show_featured_books, featured_books_title_en, featured_books_title_ta, featured_books_limit)
  
  2. Purpose
    - Convert featured books from a separate section to a clickable card format like other book types
*/

DO $$
BEGIN
  -- Add Featured Books Card fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'show_featured_books_card'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN show_featured_books_card boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'featured_books_card_title_en'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN featured_books_card_title_en text DEFAULT 'Featured Books';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'featured_books_card_title_ta'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN featured_books_card_title_ta text DEFAULT 'சிறப்பு புத்தகங்கள்';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'featured_books_card_desc_en'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN featured_books_card_desc_en text DEFAULT 'Discover our hand-picked collection of exceptional books curated just for you.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'featured_books_card_desc_ta'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN featured_books_card_desc_ta text DEFAULT 'உங்களுக்காக தேர்ந்தெடுக்கப்பட்ட சிறந்த புத்தகங்களின் தொகுப்பைக் கண்டறியுங்கள்.';
  END IF;
END $$;