/*
  # Create Hero Carousel Table

  ## New Table
  
  ### `hero_carousel`
  - `id` (uuid, primary key) - Unique identifier
  - `image_url` (text) - URL to the carousel image
  - `title` (text, nullable) - Optional title/heading for the slide
  - `subtitle` (text, nullable) - Optional subtitle/description for the slide
  - `order_index` (integer) - Display order (0-4 for max 5 images)
  - `is_active` (boolean) - Whether this slide is active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Security
  - Enable RLS
  - Public can read active carousel images
  - Only authenticated admins can insert, update, delete carousel images
  
  ## Constraints
  - Maximum 5 carousel images enforced by check constraint
  - order_index must be between 0 and 4
*/

-- Create hero_carousel table
CREATE TABLE IF NOT EXISTS hero_carousel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  subtitle text,
  order_index integer NOT NULL DEFAULT 0 CHECK (order_index >= 0 AND order_index <= 4),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index on order_index to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_hero_carousel_order ON hero_carousel(order_index);

-- Create index for active slides
CREATE INDEX IF NOT EXISTS idx_hero_carousel_active ON hero_carousel(is_active, order_index);

-- Enable RLS
ALTER TABLE hero_carousel ENABLE ROW LEVEL SECURITY;

-- Hero carousel policies
CREATE POLICY "Public can view active carousel images"
  ON hero_carousel FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all carousel images"
  ON hero_carousel FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert carousel images"
  ON hero_carousel FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update carousel images"
  ON hero_carousel FOR UPDATE
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

CREATE POLICY "Admins can delete carousel images"
  ON hero_carousel FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Create function to enforce max 5 carousel images
CREATE OR REPLACE FUNCTION check_max_carousel_images()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM hero_carousel) >= 5 THEN
    RAISE EXCEPTION 'Maximum of 5 carousel images allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce max 5 images
CREATE TRIGGER trigger_check_max_carousel_images
  BEFORE INSERT ON hero_carousel
  FOR EACH ROW
  EXECUTE FUNCTION check_max_carousel_images();