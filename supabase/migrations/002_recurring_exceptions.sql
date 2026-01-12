-- Migration: Add recurring event exceptions table
-- This allows skipping specific dates in recurring event patterns

-- Recurring event exceptions table
CREATE TABLE IF NOT EXISTS calendar_recurring_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recurring_pattern_id UUID NOT NULL REFERENCES calendar_recurring_patterns(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recurring_pattern_id, exception_date)
);

-- Activity logs table for admin actions
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type TEXT NOT NULL, -- 'product', 'page', 'event', 'user', etc.
  entity_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recurring_exceptions_pattern_id ON calendar_recurring_exceptions(recurring_pattern_id);
CREATE INDEX IF NOT EXISTS idx_recurring_exceptions_date ON calendar_recurring_exceptions(exception_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);

-- Enable RLS
ALTER TABLE calendar_recurring_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exceptions
CREATE POLICY "Exceptions are viewable by authenticated users" ON calendar_recurring_exceptions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Exceptions are editable by authenticated users" ON calendar_recurring_exceptions FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for activity logs
CREATE POLICY "Activity logs are viewable by authenticated users" ON activity_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Activity logs are insertable by authenticated users" ON activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
