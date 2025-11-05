# Phase 2: MikroTik Integration & NAS Management

## Overview

Fase 2 fokus pada integrasi dengan MikroTik RouterOS v6 & v7 untuk manajemen multi-NAS. Fase ini memungkinkan sistem untuk berkomunikasi dengan multiple MikroTik devices, mengelola konfigurasi, dan melakukan monitoring dasar.

## Duration: 6 Weeks

### Week 1-3: MikroTik API Integration
### Week 4-5: NAS Management System
### Week 6: Basic Monitoring & Testing

## Technical Requirements

### Dependencies
```json
{
  "backend": {
    "laravel/framework": "^10.0",
    "phpseclib/phpseclib": "^3.0",
    "guzzlehttp/guzzle": "^7.5",
    "spatie/laravel-queueable-job": "^1.2",
    "spatie/laravel-backup": "^8.1",
    "laravel-websockets": "^1.13"
  },
  "frontend": {
    "react": "^18.2",
    "react-router-dom": "^6.8",
    "@tanstack/react-query": "^4.24",
    "axios": "^1.3",
    "socket.io-client": "^4.6",
    "recharts": "^2.5",
    "react-table": "^7.8"
  }
}
```

### External Libraries
```php
// Composer requirements
"phpseclib/phpseclib": "^3.0", // SSH connection
"guzzlehttp/guzzle": "^7.5",    // HTTP API calls
"spatie/laravel-webhook-server": "^3.4" // Webhook handling
```

## Database Schema

### Additional Tables

#### nas_servers
```sql
CREATE TABLE nas_servers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    port INT DEFAULT 8728,
    username VARCHAR(255) NOT NULL,
    password_encrypted TEXT NOT NULL,
    api_type ENUM('routeros_v6', 'routeros_v7') DEFAULT 'routeros_v7',
    version VARCHAR(50) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT NULL,
    configuration JSON NULL,
    last_sync TIMESTAMP NULL,
    last_seen TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nas_ip (ip_address),
    INDEX idx_nas_active (is_active),
    INDEX idx_nas_last_sync (last_sync),
    UNIQUE KEY uk_nas_ip_port (ip_address, port)
);
```

#### monitoring_data
```sql
CREATE TABLE monitoring_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nas_server_id BIGINT NOT NULL,
    subscription_id BIGINT NULL,
    metric_type ENUM('cpu_usage', 'memory_usage', 'bandwidth', 'connection_count', 'uptime') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    additional_data JSON NULL,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (nas_server_id) REFERENCES nas_servers(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES customer_subscriptions(id) ON DELETE SET NULL,
    INDEX idx_monitoring_nas (nas_server_id),
    INDEX idx_monitoring_subscription (subscription_id),
    INDEX idx_monitoring_metric (metric_type),
    INDEX idx_monitoring_recorded (recorded_at)
);
```

#### network_logs
```sql
CREATE TABLE network_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nas_server_id BIGINT NOT NULL,
    subscription_id BIGINT NULL,
    log_type ENUM('authentication', 'connection', 'error', 'system', 'firewall') NOT NULL,
    message TEXT NOT NULL,
    source_ip VARCHAR(45) NULL,
    destination_ip VARCHAR(45) NULL,
    port INT NULL,
    protocol VARCHAR(10) NULL,
    additional_data JSON NULL,
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (nas_server_id) REFERENCES nas_servers(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES customer_subscriptions(id) ON DELETE SET NULL,
    INDEX idx_logs_nas (nas_server_id),
    INDEX idx_logs_subscription (subscription_id),
    INDEX idx_logs_type (log_type),
    INDEX idx_logs_occurred (occurred_at)
);
```

#### nas_configurations
```sql
CREATE TABLE nas_configurations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nas_server_id BIGINT NOT NULL,
    config_type ENUM('queue', 'ppp', 'dhcp', 'firewall', 'pool') NOT NULL,
    config_name VARCHAR(255) NOT NULL,
    config_data JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    version INT DEFAULT 1,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (nas_server_id) REFERENCES nas_servers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_config_nas (nas_server_id),
    INDEX idx_config_type (config_type),
    INDEX idx_config_active (is_active)
);
```

## API Design

### NAS Management Endpoints

#### GET /api/nas-servers
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: page, limit, is_active, api_type

