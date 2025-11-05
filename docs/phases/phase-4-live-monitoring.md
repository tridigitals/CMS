# Phase 4: Live Monitoring System

## Overview

Fase 4 fokus pada sistem monitoring real-time yang komprehensif dengan dashboard interaktif, alert system, dan analytics capabilities. Fase ini membangun di atas infrastruktur monitoring dasar dari Fase 2 dengan menambahkan real-time data processing, advanced visualizations, dan intelligent alerting.

## Duration: 6 Weeks

### Week 1-3: Real-time Monitoring Infrastructure
### Week 4-5: Advanced Analytics & Reporting
### Week 6: Alert System & Notifications

## Technical Requirements

### Dependencies
```json
{
  "backend": {
    "laravel/framework": "^10.0",
    "laravel-websockets": "^1.13",
    "pusher/pusher-php-server": "^7.2",
    "spatie/laravel-webhook-server": "^3.4",
    "elastic/elastic-search": "^8.0",
    "influxdb/influxdb-php": "^3.0",
    "spatie/laravel-analytics": "^4.4",
    "spatie/laravel-backup": "^8.1"
  },
  "frontend": {
    "react": "^18.2",
    "react-router-dom": "^6.8",
    "@tanstack/react-query": "^4.24",
    "axios": "^1.3",
    "socket.io-client": "^4.6",
    "recharts": "^2.5",
    "react-grid-layout": "^1.4",
    "react-table": "^7.8",
    "d3": "^7.8",
    "react-d3-graph": "^2.6",
    "react-leaflet": "^4.2",
    "leaflet": "^1.9",
    "date-fns": "^2.29"
  }
}
```

### External Services
- **Time Series Database**: InfluxDB untuk high-performance monitoring data
- **Search & Analytics**: Elasticsearch untuk log analysis
- **Real-time Communication**: WebSockets untuk live updates
- **Notification Services**: Email, SMS, Push notifications
- **Monitoring**: Prometheus + Grafana untuk system monitoring

## Database Schema

### Monitoring Tables

#### monitoring_metrics
```sql
CREATE TABLE monitoring_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(255) NOT NULL,
    metric_type ENUM('counter', 'gauge', 'histogram', 'timer') NOT NULL,
    unit VARCHAR(50) NULL,
    description TEXT NULL,
    tags JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_metrics_name (metric_name),
    INDEX idx_metrics_type (metric_type),
    INDEX idx_metrics_active (is_active)
);
```

#### monitoring_thresholds
```sql
CREATE TABLE monitoring_thresholds (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_id BIGINT NOT NULL,
    nas_server_id BIGINT NULL,
    subscription_id BIGINT NULL,
    threshold_type ENUM('warning', 'critical', 'info') NOT NULL,
    operator ENUM('>', '>=', '<', '<=', '=', '!=', 'between', 'not_between') NOT NULL,
    threshold_value DECIMAL(15,4) NOT NULL,
    threshold_value_max DECIMAL(15,4) NULL,
    duration_seconds INT DEFAULT 300,
    is_active BOOLEAN DEFAULT TRUE,
    notification_channels JSON NULL,
    escalation_rules JSON NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (metric_id) REFERENCES monitoring_metrics(id) ON DELETE CASCADE,
    FOREIGN KEY (nas_server_id) REFERENCES nas_servers(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_thresholds_metric (metric_id),
    INDEX idx_thresholds_nas (nas_server_id),
    INDEX idx_thresholds_subscription (subscription_id),
    INDEX idx_thresholds_type (threshold_type),
    INDEX idx_thresholds_active (is_active)
);
```

#### alerts
```sql
CREATE TABLE alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    alert_code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('info', 'warning', 'critical', 'emergency') NOT NULL,
    status ENUM('open', 'acknowledged', 'resolved', 'suppressed') DEFAULT 'open',
    source_type ENUM('nas_server', 'subscription', 'customer', 'system') NOT NULL,
    source_id BIGINT NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    current_value DECIMAL(15,4) NOT NULL,
    threshold_value DECIMAL(15,4) NOT NULL,
    triggered_at TIMESTAMP NOT NULL,
    acknowledged_at TIMESTAMP NULL,
    acknowledged_by BIGINT NULL,
    resolved_at TIMESTAMP NULL,
    resolved_by BIGINT NULL,
    resolution_notes TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_alerts_code (alert_code),
    INDEX idx_alerts_status (status),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_source (source_type, source_id),
    INDEX idx_alerts_triggered (triggered_at),
    INDEX idx_alerts_metric (metric_name)
);
```

#### alert_notifications
```sql
CREATE TABLE alert_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    alert_id BIGINT NOT NULL,
    channel_type ENUM('email', 'sms', 'webhook', 'push', 'slack') NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    status ENUM('pending', 'sent', 'failed', 'retrying') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    response_data JSON NULL,
    error_message TEXT NULL,
    retry_count INT DEFAULT 0,
    next_retry_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    
    INDEX idx_notifications_alert (alert_id),
    INDEX idx_notifications_status (status),
    INDEX idx_notifications_channel (channel_type),
    INDEX idx_notifications_retry (next_retry_at)
);
```

#### monitoring_dashboards
```sql
CREATE TABLE monitoring_dashboards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    layout_config JSON NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    refresh_interval INT DEFAULT 30,
    time_range VARCHAR(50) DEFAULT '1h',
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_dashboards_slug (slug),
    INDEX idx_dashboards_public (is_public),
    INDEX idx_dashboards_default (is_default),
    INDEX idx_dashboards_creator (created_by)
);
```

#### monitoring_widgets
```sql
CREATE TABLE monitoring_widgets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dashboard_id BIGINT NOT NULL,
    widget_type ENUM('metric', 'chart', 'table', 'map', 'gauge', 'status') NOT NULL,
    title VARCHAR(255) NOT NULL,
    position_x INT NOT NULL,
    position_y INT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    config JSON NOT NULL,
    data_source JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (dashboard_id) REFERENCES monitoring_dashboards(id) ON DELETE CASCADE,
    
    INDEX idx_widgets_dashboard (dashboard_id),
    INDEX idx_widgets_type (widget_type),
    INDEX idx_widgets_active (is_active)
);
```

#### monitoring_reports
```sql
CREATE TABLE monitoring_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    report_type ENUM('performance', 'availability', 'usage', 'capacity', 'custom') NOT NULL,
    description TEXT NULL,
    template_config JSON NOT NULL,
    schedule_config JSON NULL,
    recipients JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_generated_at TIMESTAMP NULL,
    next_generation_at TIMESTAMP NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_reports_type (report_type),
    INDEX idx_reports_active (is_active),
    INDEX idx_reports_schedule (next_generation_at),
    INDEX idx_reports_creator (created_by)
);
```

#### monitoring_report_instances
```sql
CREATE TABLE monitoring_report_instances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_id BIGINT NOT NULL,
    instance_name VARCHAR(255) NOT NULL,
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    file_path VARCHAR(255) NULL,
    file_size BIGINT NULL,
    parameters JSON NULL,
    error_message TEXT NULL,
    generated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (report_id) REFERENCES monitoring_reports(id) ON DELETE CASCADE,
    
    INDEX idx_instances_report (report_id),
    INDEX idx_instances_status (status),
    INDEX idx_instances_generated (generated_at)
);
```

## API Design

### Real-time Monitoring Endpoints

#### GET /api/monitoring/realtime
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: metrics, nas_servers, subscriptions

// Response
{
    "success": true,
    "data": {
        "timestamp": "2024-01-01T10:00:00Z",
        "metrics": [
            {
                "nas_server_id": 1,
                "metric_name": "cpu_usage",
                "value": 45.5,
                "unit": "percent",
                "timestamp": "2024-01-01T10:00:00Z"
            },
            {
                "nas_server_id": 1,
                "metric_name": "memory_usage",
                "value": 67.2,
                "unit": "percent",
                "timestamp": "2024-01-01T10:00:00Z"
            },
            {
                "subscription_id": 1,
                "metric_name": "bandwidth",
                "value": 1048576000,
                "unit": "bytes",
                "timestamp": "2024-01-01T10:00:00Z"
            }
        ],
        "alerts": [
            {
                "id": 1,
                "alert_code": "HIGH_CPU_USAGE",
                "title": "High CPU Usage Detected",
                "severity": "warning",
                "status": "open",
                "source_type": "nas_server",
                "source_id": 1,
                "current_value": 85.5,
                "threshold_value": 80.0,
                "triggered_at": "2024-01-01T09:55:00Z"
            }
        ],
        "system_status": {
            "total_nas_servers": 5,
            "online_servers": 4,
            "total_subscriptions": 150,
            "active_subscriptions": 142,
            "active_alerts": 3,
            "critical_alerts": 1
        }
    }
}
```

#### GET /api/monitoring/metrics
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: metric_name, nas_server_id, subscription_id, from, to, interval

// Response
{
    "success": true,
    "data": {
        "metric_name": "cpu_usage",
        "time_range": {
            "from": "2024-01-01T00:00:00Z",
            "to": "2024-01-01T23:59:59Z",
            "interval": "1h"
        },
        "series": [
            {
                "nas_server_id": 1,
                "nas_server_name": "Main Router",
                "data_points": [
                    {
                        "timestamp": "2024-01-01T00:00:00Z",
                        "value": 25.5
                    },
                    {
                        "timestamp": "2024-01-01T01:00:00Z",
                        "value": 32.1
                    }
                ]
            }
        ],
        "statistics": {
            "min": 15.2,
            "max": 85.5,
            "avg": 42.3,
            "p95": 78.9,
            "p99": 82.1
        }
    }
}
```

#### GET /api/monitoring/alerts
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: status, severity, source_type, from, to, page, limit

// Response
{
    "success": true,
    "data": {
        "alerts": [
            {
                "id": 1,
                "alert_code": "HIGH_CPU_USAGE",
                "title": "High CPU Usage Detected",
                "description": "CPU usage on Main Router exceeded 80% threshold",
                "severity": "warning",
                "status": "open",
                "source_type": "nas_server",
                "source_id": 1,
                "source_name": "Main Router",
                "metric_name": "cpu_usage",
                "current_value": 85.5,
                "threshold_value": 80.0,
                "triggered_at": "2024-01-01T09:55:00Z",
                "duration": "5m",
                "metadata": {
                    "nas_server_ip": "192.168.1.1",
                    "affected_subscriptions": 25
                }
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 5,
            "total_items": 50,
            "per_page": 10
        },
        "summary": {
            "total_alerts": 50,
            "open_alerts": 12,
            "critical_alerts": 3,
            "acknowledged_alerts": 8
        }
    }
}
```

#### POST /api/monitoring/alerts/{id}/acknowledge
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "notes": "Investigating the issue. Working on resolution."
}

// Response
{
    "success": true,
    "message": "Alert acknowledged successfully",
    "data": {
        "alert": {
            "id": 1,
            "status": "acknowledged",
            "acknowledged_at": "2024-01-01T10:05:00Z",
            "acknowledged_by": {
                "id": 1,
                "name": "Admin User"
            },
            "notes": "Investigating the issue. Working on resolution."
        }
    }
}
```

#### POST /api/monitoring/alerts/{id}/resolve
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "resolution_notes": "CPU usage normalized after restarting problematic service."
}

// Response
{
    "success": true,
    "message": "Alert resolved successfully",
    "data": {
        "alert": {
            "id": 1,
            "status": "resolved",
            "resolved_at": "2024-01-01T10:15:00Z",
            "resolved_by": {
                "id": 1,
                "name": "Admin User"
            },
            "resolution_notes": "CPU usage normalized after restarting problematic service."
        }
    }
}
```

### Dashboard Management Endpoints

#### GET /api/monitoring/dashboards
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: is_public, is_default, created_by

// Response
{
    "success": true,
    "data": {
        "dashboards": [
            {
                "id": 1,
                "name": "Network Overview",
                "slug": "network-overview",
                "description": "Main network monitoring dashboard",
                "is_public": true,
                "is_default": true,
                "refresh_interval": 30,
                "time_range": "1h",
                "widgets_count": 8,
                "created_by": {
                    "id": 1,
                    "name": "Admin User"
                },
                "created_at": "2024-01-01T10:00:00Z"
            }
        ]
    }
}
```

#### POST /api/monitoring/dashboards
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "name": "Customer Performance",
    "slug": "customer-performance",
    "description": "Customer-specific performance metrics",
    "is_public": false,
    "refresh_interval": 60,
    "time_range": "24h",
    "layout_config": {
        "columns": 12,
        "row_height": 100,
        "margin": [10, 10]
    },
    "widgets": [
        {
            "widget_type": "chart",
            "title": "Bandwidth Usage",
            "position_x": 0,
            "position_y": 0,
            "width": 6,
            "height": 4,
            "config": {
                "chart_type": "line",
                "metric": "bandwidth",
                "aggregation": "avg"
            }
        }
    ]
}

// Response
{
    "success": true,
    "message": "Dashboard created successfully",
    "data": {
        "dashboard": {
            "id": 2,
            "name": "Customer Performance",
            "slug": "customer-performance",
            "is_public": false,
            "refresh_interval": 60,
            "time_range": "24h"
        }
    }
}
```

#### GET /api/monitoring/dashboards/{id}/data
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: time_range, refresh

// Response
{
    "success": true,
    "data": {
        "dashboard": {
            "id": 1,
            "name": "Network Overview",
            "time_range": "1h",
            "last_updated": "2024-01-01T10:00:00Z"
        },
        "widgets": [
            {
                "id": 1,
                "widget_type": "metric",
                "title": "Total Bandwidth",
                "data": {
                    "current_value": 1048576000,
                    "previous_value": 987654321,
                    "change_percent": 6.2,
                    "unit": "bytes",
                    "trend": "up"
                }
            },
            {
                "id": 2,
                "widget_type": "chart",
                "title": "CPU Usage",
                "data": {
                    "series": [
                        {
                            "name": "Main Router",
                            "data": [
                                {"timestamp": "2024-01-01T09:00:00Z", "value": 25.5},
                                {"timestamp": "2024-01-01T09:15:00Z", "value": 32.1},
                                {"timestamp": "2024-01-01T09:30:00Z", "value": 45.8},
                                {"timestamp": "2024-01-01T09:45:00Z", "value": 38.2},
                                {"timestamp": "2024-01-01T10:00:00Z", "value": 42.3}
                            ]
                        }
                    ]
                }
            }
        ]
    }
}
```

### Analytics & Reporting Endpoints

#### GET /api/monitoring/analytics/performance
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: from, to, group_by, nas_server_id, subscription_id

// Response
{
    "success": true,
    "data": {
        "time_range": {
            "from": "2024-01-01T00:00:00Z",
            "to": "2024-01-01T23:59:59Z"
        },
        "metrics": {
            "availability": {
                "overall": 99.85,
                "by_nas_server": [
                    {
                        "nas_server_id": 1,
                        "nas_server_name": "Main Router",
                        "availability": 99.92,
                        "downtime_minutes": 6
                    }
                ]
            },
            "performance": {
                "avg_response_time": 45.2,
                "max_response_time": 125.8,
                "p95_response_time": 78.5,
                "throughput": 1048576000
            },
            "usage": {
                "total_bandwidth": 1073741824000,
                "peak_bandwidth": 2147483648,
                "avg_bandwidth": 447392424,
                "data_transfer": 8589934592000
            }
        },
        "trends": {
            "bandwidth_growth": 12.5,
            "user_growth": 8.3,
            "performance_change": -5.2
        }
    }
}
```

#### POST /api/monitoring/reports/generate
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "report_type": "performance",
    "name": "Weekly Performance Report",
    "time_range": {
        "from": "2024-01-01T00:00:00Z",
        "to": "2024-01-07T23:59:59Z"
    },
    "parameters": {
        "include_charts": true,
        "include_raw_data": false,
        "format": "pdf",
        "recipients": ["admin@example.com", "manager@example.com"]
    },
    "template_config": {
        "logo_url": "https://example.com/logo.png",
        "company_name": "ISP Management System",
        "include_summary": true,
        "include_recommendations": true
    }
}

// Response
{
    "success": true,
    "message": "Report generation started",
    "data": {
        "report_instance": {
            "id": 1,
            "instance_name": "Weekly Performance Report - 2024-01-01",
            "status": "generating",
            "estimated_completion": "2024-01-01T10:05:00Z"
        }
    }
}
```

#### GET /api/monitoring/reports/{instanceId}/download
```php
// Headers: Authorization: Bearer {token}

// Response: File download with appropriate headers
Content-Type: application/pdf
Content-Disposition: attachment; filename="weekly-performance-report-2024-01-01.pdf"
Content-Length: 2048576

[PDF file content]
```

## Implementation Details

### Backend Implementation

#### Real-time Monitoring Service
```php
<?php

namespace App\Services;

use App\Models\NasServer;
use App\Models\CustomerSubscription;
use App\Models\MonitoringData;
use App\Models\Alert;
use App\Models\MonitoringMetric;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;

class RealTimeMonitoringService
{
    private MikroTikService $mikrotikService;
    private AlertService $alertService;

    public function __construct(
        MikroTikService $mikrotikService,
        AlertService $alertService
    ) {
        $this->mikrotikService = $mikrotikService;
        $this->alertService = $alertService;
    }

    public function collectRealTimeData(): array
    {
        $data = [];
        $timestamp = now();

        // Collect NAS server metrics
        $nasServers = NasServer::active()->get();
        foreach ($nasServers as $nas) {
            try {
                if ($this->mikrotikService->connect($nas)) {
                    $nasData = $this->collectNasMetrics($nas, $timestamp);
                    $data = array_merge($data, $nasData);
                    
                    // Update NAS status
                    $nas->update(['last_seen' => now()]);
                }
            } catch (\Exception $e) {
                Log::error("Failed to collect data from NAS {$nas->name}: {$e->getMessage()}");
                $this->handleNasOffline($nas, $timestamp);
            }
        }

        // Collect subscription metrics
        $subscriptions = CustomerSubscription::active()->get();
        foreach ($subscriptions as $subscription) {
            try {
                $subscriptionData = $this->collectSubscriptionMetrics($subscription, $timestamp);
                $data = array_merge($data, $subscriptionData);
            } catch (\Exception $e) {
                Log::error("Failed to collect data from subscription {$subscription->id}: {$e->getMessage()}");
            }
        }

        // Store metrics in database
        $this->storeMetrics($data);

        // Check for alerts
        $this->checkThresholds($data);

        // Publish real-time data
        $this->publishRealTimeData($data);

        return $data;
    }

    private function collectNasMetrics(NasServer $nas, Carbon $timestamp): array
    {
        $metrics = [];
        $nasId = $nas->id;

        // System resources
        $resources = $this->mikrotikService->getSystemResource($nas);
        if (!empty($resources)) {
            $resource = $resources[0];
            
            $metrics[] = [
                'nas_server_id' => $nasId,
                'metric_type' => 'cpu_usage',
                'value' => floatval($resource['cpu-load'] ?? 0),
                'unit' => 'percent',
                'recorded_at' => $timestamp
            ];

            $metrics[] = [
                'nas_server_id' => $nasId,
                'metric_type' => 'memory_usage',
                'value' => $this->calculateMemoryUsage($resource),
                'unit' => 'percent',
                'recorded_at' => $timestamp
            ];

            $metrics[] = [
                'nas_server_id' => $nasId,
                'metric_type' => 'uptime',
                'value' => $this->parseUptime($resource['uptime'] ?? '0s'),
                'unit' => 'seconds',
                'recorded_at' => $timestamp
            ];
        }

        // Interface traffic
        $traffic = $this->mikrotikService->getTraffic($nas);
        foreach ($traffic as $interface) {
            if (isset($interface['rx-byte'], $interface['tx-byte'])) {
                $rxBytes = intval($interface['rx-byte']);
                $txBytes = intval($interface['tx-byte']);
                $totalBytes = $rxBytes + $txBytes;

                $metrics[] = [
                    'nas_server_id' => $nasId,
                    'metric_type' => 'bandwidth',
                    'value' => $totalBytes,
                    'unit' => 'bytes',
                    'recorded_at' => $timestamp,
                    'additional_data' => [
                        'interface' => $interface['name'] ?? 'unknown',
                        'rx_bytes' => $rxBytes,
                        'tx_bytes' => $txBytes
                    ]
                ];
            }
        }

        // Active connections
        $connections = $this->mikrotikService->getActiveConnections($nas);
        $metrics[] = [
            'nas_server_id' => $nasId,
            'metric_type' => 'connection_count',
            'value' => count($connections),
            'unit' => 'count',
            'recorded_at' => $timestamp
        ];

        return $metrics;
    }

    private function collectSubscriptionMetrics(CustomerSubscription $subscription, Carbon $timestamp): array
    {
        $metrics = [];
        $nasServer = $subscription->nasServer;

        try {
            if ($this->mikrotikService->connect($nasServer)) {
                $activeConnections = $this->mikrotikService->getActiveConnections($nasServer);
                
                // Find this subscription's connection
                $userConnection = collect($activeConnections)->firstWhere('name', $subscription->username);
                
                if ($userConnection) {
                    $rxBytes = intval($userConnection['bytes-in'] ?? 0);
                    $txBytes = intval($userConnection['bytes-out'] ?? 0);
                    $totalBytes = $rxBytes + $txBytes;

                    $metrics[] = [
                        'nas_server_id' => $nasServer->id,
                        'subscription_id' => $subscription->id,
                        'metric_type' => 'bandwidth',
                        'value' => $totalBytes,
                        'unit' => 'bytes',
                        'recorded_at' => $timestamp,
                        'additional_data' => [
                            'rx_bytes' => $rxBytes,
                            'tx_bytes' => $txBytes,
                            'uptime' => $userConnection['uptime'] ?? '0s'
                        ]
                    ];

                    // Calculate data usage percentage if plan has limit
                    if ($subscription->servicePlan->data_limit && $subscription->servicePlan->data_unit !== 'unlimited') {
                        $usagePercentage = ($totalBytes / $subscription->servicePlan->data_limit) * 100;
                        
                        $metrics[] = [
                            'nas_server_id' => $nasServer->id,
                            'subscription_id' => $subscription->id,
                            'metric_type' => 'data_usage_percentage',
                            'value' => min($usagePercentage, 100),
                            'unit' => 'percent',
                            'recorded_at' => $timestamp
                        ];
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error("Failed to collect metrics for subscription {$subscription->id}: {$e->getMessage()}");
        }

        return $metrics;
    }

    private function storeMetrics(array $metrics): void
    {
        $chunks = array_chunk($metrics, 1000);
        
        foreach ($chunks as $chunk) {
            MonitoringData::insert($chunk);
        }
    }

    private function checkThresholds(array $metrics): void
    {
        foreach ($metrics as $metric) {
            $thresholds = $this->getThresholdsForMetric($metric);
            
            foreach ($thresholds as $threshold) {
                if ($this->evaluateThreshold($metric, $threshold)) {
                    $this->triggerAlert($metric, $threshold);
                }
            }
        }
    }

    private function getThresholdsForMetric(array $metric): array
    {
        $query = DB::table('monitoring_thresholds')
            ->join('monitoring_metrics', 'monitoring_thresholds.metric_id', '=', 'monitoring_metrics.id')
            ->where('monitoring_metrics.metric_name', $metric['metric_type'])
            ->where('monitoring_thresholds.is_active', true);

        if (isset($metric['nas_server_id'])) {
            $query->where(function ($q) use ($metric) {
                $q->whereNull('monitoring_thresholds.nas_server_id')
                  ->orWhere('monitoring_thresholds.nas_server_id', $metric['nas_server_id']);
            });
        }

        if (isset($metric['subscription_id'])) {
            $query->where(function ($q) use ($metric) {
                $q->whereNull('monitoring_thresholds.subscription_id')
                  ->orWhere('monitoring_thresholds.subscription_id', $metric['subscription_id']);
            });
        }

        return $query->get()->toArray();
    }

    private function evaluateThreshold(array $metric, object $threshold): bool
    {
        $value = $metric['value'];
        $thresholdValue = $threshold->threshold_value;
        $operator = $threshold->operator;

        return match ($operator) {
            '>' => $value > $thresholdValue,
            '>=' => $value >= $thresholdValue,
            '<' => $value < $thresholdValue,
            '<=' => $value <= $thresholdValue,
            '=' => $value == $thresholdValue,
            '!=' => $value != $thresholdValue,
            'between' => $value >= $thresholdValue && $value <= $threshold->threshold_value_max,
            'not_between' => $value < $thresholdValue || $value > $threshold->threshold_value_max,
            default => false
        };
    }

    private function triggerAlert(array $metric, object $threshold): void
    {
        $alertCode = $this->generateAlertCode($metric, $threshold);
        
        // Check if alert already exists and is open
        $existingAlert = Alert::where('alert_code', $alertCode)
                              ->where('status', 'open')
                              ->first();

        if ($existingAlert) {
            return; // Alert already active
        }

        $alert = Alert::create([
            'alert_code' => $alertCode,
            'title' => $this->generateAlertTitle($metric, $threshold),
            'description' => $this->generateAlertDescription($metric, $threshold),
            'severity' => $threshold->threshold_type,
            'status' => 'open',
            'source_type' => isset($metric['subscription_id']) ? 'subscription' : 'nas_server',
            'source_id' => $metric['subscription_id'] ?? $metric['nas_server_id'],
            'metric_name' => $metric['metric_type'],
            'current_value' => $metric['value'],
            'threshold_value' => $threshold->threshold_value,
            'triggered_at' => $metric['recorded_at'],
            'metadata' => $metric['additional_data'] ?? []
        ]);

        $this->alertService->processAlert($alert);
    }

    private function publishRealTimeData(array $data): void
    {
        $payload = [
            'timestamp' => now()->toISOString(),
            'metrics' => $data,
            'system_status' => $this->getSystemStatus()
        ];

        // Publish to WebSocket
        Redis::publish('monitoring.realtime', json_encode($payload));
    }

    private function getSystemStatus(): array
    {
        return [
            'total_nas_servers' => NasServer::count(),
            'online_servers' => NasServer::online()->count(),
            'total_subscriptions' => CustomerSubscription::count(),
            'active_subscriptions' => CustomerSubscription::active()->count(),
            'active_alerts' => Alert::where('status', 'open')->count(),
            'critical_alerts' => Alert::where('severity', 'critical')->where('status', 'open')->count()
        ];
    }

    private function calculateMemoryUsage(array $resource): float
    {
        $totalMemory = intval($resource['total-memory'] ?? 0);
        $freeMemory = intval($resource['free-memory'] ?? 0);
        
        if ($totalMemory === 0) {
            return 0;
        }

        return (($totalMemory - $freeMemory) / $totalMemory) * 100;
    }

    private function parseUptime(string $uptime): int
    {
        // Parse uptime string like "5w2d12h30m15s" to seconds
        $patterns = [
            'w' => 7 * 24 * 60 * 60,
            'd' => 24 * 60 * 60,
            'h' => 60 * 60,
            'm' => 60,
            's' => 1
        ];

        $totalSeconds = 0;
        foreach ($patterns as $unit => $seconds) {
            if (preg_match("/(\d+){$unit}/", $uptime, $matches)) {
                $totalSeconds += intval($matches[1]) * $seconds;
            }
        }

        return $totalSeconds;
    }

    private function generateAlertCode(array $metric, object $threshold): string
    {
        $sourceType = isset($metric['subscription_id']) ? 'SUB' : 'NAS';
        $sourceId = $metric['subscription_id'] ?? $metric['nas_server_id'];
        $metricName = strtoupper(str_replace('_', '', $metric['metric_type']));
        
        return "{$sourceType}-{$sourceId}-{$metricName}-{$threshold->threshold_type}";
    }

    private function generateAlertTitle(array $metric, object $threshold): string
    {
        $metricName = ucwords(str_replace('_', ' ', $metric['metric_type']));
        $severity = ucfirst($threshold->threshold_type);
        
        return "{$severity} {$metricName} Detected";
    }

    private function generateAlertDescription(array $metric, object $threshold): string
    {
        $sourceType = isset($metric['subscription_id']) ? 'Subscription' : 'NAS Server';
        $sourceId = $metric['subscription_id'] ?? $metric['nas_server_id'];
        $metricName = ucwords(str_replace('_', ' ', $metric['metric_type']));
        $value = $metric['value'];
        $thresholdValue = $threshold->threshold_value;
        $operator = $threshold->operator;

        return "{$metricName} for {$sourceType} {$sourceId} is {$value} (threshold: {$operator} {$thresholdValue})";
    }

    private function handleNasOffline(NasServer $nas, Carbon $timestamp): void
    {
        // Check if there's already an offline alert
        $existingAlert = Alert::where('source_type', 'nas_server')
                              ->where('source_id', $nas->id)
                              ->where('metric_name', 'connection_status')
                              ->where('status', 'open')
                              ->first();

        if ($existingAlert) {
            return;
        }

        Alert::create([
            'alert_code' => "NAS-{$nas->id}-CONNECTION-CRITICAL",
            'title' => 'NAS Server Offline',
            'description' => "NAS Server {$nas->name} ({$nas->ip_address}) is not responding",
            'severity' => 'critical',
            'status' => 'open',
            'source_type' => 'nas_server',
            'source_id' => $nas->id,
            'metric_name' => 'connection_status',
            'current_value' => 0,
            'threshold_value' => 1,
            'triggered_at' => $timestamp
        ]);
    }
}
```

#### Alert Service
```php
<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\AlertNotification;
use App\Models\MonitoringThreshold;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;

class AlertService
{
    public function processAlert(Alert $alert): void
    {
        try {
            // Get notification channels from threshold
            $threshold = $this->getThresholdForAlert($alert);
            $channels = $threshold->notification_channels ?? ['email'];

            foreach ($channels as $channel) {
                $this->sendNotification($alert, $channel);
            }

            // Check escalation rules
            $this->checkEscalation($alert);

        } catch (\Exception $e) {
            Log::error("Failed to process alert {$alert->id}: {$e->getMessage()}");
        }
    }

    public function sendNotification(Alert $alert, string $channel): bool
    {
        try {
            $notification = AlertNotification::create([
                'alert_id' => $alert->id,
                'channel_type' => $channel,
                'recipient' => $this->getRecipient($alert, $channel),
                'status' => 'pending'
            ]);

            $success = $this->dispatchNotification($alert, $notification, $channel);

            $notification->update([
                'status' => $success ? 'sent' : 'failed',
                'sent_at' => $success ? now() : null,
                'response_data' => $success ? ['sent_at' => now()] : null
            ]);

            return $success;

        } catch (\Exception $e) {
            Log::error("Failed to send {$channel} notification for alert {$alert->id}: {$e->getMessage()}");
            return false;
        }
    }

    private function dispatchNotification(Alert $alert, AlertNotification $notification, string $channel): bool
    {
        return match ($channel) {
            'email' => $this->sendEmailNotification($alert, $notification),
            'sms' => $this->sendSmsNotification($alert, $notification),
            'webhook' => $this->sendWebhookNotification($alert, $notification),
            'slack' => $this->sendSlackNotification($alert, $notification),
            'push' => $this->sendPushNotification($alert, $notification),
            default => false
        };
    }

    private function sendEmailNotification(Alert $alert, AlertNotification $notification): bool
    {
        try {
            $recipients = $this->getEmailRecipients($alert);
            
            foreach ($recipients as $recipient) {
                Mail::to($recipient)->send(new \App\Mail\AlertNotification($alert));
            }

            return true;

        } catch (\Exception $e) {
            Log::error("Failed to send email notification: {$e->getMessage()}");
            return false;
        }
    }

    private function sendSmsNotification(Alert $alert, AlertNotification $notification): bool
    {
        try {
            $recipients = $this->getSmsRecipients($alert);
            $message = $this->formatSmsMessage($alert);

            foreach ($recipients as $recipient) {
                $this->sendSms($recipient, $message);
            }

            return true;

        } catch (\Exception $e) {
            Log::error("Failed to send SMS notification: {$e->getMessage()}");
            return false;
        }
    }

    private function sendWebhookNotification(Alert $alert, AlertNotification $notification): bool
    {
        try {
            $webhookUrl = config('monitoring.webhook_url');
            if (!$webhookUrl) {
                return false;
            }

            $payload = [
                'alert_id' => $alert->id,
                'alert_code' => $alert->alert_code,
                'title' => $alert->title,
                'description' => $alert->description,
                'severity' => $alert->severity,
                'source_type' => $alert->source_type,
                'source_id' => $alert->source_id,
                'current_value' => $alert->current_value,
                'threshold_value' => $alert->threshold_value,
                'triggered_at' => $alert->triggered_at->toISOString(),
                'metadata' => $alert->metadata
            ];

            $response = Http::post($webhookUrl, $payload);
            
            return $response->successful();

        } catch (\Exception $e) {
            Log::error("Failed to send webhook notification: {$e->getMessage()}");
            return false;
        }
    }

    private function sendSlackNotification(Alert $alert, AlertNotification $notification): bool
    {
        try {
            $webhookUrl = config('monitoring.slack_webhook_url');
            if (!$webhookUrl) {
                return false;
            }

            $color = match ($alert->severity) {
                'critical' => 'danger',
                'warning' => 'warning',
                'info' => 'good',
                default => 'warning'
            };

            $payload = [
                'attachments' => [
                    [
                        'color' => $color,
                        'title' => $alert->title,
                        'text' => $alert->description,
                        'fields' => [
                            [
                                'title' => 'Severity',
                                'value' => strtoupper($alert->severity),
                                'short' => true
                            ],
                            [
                                'title' => 'Source',
                                'value' => "{$alert->source_type} #{$alert->source_id}",
                                'short' => true
                            ],
                            [
                                'title' => 'Current Value',
                                'value' => $alert->current_value,
                                'short' => true
                            ],
                            [
                                'title' => 'Threshold',
                                'value' => $alert->threshold_value,
                                'short' => true
                            ],
                            [
                                'title' => 'Triggered At',
                                'value' => $alert->triggered_at->format('Y-m-d H:i:s'),
                                'short' => true
                            ]
                        ],
                        'footer' => 'ISP Management System',
                        'ts' => $alert->triggered_at->timestamp
                    ]
                ]
            ];

            $response = Http::post($webhookUrl, $payload);
            
            return $response->successful();

        } catch (\Exception $e) {
            Log::error("Failed to send Slack notification: {$e->getMessage()}");
            return false;
        }
    }

    private function sendPushNotification(Alert $alert, AlertNotification $notification): bool
    {
        try {
            // Implement push notification logic
            // This could integrate with services like Firebase Cloud Messaging
            return true;

        } catch (\Exception $e) {
            Log::error("Failed to send push notification: {$e->getMessage()}");
            return false;
        }
    }

    private function checkEscalation(Alert $alert): void
    {
        $threshold = $this->getThresholdForAlert($alert);
        $escalationRules = $threshold->escalation_rules ?? [];

        if (empty($escalationRules)) {
            return;
        }

        $timeSinceTriggered = now()->diffInMinutes($alert->triggered_at);

        foreach ($escalationRules as $rule) {
            if ($timeSinceTriggered >= $rule['after_minutes']) {
                $this->escalateAlert($alert, $rule);
            }
        }
    }

    private function escalateAlert(Alert $alert, array $rule): void
    {
        // Check if already escalated to this level
        $alreadyEscalated = AlertNotification::where('alert_id', $alert->id)
                                          ->where('channel_type', $rule['channel'])
                                          ->where('status', 'sent')
                                          ->exists();

        if ($alreadyEscalated) {
            return;
        }

        // Send escalation notification
        $this->sendNotification($alert, $rule['channel']);

        Log::info("Alert {$alert->id} escalated to {$rule['channel']} after {$rule['after_minutes']} minutes");
    }

    private function getThresholdForAlert(Alert $alert): ?MonitoringThreshold
    {
        return MonitoringThreshold::join('monitoring_metrics', 'monitoring_thresholds.metric_id', '=', 'monitoring_metrics.id')
            ->where('monitoring_metrics.metric_name', $alert->metric_name)
            ->where('monitoring_thresholds.threshold_type', $alert->severity)
            ->where(function ($query) use ($alert) {
                if ($alert->source_type === 'nas_server') {
                    $query->whereNull('monitoring_thresholds.subscription_id')
                          ->where(function ($q) use ($alert) {
                              $q->whereNull('monitoring_thresholds.nas_server_id')
                                ->orWhere('monitoring_thresholds.nas_server_id', $alert->source_id);
                          });
                } else {
                    $query->whereNull('monitoring_thresholds.nas_server_id')
                          ->where(function ($q) use ($alert) {
                              $q->whereNull('monitoring_thresholds.subscription_id')
                                ->orWhere('monitoring_thresholds.subscription_id', $alert->source_id);
                          });
                }
            })
            ->first();
    }

    private function getRecipient(Alert $alert, string $channel): string
    {
        return match ($channel) {
            'email' => $this->getEmailRecipients($alert)[0] ?? '',
            'sms' => $this->getSmsRecipients($alert)[0] ?? '',
            'webhook' => config('monitoring.webhook_url'),
            'slack' => config('monitoring.slack_webhook_url'),
            default => ''
        };
    }

    private function getEmailRecipients(Alert $alert): array
    {
        $recipients = config('monitoring.email_recipients', []);
        
        // Add specific recipients based on alert severity
        if ($alert->severity === 'critical') {
            $recipients = array_merge($recipients, config('monitoring.critical_email_recipients', []));
        }

        return array_unique($recipients);
    }

    private function getSmsRecipients(Alert $alert): array
    {
        $recipients = config('monitoring.sms_recipients', []);
        
        // Add specific recipients based on alert severity
        if ($alert->severity === 'critical') {
            $recipients = array_merge($recipients, config('monitoring.critical_sms_recipients', []));
        }

        return array_unique($recipients);
    }

    private function formatSmsMessage(Alert $alert): string
    {
        $severity = strtoupper($alert->severity);
        $source = "{$alert->source_type} #{$alert->source_id}";
        
        return "[{$severity}] {$alert->title} - {$source}: {$alert->current_value} (Threshold: {$alert->threshold_value})";
    }

    private function sendSms(string $recipient, string $message): bool
    {
        // Implement SMS sending logic
        // This could integrate with services like Twilio, Nexmo, etc.
        return true;
    }
}
```

#### Analytics Service
```php
<?php

namespace App\Services;

use App\Models\MonitoringData;
use App\Models\Alert;
use App\Models\NasServer;
use App\Models\CustomerSubscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function getPerformanceAnalytics(Carbon $from, Carbon $to, array $filters = []): array
    {
        return [
            'availability' => $this->calculateAvailability($from, $to, $filters),
            'performance' => $this->calculatePerformanceMetrics($from, $to, $filters),
            'usage' => $this->calculateUsageMetrics($from, $to, $filters),
            'trends' => $this->calculateTrends($from, $to, $filters)
        ];
    }

    public function calculateAvailability(Carbon $from, Carbon $to, array $filters = []): array
    {
        $nasQuery = MonitoringData::where('metric_type', 'connection_status')
                                  ->whereBetween('recorded_at', [$from, $to]);

        if (isset($filters['nas_server_id'])) {
            $nasQuery->where('nas_server_id', $filters['nas_server_id']);
        }

        $nasData = $nasQuery->get();

        $availabilityByNas = [];
        $totalUptime = 0;
        $totalDowntime = 0;
        $totalTime = $to->diffInSeconds($from);

        foreach ($nasData->groupBy('nas_server_id') as $nasId => $dataPoints) {
            $uptime = $dataPoints->where('value', 1)->count() * 300; // Assuming 5-minute intervals
            $downtime = $dataPoints->where('value', 0)->count() * 300;
            
            $availability = $totalTime > 0 ? (($uptime / $totalTime) * 100) : 0;
            
            $availabilityByNas[] = [
                'nas_server_id' => $nasId,
                'nas_server_name' => NasServer::find($nasId)->name ?? 'Unknown',
                'availability' => round($availability, 2),
                'uptime_seconds' => $uptime,
                'downtime_seconds' => $downtime,
                'downtime_minutes' => round($downtime / 60, 2)
            ];

            $totalUptime += $uptime;
            $totalDowntime += $downtime;
        }

        $overallAvailability = $totalTime > 0 ? (($totalUptime / $totalTime) * 100) : 100;

        return [
            'overall' => round($overallAvailability, 2),
            'by_nas_server' => $availabilityByNas,
            'total_downtime_minutes' => round($totalDowntime / 60, 2),
            'sla_compliance' => $overallAvailability >= 99.5
        ];
    }

    public function calculatePerformanceMetrics(Carbon $from, Carbon $to, array $filters = []): array
    {
        // Response time metrics
        $responseTimeData = $this->getMetricData('response_time', $from, $to, $filters);
        
        // Throughput metrics
        $throughputData = $this->getMetricData('throughput', $from, $to, $filters);

        return [
            'avg_response_time' => $responseTimeData->avg('value') ?? 0,
            'max_response_time' => $responseTimeData->max('value') ?? 0,
            'p95_response_time' => $this->calculatePercentile($responseTimeData, 95),
            'p99_response_time' => $this->calculatePercentile($responseTimeData, 99),
            'throughput' => $throughputData->sum('value') ?? 0,
            'peak_throughput' => $throughputData->max('value') ?? 0,
            'avg_throughput' => $throughputData->avg('value') ?? 0
        ];
    }

    public function calculateUsageMetrics(Carbon $from, Carbon $to, array $filters = []): array
    {
        // Bandwidth usage
        $bandwidthData = $this->getMetricData('bandwidth', $from, $to, $filters);
        
        // Connection count
        $connectionData = $this->getMetricData('connection_count', $from, $to, $filters);

        $totalBandwidth = $bandwidthData->sum('value') ?? 0;
        $peakBandwidth = $bandwidthData->max('value') ?? 0;
        $avgBandwidth = $bandwidthData->avg('value') ?? 0;

        return [
            'total_bandwidth' => $totalBandwidth,
            'peak_bandwidth' => $peakBandwidth,
            'avg_bandwidth' => $avgBandwidth,
            'data_transfer' => $totalBandwidth * ($to->diffInSeconds($from) / 300), // Estimate total transfer
            'peak_connections' => $connectionData->max('value') ?? 0,
            'avg_connections' => $connectionData->avg('value') ?? 0,
            'bandwidth_utilization' => $this->calculateBandwidthUtilization($bandwidthData)
        ];
    }

    public function calculateTrends(Carbon $from, Carbon $to, array $filters = []): array
    {
        $previousFrom = $from->copy()->subDays($to->diffInDays($from));
        $previousTo = $from->copy();

        $currentPeriod = $this->calculateUsageMetrics($from, $to, $filters);
        $previousPeriod = $this->calculateUsageMetrics($previousFrom, $previousTo, $filters);

        $bandwidthGrowth = $this->calculateGrowthRate(
            $previousPeriod['total_bandwidth'],
            $currentPeriod['total_bandwidth']
        );

        $userGrowth = $this->calculateUserGrowth($from, $to, $previousFrom, $previousTo);

        return [
            'bandwidth_growth' => $bandwidthGrowth,
            'user_growth' => $userGrowth,
            'performance_change' => $this->calculatePerformanceChange($from, $to, $previousFrom, $previousTo),
            'trend_direction' => $bandwidthGrowth > 0 ? 'increasing' : 'decreasing'
        ];
    }

    public function generateReport(array $parameters): array
    {
        $reportType = $parameters['report_type'];
        $timeRange = $parameters['time_range'];
        $from = Carbon::parse($timeRange['from']);
        $to = Carbon::parse($timeRange['to']);

        return match ($reportType) {
            'performance' => $this->generatePerformanceReport($from, $to, $parameters),
            'availability' => $this->generateAvailabilityReport($from, $to, $parameters),
            'usage' => $this->generateUsageReport($from, $to, $parameters),
            'capacity' => $this->generateCapacityReport($from, $to, $parameters),
            default => []
        };
    }

    private function getMetricData(string $metricType, Carbon $from, Carbon $to, array $filters = [])
    {
        $query = MonitoringData::where('metric_type', $metricType)
                              ->whereBetween('recorded_at', [$from, $to]);

        if (isset($filters['nas_server_id'])) {
            $query->where('nas_server_id', $filters['nas_server_id']);
        }

        if (isset($filters['subscription_id'])) {
            $query->where('subscription_id', $filters['subscription_id']);
        }

        return $query->get();
    }

    private function calculatePercentile($data, int $percentile): float
    {
        if ($data->isEmpty()) {
            return 0;
        }

        $values = $data->pluck('value')->sort()->values();
        $index = ($percentile / 100) * ($values->count() - 1);
        
        if ($index == intval($index)) {
            return $values[$index];
        } else {
            $lower = $values[floor($index)];
            $upper = $values[ceil($index)];
            return $lower + (($upper - $lower) * ($index - floor($index)));
        }
    }

    private function calculateBandwidthUtilization($bandwidthData): float
    {
        // Calculate utilization based on available bandwidth capacity
        $totalCapacity = NasServer::sum('bandwidth_capacity') * 1000000; // Convert to bytes
        $avgBandwidth = $bandwidthData->avg('value') ?? 0;
        
        return $totalCapacity > 0 ? (($avgBandwidth / $totalCapacity) * 100) : 0;
    }

    private function calculateGrowthRate(float $previous, float $current): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return (($current - $previous) / $previous) * 100;
    }

    private function calculateUserGrowth(Carbon $from, Carbon $to, Carbon $prevFrom, Carbon $prevTo): float
    {
        $currentUsers = CustomerSubscription::whereBetween('created_at', [$from, $to])->count();
        $previousUsers = CustomerSubscription::whereBetween('created_at', [$prevFrom, $prevTo])->count();

        return $this->calculateGrowthRate($previousUsers, $currentUsers);
    }

    private function calculatePerformanceChange(Carbon $from, Carbon $to, Carbon $prevFrom, Carbon $prevTo): float
    {
        $currentPerf = $this->calculatePerformanceMetrics($from, $to);
        $previousPerf = $this->calculatePerformanceMetrics($prevFrom, $prevTo);

        $currentAvgResponse = $currentPerf['avg_response_time'];
        $previousAvgResponse = $previousPerf['avg_response_time'];

        if ($previousAvgResponse == 0) {
            return 0;
        }

        // Negative value means improvement (lower response time)
        return (($currentAvgResponse - $previousAvgResponse) / $previousAvgResponse) * 100;
    }

    private function generatePerformanceReport(Carbon $from, Carbon $to, array $parameters): array
    {
        $performance = $this->calculatePerformanceMetrics($from, $to, $parameters);
        $availability = $this->calculateAvailability($from, $to, $parameters);

        return [
            'report_type' => 'performance',
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString()
            ],
            'summary' => [
                'overall_availability' => $availability['overall'],
                'sla_compliance' => $availability['sla_compliance'],
                'avg_response_time' => $performance['avg_response_time'],
                'peak_throughput' => $performance['peak_throughput']
            ],
            'details' => [
                'availability' => $availability,
                'performance' => $performance,
                'recommendations' => $this->generatePerformanceRecommendations($performance, $availability)
            ]
        ];
    }

    private function generatePerformanceRecommendations(array $performance, array $availability): array
    {
        $recommendations = [];

        if ($availability['overall'] < 99.5) {
            $recommendations[] = [
                'type' => 'availability',
                'priority' => 'high',
                'message' => 'Overall availability is below SLA target of 99.5%. Review downtime incidents and implement preventive measures.'
            ];
        }

        if ($performance['avg_response_time'] > 100) {
            $recommendations[] = [
                'type' => 'performance',
                'priority' => 'medium',
                'message' => 'Average response time is above 100ms. Consider optimizing network configuration or upgrading hardware.'
            ];
        }

        if ($performance['p99_response_time'] > 500) {
            $recommendations[] = [
                'type' => 'performance',
                'priority' => 'medium',
                'message' => '99th percentile response time is high. Investigate performance bottlenecks during peak hours.'
            ];
        }

        return $recommendations;
    }
}
```

### Frontend Implementation

#### Real-time Dashboard Component
```javascript
// src/components/monitoring/RealTimeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monitoringService } from '../../services/monitoringService';
import io from 'socket.io-client';

const RealTimeDashboard = () => {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);

  // Initial data fetch
  const { data: dashboardData } = useQuery({
    queryKey: ['monitoring-dashboard'],
    queryFn: () => monitoringService.getDashboardData(),
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_WEBSOCKET_URL);
    setSocket(newSocket);

    newSocket.on('monitoring.realtime', (data) => {
      setRealTimeData(data);
      
      // Update React Query cache
      queryClient.setQueryData(['monitoring-realtime'], data);
    });

    return () => newSocket.close();
  }, [queryClient]);

  const { data: realTimeMetrics } = useQuery({
    queryKey: ['monitoring-realtime'],
    queryFn: () => monitoringService.getRealTimeData(),
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'offline': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const currentData = realTimeData || realTimeMetrics;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Real-time Monitoring</h1>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
          <span className="text-sm text-gray-500">
            Last updated: {currentData?.timestamp ? new Date(currentData.timestamp).toLocaleTimeString() : 'Loading...'}
          </span>
        </div>
      </div>

      {/* System Status Cards */}
      {currentData?.system_status && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600">Total NAS</h3>
            <p className="text-2xl font-bold">{currentData.system_status.total_nas_servers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600">Online NAS</h3>
            <p className="text-2xl font-bold text-green-600">{currentData.system_status.online_servers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600">Total Subscriptions</h3>
            <p className="text-2xl font-bold">{currentData.system_status.total_subscriptions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600">Active Subscriptions</h3>
            <p className="text-2xl font-bold text-blue-600">{currentData.system_status.active_subscriptions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600">Active Alerts</h3>
            <p className="text-2xl font-bold text-yellow-600">{currentData.system_status.active_alerts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600">Critical Alerts</h3>
            <p className="text-2xl font-bold text-red-600">{currentData.system_status.critical_alerts}</p>
          </div>
        </div>
      )}

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CPU Usage Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">CPU Usage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData?.metrics?.filter(m => m.metric_type === 'cpu_usage') || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'CPU Usage']}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="#93c5fd"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Memory Usage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData?.metrics?.filter(m => m.metric_type === 'memory_usage') || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Memory Usage']}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  fill="#86efac"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bandwidth Usage */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Bandwidth Usage</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData?.metrics?.filter(m => m.metric_type === 'bandwidth') || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatBytes(value)}
              />
              <Tooltip 
                formatter={(value) => [formatBytes(value), 'Bandwidth']}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Alerts */}
      {currentData?.alerts && currentData.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Active Alerts</h2>
          <div className="space-y-3">
            {currentData.alerts.map((alert) => (
              <div key={alert.id} className="border-l-4 pl-4 py-2" style={{ borderColor: getSeverityColor(alert.severity) }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {alert.source_type} #{alert.source_id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {alert.current_value} / {alert.threshold_value}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.triggered_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getSeverityColor(alert.severity) }}
                    >
                      {alert.severity}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default RealTimeDashboard;
```

#### Alert Management Component
```javascript
// src/components/monitoring/AlertManagement.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { monitoringService } from '../../services/monitoringService';

const AlertManagement = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    source_type: '',
    page: 1
  });

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => monitoringService.getAlerts(filters)
  });

  const acknowledgeMutation = useMutation({
    mutationFn: ({ alertId, notes }) => monitoringService.acknowledgeAlert(alertId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['alerts']);
    }
  });

  const resolveMutation = useMutation({
    mutationFn: ({ alertId, notes }) => monitoringService.resolveAlert(alertId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['alerts']);
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAcknowledge = (alertId) => {
    const notes = prompt('Enter acknowledgment notes:');
    if (notes) {
      acknowledgeMutation.mutate({ alertId, notes });
    }
  };

  const handleResolve = (alertId) => {
    const notes = prompt('Enter resolution notes:');
    if (notes) {
      resolveMutation.mutate({ alertId, notes });
    }
  };

  if (isLoading) return <div>Loading alerts...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Alert Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({...filters, severity: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select
            value={filters.source_type}
            onChange={(e) => setFilters({...filters, source_type: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          >
            <option value="">All Sources</option>
            <option value="nas_server">NAS Server</option>
            <option value="subscription">Subscription</option>
            <option value="customer">Customer</option>
            <option value="system">System</option>
          </select>

          <button
            onClick={() => setFilters({status: '', severity: '', source_type: '', page: 1})}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Alerts</h3>
          <p className="text-2xl font-bold">{alerts?.data?.summary?.total_alerts || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Open Alerts</h3>
          <p className="text-2xl font-bold text-red-600">{alerts?.data?.summary?.open_alerts || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Critical Alerts</h3>
          <p className="text-2xl font-bold text-red-600">{alerts?.data?.summary?.critical_alerts || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Acknowledged</h3>
          <p className="text-2xl font-bold text-yellow-600">{alerts?.data?.summary?.acknowledged_alerts || 0}</p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Values
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Triggered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts?.data?.alerts?.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-500">{alert.alert_code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {alert.source_name || `${alert.source_type} #${alert.source_id}`}
                    </div>
                    <div className="text-sm text-gray-500">{alert.metric_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Current: {alert.current_value}
                    </div>
                    <div className="text-sm text-gray-500">
                      Threshold: {alert.threshold_value}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(alert.triggered_at).toLocaleString()}</div>
                    <div>{formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {alert.status === 'open' && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgeMutation.isLoading}
                          className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                        >
                          Acknowledge
                        </button>
                      )}
                      {(alert.status === 'open' || alert.status === 'acknowledged') && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolveMutation.isLoading}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setFilters({...filters, page: Math.max(1, filters.page - 1)})}
              disabled={filters.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({...filters, page: filters.page + 1})}
              disabled={filters.page >= (alerts?.data?.pagination?.total_pages || 1)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(filters.page - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(filters.page * 10, alerts?.data?.pagination?.total_items || 0)}</span> of{' '}
                <span className="font-medium">{alerts?.data?.pagination?.total_items || 0}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setFilters({...filters, page: Math.max(1, filters.page - 1)})}
                  disabled={filters.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {filters.page} of {alerts?.data?.pagination?.total_pages || 1}
                </span>
                <button
                  onClick={() => setFilters({...filters, page: filters.page + 1})}
                  disabled={filters.page >= (alerts?.data?.pagination?.total_pages || 1)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertManagement;
```

## Testing Requirements

### Unit Tests

#### Real-time Monitoring Service Tests
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\RealTimeMonitoringService;
use App\Services\MikroTikService;
use App\Services\AlertService;
use App\Models\NasServer;
use App\Models\CustomerSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class RealTimeMonitoringServiceTest extends TestCase
{
    use RefreshDatabase;

    private RealTimeMonitoringService $monitoringService;
    private MikroTikService $mikrotikService;
    private AlertService $alertService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->mikrotikService = Mockery::mock(MikroTikService::class);
        $this->alertService = Mockery::mock(AlertService::class);
        
        $this->monitoringService = new RealTimeMonitoringService(
            $this->mikrotikService,
            $this->alertService
        );
    }

    public function test_collects_nas_metrics_successfully()
    {
        $nas = NasServer::factory()->create();
        
        $this->mikrotikService->shouldReceive('connect')
            ->with($nas)
            ->once()
            ->andReturn(true);

        $this->mikrotikService->shouldReceive('getSystemResource')
            ->with($nas)
            ->once()
            ->andReturn([
                [
                    'cpu-load' => 45.5,
                    'total-memory' => 1000000,
                    'free-memory' => 500000,
                    'uptime' => '5d12h30m'
                ]
            ]);

        $this->mikrotikService->shouldReceive('getTraffic')
            ->with($nas)
            ->once()
            ->andReturn([
                [
                    'name' => 'ether1',
                    'rx-byte' => 1000000,
                    'tx-byte' => 500000
                ]
            ]);

        $this->mikrotikService->shouldReceive('getActiveConnections')
            ->with($nas)
            ->once()
            ->andReturn([
                ['name' => 'user1'],
                ['name' => 'user2']
            ]);

        $data = $this->monitoringService->collectRealTimeData();

        $this->assertNotEmpty($data);
        
        $cpuMetrics = array_filter($data, fn($m) => $m['metric_type'] === 'cpu_usage');
        $this->assertNotEmpty($cpuMetrics);
        $this->assertEquals(45.5, array_values($cpuMetrics)[0]['value']);

        $memoryMetrics = array_filter($data, fn($m) => $m['metric_type'] === 'memory_usage');
        $this->assertNotEmpty($memoryMetrics);
        $this->assertEquals(50.0, array_values($memoryMetrics)[0]['value']);

        $bandwidthMetrics = array_filter($data, fn($m) => $m['metric_type'] === 'bandwidth');
        $this->assertNotEmpty($bandwidthMetrics);
        $this->assertEquals(1500000, array_values($bandwidthMetrics)[0]['value']);

        $connectionMetrics = array_filter($data, fn($m) => $m['metric_type'] === 'connection_count');
        $this->assertNotEmpty($connectionMetrics);
        $this->assertEquals(2, array_values($connectionMetrics)[0]['value']);
    }

    public function test_handles_nas_offline()
    {
        $nas = NasServer::factory()->create();
        
        $this->mikrotikService->shouldReceive('connect')
            ->with($nas)
            ->once()
            ->andReturn(false);

        $this->alertService->shouldReceive('processAlert')
            ->once();

        $data = $this->monitoringService->collectRealTimeData();

        // Should not collect metrics for offline NAS
        $nasMetrics = array_filter($data, fn($m) => $m['nas_server_id'] === $nas->id);
        $this->assertEmpty($nasMetrics);
    }

    public function test_collects_subscription_metrics()
    {
        $subscription = CustomerSubscription::factory()->create();
        $nas = $subscription->nasServer;

        $this->mikrotikService->shouldReceive('connect')
            ->with($nas)
            ->andReturn(true);

        $this->mikrotikService->shouldReceive('getActiveConnections')
            ->with($nas)
            ->andReturn([
                [
                    'name' => $subscription->username,
                    'bytes-in' => 1000000,
                    'bytes-out' => 500000,
                    'uptime' => '2d5h30m'
                ]
            ]);

        $data = $this->monitoringService->collectRealTimeData();

        $subscriptionMetrics = array_filter($data, fn($m) => $m['subscription_id'] === $subscription->id);
        $this->assertNotEmpty($subscriptionMetrics);

        $bandwidthMetrics = array_filter($subscriptionMetrics, fn($m) => $m['metric_type'] === 'bandwidth');
        $this->assertNotEmpty($bandwidthMetrics);
        $this->assertEquals(1500000, array_values($bandwidthMetrics)[0]['value']);
    }

    public function test_triggers_alerts_when_thresholds_exceeded()
    {
        $nas = NasServer::factory()->create();
        
        $this->mikrotikService->shouldReceive('connect')
            ->with($nas)
            ->andReturn(true);

        $this->mikrotikService->shouldReceive('getSystemResource')
            ->with($nas)
            ->andReturn([
                [
                    'cpu-load' => 85.5, // High CPU usage
                    'total-memory' => 1000000,
                    'free-memory' => 500000,
                    'uptime' => '5d12h30m'
                ]
            ]);

        $this->mikrotikService->shouldReceive('getTraffic')
            ->andReturn([]);
        $this->mikrotikService->shouldReceive('getActiveConnections')
            ->andReturn([]);

        // Mock threshold check
        $threshold = (object) [
            'threshold_type' => 'warning',
            'operator' => '>',
            'threshold_value' => 80.0,
            'notification_channels' => ['email']
        ];

        $this->alertService->shouldReceive('processAlert')
            ->once()
            ->with(Mockery::type(\App\Models\Alert::class));

        $data = $this->monitoringService->collectRealTimeData();

        $this->assertNotEmpty($data);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
```

#### Alert Service Tests
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\AlertService;
use App\Models\Alert;
use App\Models\AlertNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;

class AlertServiceTest extends TestCase
{
    use RefreshDatabase;

    private AlertService $alertService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->alertService = app(AlertService::class);
    }

    public function test_sends_email_notification()
    {
        Mail::fake();

        $alert = Alert::factory()->create([
            'severity' => 'critical',
            'title' => 'Test Alert',
            'description' => 'This is a test alert'
        ]);

        $result = $this->alertService->sendNotification($alert, 'email');

        $this->assertTrue($result);
        
        Mail::assertSent(\App\Mail\AlertNotification::class, function ($mail) use ($alert) {
            return $mail->alert->id === $alert->id;
        });

        $this->assertDatabaseHas('alert_notifications', [
            'alert_id' => $alert->id,
            'channel_type' => 'email',
            'status' => 'sent'
        ]);
    }

    public function test_sends_webhook_notification()
    {
        Http::fake([
            config('monitoring.webhook_url') => Http::response(['success' => true], 200)
        ]);

        $alert = Alert::factory()->create([
            'severity' => 'warning',
            'title' => 'Test Webhook Alert'
        ]);

        $result = $this->alertService->sendNotification($alert, 'webhook');

        $this->assertTrue($result);
        
        Http::assertSent(function ($request) use ($alert) {
            $data = $request->data();
            return $data['alert_id'] === $alert->id &&
                   $data['title'] === $alert->title;
        });

        $this->assertDatabaseHas('alert_notifications', [
            'alert_id' => $alert->id,
            'channel_type' => 'webhook',
            'status' => 'sent'
        ]);
    }

    public function test_handles_webhook_failure()
    {
        Http::fake([
            config('monitoring.webhook_url') => Http::response(['error' => 'Server error'], 500)
        ]);

        $alert = Alert::factory()->create();

        $result = $this->alertService->sendNotification($alert, 'webhook');

        $this->assertFalse($result);
        
        $this->assertDatabaseHas('alert_notifications', [
            'alert_id' => $alert->id,
            'channel_type' => 'webhook',
            'status' => 'failed'
        ]);
    }

    public function test_sends_slack_notification()
    {
        Http::fake([
            config('monitoring.slack_webhook_url') => Http::response(['ok' => true], 200)
        ]);

        $alert = Alert::factory()->create([
            'severity' => 'critical',
            'title' => 'Test Slack Alert'
        ]);

        $result = $this->alertService->sendNotification($alert, 'slack');

        $this->assertTrue($result);
        
        Http::assertSent(function ($request) use ($alert) {
            $payload = $request->data();
            return isset($payload['attachments'][0]['title']) &&
                   $payload['attachments'][0]['title'] === $alert->title;
        });
    }

    public function test_escalates_alert_after_timeout()
    {
        $alert = Alert::factory()->create([
            'triggered_at' => now()->subMinutes(30),
            'severity' => 'warning'
        ]);

        // Mock threshold with escalation rule
        $threshold = (object) [
            'escalation_rules' => [
                [
                    'after_minutes' => 15,
                    'channel' => 'sms'
                ]
            ]
        ];

        // Mock the threshold lookup
        $this->mock(\App\Models\MonitoringThreshold::class, function ($mock) use ($threshold) {
            $mock->shouldReceive('join')
                 ->shouldReceive('where')
                 ->shouldReceive('where')
                 ->shouldReceive('first')
                 ->andReturn($threshold);
        });

        $this->alertService->processAlert($alert);

        // Should have sent SMS escalation
        $this->assertDatabaseHas('alert_notifications', [
            'alert_id' => $alert->id,
            'channel_type' => 'sms'
        ]);
    }
}
```

### Integration Tests

#### Monitoring API Tests
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\MonitoringData;
use App\Models\Alert;
use App\Models\NasServer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MonitoringApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($this->admin, 'sanctum');
    }

    public function test_can_get_real_time_monitoring_data()
    {
        // Create test monitoring data
        MonitoringData::factory()->create([
            'metric_type' => 'cpu_usage',
            'value' => 45.5,
            'recorded_at' => now()
        ]);

        MonitoringData::factory()->create([
            'metric_type' => 'memory_usage',
            'value' => 67.2,
            'recorded_at' => now()
        ]);

        Alert::factory()->create([
            'status' => 'open',
            'severity' => 'warning'
        ]);

        $response = $this->getJson('/api/monitoring/realtime');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'timestamp',
                        'metrics' => [
                            '*' => [
                                'nas_server_id',
                                'subscription_id',
                                'metric_type',
                                'value',
                                'unit',
                                'recorded_at'
                            ]
                        ],
                        'alerts' => [
                            '*' => [
                                'id',
                                'alert_code',
                                'title',
                                'severity',
                                'status',
                                'source_type',
                                'source_id',
                                'current_value',
                                'threshold_value',
                                'triggered_at'
                            ]
                        ],
                        'system_status'
                    ]
                ]);
    }

    public function test_can_get_metrics_with_filters()
    {
        $nas = NasServer::factory()->create();
        
        MonitoringData::factory()->count(10)->create([
            'nas_server_id' => $nas->id,
            'metric_type' => 'cpu_usage',
            'recorded_at' => now()->subHours(2)
        ]);

        $response = $this->getJson("/api/monitoring/metrics?metric_type=cpu_usage&nas_server_id={$nas->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'metric_name',
                        'time_range',
                        'series' => [
                            '*' => [
                                'nas_server_id',
                                'nas_server_name',
                                'data_points' => [
                                    '*' => [
                                        'timestamp',
                                        'value'
                                    ]
                                ]
                            ]
                        ],
                        'statistics'
                    ]
                ]);
    }

    public function test_can_get_alerts_with_filters()
    {
        Alert::factory()->create([
            'severity' => 'critical',
            'status' => 'open'
        ]);

        Alert::factory()->create([
            'severity' => 'warning',
            'status' => 'acknowledged'
        ]);

        $response = $this->getJson('/api/monitoring/alerts?severity=critical&status=open');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'alerts' => [
                            '*' => [
                                'id',
                                'alert_code',
                                'title',
                                'description',
                                'severity',
                                'status',
                                'source_type',
                                'source_id',
                                'source_name',
                                'metric_name',
                                'current_value',
                                'threshold_value',
                                'triggered_at'
                            ]
                        ],
                        'pagination',
                        'summary'
                    ]
                ]);

        $alerts = $response->json('data.alerts');
        $this->assertCount(1, $alerts);
        $this->assertEquals('critical', $alerts[0]['severity']);
        $this->assertEquals('open', $alerts[0]['status']);
    }

    public function test_can_acknowledge_alert()
    {
        $alert = Alert::factory()->create(['status' => 'open']);

        $response = $this->postJson("/api/monitoring/alerts/{$alert->id}/acknowledge", [
            'notes' => 'Acknowledged for investigation'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'alert' => [
                            'id',
                            'status',
                            'acknowledged_at',
                            'acknowledged_by',
                            'notes'
                        ]
                    ]
                ]);

        $this->assertDatabaseHas('alerts', [
            'id' => $alert->id,
            'status' => 'acknowledged',
            'acknowledged_by' => $this->admin->id
        ]);
    }

    public function test_can_resolve_alert()
    {
        $alert = Alert::factory()->create(['status' => 'acknowledged']);

        $response = $this->postJson("/api/monitoring/alerts/{$alert->id}/resolve", [
            'resolution_notes' => 'Issue resolved by restarting service'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'alert' => [
                            'id',
                            'status',
                            'resolved_at',
                            'resolved_by',
                            'resolution_notes'
                        ]
                    ]
                ]);

        $this->assertDatabaseHas('alerts', [
            'id' => $alert->id,
            'status' => 'resolved',
            'resolved_by' => $this->admin->id,
            'resolution_notes' => 'Issue resolved by restarting service'
        ]);
    }
}
```

### Frontend Tests

#### Real-time Dashboard Tests
```javascript
// src/components/__tests__/RealTimeDashboard.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RealTimeDashboard from '../monitoring/RealTimeDashboard';
import { monitoringService } from '../../services/monitoringService';

// Mock monitoring service
jest.mock('../../services/monitoringService');
jest.mock('socket.io-client');

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

describe('RealTimeDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with system status', async () => {
    const mockData = {
      data: {
        timestamp: '2024-01-01T10:00:00Z',
        system_status: {
          total_nas_servers: 5,
          online_servers: 4,
          total_subscriptions: 150,
          active_subscriptions: 142,
          active_alerts: 3,
          critical_alerts: 1
        },
        metrics: [
          {
            nas_server_id: 1,
            metric_type: 'cpu_usage',
            value: 45.5,
            timestamp: '2024-01-01T10:00:00Z'
          }
        ],
        alerts: []
      }
    };

    monitoringService.getDashboardData.mockResolvedValue(mockData);
    monitoringService.getRealTimeData.mockResolvedValue(mockData);

    renderWithClient(<RealTimeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total NAS')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Online NAS')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Total Subscriptions')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
      expect(screen.getByText('142')).toBeInTheDocument();
    });
  });

  test('displays CPU usage chart', async () => {
    const mockData = {
      data: {
        metrics: [
          {
            nas_server_id: 1,
            metric_type: 'cpu_usage',
            value: 45.5,
            timestamp: '2024-01-01T10:00:00Z'
          },
          {
            nas_server_id: 1,
            metric_type: 'cpu_usage',
            value: 52.3,
            timestamp: '2024-01-01T10:05:00Z'
          }
        ],
        alerts: []
      }
    };

    monitoringService.getDashboardData.mockResolvedValue(mockData);
    monitoringService.getRealTimeData.mockResolvedValue(mockData);

    renderWithClient(<RealTimeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    });
  });

  test('displays active alerts', async () => {
    const mockData = {
      data: {
        metrics: [],
        alerts: [
          {
            id: 1,
            title: 'High CPU Usage',
            description: 'CPU usage exceeded threshold',
            severity: 'warning',
            status: 'open',
            source_type: 'nas_server',
            source_id: 1,
            current_value: 85.5,
            threshold_value: 80.0,
            triggered_at: '2024-01-01T09:55:00Z'
          }
        ]
      }
    };

    monitoringService.getDashboardData.mockResolvedValue(mockData);
    monitoringService.getRealTimeData.mockResolvedValue(mockData);

    renderWithClient(<RealTimeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('High CPU Usage')).toBeInTheDocument();
      expect(screen.getByText('CPU usage exceeded threshold')).toBeInTheDocument();
      expect(screen.getByText('warning')).toBeInTheDocument();
    });
  });
});
```

## Deployment Requirements

### Environment Configuration

#### Additional .env Variables
```env
# Real-time Monitoring
MONITORING_ENABLED=true
MONITORING_INTERVAL=30
MONITORING_RETENTION_DAYS=90

# WebSocket Configuration
WEBSOCKET_HOST=0.0.0.0
WEBSOCKET_PORT=6001
WEBSOCKET_SSL=false

# Time Series Database
INFLUXDB_HOST=localhost
INFLUXDB_PORT=8086
INFLUXDB_DATABASE=monitoring
INFLUXDB_USERNAME=
INFLUXDB_PASSWORD=

# Search & Analytics
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_INDEX=monitoring_logs

# Alert Configuration
ALERT_EMAIL_RECIPIENTS=admin@example.com,ops@example.com
ALERT_SMS_RECIPIENTS=+628123456789,+628123456790
ALERT_CRITICAL_EMAIL_RECIPIENTS=manager@example.com
ALERT_CRITICAL_SMS_RECIPIENTS=+628123456791

# Webhook Configuration
MONITORING_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
MONITORING_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Report Generation
REPORTS_STORAGE_DISK=local
REPORTS_MAX_FILE_SIZE=50MB
REPORTS_RETENTION_DAYS=30
```

### Queue Configuration

#### Monitoring Jobs
```php
<?php

namespace App\Jobs;

use App\Services\RealTimeMonitoringService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CollectRealTimeMetrics implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [30, 60, 120];
    public $timeout = 300;

    public function handle(RealTimeMonitoringService $monitoringService): void
    {
        try {
            $monitoringService->collectRealTimeData();
        } catch (\Exception $e) {
            Log::error("Failed to collect real-time metrics: {$e->getMessage()}");
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Real-time metrics collection job failed: {$exception->getMessage()}");
    }
}
```

#### Scheduler Configuration
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Collect real-time metrics every minute
    $schedule->job(new \App\Jobs\CollectRealTimeMetrics)
             ->everyMinute()
             ->withoutOverlapping();

    // Process alert notifications every 5 minutes
    $schedule->job(new \App\Jobs\ProcessAlertNotifications)
             ->everyFiveMinutes()
             ->withoutOverlapping();

    // Generate scheduled reports
    $schedule->command('reports:generate')
             ->hourly()
             ->withoutOverlapping();

    // Clean old monitoring data
    $schedule->command('monitoring:clean')
             ->daily()
             ->at('02:00');

    // Archive old alerts
    $schedule->command('alerts:archive')
             ->weekly()
             ->at('03:00');
}
```

## Success Criteria

### Functional Requirements
- ✅ Real-time data collection from NAS servers and subscriptions
- ✅ Interactive dashboard with customizable widgets
- ✅ Comprehensive alert system with multiple notification channels
- ✅ Advanced analytics and reporting capabilities
- ✅ Historical data analysis and trend identification
- ✅ Performance monitoring and SLA tracking

### Performance Requirements
- ✅ Real-time data updates < 5 seconds
- ✅ Dashboard load time < 3 seconds
- ✅ Alert processing < 30 seconds
- ✅ Report generation < 2 minutes
- ✅ Support for 1,000+ concurrent monitoring points

### Reliability Requirements
- ✅ 99.9% monitoring system uptime
- ✅ Automatic failover for monitoring services
- ✅ Data retention and archival capabilities
- ✅ Graceful degradation during system overload

### Usability Requirements
- ✅ Intuitive dashboard interface
- ✅ Mobile-responsive design
- ✅ Customizable alert thresholds
- ✅ Interactive charts and visualizations
- ✅ Comprehensive reporting templates

## Next Steps

Setelah Fase 4 selesai, sistem akan memiliki:
1. Real-time monitoring infrastructure
2. Advanced analytics and reporting
3. Intelligent alert system
4. Interactive dashboards
5. Performance tracking capabilities
6. Foundation untuk payment processing di Fase 5

Fase 5 akan membangun di atas monitoring capabilities ini dengan menambahkan payment gateway integration dan automated billing system.