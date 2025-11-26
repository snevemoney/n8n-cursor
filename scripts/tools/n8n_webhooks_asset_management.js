// =====================================================
// N8N WEBHOOK ENDPOINTS FOR ASSET MANAGEMENT
// Comprehensive integration with frontend
// =====================================================

// 1. ASSET MANAGEMENT WEBHOOKS
module.exports = {
  // Asset Operations
  assetManagement: {
    // Get all assets for a tenant
    getAllAssets: {
      webhook: "/webhook/assets",
      method: "GET",
      query: `SELECT * FROM tenant_assets WHERE tenant_id = '{{ $json.tenantId }}' ORDER BY created_at DESC;`
    },
    
    // Get single asset
    getAsset: {
      webhook: "/webhook/asset/:assetId",
      method: "GET", 
      query: `SELECT * FROM tenant_assets WHERE id = {{ $json.assetId }} AND tenant_id = '{{ $json.tenantId }}';`
    },
    
    // Add new asset
    addAsset: {
      webhook: "/webhook/assets",
      method: "POST",
      query: `INSERT INTO tenant_assets (tenant_id, asset_type, asset_name, asset_category, location, purchase_date, purchase_price, manufacturer, model, serial_number, condition_status, status) 
              VALUES ('{{ $json.tenantId }}', '{{ $json.assetType }}', '{{ $json.assetName }}', '{{ $json.assetCategory }}', 
                      '{{ $json.location }}'::jsonb, '{{ $json.purchaseDate }}', {{ $json.purchasePrice }}, 
                      '{{ $json.manufacturer }}', '{{ $json.model }}', '{{ $json.serialNumber }}', 
                      '{{ $json.conditionStatus }}', '{{ $json.status }}') 
              RETURNING *;`
    },
    
    // Update asset
    updateAsset: {
      webhook: "/webhook/asset/:assetId",
      method: "PUT",
      query: `UPDATE tenant_assets 
              SET asset_name = '{{ $json.assetName }}', 
                  location = '{{ $json.location }}'::jsonb,
                  condition_status = '{{ $json.conditionStatus }}',
                  status = '{{ $json.status }}',
                  updated_at = NOW()
              WHERE id = {{ $json.assetId }} AND tenant_id = '{{ $json.tenantId }}' 
              RETURNING *;`
    },
    
    // Delete asset
    deleteAsset: {
      webhook: "/webhook/asset/:assetId",
      method: "DELETE",
      query: `DELETE FROM tenant_assets WHERE id = {{ $json.assetId }} AND tenant_id = '{{ $json.tenantId }}';`
    }
  },

  // Work Order Operations
  workOrders: {
    // Get all work orders
    getAllWorkOrders: {
      webhook: "/webhook/work-orders",
      method: "GET",
      query: `SELECT wo.*, ta.asset_name 
              FROM work_orders wo 
              LEFT JOIN tenant_assets ta ON wo.asset_id = ta.id 
              WHERE wo.tenant_id = '{{ $json.tenantId }}' 
              ORDER BY wo.created_at DESC;`
    },
    
    // Create work order
    createWorkOrder: {
      webhook: "/webhook/work-orders",
      method: "POST",
      query: `INSERT INTO work_orders (tenant_id, asset_id, title, description, priority, status, requested_by, scheduled_date, due_date) 
              VALUES ('{{ $json.tenantId }}', {{ $json.assetId }}, '{{ $json.title }}', '{{ $json.description }}', 
                      '{{ $json.priority }}', 'pending', '{{ $json.requestedBy }}', 
                      '{{ $json.scheduledDate }}', '{{ $json.dueDate }}') 
              RETURNING *;`
    },
    
    // Update work order status
    updateWorkOrderStatus: {
      webhook: "/webhook/work-order/:workOrderId/status",
      method: "PUT",
      query: `UPDATE work_orders 
              SET status = '{{ $json.status }}',
                  completed_date = CASE WHEN '{{ $json.status }}' = 'completed' THEN NOW() ELSE completed_date END,
                  resolution_notes = '{{ $json.resolutionNotes }}',
                  updated_at = NOW()
              WHERE id = {{ $json.workOrderId }} AND tenant_id = '{{ $json.tenantId }}' 
              RETURNING *;`
    }
  },

  // Sustainability Metrics
  sustainability: {
    // Get all sustainability metrics
    getMetrics: {
      webhook: "/webhook/sustainability-metrics",
      method: "GET",
      query: `SELECT * FROM sustainability_metrics 
              WHERE tenant_id = '{{ $json.tenantId }}' 
              ORDER BY measurement_date DESC;`
    },
    
    // Add sustainability metric
    addMetric: {
      webhook: "/webhook/sustainability-metrics",
      method: "POST",
      query: `INSERT INTO sustainability_metrics (tenant_id, metric_type, measurement_date, value, unit, source, device_id, baseline_value, target_value) 
              VALUES ('{{ $json.tenantId }}', '{{ $json.metricType }}', '{{ $json.measurementDate }}', 
                      {{ $json.value }}, '{{ $json.unit }}', '{{ $json.source }}', 
                      {{ $json.deviceId }}, {{ $json.baselineValue }}, {{ $json.targetValue }}) 
              RETURNING *;`
    },
    
    // Get sustainability dashboard data
    getDashboard: {
      webhook: "/webhook/sustainability-dashboard",
      method: "GET",
      query: `SELECT 
                metric_type,
                SUM(value) as total_value,
                AVG(value) as avg_value,
                MIN(value) as min_value,
                MAX(value) as max_value,
                COUNT(*) as record_count,
                MAX(measurement_date) as last_recorded
              FROM sustainability_metrics 
              WHERE tenant_id = '{{ $json.tenantId }}' 
              AND measurement_date >= NOW() - INTERVAL '30 days'
              GROUP BY metric_type;`
    }
  },

  // IoT Device Management
  iotDevices: {
    // Get all IoT devices
    getDevices: {
      webhook: "/webhook/iot-devices",
      method: "GET",
      query: `SELECT * FROM iot_devices WHERE tenant_id = '{{ $json.tenantId }}' ORDER BY device_category, device_name;`
    },
    
    // Add IoT device
    addDevice: {
      webhook: "/webhook/iot-devices",
      method: "POST",
      query: `INSERT INTO iot_devices (tenant_id, device_name, device_type, device_category, manufacturer, model, serial_number, mac_address, ip_address, location) 
              VALUES ('{{ $json.tenantId }}', '{{ $json.deviceName }}', '{{ $json.deviceType }}', 
                      '{{ $json.deviceCategory }}', '{{ $json.manufacturer }}', '{{ $json.model }}', 
                      '{{ $json.serialNumber }}', '{{ $json.macAddress }}', '{{ $json.ipAddress }}', 
                      '{{ $json.location }}'::jsonb) 
              RETURNING *;`
    },
    
    // Update device status
    updateDeviceStatus: {
      webhook: "/webhook/iot-device/:deviceId/status",
      method: "PUT",
      query: `UPDATE iot_devices 
              SET connection_status = '{{ $json.status }}',
                  last_seen_at = NOW(),
                  battery_level = {{ $json.batteryLevel }},
                  updated_at = NOW()
              WHERE id = {{ $json.deviceId }} AND tenant_id = '{{ $json.tenantId }}' 
              RETURNING *;`
    }
  },

  // Compliance Management
  compliance: {
    // Get all compliance records
    getRecords: {
      webhook: "/webhook/compliance-records",
      method: "GET",
      query: `SELECT * FROM compliance_records 
              WHERE tenant_id = '{{ $json.tenantId }}' 
              ORDER BY expiry_date ASC;`
    },
    
    // Get expiring records
    getExpiringRecords: {
      webhook: "/webhook/compliance-records/expiring",
      method: "GET",
      query: `SELECT * FROM compliance_records 
              WHERE tenant_id = '{{ $json.tenantId }}' 
              AND expiry_date BETWEEN NOW() AND NOW() + INTERVAL '{{ $json.daysAhead }} days'
              AND status = 'current'
              ORDER BY expiry_date ASC;`
    },
    
    // Add compliance record
    addRecord: {
      webhook: "/webhook/compliance-records",
      method: "POST",
      query: `INSERT INTO compliance_records (tenant_id, record_type, document_name, issuing_authority, document_number, issue_date, expiry_date, renewal_date, status, compliance_standard, document_url) 
              VALUES ('{{ $json.tenantId }}', '{{ $json.recordType }}', '{{ $json.documentName }}', 
                      '{{ $json.issuingAuthority }}', '{{ $json.documentNumber }}', '{{ $json.issueDate }}', 
                      '{{ $json.expiryDate }}', '{{ $json.renewalDate }}', '{{ $json.status }}', 
                      '{{ $json.complianceStandard }}', '{{ $json.documentUrl }}') 
              RETURNING *;`
    }
  },

  // Financial Tracking
  finances: {
    // Get financial data
    getFinancials: {
      webhook: "/webhook/finances",
      method: "GET",
      query: `SELECT * FROM tenant_finances 
              WHERE tenant_id = '{{ $json.tenantId }}' 
              ORDER BY transaction_date DESC;`
    },
    
    // Get financial summary
    getSummary: {
      webhook: "/webhook/finances/summary",
      method: "GET",
      query: `SELECT 
                category,
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expenses,
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE -amount END) as net
              FROM tenant_finances 
              WHERE tenant_id = '{{ $json.tenantId }}' 
              AND transaction_date >= '{{ $json.startDate }}' 
              AND transaction_date <= '{{ $json.endDate }}'
              GROUP BY category;`
    },
    
    // Add financial transaction
    addTransaction: {
      webhook: "/webhook/finances",
      method: "POST",
      query: `INSERT INTO tenant_finances (tenant_id, category, subcategory, transaction_type, amount, currency, transaction_date, description, vendor_id, payment_method, payment_status, invoice_number) 
              VALUES ('{{ $json.tenantId }}', '{{ $json.category }}', '{{ $json.subcategory }}', 
                      '{{ $json.transactionType }}', {{ $json.amount }}, '{{ $json.currency }}', 
                      '{{ $json.transactionDate }}', '{{ $json.description }}', {{ $json.vendorId }}, 
                      '{{ $json.paymentMethod }}', '{{ $json.paymentStatus }}', '{{ $json.invoiceNumber }}') 
              RETURNING *;`
    }
  },

  // Tenant Communications
  communications: {
    // Get all communications
    getCommunications: {
      webhook: "/webhook/communications",
      method: "GET",
      query: `SELECT * FROM tenant_communications 
              WHERE tenant_id = '{{ $json.tenantId }}' 
              ORDER BY created_at DESC;`
    },
    
    // Mark communication as read
    markRead: {
      webhook: "/webhook/communication/:commId/read",
      method: "PUT",
      query: `UPDATE tenant_communications 
              SET is_read = true, read_at = NOW() 
              WHERE id = {{ $json.commId }} AND tenant_id = '{{ $json.tenantId }}' 
              RETURNING *;`
    },
    
    // Send communication
    sendCommunication: {
      webhook: "/webhook/communications",
      method: "POST",
      query: `INSERT INTO tenant_communications (tenant_id, user_id, channel, message_type, subject, content, priority) 
              VALUES ('{{ $json.tenantId }}', '{{ $json.userId }}', '{{ $json.channel }}', 
                      '{{ $json.messageType }}', '{{ $json.subject }}', '{{ $json.content }}', '{{ $json.priority }}') 
              RETURNING *;`
    }
  },

  // Events Management
  events: {
    // Get all events
    getEvents: {
      webhook: "/webhook/events",
      method: "GET",
      query: `SELECT * FROM tenant_events 
              WHERE tenant_id = '{{ $json.tenantId }}' 
              ORDER BY start_date ASC;`
    },
    
    // Create event
    createEvent: {
      webhook: "/webhook/events",
      method: "POST",
      query: `INSERT INTO tenant_events (tenant_id, event_title, event_description, event_type, start_date, end_date, location, organizer, max_attendees, registration_required) 
              VALUES ('{{ $json.tenantId }}', '{{ $json.eventTitle }}', '{{ $json.eventDescription }}', 
                      '{{ $json.eventType }}', '{{ $json.startDate }}', '{{ $json.endDate }}', 
                      '{{ $json.location }}', '{{ $json.organizer }}', {{ $json.maxAttendees }}, {{ $json.registrationRequired }}) 
              RETURNING *;`
    }
  },

  // Knowledge Base Categories
  kbCategories: {
    // Get all categories
    getCategories: {
      webhook: "/webhook/kb-categories",
      method: "GET",
      query: `SELECT * FROM kb_categories 
              WHERE tenant_id IS NULL OR tenant_id = '{{ $json.tenantId }}' 
              ORDER BY sort_order ASC;`
    },
    
    // Get files by category
    getFilesByCategory: {
      webhook: "/webhook/kb-files/:categoryId",
      method: "GET",
      query: `SELECT kbf.* 
              FROM knowledge_base_files kbf
              WHERE kbf.category_id = {{ $json.categoryId }} 
              AND (kbf.tenant_id IS NULL OR kbf.tenant_id = '{{ $json.tenantId }}')
              ORDER BY kbf.uploaded_at DESC;`
    }
  }
};

