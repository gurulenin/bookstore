/*
  # Create Site Settings Table

  ## New Table
  
  ### `site_settings`
  - `id` (uuid, primary key) - Unique identifier (single row table)
  - `about_us_title` (text) - Title for About Us page
  - `about_us_content` (text) - Content for About Us page
  - `contact_us_title` (text) - Title for Contact Us page
  - `contact_us_content` (text) - Content for Contact Us page
  - `contact_email` (text, nullable) - Contact email address
  - `contact_phone` (text, nullable) - Contact phone number
  - `whatsapp_number` (text, nullable) - WhatsApp number for orders
  - `payment_qr_code_url` (text, nullable) - Payment QR code image URL
  - `payment_instructions` (text, nullable) - Instructions for payment
  - `updated_at` (timestamptz) - Last update timestamp
  - `updated_by` (uuid) - Admin who last updated settings
  
  ## Security
  - Enable RLS
  - Public can read settings
  - Only authenticated admins can update settings
  
  ## Notes
  - This is a single-row table (only one settings record exists)
  - Admins can only update, not insert or delete
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  about_us_title text DEFAULT 'About Us',
  about_us_content text DEFAULT '',
  contact_us_title text DEFAULT 'Contact Us',
  contact_us_content text DEFAULT '',
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  payment_qr_code_url text,
  payment_instructions text DEFAULT 'Please scan the QR code to make payment and share the screenshot via WhatsApp.',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default settings row
INSERT INTO site_settings (id, about_us_content, contact_us_content)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Welcome to BookHub! We are passionate about bringing books to readers everywhere.',
  'Get in touch with us for any questions or support.'
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Site settings policies
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );