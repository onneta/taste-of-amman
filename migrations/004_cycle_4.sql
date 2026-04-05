-- ONI Generated Migration — Cycle 4
-- Generated: 2026-04-05T11:11:46.545Z

-- Schema for: Online Ordering System with Payment Processing
CREATE TABLE IF NOT EXISTS restaurants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(255) UNIQUE NOT NULL,
    description text,
    phone varchar(50),
    email varchar(255),
    address_line1 varchar(255),
    address_line2 varchar(255),
    city varchar(100),
    state varchar(100),
    postal_code varchar(20),
    country varchar(100) DEFAULT 'JO',
    latitude numeric(10, 8),
    longitude numeric(11, 8),
    timezone varchar(100) DEFAULT 'Asia/Amman',
    currency varchar(10) DEFAULT 'JOD',
    is_active boolean DEFAULT true,
    accepts_online_orders boolean DEFAULT true,
    min_order_amount numeric(10, 2) DEFAULT 0,
    tax_rate numeric(5, 4) DEFAULT 0,
    logo_url text,
    banner_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS operating_hours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time time NOT NULL,
    close_time time NOT NULL,
    is_closed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (restaurant_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS delivery_zones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    polygon jsonb,
    center_latitude numeric(10, 8),
    center_longitude numeric(11, 8),
    radius_km numeric(6, 2),
    delivery_fee numeric(10, 2) DEFAULT 0,
    min_order_amount numeric(10, 2) DEFAULT 0,
    estimated_delivery_minutes integer DEFAULT 45,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_zone_postal_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_zone_id uuid NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
    postal_code varchar(20) NOT NULL,
    city varchar(100),
    created_at timestamptz DEFAULT now(),
    UNIQUE (delivery_zone_id, postal_code)
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    image_url text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    available_from time,
    available_until time,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
    name varchar(255) NOT NULL,
    description text,
    price numeric(10, 2) NOT NULL,
    compare_at_price numeric(10, 2),
    sku varchar(100),
    image_url text,
    thumbnail_url text,
    calories integer,
    prep_time_minutes integer DEFAULT 15,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    is_vegetarian boolean DEFAULT false,
    is_vegan boolean DEFAULT false,
    is_gluten_free boolean DEFAULT false,
    is_spicy boolean DEFAULT false,
    allergens text[],
    tags text[],
    sort_order integer DEFAULT 0,
    stock_quantity integer,
    track_inventory boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_modifier_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    selection_type varchar(20) DEFAULT 'single' CHECK (selection_type IN ('single', 'multiple')),
    min_selections integer DEFAULT 0,
    max_selections integer DEFAULT 1,
    is_required boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_modifiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES menu_item_modifier_groups(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    price_adjustment numeric(10, 2) DEFAULT 0,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_modifier_group_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    modifier_group_id uuid NOT NULL REFERENCES menu_item_modifier_groups(id) ON DELETE CASCADE,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE (menu_item_id, modifier_group_id)
);

CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    email varchar(255) NOT NULL,
    phone varchar(50),
    first_name varchar(100),
    last_name varchar(100),
    password_hash text,
    is_guest boolean DEFAULT false,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    email_verified_at timestamptz,
    accepts_marketing boolean DEFAULT false,
    stripe_customer_id varchar(255),
    square_customer_id varchar(255),
    notes text,
    last_login_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (restaurant_id, email)
);

CREATE TABLE IF NOT EXISTS customer_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    label varchar(100),
    address_line1 varchar(255) NOT NULL,
    address_line2 varchar(255),
    city varchar(100) NOT NULL,
    state varchar(100),
    postal_code varchar(20),
    country varchar(100) DEFAULT 'JO',
    latitude numeric(10, 8),
    longitude numeric(11, 8),
    delivery_zone_id uuid REFERENCES delivery_zones(id) ON DELETE SET NULL,
    is_default boolean DEFAULT false,
    delivery_instructions text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
    session_token varchar(255),
    order_type varchar(20) DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup', 'dine_in')),
    delivery_address_id uuid REFERENCES customer_addresses(id) ON DELETE SET NULL,
    delivery_zone_id uuid REFERENCES delivery_zones(id) ON DELETE SET NULL,
    promo_code varchar(100),
    discount_amount numeric(10, 2) DEFAULT 0,
    special_instructions text,
    scheduled_for timestamptz,
    expires_at timestamptz DEFAULT

