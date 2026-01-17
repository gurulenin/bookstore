/*
  # Create Orders Table

  ## New Table
  
  ### `orders`
  - `id` (uuid, primary key) - Unique order identifier
  - `order_number` (text, unique) - Human-readable order number
  - `book_id` (uuid) - Foreign key to books table
  - `book_title` (text) - Book title (denormalized for history)
  - `book_author` (text) - Book author (denormalized for history)
  - `book_price` (numeric) - Book price at time of order
  - `shipping_cost` (numeric) - Shipping cost based on location
  - `total_amount` (numeric) - Total order amount (book_price + shipping_cost)
  - `customer_name` (text) - Customer full name
  - `customer_email` (text, nullable) - Customer email (optional for guest)
  - `customer_phone` (text) - Customer contact number
  - `customer_whatsapp` (text) - Customer WhatsApp number
  - `shipping_address` (text) - Full shipping address
  - `shipping_pincode` (text) - Shipping postal code
  - `shipping_state` (text) - Shipping state (for calculating shipping cost)
  - `is_tamil_nadu` (boolean) - Whether shipping is to Tamil Nadu
  - `user_id` (uuid, nullable) - Foreign key to auth.users if registered user
  - `is_guest` (boolean) - Whether this is a guest checkout
  - `order_status` (text) - Status: pending, paid, confirmed, shipped, delivered, cancelled
  - `payment_status` (text) - Status: pending, completed, failed
  - `payment_screenshot_url` (text, nullable) - URL to payment proof screenshot
  - `whatsapp_message_sent` (boolean) - Whether WhatsApp message was triggered
  - `admin_notes` (text, nullable) - Admin notes about the order
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Security
  - Enable RLS
  - Public can insert orders (for checkout)
  - Authenticated users can view their own orders
  - Admins can view and manage all orders
  
  ## Indexes
  - Index on order_number for quick lookups
  - Index on user_id for user order history
  - Index on order_status for admin filtering
  - Index on created_at for sorting
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  book_id uuid NOT NULL REFERENCES books(id),
  book_title text NOT NULL,
  book_author text NOT NULL,
  book_price numeric NOT NULL DEFAULT 0,
  shipping_cost numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  customer_whatsapp text NOT NULL,
  shipping_address text NOT NULL,
  shipping_pincode text NOT NULL,
  shipping_state text NOT NULL,
  is_tamil_nadu boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id),
  is_guest boolean DEFAULT true,
  order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_screenshot_url text,
  whatsapp_message_sent boolean DEFAULT false,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_book_id ON orders(book_id);

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_order_number text;
  counter int;
BEGIN
  -- Generate order number like ORD-20240103-0001
  counter := (SELECT COUNT(*) + 1 FROM orders WHERE created_at::date = CURRENT_DATE);
  new_order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Public can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
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

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );