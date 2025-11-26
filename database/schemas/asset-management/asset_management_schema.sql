-- =====================================================
-- ASSET MANAGEMENT SCHEMA FOR MULTI-TENANT SAAS
-- Comprehensive integration of asset management fundamentals
-- =====================================================

-- 1. Tenant Assets Registry
CREATE TABLE IF NOT EXISTS tenant_assets (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    asset_type VARCHAR(100) NOT NULL, -- building, equipment, digital, vehicle, furniture
    asset_name VARCHAR(200) NOT NULL,
    asset_category VARCHAR(100), -- HVAC, electrical, plumbing, IT, office equipment
    location JSONB, -- coordinates, address, building/floor/room
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    warranty_info JSONB,
    maintenance_schedule JSONB,
    current_value DECIMAL(12,2),
    depreciation_rate DECIMAL(5,2),
    condition_status VARCHAR(50), -- excellent, good, fair, poor
    status VARCHAR(50), -- active, inactive, retired, disposed
    manufacturer VARCHAR(200),
    model VARCHAR(200),
    serial_number VARCHAR(200),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 2. Work Orders & Maintenance
CREATE TABLE IF NOT EXISTS work_orders (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    asset_id INTEGER REFERENCES tenant_assets(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL, -- low, medium, high, emergency
    status VARCHAR(20) NOT NULL, -- pending, assigned, in_progress, completed, cancelled
    assigned_to VARCHAR(100),
    requested_by VARCHAR(100),
    scheduled_date TIMESTAMP,
    due_date TIMESTAMP,
    completed_date TIMESTAMP,
    cost DECIMAL(10,2),
    vendor_id INTEGER,
    vendor_name VARCHAR(200),
    labor_hours DECIMAL(6,2),
    materials_cost DECIMAL(10,2),
    attachments JSONB,
    resolution_notes TEXT,
    feedback_rating INTEGER, -- 1-5 stars
    feedback_comments TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Vendor Management
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    vendor_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(50),
    address TEXT,
    specialties JSONB, -- array of services
    rating DECIMAL(3,2),
    total_work_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tenant Communications & Engagement
CREATE TABLE IF NOT EXISTS tenant_communications (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    user_id VARCHAR(100),
    channel VARCHAR(50) NOT NULL, -- email, chat, sms, portal, phone
    message_type VARCHAR(50) NOT NULL, -- announcement, notification, alert, request, feedback
    subject VARCHAR(200),
    content TEXT NOT NULL,
    priority VARCHAR(20), -- low, normal, high, urgent
    attachments JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    responded_at TIMESTAMP,
    response_time_hours DECIMAL(6,2),
    satisfaction_rating INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tenant Events & Community
CREATE TABLE IF NOT EXISTS tenant_events (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    event_title VARCHAR(200) NOT NULL,
    event_description TEXT,
    event_type VARCHAR(50), -- social, training, community, meeting, workshop
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(200),
    organizer VARCHAR(200),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    registration_required BOOLEAN DEFAULT false,
    event_link TEXT,
    is_public BOOLEAN DEFAULT false,
    tags JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. ESG & Sustainability Tracking
CREATE TABLE IF NOT EXISTS sustainability_metrics (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    metric_type VARCHAR(100) NOT NULL, -- energy_electricity, energy_gas, water, waste, carbon_emissions
    measurement_date DATE NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- kWh, therms, gallons, tons, tons_co2
    cost DECIMAL(10,2),
    source VARCHAR(200), -- sensor, manual, third_party, estimate
    device_id INTEGER, -- IoT device reference
    baseline_value DECIMAL(10,2), -- for comparison
    target_value DECIMAL(10,2),
    reduction_percentage DECIMAL(5,2),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Energy Management & IoT Integration
CREATE TABLE IF NOT EXISTS iot_devices (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    device_name VARCHAR(200) NOT NULL,
    device_type VARCHAR(100) NOT NULL, -- sensor, controller, actuator, gateway
    device_category VARCHAR(100) NOT NULL, -- hvac, lighting, security, energy, water, air_quality
    manufacturer VARCHAR(200),
    model VARCHAR(200),
    serial_number VARCHAR(200),
    mac_address VARCHAR(100),
    ip_address VARCHAR(50),
    location JSONB,
    firmware_version VARCHAR(50),
    connection_status VARCHAR(20), -- online, offline, error, maintenance
    battery_level INTEGER, -- 0-100
    last_seen_at TIMESTAMP,
    data_update_frequency INTEGER, -- seconds
    calibration_date DATE,
    warranty_expiry DATE,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Real-time Energy Consumption
CREATE TABLE IF NOT EXISTS energy_consumption (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    device_id INTEGER REFERENCES iot_devices(id),
    energy_type VARCHAR(50) NOT NULL, -- electricity, gas, water, steam
    measurement_date DATE NOT NULL,
    measurement_time TIMESTAMP NOT NULL,
    consumption_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- kWh, therms, gallons
    cost DECIMAL(10,2),
    peak_hours_flag BOOLEAN,
    demand_kw DECIMAL(10,2),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Financial Management
CREATE TABLE IF NOT EXISTS tenant_finances (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    category VARCHAR(100) NOT NULL, -- revenue, expense, investment, loan
    subcategory VARCHAR(100),
    transaction_type VARCHAR(50), -- income, expense, transfer, adjustment
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    transaction_date DATE NOT NULL,
    description TEXT,
    related_asset_id INTEGER REFERENCES tenant_assets(id),
    related_work_order_id INTEGER REFERENCES work_orders(id),
    vendor_id INTEGER REFERENCES vendors(id),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50), -- pending, paid, overdue, cancelled
    invoice_number VARCHAR(100),
    receipt_url TEXT,
    budget_category VARCHAR(100),
    fiscal_year INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Compliance & Documentation
CREATE TABLE IF NOT EXISTS compliance_records (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    record_type VARCHAR(100) NOT NULL, -- permit, license, certificate, inspection, audit
    document_name VARCHAR(200) NOT NULL,
    issuing_authority VARCHAR(200) NOT NULL,
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    renewal_date DATE,
    status VARCHAR(50) NOT NULL, -- current, expired, pending_renewal, cancelled
    compliance_standard VARCHAR(100), -- OSHA, LEED, ADA, local_building_code
    required_actions TEXT,
    last_inspection_date DATE,
    next_inspection_date DATE,
    document_url TEXT,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. Risk Management & Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    incident_type VARCHAR(100) NOT NULL, -- safety, security, property_damage, system_failure
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location JSONB,
    reported_by VARCHAR(200),
    reported_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL, -- reported, investigating, resolved, closed
    assigned_to VARCHAR(200),
    resolution_description TEXT,
    resolved_at TIMESTAMP,
    preventive_measures TEXT,
    cost_impact DECIMAL(10,2),
    attachments JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 12. Knowledge Base Categories (Enhanced)
CREATE TABLE IF NOT EXISTS kb_categories (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    category_name VARCHAR(100) NOT NULL,
    parent_category_id INTEGER REFERENCES kb_categories(id),
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add new columns to existing knowledge_base_files table
ALTER TABLE knowledge_base_files ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES kb_categories(id);
ALTER TABLE knowledge_base_files ADD COLUMN IF NOT EXISTS file_tags JSONB DEFAULT '[]';
ALTER TABLE knowledge_base_files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE knowledge_base_files ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_assets_tenant ON tenant_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_assets_type ON tenant_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_tenant_assets_status ON tenant_assets(status);

CREATE INDEX IF NOT EXISTS idx_work_orders_tenant ON work_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_due_date ON work_orders(due_date);

CREATE INDEX IF NOT EXISTS idx_communications_tenant ON tenant_communications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_communications_read ON tenant_communications(is_read);
CREATE INDEX IF NOT EXISTS idx_communications_type ON tenant_communications(message_type);

CREATE INDEX IF NOT EXISTS idx_sustainability_tenant ON sustainability_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_date ON sustainability_metrics(measurement_date);
CREATE INDEX IF NOT EXISTS idx_sustainability_type ON sustainability_metrics(metric_type);

CREATE INDEX IF NOT EXISTS idx_iot_devices_tenant ON iot_devices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_status ON iot_devices(connection_status);

CREATE INDEX IF NOT EXISTS idx_energy_consumption_tenant ON energy_consumption(tenant_id, measurement_date);

CREATE INDEX IF NOT EXISTS idx_compliance_tenant ON compliance_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON compliance_records(status);
CREATE INDEX IF NOT EXISTS idx_compliance_expiry ON compliance_records(expiry_date);

CREATE INDEX IF NOT EXISTS idx_incidents_tenant ON incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);

-- Enable RLS on all new tables
ALTER TABLE tenant_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY tenant_assets_isolation ON tenant_assets
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY work_orders_isolation ON work_orders
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY vendors_isolation ON vendors
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        tenant_id IS NULL OR
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY tenant_communications_isolation ON tenant_communications
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY tenant_events_isolation ON tenant_events
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY sustainability_metrics_isolation ON sustainability_metrics
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY iot_devices_isolation ON iot_devices
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY energy_consumption_isolation ON energy_consumption
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY tenant_finances_isolation ON tenant_finances
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY compliance_records_isolation ON compliance_records
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY incidents_isolation ON incidents
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY kb_categories_isolation ON kb_categories
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        tenant_id IS NULL OR
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

-- Update existing knowledge_base_files policy
DROP POLICY IF EXISTS knowledge_base_files_tenant_isolation ON knowledge_base_files;
CREATE POLICY knowledge_base_files_tenant_isolation ON knowledge_base_files
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        tenant_id IS NULL OR
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

-- Create sample data for testing
INSERT INTO kb_categories (tenant_id, category_name, description, sort_order) VALUES
    (NULL, 'Asset Management', 'Asset tracking and maintenance', 1),
    (NULL, 'Sustainability', 'ESG metrics and green practices', 2),
    (NULL, 'Compliance', 'Regulatory requirements and documentation', 3),
    (NULL, 'Operations', 'Day-to-day facility management', 4),
    (NULL, 'Finance', 'Budgeting, accounting, and reporting', 5)
ON CONFLICT DO NOTHING;

SELECT 'Asset Management Schema Created Successfully!' as status;
