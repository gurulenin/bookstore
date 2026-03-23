/*
  # Site branding, contact submissions, and chapter markers

  ## Changes

  1. site_settings table
     - `site_name` (text) - customizable site name
     - `site_logo_url` (text) - URL of the uploaded site logo

  2. contact_submissions table (new)
     - `id` (uuid, pk)
     - `name` (text) - submitter name
     - `email` (text) - submitter email
     - `phone` (text, nullable) - submitter phone
     - `subject` (text) - message subject
     - `message` (text) - full message body
     - `is_read` (boolean, default false)
     - `created_at` (timestamptz)
     - RLS: public insert allowed, only authenticated admin reads

  3. audiobook_chapters table
     - `start_time_seconds` (integer) - chapter start time in seconds (replaces file_url for marker-style chapters)
     - `is_marker` (boolean, default false) - true = timestamp marker on whole audio, false = separate file chapter
*/

-- site_settings: add branding columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'site_name'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN site_name text DEFAULT 'My Book Store';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'site_logo_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN site_logo_url text DEFAULT '';
  END IF;
END $$;

-- audiobook_chapters: add marker columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiobook_chapters' AND column_name = 'start_time_seconds'
  ) THEN
    ALTER TABLE audiobook_chapters ADD COLUMN start_time_seconds integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audiobook_chapters' AND column_name = 'is_marker'
  ) THEN
    ALTER TABLE audiobook_chapters ADD COLUMN is_marker boolean DEFAULT false;
  END IF;
END $$;

-- contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact submissions"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contact submissions"
  ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (true);
