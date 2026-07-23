import { pgTable, uuid, text, timestamp, integer, jsonb, boolean, decimal } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  subscriptionStatus: text("subscription_status").default("trial"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").unique(),
  name: text("name"),
  address: text("address"),
  phone: text("phone"),
  description: text("description"),
  cuisineType: text("cuisine_type"),
  priceRange: text("price_range"),
  targetCustomers: text("target_customers"),
  dianpingUrl: text("dianping_url"),
  xiaohongshuUrl: text("xiaohongshu_url"),
  douyinUrl: text("douyin_url"),
  brandPersona: jsonb("brand_persona"),
  brandAssets: jsonb("brand_assets"),
  accountStage: text("account_stage").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dishes = pgTable("dishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id"),
  name: text("name"),
  description: text("description"),
  price: decimal("price"),
  category: text("category"),
  isSignature: boolean("is_signature").default(false),
  sortOrder: integer("sort_order").default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contentTemplates = pgTable("content_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type"),
  name: text("name"),
  description: text("description"),
  hook: text("hook"),
  tone: jsonb("tone"),
  structure: jsonb("structure"),
  cuisines: jsonb("cuisines"),
  platforms: jsonb("platforms"),
  weight: decimal("weight").default("0.5"),
  usageCount: integer("usage_count").default(0),
  rejectionCount: integer("rejection_count").default(0),
  source: text("source").default("热榜分析"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contents = pgTable("contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id"),
  type: text("type"),
  title: text("title"),
  body: text("body"),
  platform: text("platform"),
  status: text("status").default("draft"),
  referenceSource: text("reference_source"),
  templateId: uuid("template_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id"),
  platform: text("platform").default("dianping"),
  reviewerName: text("reviewer_name"),
  rating: integer("rating"),
  content: text("content"),
  replyContent: text("reply_content"),
  replyStatus: text("reply_status").default("pending"),
  sentiment: text("sentiment").default("neutral"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  lemonSqueezyId: text("lemon_squeezy_id"),
  status: text("status"),
  planType: text("plan_type"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hotContents = pgTable("hot_contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  platform: text("platform"),
  title: text("title"),
  body: text("body"),
  storeName: text("store_name"),
  cuisineType: text("cuisine_type"),
  city: text("city"),
  likesCount: integer("likes_count"),
  keywords: jsonb("keywords"),
  sourceUrl: text("source_url"),
  coverImageUrl: text("cover_image_url"),
  collectedAt: timestamp("collected_at").defaultNow(),
});

export const userLinks = pgTable("user_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  originalUrl: text("original_url"),
  analyzedData: jsonb("analyzed_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentDailySuggestions = pgTable("agent_daily_suggestions", {
  merchantId: uuid("merchant_id").notNull(),
  date: text("date").notNull(),
  suggestion: jsonb("suggestion").notNull(),
  weightSnapshot: jsonb("weight_snapshot"),
  pipelineTrace: jsonb("pipeline_trace"),
  generatedAt: timestamp("generated_at").defaultNow(),
});

export const weightConfigVersions = pgTable("weight_config_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  weights: jsonb("weights").notNull(),
  reason: text("reason"),
  appliedAt: timestamp("applied_at").defaultNow(),
  rollbackTo: uuid("rollback_to"),
});

export const weightAdjustmentLog = pgTable("weight_adjustment_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id"),
  dimension: text("dimension").notNull(),
  adjustment: decimal("adjustment").notNull(),
  basis: text("basis"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentPipelineLog = pgTable("agent_pipeline_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull(),
  step2Duration: integer("step_2_duration_ms"),
  step25Result: text("step_25_result"),
  step3Duration: integer("step_3_duration_ms"),
  llmTokens: integer("llm_tokens"),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weightScoreLog = pgTable("weight_score_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull(),
  candidateIndex: integer("candidate_index").notNull(),
  rawScores: jsonb("raw_scores").notNull(),
  normalizedScores: jsonb("normalized_scores").notNull(),
  weightedScores: jsonb("weighted_scores").notNull(),
  finalScore: decimal("final_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templatePendingReview = pgTable("template_pending_review", {
  id: uuid("id").primaryKey().defaultRandom(),
  analysisInput: jsonb("analysis_input"),
  analysisResult: jsonb("analysis_result").notNull(),
  status: text("status").default("pending"),
  reviewNote: text("review_note"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const merchantFeedback = pgTable("merchant_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull(),
  suppressedType: text("suppressed_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
