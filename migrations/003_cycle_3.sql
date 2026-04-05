-- ONI Generated Migration — Cycle 3
-- Generated: 2026-04-05T04:18:35.378Z

-- Schema for: Online Ordering System Enhancement with Payment Processing
CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    phone text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    stripe_customer_id text UNIQUE,
    is_guest boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id ON customers (stripe_customer_id);

CREATE TABLE IF NOT EXISTS delivery_zones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    minimum_order_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee numeric(10, 2) NOT NULL DEFAULT 0.00,
    estimated_delivery_minutes_min integer NOT NULL DEFAULT 30,
    estimated_delivery_minutes_max integer NOT NULL DEFAULT 60,
    polygon_coordinates jsonb,
    zip_codes text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_is_active ON delivery_zones (is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_zip_codes ON delivery_zones USING GIN (zip_codes);

CREATE TABLE IF NOT EXISTS customer_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
    delivery_zone_id uuid REFERENCES delivery_zones (id) ON DELETE SET NULL,
    label text,
    street_address text NOT NULL,
    apartment_unit text,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    country text NOT NULL DEFAULT 'US',
    latitude numeric(10, 7),
    longitude numeric(10, 7),
    delivery_instructions text,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_delivery_zone_id ON customer_addresses (delivery_zone_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_zip_code ON customer_addresses (zip_code);

CREATE TABLE IF NOT EXISTS menu_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    image_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_is_active ON menu_categories (is_active);
CREATE INDEX IF NOT EXISTS idx_menu_categories_display_order ON menu_categories (display_order);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid NOT NULL REFERENCES menu_categories (id) ON DELETE RESTRICT,
    name text NOT NULL,
    description text,
    price numeric(10, 2) NOT NULL,
    image_url text,
    is_active boolean NOT NULL DEFAULT true,
    is_available boolean NOT NULL DEFAULT true,
    is_featured boolean NOT NULL DEFAULT false,
    calories integer,
    allergens text[],
    tags text[],
    preparation_time_minutes integer DEFAULT 15,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items (category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON menu_items (is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items (is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_featured ON menu_items (is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_tags ON menu_items USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_menu_items_allergens ON menu_items USING GIN (allergens);

CREATE TABLE IF NOT EXISTS menu_item_modifiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items (id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    is_required boolean NOT NULL DEFAULT false,
    min_selections integer NOT NULL DEFAULT 0,
    max_selections integer NOT NULL DEFAULT 1,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_item_modifiers_menu_item_id ON menu_item_modifiers (menu_item_id);

CREATE TABLE IF NOT EXISTS menu_item_modifier_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_id uuid NOT NULL REFERENCES menu_item_modifiers (id) ON DELETE CASCADE,
    name text NOT NULL,
    price_delta numeric(10, 2) NOT NULL DEFAULT 0.00,
    is_available boolean NOT NULL DEFAULT true,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modifier_options_modifier_id ON menu_item_modifier_options (modifier_id);

CREATE TABLE IF NOT EXISTS carts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES customers (id) ON DELETE SET NULL,
    session_id text,
    delivery_zone_id uuid REFERENCES delivery_zones (id) ON DELETE SET NULL,
    customer_address_id uuid REFERENCES customer_addresses (id) ON DELETE SET NULL,
    order_type text NOT NULL DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup')),
    promo_code text,
    discount_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
    special_instructions text,
    expires_at timestamptz NOT NULL DEFAULT now() + interval '2 hours',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts (customer_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts (session_id);
CREATE INDEX IF NOT EXISTS idx_carts_expires_at ON carts (expires_at);

CREATE TABLE IF NOT EXISTS cart_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id uuid NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
    menu_item_id uuid NOT NULL REFERENCES menu_items (id) ON DELETE RESTRICT,
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price numeric(10, 2) NOT NULL,
    selected_modifiers jsonb NOT NULL DEFAULT '[]',
    special_instructions text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_menu_item_id ON cart_items (menu_item_id);

CREATE TABLE IF NOT EXISTS promo_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    description text,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_delivery')),
    discount_value numeric(10, 2) NOT NULL DEFAULT 0.00,
    minimum_order_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
    maximum_discount_amount numeric(10, 2),
    usage_limit integer,
    usage_count integer NOT NULL DEFAULT 0,
    valid_from timestamptz NOT NULL DEFAULT now(),
    valid_until timestamptz,
    is_active boolean NOT NULL DEFAULT true,
    applicable_delivery_zone_ids uuid[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE

-- Schema for: Real-Time Revenue and Food Cost Tracking Dashboard Enhancement
CREATE TABLE IF NOT EXISTS revenue_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date date NOT NULL,
    period_type varchar(10) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    total_revenue numeric(12, 2) NOT NULL DEFAULT 0,
    total_orders integer NOT NULL DEFAULT 0,
    average_order_value numeric(10, 2) GENERATED ALWAYS AS (
        CASE WHEN total_orders > 0 THEN total_revenue / total_orders ELSE 0 END
    ) STORED,
    total_food_cost numeric(12, 2) NOT NULL DEFAULT 0,
    food_cost_percentage numeric(5, 2) GENERATED ALWAYS AS (
        CASE WHEN total_revenue > 0 THEN (total_food_cost / total_revenue) * 100 ELSE 0 END
    ) STORED,
    gross_profit numeric(12, 2) GENERATED ALWAYS AS (total_revenue - total_food_cost) STORED,
    gross_margin_percentage numeric(5, 2) GENERATED ALWAYS AS (
        CASE WHEN total_revenue > 0 THEN ((total_revenue - total_food_cost) / total_revenue) * 100 ELSE 0 END
    ) STORED,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    category varchar(100),
    selling_price numeric(10, 2) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_name varchar(255) NOT NULL,
    quantity numeric(10, 4) NOT NULL,
    unit varchar(50) NOT NULL,
    unit_cost numeric(10, 4) NOT NULL,
    total_cost numeric(10, 4) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_cost_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    snapshot_date date NOT NULL,
    total_ingredient_cost numeric(10, 4) NOT NULL DEFAULT 0,
    selling_price numeric(10, 2) NOT NULL,
    food_cost_percentage numeric(5, 2) GENERATED ALWAYS AS (
        CASE WHEN selling_price > 0 THEN (total_ingredient_cost / selling_price) * 100 ELSE 0 END
    ) STORED,
    gross_profit_per_unit numeric(10, 2) GENERATED ALWAYS AS (selling_price - total_ingredient_cost) STORED,
    units_sold integer NOT NULL DEFAULT 0,
    total_revenue numeric(12, 2) GENERATED ALWAYS AS (selling_price * units_sold) STORED,
    total_cost numeric(12, 2) GENERATED ALWAYS AS (total_ingredient_cost * units_sold) STORED,
    total_gross_profit numeric(12, 2) GENERATED ALWAYS AS ((selling_price - total_ingredient_cost) * units_sold) STORED,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_profitability (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    period_type varchar(10) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    period_start date NOT NULL,
    period_end date NOT NULL,
    units_sold integer NOT NULL DEFAULT 0,
    total_revenue numeric(12, 2) NOT NULL DEFAULT 0,
    total_food_cost numeric(12, 2) NOT NULL DEFAULT 0,
    gross_profit numeric(12, 2) GENERATED ALWAYS AS (total_revenue - total_food_cost) STORED,
    food_cost_percentage numeric(5, 2) GENERATED ALWAYS AS (
        CASE WHEN total_revenue > 0 THEN (total_food_cost / total_revenue) * 100 ELSE 0 END
    ) STORED,
    margin_percentage numeric(5, 2) GENERATED ALWAYS AS (
        CASE WHEN total_revenue > 0 THEN ((total_revenue - total_food_cost) / total_revenue) * 100 ELSE 0 END
    ) STORED,
    profitability_rank integer,
    popularity_rank integer,
    menu_engineering_category varchar(20) CHECK (menu_engineering_category IN ('star', 'plow_horse', 'puzzle', 'dog')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_cost_alert_thresholds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    threshold_name varchar(100) NOT NULL,
    scope varchar(20) NOT NULL CHECK (scope IN ('global', 'category', 'menu_item')),
    menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
    category varchar(100),
    warning_threshold_percentage numeric(5, 2) NOT NULL,
    critical_threshold_percentage numeric(5, 2) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_by varchar(255),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_cost_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    threshold_id uuid NOT NULL REFERENCES food_cost_alert_thresholds(id) ON DELETE CASCADE,
    alert_level varchar(10) NOT NULL CHECK (alert_level IN ('warning', 'critical')),
    scope varchar(20) NOT NULL CHECK (scope IN ('global', 'category', 'menu_item')),
    menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
    category varchar(100),
    triggered_at timestamptz NOT NULL DEFAULT now(),
    period_type varchar(10) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    period_start date NOT NULL,
    period_end date NOT NULL,
    actual_food_cost_percentage numeric(5, 2) NOT NULL,
    threshold_percentage numeric(5, 2) NOT NULL,
    total_revenue numeric(12, 2),
    total_food_cost numeric(12, 2),
    is_acknowledged boolean NOT NULL DEFAULT false,
    acknowledged_by varchar(255),
    acknowledged_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revenue_trend_comparisons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type varchar(10) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    current_period_start date NOT NULL,
    current_period_end date NOT NULL,
    comparison_period_start date NOT NULL,
    comparison_period_end date NOT NULL,
    current_revenue numeric(12, 2) NOT NULL DEFAULT 0,
    comparison_revenue numeric(12, 2) NOT NULL DEFAULT 0,
    revenue_change numeric(12, 2) GENERATED ALWAYS AS (current_revenue - comparison_revenue) STORED,
    revenue_change_percentage numeric(7, 2) GENERATED ALWAYS AS (
        CASE WHEN comparison_revenue > 0 THEN ((current_revenue - comparison_revenue) / comparison_revenue) * 100 ELSE NULL END
    ) STORED,
    current_food_cost numeric(12, 2) NOT NULL DEFAULT 0,
    comparison_food_cost numeric(12, 2) NOT NULL DEFAULT 0,
    food_cost_change numeric(12, 2) GENERATED ALWAYS AS (current_