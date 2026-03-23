/*
  # Add publish_form_url to site_settings

  ## Changes
  - Adds `publish_form_url` column to `site_settings` table
    - Stores the Google Form embed URL for the "Publish Your Book" page
    - Nullable text field, defaults to NULL
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'publish_form_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN publish_form_url text DEFAULT NULL;
  END IF;
END $$;
