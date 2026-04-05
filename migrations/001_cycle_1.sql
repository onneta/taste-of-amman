-- ONI Generated Migration — Cycle 1
-- Generated: 2026-04-05T03:20:39.389Z

-- Schema for: Online ordering system with payment processing and delivery management
CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    phone varchar(20),
    password_hash text NOT NULL,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    label varchar(50),
    address_line1 varchar(255) NOT NULL,
    address_line2 varchar(255),
    city varchar(100) NOT NULL,
    district varchar(100),
    postal_code varchar(20),
    latitude numeric(10, 7),
    longitude numeric(10, 7),
    is_default boolean DEFAULT false,
    delivery_instructions text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    image_url text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    name varchar(150) NOT NULL,
    description text,
    price numeric(10, 2) NOT NULL CHECK (price >= 0),
    discount_price numeric(10, 2) CHECK (discount_price >= 0),
    image_url text,
    calories integer,
    preparation_time_minutes integer,
    is_available boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    is_vegetarian boolean DEFAULT false,
    is_vegan boolean DEFAULT false,
    contains_allergens text[],
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name varchar(100) NOT NULL,
    is_required boolean DEFAULT false,
    min_selections integer DEFAULT 0,
    max_selections integer DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_option_choices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id uuid NOT NULL REFERENCES menu_item_options(id) ON DELETE CASCADE,
    name varchar(100) NOT NULL,
    additional_price numeric(10, 2) DEFAULT 0.00,
    is_available boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(50) UNIQUE NOT NULL,
    description text,
    discount_type varchar(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value numeric(10, 2) NOT NULL CHECK (discount_value > 0),
    minimum_order_amount numeric(10, 2) DEFAULT 0.00,
    maximum_discount_amount numeric(10, 2),
    usage_limit integer,
    usage_count integer DEFAULT 0,
    valid_from timestamptz NOT NULL,
    valid_until timestamptz NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number varchar(20) UNIQUE NOT NULL,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status varchar(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'preparing', 'ready_for_pickup',
        'out_for_delivery', 'delivered', 'cancelled', 'refunded'
    )),
    order_type varchar(20) NOT NULL CHECK (order_type IN ('delivery', 'pickup')),
    delivery_address_id uuid REFERENCES customer_addresses(id) ON DELETE SET NULL,
    delivery_address_snapshot jsonb,
    subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee numeric(10, 2) DEFAULT 0.00,
    tax_amount numeric(10, 2) DEFAULT 0.00,
    discount_amount numeric(10, 2) DEFAULT 0.00,
    total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
    promo_code_id uuid REFERENCES promo_codes(id) ON DELETE SET NULL,
    promo_code_used varchar(50),
    special_instructions text,
    estimated_delivery_time timestamptz,
    scheduled_at timestamptz,
    confirmed_at timestamptz,
    ready_at timestamptz,
    delivered_at timestamptz,
    cancelled_at timestamptz,
    cancellation_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    menu_item_name varchar(150) NOT NULL,
    unit_price numeric(10, 2) NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    line_total numeric(10, 2) NOT NULL,
    special_instructions text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_item_selections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    option_id uuid REFERENCES menu_item_options(id) ON DELETE SET NULL,
    option_name varchar(100) NOT NULL,
    choice_id uuid REFERENCES menu_item_option_choices(id) ON DELETE SET NULL,
    choice_name varchar(100) NOT NULL,
    additional_price numeric(10, 2) DEFAULT 0.00,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    payment_method varchar(30) NOT NULL CHECK (payment_method IN (
        'credit_card', 'debit_card', 'cash_on_delivery', 'digital_wallet', 'bank_transfer'
    )),
    payment_status varchar(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'
    )),
    amount numeric(10, 2) NOT NULL CHECK (amount > 0),
    currency varchar(3) DEFAULT 'JOD',
    gateway_name varchar(50),
    gateway_transaction_id varchar(255),
    gateway_reference varchar(255),
    gateway_response jsonb,
    card_last_four varchar(4),
    card_brand varchar(20),
    is_refunded boolean DEFAULT false,
    refunded_amount numeric(10, 2) DEFAULT 0.00,
    refunded_at timestamptz,
    refund_reason text,
    paid_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_zones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    delivery_fee numeric(10, 2) NOT NULL DEFAULT 0.00,
    minimum_order_amount