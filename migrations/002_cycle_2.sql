-- ONI Generated Migration — Cycle 2
-- Generated: 2026-04-05T03:58:54.428Z

-- Schema for: Real-time revenue and food cost tracking dashboard
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    address text,
    timezone varchar(100) NOT NULL DEFAULT 'Asia/Amman',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    category_id uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
    name varchar(255) NOT NULL,
    description text,
    sku varchar(100),
    selling_price numeric(10, 3) NOT NULL,
    currency varchar(10) NOT NULL DEFAULT 'JOD',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    unit varchar(50) NOT NULL,
    current_unit_cost numeric(10, 4) NOT NULL DEFAULT 0,
    currency varchar(10) NOT NULL DEFAULT 'JOD',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_used numeric(10, 4) NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (menu_item_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS ingredient_cost_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    unit_cost numeric(10, 4) NOT NULL,
    effective_date date NOT NULL,
    notes text,
    recorded_by uuid,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    order_number varchar(100) NOT NULL,
    order_type varchar(50) NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery', 'online')),
    status varchar(50) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'refunded')),
    subtotal numeric(10, 3) NOT NULL DEFAULT 0,
    discount_amount numeric(10, 3) NOT NULL DEFAULT 0,
    tax_amount numeric(10, 3) NOT NULL DEFAULT 0,
    total_amount numeric(10, 3) NOT NULL DEFAULT 0,
    total_food_cost numeric(10, 3) NOT NULL DEFAULT 0,
    gross_profit numeric(10, 3) NOT NULL DEFAULT 0,
    currency varchar(10) NOT NULL DEFAULT 'JOD',
    ordered_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    menu_item_name varchar(255) NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric(10, 3) NOT NULL,
    unit_food_cost numeric(10, 3) NOT NULL DEFAULT 0,
    discount_amount numeric(10, 3) NOT NULL DEFAULT 0,
    line_total numeric(10, 3) NOT NULL,
    line_food_cost numeric(10, 3) NOT NULL DEFAULT 0,
    line_gross_profit numeric(10, 3) NOT NULL DEFAULT 0,
    food_cost_percentage numeric(5, 2) GENERATED ALWAYS AS (
        CASE WHEN line_total > 0 THEN ROUND((line_food_cost / line_total) * 100, 2) ELSE 0 END
    ) STORED,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revenue_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    snapshot_date date NOT NULL,
    period_type varchar(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    total_orders integer NOT NULL DEFAULT 0,
    total_revenue numeric(12, 3) NOT NULL DEFAULT 0,
    total_discount numeric(12, 3) NOT NULL DEFAULT 0,
    total_tax numeric(12, 3) NOT NULL DEFAULT 0,
    net_revenue numeric(12, 3) NOT NULL DEFAULT 0,
    total_food_cost numeric(12, 3) NOT NULL DEFAULT 0,
    gross_profit numeric(12, 3) NOT NULL DEFAULT 0,
    food_cost_percentage numeric(5, 2) NOT NULL DEFAULT 0,
    gross_margin_percentage numeric(5, 2) NOT NULL DEFAULT 0,
    avg_order_value numeric(10, 3) NOT NULL DEFAULT 0,
    currency varchar(10) NOT NULL DEFAULT 'JOD',
    computed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    UNIQUE (location_id, snapshot_date, period_type)
);

CREATE TABLE IF NOT EXISTS menu_item_performance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    snapshot_date date NOT NULL,
    period_type varchar(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    total_quantity_sold integer NOT NULL DEFAULT 0,
    total_revenue numeric(12, 3) NOT NULL DEFAULT 0,
    total_food_cost numeric(12, 3) NOT NULL DEFAULT 0,
    total_gross_profit numeric(12, 3) NOT NULL DEFAULT 0,
    food_cost_percentage numeric(5, 2) NOT NULL DEFAULT 0,
    gross_margin_percentage numeric(5, 2) NOT NULL DEFAULT 0,
    computed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    UNIQUE (location_id, menu_item_id, snapshot_date, period_type)
);

CREATE TABLE IF NOT EXISTS cost_threshold_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    alert_name varchar(255) NOT NULL,
    alert_type varchar(50) NOT NULL CHECK (alert_type IN ('food_cost_percentage', 'gross_margin_percentage', 'daily_revenue', 'item_food_cost_percentage')),
    scope varchar(50) NOT NULL DEFAULT 'overall' CHECK (scope IN ('overall', 'per_item', 'per_category')),
    menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
    category_id uuid REFERENCES menu_categories(id) ON DELETE CASCADE,
    threshold_value numeric(10, 3) NOT NULL,
    comparison_operator varchar(10) NOT NULL DEFAULT 'greater_than' CHECK (comparison_operator IN ('greater_than', 'less_than', 'equals')),
    period_type varchar(20) NOT NULL DEFAULT 'daily' CHECK (period_type IN ('real_time', 'daily', '