# Phase 3: Customer Management & Mapping

## Overview

Fase 3 fokus pada sistem manajemen pelanggan lengkap dengan pemetaan jaringan, manajemen layanan, dan portal pelanggan. Fase ini mengintegrasikan data pelanggan dengan infrastruktur MikroTik yang telah dibangun di Fase 2.

## Duration: 6 Weeks

### Week 1-3: Customer Management System
### Week 4-5: Service Plans & Subscriptions
### Week 6: Customer Portal & Network Mapping

## Technical Requirements

### Dependencies
```json
{
  "backend": {
    "laravel/framework": "^10.0",
    "spatie/laravel-medialibrary": "^10.0",
    "spatie/laravel-tags": "^4.3",
    "maatwebsite/excel": "^3.1",
    "barryvdh/laravel-dompdf": "^2.0",
    "intervention/image": "^2.7",
    "league/flysystem-aws-s3-v3": "^3.0"
  },
  "frontend": {
    "react": "^18.2",
    "react-router-dom": "^6.8",
    "@tanstack/react-query": "^4.24",
    "axios": "^1.3",
    "react-hook-form": "^7.43",
    "react-dropzone": "^14.2",
    "leaflet": "^1.9",
    "react-leaflet": "^4.2",
    "react-table": "^7.8",
    "recharts": "^2.5"
  }
}
```

### External Services
- **Geocoding API**: Google Maps / OpenStreetMap untuk location mapping
- **Email Service**: SMTP / Mailgun untuk notifications
- **SMS Gateway**: Twilio / Local provider untuk SMS notifications
- **File Storage**: AWS S3 / Local storage untuk document management

## Database Schema

### Customer Tables

#### customers
```sql
CREATE TABLE customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    phone VARCHAR(20) UNIQUE NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    province VARCHAR(100) NULL,
    postal_code VARCHAR(10) NULL,
    country VARCHAR(100) DEFAULT 'Indonesia',
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    status ENUM('prospect', 'active', 'suspended', 'terminated') DEFAULT 'prospect',
    registration_date DATE NULL,
    birth_date DATE NULL,
    gender ENUM('male', 'female', 'other') NULL,
    id_card_number VARCHAR(50) NULL,
    id_card_photo VARCHAR(255) NULL,
    photo VARCHAR(255) NULL,
    company_name VARCHAR(255) NULL,
    tax_id VARCHAR(50) NULL,
    customer_type ENUM('residential', 'business', 'enterprise') DEFAULT 'residential',
    notes TEXT NULL,
    metadata JSON NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_customers_code (customer_code),
    INDEX idx_customers_email (email),
    INDEX idx_customers_phone (phone),
    INDEX idx_customers_status (status),
    INDEX idx_customers_type (customer_type),
    INDEX idx_customers_location (latitude, longitude),
    INDEX idx_customers_registration (registration_date)
);
```

#### service_plans
```sql
CREATE TABLE service_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    setup_fee DECIMAL(10,2) DEFAULT 0,
    billing_cycle ENUM('monthly', 'yearly', 'quarterly', 'custom') DEFAULT 'monthly',
    download_speed INT NOT NULL,
    upload_speed INT NOT NULL,
    data_limit BIGINT NULL,
    data_unit ENUM('GB', 'MB', 'TB', 'unlimited') DEFAULT 'GB',
    concurrent_connections INT DEFAULT 1,
    contract_period INT DEFAULT 1,
    grace_period INT DEFAULT 7,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    features JSON NULL,
    speed_burst_enabled BOOLEAN DEFAULT FALSE,
    speed_burst_limit INT NULL,
    speed_burst_time INT NULL,
    fair_usage_policy BOOLEAN DEFAULT FALSE,
    fup_limit BIGINT NULL,
    fup_speed_reduction INT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_service_plans_slug (slug),
    INDEX idx_service_plans_active (is_active),
    INDEX idx_service_plans_popular (is_popular),
    INDEX idx_service_plans_price (price)
);
```

#### customer_subscriptions
```sql
CREATE TABLE customer_subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    service_plan_id BIGINT NOT NULL,
    nas_server_id BIGINT NOT NULL,
    subscription_code VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_encrypted VARCHAR(255) NOT NULL,
    mikrotik_id VARCHAR(255) NULL,
    status ENUM('pending', 'active', 'suspended', 'expired', 'terminated') DEFAULT 'pending',
    start_date DATE NOT NULL,
    end_date DATE NULL,
    next_billing_date DATE NULL,
    price DECIMAL(10,2) NOT NULL,
    setup_fee DECIMAL(10,2) DEFAULT 0,
    billing_cycle ENUM('monthly', 'yearly', 'quarterly', 'custom') DEFAULT 'monthly',
    auto_renew BOOLEAN DEFAULT TRUE,
    installation_address TEXT NULL,
    installation_date DATE NULL,
    installation_fee DECIMAL(10,2) DEFAULT 0,
    assigned_ip VARCHAR(45) NULL,
    assigned_mac VARCHAR(17) NULL,
    mikrotik_config JSON NULL,
    custom_settings JSON NULL,
    notes TEXT NULL,
    activated_at TIMESTAMP NULL,
    suspended_at TIMESTAMP NULL,
    terminated_at TIMESTAMP NULL,
    last_sync TIMESTAMP NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_plan_id) REFERENCES service_plans(id) ON DELETE RESTRICT,
    FOREIGN KEY (nas_server_id) REFERENCES nas_servers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_subscriptions_customer (customer_id),
    INDEX idx_subscriptions_plan (service_plan_id),
    INDEX idx_subscriptions_nas (nas_server_id),
    INDEX idx_subscriptions_code (subscription_code),
    INDEX idx_subscriptions_username (username),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_dates (start_date, end_date, next_billing_date)
);
```

#### customer_networks
```sql
CREATE TABLE customer_networks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    subscription_id BIGINT NULL,
    device_name VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    mac_address VARCHAR(17) NULL,
    interface VARCHAR(100) NULL,
    vlan_id VARCHAR(10) NULL,
    device_type ENUM('router', 'switch', 'access_point', 'cpe', 'ont', 'computer', 'mobile', 'other') DEFAULT 'other',
    manufacturer VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    firmware_version VARCHAR(50) NULL,
    location_description TEXT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    network_config JSON NULL,
    last_seen TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES customer_subscriptions(id) ON DELETE SET NULL,
    
    INDEX idx_networks_customer (customer_id),
    INDEX idx_networks_subscription (subscription_id),
    INDEX idx_networks_ip (ip_address),
    INDEX idx_networks_mac (mac_address),
    INDEX idx_networks_primary (is_primary),
    INDEX idx_networks_active (is_active)
);
```

#### customer_documents
```sql
CREATE TABLE customer_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    document_type ENUM('id_card', 'passport', 'company_registration', 'tax_certificate', 'contract', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NULL,
    file_mime_type VARCHAR(100) NULL,
    description TEXT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by BIGINT NULL,
    verified_at TIMESTAMP NULL,
    expires_at DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_documents_customer (customer_id),
    INDEX idx_documents_type (document_type),
    INDEX idx_documents_verified (is_verified),
    INDEX idx_documents_expires (expires_at)
);
```

#### customer_tickets
```sql
CREATE TABLE customer_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    subscription_id BIGINT NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('technical', 'billing', 'account', 'installation', 'other') DEFAULT 'technical',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'pending_customer', 'resolved', 'closed') DEFAULT 'open',
    assigned_to BIGINT NULL,
    resolution TEXT NULL,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES customer_subscriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_tickets_customer (customer_id),
    INDEX idx_tickets_subscription (subscription_id),
    INDEX idx_tickets_number (ticket_number),
    INDEX idx_tickets_status (status),
    INDEX idx_tickets_category (category),
    INDEX idx_tickets_priority (priority),
    INDEX idx_tickets_assigned (assigned_to)
);
```

#### ticket_replies
```sql
CREATE TABLE ticket_replies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    customer_id BIGINT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticket_id) REFERENCES customer_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    
    INDEX idx_replies_ticket (ticket_id),
    INDEX idx_replies_user (user_id),
    INDEX idx_replies_customer (customer_id)
);
```

## API Design

### Customer Management Endpoints

#### GET /api/customers
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: page, limit, search, status, type, city, province

// Response
{
    "success": true,
    "data": {
        "customers": [
            {
                "id": 1,
                "customer_code": "CUST-001",
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+628123456789",
                "address": "Jl. Example No. 123",
                "city": "Jakarta",
                "province": "DKI Jakarta",
                "status": "active",
                "customer_type": "residential",
                "registration_date": "2024-01-01",
                "latitude": -6.2088,
                "longitude": 106.8456,
                "subscriptions_count": 2,
                "active_subscriptions": 1,
                "total_revenue": 1500000,
                "created_at": "2024-01-01T10:00:00Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 10,
            "total_items": 100,
            "per_page": 10
        },
        "summary": {
            "total_customers": 100,
            "active_customers": 85,
            "new_customers_this_month": 12
        }
    }
}
```

#### POST /api/customers
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+628123456790",
    "address": "Jl. New Address No. 456",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "12345",
    "birth_date": "1990-01-01",
    "gender": "female",
    "id_card_number": "1234567890123456",
    "customer_type": "residential",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "notes": "New customer registration"
}

// Response
{
    "success": true,
    "message": "Customer created successfully",
    "data": {
        "customer": {
            "id": 2,
            "customer_code": "CUST-002",
            "name": "Jane Smith",
            "email": "jane@example.com",
            "phone": "+628123456790",
            "status": "prospect",
            "customer_type": "residential"
        }
    }
}
```

#### GET /api/customers/{id}
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "data": {
        "customer": {
            "id": 1,
            "customer_code": "CUST-001",
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+628123456789",
            "address": "Jl. Example No. 123",
            "city": "Jakarta",
            "province": "DKI Jakarta",
            "postal_code": "12345",
            "latitude": -6.2088,
            "longitude": 106.8456,
            "status": "active",
            "customer_type": "residential",
            "registration_date": "2024-01-01",
            "birth_date": "1990-01-01",
            "gender": "male",
            "id_card_number": "1234567890123456",
            "photo": "https://example.com/photos/customer1.jpg",
            "company_name": null,
            "tax_id": null,
            "notes": "Regular customer",
            "subscriptions": [
                {
                    "id": 1,
                    "subscription_code": "SUB-001",
                    "service_plan": {
                        "id": 1,
                        "name": "Home 10Mbps",
                        "download_speed": 10,
                        "upload_speed": 10,
                        "price": 500000
                    },
                    "status": "active",
                    "start_date": "2024-01-01",
                    "end_date": "2024-12-31",
                    "assigned_ip": "192.168.1.100",
                    "nas_server": {
                        "id": 1,
                        "name": "Main Router",
                        "ip_address": "192.168.1.1"
                    }
                }
            ],
            "networks": [
                {
                    "id": 1,
                    "device_name": "Home Router",
                    "ip_address": "192.168.1.100",
                    "mac_address": "00:11:22:33:44:55",
                    "device_type": "router",
                    "is_primary": true,
                    "is_active": true
                }
            ],
            "documents": [
                {
                    "id": 1,
                    "document_type": "id_card",
                    "document_name": "KTP_John_Doe.jpg",
                    "is_verified": true
                }
            ],
            "created_at": "2024-01-01T10:00:00Z"
        }
    }
}
```

#### PUT /api/customers/{id}
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "name": "John Doe Updated",
    "address": "Jl. Updated Address No. 789",
    "phone": "+628123456791",
    "status": "active"
}

// Response
{
    "success": true,
    "message": "Customer updated successfully",
    "data": {
        "customer": {
            "id": 1,
            "customer_code": "CUST-001",
            "name": "John Doe Updated",
            "address": "Jl. Updated Address No. 789",
            "phone": "+628123456791",
            "status": "active"
        }
    }
}
```

#### POST /api/customers/{id}/documents
```php
// Headers: Authorization: Bearer {token}
// Content-Type: multipart/form-data
// Request
{
    "document_type": "id_card",
    "document_name": "Updated ID Card",
    "description": "Updated ID card document",
    "file": [binary file data]
}

// Response
{
    "success": true,
    "message": "Document uploaded successfully",
    "data": {
        "document": {
            "id": 2,
            "document_type": "id_card",
            "document_name": "Updated ID Card",
            "file_path": "documents/customers/1/id_card_2.jpg",
            "file_size": 1024000,
            "is_verified": false
        }
    }
}
```

### Service Plans Endpoints

#### GET /api/service-plans
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: is_active, is_popular, customer_type