-- Schema for: Real-Time Operational Dashboard
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    address text,
    timezone varchar(100) NOT NULL DEFAULT 'UTC',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    category_id uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
    name varchar(255) NOT NULL,
    description text,
    selling_price numeric(10, 2) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    is_flagged_high_cost boolean NOT NULL DEFAULT false,
    high_cost_flagged_at timestamptz,
    high_cost_flag_reason text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    unit_of_measure varchar(50) NOT NULL,
    unit_cost numeric(10, 4) NOT NULL DEFAULT 0,
    current_stock numeric(12, 4) NOT NULL DEFAULT 0,
    reorder_threshold numeric(12, 4),
    supplier varchar(255),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_used numeric(12, 4) NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (menu_item_id, inventory_item_id)
);

CREATE TABLE IF NOT EXISTS shifts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    shift_name varchar(100) NOT NULL,
    shift_date date NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz,
    manager_id uuid,
    manager_name varchar(255),
    notes text,
    is_closed boolean NOT NULL DEFAULT false,
    closed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    shift_id uuid REFERENCES shifts(id) ON DELETE SET NULL,
    order_number varchar(100) NOT NULL,
    order_source varchar(100),
    status varchar(50) NOT NULL DEFAULT 'pending',
    subtotal numeric(10, 2) NOT NULL DEFAULT 0,
    tax_amount numeric(10, 2) NOT NULL DEFAULT 0,
    discount_amount numeric(10, 2) NOT NULL DEFAULT 0,
    total_amount numeric(10, 2) NOT NULL DEFAULT 0,
    total_food_cost numeric(10, 2) NOT NULL DEFAULT 0,
    gross_margin numeric(10, 2) GENERATED ALWAYS AS (total_amount - total_food_cost) STORED,
    gross_margin_pct numeric(6, 4),
    ordered_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    voided_at timestamptz,
    void_reason text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    menu_item_name varchar(255) NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric(10, 2) NOT NULL,
    unit_food_cost numeric(10, 2) NOT NULL DEFAULT 0,
    line_total numeric(10, 2) NOT NULL,
    line_food_cost numeric(10, 2) NOT NULL DEFAULT 0,
    line_gross_margin numeric(10, 2) GENERATED ALWAYS AS (line_total - line_food_cost) STORED,
    line_gross_margin_pct numeric(6, 4),
    discount_amount numeric(10, 2) NOT NULL DEFAULT 0,
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_cost_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    selling_price numeric(10, 2) NOT NULL,
    total_food_cost numeric(10, 2) NOT NULL,
    gross_margin numeric(10, 2) NOT NULL,
    gross_margin_pct numeric(6, 4) NOT NULL,
    food_cost_pct numeric(6, 4) NOT NULL,
    is_high_cost boolean NOT NULL DEFAULT false,
    high_cost_threshold_pct numeric(6, 4),
    snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shift_summaries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id uuid NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    shift_date date NOT NULL,
    shift_name varchar(100) NOT NULL,
    total_orders integer NOT NULL DEFAULT 0,
    voided_orders integer NOT NULL DEFAULT 0,
    gross_revenue numeric(12, 2) NOT NULL DEFAULT 0,
    net_revenue numeric(12, 2) NOT NULL DEFAULT 0,
    total_discounts numeric(12, 2) NOT NULL DEFAULT 0,
    total_tax numeric(12, 2) NOT NULL DEFAULT 0,
    total_food_cost numeric(12, 2) NOT NULL DEFAULT 0,
    gross_margin numeric(12, 2) NOT NULL DEFAULT 0,
    gross_margin_pct numeric(6, 4),
    food_cost_pct numeric(6, 4),
    average_ticket_size numeric(10, 2),
    total_items_sold integer NOT NULL DEFAULT 0,
    top_selling_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
    top_selling_item_name varchar(255),
    highest_cost_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
    highest_cost_item_name varchar(255),
    highest_cost_item_food_cost_pct numeric(6, 4),
    flagged_items_count integer NOT NULL DEFAULT 0,
    computed_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_revenue_summaries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    summary_date date NOT NULL,
    total_orders integer NOT NULL DEFAULT 0,
    voided_orders integer NOT NULL DEFAULT 0,
    gross_revenue numeric(12, 2) NOT NULL DEFAULT 0,
    net_revenue numeric(12, 2) NOT NULL DEFAULT 0,
    total_discounts numeric(12, 2) NOT NULL DEFAULT 0,
    total_tax numeric(12, 2) NOT NULL DEFAULT 0,
    total_food_cost numeric(12, 2) NOT NULL DEFAULT 0,
    gross_margin numeric(12, 2) NOT NULL DEFAULT 0,
    gross_margin_pct numeric(6, 4),