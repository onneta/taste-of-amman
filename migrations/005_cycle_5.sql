-- ONI Generated Migration — Cycle 5
-- Generated: 2026-04-05T11:18:02.120Z

-- Schema for: Weekly Revenue and Food Cost Audit Dashboard Enhancement
CREATE TABLE IF NOT EXISTS audit_periods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start_date date NOT NULL,
    period_end_date date NOT NULL,
    week_number integer NOT NULL,
    fiscal_year integer NOT NULL,
    status varchar(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'reviewed', 'approved')),
    created_by uuid,
    reviewed_by uuid,
    approved_by uuid,
    reviewed_at timestamptz,
    approved_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT audit_periods_date_check CHECK (period_end_date > period_start_date),
    CONSTRAINT audit_periods_unique_period UNIQUE (period_start_date, period_end_date)
);

CREATE INDEX IF NOT EXISTS idx_audit_periods_start_date ON audit_periods (period_start_date);
CREATE INDEX IF NOT EXISTS idx_audit_periods_status ON audit_periods (status);
CREATE INDEX IF NOT EXISTS idx_audit_periods_week_year ON audit_periods (fiscal_year, week_number);

CREATE TABLE IF NOT EXISTS food_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(150) NOT NULL,
    code varchar(50) UNIQUE NOT NULL,
    parent_category_id uuid REFERENCES food_categories(id) ON DELETE SET NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_categories_parent ON food_categories (parent_category_id);
CREATE INDEX IF NOT EXISTS idx_food_categories_active ON food_categories (is_active);

CREATE TABLE IF NOT EXISTS cost_targets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES food_categories(id) ON DELETE CASCADE,
    target_food_cost_percentage numeric(5,2) NOT NULL CHECK (target_food_cost_percentage >= 0 AND target_food_cost_percentage <= 100),
    warning_threshold_percentage numeric(5,2) NOT NULL DEFAULT 2.00 CHECK (warning_threshold_percentage >= 0),
    critical_threshold_percentage numeric(5,2) NOT NULL DEFAULT 5.00 CHECK (critical_threshold_percentage >= 0),
    effective_from date NOT NULL,
    effective_to date,
    is_global boolean NOT NULL DEFAULT false,
    created_by uuid,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT cost_targets_threshold_check CHECK (critical_threshold_percentage >= warning_threshold_percentage)
);

CREATE INDEX IF NOT EXISTS idx_cost_targets_category ON cost_targets (category_id);
CREATE INDEX IF NOT EXISTS idx_cost_targets_effective_from ON cost_targets (effective_from);
CREATE INDEX IF NOT EXISTS idx_cost_targets_global ON cost_targets (is_global);

CREATE TABLE IF NOT EXISTS weekly_revenue_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_period_id uuid NOT NULL REFERENCES audit_periods(id) ON DELETE CASCADE,
    revenue_date date NOT NULL,
    gross_revenue numeric(14,2) NOT NULL DEFAULT 0.00,
    net_revenue numeric(14,2) NOT NULL DEFAULT 0.00,
    tax_collected numeric(14,2) NOT NULL DEFAULT 0.00,
    discounts_applied numeric(14,2) NOT NULL DEFAULT 0.00,
    refunds_issued numeric(14,2) NOT NULL DEFAULT 0.00,
    covers_count integer DEFAULT 0,
    transaction_count integer DEFAULT 0,
    average_check_value numeric(10,2),
    data_source varchar(100),
    is_reconciled boolean NOT NULL DEFAULT false,
    reconciled_at timestamptz,
    reconciled_by uuid,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekly_revenue_audit_period ON weekly_revenue_records (audit_period_id);
CREATE INDEX IF NOT EXISTS idx_weekly_revenue_date ON weekly_revenue_records (revenue_date);
CREATE INDEX IF NOT EXISTS idx_weekly_revenue_reconciled ON weekly_revenue_records (is_reconciled);

CREATE TABLE IF NOT EXISTS food_cost_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_period_id uuid NOT NULL REFERENCES audit_periods(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES food_categories(id) ON DELETE RESTRICT,
    record_date date NOT NULL,
    opening_inventory_value numeric(14,2) NOT NULL DEFAULT 0.00,
    closing_inventory_value numeric(14,2) NOT NULL DEFAULT 0.00,
    purchases_value numeric(14,2) NOT NULL DEFAULT 0.00,
    transfers_in_value numeric(14,2) NOT NULL DEFAULT 0.00,
    transfers_out_value numeric(14,2) NOT NULL DEFAULT 0.00,
    waste_value numeric(14,2) NOT NULL DEFAULT 0.00,
    staff_meal_value numeric(14,2) NOT NULL DEFAULT 0.00,
    promotional_value numeric(14,2) NOT NULL DEFAULT 0.00,
    actual_cost_value numeric(14,2) GENERATED ALWAYS AS (
        opening_inventory_value + purchases_value + transfers_in_value
        - transfers_out_value - waste_value - staff_meal_value
        - promotional_value - closing_inventory_value
    ) STORED,
    data_source varchar(100),
    is_verified boolean NOT NULL DEFAULT false,
    verified_by uuid,
    verified_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_cost_audit_period ON food_cost_records (audit_period_id);
CREATE INDEX IF NOT EXISTS idx_food_cost_category ON food_cost_records (category_id);
CREATE INDEX IF NOT EXISTS idx_food_cost_record_date ON food_cost_records (record_date);
CREATE INDEX IF NOT EXISTS idx_food_cost_verified ON food_cost_records (is_verified);

CREATE TABLE IF NOT EXISTS weekly_audit_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_period_id uuid NOT NULL REFERENCES audit_periods(id) ON DELETE CASCADE,
    report_name varchar(255) NOT NULL,
    report_type varchar(50) NOT NULL DEFAULT 'weekly' CHECK (report_type IN ('weekly', 'monthly', 'quarterly', 'custom')),
    total_revenue numeric(14,2) NOT NULL DEFAULT 0.00,
    total_food_cost numeric(14,2) NOT NULL DEFAULT 0.00,
    overall_food_cost_percentage numeric(5,2),
    target_food_cost_percentage numeric(5,2),
    variance_percentage numeric(6,2),
    variance_amount numeric(14,2),
    total_waste_value numeric(14,2) NOT NULL DEFAULT 0.00,
    waste_percentage numeric(5,2),
    total_covers integer DEFAULT 0,
    food_cost_per_cover numeric(10,2),
    revenue_per_cover numeric(10,2),
    generated_at timestamptz NOT NULL DEFAULT now(),
    generated_by uuid,
    summary_data jsonb,
    is_finalized boolean NOT NULL DEFAULT false,
    finalized_at timestamptz,
    finalized_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekly_audit_reports_period ON weekly_audit_reports (audit_period_id);
CREATE INDEX IF NOT EXISTS idx_weekly_audit_reports_generated_at ON weekly_audit_reports (generated_at);
CREATE INDEX IF NOT EXISTS idx_weekly_audit_reports_type ON weekly_audit_reports (report_type);
CREATE INDEX IF NOT EXISTS idx_weekly_audit_reports_finalized ON weekly_audit_reports (is_finalized);

CREATE TABLE IF NOT EXISTS report_category_breakdowns (
    id uuid PRIMARY KEY DEFAULT gen_random_