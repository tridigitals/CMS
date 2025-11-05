# API Reference

## Overview

API Reference untuk ISP Management System dengan detail endpoint, request/response format, authentication, dan error handling.

## Base URL

- **Production**: `https://api.your-domain.com`
- **Staging**: `https://staging-api.your-domain.com`
- **Development**: `http://localhost:8000`

## Authentication

### Bearer Token Authentication
```http
Authorization: Bearer {token}
```

### API Key Authentication
```http
X-API-Key: {api_key}
```

## Response Format

### Success Response
```json
{
    "success": true,
    "data": {
        // Response data
    },
    "message": "Operation successful",
    "timestamp": "2024-01-01T12:00:00Z"
}
```

### Error Response
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Validation failed",
        "details": {
            "field": "email",
            "message": "The email field is required."
        }
    },
    "timestamp": "2024-01-01T12:00:00Z"
}
```

### Paginated Response
```json
{
    "success": true,
    "data": [
        // Array of items
    ],
    "links": {
        "first": "https://api.your-domain.com/customers?page=1",
        "last": "https://api.your-domain.com/customers?page=10",
        "prev": null,
        "next": "https://api.your-domain.com/customers?page=2"
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 10,
        "per_page": 15,
        "to": 15,
        "total": 150
    },
    "timestamp": "2024-01-01T12:00:00Z"
}
```

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content returned |
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

- **Standard**: 1000 requests per hour
- **Premium**: 5000 requests per hour
- **Enterprise**: Unlimited

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
    "email": "admin@example.com",
    "password": "password",
    "remember_me": false
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com",
            "role": "admin",
            "permissions": ["customers.read", "customers.write", "mikrotik.read"]
        },
        "token": "1|abcdef123456789",
        "expires_at": "2024-01-02T12:00:00Z"
    }
}
```

#### Logout
```http
POST /api/auth/logout
```

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "token": "2|ghijk123456789",
        "expires_at": "2024-01-02T12:00:00Z"
    }
}
```

### Customers

#### List Customers
```http
GET /api/customers
```

**Query Parameters:**
- `page` (integer, optional): Page number
- `per_page` (integer, optional): Items per page (max 100)
- `search` (string, optional): Search term
- `status` (string, optional): Filter by status (active, inactive, suspended)
- `sort` (string, optional): Sort field (name, email, created_at)
- `order` (string, optional): Sort order (asc, desc)
- `include` (string, optional): Include relationships (subscriptions, payments)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+628123456789",
            "address": "Jakarta, Indonesia",
            "status": "active",
            "created_at": "2024-01-01T12:00:00Z",
            "updated_at": "2024-01-01T12:00:00Z"
        }
    ],
    "links": { ... },
    "meta": { ... }
}
```

#### Create Customer
```http
POST /api/customers
```

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+628123456789",
    "address": "Jakarta, Indonesia",
    "coordinates": {
        "latitude": -6.2088,
        "longitude": 106.8456
    },
    "notes": "Regular customer"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+628123456789",
        "address": "Jakarta, Indonesia",
        "coordinates": {
            "latitude": -6.2088,
            "longitude": 106.8456
        },
        "status": "active",
        "notes": "Regular customer",
        "created_at": "2024-01-01T12:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z"
    },
    "message": "Customer created successfully"
}
```

#### Get Customer
```http
GET /api/customers/{id}
```

**Path Parameters:**
- `id` (integer): Customer ID

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+628123456789",
        "address": "Jakarta, Indonesia",
        "coordinates": {
            "latitude": -6.2088,
            "longitude": 106.8456
        },
        "status": "active",
        "notes": "Regular customer",
        "created_at": "2024-01-01T12:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z",
        "subscriptions": [
            {
                "id": 1,
                "service_plan": {
                    "id": 1,
                    "name": "Home Basic",
                    "price": 150000,
                    "speed": "10Mbps"
                },
                "status": "active",
                "start_date": "2024-01-01",
                "end_date": "2024-02-01"
            }
        ]
    }
}
```

#### Update Customer
```http
PUT /api/customers/{id}
```

**Path Parameters:**
- `id` (integer): Customer ID

**Request Body:**
```json
{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+628987654321",
    "address": "Bandung, Indonesia",
    "status": "active",
    "notes": "Updated notes"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+628987654321",
        "address": "Bandung, Indonesia",
        "status": "active",
        "notes": "Updated notes",
        "updated_at": "2024-01-01T12:30:00Z"
    },
    "message": "Customer updated successfully"
}
```

#### Delete Customer
```http
DELETE /api/customers/{id}
```

**Path Parameters:**
- `id` (integer): Customer ID

**Response:**
```json
{
    "success": true,
    "message": "Customer deleted successfully"
}
```

### MikroTik Devices

#### List Devices
```http
GET /api/mikrotik-devices
```

**Query Parameters:**
- `page` (integer, optional): Page number
- `per_page` (integer, optional): Items per page
- `status` (string, optional): Filter by status (online, offline, error)
- `search` (string, optional): Search by name or IP

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Main Router",
            "ip_address": "192.168.1.1",
            "port": 8728,
            "api_version": "6.47.9",
            "status": "online",
            "last_seen": "2024-01-01T12:00:00Z",
            "system_info": {
                "board_name": "RB4011iGS+",
                "cpu": "QCA9563",
                "memory_total": 1073741824,
                "memory_free": 536870912,
                "uptime": "5d12h30m"
            }
        }
    ]
}
```

#### Create Device
```http
POST /api/mikrotik-devices
```

**Request Body:**
```json
{
    "name": "Branch Router",
    "ip_address": "192.168.2.1",
    "port": 8728,
    "username": "admin",
    "password": "password",
    "api_version": "6.47.9",
    "description": "Branch office router"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 2,
        "name": "Branch Router",
        "ip_address": "192.168.2.1",
        "port": 8728,
        "username": "admin",
        "api_version": "6.47.9",
        "status": "offline",
        "description": "Branch office router",
        "created_at": "2024-01-01T12:00:00Z"
    },
    "message": "Device created successfully"
}
```

#### Test Connection
```http
POST /api/mikrotik-devices/{id}/test-connection
```

**Path Parameters:**
- `id` (integer): Device ID

**Response:**
```json
{
    "success": true,
    "data": {
        "connected": true,
        "response_time": 45,
        "api_version": "6.47.9",
        "system_info": {
            "board_name": "RB4011iGS+",
            "cpu": "QCA9563",
            "memory_total": 1073741824,
            "memory_free": 536870912,
            "uptime": "5d12h30m"
        }
    },
    "message": "Connection successful"
}
```

#### Get Interfaces
```http
GET /api/mikrotik-devices/{id}/interfaces
```

**Path Parameters:**
- `id` (integer): Device ID

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "*1",
            "name": "ether1",
            "type": "ether",
            "running": true,
            "enabled": true,
            "speed": "1Gbps",
            "mac_address": "00:11:22:33:44:55",
            "rx_bytes": 1073741824,
            "tx_bytes": 536870912,
            "rx_packets": 1000000,
            "tx_packets": 500000
        }
    ]
}
```

#### Get PPPoE Users
```http
GET /api/mikrotik-devices/{id}/pppoe-users
```

**Path Parameters:**
- `id` (integer): Device ID

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "*1",
            "name": "customer1",
            "service": "pppoe",
            "caller_id": "00:11:22:33:44:55",
            "address": "192.168.1.100",
            "uptime": "2d5h30m",
            "bytes_in": 1073741824,
            "bytes_out": 536870912,
            "limit_bytes_in": 10737418240,
            "limit_bytes_out": 10737418240
        }
    ]
}
```

#### Create PPPoE User
```http
POST /api/mikrotik-devices/{id}/pppoe-users
```

**Path Parameters:**
- `id` (integer): Device ID

**Request Body:**
```json
{
    "name": "newcustomer",
    "password": "password123",
    "service": "pppoe",
    "profile": "default",
    "limit_bytes_in": 10737418240,
    "limit_bytes_out": 10737418240,
    "comment": "New customer"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": "*2",
        "name": "newcustomer",
        "service": "pppoe",
        "profile": "default",
        "limit_bytes_in": 10737418240,
        "limit_bytes_out": 10737418240,
        "comment": "New customer"
    },
    "message": "PPPoE user created successfully"
}
```

### Service Plans

#### List Service Plans
```http
GET /api/service-plans
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Home Basic",
            "description": "Basic home internet package",
            "price": 150000,
            "speed": "10Mbps",
            "data_limit": 10737418240,
            "is_active": true,
            "created_at": "2024-01-01T12:00:00Z"
        }
    ]
}
```

#### Create Service Plan
```http
POST /api/service-plans
```

**Request Body:**
```json
{
    "name": "Home Premium",
    "description": "Premium home internet package",
    "price": 300000,
    "speed": "50Mbps",
    "data_limit": 107374182400,
    "is_active": true
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 2,
        "name": "Home Premium",
        "description": "Premium home internet package",
        "price": 300000,
        "speed": "50Mbps",
        "data_limit": 107374182400,
        "is_active": true,
        "created_at": "2024-01-01T12:00:00Z"
    },
    "message": "Service plan created successfully"
}
```

### Subscriptions

#### List Subscriptions
```http
GET /api/subscriptions
```

**Query Parameters:**
- `customer_id` (integer, optional): Filter by customer
- `service_plan_id` (integer, optional): Filter by service plan
- `status` (string, optional): Filter by status
- `start_date_from` (date, optional): Filter by start date
- `start_date_to` (date, optional): Filter by start date

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "customer": {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com"
            },
            "service_plan": {
                "id": 1,
                "name": "Home Basic",
                "price": 150000,
                "speed": "10Mbps"
            },
            "status": "active",
            "start_date": "2024-01-01",
            "end_date": "2024-02-01",
            "auto_renew": true,
            "created_at": "2024-01-01T12:00:00Z"
        }
    ]
}
```

#### Create Subscription
```http
POST /api/subscriptions
```

**Request Body:**
```json
{
    "customer_id": 1,
    "service_plan_id": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-02-01",
    "auto_renew": true,
    "notes": "New subscription"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 2,
        "customer_id": 1,
        "service_plan_id": 1,
        "status": "active",
        "start_date": "2024-01-01",
        "end_date": "2024-02-01",
        "auto_renew": true,
        "notes": "New subscription",
        "created_at": "2024-01-01T12:00:00Z"
    },
    "message": "Subscription created successfully"
}
```

### Payments

#### List Payments
```http
GET /api/payments
```

**Query Parameters:**
- `customer_id` (integer, optional): Filter by customer
- `status` (string, optional): Filter by status
- `payment_method` (string, optional): Filter by payment method
- `date_from` (date, optional): Filter by date
- `date_to` (date, optional): Filter by date

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "customer": {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com"
            },
            "invoice": {
                "id": 1,
                "number": "INV-2024-001",
                "amount": 150000
            },
            "amount": 150000,
            "payment_method": "midtrans",
            "status": "paid",
            "transaction_id": "TX123456789",
            "paid_at": "2024-01-01T12:00:00Z",
            "created_at": "2024-01-01T11:30:00Z"
        }
    ]
}
```

#### Create Payment
```http
POST /api/payments
```

**Request Body:**
```json
{
    "customer_id": 1,
    "invoice_id": 1,
    "amount": 150000,
    "payment_method": "midtrans",
    "payment_details": {
        "bank": "bca",
        "va_number": "1234567890"
    }
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 2,
        "customer_id": 1,
        "invoice_id": 1,
        "amount": 150000,
        "payment_method": "midtrans",
        "status": "pending",
        "transaction_id": "TX987654321",
        "payment_details": {
            "bank": "bca",
            "va_number": "1234567890",
            "expiry_time": "2024-01-01T18:00:00Z"
        },
        "created_at": "2024-01-01T12:00:00Z"
    },
    "message": "Payment created successfully"
}
```

#### Process Payment Webhook
```http
POST /api/payments/webhook/{provider}
```

**Path Parameters:**
- `provider` (string): Payment provider (midtrans, tripay)

**Headers:**
```http
Content-Type: application/json
X-Webhook-Signature: {signature}
```

**Request Body (Midtrans):**
```json
{
    "transaction_time": "2024-01-01 12:00:00",
    "transaction_status": "settlement",
    "transaction_id": "TX123456789",
    "status_message": "Success",
    "status_code": "200",
    "signature_key": "abcdef123456789",
    "payment_type": "bank_transfer",
    "order_id": "INV-2024-001",
    "merchant_id": "12345",
    "gross_amount": "150000.00"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Webhook processed successfully"
}
```

### Monitoring

#### Get Device Status
```http
GET /api/monitoring/devices/{id}/status
```

**Path Parameters:**
- `id` (integer): Device ID

**Response:**
```json
{
    "success": true,
    "data": {
        "device_id": 1,
        "status": "online",
        "cpu_usage": 25.5,
        "memory_usage": 45.2,
        "disk_usage": 30.1,
        "uptime": "5d12h30m",
        "interfaces": [
            {
                "name": "ether1",
                "status": "up",
                "rx_bytes": 1073741824,
                "tx_bytes": 536870912,
                "rx_packets": 1000000,
                "tx_packets": 500000
            }
        ],
        "last_updated": "2024-01-01T12:00:00Z"
    }
}
```

#### Get Customer Usage
```http
GET /api/monitoring/customers/{id}/usage
```

**Path Parameters:**
- `id` (integer): Customer ID

**Query Parameters:**
- `period` (string, optional): Period (daily, weekly, monthly)
- `start_date` (date, optional): Start date
- `end_date` (date, optional): End date

**Response:**
```json
{
    "success": true,
    "data": {
        "customer_id": 1,
        "period": "daily",
        "usage_data": [
            {
                "date": "2024-01-01",
                "bytes_in": 1073741824,
                "bytes_out": 536870912,
                "total_bytes": 1610612736,
                "online_time": 7200
            }
        ],
        "total_usage": {
            "bytes_in": 10737418240,
            "bytes_out": 5368709120,
            "total_bytes": 16106127360,
            "online_time": 86400
        }
    }
}
```

#### Get Network Statistics
```http
GET /api/monitoring/statistics
```

**Query Parameters:**
- `period` (string, optional): Period (hourly, daily, weekly, monthly)
- `start_date` (date, optional): Start date
- `end_date` (date, optional): End date

**Response:**
```json
{
    "success": true,
    "data": {
        "period": "daily",
        "statistics": [
            {
                "date": "2024-01-01",
                "total_customers": 150,
                "active_customers": 145,
                "total_bandwidth": 107374182400,
                "used_bandwidth": 53687091200,
                "revenue": 22500000
            }
        ],
        "summary": {
            "total_customers": 150,
            "active_customers": 145,
            "total_bandwidth": 107374182400,
            "used_bandwidth": 53687091200,
            "revenue": 22500000
        }
    }
}
```

### Reports

#### Generate Customer Report
```http
GET /api/reports/customers
```

**Query Parameters:**
- `format` (string, optional): Format (json, csv, pdf)
- `start_date` (date, optional): Start date
- `end_date` (date, optional): End date
- `status` (string, optional): Filter by status

**Response:**
```json
{
    "success": true,
    "data": {
        "report_id": "RPT-2024-001",
        "format": "json",
        "generated_at": "2024-01-01T12:00:00Z",
        "period": {
            "start_date": "2024-01-01",
            "end_date": "2024-01-31"
        },
        "summary": {
            "total_customers": 150,
            "new_customers": 15,
            "active_customers": 145,
            "inactive_customers": 5
        },
        "customers": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "status": "active",
                "subscriptions_count": 2,
                "total_revenue": 300000
            }
        ]
    }
}
```

#### Generate Financial Report
```http
GET /api/reports/financial
```

**Query Parameters:**
- `format` (string, optional): Format (json, csv, pdf)
- `start_date` (date, optional): Start date
- `end_date` (date, optional): End date
- `payment_method` (string, optional): Filter by payment method

**Response:**
```json
{
    "success": true,
    "data": {
        "report_id": "RPT-2024-002",
        "format": "json",
        "generated_at": "2024-01-01T12:00:00Z",
        "period": {
            "start_date": "2024-01-01",
            "end_date": "2024-01-31"
        },
        "summary": {
            "total_revenue": 22500000,
            "paid_amount": 21000000,
            "pending_amount": 1500000,
            "total_transactions": 150,
            "paid_transactions": 140,
            "pending_transactions": 10
        },
        "payment_methods": [
            {
                "method": "midtrans",
                "amount": 18000000,
                "transactions": 120
            },
            {
                "method": "tripay",
                "amount": 3000000,
                "transactions": 20
            }
        ]
    }
}
```

### Geniacs Integration

#### Sync Customer to Geniacs
```http
POST /api/geniacs/customers/{id}/sync
```

**Path Parameters:**
- `id` (integer): Customer ID

**Response:**
```json
{
    "success": true,
    "data": {
        "customer_id": 1,
        "geniacs_id": "CUST-123456",
        "sync_status": "success",
        "synced_at": "2024-01-01T12:00:00Z",
        "sync_data": {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+628123456789"
        }
    },
    "message": "Customer synced to Geniacs successfully"
}
```

#### Process Geniacs Webhook
```http
POST /api/geniacs/webhook
```

**Headers:**
```http
Content-Type: application/json
X-Geniacs-Signature: {signature}
```

**Request Body:**
```json
{
    "event": "customer.updated",
    "data": {
        "id": "CUST-123456",
        "name": "John Doe",
        "email": "john@example.com",
        "updated_at": "2024-01-01T12:00:00Z"
    },
    "timestamp": "2024-01-01T12:00:00Z"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Geniacs webhook processed successfully"
}
```

## Error Codes

| Error Code | Description |
|------------|-------------|
| VALIDATION_ERROR | Request validation failed |
| AUTHENTICATION_FAILED | Invalid authentication credentials |
| AUTHORIZATION_FAILED | Insufficient permissions |
| RESOURCE_NOT_FOUND | Requested resource not found |
| DUPLICATE_RESOURCE | Resource already exists |
| RATE_LIMIT_EXCEEDED | API rate limit exceeded |
| EXTERNAL_SERVICE_ERROR | External service error |
| DATABASE_ERROR | Database operation failed |
| INTERNAL_ERROR | Internal server error |

## SDK Examples

### PHP (Guzzle)
```php
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

$client = new Client([
    'base_uri' => 'https://api.your-domain.com',
    'headers' => [
        'Authorization' => 'Bearer ' . $apiToken,
        'Content-Type' => 'application/json',
    ],
]);

try {
    $response = $client->get('/api/customers');
    $data = json_decode($response->getBody(), true);
    
    foreach ($data['data'] as $customer) {
        echo $customer['name'] . "\n";
    }
} catch (RequestException $e) {
    echo 'Error: ' . $e->getMessage();
}
```

### JavaScript (Axios)
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.your-domain.com',
    headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
    },
});

// Get customers
try {
    const response = await api.get('/api/customers');
    const customers = response.data.data;
    
    customers.forEach(customer => {
        console.log(customer.name);
    });
} catch (error) {
    console.error('Error:', error.response.data);
}

// Create customer
try {
    const response = await api.post('/api/customers', {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+628123456789',
    });
    
    console.log('Customer created:', response.data.data);
} catch (error) {
    console.error('Error:', error.response.data);
}
```

### Python (Requests)
```python
import requests
import json

api_url = 'https://api.your-domain.com'
headers = {
    'Authorization': f'Bearer {api_token}',
    'Content-Type': 'application/json',
}

# Get customers
try:
    response = requests.get(f'{api_url}/api/customers', headers=headers)
    data = response.json()
    
    for customer in data['data']:
        print(customer['name'])
except requests.exceptions.RequestException as e:
    print(f'Error: {e}')

# Create customer
try:
    payload = {
        'name': 'John Doe',
        'email': 'john@example.com',
        'phone': '+628123456789',
    }
    
    response = requests.post(
        f'{api_url}/api/customers',
        headers=headers,
        json=payload
    )
    
    data = response.json()
    print('Customer created:', data['data'])
except requests.exceptions.RequestException as e:
    print(f'Error: {e}')
```

## Testing

### Postman Collection
```json
{
    "info": {
        "name": "ISP Management API",
        "description": "API collection for ISP Management System"
    },
    "auth": {
        "type": "bearer",
        "bearer": [
            {
                "key": "token",
                "value": "{{api_token}}",
                "type": "string"
            }
        ]
    },
    "variable": [
        {
            "key": "api_token",
            "value": "your_api_token_here"
        },
        {
            "key": "base_url",
            "value": "https://api.your-domain.com"
        }
    ],
    "item": [
        {
            "name": "Authentication",
            "item": [
                {
                    "name": "Login",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"email\": \"admin@example.com\",\n    \"password\": \"password\"\n}"
                        },
                        "url": {
                            "raw": "{{base_url}}/api/auth/login",
                            "host": ["{{base_url}}"],
                            "path": ["api", "auth", "login"]
                        }
                    }
                }
            ]
        }
    ]
}
```

This API reference provides comprehensive documentation for all endpoints in the ISP Management System, including request/response formats, authentication, error handling, and SDK examples.