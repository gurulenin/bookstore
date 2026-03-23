/*
  # Add tracking fields to orders table

  ## Changes
  - Adds `tracking_carrier` column to store the shipping carrier name
  - Adds `tracking_id` column to store the shipment tracking number

  These fields are set when an admin marks an order as "shipped".
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_carrier'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_carrier text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_id text DEFAULT '';
  END IF;
END $$;