// Response
{
    "success": true,
    "data": {
        "servers": [
            {
                "id": 1,
                "name": "Main Router",
                "ip_address": "192.168.1.1",
                "port": 8728,
                "api_type": "routeros_v7",
                "version": "7.12",
                "is_active": true,
                "last_sync": "2024-01-01T10:00:00Z",
                "last_seen": "2024-01-01T10:05:00Z",
                "status": "online",
                "uptime": "5d 12h 30m",
                "cpu_usage": 15.5,
                "memory_usage": 45.2
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 5,
            "total_items": 10,
            "per_page": 2
        }
    }
}
```

#### POST /api/nas-servers
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "name": "Branch Office Router",
    "ip_address": "192.168.2.1",
    "port": 8728,
    "username": "admin",
    "password": "router_password",
    "api_type": "routeros_v7",
    "description": "Main router for branch office",
    "configuration": {
        "timeout": 30,
        "retry_attempts": 3
    }
}

// Response
{
    "success": true,
    "message": "NAS server created successfully",
    "data": {
        "server": {
            "id": 2,
            "name": "Branch Office Router",
            "ip_address": "192.168.2.1",
            "api_type": "routeros_v7",
            "is_active": true,
            "status": "testing"
        }
    }
}
```

#### GET /api/nas-servers/{id}/status
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "data": {
        "server": {
            "id": 1,
            "name": "Main Router",
            "status": "online",
            "uptime": "5d 12h 30m",
            "version": "7.12",
            "system": {
                "cpu_usage": 15.5,
                "memory_usage": 45.2,
                "disk_usage": 23.8,
                "temperature": 42.5
            },
            "network": {
                "interfaces": [
                    {
                        "name": "ether1",
                        "status": "up",
                        "speed": "1Gbps",
                        "rx_bytes": 1024000000,
                        "tx_bytes": 512000000
                    }
                ],
                "active_connections": 45,
                "total_bandwidth": "100Mbps"
            },
            "last_check": "2024-01-01T10:05:00Z"
        }
    }
}
```

#### POST /api/nas-servers/{id}/test-connection
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "data": {
        "connection_test": {
            "status": "success",
            "response_time": 45,
            "api_version": "7.12",
            "system_identity": "MainRouter",
            "board_name": "RB4011iGS+5HacQ2HnD",
            "tested_at": "2024-01-01T10:05:00Z"
        }
    }
}
```

#### GET /api/nas-servers/{id}/users
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: page, limit, search, service

// Response
{
    "success": true,
    "data": {
        "users": [
            {
                ".id": "*1",
                "name": "customer001",
                "service": "pppoe",
                "caller-id": "00:11:22:33:44:55",
                "address": "192.168.1.100",
                "uptime": "2d 5h 30m",
                "bytes-in": 1024000000,
                "bytes-out": 512000000,
                "limit-bytes-in": 10737418240,
                "limit-bytes-out": 10737418240
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 10,
            "total_items": 100,
            "per_page": 10
        }
    }
}
```

#### POST /api/nas-servers/{id}/users
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "name": "customer002",
    "password": "secure_password",
    "service": "pppoe",
    "profile": "10Mbps",
    "local_address": "192.168.1.101",
    "remote_address": "192.168.1.201",
    "comment": "Customer #002"
}

// Response
{
    "success": true,
    "message": "User created successfully",
    "data": {
        "user": {
            ".id": "*2",
            "name": "customer002",
            "service": "pppoe",
            "profile": "10Mbps"
        }
    }
}
```

#### PUT /api/nas-servers/{id}/users/{userId}
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "password": "new_secure_password",
    "profile": "20Mbps",
    "comment": "Updated Customer #002"
}

// Response
{
    "success": true,
    "message": "User updated successfully",
    "data": {
        "user": {
            ".id": "*2",
            "name": "customer002",
            "profile": "20Mbps"
        }
    }
}
```

#### DELETE /api/nas-servers/{id}/users/{userId}
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "message": "User deleted successfully"
}
```

### Monitoring Endpoints

#### GET /api/nas-servers/{id}/monitoring
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: metric_type, from, to, interval

// Response
{
    "success": true,
    "data": {
        "monitoring_data": [
            {
                "metric_type": "cpu_usage",
                "value": 15.5,
                "unit": "percent",
                "recorded_at": "2024-01-01T10:00:00Z"
            },
            {
                "metric_type": "memory_usage",
                "value": 45.2,
                "unit": "percent",
                "recorded_at": "2024-01-01T10:00:00Z"
            }
        ],
        "summary": {
            "avg_cpu_usage": 18.3,
            "max_cpu_usage": 25.7,
            "avg_memory_usage": 42.1,
            "max_memory_usage": 48.9
        }
    }
}
```

#### GET /api/nas-servers/{id}/logs
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: log_type, from, to, limit

// Response
{
    "success": true,
    "data": {
        "logs": [
            {
                "id": 1,
                "log_type": "authentication",
                "message": "User customer001 logged in",
                "source_ip": "192.168.1.100",
                "occurred_at": "2024-01-01T10:00:00Z",
                "additional_data": {
                    "username": "customer001",
                    "service": "pppoe"
                }
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 50,
            "total_items": 1000,
            "per_page": 20
        }
    }
}
```

## Implementation Details

### Backend Implementation

#### MikroTik API Service
```php
<?php

namespace App\Services;

use App\Models\NasServer;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class MikroTikService
{
    private Client $client;
    private array $connections = [];

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30,
            'connect_timeout' => 10,
        ]);
    }

    public function connect(NasServer $nas): bool
    {
        try {
            $response = $this->client->post($this->buildUrl($nas), [
                'auth' => [$nas->username, $nas->getDecryptedPassword()],
                'form_params' => [
                    '/login' => '',
                ]
            ]);

            if ($response->getStatusCode() === 200) {
                $this->connections[$nas->id] = [
                    'connected_at' => now(),
                    'last_activity' => now()
                ];
                
                $nas->update(['last_seen' => now()]);
                return true;
            }
        } catch (RequestException $e) {
            Log::error("Failed to connect to NAS {$nas->name}: {$e->getMessage()}");
        }

        return false;
    }

    public function getUsers(NasServer $nas): array
    {
        try {
            $response = $this->makeRequest($nas, '/ppp/secret/getall');
            return $this->parseResponse($response);
        } catch (\Exception $e) {
            Log::error("Failed to get users from NAS {$nas->name}: {$e->getMessage()}");
            return [];
        }
    }

    public function createUser(NasServer $nas, array $data): bool
    {
        try {
            $params = [
                '/ppp/secret/add' => '',
                'name' => $data['name'],
                'password' => $data['password'],
                'service' => $data['service'] ?? 'pppoe',
                'profile' => $data['profile'] ?? 'default',
                'comment' => $data['comment'] ?? '',
            ];

            if (isset($data['local_address'])) {
                $params['local-address'] = $data['local_address'];
            }

            if (isset($data['remote_address'])) {
                $params['remote-address'] = $data['remote_address'];
            }

            $response = $this->makeRequest($nas, '', $params);
            return !empty($response);
        } catch (\Exception $e) {
            Log::error("Failed to create user on NAS {$nas->name}: {$e->getMessage()}");
            return false;
        }
    }

    public function updateUser(NasServer $nas, string $id, array $data): bool
    {
        try {
            $params = [
                '/ppp/secret/set' => '',
                '.id' => $id,
            ];

            foreach ($data as $key => $value) {
                if ($key === 'password') {
                    $params['password'] = $value;
                } elseif ($key === 'profile') {
                    $params['profile'] = $value;
                } elseif ($key === 'comment') {
                    $params['comment'] = $value;
                }
            }

            $response = $this->makeRequest($nas, '', $params);
            return !empty($response);
        } catch (\Exception $e) {
            Log::error("Failed to update user {$id} on NAS {$nas->name}: {$e->getMessage()}");
            return false;
        }
    }

    public function deleteUser(NasServer $nas, string $id): bool
    {
        try {
            $params = [
                '/ppp/secret/remove' => '',
                '.id' => $id,
            ];

            $response = $this->makeRequest($nas, '', $params);
            return !empty($response);
        } catch (\Exception $e) {
            Log::error("Failed to delete user {$id} on NAS {$nas->name}: {$e->getMessage()}");
            return false;
        }
    }

    public function getTraffic(NasServer $nas): array
    {
        try {
            $response = $this->makeRequest($nas, '/interface/traffic/getall');
            return $this->parseResponse($response);
        } catch (\Exception $e) {
            Log::error("Failed to get traffic from NAS {$nas->name}: {$e->getMessage()}");
            return [];
        }
    }

    public function getSystemResource(NasServer $nas): array
    {
        try {
            $response = $this->makeRequest($nas, '/system/resource/getall');
            return $this->parseResponse($response);
        } catch (\Exception $e) {
            Log::error("Failed to get system resource from NAS {$nas->name}: {$e->getMessage()}");
            return [];
        }
    }

    public function getActiveConnections(NasServer $nas): array
    {
        try {
            $response = $this->makeRequest($nas, '/ppp/active/getall');
            return $this->parseResponse($response);
        } catch (\Exception $e) {
            Log::error("Failed to get active connections from NAS {$nas->name}: {$e->getMessage()}");
            return [];
        }
    }

    private function makeRequest(NasServer $nas, string $path = '', array $params = []): array
    {
        $url = $this->buildUrl($nas) . $path;
        
        $response = $this->client->post($url, [
            'auth' => [$nas->username, $nas->getDecryptedPassword()],
            'form_params' => $params,
        ]);

        if ($response->getStatusCode() === 200) {
            $this->updateConnectionActivity($nas->id);
            return $this->parseResponse($response->getBody()->getContents());
        }

        throw new \Exception("Request failed with status: {$response->getStatusCode()}");
    }

    private function buildUrl(NasServer $nas): string
    {
        $scheme = $nas->port === 8729 ? 'https' : 'http';
        return "{$scheme}://{$nas->ip_address}:{$nas->port}";
    }

    private function parseResponse($response): array
    {
        if (is_string($response)) {
            $lines = explode("\n", trim($response));
            $result = [];
            $current = [];

            foreach ($lines as $line) {
                if (empty($line)) {
                    if (!empty($current)) {
                        $result[] = $current;
                        $current = [];
                    }
                    continue;
                }

                if (strpos($line, '=') !== false) {
                    list($key, $value) = explode('=', $line, 2);
                    $current[$key] = $value;
                }
            }

            if (!empty($current)) {
                $result[] = $current;
            }

            return $result;
        }

        return json_decode(json_encode($response), true);
    }

    private function updateConnectionActivity(int $nasId): void
    {
        if (isset($this->connections[$nasId])) {
            $this->connections[$nasId]['last_activity'] = now();
        }
    }

    public function disconnect(NasServer $nas): void
    {
        unset($this->connections[$nas->id]);
    }

    public function isConnected(NasServer $nas): bool
    {
        return isset($this->connections[$nas->id]);
    }
}
```

#### NAS Server Model
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class NasServer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'ip_address',
        'port',
        'username',
        'password_encrypted',
        'api_type',
        'version',
        'is_active',
        'description',
        'configuration',
        'last_sync',
        'last_seen'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'configuration' => 'array',
        'last_sync' => 'datetime',
        'last_seen' => 'datetime',
    ];

    public function setPasswordAttribute($value)
    {
        $this->attributes['password_encrypted'] = Crypt::encrypt($value);
    }

    public function getDecryptedPasswordAttribute()
    {
        return Crypt::decrypt($this->password_encrypted);
    }

    public function monitoringData()
    {
        return $this->hasMany(MonitoringData::class);
    }

    public function networkLogs()
    {
        return $this->hasMany(NetworkLog::class);
    }

    public function configurations()
    {
        return $this->hasMany(NasConfiguration::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(CustomerSubscription::class);
    }

    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'disabled';
        }

        if ($this->last_seen && $this->last_seen->gt(now()->subMinutes(5))) {
            return 'online';
        }

        if ($this->last_seen && $this->last_seen->gt(now()->subMinutes(15))) {
            return 'warning';
        }

        return 'offline';
    }

    public function getUptimeAttribute(): string
    {
        if (!$this->last_seen) {
            return 'Unknown';
        }

        $uptime = now()->diff($this->last_seen);
        
        $days = $uptime->d;
        $hours = $uptime->h;
        $minutes = $uptime->i;

        $parts = [];
        if ($days > 0) $parts[] = "{$days}d";
        if ($hours > 0) $parts[] = "{$hours}h";
        if ($minutes > 0) $parts[] = "{$minutes}m";

        return implode(' ', $parts);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOnline($query)
    {
        return $query->where('last_seen', '>', now()->subMinutes(5));
    }
}
```

#### Monitoring Service
```php
<?php

namespace App\Services;

use App\Models\NasServer;
use App\Models\MonitoringData;
use App\Models\NetworkLog;
use App\Jobs\CollectMonitoringData;
use Carbon\Carbon;

class MonitoringService
{
    private MikroTikService $mikrotikService;

    public function __construct(MikroTikService $mikrotikService)
    {
        $this->mikrotikService = $mikrotikService;
    }

    public function collectData(NasServer $nas): void
    {
        try {
            if (!$this->mikrotikService->connect($nas)) {
                $this->logConnectionFailure($nas);
                return;
            }

            $this->collectSystemMetrics($nas);
            $this->collectNetworkMetrics($nas);
            $this->collectConnectionMetrics($nas);

            $nas->update(['last_sync' => now()]);
        } catch (\Exception $e) {
            Log::error("Failed to collect monitoring data from NAS {$nas->name}: {$e->getMessage()}");
        }
    }

