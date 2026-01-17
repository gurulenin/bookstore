/*
  # Add Social Media Fields to Site Settings

  ## Changes to `site_settings` table
  
  ### New Columns
  - `facebook_url` (text, nullable) - Facebook page URL
  - `twitter_url` (text, nullable) - Twitter/X profile URL
  - `instagram_url` (text, nullable) - Instagram profile URL
  - `linkedin_url` (text, nullable) - LinkedIn profile URL
  - `youtube_url` (text, nullable) - YouTube channel URL
  - `github_url` (text, nullable) - GitHub profile URL

  ## Notes
  - These fields allow administrators to configure social media links that will display in the footer
  - All fields are nullable, allowing flexibility in which platforms are shown
  - URLs should be full URLs (e.g., https://facebook.com/username)
*/

-- Add social media columns to site_settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'facebook_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN facebook_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'twitter_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN twitter_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'instagram_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN instagram_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN linkedin_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'youtube_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN youtube_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'github_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN github_url text;
  END IF;
END $$;