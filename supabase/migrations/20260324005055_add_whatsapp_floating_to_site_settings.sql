/*
  # Add WhatsApp Floating Button Fields to Site Settings

  Adds two new columns to the site_settings table:
  - `whatsapp_float_number`: The WhatsApp phone number (with country code) to open when clicked
  - `whatsapp_float_enabled`: Boolean toggle to show/hide the floating button sitewide

  The existing `whatsapp_number` column is used for order notifications.
  These new columns are specifically for the floating contact button in the UI.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'whatsapp_float_number'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN whatsapp_float_number text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'whatsapp_float_enabled'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN whatsapp_float_enabled boolean DEFAULT false;
  END IF;
END $$;
