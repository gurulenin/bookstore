/*
  # Setup First Admin User

  ## Changes
  - Add a policy to allow the first admin user to self-register
  - This policy will allow any authenticated user to insert themselves into admin_users
    ONLY if there are no existing admin users
  
  ## Security
  - Once the first admin is created, this policy will no longer allow self-registration
  - Additional admins must be added by existing admins
*/

-- Add policy to allow first admin self-registration
CREATE POLICY "Allow first admin self-registration"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM admin_users)
  );