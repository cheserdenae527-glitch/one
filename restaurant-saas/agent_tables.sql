-- 7 张 Agent 系统表

CREATE TABLE IF NOT EXISTS agent_daily_suggestions (
  merchant_id UUID NOT NULL,
  date TEXT NOT NULL,
  suggestion JSONB NOT NULL,
  weight_snapshot JSONB,
  pipeline_trace JSONB,
  generated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weight_config_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weights JSONB NOT NULL,
  reason TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  rollback_to UUID
);

CREATE TABLE IF NOT EXISTS weight_adjustment_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID,
  dimension TEXT NOT NULL,
  adjustment DECIMAL NOT NULL,
  basis TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_pipeline_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  step_2_duration_ms INTEGER,
  step_25_result TEXT,
  step_3_duration_ms INTEGER,
  llm_tokens INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weight_score_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  candidate_index INTEGER NOT NULL,
  raw_scores JSONB NOT NULL,
  normalized_scores JSONB NOT NULL,
  weighted_scores JSONB NOT NULL,
  final_score DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_pending_review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_input JSONB,
  analysis_result JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  review_note TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  suppressed_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
