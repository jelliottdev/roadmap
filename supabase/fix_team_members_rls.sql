-- Fix: infinite recursion in team_members RLS policy
--
-- The problem: a policy like
--   USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
-- causes infinite recursion because evaluating the policy re-triggers the policy.
--
-- The fix: use a SECURITY DEFINER function that bypasses RLS when checking membership.

-- Step 1: Drop all existing policies on team_members
DROP POLICY IF EXISTS "team_members_select" ON team_members;
DROP POLICY IF EXISTS "team_members_insert" ON team_members;
DROP POLICY IF EXISTS "team_members_update" ON team_members;
DROP POLICY IF EXISTS "team_members_delete" ON team_members;
-- Also try common alternative names
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Team members are viewable by team members" ON team_members;
DROP POLICY IF EXISTS "Enable read access for team members" ON team_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON team_members;

-- Step 2: Create a SECURITY DEFINER function to look up the current user's team IDs
-- This function runs with the privileges of the definer (bypasses RLS) to avoid recursion.
CREATE OR REPLACE FUNCTION public.get_my_team_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT team_id FROM public.team_members WHERE user_id = auth.uid();
$$;

-- Step 3: Recreate policies using the function (no recursion)

-- Users can read all members of any team they belong to
CREATE POLICY "team_members_select"
  ON team_members FOR SELECT
  USING (team_id IN (SELECT get_my_team_ids()));

-- Users can add themselves (or be added) to a team
CREATE POLICY "team_members_insert"
  ON team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only owners can update roles
CREATE POLICY "team_members_update"
  ON team_members FOR UPDATE
  USING (team_id IN (SELECT get_my_team_ids()));

-- Users can remove themselves from a team
CREATE POLICY "team_members_delete"
  ON team_members FOR DELETE
  USING (user_id = auth.uid());
