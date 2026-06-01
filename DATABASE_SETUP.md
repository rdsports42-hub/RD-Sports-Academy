# Database Setup Guide - RD Sports Academy

This guide provides step-by-step instructions to set up the Supabase database for the RD Sports Academy application.

## Prerequisites

1. Supabase account (https://supabase.com)
2. A Supabase project created
3. Access to the Supabase SQL Editor

## Database Architecture

The application uses the following core tables with Row Level Security (RLS) enabled for data privacy.

## Step 1: Create the `profiles` Table

```sql
CREATE TABLE profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  username TEXT UNIQUE,
  role TEXT CHECK (role IN ('parent_student', 'coach')),
  sports_program TEXT,
  specialization TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own profile
CREATE POLICY "Users can manage their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## Step 2: Create the `schedules` Table

```sql
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sport TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Coaches can manage their own schedules, everyone can read
CREATE POLICY "Coaches can manage their schedules"
  ON schedules FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Everyone can read schedules"
  ON schedules FOR SELECT
  USING (true);
```

## Step 3: Create the `attendance` Table

```sql
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own attendance"
  ON attendance FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Coaches can manage attendance for their students"
  ON attendance FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);
```

## Step 4: Create the `performance` Table

```sql
CREATE TABLE performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 1 AND score <= 10),
  week_start DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own performance"
  ON performance FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Coaches can manage performance records"
  ON performance FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);
```

## Step 5: Create the `achievements` Table

```sql
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  certificate_url TEXT,
  awarded_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Coaches can manage achievements"
  ON achievements FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);
```

## Step 6: Create the `coach_feedback` Table

```sql
CREATE TABLE coach_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('Performance', 'Attendance', 'Behavior', 'Achievement', 'General')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE coach_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view feedback about them"
  ON coach_feedback FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Coaches can manage feedback they send"
  ON coach_feedback FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);
```

## Step 7: Create the `student_feedback` Table

```sql
CREATE TABLE student_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE student_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can submit and view their own feedback"
  ON student_feedback FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Step 8: Create the `payments` Table

```sql
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) DEFAULT 1000,
  status TEXT CHECK (status IN ('paid', 'due', 'pending')),
  payment_date DATE,
  method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Coaches can view payments for their students"
  ON payments FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can manage payments"
  ON payments FOR INSERT
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);
```

## Step 9: Create the `daily_tips` Table

```sql
CREATE TABLE daily_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tip TEXT NOT NULL,
  sport TEXT NOT NULL,
  active_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read daily tips
CREATE POLICY "Everyone can read daily tips"
  ON daily_tips FOR SELECT
  USING (true);
```

## Step 10: Create the `daily_thoughts` Table

```sql
CREATE TABLE daily_thoughts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_thoughts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own thoughts"
  ON daily_thoughts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Step 11: Create the `coach_notes` Table

```sql
CREATE TABLE coach_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Coaches can manage their own notes
CREATE POLICY "Coaches can manage their notes"
  ON coach_notes FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);
```

## Step 12: Create Indexes for Performance

```sql
-- Indexes for faster queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_schedules_coach_id ON schedules(coach_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_coach_id ON attendance(coach_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_performance_student_id ON performance(student_id);
CREATE INDEX idx_performance_week_start ON performance(week_start);
CREATE INDEX idx_achievements_student_id ON achievements(student_id);
CREATE INDEX idx_coach_feedback_student_id ON coach_feedback(student_id);
CREATE INDEX idx_coach_feedback_coach_id ON coach_feedback(coach_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_coach_id ON payments(coach_id);
CREATE INDEX idx_daily_thoughts_user_id ON daily_thoughts(user_id);
CREATE INDEX idx_daily_tips_active_date ON daily_tips(active_date);
CREATE INDEX idx_coach_notes_coach_id ON coach_notes(coach_id);
CREATE INDEX idx_coach_notes_date ON coach_notes(note_date);
```

## Execution Instructions

1. Log in to your Supabase project
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste each SQL section above (Steps 1-12)
5. Execute each section one by one
6. Verify that all tables are created successfully

## Verification

After creating all tables, verify by running:

```sql
-- Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Enable Realtime (Optional but Recommended)

For real-time updates in the app, enable realtime on key tables:

1. Go to Supabase Dashboard → Realtime
2. Enable realtime for these tables:
   - `schedules`
   - `attendance`
   - `performance`
   - `coach_feedback`
   - `achievements`
   - `daily_thoughts`
   - `coach_notes`

## Seeding Sample Data (Optional)

To test the application with sample data:

```sql
-- Insert sample daily tips
INSERT INTO daily_tips (tip, sport, active_date) VALUES
('Stay hydrated during training sessions', 'Cricket', CURRENT_DATE),
('Always warm up before any physical activity', 'Basketball', CURRENT_DATE),
('Practice makes perfect - consistency is key', 'Weightlifting', CURRENT_DATE);

-- Note: Coach and student data will be created through the app registration
```

## Troubleshooting

### "permission denied for schema public"
- Ensure your Supabase user has appropriate permissions
- Check that you're connected to the correct database

### "relation does not exist"
- Make sure you executed all steps in order
- Check for any SQL syntax errors in the output

### RLS Policies Not Working
- Verify that RLS is enabled for each table
- Check that policies are correctly configured
- Test with actual auth users

## Security Best Practices

1. **Always enable RLS** - Never leave a table without RLS policies
2. **Principle of Least Privilege** - Users can only access their own data
3. **Regular Backups** - Enable automatic backups in Supabase
4. **Monitor Access** - Use Supabase logs to monitor database access
5. **Update Regularly** - Keep dependencies and Supabase updated

## Performance Optimization

- Indexes are created on frequently queried columns
- Consider partitioning large tables in the future
- Monitor query performance in Supabase dashboard
- Use pagination for large result sets

## Next Steps

1. Configure Supabase credentials in `src/supabaseClient.js`
2. Update the app environment variables
3. Run the app and test registration flow
4. Verify data is being stored correctly
5. Test RLS policies with different user roles

---

**Last Updated**: June 2026
**Database Version**: 1.0