// Response
{
    "success": true,
    "data": {
        "plans": [
            {
                "id": 1,
                "name": "Home 10Mbps",
                "slug": "home-10mbps",
                "description": "Perfect for home use with reliable internet connection",
                "price": 500000,
                "setup_fee": 100000,
                "billing_cycle": "monthly",
                "download_speed": 10,
                "upload_speed": 10,
                "data_limit": null,
                "data_unit": "unlimited",
                "concurrent_connections": 1,
                "is_active": true,
                "is_popular": true,
                "features": {
                    "unlimited_data": true,
                    "free_installation": false,
                    "24_7_support": true
                },
                "customers_count": 150
            }
        ]
    }
}
```

#### POST /api/service-plans
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "name": "Business 50Mbps",
    "slug": "business-50mbps",
    "description": "High-speed internet for business operations",
    "price": 2000000,
    "setup_fee": 500000,
    "billing_cycle": "monthly",
    "download_speed": 50,
    "upload_speed": 50,
    "data_limit": 500,
    "data_unit": "GB",
    "concurrent_connections": 5,
    "is_active": true,
    "is_popular": false,
    "features": {
        "dedicated_support": true,
        "priority_bandwidth": true,
        "static_ip": true
    }
}

// Response
{
    "success": true,
    "message": "Service plan created successfully",
    "data": {
        "plan": {
            "id": 2,
            "name": "Business 50Mbps",
            "slug": "business-50mbps",
            "price": 2000000
        }
    }
}
```

### Subscription Management Endpoints

#### GET /api/subscriptions
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: page, limit, customer_id, status, nas_server_id

// Response
{
    "success": true,
    "data": {
        "subscriptions": [
            {
                "id": 1,
                "subscription_code": "SUB-001",
                "customer": {
                    "id": 1,
                    "customer_code": "CUST-001",
                    "name": "John Doe"
                },
                "service_plan": {
                    "id": 1,
                    "name": "Home 10Mbps",
                    "download_speed": 10,
                    "upload_speed": 10
                },
                "nas_server": {
                    "id": 1,
                    "name": "Main Router",
                    "ip_address": "192.168.1.1"
                },
                "username": "customer001",
                "status": "active",
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "next_billing_date": "2024-02-01",
                "price": 500000,
                "assigned_ip": "192.168.1.100",
                "assigned_mac": "00:11:22:33:44:55",
                "created_at": "2024-01-01T10:00:00Z"
            }
        ]
    }
}
```

#### POST /api/subscriptions
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "customer_id": 1,
    "service_plan_id": 1,
    "nas_server_id": 1,
    "username": "customer002",
    "password": "secure_password",
    "start_date": "2024-01-15",
    "installation_address": "Jl. Installation No. 123",
    "installation_date": "2024-01-15",
    "installation_fee": 100000,
    "assigned_ip": "192.168.1.101",
    "assigned_mac": "00:11:22:33:44:56"
}

// Response
{
    "success": true,
    "message": "Subscription created successfully",
    "data": {
        "subscription": {
            "id": 2,
            "subscription_code": "SUB-002",
            "customer_id": 1,
            "service_plan_id": 1,
            "nas_server_id": 1,
            "username": "customer002",
            "status": "pending",
            "start_date": "2024-01-15"
        }
    }
}
```

#### POST /api/subscriptions/{id}/activate
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "message": "Subscription activated successfully",
    "data": {
        "subscription": {
            "id": 2,
            "status": "active",
            "activated_at": "2024-01-15T10:00:00Z",
            "mikrotik_id": "*1"
        }
    }
}
```

#### POST /api/subscriptions/{id}/suspend
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "reason": "Non-payment"
}

// Response
{
    "success": true,
    "message": "Subscription suspended successfully",
    "data": {
        "subscription": {
            "id": 2,
            "status": "suspended",
            "suspended_at": "2024-01-20T10:00:00Z"
        }
    }
}
```

### Customer Portal Endpoints

#### GET /api/customer/profile
```php
// Headers: Authorization: Bearer {customer_token}

// Response
{
    "success": true,
    "data": {
        "customer": {
            "id": 1,
            "customer_code": "CUST-001",
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+628123456789",
            "address": "Jl. Example No. 123",
            "city": "Jakarta",
            "province": "DKI Jakarta",
            "status": "active"
        }
    }
}
```

#### GET /api/customer/subscriptions
```php
// Headers: Authorization: Bearer {customer_token}

// Response
{
    "success": true,
    "data": {
        "subscriptions": [
            {
                "id": 1,
                "subscription_code": "SUB-001",
                "service_plan": {
                    "name": "Home 10Mbps",
                    "download_speed": 10,
                    "upload_speed": 10
                },
                "status": "active",
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "next_billing_date": "2024-02-01",
                "assigned_ip": "192.168.1.100",
                "usage": {
                    "data_used": 250000000000,
                    "data_limit": null,
                    "percentage": null
                }
            }
        ]
    }
}
```

#### POST /api/customer/tickets
```php
// Headers: Authorization: Bearer {customer_token}
// Request
{
    "subject": "Internet connection issue",
    "description": "My internet connection is very slow since this morning",
    "category": "technical",
    "priority": "high"
}

// Response
{
    "success": true,
    "message": "Ticket created successfully",
    "data": {
        "ticket": {
            "id": 1,
            "ticket_number": "TKT-001",
            "subject": "Internet connection issue",
            "status": "open",
            "created_at": "2024-01-15T10:00:00Z"
        }
    }
}
```

### Network Mapping Endpoints

#### GET /api/customers/map
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: city, province, status, bounds

// Response
{
    "success": true,
    "data": {
        "customers": [
            {
                "id": 1,
                "customer_code": "CUST-001",
                "name": "John Doe",
                "latitude": -6.2088,
                "longitude": 106.8456,
                "status": "active",
                "customer_type": "residential",
                "subscriptions_count": 2,
                "active_subscriptions": 1,
                "address": "Jl. Example No. 123"
            }
        ],
        "clusters": [
            {
                "center": {
                    "latitude": -6.2088,
                    "longitude": 106.8456
                },
                "count": 25,
                "radius": 500
            }
        ],
        "summary": {
            "total_customers": 100,
            "active_customers": 85,
            "coverage_area": "25.5 km²"
        }
    }
}
```

#### GET /api/network/topology
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: nas_server_id, bounds

// Response
{
    "success": true,
    "data": {
        "nodes": [
            {
                "id": "nas-1",
                "type": "nas",
                "name": "Main Router",
                "ip_address": "192.168.1.1",
                "latitude": -6.2088,
                "longitude": 106.8456,
                "status": "online",
                "connections_count": 45
            },
            {
                "id": "customer-1",
                "type": "customer",
                "name": "John Doe",
                "latitude": -6.2090,
                "longitude": 106.8458,
                "status": "active",
                "subscription_id": 1
            }
        ],
        "links": [
            {
                "source": "nas-1",
                "target": "customer-1",
                "type": "connection",
                "status": "active",
                "bandwidth": 10,
                "distance": 250
            }
        ]
    }
}
```

## Implementation Details

### Backend Implementation

#### Customer Model
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Tags\HasTags;

