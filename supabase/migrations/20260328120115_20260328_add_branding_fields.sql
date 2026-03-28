/*
  # Add Branding Fields to Site Settings

  1. New Columns
    - `site_name` (text): Site display name (default: "books3")
    - `logo_url` (text): URL to site logo

  2. Updates
    - Add columns to existing site_settings table
    - Logo displays to the left of site name in navbar
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'site_name'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN site_name text DEFAULT 'books3';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN logo_url text DEFAULT '';
  END IF;
END $$;
