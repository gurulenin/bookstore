/*
  # Fix Admin Users RLS Policy

  1. Changes
    - Drop existing policies that cause infinite recursion
    - Create new policy allowing authenticated users to check if they are admins
    - Simplify the policy to check user ID directly without subquery

  2. Security
    - Users can only view their own admin record
    - No subquery recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert admin users" ON admin_users;

-- Create new policy: users can view their own admin record
CREATE POLICY "Users can view own admin record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());
