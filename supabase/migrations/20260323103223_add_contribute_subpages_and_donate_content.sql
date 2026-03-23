/*
  # Add Contribute sub-pages and Donate content

  1. New Table: contribute_page_content
     - Stores bilingual (English + Tamil) content for each contribute sub-page
     - Pages: making_ebooks, making_covers, making_audiobooks, donate
     - Each page has: title, subtitle, body (rich text/markdown), and a cta_label

  2. Updates to menu_settings
     - Update 'contribute' label to 'Contribute'
     - The sub-menus (making_ebooks, making_covers, making_audiobooks, donate) are handled
       in the navbar as a dropdown, not as separate menu_settings rows

  3. Security
     - RLS enabled
     - Public read, authenticated write
*/

CREATE TABLE IF NOT EXISTS contribute_page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  title_en text NOT NULL DEFAULT '',
  title_ta text NOT NULL DEFAULT '',
  subtitle_en text NOT NULL DEFAULT '',
  subtitle_ta text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  body_ta text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contribute_page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read contribute page content"
  ON contribute_page_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contribute page content"
  ON contribute_page_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert contribute page content"
  ON contribute_page_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed default rows for each sub-page
INSERT INTO contribute_page_content (page_key, title_en, title_ta, subtitle_en, subtitle_ta, body_en, body_ta) VALUES
(
  'making_ebooks',
  'Making E-Books',
  'மின்-புத்தகங்கள் உருவாக்குதல்',
  'Help us bring more books to digital readers by contributing to our e-book creation effort.',
  'மின்னணு வாசகர்களுக்கு அதிக புத்தகங்களை வழங்க எங்கள் மின்-புத்தக உருவாக்கும் முயற்சிக்கு பங்களிக்கவும்.',
  'We convert printed books into digital formats so readers around the world can access them on any device. Your support helps us cover formatting, proofreading, and distribution costs.',
  'உலகெங்கும் உள்ள வாசகர்கள் எந்த சாதனத்திலும் அணுக முடியும் வகையில் அச்சு புத்தகங்களை டிஜிட்டல் வடிவங்களாக மாற்றுகிறோம். உங்கள் ஆதரவு வடிவமைப்பு, திருத்தம் மற்றும் விநியோக செலவுகளை ஈடுகட்ட உதவுகிறது.'
),
(
  'making_covers',
  'Making Book Covers',
  'புத்தக அட்டைகள் உருவாக்குதல்',
  'Support the design of beautiful, professional covers that give books the presentation they deserve.',
  'புத்தகங்களுக்கு தகுதியான அழகான, தொழில்முறை அட்டைகளை வடிவமைக்க ஆதரவு அளிக்கவும்.',
  'A great cover is the first thing a reader notices. We work with talented designers to create covers that reflect the essence of each book. Your contribution funds design work for books that need it most.',
  'ஒரு சிறந்த அட்டை வாசகர் கவனிக்கும் முதல் விஷயம். ஒவ்வொரு புத்தகத்தின் சாரத்தை பிரதிபலிக்கும் அட்டைகளை உருவாக்க திறமையான வடிவமைப்பாளர்களுடன் இணைந்து பணிபுரிகிறோம்.'
),
(
  'making_audiobooks',
  'Making Audio Books',
  'ஆடியோ புத்தகங்கள் உருவாக்குதல்',
  'Help us produce high-quality audio recordings so everyone can enjoy books — including those with visual impairments.',
  'அனைவரும் — பார்வை குறைபாடுள்ளவர்களும் உட்பட — புத்தகங்களை அனுபவிக்க தரமான ஆடியோ பதிவுகளை தயாரிக்க உதவுங்கள்.',
  'Our audio book project brings literature to life through professional narration. We record, edit, and publish audio versions of books in Tamil and other languages. Your support makes this possible.',
  'எங்கள் ஆடியோ புத்தக திட்டம் தொழில்முறை கதை சொல்லல் மூலம் இலக்கியத்தை உயிர்ப்பிக்கிறது. தமிழ் மற்றும் பிற மொழிகளில் புத்தகங்களின் ஆடியோ பதிப்புகளை பதிவு செய்து, திருத்தி, வெளியிடுகிறோம்.'
),
(
  'donate',
  'Donate',
  'நன்கொடை',
  'Your donation directly supports our mission to make books accessible to everyone.',
  'உங்கள் நன்கொடை புத்தகங்களை அனைவருக்கும் அணுகக்கூடியதாக செய்யும் எங்கள் நோக்கத்தை நேரடியாக ஆதரிக்கிறது.',
  'Every contribution, big or small, helps us publish more books, create digital editions, and reach more readers. Thank you for believing in the power of books.',
  'சிறிய அல்லது பெரிய ஒவ்வொரு பங்களிப்பும் அதிக புத்தகங்களை வெளியிட, டிஜிட்டல் பதிப்புகளை உருவாக்க மற்றும் அதிக வாசகர்களை சென்றடைய உதவுகிறது. புத்தகங்களின் சக்தியை நம்பியதற்கு நன்றி.'
)
ON CONFLICT (page_key) DO NOTHING;

-- Update contribute menu label
UPDATE menu_settings SET menu_label = 'Contribute', menu_label_tamil = 'பங்களிக்கவும்'
WHERE menu_key = 'contribute';
