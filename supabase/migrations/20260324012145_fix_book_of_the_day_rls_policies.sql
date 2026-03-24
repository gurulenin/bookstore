/*
  # Fix Book of the Day RLS - Use admin_users ID directly

  ## Summary
  Corrects RLS policies to check admin status by ID in admin_users table.
  The admin_users table has columns: id, email, created_at.
*/

DROP POLICY IF EXISTS "Admins can insert book of the day" ON book_of_the_day;
DROP POLICY IF EXISTS "Admins can update book of the day" ON book_of_the_day;
DROP POLICY IF EXISTS "Admins can delete book of the day" ON book_of_the_day;

CREATE POLICY "Admins can insert book of the day"
  ON book_of_the_day
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can update book of the day"
  ON book_of_the_day
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can delete book of the day"
  ON book_of_the_day
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );
