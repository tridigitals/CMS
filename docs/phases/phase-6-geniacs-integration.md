# Phase 6: Geniacs Integration

## Overview

Fase 6 fokus pada integrasi dengan Geniacs untuk sinkronisasi data dan operasional otomatis. Fase ini mengintegrasikan semua modul yang telah dibangun (user management, customer management, monitoring, billing) dengan sistem Geniacs untuk menciptakan ekosistem yang terintegrasi penuh.

## Duration: 6 Weeks

### Week 1-3: Geniacs API Integration
### Week 4-5: Data Synchronization System
### Week 6: Automation & Final Testing

## Technical Requirements

### Dependencies
```json
{
  "backend": {
    "laravel/framework": "^10.0",
    "guzzlehttp/guzzle": "^7.5",
    "spatie/laravel-queueable-job": "^1.2",
    "spatie/laravel-backup": "^8.1",
    "laravel-websockets": "^1.13",
    "spatie/laravel-activitylog": "^4.7"
  },
  "frontend": {
    "react": "^18.2",
    "react-router-dom": "^6.8",
    "@tanstack/react-query": "^4.24",
    "axios": "^1.3",
    "react-hook-form": "^7.43",
    "react-table": "^7.8",
    "recharts": "^2.5",
    "date-fns": "^2.29"
  }
}
```

### External Services
- **Geniacs API**: Primary integration partner API
- **Webhook System**: Real-time data synchronization
- **Queue System**: Background processing for large data sets
- **Cache System**: Performance optimization for frequent data access
- **Logging System**: Comprehensive audit trail

## Database Schema

### Geniacs Integration Tables

#### geniacs_integrations
```sql
CREATE TABLE geniacs_integrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    endpoint_url VARCHAR(500) NOT NULL,
    api_version VARCHAR(20) DEFAULT 'v1',
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT NOT NULL,
    webhook_url VARCHAR(500) NULL,
    webhook_secret VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sync_enabled BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP NULL,
    last_webhook_received_at TIMESTAMP NULL,
    configuration JSON NULL,
    rate_limits JSON NULL,
    timeout_seconds INT DEFAULT 30,
    retry_attempts INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_geniacs_active (is_active),
    INDEX idx_geniacs_sync_enabled (sync_enabled),
    INDEX idx_geniacs_last_sync (last_sync_at)
);
```

#### geniacs_data_sync
```sql
CREATE TABLE geniacs_data_sync (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    integration_id BIGINT NOT NULL,
    sync_type ENUM('full', 'incremental', 'real_time', 'scheduled') NOT NULL,
    entity_type ENUM('customers', 'subscriptions', 'payments', 'monitoring_data', 'invoices', 'nas_servers') NOT NULL,
    entity_id BIGINT NOT NULL,
    sync_direction ENUM('to_geniacs', 'from_geniacs', 'bidirectional') NOT NULL,
    status ENUM('pending', 'processing', 'success', 'failed', 'partial') DEFAULT 'pending',
    data JSON NOT NULL,
    mapped_data JSON NULL,
    response_data JSON NULL,
    error_message TEXT NULL,
    retry_count INT DEFAULT 0,
    next_retry_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (integration_id) REFERENCES geniacs_integrations(id) ON DELETE CASCADE,
    
    INDEX idx_sync_integration (integration_id),
    INDEX idx_sync_type (sync_type),
    INDEX idx_sync_entity (entity_type, entity_id),
    INDEX idx_sync_status (status),
    INDEX idx_sync_direction (sync_direction),
    INDEX idx_sync_retry (next_retry_at)
);
```

#### geniacs_field_mappings
```sql
CREATE TABLE geniacs_field_mappings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    integration_id BIGINT NOT NULL,
    entity_type ENUM('customers', 'subscriptions', 'payments', 'monitoring_data', 'invoices', 'nas_servers') NOT NULL,
    local_field VARCHAR(255) NOT NULL,
    geniacs_field VARCHAR(255) NOT NULL,
    field_type ENUM('string', 'number', 'boolean', 'date', 'json') NOT NULL,
    transformation_rules JSON NULL,
    is_required BOOLEAN DEFAULT FALSE,
    default_value VARCHAR(255) NULL,
    validation_rules JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (integration_id) REFERENCES geniacs_integrations(id) ON DELETE CASCADE,
    
    INDEX idx_mappings_integration (integration_id),
    INDEX idx_mappings_entity (entity_type),
    INDEX idx_mappings_local (local_field),
    INDEX idx_mappings_geniacs (geniacs_field),
    INDEX idx_mappings_active (is_active)
);
```

#### geniacs_sync_logs
```sql
CREATE TABLE geniacs_sync_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    integration_id BIGINT NOT NULL,
    sync_id BIGINT NULL,
    log_level ENUM('debug', 'info', 'warning', 'error', 'critical') NOT NULL,
    message TEXT NOT NULL,
    context JSON NULL,
    request_data JSON NULL,
    response_data JSON NULL,
    duration_ms INT NULL,
    status_code INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (integration_id) REFERENCES geniacs_integrations(id) ON DELETE CASCADE,
    FOREIGN KEY (sync_id) REFERENCES geniacs_data_sync(id) ON DELETE SET NULL,
    
    INDEX idx_logs_integration (integration_id),
    INDEX idx_logs_sync (sync_id),
    INDEX idx_logs_level (log_level),
    INDEX idx_logs_created (created_at)
);
```

#### geniacs_webhook_events
```sql
CREATE TABLE geniacs_webhook_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    integration_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(255) NULL,
    payload JSON NOT NULL,
    signature VARCHAR(255) NULL,
    processed BOOLEAN DEFAULT FALSE,
    processing_attempts INT DEFAULT 0,
    error_message TEXT NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (integration_id) REFERENCES geniacs_integrations(id) ON DELETE CASCADE,
    
    INDEX idx_webhooks_integration (integration_id),
    INDEX idx_webhooks_type (event_type),
    INDEX idx_webhooks_processed (processed),
    INDEX idx_webhooks_created (created_at)
);
```

#### geniacs_sync_schedules
```sql
CREATE TABLE geniacs_sync_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    integration_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    entity_type ENUM('customers', 'subscriptions', 'payments', 'monitoring_data', 'invoices', 'nas_servers') NOT NULL,
    sync_type ENUM('full', 'incremental', 'real_time', 'scheduled') NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP NULL,
    next_run_at TIMESTAMP NOT NULL,
    configuration JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (integration_id) REFERENCES geniacs_integrations(id) ON DELETE CASCADE,
    
    INDEX idx_schedules_integration (integration_id),
    INDEX idx_schedules_entity (entity_type),
    INDEX idx_schedules_active (is_active),
    INDEX idx_schedules_next_run (next_run_at)
);
```

## API Design

### Geniacs Integration Endpoints

#### GET /api/geniacs/integrations
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: page, limit, is_active, sync_enabled

// Response
{
    "success": true,
    "data": {
        "integrations": [
            {
                "id": 1,
                "name": "Primary Geniacs Integration",
                "description": "Main integration with Geniacs API",
                "endpoint_url": "https://api.geniacs.com/v1",
                "api_version": "v1",
                "is_active": true,
                "sync_enabled": true,
                "last_sync_at": "2024-01-01T10:00:00Z",
                "last_webhook_received_at": "2024-01-01T09:45:00Z",
                "sync_status": {
                    "total_syncs": 1250,
                    "successful_syncs": 1200,
                    "failed_syncs": 50,
                    "pending_syncs": 0
                },
                "configuration": {
                    "auto_sync": true,
                    "sync_interval": "5m",
                    "retry_failed": true,
                    "max_retries": 3
                },
                "created_at": "2024-01-01T08:00:00Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 1,
            "total_items": 1,
            "per_page": 10
        }
    }
}
```

#### POST /api/geniacs/integrations
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "name": "New Geniacs Integration",
    "description": "Secondary integration for backup purposes",
    "endpoint_url": "https://api.geniacs.com/v1",
    "api_version": "v1",
    "api_key": "geniacs_api_key_12345",
    "api_secret": "geniacs_api_secret_67890",
    "webhook_url": "https://example.com/geniacs/webhook",
    "webhook_secret": "webhook_secret_abcdef",
    "is_active": true,
    "sync_enabled": true,
    "configuration": {
        "auto_sync": true,
        "sync_interval": "10m",
        "retry_failed": true,
        "max_retries": 5,
        "timeout_seconds": 60
    },
    "rate_limits": {
        "requests_per_minute": 100,
        "requests_per_hour": 1000,
        "requests_per_day": 10000
    }
}

// Response
{
    "success": true,
    "message": "Geniacs integration created successfully",
    "data": {
        "integration": {
            "id": 2,
            "name": "New Geniacs Integration",
            "endpoint_url": "https://api.geniacs.com/v1",
            "api_version": "v1",
            "is_active": true,
            "sync_enabled": true,
            "created_at": "2024-01-01T10:00:00Z"
        }
    }
}
```

#### POST /api/geniacs/integrations/{id}/test-connection
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "message": "Connection test successful",
    "data": {
        "connection_test": {
            "status": "success",
            "response_time": 245,
            "api_version": "v1.2.3",
            "rate_limits": {
                "remaining_requests": 95,
                "reset_time": "2024-01-01T11:00:00Z"
            },
            "supported_endpoints": [
                "/customers",
                "/subscriptions",
                "/payments",
                "/monitoring",
                "/invoices"
            ],
            "authentication": "valid",
            "tested_at": "2024-01-01T10:05:00Z"
        }
    }
}
```

#### POST /api/geniacs/sync/trigger
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "integration_id": 1,
    "sync_type": "incremental",
    "entity_type": "customers",
    "sync_direction": "to_geniacs",
    "filters": {
        "updated_since": "2024-01-01T00:00:00Z",
        "customer_status": "active",
        "limit": 100
    },
    "options": {
        "create_missing": true,
        "update_existing": true,
        "delete_missing": false,
        "dry_run": false
    }
}

// Response
{
    "success": true,
    "message": "Sync triggered successfully",
    "data": {
        "sync": {
            "id": 12345,
            "integration_id": 1,
            "sync_type": "incremental",
            "entity_type": "customers",
            "sync_direction": "to_geniacs",
            "status": "processing",
            "estimated_records": 25,
            "started_at": "2024-01-01T10:10:00Z"
        }
    }
}
```

#### GET /api/geniacs/sync/{syncId}/status
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "data": {
        "sync": {
            "id": 12345,
            "integration_id": 1,
            "sync_type": "incremental",
            "entity_type": "customers",
            "status": "success",
            "progress": {
                "total_records": 25,
                "processed_records": 25,
                "successful_records": 24,
                "failed_records": 1,
                "percentage": 100
            },
            "started_at": "2024-01-01T10:10:00Z",
            "completed_at": "2024-01-01T10:15:00Z",
            "duration_seconds": 300,
            "summary": {
                "created": 5,
                "updated": 19,
                "skipped": 0,
                "failed": 1
            },
            "errors": [
                {
                    "record_id": 123,
                    "error_type": "validation_error",
                    "error_message": "Invalid email format",
                    "failed_at": "2024-01-01T10:12:30Z"
                }
            ]
        }
    }
}
```

#### POST /api/geniacs/webhook/handle
```php
// Headers: No authentication required (webhook)
// Headers: X-Geniacs-Signature: signature_hash
// Request
{
    "event_type": "customer.updated",
    "event_id": "evt_123456789",
    "timestamp": "2024-01-01T10:00:00Z",
    "data": {
        "customer_id": "cust_12345",
        "changes": {
            "email": {
                "old": "old@example.com",
                    "new": "new@example.com"
                }
            }
        }
    }
}

// Response
{
    "success": true,
    "message": "Webhook processed successfully"
}
```

### Field Mapping Endpoints

#### GET /api/geniacs/mappings
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: integration_id, entity_type, is_active

// Response
{
    "success": true,
    "data": {
        "mappings": [
            {
                "id": 1,
                "integration_id": 1,
                "entity_type": "customers",
                "local_field": "name",
                "geniacs_field": "customer_name",
                "field_type": "string",
                "is_required": true,
                "transformation_rules": {
                    "trim": true,
                    "uppercase": false,
                    "max_length": 255
                },
                "validation_rules": {
                    "required": true,
                    "max_length": 255
                },
                "is_active": true
            },
            {
                "id": 2,
                "integration_id": 1,
                "entity_type": "customers",
                "local_field": "email",
                "geniacs_field": "customer_email",
                "field_type": "string",
                "is_required": true,
                "transformation_rules": {
                    "lowercase": true
                },
                "validation_rules": {
                    "required": true,
                    "email": true
                },
                "is_active": true
            }
        ]
    }
}
```

#### POST /api/geniacs/mappings
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "integration_id": 1,
    "entity_type": "customers",
    "local_field": "phone",
    "geniacs_field": "customer_phone",
    "field_type": "string",
    "is_required": false,
    "transformation_rules": {
        "remove_special_chars": true,
        "format": "international"
    },
    "validation_rules": {
        "phone": true,
        "min_length": 10,
        "max_length": 15
    },
    "default_value": null,
    "is_active": true
}

// Response
{
    "success": true,
    "message": "Field mapping created successfully",
    "data": {
        "mapping": {
            "id": 10,
            "integration_id": 1,
            "entity_type": "customers",
            "local_field": "phone",
            "geniacs_field": "customer_phone",
            "field_type": "string",
            "is_required": false,
            "is_active": true,
            "created_at": "2024-01-01T10:00:00Z"
        }
    }
}
```

### Scheduling Endpoints

#### GET /api/geniacs/schedules
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: integration_id, entity_type, is_active

// Response
{
    "success": true,
    "data": {
        "schedules": [
            {
                "id": 1,
                "integration_id": 1,
                "name": "Customer Sync Schedule",
                "entity_type": "customers",
                "sync_type": "incremental",
                "cron_expression": "*/5 * * * *",
                "is_active": true,
                "last_run_at": "2024-01-01T10:00:00Z",
                "next_run_at": "2024-01-01T10:05:00Z",
                "configuration": {
                    "sync_window": "last_hour",
                    "batch_size": 100,
                    "max_execution_time": 1800
                }
            }
        ]
    }
}
```

#### POST /api/geniacs/schedules
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "integration_id": 1,
    "name": "Payment Sync Schedule",
    "entity_type": "payments",
    "sync_type": "incremental",
    "cron_expression": "0 */2 * * *",
    "is_active": true,
    "configuration": {
        "sync_window": "last_2_hours",
        "batch_size": 50,
        "max_execution_time": 900,
        "retry_failed": true
    }
}

// Response
{
    "success": true,
    "message": "Sync schedule created successfully",
    "data": {
        "schedule": {
            "id": 2,
            "integration_id": 1,
            "name": "Payment Sync Schedule",
            "entity_type": "payments",
            "sync_type": "incremental",
            "cron_expression": "0 */2 * * *",
            "is_active": true,
            "next_run_at": "2024-01-01T12:00:00Z",
            "created_at": "2024-01-01T10:00:00Z"
        }
    }
}
```

## Implementation Details

### Backend Implementation

#### Geniacs API Service
```php
<?php

namespace App\Services;

use App\Models\GeniacsIntegration;
use App\Models\GeniacsDataSync;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;

class GeniacsApiService
{
    private GeniacsIntegration $integration;
    private string $baseUrl;
    private array $headers;

    public function __construct(GeniacsIntegration $integration)
    {
        $this->integration = $integration;
        $this->baseUrl = rtrim($integration->endpoint_url, '/');
        $this->headers = [
            'Authorization' => 'Bearer ' . $integration->getDecryptedApiKey(),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'User-Agent' => 'ISP-Management-System/1.0'
        ];
    }

    public function testConnection(): array
    {
        try {
            $startTime = microtime(true);
            
            $response = Http::withHeaders($this->headers)
                ->timeout($this->integration->timeout_seconds)
                ->get($this->baseUrl . '/health');

            $responseTime = (microtime(true) - $startTime) * 1000;

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'response_time' => round($responseTime, 2),
                    'api_version' => $data['version'] ?? 'unknown',
                    'rate_limits' => $data['rate_limits'] ?? [],
                    'supported_endpoints' => $data['endpoints'] ?? [],
                    'authentication' => 'valid',
                    'tested_at' => now()->toISOString()
                ];
            }

            return [
                'success' => false,
                'error' => 'Connection failed',
                'status_code' => $response->status(),
                'response_time' => round($responseTime, 2),
                'tested_at' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'tested_at' => now()->toISOString()
            ];
        }
    }

    public function syncCustomers(array $filters = [], array $options = []): array
    {
        return $this->syncEntity('customers', $filters, $options);
    }

    public function syncSubscriptions(array $filters = [], array $options = []): array
    {
        return $this->syncEntity('subscriptions', $filters, $options);
    }

    public function syncPayments(array $filters = [], array $options = []): array
    {
        return $this->syncEntity('payments', $filters, $options);
    }

    public function syncMonitoringData(array $filters = [], array $options = []): array
    {
        return $this->syncEntity('monitoring_data', $filters, $options);
    }

    public function syncInvoices(array $filters = [], array $options = []): array
    {
        return $this->syncEntity('invoices', $filters, $options);
    }

    private function syncEntity(string $entityType, array $filters = [], array $options = []): array
    {
        try {
            $sync = GeniacsDataSync::create([
                'integration_id' => $this->integration->id,
                'sync_type' => $options['sync_type'] ?? 'incremental',
                'entity_type' => $entityType,
                'sync_direction' => $options['sync_direction'] ?? 'to_geniacs',
                'status' => 'processing',
                'started_at' => now()
            ]);

            $endpoint = $this->getEntityEndpoint($entityType);
            $data = $this->prepareSyncData($entityType, $filters, $options);

            if ($options['dry_run'] ?? false) {
                $sync->update([
                    'status' => 'success',
                    'completed_at' => now(),
                    'response_data' => ['dry_run' => true, 'records_count' => count($data)]
                ]);

                return [
                    'success' => true,
                    'sync_id' => $sync->id,
                    'dry_run' => true,
                    'records_count' => count($data)
                ];
            }

            $response = Http::withHeaders($this->headers)
                ->timeout($this->integration->timeout_seconds)
                ->post($endpoint, [
                    'data' => $data,
                    'options' => $options,
                    'sync_id' => $sync->id
                ]);

            if ($response->successful()) {
                $responseData = $response->json();

                $sync->update([
                    'status' => 'success',
                    'response_data' => $responseData,
                    'completed_at' => now()
                ]);

                return [
                    'success' => true,
                    'sync_id' => $sync->id,
                    'response_data' => $responseData
                ];
            }

            $sync->update([
                'status' => 'failed',
                'error_message' => $response->body(),
                'response_data' => $response->json(),
                'completed_at' => now()
            ]);

            return [
                'success' => false,
                'sync_id' => $sync->id,
                'error' => $response->body(),
                'status_code' => $response->status()
            ];

        } catch (\Exception $e) {
            if (isset($sync)) {
                $sync->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                    'completed_at' => now()
                ]);
            }

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function getEntityEndpoint(string $entityType): string
    {
        $endpoints = [
            'customers' => '/customers/sync',
            'subscriptions' => '/subscriptions/sync',
            'payments' => '/payments/sync',
            'monitoring_data' => '/monitoring/sync',
            'invoices' => '/invoices/sync'
        ];

        return $this->baseUrl . ($endpoints[$entityType] ?? '/sync');
    }

    private function prepareSyncData(string $entityType, array $filters, array $options): array
    {
        $data = [];
        $modelClass = $this->getEntityModelClass($entityType);

        $query = $modelClass::query();

        // Apply filters
        if (isset($filters['updated_since'])) {
            $query->where('updated_at', '>=', $filters['updated_since']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['limit'])) {
            $query->limit($filters['limit']);
        }

        // Get records
        $records = $query->get();

        // Apply field mappings
        foreach ($records as $record) {
            $mappedData = $this->applyFieldMappings($record, $entityType);
            $data[] = $mappedData;
        }

        return $data;
    }

    private function getEntityModelClass(string $entityType): string
    {
        $models = [
            'customers' => \App\Models\Customer::class,
            'subscriptions' => \App\Models\CustomerSubscription::class,
            'payments' => \App\Models\Payment::class,
            'monitoring_data' => \App\Models\MonitoringData::class,
            'invoices' => \App\Models\Invoice::class
        ];

        return $models[$entityType] ?? \App\Models\Customer::class;
    }

    private function applyFieldMappings($record, string $entityType): array
    {
        $mappings = $this->integration->fieldMappings()
            ->where('entity_type', $entityType)
            ->where('is_active', true)
            ->get();

        $mappedData = [];

        foreach ($mappings as $mapping) {
            $localField = $mapping->local_field;
            $geniacsField = $mapping->geniacs_field;

            if (isset($record->$localField)) {
                $value = $record->$localField;
                
                // Apply transformation rules
                $value = $this->applyTransformationRules($value, $mapping->transformation_rules);
                
                // Apply validation
                if (!$this->validateFieldValue($value, $mapping->validation_rules)) {
                    Log::warning("Validation failed for field {$localField} with value: {$value}");
                    continue;
                }

                $mappedData[$geniacsField] = $value;
            } elseif ($mapping->is_required && $mapping->default_value) {
                $mappedData[$geniacsField] = $mapping->default_value;
            }
        }

        return $mappedData;
    }

    private function applyTransformationRules($value, array $rules): mixed
    {
        if (empty($rules)) {
            return $value;
        }

        foreach ($rules as $rule => $ruleValue) {
            switch ($rule) {
                case 'trim':
                    $value = trim($value);
                    break;
                case 'uppercase':
                    $value = strtoupper($value);
                    break;
                case 'lowercase':
                    $value = strtolower($value);
                    break;
                case 'remove_special_chars':
                    $value = preg_replace('/[^a-zA-Z0-9]/', '', $value);
                    break;
                case 'format':
                    if ($ruleValue === 'international') {
                        // Format phone number to international format
                        $value = $this->formatPhoneNumber($value);
                    }
                    break;
                case 'max_length':
                    $value = substr($value, 0, $ruleValue);
                    break;
            }
        }

        return $value;
    }

    private function validateFieldValue($value, array $rules): bool
    {
        if (empty($rules)) {
            return true;
        }

        foreach ($rules as $rule => $ruleValue) {
            switch ($rule) {
                case 'required':
                    if (empty($value)) {
                        return false;
                    }
                    break;
                case 'email':
                    if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        return false;
                    }
                    break;
                case 'phone':
                    if (!preg_match('/^[0-9+\-\s()]+$/', $value)) {
                        return false;
                    }
                    break;
                case 'min_length':
                    if (strlen($value) < $ruleValue) {
                        return false;
                    }
                    break;
                case 'max_length':
                    if (strlen($value) > $ruleValue) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    private function formatPhoneNumber($phone): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Add country code if not present
        if (strlen($phone) === 10 && substr($phone, 0, 1) !== '0') {
            $phone = '62' . $phone;
        } elseif (strlen($phone) === 11 && substr($phone, 0, 1) === '0') {
            $phone = '62' . substr($phone, 1);
        }
        
        return '+' . $phone;
    }

    public function handleWebhook(string $eventType, array $payload): bool
    {
        try {
            // Verify webhook signature
            if (!$this->verifyWebhookSignature($payload)) {
                Log::error('Invalid webhook signature for integration ' . $this->integration->id);
                return false;
            }

            // Store webhook event
            $webhookEvent = \App\Models\GeniacsWebhookEvent::create([
                'integration_id' => $this->integration->id,
                'event_type' => $eventType,
                'event_id' => $payload['event_id'] ?? null,
                'payload' => $payload,
                'signature' => request()->header('X-Geniacs-Signature'),
                'created_at' => now()
            ]);

            // Process webhook event
            $this->processWebhookEvent($eventType, $payload, $webhookEvent);

            return true;

        } catch (\Exception $e) {
            Log::error("Error processing webhook: {$e->getMessage()}");
            return false;
        }
    }

    private function verifyWebhookSignature(array $payload): bool
    {
        $signature = request()->header('X-Geniacs-Signature');
        $secret = $this->integration->getDecryptedWebhookSecret();

        $expectedSignature = hash_hmac('sha256', json_encode($payload), $secret);

        return hash_equals($signature, $expectedSignature);
    }

    private function processWebhookEvent(string $eventType, array $payload, \App\Models\GeniacsWebhookEvent $webhookEvent): void
    {
        switch ($eventType) {
            case 'customer.created':
                $this->handleCustomerCreated($payload);
                break;
            case 'customer.updated':
                $this->handleCustomerUpdated($payload);
                break;
            case 'customer.deleted':
                $this->handleCustomerDeleted($payload);
                break;
            case 'payment.completed':
                $this->handlePaymentCompleted($payload);
                break;
            case 'subscription.activated':
                $this->handleSubscriptionActivated($payload);
                break;
            default:
                Log::info("Unhandled webhook event type: {$eventType}");
                break;
        }

        // Mark webhook as processed
        $webhookEvent->update([
            'processed' => true,
            'processed_at' => now()
        ]);
    }

    private function handleCustomerCreated(array $payload): void
    {
        // Create customer from webhook data
        $customerData = $this->mapWebhookDataToLocal('customers', $payload['data']);
        
        if ($customerData) {
            \App\Models\Customer::create($customerData);
            Log::info("Customer created from webhook: {$payload['event_id']}");
        }
    }

    private function handleCustomerUpdated(array $payload): void
    {
        // Update customer from webhook data
        $geniacsCustomerId = $payload['data']['customer_id'];
        $customer = \App\Models\Customer::where('geniacs_customer_id', $geniacsCustomerId)->first();
        
        if ($customer) {
            $customerData = $this->mapWebhookDataToLocal('customers', $payload['data']);
            $customer->update($customerData);
            Log::info("Customer updated from webhook: {$payload['event_id']}");
        }
    }

    private function handleCustomerDeleted(array $payload): void
    {
        // Soft delete customer from webhook data
        $geniacsCustomerId = $payload['data']['customer_id'];
        $customer = \App\Models\Customer::where('geniacs_customer_id', $geniacsCustomerId)->first();
        
        if ($customer) {
            $customer->delete();
            Log::info("Customer deleted from webhook: {$payload['event_id']}");
        }
    }

    private function handlePaymentCompleted(array $payload): void
    {
        // Update payment status from webhook data
        $geniacsPaymentId = $payload['data']['payment_id'];
        $payment = \App\Models\Payment::where('geniacs_payment_id', $geniacsPaymentId)->first();
        
        if ($payment) {
            $payment->update([
                'status' => 'success',
                'paid_at' => now(),
                'gateway_response' => $payload['data']
            ]);
            
            // Update invoice status
            $payment->invoice->update([
                'status' => 'paid',
                'paid_at' => now()
            ]);
            
            Log::info("Payment completed from webhook: {$payload['event_id']}");
        }
    }

    private function handleSubscriptionActivated(array $payload): void
    {
        // Activate subscription from webhook data
        $geniacsSubscriptionId = $payload['data']['subscription_id'];
        $subscription = \App\Models\CustomerSubscription::where('geniacs_subscription_id', $geniacsSubscriptionId)->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'active',
                'activated_at' => now()
            ]);
            
            Log::info("Subscription activated from webhook: {$payload['event_id']}");
        }
    }

    private function mapWebhookDataToLocal(string $entityType, array $data): array
    {
        $mappings = $this->integration->fieldMappings()
            ->where('entity_type', $entityType)
            ->where('is_active', true)
            ->get();

        $localData = [];

        foreach ($mappings as $mapping) {
            $geniacsField = $mapping->geniacs_field;
            $localField = $mapping->local_field;

            if (isset($data[$geniacsField])) {
                $localData[$localField] = $data[$geniacsField];
            }
        }

        return $localData;
    }
}
```

#### Geniacs Integration Service
```php
<?php

namespace App\Services;

use App\Models\GeniacsIntegration;
use App\Models\GeniacsDataSync;
use App\Models\GeniacsSyncSchedule;
use App\Jobs\ProcessGeniacsSync;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class GeniacsIntegrationService
{
    public function createIntegration(array $data): GeniacsIntegration
    {
        $integration = GeniacsIntegration::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'endpoint_url' => $data['endpoint_url'],
            'api_version' => $data['api_version'] ?? 'v1',
            'api_key' => encrypt($data['api_key']),
            'api_secret' => encrypt($data['api_secret']),
            'webhook_url' => $data['webhook_url'] ?? null,
            'webhook_secret' => $data['webhook_secret'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'sync_enabled' => $data['sync_enabled'] ?? true,
            'configuration' => $data['configuration'] ?? [],
            'rate_limits' => $data['rate_limits'] ?? [],
            'timeout_seconds' => $data['timeout_seconds'] ?? 30,
            'retry_attempts' => $data['retry_attempts'] ?? 3
        ]);

        // Create default sync schedules
        $this->createDefaultSyncSchedules($integration);

        // Create default field mappings
        $this->createDefaultFieldMappings($integration);

        return $integration;
    }

    public function triggerSync(int $integrationId, array $options): GeniacsDataSync
    {
        $integration = GeniacsIntegration::findOrFail($integrationId);
        
        $sync = GeniacsDataSync::create([
            'integration_id' => $integrationId,
            'sync_type' => $options['sync_type'] ?? 'incremental',
            'entity_type' => $options['entity_type'],
            'sync_direction' => $options['sync_direction'] ?? 'to_geniacs',
            'status' => 'pending',
            'data' => $options['data'] ?? [],
            'mapped_data' => null,
            'response_data' => null,
            'error_message' => null,
            'retry_count' => 0,
            'next_retry_at' => null,
            'started_at' => null,
            'completed_at' => null
        ]);

        // Dispatch sync job
        ProcessGeniacsSync::dispatch($sync);

        return $sync;
    }

    public function scheduleSync(int $integrationId, array $scheduleData): GeniacsSyncSchedule
    {
        return GeniacsSyncSchedule::create([
            'integration_id' => $integrationId,
            'name' => $scheduleData['name'],
            'entity_type' => $scheduleData['entity_type'],
            'sync_type' => $scheduleData['sync_type'],
            'cron_expression' => $scheduleData['cron_expression'],
            'is_active' => $scheduleData['is_active'] ?? true,
            'last_run_at' => null,
            'next_run_at' => $this->calculateNextRun($scheduleData['cron_expression']),
            'configuration' => $scheduleData['configuration'] ?? []
        ]);
    }

    public function processScheduledSyncs(): void
    {
        $schedules = GeniacsSyncSchedule::where('is_active', true)
            ->where('next_run_at', '<=', now())
            ->with('integration')
            ->get();

        foreach ($schedules as $schedule) {
            try {
                Log::info("Processing scheduled sync: {$schedule->name}");

                // Trigger sync
                $this->triggerSync($schedule->integration_id, [
                    'sync_type' => $schedule->sync_type,
                    'entity_type' => $schedule->entity_type,
                    'sync_direction' => 'to_geniacs',
                    'configuration' => $schedule->configuration
                ]);

                // Update schedule
                $schedule->update([
                    'last_run_at' => now(),
                    'next_run_at' => $this->calculateNextRun($schedule->cron_expression)
                ]);

            } catch (\Exception $e) {
                Log::error("Failed to process scheduled sync {$schedule->id}: {$e->getMessage()}");
            }
        }
    }

    public function retryFailedSyncs(): void
    {
        $failedSyncs = GeniacsDataSync::where('status', 'failed')
            ->where('retry_count', '<', function ($query) {
                $query->selectRaw('COALESCE(MAX(retry_count), 0)')
                    ->from('geniacs_data_sync')
                    ->whereColumn('integration_id', 'geniacs_data_sync.integration_id');
            })
            ->where(function ($query) {
                $query->whereNull('next_retry_at')
                      ->orWhere('next_retry_at', '<=', now());
            })
            ->with('integration')
            ->get();

        foreach ($failedSyncs as $sync) {
            try {
                Log::info("Retrying failed sync: {$sync->id}");

                // Update sync status
                $sync->update([
                    'status' => 'pending',
                    'retry_count' => $sync->retry_count + 1,
                    'next_retry_at' => null
                ]);

                // Dispatch sync job
                ProcessGeniacsSync::dispatch($sync);

            } catch (\Exception $e) {
                Log::error("Failed to retry sync {$sync->id}: {$e->getMessage()}");
                
                // Calculate next retry time with exponential backoff
                $nextRetryAt = now()->addMinutes(pow(2, $sync->retry_count + 1));
                $maxRetryAt = now()->addHours(24); // Max 24 hours
                
                $sync->update([
                    'next_retry_at' => min($nextRetryAt, $maxRetryAt)
                ]);
            }
        }
    }

    private function createDefaultSyncSchedules(GeniacsIntegration $integration): void
    {
        $defaultSchedules = [
            [
                'name' => 'Customer Incremental Sync',
                'entity_type' => 'customers',
                'sync_type' => 'incremental',
                'cron_expression' => '*/15 * * * *', // Every 15 minutes
                'configuration' => [
                    'sync_window' => 'last_hour',
                    'batch_size' => 100
                ]
            ],
            [
                'name' => 'Subscription Incremental Sync',
                'entity_type' => 'subscriptions',
                'sync_type' => 'incremental',
                'cron_expression' => '*/30 * * * *', // Every 30 minutes
                'configuration' => [
                    'sync_window' => 'last_2_hours',
                    'batch_size' => 50
                ]
            ],
            [
                'name' => 'Payment Incremental Sync',
                'entity_type' => 'payments',
                'sync_type' => 'incremental',
                'cron_expression' => '0 */2 * * *', // Every 2 hours
                'configuration' => [
                    'sync_window' => 'last_6_hours',
                    'batch_size' => 100
                ]
            ],
            [
                'name' => 'Monitoring Data Sync',
                'entity_type' => 'monitoring_data',
                'sync_type' => 'incremental',
                'cron_expression' => '*/5 * * * *', // Every 5 minutes
                'configuration' => [
                    'sync_window' => 'last_30_minutes',
                    'batch_size' => 200
                ]
            ]
        ];

        foreach ($defaultSchedules as $scheduleData) {
            GeniacsSyncSchedule::create([
                'integration_id' => $integration->id,
                'next_run_at' => $this->calculateNextRun($scheduleData['cron_expression'])
            ] + $scheduleData);
        }
    }

    private function createDefaultFieldMappings(GeniacsIntegration $integration): void
    {
        $defaultMappings = [
            // Customer mappings
            [
                'entity_type' => 'customers',
                'local_field' => 'name',
                'geniacs_field' => 'customer_name',
                'field_type' => 'string',
                'is_required' => true,
                'transformation_rules' => ['trim' => true],
                'validation_rules' => ['required' => true, 'max_length' => 255]
            ],
            [
                'entity_type' => 'customers',
                'local_field' => 'email',
                'geniacs_field' => 'customer_email',
                'field_type' => 'string',
                'is_required' => true,
                'transformation_rules' => ['lowercase' => true],
                'validation_rules' => ['required' => true, 'email' => true]
            ],
            [
                'entity_type' => 'customers',
                'local_field' => 'phone',
                'geniacs_field' => 'customer_phone',
                'field_type' => 'string',
                'is_required' => false,
                'transformation_rules' => ['format' => 'international'],
                'validation_rules' => ['phone' => true]
            ],
            // Subscription mappings
            [
                'entity_type' => 'subscriptions',
                'local_field' => 'username',
                'geniacs_field' => 'subscription_username',
                'field_type' => 'string',
                'is_required' => true,
                'validation_rules' => ['required' => true]
            ],
            [
                'entity_type' => 'subscriptions',
                'local_field' => 'status',
                'geniacs_field' => 'subscription_status',
                'field_type' => 'string',
                'is_required' => true,
                'validation_rules' => ['required' => true]
            ],
            // Payment mappings
            [
                'entity_type' => 'payments',
                'local_field' => 'amount',
                'geniacs_field' => 'payment_amount',
                'field_type' => 'number',
                'is_required' => true,
                'validation_rules' => ['required' => true, 'min' => 0]
            ],
            [
                'entity_type' => 'payments',
                'local_field' => 'status',
                'geniacs_field' => 'payment_status',
                'field_type' => 'string',
                'is_required' => true,
                'validation_rules' => ['required' => true]
            ]
        ];

        foreach ($defaultMappings as $mappingData) {
            \App\Models\GeniacsFieldMapping::create([
                'integration_id' => $integration->id
            ] + $mappingData);
        }
    }

    private function calculateNextRun(string $cronExpression): Carbon
    {
        // Simple cron parser for basic expressions
        // In production, use a proper cron library
        $parts = explode(' ', $cronExpression);
        
        $minute = $parts[0];
        $hour = $parts[1];
        $day = $parts[2];
        $month = $parts[3];
        $dayOfWeek = $parts[4];

        $nextRun = now()->copy();

        if ($minute !== '*') {
            $nextRun->setMinute((int) $minute);
            if ($nextRun->lte(now())) {
                $nextRun->addHour();
            }
        }

        if ($hour !== '*') {
            $nextRun->setHour((int) $hour);
            if ($nextRun->lte(now())) {
                $nextRun->addDay();
            }
        }

        return $nextRun;
    }

    public function getSyncStatistics(int $integrationId, Carbon $from, Carbon $to): array
    {
        $syncs = GeniacsDataSync::where('integration_id', $integrationId)
            ->whereBetween('created_at', [$from, $to])
            ->get();

        $totalSyncs = $syncs->count();
        $successfulSyncs = $syncs->where('status', 'success')->count();
        $failedSyncs = $syncs->where('status', 'failed')->count();
        $pendingSyncs = $syncs->where('status', 'pending')->count();

        $avgDuration = $syncs->whereNotNull('started_at')
            ->whereNotNull('completed_at')
            ->avg(function ($sync) {
                return $sync->started_at->diffInSeconds($sync->completed_at);
            });

        return [
            'total_syncs' => $totalSyncs,
            'successful_syncs' => $successfulSyncs,
            'failed_syncs' => $failedSyncs,
            'pending_syncs' => $pendingSyncs,
            'success_rate' => $totalSyncs > 0 ? ($successfulSyncs / $totalSyncs) * 100 : 0,
            'average_duration_seconds' => round($avgDuration ?? 0, 2),
            'by_entity_type' => $syncs->groupBy('entity_type')->map(function ($group) {
                return [
                    'total' => $group->count(),
                    'successful' => $group->where('status', 'success')->count(),
                    'failed' => $group->where('status', 'failed')->count()
                ];
            }),
            'by_sync_type' => $syncs->groupBy('sync_type')->map(function ($group) {
                return [
                    'total' => $group->count(),
                    'successful' => $group->where('status', 'success')->count(),
                    'failed' => $group->where('status', 'failed')->count()
                ];
            })
        ];
    }
}
```

### Frontend Implementation

#### Geniacs Integration Component
```javascript
// src/components/geniacs/IntegrationManagement.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { geniacsService } from '../../services/geniacsService';

