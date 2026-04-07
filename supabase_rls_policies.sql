-- ============================================
-- RepMetric 360 - Supabase RLS Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'repmeds')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DOCTORS TABLE POLICIES
-- ============================================

-- All authenticated users can view doctors
CREATE POLICY "Anyone can view doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (true);

-- Only admin can insert/update/delete doctors
CREATE POLICY "Admin can manage doctors"
  ON doctors FOR ALL
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

-- ============================================
-- VISITS/APPOINTMENTS TABLE POLICIES
-- ============================================

-- Users can view their own visits
CREATE POLICY "Users can view own visits"
  ON visits FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

-- Users can insert their own visits
CREATE POLICY "Users can insert own visits"
  ON visits FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

-- Users can update their own visits
CREATE POLICY "Users can update own visits"
  ON visits FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid());

-- Users can delete their own visits
CREATE POLICY "Users can delete own visits"
  ON visits FOR DELETE
  TO authenticated
  USING (rep_id = auth.uid());

-- Admin can view all visits
CREATE POLICY "Admin can view all visits"
  ON visits FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

-- ============================================
-- REPORTS TABLE POLICIES
-- ============================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

-- Users can insert their own reports
CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

-- Users can update their own reports
CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid());

-- Users can delete their own reports
CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (rep_id = auth.uid());

-- Admin can view all reports
CREATE POLICY "Admin can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

-- ============================================
-- QUOTAS TABLE POLICIES
-- ============================================

-- Users can view their own quotas
CREATE POLICY "Users can view own quotas"
  ON quotas FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

-- Only admin can insert/update quotas
CREATE POLICY "Admin can manage quotas"
  ON quotas FOR ALL
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

-- ============================================
-- QUOTAS TABLE - meetings_target COLUMN SUPPORT
-- ============================================

-- The quotas table should have a meetings_target column to store the target
-- number of meetings for each rep. This column is used by the admin dashboard
-- to set and manage meeting targets.

-- If meetings_target column does not exist, run:
-- ALTER TABLE quotas ADD COLUMN IF NOT EXISTS meetings_target INTEGER DEFAULT 10;

-- NOTE: The 'upsert-quotas' Edge Function deployed in Supabase also needs to be
-- updated to accept and handle the 'meetings_target' field in its request body
-- and include it in the upsert operation. Ensure the Edge Function is modified
-- to pass this field when inserting or updating quota records.

-- ============================================
-- ACTIVITIES TABLE (if you have one)
-- ============================================

-- Create activities table if not exists
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id UUID REFERENCES auth.users(id) NOT NULL,
  activity_type TEXT NOT NULL,
  details TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users can view their own activities
CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

-- Users can insert their own activities
CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

-- Admin can view all activities
CREATE POLICY "Admin can view all activities"
  ON activities FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );
