CREATE TABLE "agent_daily_suggestions" (
	"merchant_id" uuid NOT NULL,
	"date" text NOT NULL,
	"suggestion" jsonb NOT NULL,
	"weight_snapshot" jsonb,
	"pipeline_trace" jsonb,
	"generated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_pipeline_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL,
	"step_2_duration_ms" integer,
	"step_25_result" text,
	"step_3_duration_ms" integer,
	"llm_tokens" integer,
	"success" boolean NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text,
	"name" text,
	"description" text,
	"hook" text,
	"tone" jsonb,
	"structure" jsonb,
	"cuisines" jsonb,
	"platforms" jsonb,
	"weight" numeric DEFAULT '0.5',
	"usage_count" integer DEFAULT 0,
	"rejection_count" integer DEFAULT 0,
	"source" text DEFAULT '热榜分析',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid,
	"type" text,
	"title" text,
	"body" text,
	"platform" text,
	"status" text DEFAULT 'draft',
	"reference_source" text,
	"template_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid,
	"name" text,
	"description" text,
	"price" numeric,
	"category" text,
	"is_signature" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"image_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hot_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text,
	"title" text,
	"body" text,
	"store_name" text,
	"cuisine_type" text,
	"city" text,
	"likes_count" integer,
	"keywords" jsonb,
	"source_url" text,
	"cover_image_url" text,
	"collected_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "merchant_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL,
	"suppressed_type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"avatar_url" text,
	"subscription_status" text DEFAULT 'trial',
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid,
	"platform" text DEFAULT 'dianping',
	"reviewer_name" text,
	"rating" integer,
	"content" text,
	"reply_content" text,
	"reply_status" text DEFAULT 'pending',
	"sentiment" text DEFAULT 'neutral',
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text,
	"address" text,
	"phone" text,
	"description" text,
	"cuisine_type" text,
	"price_range" text,
	"target_customers" text,
	"dianping_url" text,
	"xiaohongshu_url" text,
	"douyin_url" text,
	"brand_persona" jsonb,
	"brand_assets" jsonb,
	"account_stage" text DEFAULT 'new',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "stores_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"lemon_squeezy_id" text,
	"status" text,
	"plan_type" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "template_pending_review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_input" jsonb,
	"analysis_result" jsonb NOT NULL,
	"status" text DEFAULT 'pending',
	"review_note" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"original_url" text,
	"analyzed_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weight_adjustment_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid,
	"dimension" text NOT NULL,
	"adjustment" numeric NOT NULL,
	"basis" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weight_config_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"weights" jsonb NOT NULL,
	"reason" text,
	"applied_at" timestamp DEFAULT now(),
	"rollback_to" uuid
);
--> statement-breakpoint
CREATE TABLE "weight_score_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL,
	"candidate_index" integer NOT NULL,
	"raw_scores" jsonb NOT NULL,
	"normalized_scores" jsonb NOT NULL,
	"weighted_scores" jsonb NOT NULL,
	"final_score" numeric NOT NULL,
	"created_at" timestamp DEFAULT now()
);
