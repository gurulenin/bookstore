/*
  # Add Tamil support for menus and publish page content

  1. Changes to menu_settings
     - Add `menu_label_tamil` column for Tamil translation of each menu item

  2. New Table: publish_page_content
     - Stores all bilingual text for the Publish Your Book page
     - Fields: title, subtitle, step1_title, step1_desc, step2_title, step2_desc,
               step3_title, step3_desc, form_title, form_desc
     - Each field has an English and Tamil version (_en / _ta suffix)

  3. Security
     - RLS enabled on publish_page_content
     - Admins (authenticated) can update; everyone can read
*/

-- Add Tamil label column to menu_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_settings' AND column_name = 'menu_label_tamil'
  ) THEN
    ALTER TABLE menu_settings ADD COLUMN menu_label_tamil text DEFAULT '';
  END IF;
END $$;

-- Seed default Tamil labels for existing menus
UPDATE menu_settings SET menu_label_tamil = 'புத்தகங்கள்' WHERE menu_key = 'books' AND (menu_label_tamil IS NULL OR menu_label_tamil = '');
UPDATE menu_settings SET menu_label_tamil = 'மின்-புத்தகங்கள்' WHERE menu_key = 'ebooks' AND (menu_label_tamil IS NULL OR menu_label_tamil = '');
UPDATE menu_settings SET menu_label_tamil = 'ஆடியோபுக்ஸ்' WHERE menu_key = 'audiobooks' AND (menu_label_tamil IS NULL OR menu_label_tamil = '');
UPDATE menu_settings SET menu_label_tamil = 'பங்களிப்பு & நன்கொடை' WHERE menu_key = 'contribute' AND (menu_label_tamil IS NULL OR menu_label_tamil = '');
UPDATE menu_settings SET menu_label_tamil = 'வலைப்பதிவு' WHERE menu_key = 'blog' AND (menu_label_tamil IS NULL OR menu_label_tamil = '');
UPDATE menu_settings SET menu_label_tamil = 'எங்களை பற்றி' WHERE menu_key = 'about' AND (menu_label_tamil IS NULL OR menu_label_tamil = '');
UPDATE menu_settings SET menu_label_tamil = 'தொடர்பு கொள்ளவும்' WHERE menu_key = 'contact' AND (menu_label_tamil IS NULL OR menu_label_tamil = '');
UPDATE menu_settings SET menu_label_tamil = 'உங்கள் புத்தகத்தை வெளியிடுங்கள்' WHERE menu_key = 'publish' AND (menu_label_tamil IS NULL OR menu_label_tamil = '');

-- Create publish_page_content table
CREATE TABLE IF NOT EXISTS publish_page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL DEFAULT 'Publish Your Book',
  title_ta text NOT NULL DEFAULT 'உங்கள் புத்தகத்தை வெளியிடுங்கள்',
  subtitle_en text NOT NULL DEFAULT 'Are you an author? Share your work with thousands of readers. Fill out the form below and our team will get in touch with you.',
  subtitle_ta text NOT NULL DEFAULT 'நீங்கள் ஒரு எழுத்தாளரா? ஆயிரக்கணக்கான வாசகர்களுடன் உங்கள் படைப்பை பகிருங்கள். கீழே உள்ள படிவத்தை நிரப்புங்கள், எங்கள் குழு உங்களை தொடர்பு கொள்ளும்.',
  step1_title_en text NOT NULL DEFAULT 'Submit Request',
  step1_title_ta text NOT NULL DEFAULT 'விண்ணப்பம் சமர்ப்பிக்கவும்',
  step1_desc_en text NOT NULL DEFAULT 'Fill out the form with your book details and contact info.',
  step1_desc_ta text NOT NULL DEFAULT 'உங்கள் புத்தக விவரங்கள் மற்றும் தொடர்பு தகவலுடன் படிவத்தை நிரப்புங்கள்.',
  step2_title_en text NOT NULL DEFAULT 'We Review',
  step2_title_ta text NOT NULL DEFAULT 'நாங்கள் மதிப்பாய்வு செய்கிறோம்',
  step2_desc_en text NOT NULL DEFAULT 'Our editorial team reviews your submission and contacts you.',
  step2_desc_ta text NOT NULL DEFAULT 'எங்கள் தலையங்க குழு உங்கள் சமர்ப்பிப்பை மதிப்பாய்வு செய்து உங்களை தொடர்பு கொள்ளும்.',
  step3_title_en text NOT NULL DEFAULT 'Get Published',
  step3_title_ta text NOT NULL DEFAULT 'வெளியீடு பெறுங்கள்',
  step3_desc_en text NOT NULL DEFAULT 'Your book goes live and reaches thousands of readers.',
  step3_desc_ta text NOT NULL DEFAULT 'உங்கள் புத்தகம் வெளியாகி ஆயிரக்கணக்கான வாசகர்களை சென்றடையும்.',
  form_title_en text NOT NULL DEFAULT 'Writer Request Form',
  form_title_ta text NOT NULL DEFAULT 'எழுத்தாளர் விண்ணப்பப் படிவம்',
  form_desc_en text NOT NULL DEFAULT 'Please complete all fields. We typically respond within 3-5 business days.',
  form_desc_ta text NOT NULL DEFAULT 'அனைத்து புலங்களையும் நிரப்பவும். நாங்கள் பொதுவாக 3-5 வணிக நாட்களுக்குள் பதில் அளிப்போம்.',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE publish_page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read publish page content"
  ON publish_page_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update publish page content"
  ON publish_page_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert publish page content"
  ON publish_page_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed default row
INSERT INTO publish_page_content (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;
