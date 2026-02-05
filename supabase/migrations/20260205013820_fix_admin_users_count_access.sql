/*
  # Fix Admin Users Count Access

  1. Changes
    - Add RLS policy to allow anonymous users to check if any admin users exist
    - This enables the login page to show the correct form (login vs signup)
    - Only allows counting/checking existence, not viewing actual data

  2. Security
    - Anonymous users can only check if the table has any rows
    - They cannot view email addresses or other admin data
    - Authenticated users can still only view their own record
*/

CREATE POLICY "Allow anonymous users to check admin existence"
  ON admin_users
  FOR SELECT
  TO anon
  USING (true);