class Customer extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia, HasTags;

    protected $fillable = [
        'customer_code',
        'name',
        'email',
        'phone',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'status',
        'registration_date',
        'birth_date',
        'gender',
        'id_card_number',
        'company_name',
        'tax_id',
        'customer_type',
        'notes',
        'metadata'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'registration_date' => 'date',
        'birth_date' => 'date',
        'metadata' => 'array',
    ];

    public function subscriptions()
    {
        return $this->hasMany(CustomerSubscription::class);
    }

    public function activeSubscriptions()
    {
        return $this->subscriptions()->where('status', 'active');
    }

    public function networks()
    {
        return $this->hasMany(CustomerNetwork::class);
    }

    public function documents()
    {
        return $this->hasMany(CustomerDocument::class);
    }

    public function tickets()
    {
        return $this->hasMany(CustomerTicket::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('profile_photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('id_card')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'application/pdf']);
    }

    public function getProfilePhotoUrlAttribute()
    {
        return $this->getFirstMediaUrl('profile_photo') 
            ?: 'https://ui-avatars.com/api/?name=' . urlencode($this->name);
    }

    public function getIdCardPhotoUrlAttribute()
    {
        return $this->getFirstMediaUrl('id_card');
    }

    public function getActiveSubscriptionsCountAttribute(): int
    {
        return $this->activeSubscriptions()->count();
    }

    public function getTotalRevenueAttribute(): float
    {
        return $this->invoices()->where('status', 'paid')->sum('total');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByCity($query, $city)
    {
        return $query->where('city', $city);
    }

    public function scopeByProvince($query, $province)
    {
        return $query->where('province', $province);
    }

    public function scopeWithinBounds($query, $north, $south, $east, $west)
    {
        return $query->whereBetween('latitude', [$south, $north])
                   ->whereBetween('longitude', [$west, $east]);
    }
}
```

#### Service Plan Model
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServicePlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'setup_fee',
        'billing_cycle',
        'download_speed',
        'upload_speed',
        'data_limit',
        'data_unit',
        'concurrent_connections',
        'contract_period',
        'grace_period',
        'is_active',
        'is_popular',
        'features',
        'speed_burst_enabled',
        'speed_burst_limit',
        'speed_burst_time',
        'fair_usage_policy',
        'fup_limit',
        'fup_speed_reduction',
        'metadata'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'setup_fee' => 'decimal:2',
        'data_limit' => 'integer',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'speed_burst_enabled' => 'boolean',
        'fair_usage_policy' => 'boolean',
        'features' => 'array',
        'metadata' => 'array',
    ];

    public function subscriptions()
    {
        return $this->hasMany(CustomerSubscription::class);
    }

    public function activeSubscriptions()
    {
        return $this->subscriptions()->where('status', 'active');
    }

    public function getCustomersCountAttribute(): int
    {
        return $this->activeSubscriptions()->count();
    }

    public function getMonthlyRevenueAttribute(): float
    {
        if ($this->billing_cycle === 'monthly') {
            return $this->price * $this->customers_count;
        } elseif ($this->billing_cycle === 'yearly') {
            return ($this->price / 12) * $this->customers_count;
        }
        
        return $this->price * $this->customers_count;
    }

    public function getDisplaySpeedAttribute(): string
    {
        return "{$this->download_speed}Mbps/{$this->upload_speed}Mbps";
    }

    public function getDisplayDataLimitAttribute(): string
    {
        if ($this->data_unit === 'unlimited' || !$this->data_limit) {
            return 'Unlimited';
        }

        return $this->formatBytes($this->data_limit, $this->data_unit);
    }

    private function formatBytes($bytes, $unit): string
    {
        return match ($unit) {
            'GB' => number_format($bytes / 1024 / 1024 / 1024, 1) . ' GB',
            'MB' => number_format($bytes / 1024 / 1024, 1) . ' MB',
            'TB' => number_format($bytes / 1024 / 1024 / 1024 / 1024, 1) . ' TB',
            default => $bytes . ' bytes'
        };
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    public function scopeByCustomerType($query, $customerType)
    {
        return $query->whereJsonContains('metadata->customer_types', $customerType);
    }
}
```

#### Customer Subscription Model
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class CustomerSubscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'service_plan_id',
        'nas_server_id',
        'subscription_code',
        'username',
        'password_encrypted',
        'mikrotik_id',
        'status',
        'start_date',
        'end_date',
        'next_billing_date',
        'price',
        'setup_fee',
        'billing_cycle',
        'auto_renew',
        'installation_address',
        'installation_date',
        'installation_fee',
        'assigned_ip',
        'assigned_mac',
        'mikrotik_config',
        'custom_settings',
        'notes',
        'activated_at',
        'suspended_at',
        'terminated_at',
        'last_sync'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'next_billing_date' => 'date',
        'installation_date' => 'date',
        'price' => 'decimal:2',
        'setup_fee' => 'decimal:2',
        'installation_fee' => 'decimal:2',
        'auto_renew' => 'boolean',
        'mikrotik_config' => 'array',
        'custom_settings' => 'array',
        'activated_at' => 'datetime',
        'suspended_at' => 'datetime',
        'terminated_at' => 'datetime',
        'last_sync' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function servicePlan()
    {
        return $this->belongsTo(ServicePlan::class);
    }

    public function nasServer()
    {
        return $this->belongsTo(NasServer::class);
    }

    public function networks()
    {
        return $this->hasMany(CustomerNetwork::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function monitoringData()
    {
        return $this->hasMany(MonitoringData::class);
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['password_encrypted'] = encrypt($value);
    }

    public function getDecryptedPasswordAttribute()
    {
        return decrypt($this->password_encrypted);
    }

    public function getDaysUntilExpiryAttribute(): int
    {
        if (!$this->end_date) {
            return -1;
        }

        return now()->diffInDays($this->end_date, false);
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        return $this->days_until_expiry >= 0 && $this->days_until_expiry <= 7;
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->end_date && now()->isAfter($this->end_date);
    }

    public function getUsagePercentageAttribute(): float
    {
        if (!$this->servicePlan->data_limit || $this->servicePlan->data_unit === 'unlimited') {
            return 0;
        }

        $currentUsage = $this->getCurrentDataUsage();
        $limit = $this->servicePlan->data_limit;

        return min(($currentUsage / $limit) * 100, 100);
    }

    private function getCurrentDataUsage(): int
    {
        // Get current month's data usage from monitoring
        return $this->monitoringData()
            ->where('metric_type', 'bandwidth')
            ->whereMonth('recorded_at', now()->month)
            ->sum('value');
    }

    public function activate(): bool
    {
        $this->status = 'active';
        $this->activated_at = now();
        
        if (!$this->end_date) {
            $this->end_date = $this->calculateEndDate();
        }

        return $this->save();
    }

    public function suspend(string $reason = null): bool
    {
        $this->status = 'suspended';
        $this->suspended_at = now();
        
        if ($reason) {
            $this->notes = ($this->notes ? $this->notes . "\n" : '') . "Suspended: {$reason}";
        }

        return $this->save();
    }

    public function terminate(string $reason = null): bool
    {
        $this->status = 'terminated';
        $this->terminated_at = now();
        
        if ($reason) {
            $this->notes = ($this->notes ? $this->notes . "\n" : '') . "Terminated: {$reason}";
        }

        return $this->save();
    }

    private function calculateEndDate(): Carbon
    {
        return match ($this->billing_cycle) {
            'monthly' => now()->addMonth(),
            'yearly' => now()->addYear(),
            'quarterly' => now()->addQuarter(),
            default => now()->addMonth()
        };
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeExpiringSoon($query, int $days = 7)
    {
        return $query->where('end_date', '<=', now()->addDays($days))
                   ->where('end_date', '>', now());
    }
}
```

#### Customer Service
```php
<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\CustomerSubscription;
use App\Models\ServicePlan;
use App\Models\NasServer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CustomerService
{
    private MikroTikService $mikrotikService;

    public function __construct(MikroTikService $mikrotikService)
    {
        $this->mikrotikService = $mikrotikService;
    }

    public function createCustomer(array $data): Customer
    {
        return DB::transaction(function () use ($data) {
            $customerData = [
                'customer_code' => $this->generateCustomerCode(),
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'province' => $data['province'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'gender' => $data['gender'] ?? null,
                'id_card_number' => $data['id_card_number'] ?? null,
                'company_name' => $data['company_name'] ?? null,
                'tax_id' => $data['tax_id'] ?? null,
                'customer_type' => $data['customer_type'] ?? 'residential',
                'status' => 'prospect',
                'registration_date' => now()->toDateString(),
                'notes' => $data['notes'] ?? null,
                'metadata' => $data['metadata'] ?? [],
                'created_by' => auth()->id(),
            ];

            $customer = Customer::create($customerData);

            // Handle file uploads
            if (isset($data['profile_photo'])) {
                $customer->addMedia($data['profile_photo'])
                    ->toMediaCollection('profile_photo');
            }

            if (isset($data['id_card_photo'])) {
                $customer->addMedia($data['id_card_photo'])
                    ->toMediaCollection('id_card');
            }

            // Log activity
            activity()
                ->causedBy(auth()->user())
                ->performedOn($customer)
                ->log('Customer created');

            return $customer;
        });
    }

    public function updateCustomer(Customer $customer, array $data): Customer
    {
        return DB::transaction(function () use ($customer, $data) {
            $oldValues = $customer->toArray();

            $customer->update($data);

            // Handle file uploads
            if (isset($data['profile_photo'])) {
                $customer->clearMediaCollection('profile_photo');
                $customer->addMedia($data['profile_photo'])
                    ->toMediaCollection('profile_photo');
            }

            if (isset($data['id_card_photo'])) {
                $customer->clearMediaCollection('id_card');
                $customer->addMedia($data['id_card_photo'])
                    ->toMediaCollection('id_card');
            }

            // Log activity
            activity()
                ->causedBy(auth()->user())
                ->performedOn($customer)
                ->withProperties([
                    'old' => $oldValues,
                    'new' => $customer->toArray()
                ])
                ->log('Customer updated');

            return $customer;
        });
    }

    public function createSubscription(array $data): CustomerSubscription
    {
        return DB::transaction(function () use ($data) {
            $subscriptionData = [
                'customer_id' => $data['customer_id'],
                'service_plan_id' => $data['service_plan_id'],
                'nas_server_id' => $data['nas_server_id'],
                'subscription_code' => $this->generateSubscriptionCode(),
                'username' => $data['username'],
                'password' => $data['password'],
                'start_date' => $data['start_date'],
                'price' => $data['price'] ?? ServicePlan::find($data['service_plan_id'])->price,
                'setup_fee' => $data['setup_fee'] ?? 0,
                'billing_cycle' => $data['billing_cycle'] ?? 'monthly',
                'auto_renew' => $data['auto_renew'] ?? true,
                'installation_address' => $data['installation_address'] ?? null,
                'installation_date' => $data['installation_date'] ?? null,
                'installation_fee' => $data['installation_fee'] ?? 0,
                'assigned_ip' => $data['assigned_ip'] ?? null,
                'assigned_mac' => $data['assigned_mac'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id(),
            ];

            $subscription = CustomerSubscription::create($subscriptionData);

            // Create network device if provided
            if (isset($data['device_name'])) {
                $subscription->networks()->create([
                    'customer_id' => $data['customer_id'],
                    'device_name' => $data['device_name'],
                    'ip_address' => $data['assigned_ip'],
                    'mac_address' => $data['assigned_mac'],
                    'device_type' => $data['device_type'] ?? 'router',
                    'is_primary' => true,
                    'is_active' => true,
                ]);
            }

            // Log activity
            activity()
                ->causedBy(auth()->user())
                ->performedOn($subscription)
                ->log('Subscription created');

            return $subscription;
        });
    }

    public function activateSubscription(CustomerSubscription $subscription): bool
    {
        return DB::transaction(function () use ($subscription) {
            $nasServer = $subscription->nasServer;
            $servicePlan = $subscription->servicePlan;

            // Create user on MikroTik
            $mikrotikData = [
                'name' => $subscription->username,
                'password' => $subscription->getDecryptedPasswordAttribute(),
                'service' => 'pppoe',
                'profile' => $servicePlan->slug,
                'local-address' => $nasServer->configuration['local_address'] ?? null,
                'remote-address' => $subscription->assigned_ip,
                'comment' => "Customer: {$subscription->customer->name} ({$subscription->customer_code})"
            ];

            if ($this->mikrotikService->createUser($nasServer, $mikrotikData)) {
                $subscription->activate();
                
                // Update customer status if this is their first subscription
                if ($subscription->customer->subscriptions()->count() === 1) {
                    $subscription->customer->update(['status' => 'active']);
                }

                // Log activity
                activity()
                    ->causedBy(auth()->user())
                    ->performedOn($subscription)
                    ->log('Subscription activated');

                return true;
            }

            throw new \Exception('Failed to create user on MikroTik');
        });
    }

    public function suspendSubscription(CustomerSubscription $subscription, string $reason = null): bool
    {
        return DB::transaction(function () use ($subscription, $reason) {
            $nasServer = $subscription->nasServer;

            // Disable user on MikroTik
            if ($subscription->mikrotik_id) {
                $mikrotikData = ['disabled' => 'yes'];
                $this->mikrotikService->updateUser($nasServer, $subscription->mikrotik_id, $mikrotikData);
            }

            $subscription->suspend($reason);

            // Log activity
            activity()
                ->causedBy(auth()->user())
                ->performedOn($subscription)
                ->withProperties(['reason' => $reason])
                ->log('Subscription suspended');

            return true;
        });
    }

    public function terminateSubscription(CustomerSubscription $subscription, string $reason = null): bool
    {
        return DB::transaction(function () use ($subscription, $reason) {
            $nasServer = $subscription->nasServer;

            // Delete user from MikroTik
            if ($subscription->mikrotik_id) {
                $this->mikrotikService->deleteUser($nasServer, $subscription->mikrotik_id);
            }

            $subscription->terminate($reason);

            // Update customer status if they have no active subscriptions
            if ($subscription->customer->activeSubscriptions()->count() === 0) {
                $subscription->customer->update(['status' => 'suspended']);
            }

            // Log activity
            activity()
                ->causedBy(auth()->user())
                ->performedOn($subscription)
                ->withProperties(['reason' => $reason])
                ->log('Subscription terminated');

            return true;
        });
    }

    private function generateCustomerCode(): string
    {
        $prefix = 'CUST';
        $year = now()->format('Y');
        $month = now()->format('m');
        
        $lastCustomer = Customer::whereYear('created_at', $year)
                              ->whereMonth('created_at', $month)
                              ->orderBy('customer_code', 'desc')
                              ->first();

        $sequence = $lastCustomer ? intval(substr($lastCustomer->customer_code, -4)) + 1 : 1;
        
        return sprintf('%s-%s%04d', $prefix, $year . $month, $sequence);
    }

    private function generateSubscriptionCode(): string
    {
        $prefix = 'SUB';
        $year = now()->format('Y');
        $month = now()->format('m');
        
        $lastSubscription = CustomerSubscription::whereYear('created_at', $year)
                                              ->whereMonth('created_at', $month)
                                              ->orderBy('subscription_code', 'desc')
                                              ->first();

        $sequence = $lastSubscription ? intval(substr($lastSubscription->subscription_code, -4)) + 1 : 1;
        
        return sprintf('%s-%s%04d', $prefix, $year . $month, $sequence);
    }

    public function searchCustomers(array $filters)
    {
        $query = Customer::with(['subscriptions.servicePlan', 'subscriptions.nasServer']);

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('customer_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['customer_type'])) {
            $query->where('customer_type', $filters['customer_type']);
        }

        if (isset($filters['city'])) {
            $query->where('city', $filters['city']);
        }

        if (isset($filters['province'])) {
            $query->where('province', $filters['province']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }
}
```

### Frontend Implementation

#### Customer Management Components
```javascript
// src/components/customers/CustomerList.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../../services/customerService';
import { formatDistanceToNow } from 'date-fns';

const CustomerList = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    customer_type: '',
    city: '',
    page: 1
  });

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customerService.getCustomers(filters)
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'prospect': return 'text-blue-600 bg-blue-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'terminated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCustomerTypeColor = (type) => {
    switch (type) {
      case 'residential': return 'text-purple-600 bg-purple-100';
      case 'business': return 'text-indigo-600 bg-indigo-100';
      case 'enterprise': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search customers..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          />
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>

          <select
            value={filters.customer_type}
            onChange={(e) => setFilters({...filters, customer_type: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="residential">Residential</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <input
            type="text"
            placeholder="City..."
            value={filters.city}
            onChange={(e) => setFilters({...filters, city: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          />

          <button
            onClick={() => setFilters({search: '', status: '', customer_type: '', city: '', page: 1})}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Customers</h3>
          <p className="text-2xl font-bold">{customers?.data?.summary?.total_customers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Active Customers</h3>
          <p className="text-2xl font-bold text-green-600">{customers?.data?.summary?.active_customers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">New This Month</h3>
          <p className="text-2xl font-bold text-blue-600">{customers?.data?.summary?.new_customers_this_month || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
          <p className="text-2xl font-bold">Rp {(customers?.data?.summary?.total_revenue || 0).toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscriptions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers?.data?.customers?.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={customer.photo || `https://ui-avatars.com/api/?name=${customer.name}`}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.customer_code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.city}</div>
                    <div className="text-sm text-gray-500">{customer.province}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCustomerTypeColor(customer.customer_type)}`}>
                        {customer.customer_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.active_subscriptions}/{customer.subscriptions_count}
                    </div>
                    <div className="text-sm text-gray-500">Active/Total</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {customer.total_revenue.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(customer.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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
              disabled={filters.page >= (customers?.data?.pagination?.total_pages || 1)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(filters.page - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(filters.page * 10, customers?.data?.pagination?.total_items || 0)}</span> of{' '}
                <span className="font-medium">{customers?.data?.pagination?.total_items || 0}</span> results
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
                  Page {filters.page} of {customers?.data?.pagination?.total_pages || 1}
                </span>
                <button
                  onClick={() => setFilters({...filters, page: filters.page + 1})}
                  disabled={filters.page >= (customers?.data?.pagination?.total_pages || 1)}
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

export default CustomerList;
```

#### Network Mapping Component
```javascript
// src/components/customers/CustomerMap.jsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayerGroup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { customerService } from '../../services/customerService';
import 'leaflet/dist/leaflet.css';

const CustomerMap = () => {
  const [filters, setFilters] = useState({
    status: '',
    customer_type: '',
    city: '',
    bounds: null
  });

  const { data: mapData, isLoading } = useQuery({
    queryKey: ['customers-map', filters],
    queryFn: () => customerService.getCustomerMap(filters)
  });

  // Custom icons for different customer types
  const customerIcons = {
    residential: new Icon({
      iconUrl: '/icons/residential.png',
      iconSize: [25, 25],
      iconAnchor: [12, 12]
    }),
    business: new Icon({
      iconUrl: '/icons/business.png',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    }),
    enterprise: new Icon({
      iconUrl: '/icons/enterprise.png',
      iconSize: [35, 35],
      iconAnchor: [17, 17]
    })
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'prospect': return '#3b82f6';
      case 'suspended': return '#f59e0b';
      case 'terminated': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleMapMoveEnd = (event) => {
    const bounds = event.target.getBounds();
    setFilters(prev => ({
      ...prev,
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }
    }));
  };

  if (isLoading) return <div>Loading map...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Network Map</h1>
        <div className="flex space-x-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>

          <select
            value={filters.customer_type}
            onChange={(e) => setFilters({...filters, customer_type: e.target.value})}
            className="border rounded px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="residential">Residential</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Customers</h3>
          <p className="text-2xl font-bold">{mapData?.data?.summary?.total_customers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Active Customers</h3>
          <p className="text-2xl font-bold text-green-600">{mapData?.data?.summary?.active_customers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Coverage Area</h3>
          <p className="text-2xl font-bold">{mapData?.data?.summary?.coverage_area || '0'} km²</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Density</h3>
          <p className="text-2xl font-bold">
            {mapData?.data?.summary?.coverage_area 
              ? Math.round((mapData?.data?.summary?.total_customers || 0) / parseFloat(mapData?.data?.summary?.coverage_area))
              : 0
            } /km²
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
        <MapContainer
          center={[-6.2088, 106.8456]} // Default to Jakarta
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          onMoveEnd={handleMapMoveEnd}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Customer Clusters */}
          <LayerGroup>
            {mapData?.data?.clusters?.map((cluster, index) => (
              <CircleMarker
                key={`cluster-${index}`}
                center={[cluster.center.latitude, cluster.center.longitude]}
                radius={Math.sqrt(cluster.count) * 5}
                fillColor="#3b82f6"
                color="#1e40af"
                weight={2}
                opacity={0.8}
                fillOpacity={0.5}
              >
                <Popup>
                  <div className="text-center">
                    <strong>Cluster</strong><br />
                    {cluster.count} customers<br />
                    Radius: {cluster.radius}m
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </LayerGroup>

          {/* Individual Customers */}
          <LayerGroup>
            {mapData?.data?.customers?.map((customer) => (
              <Marker
                key={customer.id}
                position={[customer.latitude, customer.longitude]}
                icon={customerIcons[customer.customer_type] || customerIcons.residential}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.customer_code}</p>
                    <p className="text-sm">{customer.address}</p>
                    <div className="mt-2">
                      <span 
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getStatusColor(customer.status) }}
                      >
                        {customer.status}
                      </span>
                      <span className="ml-1 inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {customer.customer_type}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Subscriptions: {customer.active_subscriptions}/{customer.subscriptions_count}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-2">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">Active</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">Prospect</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm">Suspended</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm">Terminated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMap;
```

## Testing Requirements

### Unit Tests

#### Customer Service Tests
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\CustomerService;
use App\Models\Customer;
use App\Models\CustomerSubscription;
use App\Models\ServicePlan;
use App\Models\NasServer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerServiceTest extends TestCase
{
    use RefreshDatabase;

    private CustomerService $customerService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customerService = app(CustomerService::class);
    }

    public function test_can_create_customer()
    {
        $customerData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+628123456789',
            'address' => 'Jl. Example No. 123',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'customer_type' => 'residential'
        ];

        $customer = $this->customerService->createCustomer($customerData);

        $this->assertInstanceOf(Customer::class, $customer);
        $this->assertEquals('John Doe', $customer->name);
        $this->assertEquals('john@example.com', $customer->email);
        $this->assertEquals('residential', $customer->customer_type);
        $this->assertEquals('prospect', $customer->status);
        $this->assertNotNull($customer->customer_code);
    }

    public function test_can_create_subscription()
    {
        $customer = Customer::factory()->create();
        $servicePlan = ServicePlan::factory()->create();
        $nasServer = NasServer::factory()->create();

        $subscriptionData = [
            'customer_id' => $customer->id,
            'service_plan_id' => $servicePlan->id,
            'nas_server_id' => $nasServer->id,
            'username' => 'testuser',
            'password' => 'testpass',
            'start_date' => now()->toDateString(),
            'assigned_ip' => '192.168.1.100',
            'assigned_mac' => '00:11:22:33:44:55'
        ];

        $subscription = $this->customerService->createSubscription($subscriptionData);

        $this->assertInstanceOf(CustomerSubscription::class, $subscription);
        $this->assertEquals($customer->id, $subscription->customer_id);
        $this->assertEquals($servicePlan->id, $subscription->service_plan_id);
        $this->assertEquals('pending', $subscription->status);
        $this->assertNotNull($subscription->subscription_code);
    }

    public function test_customer_code_generation()
    {
        $customer1 = Customer::factory()->create(['created_at' => now()]);
        $customer2 = Customer::factory()->create(['created_at' => now()]);

        $this->assertNotEquals($customer1->customer_code, $customer2->customer_code);
        $this->assertStringStartsWith('CUST-', $customer1->customer_code);
        $this->assertStringStartsWith('CUST-', $customer2->customer_code);
    }

    public function test_subscription_code_generation()
    {
        $subscription1 = CustomerSubscription::factory()->create(['created_at' => now()]);
        $subscription2 = CustomerSubscription::factory()->create(['created_at' => now()]);

        $this->assertNotEquals($subscription1->subscription_code, $subscription2->subscription_code);
        $this->assertStringStartsWith('SUB-', $subscription1->subscription_code);
        $this->assertStringStartsWith('SUB-', $subscription2->subscription_code);
    }
}
```

#### Customer Model Tests
```php
<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Customer;
use App\Models\CustomerSubscription;
use App\Models\ServicePlan;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_has_many_subscriptions()
    {
        $customer = Customer::factory()->create();
        $subscription = CustomerSubscription::factory()->create(['customer_id' => $customer->id]);

        $this->assertInstanceOf(CustomerSubscription::class, $customer->subscriptions->first());
        $this->assertEquals(1, $customer->subscriptions->count());
    }

    public function test_active_subscriptions_scope()
    {
        $customer = Customer::factory()->create();
        CustomerSubscription::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'active'
        ]);
        CustomerSubscription::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'suspended'
        ]);

        $this->assertEquals(1, $customer->activeSubscriptions()->count());
    }

    public function test_active_subscriptions_count_attribute()
    {
        $customer = Customer::factory()->create();
        CustomerSubscription::factory()->count(2)->create([
            'customer_id' => $customer->id,
            'status' => 'active'
        ]);
        CustomerSubscription::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'suspended'
        ]);

        $this->assertEquals(2, $customer->active_subscriptions_count);
    }

    public function test_within_bounds_scope()
    {
        Customer::factory()->create([
            'latitude' => -6.2088,
            'longitude' => 106.8456
        ]);
        Customer::factory()->create([
            'latitude' => -6.3000,
            'longitude' => 106.9000
        ]);

        $customers = Customer::withinBounds(-6.1, -6.3, 106.9, 106.8)->get();
        $this->assertEquals(1, $customers->count());
    }
}
```

### Integration Tests

#### Customer API Tests
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($this->admin, 'sanctum');
        
        Storage::fake('public');
    }

    public function test_can_get_customers()
    {
        Customer::factory()->count(5)->create();

        $response = $this->getJson('/api/customers');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'customers' => [
                            '*' => [
                                'id',
                                'customer_code',
                                'name',
                                'email',
                                'phone',
                                'status',
                                'customer_type',
                                'subscriptions_count',
                                'active_subscriptions',
                                'total_revenue'
                            ]
                        ],
                        'pagination',
                        'summary'
                    ]
                ]);
    }

    public function test_can_create_customer()
    {
        $customerData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+628123456789',
            'address' => 'Jl. Example No. 123',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'customer_type' => 'residential'
        ];

        $response = $this->postJson('/api/customers', $customerData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'customer' => [
                            'id',
                            'customer_code',
                            'name',
                            'email',
                            'status'
                        ]
                    ]
                ]);

        $this->assertDatabaseHas('customers', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'customer_type' => 'residential'
        ]);
    }

    public function test_can_upload_customer_document()
    {
        $customer = Customer::factory()->create();
        $file = UploadedFile::fake()->image('id_card.jpg');

        $response = $this->postJson("/api/customers/{$customer->id}/documents", [
            'document_type' => 'id_card',
            'document_name' => 'ID Card',
            'file' => $file
        ]);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'document' => [
                            'id',
                            'document_type',
                            'document_name',
                            'file_path',
                            'is_verified'
                        ]
                    ]
                ]);

        $this->assertDatabaseHas('customer_documents', [
            'customer_id' => $customer->id,
            'document_type' => 'id_card',
            'document_name' => 'ID Card'
        ]);
    }

    public function test_can_get_customer_map_data()
    {
        Customer::factory()->create([
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'status' => 'active'
        ]);

        $response = $this->getJson('/api/customers/map');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'customers' => [
                            '*' => [
                                'id',
                                'customer_code',
                                'name',
                                'latitude',
                                'longitude',
                                'status',
                                'customer_type'
                            ]
                        ],
                        'clusters',
                        'summary'
                    ]
                ]);
    }
}
```

### Frontend Tests

#### Customer List Component Tests
```javascript
// src/components/__tests__/CustomerList.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CustomerList from '../customers/CustomerList';
import { customerService } from '../../services/customerService';

// Mock the customer service
jest.mock('../../services/customerService');

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

describe('CustomerList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders customer list', async () => {
    const mockCustomers = {
      data: {
        customers: [
          {
            id: 1,
            customer_code: 'CUST-001',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+628123456789',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            status: 'active',
            customer_type: 'residential',
            subscriptions_count: 2,
            active_subscriptions: 1,
            total_revenue: 1500000
          }
        ],
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_items: 1,
          per_page: 10
        },
        summary: {
          total_customers: 1,
          active_customers: 1,
          new_customers_this_month: 0,
          total_revenue: 1500000
        }
      }
    };

    customerService.getCustomers.mockResolvedValue(mockCustomers);

    renderWithClient(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('CUST-001')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jakarta')).toBeInTheDocument();
    });
  });

  test('can filter customers by status', async () => {
    customerService.getCustomers.mockResolvedValue({ data: { customers: [] } });

    renderWithClient(<CustomerList />);

    const statusFilter = screen.getByLabelText(/status/i);
    fireEvent.change(statusFilter, { target: { value: 'active' } });

    await waitFor(() => {
      expect(customerService.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active', page: 1 })
      );
    });
  });

  test('can search customers', async () => {
    customerService.getCustomers.mockResolvedValue({ data: { customers: [] } });

    renderWithClient(<CustomerList />);

    const searchInput = screen.getByPlaceholderText(/search customers/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(customerService.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'John', page: 1 })
      );
    });
  });
});
```

## Deployment Requirements

### Environment Configuration

#### Additional .env Variables
```env
# Customer Management
CUSTOMER_CODE_PREFIX=CUST
SUBSCRIPTION_CODE_PREFIX=SUB
DOCUMENT_STORAGE_DISK=public
DOCUMENT_MAX_SIZE=10240

# Geocoding
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
OPENSTREETMAP_NOMINATIM_URL=https://nominatim.openstreetmap.org

# File Upload
MAX_UPLOAD_SIZE=10240
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf

# Email Configuration
MAIL_FROM_ADDRESS=noreply@ispmanagement.com
MAIL_FROM_NAME="ISP Management System"

# SMS Configuration
SMS_PROVIDER=twilio
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_FROM=your_twilio_number
```

### File Storage Configuration

#### Filesystem Configuration
```php
// config/filesystems.php
'disks' => [
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],
    
    'customer_documents' => [
        'driver' => 'local',
        'root' => storage_path('app/customer-documents'),
        'url' => env('APP_URL').'/customer-documents',
        'visibility' => 'private',
    ],
    
    's3' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'url' => env('AWS_URL'),
        'endpoint' => env('AWS_ENDPOINT'),
    ],
],
```

### Queue Configuration

#### Customer Jobs
```php
<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessCustomerRegistration implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(
        private array $customerData
    ) {}

    public function handle(CustomerService $customerService): void
    {
        try {
            $customer = $customerService->createCustomer($this->customerData);
            
            // Send welcome email
            // Send SMS notification
            // Create initial ticket if needed
            
        } catch (\Exception $e) {
            Log::error("Failed to process customer registration: {$e->getMessage()}");
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Customer registration job failed: {$exception->getMessage()}");
    }
}
```

## Success Criteria

### Functional Requirements
- ✅ Complete customer lifecycle management
- ✅ Service plan configuration and management
- ✅ Subscription management with MikroTik integration
- ✅ Customer portal with self-service capabilities
- ✅ Network mapping and visualization
- ✅ Document management system
- ✅ Support ticket system

### Performance Requirements
- ✅ Customer search < 500ms for 10,000+ customers
- ✅ Map rendering < 2 seconds for 1,000+ markers
- ✅ Document upload < 30 seconds for 10MB files
- ✅ Customer portal load time < 3 seconds

### Usability Requirements
- ✅ Intuitive customer management interface
- ✅ Interactive network mapping
- ✅ Mobile-responsive customer portal
- ✅ Comprehensive search and filtering
- ✅ Bulk operations support

### Security Requirements
- ✅ Customer data encryption
- ✅ Secure document storage
- ✅ Access control for customer information
- ✅ Audit trail for all customer operations

## Next Steps

Setelah Fase 3 selesai, sistem akan memiliki:
1. Complete customer management system
2. Service plan and subscription management
3. Customer self-service portal
4. Network mapping and visualization
5. Document and ticket management
6. Foundation untuk advanced monitoring di Fase 4

Fase 4 akan membangun di atas customer data ini dengan menambahkan live monitoring capabilities yang lebih advanced dan real-time analytics.