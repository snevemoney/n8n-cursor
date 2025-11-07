-- =====================================================
// DATABASE HELPER FUNCTIONS FOR ASSET MANAGEMENT
-- Comprehensive functions for frontend integration
-- =====================================================

-- 1. Get Tenant Asset Summary
CREATE OR REPLACE FUNCTION get_tenant_asset_summary(p_tenant_id VARCHAR(50))
RETURNS TABLE(
    total_assets BIGINT,
    by_type JSONB,
    by_status JSONB,
    total_value DECIMAL,
    upcoming_maintenance BIGINT,
    overdue_maintenance BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_assets,
        jsonb_object_agg(asset_type, count) FILTER (WHERE count > 0) as by_type,
        jsonb_object_agg(status, count) FILTER (WHERE status IS NOT NULL) as by_status,
        COALESCE(SUM(current_value), 0) as total_value,
        COUNT(*) FILTER (WHERE status = 'needs_maintenance') as upcoming_maintenance,
        COUNT(*) FILTER (WHERE status = 'urgent_maintenance') as overdue_maintenance
    FROM (
        SELECT asset_type, status, current_value, COUNT(*) as count
        FROM tenant_assets
        WHERE tenant_id = p_tenant_id
        GROUP BY asset_type, status, current_value
    ) asset_summary;
END;
$$ LANGUAGE plpgsql;

-- 2. Get Work Order Dashboard
CREATE OR REPLACE FUNCTION get_work_order_dashboard(p_tenant_id VARCHAR(50))
RETURNS TABLE(
    total_orders BIGINT,
    by_status JSONB,
    by_priority JSONB,
    average_completion_time DECIMAL,
    pending_cost DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_orders,
        jsonb_object_agg(status, count) FILTER (WHERE status IS NOT NULL) as by_status,
        jsonb_object_agg(priority, count) FILTER (WHERE priority IS NOT NULL) as by_priority,
        AVG(EXTRACT(EPOCH FROM (completed_date - created_at))/3600) as average_completion_time,
        COALESCE(SUM(cost), 0) FILTER (WHERE status != 'completed') as pending_cost
    FROM (
        SELECT status, priority, cost, created_at, completed_date, COUNT(*) as count
        FROM work_orders
        WHERE tenant_id = p_tenant_id
        GROUP BY status, priority, cost, created_at, completed_date
    ) wo_summary;
END;
$$ LANGUAGE plpgsql;

-- 3. Get Sustainability Dashboard
CREATE OR REPLACE FUNCTION get_sustainability_dashboard(p_tenant_id VARCHAR(50), p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    metric_type VARCHAR,
    current_value DECIMAL,
    baseline_value DECIMAL,
    target_value DECIMAL,
    reduction_percentage DECIMAL,
    trend VARCHAR,
    last_recorded TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sm.metric_type,
        AVG(sm.value) as current_value,
        MAX(sm.baseline_value) as baseline_value,
        MAX(sm.target_value) as target_value,
        ((MAX(sm.baseline_value) - AVG(sm.value)) / NULLIF(MAX(sm.baseline_value), 0) * 100) as reduction_percentage,
        CASE 
            WHEN AVG(sm.value) < MAX(sm.baseline_value) THEN 'improving'
            WHEN AVG(sm.value) = MAX(sm.baseline_value) THEN 'stable'
            ELSE 'needs_attention'
        END as trend,
        MAX(sm.measurement_date) as last_recorded
    FROM sustainability_metrics sm
    WHERE sm.tenant_id = p_tenant_id
    AND sm.measurement_date >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY sm.metric_type;
END;
$$ LANGUAGE plpgsql;

-- 4. Get Expiring Compliance Records
CREATE OR REPLACE FUNCTION get_expiring_compliance(p_tenant_id VARCHAR(50), p_days_ahead INTEGER DEFAULT 90)
RETURNS TABLE(
    id INTEGER,
    record_type VARCHAR,
    document_name VARCHAR,
    issuing_authority VARCHAR,
    expiry_date DATE,
    days_until_expiry INTEGER,
    status VARCHAR,
    required_actions TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cr.id,
        cr.record_type,
        cr.document_name,
        cr.issuing_authority,
        cr.expiry_date,
        cr.expiry_date - CURRENT_DATE as days_until_expiry,
        cr.status,
        cr.required_actions
    FROM compliance_records cr
    WHERE cr.tenant_id = p_tenant_id
    AND cr.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL
    AND cr.status = 'current'
    ORDER BY cr.expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. Get Financial Summary
CREATE OR REPLACE FUNCTION get_financial_summary(p_tenant_id VARCHAR(50), p_start_date DATE, p_end_date DATE)
RETURNS TABLE(
    category VARCHAR,
    total_income DECIMAL,
    total_expenses DECIMAL,
    net_amount DECIMAL,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tf.category,
        COALESCE(SUM(CASE WHEN tf.transaction_type = 'income' THEN tf.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN tf.transaction_type = 'expense' THEN tf.amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN tf.transaction_type = 'income' THEN tf.amount ELSE -tf.amount END), 0) as net_amount,
        COUNT(*) as transaction_count
    FROM tenant_finances tf
    WHERE tf.tenant_id = p_tenant_id
    AND tf.transaction_date BETWEEN p_start_date AND p_end_date
    GROUP BY tf.category;
END;
$$ LANGUAGE plpgsql;

-- 6. Get IoT Device Status Summary
CREATE OR REPLACE FUNCTION get_iot_status_summary(p_tenant_id VARCHAR(50))
RETURNS TABLE(
    device_category VARCHAR,
    total_devices BIGINT,
    online_devices BIGINT,
    offline_devices BIGINT,
    error_devices BIGINT,
    avg_battery_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id.device_category,
        COUNT(*) as total_devices,
        COUNT(*) FILTER (WHERE id.connection_status = 'online') as online_devices,
        COUNT(*) FILTER (WHERE id.connection_status = 'offline') as offline_devices,
        COUNT(*) FILTER (WHERE id.connection_status = 'error') as error_devices,
        AVG(id.battery_level)::INTEGER as avg_battery_level
    FROM iot_devices id
    WHERE id.tenant_id = p_tenant_id
    GROUP BY id.device_category;
END;
$$ LANGUAGE plpgsql;

-- 7. Get Knowledge Base Categories with File Count
CREATE OR REPLACE FUNCTION get_kb_categories_with_count(p_tenant_id VARCHAR(50))
RETURNS TABLE(
    category_id INTEGER,
    category_name VARCHAR,
    description TEXT,
    file_count BIGINT,
    total_size BIGINT,
    icon VARCHAR,
    color VARCHAR,
    sort_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kbc.id as category_id,
        kbc.category_name,
        kbc.description,
        COUNT(kbf.id) as file_count,
        COALESCE(SUM(kbf.file_size), 0) as total_size,
        kbc.icon,
        kbc.color,
        kbc.sort_order
    FROM kb_categories kbc
    LEFT JOIN knowledge_base_files kbf ON kbc.id = kbf.category_id
    WHERE (kbc.tenant_id IS NULL OR kbc.tenant_id = p_tenant_id)
    AND kbc.is_active = true
    GROUP BY kbc.id, kbc.category_name, kbc.description, kbc.icon, kbc.color, kbc.sort_order
    ORDER BY kbc.sort_order ASC;
END;
$$ LANGUAGE plpgsql;

-- 8. Get Asset Maintenance Schedule
CREATE OR REPLACE FUNCTION get_asset_maintenance_schedule(p_tenant_id VARCHAR(50), p_days_ahead INTEGER DEFAULT 90)
RETURNS TABLE(
    asset_id INTEGER,
    asset_name VARCHAR,
    asset_type VARCHAR,
    maintenance_type VARCHAR,
    scheduled_date DATE,
    days_until_due INTEGER,
    priority VARCHAR,
    estimated_cost DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ta.id as asset_id,
        ta.asset_name,
        ta.asset_type,
        (ta.maintenance_schedule->'type')::VARCHAR as maintenance_type,
        (ta.maintenance_schedule->'next_date')::DATE as scheduled_date,
        ((ta.maintenance_schedule->'next_date')::DATE - CURRENT_DATE) as days_until_due,
        (ta.maintenance_schedule->'priority')::VARCHAR as priority,
        (ta.maintenance_schedule->'estimated_cost')::DECIMAL as estimated_cost
    FROM tenant_assets ta
    WHERE ta.tenant_id = p_tenant_id
    AND ta.maintenance_schedule IS NOT NULL
    AND (ta.maintenance_schedule->'next_date')::DATE BETWEEN CURRENT_DATE AND CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL
    AND ta.status IN ('active', 'needs_maintenance')
    ORDER BY (ta.maintenance_schedule->'next_date')::DATE ASC;
END;
$$ LANGUAGE plpgsql;

SELECT 'Asset Management Functions Created Successfully!' as status;