const IntegrationManagement = () => {
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['geniacs-integrations'],
    queryFn: () => geniacsService.getIntegrations()
  });

  const createIntegrationMutation = useMutation({
    mutationFn: geniacsService.createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries(['geniacs-integrations']);
      setShowCreateModal(false);
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: geniacsService.testConnection,
    onSuccess: (data) => {
      // Show test results in modal
      setShowTestModal(true);
    }
  });

  const handleCreateIntegration = (data) => {
    createIntegrationMutation.mutate(data);
  };

  const handleTestConnection = (integrationId) => {
    testConnectionMutation.mutate(integrationId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) return <div>Loading integrations...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Geniacs Integration</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Integration
        </button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {integrations?.data?.integrations?.map((integration) => (
          <div key={integration.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{integration.name}</h3>
                <p className="text-sm text-gray-600">{integration.description}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  integration.is_active ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {integration.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  integration.sync_enabled ? 'text-blue-600 bg-blue-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {integration.sync_enabled ? 'Sync Enabled' : 'Sync Disabled'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">API Version:</span>
                <span className="font-medium">{integration.api_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Sync:</span>
                <span className="font-medium">
                  {integration.last_sync_at 
                    ? new Date(integration.last_sync_at).toLocaleString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Webhook:</span>
                <span className="font-medium">
                  {integration.last_webhook_received_at 
                    ? new Date(integration.last_webhook_received_at).toLocaleString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>

            {/* Sync Status */}
            {integration.sync_status && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <h4 className="text-sm font-medium mb-2">Sync Status</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{integration.sync_status.total_syncs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <span className="text-green-600">{integration.sync_status.successful_syncs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="text-red-600">{integration.sync_status.failed_syncs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="text-blue-600">{integration.sync_status.pending_syncs}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleTestConnection(integration.id)}
                disabled={testConnectionMutation.isLoading}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Test Connection
              </button>
              <button
                onClick={() => setSelectedIntegration(integration)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Integration Modal */}
      {showCreateModal && (
        <CreateIntegrationModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateIntegration}
          isLoading={createIntegrationMutation.isLoading}
        />
      )}

      {/* Test Connection Modal */}
      {showTestModal && testConnectionMutation.data && (
        <TestConnectionModal
          onClose={() => setShowTestModal(false)}
          testResult={testConnectionMutation.data}
        />
      )}

      {/* Integration Details */}
      {selectedIntegration && (
        <IntegrationDetailsModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}
    </div>
  );
};

// Create Integration Modal Component
const CreateIntegrationModal = ({ onClose, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Geniacs Integration</h2>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Integration Name
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endpoint URL
            </label>
            <input
              {...register('endpoint_url', { required: 'Endpoint URL is required' })}
              type="url"
              placeholder="https://api.geniacs.com/v1"
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.endpoint_url && (
              <p className="mt-1 text-sm text-red-600">{errors.endpoint_url.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              {...register('api_key', { required: 'API Key is required' })}
              type="password"
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.api_key && (
              <p className="mt-1 text-sm text-red-600">{errors.api_key.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Secret
            </label>
            <input
              {...register('api_secret', { required: 'API Secret is required' })}
              type="password"
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.api_secret && (
              <p className="mt-1 text-sm text-red-600">{errors.api_secret.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL
            </label>
            <input
              {...register('webhook_url')}
              type="url"
              placeholder="https://example.com/geniacs/webhook"
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook Secret
            </label>
            <input
              {...register('webhook_secret')}
              type="password"
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('is_active')}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex items-center">
            <input
              {...register('sync_enabled')}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Enable Sync
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Integration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IntegrationManagement;
```

#### Sync Status Component
```javascript
// src/components/geniacs/SyncStatus.jsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { geniacsService } from '../../services/geniacsService';
import { formatDateTime } from '../../utils/formatters';

const SyncStatus = () => {
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const { data: statistics, isLoading } = useQuery({
    queryKey: ['geniacs-statistics', selectedIntegration, dateRange],
    queryFn: () => geniacsService.getSyncStatistics(selectedIntegration, dateRange),
    enabled: !!selectedIntegration
  });

  const { data: integrations } = useQuery({
    queryKey: ['geniacs-integrations'],
    queryFn: () => geniacsService.getIntegrations()
  });

  const triggerSyncMutation = useMutation({
    mutationFn: geniacsService.triggerSync,
    onSuccess: () => {
      // Refresh statistics
      // Show success message
    }
  });

  const handleTriggerSync = (entityType) => {
    if (!selectedIntegration) return;

    triggerSyncMutation.mutate({
      integration_id: selectedIntegration,
      entity_type: entityType,
      sync_type: 'incremental',
      sync_direction: 'to_geniacs',
      options: {
        create_missing: true,
        update_existing: true
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sync Status</h1>
        
        <div className="flex space-x-4">
          <select
            value={selectedIntegration}
            onChange={(e) => setSelectedIntegration(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Integrations</option>
            {integrations?.data?.integrations?.map((integration) => (
              <option key={integration.id} value={integration.id}>
                {integration.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
            className="border rounded px-3 py-2"
          />

          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics?.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600">Total Syncs</h3>
            <p className="text-2xl font-bold">{statistics.data.total_syncs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600">Successful</h3>
            <p className="text-2xl font-bold text-green-600">{statistics.data.successful_syncs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600">Failed</h3>
            <p className="text-2xl font-bold text-red-600">{statistics.data.failed_syncs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600">Success Rate</h3>
            <p className="text-2xl font-bold">{statistics.data.success_rate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Entity Type Sync Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Trigger Manual Sync</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['customers', 'subscriptions', 'payments', 'monitoring_data', 'invoices'].map((entityType) => (
            <button
              key={entityType}
              onClick={() => handleTriggerSync(entityType)}
              disabled={triggerSyncMutation.isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Sync {entityType.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Statistics */}
      {statistics?.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Entity Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">By Entity Type</h3>
            <div className="space-y-3">
              {Object.entries(statistics.data.by_entity_type).map(([entity, stats]) => (
                <div key={entity} className="border-b pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{entity.replace('_', ' ').toUpperCase()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.successful > 0 ? 'success' : 'failed')}`}>
                      {stats.successful > 0 ? 'Active' : 'Issues'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>Total: {stats.total}</div>
                    <div className="text-green-600">Success: {stats.successful}</div>
                    <div className="text-red-600">Failed: {stats.failed}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Sync Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">By Sync Type</h3>
            <div className="space-y-3">
              {Object.entries(statistics.data.by_sync_type).map(([syncType, stats]) => (
                <div key={syncType} className="border-b pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{syncType.toUpperCase()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.successful > 0 ? 'success' : 'failed')}`}>
                      {stats.successful > 0 ? 'Healthy' : 'Issues'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>Total: {stats.total}</div>
                    <div className="text-green-600">Success: {stats.successful}</div>
                    <div className="text-red-600">Failed: {stats.failed}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {statistics?.data && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Average Duration</h4>
              <p className="text-2xl font-bold">
                {statistics.data.average_duration_seconds}s
              </p>
              <p className="text-sm text-gray-600">Per sync operation</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Success Rate</h4>
              <p className="text-2xl font-bold">
                {statistics.data.success_rate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Overall success rate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncStatus;
```

## Testing Requirements

### Unit Tests

#### Geniacs API Service Tests
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\GeniacsApiService;
use App\Models\GeniacsIntegration;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class GeniacsApiServiceTest extends TestCase
{
    use RefreshDatabase;

    private GeniacsApiService $service;
    private GeniacsIntegration $integration;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->integration = GeniacsIntegration::factory()->create([
            'endpoint_url' => 'https://api.geniacs.com/v1',
            'api_key' => encrypt('test_api_key'),
            'api_secret' => encrypt('test_api_secret'),
            'timeout_seconds' => 30
        ]);

        $this->service = new GeniacsApiService($this->integration);
    }

    public function test_can_test_connection_successfully()
    {
        $mockResponse = [
            'version' => 'v1.2.3',
            'rate_limits' => [
                'remaining_requests' => 95,
                'reset_time' => '2024-01-01T11:00:00Z'
            ],
            'endpoints' => ['/customers', '/subscriptions', '/payments']
        ];

        $httpMock = Mockery::mock('overload:Illuminate\Support\Facades\Http');
        $httpMock->shouldReceive('withHeaders')
            ->once()
            ->andReturnSelf();
        $httpMock->shouldReceive('timeout')
            ->once()
            ->andReturnSelf();
        $httpMock->shouldReceive('get')
            ->once()
            ->andReturn(new \GuzzleHttp\Psr7\Response(200, [], json_encode($mockResponse)));

        $result = $this->service->testConnection();

        $this->assertTrue($result['success']);
        $this->assertEquals('v1.2.3', $result['api_version']);
        $this->assertEquals(95, $result['rate_limits']['remaining_requests']);
    }

    public function test_can_test_connection_failure()
    {
        $httpMock = Mockery::mock('overload:Illuminate\Support\Facades\Http');
        $httpMock->shouldReceive('withHeaders')
            ->once()
            ->andReturnSelf();
        $httpMock->shouldReceive('timeout')
            ->once()
            ->andReturnSelf();
        $httpMock->shouldReceive('get')
            ->once()
            ->andThrow(new \Exception('Connection timeout'));

        $result = $this->service->testConnection();

        $this->assertFalse($result['success']);
        $this->assertEquals('Connection timeout', $result['error']);
    }

    public function test_can_sync_customers()
    {
        $customer = Customer::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+628123456789'
        ]);

        $mockResponse = [
            'success' => true,
            'synced_records' => 1,
            'failed_records' => 0
        ];

        $httpMock = Mockery::mock('overload:Illuminate\Support\Facades\Http');
        $httpMock->shouldReceive('withHeaders')
            ->once()
            ->andReturnSelf();
        $httpMock->shouldReceive('timeout')
            ->once()
            ->andReturnSelf();
        $httpMock->shouldReceive('post')
            ->once()
            ->andReturn(new \GuzzleHttp\Psr7\Response(200, [], json_encode($mockResponse)));

        $result = $this->service->syncCustomers();

        $this->assertTrue($result['success']);
        $this->assertEquals(1, $result['response_data']['synced_records']);
    }

    public function test_applies_field_mappings()
    {
        // Create field mapping
        \App\Models\GeniacsFieldMapping::factory()->create([
            'integration_id' => $this->integration->id,
            'entity_type' => 'customers',
            'local_field' => 'name',
            'geniacs_field' => 'customer_name',
            'field_type' => 'string',
            'transformation_rules' => ['trim' => true, 'uppercase' => true],
            'is_active' => true
        ]);

        $customer = Customer::factory()->create([
            'name' => 'john doe'
        ]);

        $httpMock = Mockery::mock('overload:Illuminate\Support\Facades\Http');
        $httpMock->shouldReceive('withHeaders')
            ->once()
            ->andReturnSelf();
        $httpMock->shouldReceive('timeout')
            ->once()
            ->andReturnSelf();
        $httpMock->shouldReceive('post')
            ->once()
            ->withArgs(function ($url, $data) use ($customer) {
                $mappedData = $data['data'][0];
                return $mappedData['customer_name'] === 'JOHN DOE';
            })
            ->andReturn(new \GuzzleHttp\Psr7\Response(200, [], json_encode(['success' => true])));

        $this->service->syncCustomers();
    }

    public function test_validates_field_values()
    {
        // Create field mapping with validation
        \App\Models\GeniacsFieldMapping::factory()->create([
            'integration_id' => $this->integration->id,
            'entity_type' => 'customers',
            'local_field' => 'email',
            'geniacs_field' => 'customer_email',
            'field_type' => 'string',
            'validation_rules' => ['required' => true, 'email' => true],
            'is_active' => true
        ]);

        $customer = Customer::factory()->create([
            'email' => 'invalid-email'
        ]);

        $this->service->syncCustomers();

        // Check that invalid email was not included in sync data
        $this->assertDatabaseHas('geniacs_sync_logs', [
            'integration_id' => $this->integration->id,
            'log_level' => 'warning',
            'message' => 'Validation failed for field email with value: invalid-email'
        ]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
```

#### Geniacs Integration Service Tests
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\GeniacsIntegrationService;
use App\Models\GeniacsIntegration;
use App\Models\GeniacsDataSync;
use App\Models\GeniacsSyncSchedule;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

class GeniacsIntegrationServiceTest extends TestCase
{
    use RefreshDatabase;

    private GeniacsIntegrationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(GeniacsIntegrationService::class);
    }

    public function test_can_create_integration()
    {
        $integrationData = [
            'name' => 'Test Integration',
            'description' => 'Test integration description',
            'endpoint_url' => 'https://api.geniacs.com/v1',
            'api_key' => 'test_api_key',
            'api_secret' => 'test_api_secret',
            'webhook_url' => 'https://example.com/webhook',
            'webhook_secret' => 'webhook_secret',
            'is_active' => true,
            'sync_enabled' => true
        ];

        $integration = $this->service->createIntegration($integrationData);

        $this->assertInstanceOf(GeniacsIntegration::class, $integration);
        $this->assertEquals('Test Integration', $integration->name);
        $this->assertEquals('https://api.geniacs.com/v1', $integration->endpoint_url);
        $this->assertTrue($integration->is_active);
        $this->assertTrue($integration->sync_enabled);

        // Check that default schedules were created
        $this->assertDatabaseHas('geniacs_sync_schedules', [
            'integration_id' => $integration->id,
            'entity_type' => 'customers',
            'sync_type' => 'incremental'
        ]);

        // Check that default field mappings were created
        $this->assertDatabaseHas('geniacs_field_mappings', [
            'integration_id' => $integration->id,
            'entity_type' => 'customers',
            'local_field' => 'name',
            'geniacs_field' => 'customer_name'
        ]);
    }

    public function test_can_trigger_sync()
    {
        $integration = GeniacsIntegration::factory()->create();

        $syncOptions = [
            'sync_type' => 'incremental',
            'entity_type' => 'customers',
            'sync_direction' => 'to_geniacs'
        ];

        $sync = $this->service->triggerSync($integration->id, $syncOptions);

        $this->assertInstanceOf(GeniacsDataSync::class, $sync);
        $this->assertEquals($integration->id, $sync->integration_id);
        $this->assertEquals('incremental', $sync->sync_type);
        $this->assertEquals('customers', $sync->entity_type);
        $this->assertEquals('to_geniacs', $sync->sync_direction);
        $this->assertEquals('pending', $sync->status);
    }

    public function test_can_schedule_sync()
    {
        $integration = GeniacsIntegration::factory()->create();

        $scheduleData = [
            'name' => 'Test Schedule',
            'entity_type' => 'customers',
            'sync_type' => 'incremental',
            'cron_expression' => '0 */2 * * *',
            'is_active' => true
        ];

        $schedule = $this->service->scheduleSync($integration->id, $scheduleData);

        $this->assertInstanceOf(GeniacsSyncSchedule::class, $schedule);
        $this->assertEquals($integration->id, $schedule->integration_id);
        $this->assertEquals('Test Schedule', $schedule->name);
        $this->assertEquals('customers', $schedule->entity_type);
        $this->assertEquals('0 */2 * * *', $schedule->cron_expression);
        $this->assertTrue($schedule->is_active);
    }

    public function test_calculates_next_run_time()
    {
        $integration = GeniacsIntegration::factory()->create();

        // Test every 2 hours schedule
        $schedule = $this->service->scheduleSync($integration->id, [
            'name' => 'Every 2 Hours',
            'entity_type' => 'customers',
            'sync_type' => 'incremental',
            'cron_expression' => '0 */2 * * *',
            'is_active' => true
        ]);

        $this->assertNotNull($schedule->next_run_at);
        $this->assertGreaterThan(now(), $schedule->next_run_at);
    }

    public function test_gets_sync_statistics()
    {
        $integration = GeniacsIntegration::factory()->create();

        // Create test sync records
        GeniacsDataSync::factory()->count(5)->create([
            'integration_id' => $integration->id,
            'entity_type' => 'customers',
            'status' => 'success',
            'started_at' => now()->subMinutes(10),
            'completed_at' => now()->subMinutes(5)
        ]);

        GeniacsDataSync::factory()->count(2)->create([
            'integration_id' => $integration->id,
            'entity_type' => 'customers',
            'status' => 'failed',
            'started_at' => now()->subMinutes(15),
            'completed_at' => now()->subMinutes(12)
        ]);

        $from = now()->subDays(1);
        $to = now();

        $statistics = $this->service->getSyncStatistics($integration->id, $from, $to);

        $this->assertEquals(7, $statistics['total_syncs']);
        $this->assertEquals(5, $statistics['successful_syncs']);
        $this->assertEquals(2, $statistics['failed_syncs']);
        $this->assertEquals(71.4, $statistics['success_rate']); // 5/7 * 100
    }
}
```

### Integration Tests

#### Geniacs API Tests
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\GeniacsIntegration;
use App\Models\GeniacsDataSync;
use Illuminate\Foundation\Testing\RefreshDatabase;

class GeniacsApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($this->admin, 'sanctum');
    }

    public function test_can_get_integrations()
    {
        GeniacsIntegration::factory()->count(3)->create();

        $response = $this->getJson('/api/geniacs/integrations');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'integrations' => [
                            '*' => [
                                'id',
                                'name',
                                'description',
                                'endpoint_url',
                                'api_version',
                                'is_active',
                                'sync_enabled',
                                'last_sync_at',
                                'sync_status'
                            ]
                        ],
                        'pagination'
                    ]
                ]);
    }

    public function test_can_create_integration()
    {
        $integrationData = [
            'name' => 'Test Integration',
            'description' => 'Test description',
            'endpoint_url' => 'https://api.geniacs.com/v1',
            'api_key' => 'test_api_key',
            'api_secret' => 'test_api_secret',
            'is_active' => true,
            'sync_enabled' => true
        ];

        $response = $this->postJson('/api/geniacs/integrations', $integrationData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'integration' => [
                            'id',
                            'name',
                            'endpoint_url',
                            'is_active',
                            'created_at'
                        ]
                    ]
                ]);

        $this->assertDatabaseHas('geniacs_integrations', [
            'name' => 'Test Integration',
            'endpoint_url' => 'https://api.geniacs.com/v1'
        ]);
    }

    public function test_can_test_connection()
    {
        $integration = GeniacsIntegration::factory()->create();

        $response = $this->postJson("/api/geniacs/integrations/{$integration->id}/test-connection");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'connection_test' => [
                            'status',
                            'response_time',
                            'api_version',
                            'authentication',
                            'tested_at'
                        ]
                    ]
                ]);
    }

    public function test_can_trigger_sync()
    {
        $integration = GeniacsIntegration::factory()->create();

        $syncData = [
            'integration_id' => $integration->id,
            'sync_type' => 'incremental',
            'entity_type' => 'customers',
            'sync_direction' => 'to_geniacs',
            'options' => [
                'create_missing' => true,
                'update_existing' => true
            ]
        ];

        $response = $this->postJson('/api/geniacs/sync/trigger', $syncData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'sync' => [
                            'id',
                            'integration_id',
                            'sync_type',
                            'entity_type',
                            'status',
                            'started_at'
                        ]
                    ]
                ]);

        $this->assertDatabaseHas('geniacs_data_sync', [
            'integration_id' => $integration->id,
            'sync_type' => 'incremental',
            'entity_type' => 'customers',
            'status' => 'processing'
        ]);
    }

    public function test_can_handle_webhook()
    {
        $integration = GeniacsIntegration::factory()->create([
            'webhook_secret' => 'test_webhook_secret'
        ]);

        $webhookData = [
            'event_type' => 'customer.updated',
            'event_id' => 'evt_123456789',
            'timestamp' => '2024-01-01T10:00:00Z',
            'data' => [
                'customer_id' => 'cust_12345',
                'changes' => [
                    'email' => [
                        'old' => 'old@example.com',
                        'new' => 'new@example.com'
                    ]
                ]
            ]
        ];

        $signature = hash_hmac('sha256', json_encode($webhookData), 'test_webhook_secret');

        $response = $this->postJson('/api/geniacs/webhook/handle', $webhookData, [
            'X-Geniacs-Signature' => $signature
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Webhook processed successfully'
                ]);

        $this->assertDatabaseHas('geniacs_webhook_events', [
            'integration_id' => $integration->id,
            'event_type' => 'customer.updated',
            'event_id' => 'evt_123456789',
            'processed' => true
        ]);
    }

    public function test_rejects_invalid_webhook_signature()
    {
        $integration = GeniacsIntegration::factory()->create([
            'webhook_secret' => 'test_webhook_secret'
        ]);

        $webhookData = [
            'event_type' => 'customer.updated',
            'event_id' => 'evt_123456789',
            'data' => []
        ];

        $invalidSignature = 'invalid_signature';

        $response = $this->postJson('/api/geniacs/webhook/handle', $webhookData, [
            'X-Geniacs-Signature' => $invalidSignature
        ]);

        $response->assertStatus(400);
    }
}
```

### Frontend Tests

#### Integration Management Tests
```javascript
// src/components/__tests__/IntegrationManagement.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IntegrationManagement from '../geniacs/IntegrationManagement';
import { geniacsService } from '../../services/geniacsService';

// Mock geniacs service
jest.mock('../../services/geniacsService');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithClient = (ui) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('IntegrationManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders integration list', async () => {
    const mockIntegrations = {
      data: {
        integrations: [
          {
            id: 1,
            name: 'Primary Geniacs Integration',
            description: 'Main integration with Geniacs API',
            endpoint_url: 'https://api.geniacs.com/v1',
            api_version: 'v1',
            is_active: true,
            sync_enabled: true,
            last_sync_at: '2024-01-01T10:00:00Z',
            sync_status: {
              total_syncs: 1250,
              successful_syncs: 1200,
              failed_syncs: 50,
              pending_syncs: 0
            }
          }
        ]
      }
    };

    geniacsService.getIntegrations.mockResolvedValue(mockIntegrations);

    renderWithClient(<IntegrationManagement />);

    await waitFor(() => {
      expect(screen.getByText('Geniacs Integration')).toBeInTheDocument();
      expect(screen.getByText('Primary Geniacs Integration')).toBeInTheDocument();
      expect(screen.getByText('Main integration with Geniacs API')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Sync Enabled')).toBeInTheDocument();
    });
  });

  test('can create new integration', async () => {
    const mockIntegrations = {
      data: { integrations: [] }
    };

    geniacsService.getIntegrations.mockResolvedValue(mockIntegrations);
    geniacsService.createIntegration.mockResolvedValue({
      success: true,
      data: { integration: { id: 2, name: 'New Integration' } }
    });

    renderWithClient(<IntegrationManagement />);

    // Click add integration button
    fireEvent.click(screen.getByText('Add Integration'));

    // Fill form and submit
    await waitFor(() => {
      expect(screen.getByLabelText('Integration Name')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Integration Name'), {
      target: { value: 'New Test Integration' }
    });

    fireEvent.change(screen.getByLabelText('Endpoint URL'), {
      target: { value: 'https://api.geniacs.com/v1' }
    });

    fireEvent.change(screen.getByLabelText('API Key'), {
      target: { value: 'test_api_key' }
    });

    fireEvent.change(screen.getByLabelText('API Secret'), {
      target: { value: 'test_api_secret' }
    });

    fireEvent.click(screen.getByText('Create Integration'));

    await waitFor(() => {
      expect(geniacsService.createIntegration).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Test Integration',
          endpoint_url: 'https://api.geniacs.com/v1',
          api_key: 'test_api_key',
          api_secret: 'test_api_secret'
        })
      );
    });
  });

  test('can test connection', async () => {
    const mockIntegrations = {
      data: {
        integrations: [
          {
            id: 1,
            name: 'Test Integration',
            is_active: true
          }
        ]
      }
    };

    const mockTestResult = {
      success: true,
      data: {
        connection_test: {
          status: 'success',
          response_time: 245,
          api_version: 'v1.2.3',
          authentication: 'valid'
        }
      }
    };

    geniacsService.getIntegrations.mockResolvedValue(mockIntegrations);
    geniacsService.testConnection.mockResolvedValue(mockTestResult);

    renderWithClient(<IntegrationManagement />);

    await waitFor(() => {
      expect(screen.getByText('Test Connection')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Connection'));

    await waitFor(() => {
      expect(geniacsService.testConnection).toHaveBeenCalledWith(1);
    });
  });
});
```

## Deployment Requirements

### Environment Configuration

#### Additional .env Variables
```env
# Geniacs Integration
GENIACS_DEFAULT_TIMEOUT=30
GENIACS_MAX_RETRY_ATTEMPTS=3
GENIACS_WEBHOOK_TIMEOUT=60
GENIACS_BATCH_SIZE=100
GENIACS_SYNC_INTERVAL=300

# Field Mapping
GENIACS_DEFAULT_MAPPINGS=true
GENIACS_AUTO_CREATE_MAPPINGS=true

# Data Sync
GENIACS_AUTO_SYNC_ENABLED=true
GENIACS_RETRY_FAILED_SYNC=true
GENIACS_MAX_SYNC_DURATION=3600

# Logging
GENIACS_LOG_LEVEL=info
GENIACS_LOG_RETENTION_DAYS=30
```

### Queue Configuration

#### Geniacs Sync Jobs
```php
<?php

namespace App\Jobs;

use App\Models\GeniacsDataSync;
use App\Services\GeniacsApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessGeniacsSync implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [30, 60, 120];
    public $timeout = 1800; // 30 minutes

    public function __construct(
        private GeniacsDataSync $sync
    ) {}

    public function handle(): void
    {
        try {
            $integration = $this->sync->integration;
            $apiService = new GeniacsApiService($integration);

            // Update sync status
            $this->sync->update([
                'status' => 'processing',
                'started_at' => now()
            ]);

            // Execute sync based on entity type
            $result = match ($this->sync->entity_type) {
                'customers' => $apiService->syncCustomers(
                    json_decode($this->sync->data, true) ?? []
                ),
                'subscriptions' => $apiService->syncSubscriptions(
                    json_decode($this->sync->data, true) ?? []
                ),
                'payments' => $apiService->syncPayments(
                    json_decode($this->sync->data, true) ?? []
                ),
                'monitoring_data' => $apiService->syncMonitoringData(
                    json_decode($this->sync->data, true) ?? []
                ),
                'invoices' => $apiService->syncInvoices(
                    json_decode($this->sync->data, true) ?? []
                ),
                default => ['success' => false, 'error' => 'Unknown entity type']
            };

            if ($result['success']) {
                $this->sync->update([
                    'status' => 'success',
                    'response_data' => $result,
                    'completed_at' => now()
                ]);
            } else {
                $this->sync->update([
                    'status' => 'failed',
                    'error_message' => $result['error'] ?? 'Sync failed',
                    'response_data' => $result,
                    'completed_at' => now()
                ]);
            }

        } catch (\Exception $e) {
            Log::error("Geniacs sync job failed for sync {$this->sync->id}: {$e->getMessage()}");
            
            $this->sync->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'completed_at' => now()
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Geniacs sync job permanently failed for sync {$this->sync->id}: {$exception->getMessage()}");
        
        $this->sync->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
            'completed_at' => now()
        ]);
    }
}
```

#### Scheduler Configuration
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Process scheduled syncs
    $schedule->command('geniacs:process-scheduled-syncs')
             ->everyMinute()
             ->withoutOverlapping();

    // Retry failed syncs
    $schedule->command('geniacs:retry-failed-syncs')
             ->everyFiveMinutes()
             ->withoutOverlapping();

    // Cleanup old sync logs
    $schedule->command('geniacs:cleanup-logs')
             ->daily()
             ->at('02:00');

    // Generate sync reports
    $schedule->command('geniacs:generate-reports')
             ->weekly()
             ->mondays()
             ->at('03:00');
}
```

## Success Criteria

### Functional Requirements
- ✅ Geniacs API integration working
- ✅ Bidirectional data synchronization
- ✅ Field mapping and transformation
- ✅ Webhook event handling
- ✅ Scheduled sync automation
- ✅ Error handling and retry mechanism

### Performance Requirements
- ✅ API response time < 2 seconds
- ✅ Sync processing < 5 minutes for 1000 records
- ✅ Webhook processing < 1 second
- ✅ Field mapping application < 100ms per record
- ✅ Support for 10,000+ records per sync

### Reliability Requirements
- ✅ 99.9% sync success rate
- ✅ Automatic retry for failed operations
- ✅ Graceful handling of API downtime
- ✅ Data consistency validation
- ✅ Comprehensive audit logging

### Security Requirements
- ✅ Encrypted API credentials storage
- ✅ Webhook signature verification
- ✅ Rate limiting and throttling
- ✅ Access control for sensitive operations
- ✅ Data validation and sanitization

## Next Steps

Setelah Fase 6 selesai, sistem akan memiliki:
1. Complete Geniacs integration
2. Automated data synchronization
3. Field mapping and transformation
4. Real-time webhook processing
5. Comprehensive monitoring and logging
6. Fully integrated ISP Management System

Sistem sekarang telah lengkap dengan semua modul yang dibutuhkan untuk mengelola ISP secara end-to-end, mulai dari user management hingga integrasi dengan sistem eksternal seperti Geniacs.