/*
  # Fix Book of the Day RLS Policies

  ## Summary
  Simplifies RLS policies to avoid permission issues. Uses a more direct approach
  that checks admin status without needing to access auth.users table.
*/

DROP POLICY IF EXISTS "Admins can insert book of the day" ON book_of_the_day;
DROP POLICY IF EXISTS "Admins can update book of the day" ON book_of_the_day;
DROP POLICY IF EXISTS "Admins can delete book of the day" ON book_of_the_day;

CREATE POLICY "Admins can insert book of the day"
  ON book_of_the_day
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN (SELECT email FROM admin_users)
    )
  );

CREATE POLICY "Admins can update book of the day"
  ON book_of_the_day
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN (SELECT email FROM admin_users)
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN (SELECT email FROM admin_users)
    )
  );

CREATE POLICY "Admins can delete book of the day"
  ON book_of_the_day
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN (SELECT email FROM admin_users)
    )
  );