    public function collectSystemMetrics(NasServer $nas): void
    {
        $resources = $this->mikrotikService->getSystemResource($nas);

        if (!empty($resources)) {
            $resource = $resources[0];

            $this->storeMonitoringData($nas, 'cpu_usage', $resource['cpu-load'] ?? 0, 'percent');
            $this->storeMonitoringData($nas, 'memory_usage', $resource['free-memory'] ?? 0, 'percent');
            $this->storeMonitoringData($nas, 'uptime', $resource['uptime'] ?? 0, 'seconds');
        }
    }

    public function collectNetworkMetrics(NasServer $nas): void
    {
        $traffic = $this->mikrotikService->getTraffic($nas);

        foreach ($traffic as $interface) {
            if (isset($interface['rx-byte'], $interface['tx-byte'])) {
                $totalBytes = (int)$interface['rx-byte'] + (int)$interface['tx-byte'];
                $this->storeMonitoringData($nas, 'bandwidth', $totalBytes, 'bytes', [
                    'interface' => $interface['name'] ?? 'unknown'
                ]);
            }
        }
    }

    public function collectConnectionMetrics(NasServer $nas): void
    {
        $connections = $this->mikrotikService->getActiveConnections($nas);
        $connectionCount = count($connections);

        $this->storeMonitoringData($nas, 'connection_count', $connectionCount, 'count');

        foreach ($connections as $connection) {
            if (isset($connection['bytes-in'], $connection['bytes-out'])) {
                $totalBytes = (int)$connection['bytes-in'] + (int)$connection['bytes-out'];
                $this->storeMonitoringData($nas, 'bandwidth', $totalBytes, 'bytes', [
                    'user' => $connection['name'] ?? 'unknown',
                    'service' => $connection['service'] ?? 'unknown'
                ]);
            }
        }
    }

    private function storeMonitoringData(
        NasServer $nas,
        string $metricType,
        float $value,
        string $unit,
        array $additionalData = []
    ): void {
        MonitoringData::create([
            'nas_server_id' => $nas->id,
            'metric_type' => $metricType,
            'value' => $value,
            'unit' => $unit,
            'additional_data' => $additionalData,
            'recorded_at' => now()
        ]);
    }

    private function logConnectionFailure(NasServer $nas): void
    {
        NetworkLog::create([
            'nas_server_id' => $nas->id,
            'log_type' => 'error',
            'message' => 'Failed to connect to NAS server',
            'occurred_at' => now()
        ]);
    }

    public function getMonitoringData(
        NasServer $nas,
        string $metricType,
        Carbon $from,
        Carbon $to,
        string $interval = '1h'
    ): array {
        return MonitoringData::where('nas_server_id', $nas->id)
            ->where('metric_type', $metricType)
            ->whereBetween('recorded_at', [$from, $to])
            ->orderBy('recorded_at')
            ->get()
            ->groupBy(function ($item) use ($interval) {
                return $item->recorded_at->format($this->getDateFormat($interval));
            })
            ->map(function ($group) {
                return [
                    'timestamp' => $group->first()->recorded_at,
                    'value' => $group->avg('value'),
                    'count' => $group->count()
                ];
            })
            ->values()
            ->toArray();
    }

    private function getDateFormat(string $interval): string
    {
        return match ($interval) {
            '1m' => 'Y-m-d H:i',
            '5m' => 'Y-m-d H:i',
            '15m' => 'Y-m-d H:i',
            '1h' => 'Y-m-d H:00',
            '1d' => 'Y-m-d',
            default => 'Y-m-d H:00'
        };
    }

    public function scheduleMonitoring(): void
    {
        NasServer::active()->chunk(10, function ($servers) {
            foreach ($servers as $server) {
                CollectMonitoringData::dispatch($server);
            }
        });
    }
}
```

### Frontend Implementation

#### NAS Management Components
```javascript
// src/components/nas/NasList.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nasService } from '../../services/nasService';
import { formatDistanceToNow } from 'date-fns';

