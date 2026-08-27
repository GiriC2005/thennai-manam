/*
# Add INSERT policy for profiles

1. Security
- Add an INSERT policy on profiles so the auto-created profile from the trigger works even if the trigger context changes.
- The trigger `handle_new_user` is SECURITY DEFINER and bypasses RLS, but adding this policy as a safety net ensures users can't create arbitrary profiles (only their own via auth.uid).
*/

DROP POLICY IF EXISTS "user_insert_own_profile" ON profiles;
CREATE POLICY "user_insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (id = auth.uid());
