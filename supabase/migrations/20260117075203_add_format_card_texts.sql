/*
  # Add Format Card Text Fields

  1. Changes
    - Add text fields for Physical Books card (title and description in English and Tamil)
    - Add text fields for E-Books card (title and description in English and Tamil)
    - Add text fields for Audiobooks card (title and description in English and Tamil)
  
  2. Purpose
    - Allow admins to customize all text content on format cards
*/

DO $$
BEGIN
  -- Physical Books Card
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'physical_books_title_en'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN physical_books_title_en text DEFAULT 'Physical Books';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'physical_books_title_ta'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN physical_books_title_ta text DEFAULT 'அச்சு புத்தகங்கள்';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'physical_books_desc_en'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN physical_books_desc_en text DEFAULT 'Get physical copies of your favorite books delivered to your doorstep.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'physical_books_desc_ta'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN physical_books_desc_ta text DEFAULT 'உங்களுக்கு பிடித்த புத்தகங்களின் அச்சு பிரதிகளை உங்கள் வீட்டு வாசலில் பெறுங்கள்.';
  END IF;

  -- E-Books Card
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'ebooks_title_en'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN ebooks_title_en text DEFAULT 'E-Books';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'ebooks_title_ta'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN ebooks_title_ta text DEFAULT 'மின்னூல்கள்';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'ebooks_desc_en'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN ebooks_desc_en text DEFAULT 'Download and read instantly on any device. Available in PDF, EPUB, and MOBI formats.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'ebooks_desc_ta'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN ebooks_desc_ta text DEFAULT 'எந்த சாதனத்திலும் உடனடியாக பதிவிறக்கம் செய்து படியுங்கள். PDF, EPUB மற்றும் MOBI வடிவங்களில் கிடைக்கிறது.';
  END IF;

  -- Audiobooks Card
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'audiobooks_title_en'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN audiobooks_title_en text DEFAULT 'Audiobooks';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'audiobooks_title_ta'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN audiobooks_title_ta text DEFAULT 'ஆடியோ புத்தகங்கள்';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'audiobooks_desc_en'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN audiobooks_desc_en text DEFAULT 'Listen to your favorite books narrated by professional voice artists. Free downloads available.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'audiobooks_desc_ta'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN audiobooks_desc_ta text DEFAULT 'தொழில்முறை குரல் கலைஞர்களால் விவரிக்கப்பட்ட உங்களுக்கு பிடித்த புத்தகங்களைக் கேளுங்கள். இலவச பதிவிறக்கங்கள் கிடைக்கின்றன.';
  END IF;
END $$;