const NasList = () => {
  const queryClient = useQueryClient();
  const [selectedNas, setSelectedNas] = useState(null);

  const { data: servers, isLoading } = useQuery({
    queryKey: ['nas-servers'],
    queryFn: () => nasService.getServers()
  });

  const testConnectionMutation = useMutation({
    mutationFn: (nasId) => nasService.testConnection(nasId),
    onSuccess: () => {
      queryClient.invalidateQueries(['nas-servers']);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'disabled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">NAS Servers</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add NAS Server
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers?.data?.servers?.map((server) => (
          <div key={server.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{server.name}</h3>
                <p className="text-gray-600">{server.ip_address}:{server.port}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                {server.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span>{server.version || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Type:</span>
                <span>{server.api_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span>{server.uptime || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CPU Usage:</span>
                <span>{server.cpu_usage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memory Usage:</span>
                <span>{server.memory_usage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Seen:</span>
                <span>
                  {server.last_seen 
                    ? formatDistanceToNow(new Date(server.last_seen), { addSuffix: true })
                    : 'Never'
                  }
                </span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setSelectedNas(server)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Details
              </button>
              <button
                onClick={() => testConnectionMutation.mutate(server.id)}
                disabled={testConnectionMutation.isLoading}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Test Connection
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NasList;
```

#### Monitoring Dashboard Component
```javascript
// src/components/monitoring/MonitoringDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { nasService } from '../../services/nasService';

const MonitoringDashboard = () => {
  const [selectedNas, setSelectedNas] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [metricType, setMetricType] = useState('cpu_usage');

  const { data: servers } = useQuery({
    queryKey: ['nas-servers'],
    queryFn: () => nasService.getServers()
  });

  const { data: monitoringData } = useQuery({
    queryKey: ['monitoring-data', selectedNas?.id, metricType, timeRange],
    queryFn: () => {
      if (!selectedNas) return null;
      
      const now = new Date();
      const from = new Date();
      
      switch (timeRange) {
        case '1h':
          from.setHours(now.getHours() - 1);
          break;
        case '24h':
          from.setDate(now.getDate() - 1);
          break;
        case '7d':
          from.setDate(now.getDate() - 7);
          break;
        case '30d':
          from.setDate(now.getDate() - 30);
          break;
        default:
          from.setDate(now.getDate() - 1);
      }

      return nasService.getMonitoringData(selectedNas.id, metricType, from, now);
    },
    enabled: !!selectedNas
  });

  const chartData = monitoringData?.data?.monitoring_data?.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    value: item.value,
    timestamp: item.timestamp
  })) || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Monitoring Dashboard</h1>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={selectedNas?.id || ''}
            onChange={(e) => setSelectedNas(servers?.data?.servers?.find(s => s.id == e.target.value))}
            className="border rounded px-3 py-2"
          >
            <option value="">Select NAS Server</option>
            {servers?.data?.servers?.map(server => (
              <option key={server.id} value={server.id}>
                {server.name} ({server.ip_address})
              </option>
            ))}
          </select>

          <select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="cpu_usage">CPU Usage</option>
            <option value="memory_usage">Memory Usage</option>
            <option value="bandwidth">Bandwidth</option>
            <option value="connection_count">Connection Count</option>
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {selectedNas && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedNas.name} - {metricType.replace('_', ' ').toUpperCase()}
          </h2>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  formatter={(value, name) => [`${value}%', metricType.replace('_', ' ')]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Current Value</p>
              <p className="text-xl font-semibold">
                {chartData.length > 0 ? chartData[chartData.length - 1].value.toFixed(2) : 'N/A'}%
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Average</p>
              <p className="text-xl font-semibold">
                {chartData.length > 0 
                  ? (chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toFixed(2)
                  : 'N/A'}%
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-gray-600">Peak</p>
              <p className="text-xl font-semibold">
                {chartData.length > 0 
                  ? Math.max(...chartData.map(item => item.value)).toFixed(2)
                  : 'N/A'}%
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-600">Data Points</p>
              <p className="text-xl font-semibold">{chartData.length}</p>
            </div>
          </div>
        </div>
      )}

      {!selectedNas && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600">Please select a NAS server to view monitoring data</p>
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;
```

## Testing Requirements

### Unit Tests

#### MikroTik Service Tests
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\MikroTikService;
use App\Models\NasServer;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MikroTikServiceTest extends TestCase
{
    use RefreshDatabase;

    private MikroTikService $service;
    private NasServer $nas;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->nas = NasServer::factory()->create([
            'ip_address' => '192.168.1.1',
            'port' => 8728,
            'username' => 'admin',
            'password' => 'password'
        ]);
    }

    public function test_can_connect_to_nas()
    {
        $mock = new MockHandler([
            new Response(200, [], '!done')
        ]);

        $handlerStack = HandlerStack::create($mock);
        $client = new Client(['handler' => $handlerStack]);
        
        $this->service = new MikroTikService($client);
        
        $result = $this->service->connect($this->nas);
        
        $this->assertTrue($result);
    }

    public function test_can_get_users()
    {
        $responseBody = "!re\n.name=user1\n.service=pppoe\n!re\n.name=user2\n.service=pppoe\n!done\n";
        
        $mock = new MockHandler([
            new Response(200, [], $responseBody)
        ]);

        $handlerStack = HandlerStack::create($mock);
        $client = new Client(['handler' => $handlerStack]);
        
        $this->service = new MikroTikService($client);
        
        $users = $this->service->getUsers($this->nas);
        
        $this->assertCount(2, $users);
        $this->assertEquals('user1', $users[0]['name']);
        $this->assertEquals('pppoe', $users[0]['service']);
    }

    public function test_can_create_user()
    {
        $mock = new MockHandler([
            new Response(200, [], '!done')
        ]);

        $handlerStack = HandlerStack::create($mock);
        $client = new Client(['handler' => $handlerStack]);
        
        $this->service = new MikroTikService($client);
        
        $userData = [
            'name' => 'testuser',
            'password' => 'testpass',
            'service' => 'pppoe',
            'profile' => 'default'
        ];
        
        $result = $this->service->createUser($this->nas, $userData);
        
        $this->assertTrue($result);
    }

    public function test_handles_connection_failure()
    {
        $mock = new MockHandler([
            new Response(500, [], 'Internal Server Error')
        ]);

        $handlerStack = HandlerStack::create($mock);
        $client = new Client(['handler' => $handlerStack]);
        
        $this->service = new MikroTikService($client);
        
        $result = $this->service->connect($this->nas);
        
        $this->assertFalse($result);
    }
}
```

#### NAS Server Model Tests
```php
<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\NasServer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NasServerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_encrypt_and_decrypt_password()
    {
        $nas = NasServer::factory()->create([
            'password' => 'secret_password'
        ]);

        $this->assertEquals('secret_password', $nas->getDecryptedPasswordAttribute());
        $this->assertNotEquals('secret_password', $nas->password_encrypted);
    }

    public function test_status_determination()
    {
        $onlineNas = NasServer::factory()->create([
            'is_active' => true,
            'last_seen' => now()->subMinutes(2)
        ]);

        $warningNas = NasServer::factory()->create([
            'is_active' => true,
            'last_seen' => now()->subMinutes(10)
        ]);

        $offlineNas = NasServer::factory()->create([
            'is_active' => true,
            'last_seen' => now()->subMinutes(20)
        ]);

        $disabledNas = NasServer::factory()->create([
            'is_active' => false
        ]);

        $this->assertEquals('online', $onlineNas->status);
        $this->assertEquals('warning', $warningNas->status);
        $this->assertEquals('offline', $offlineNas->status);
        $this->assertEquals('disabled', $disabledNas->status);
    }

    public function test_uptime_calculation()
    {
        $nas = NasServer::factory()->create([
            'last_seen' => now()->subDays(2)->subHours(5)->subMinutes(30)
        ]);

        $uptime = $nas->uptime;
        
        $this->assertStringContains('2d', $uptime);
        $this->assertStringContains('5h', $uptime);
        $this->assertStringContains('30m', $uptime);
    }
}
```

### Integration Tests

#### NAS API Tests
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\NasServer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NasApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($this->admin, 'sanctum');
    }

    public function test_can_get_nas_servers()
    {
        NasServer::factory()->count(3)->create();

        $response = $this->getJson('/api/nas-servers');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'servers' => [
                            '*' => [
                                'id',
                                'name',
                                'ip_address',
                                'port',
                                'api_type',
                                'is_active',
                                'status',
                                'last_seen'
                            ]
                        ],
                        'pagination'
                    ]
                ]);
    }

    public function test_can_create_nas_server()
    {
        $nasData = [
            'name' => 'Test Router',
            'ip_address' => '192.168.1.100',
            'port' => 8728,
            'username' => 'admin',
            'password' => 'password123',
            'api_type' => 'routeros_v7',
            'description' => 'Test router'
        ];

        $response = $this->postJson('/api/nas-servers', $nasData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'server' => [
                            'id',
                            'name',
                            'ip_address',
                            'api_type'
                        ]
                    ]
                ]);

        $this->assertDatabaseHas('nas_servers', [
            'name' => 'Test Router',
            'ip_address' => '192.168.1.100'
        ]);
    }

    public function test_can_test_nas_connection()
    {
        $nas = NasServer::factory()->create();

        $response = $this->postJson("/api/nas-servers/{$nas->id}/test-connection");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'connection_test' => [
                            'status',
                            'response_time'
                        ]
                    ]
                ]);
    }
}
```

### Frontend Tests

#### NAS List Component Tests
```javascript
// src/components/__tests__/NasList.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NasList from '../nas/NasList';
import { nasService } from '../../services/nasService';

// Mock the nasService
jest.mock('../../services/nasService');

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

describe('NasList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders NAS server list', async () => {
    const mockServers = {
      data: {
        servers: [
          {
            id: 1,
            name: 'Main Router',
            ip_address: '192.168.1.1',
            port: 8728,
            api_type: 'routeros_v7',
            status: 'online',
            cpu_usage: 15.5,
            memory_usage: 45.2,
            uptime: '5d 12h 30m',
            last_seen: '2024-01-01T10:05:00Z'
          }
        ]
      }
    };

    nasService.getServers.mockResolvedValue(mockServers);

    renderWithClient(<NasList />);

    await waitFor(() => {
      expect(screen.getByText('Main Router')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.1:8728')).toBeInTheDocument();
      expect(screen.getByText('online')).toBeInTheDocument();
    });
  });

  test('can test NAS connection', async () => {
    const mockServers = {
      data: {
        servers: [
          {
            id: 1,
            name: 'Main Router',
            ip_address: '192.168.1.1',
            status: 'online'
          }
        ]
      }
    };

    nasService.getServers.mockResolvedValue(mockServers);
    nasService.testConnection.mockResolvedValue({ success: true });

    renderWithClient(<NasList />);

    await waitFor(() => {
      expect(screen.getByText('Test Connection')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Connection'));

    await waitFor(() => {
      expect(nasService.testConnection).toHaveBeenCalledWith(1);
    });
  });
});
```

## Deployment Requirements

### Environment Configuration

#### Additional .env Variables
```env
# MikroTik Configuration
MIKROTIK_DEFAULT_PORT=8728
MIKROTIK_SECURE_PORT=8729
MIKROTIK_TIMEOUT=30
MIKROTIK_RETRY_ATTEMPTS=3

# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_INTERVAL=300
MONITORING_RETENTION_DAYS=30

# Queue Configuration
QUEUE_CONNECTION=redis
QUEUE_FAILED_DRIVER=database-uuids
```

### Queue Configuration

#### Monitoring Job
```php
<?php

namespace App\Jobs;

use App\Models\NasServer;
use App\Services\MonitoringService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CollectMonitoringData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(
        private NasServer $nasServer
    ) {}

    public function handle(MonitoringService $monitoringService): void
    {
        try {
            $monitoringService->collectData($this->nasServer);
        } catch (\Exception $e) {
            Log::error("Failed to collect monitoring data: {$e->getMessage()}");
            
            if ($this->attempts() >= $this->tries) {
                $this->nasServer->update(['status' => 'error']);
            }
            
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Monitoring job failed for NAS {$this->nasServer->id}: {$exception->getMessage()}");
    }
}
```

#### Scheduler Configuration
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Collect monitoring data every 5 minutes
    $schedule->job(new \App\Jobs\CollectAllMonitoringData)
             ->everyFiveMinutes()
             ->withoutOverlapping();

    // Clean old monitoring data daily
    $schedule->command('monitoring:clean')
             ->daily()
             ->at('02:00');
}
```

## Success Criteria

### Functional Requirements
- ✅ Can connect to multiple MikroTik RouterOS v6 & v7 devices
- ✅ CRUD operations for NAS server management
- ✅ Real-time user management on MikroTik devices
- ✅ Basic monitoring data collection and visualization
- ✅ Connection status monitoring and alerting
- ✅ Configuration backup and restore capabilities

### Performance Requirements
- ✅ API response time < 1 second for NAS operations
- ✅ Monitoring data collection < 30 seconds per NAS
- ✅ Dashboard refresh < 2 seconds
- ✅ Support for 50+ concurrent NAS connections

### Reliability Requirements
- ✅ 99.5% uptime for NAS connections
- ✅ Automatic reconnection on connection failure
- ✅ Graceful handling of MikroTik API errors
- ✅ Data consistency across multiple NAS devices

### Security Requirements
- ✅ Encrypted storage of NAS credentials
- ✅ Secure API communication with MikroTik devices
- ✅ Access control for NAS management operations
- ✅ Audit logging for all NAS operations

## Next Steps

Setelah Fase 2 selesai, sistem akan memiliki:
1. Multi-NAS management capabilities
2. Real-time MikroTik integration
3. Basic monitoring and alerting
4. User management on network devices
5. Foundation untuk customer management di Fase 3

Fase 3 akan membangun di atas infrastruktur jaringan ini dengan menambahkan customer management dan subscription capabilities.