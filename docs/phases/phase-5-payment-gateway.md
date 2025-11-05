# Phase 5: Payment Gateway Integration

## Overview

Fase 5 fokus pada integrasi payment gateway (Midtrans & Tripay) dengan sistem billing otomatis, invoice management, dan financial reporting. Fase ini mengintegrasikan customer data dari Fase 3 dengan monitoring capabilities dari Fase 4 untuk menciptakan sistem billing yang komprehensif.

## Duration: 6 Weeks

### Week 1-3: Payment Gateway Integration
### Week 4-5: Billing System & Automation
### Week 6: Financial Reporting & Analytics

## Technical Requirements

### Dependencies
```json
{
  "backend": {
    "laravel/framework": "^10.0",
    "laravel/cashier": "^14.0",
    "midtrans/midtrans-php": "^1.5",
    "guzzlehttp/guzzle": "^7.5",
    "maatwebsite/excel": "^3.1",
    "barryvdh/laravel-dompdf": "^2.0",
    "spatie/laravel-activitylog": "^4.7",
    "spatie/laravel-medialibrary": "^10.0"
  },
  "frontend": {
    "react": "^18.2",
    "react-router-dom": "^6.8",
    "@tanstack/react-query": "^4.24",
    "axios": "^1.3",
    "react-hook-form": "^7.43",
    "react-table": "^7.8",
    "recharts": "^2.5",
    "date-fns": "^2.29",
    "react-credit-cards": "^0.8",
    "react-number-format": "^5.2"
  }
}
```

### External Services
- **Midtrans**: Payment gateway untuk credit cards, e-wallets, bank transfers
- **Tripay**: Alternative payment gateway dengan channel lokal
- **Email Service**: Invoice delivery dan payment reminders
- **SMS Service**: Payment notifications dan reminders
- **PDF Generation**: Invoice generation dan financial reports

## Database Schema

### Payment Tables

#### invoices
```sql
CREATE TABLE invoices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    subscription_id BIGINT NULL,
    type ENUM('subscription', 'setup_fee', 'installation', 'upgrade', 'penalty', 'other') DEFAULT 'subscription',
    description TEXT NULL,
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded') DEFAULT 'draft',
    payment_method VARCHAR(50) NULL,
    payment_gateway VARCHAR(50) NULL,
    paid_at TIMESTAMP NULL,
    paid_amount DECIMAL(15,2) NULL,
    late_fee_amount DECIMAL(15,2) DEFAULT 0,
    reminder_sent_at TIMESTAMP NULL,
    last_reminder_at TIMESTAMP NULL,
    notes TEXT NULL,
    metadata JSON NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES customer_subscriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_invoices_number (invoice_number),
    INDEX idx_invoices_customer (customer_id),
    INDEX idx_invoices_subscription (subscription_id),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_due_date (due_date),
    INDEX idx_invoices_type (type),
    INDEX idx_invoices_paid_at (paid_at)
);
```

#### payments
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invoice_id BIGINT NOT NULL,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    payment_gateway ENUM('midtrans', 'tripay', 'manual', 'bank_transfer') NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    payment_type ENUM('full_payment', 'partial_payment', 'installment') DEFAULT 'full_payment',
    amount DECIMAL(15,2) NOT NULL,
    fee_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled', 'expired', 'refunded', 'partial_refund') DEFAULT 'pending',
    reference_number VARCHAR(255) NULL,
    va_number VARCHAR(255) NULL,
    qr_code TEXT NULL,
    payment_url VARCHAR(500) NULL,
    expiry_time TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    refund_amount DECIMAL(15,2) NULL,
    refund_reason TEXT NULL,
    gateway_response JSON NULL,
    callback_data JSON NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    
    INDEX idx_payments_invoice (invoice_id),
    INDEX idx_payments_transaction (transaction_id),
    INDEX idx_payments_gateway (payment_gateway),
    INDEX idx_payments_status (status),
    INDEX idx_payments_paid_at (paid_at),
    INDEX idx_payments_expiry (expiry_time)
);
```

#### payment_gateways
```sql
CREATE TABLE payment_gateways (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('midtrans', 'tripay', 'manual') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    config JSON NOT NULL,
    supported_methods JSON NULL,
    fees JSON NULL,
    limits JSON NULL,
    description TEXT NULL,
    logo_url VARCHAR(255) NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_gateways_code (code),
    INDEX idx_gateways_active (is_active),
    INDEX idx_gateways_type (type),
    INDEX idx_gateways_sort (sort_order)
);
```

#### billing_cycles
```sql
CREATE TABLE billing_cycles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom') NOT NULL,
    interval_value INT DEFAULT 1,
    billing_day INT NULL,
    next_run_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cycles_code (code),
    INDEX idx_cycles_active (is_active),
    INDEX idx_cycles_next_run (next_run_date)
);
```

#### invoice_items
```sql
CREATE TABLE invoice_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invoice_id BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    item_type ENUM('subscription', 'setup_fee', 'installation', 'upgrade', 'penalty', 'discount', 'tax') NOT NULL,
    reference_id BIGINT NULL,
    reference_type VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    
    INDEX idx_items_invoice (invoice_id),
    INDEX idx_items_type (item_type),
    INDEX idx_items_reference (reference_type, reference_id)
);
```

#### payment_notifications
```sql
CREATE TABLE payment_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payment_id BIGINT NOT NULL,
    notification_type ENUM('payment_success', 'payment_failed', 'payment_expired', 'refund_success', 'refund_failed') NOT NULL,
    channel ENUM('email', 'sms', 'whatsapp', 'push') NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    status ENUM('pending', 'sent', 'failed', 'retrying') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    response_data JSON NULL,
    error_message TEXT NULL,
    retry_count INT DEFAULT 0,
    next_retry_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    
    INDEX idx_notifications_payment (payment_id),
    INDEX idx_notifications_type (notification_type),
    INDEX idx_notifications_status (status),
    INDEX idx_notifications_channel (channel),
    INDEX idx_notifications_retry (next_retry_at)
);
```

#### financial_reports
```sql
CREATE TABLE financial_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    report_type ENUM('revenue', 'payment_summary', 'aging_report', 'tax_report', 'custom') NOT NULL,
    description TEXT NULL,
    parameters JSON NOT NULL,
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    file_path VARCHAR(255) NULL,
    file_size BIGINT NULL,
    generated_by BIGINT NULL,
    generated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_reports_type (report_type),
    INDEX idx_reports_status (status),
    INDEX idx_reports_generated (generated_at),
    INDEX idx_reports_generator (generated_by)
);
```

## API Design

### Invoice Management Endpoints

#### GET /api/invoices
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: page, limit, customer_id, status, from, to, type

// Response
{
    "success": true,
    "data": {
        "invoices": [
            {
                "id": 1,
                "invoice_number": "INV-2024-001",
                "customer": {
                    "id": 1,
                    "customer_code": "CUST-001",
                    "name": "John Doe",
                    "email": "john@example.com"
                },
                "subscription": {
                    "id": 1,
                    "subscription_code": "SUB-001",
                    "service_plan": {
                        "name": "Home 10Mbps",
                        "price": 500000
                    }
                },
                "type": "subscription",
                "description": "Monthly subscription fee - January 2024",
                "amount": 500000,
                "tax_amount": 50000,
                "discount_amount": 0,
                "total_amount": 550000,
                "due_date": "2024-01-31",
                "status": "sent",
                "payment_method": null,
                "payment_gateway": null,
                "paid_at": null,
                "late_fee_amount": 0,
                "days_overdue": 0,
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
            "total_invoices": 100,
            "total_amount": 55000000,
            "paid_amount": 45000000,
            "unpaid_amount": 10000000,
            "overdue_amount": 2500000
        }
    }
}
```

#### POST /api/invoices
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "customer_id": 1,
    "subscription_id": 1,
    "type": "subscription",
    "description": "Monthly subscription fee - February 2024",
    "amount": 500000,
    "tax_amount": 50000,
    "discount_amount": 0,
    "due_date": "2024-02-29",
    "items": [
        {
            "description": "Home 10Mbps - February 2024",
            "quantity": 1,
            "unit_price": 500000,
            "tax_amount": 50000,
            "total_amount": 550000,
            "item_type": "subscription",
            "reference_id": 1,
            "reference_type": "customer_subscription"
        }
    ],
    "notes": "Monthly billing"
}

// Response
{
    "success": true,
    "message": "Invoice created successfully",
    "data": {
        "invoice": {
            "id": 2,
            "invoice_number": "INV-2024-002",
            "customer_id": 1,
            "subscription_id": 1,
            "total_amount": 550000,
            "due_date": "2024-02-29",
            "status": "draft"
        }
    }
}
```

#### POST /api/invoices/{id}/send
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "send_email": true,
    "send_sms": false,
    "email_recipients": ["customer@example.com", "billing@example.com"]
}

// Response
{
    "success": true,
    "message": "Invoice sent successfully",
    "data": {
        "invoice": {
            "id": 1,
            "status": "sent",
            "sent_at": "2024-01-01T10:05:00Z"
        },
        "notifications": [
            {
                "channel": "email",
                "recipient": "customer@example.com",
                "status": "sent"
            }
        ]
    }
}
```

#### GET /api/invoices/{id}/pdf
```php
// Headers: Authorization: Bearer {token}

// Response: PDF file download
Content-Type: application/pdf
Content-Disposition: attachment; filename="INV-2024-001.pdf"
Content-Length: 2048576

[PDF file content]
```

### Payment Processing Endpoints

#### POST /api/payments/create
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "invoice_id": 1,
    "payment_gateway": "midtrans",
    "payment_method": "credit_card",
    "amount": 550000,
    "customer_details": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+628123456789"
    },
    "billing_address": {
        "address": "Jl. Example No. 123",
        "city": "Jakarta",
        "postal_code": "12345",
        "country_code": "IDN"
    },
    "callback_url": "https://example.com/payment/callback",
    "return_url": "https://example.com/payment/return",
    "expiry_hours": 24
}

// Response
{
    "success": true,
    "message": "Payment created successfully",
    "data": {
        "payment": {
            "id": 1,
            "transaction_id": "MIDTRANS-123456789",
            "payment_gateway": "midtrans",
            "payment_method": "credit_card",
            "amount": 550000,
            "status": "pending",
            "payment_url": "https://api.midtrans.com/v2/vtweb/123456789-1234-5678-9012-123456789012",
            "expiry_time": "2024-01-02T10:00:00Z"
        }
    }
}
```

#### POST /api/payments/{transactionId}/callback
```php
// Headers: No authentication required (webhook)
// Request (Midtrans format)
{
    "status_code": "200",
    "status_message": "success",
    "transaction_id": "MIDTRANS-123456789",
    "order_id": "INV-2024-001",
    "gross_amount": "550000.00",
    "payment_type": "credit_card",
    "transaction_time": "2024-01-01 10:30:00",
    "transaction_status": "capture",
    "fraud_status": "accept",
    "approval_code": "123456"
}

// Response
{
    "success": true,
    "message": "Callback processed successfully"
}
```

#### GET /api/payments/{transactionId}/status
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "data": {
        "payment": {
            "id": 1,
            "transaction_id": "MIDTRANS-123456789",
            "invoice_id": 1,
            "payment_gateway": "midtrans",
            "payment_method": "credit_card",
            "amount": 550000,
            "fee_amount": 8250,
            "net_amount": 541750,
            "status": "success",
            "paid_at": "2024-01-01T10:30:00Z",
            "gateway_response": {
                "status_code": "200",
                "status_message": "success",
                "payment_type": "credit_card",
                "approval_code": "123456"
            }
        }
    }
}
```

#### POST /api/payments/{id}/refund
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "refund_amount": 550000,
    "refund_reason": "Customer requested refund due to service cancellation"
}

// Response
{
    "success": true,
    "message": "Refund processed successfully",
    "data": {
        "payment": {
            "id": 1,
            "status": "refunded",
            "refund_amount": 550000,
            "refund_reason": "Customer requested refund due to service cancellation",
            "refunded_at": "2024-01-05T14:00:00Z"
        }
    }
}
```

### Billing Automation Endpoints

#### GET /api/billing/cycles
```php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "data": {
        "cycles": [
            {
                "id": 1,
                "name": "Monthly Billing",
                "code": "monthly",
                "frequency": "monthly",
                "interval_value": 1,
                "billing_day": 1,
                "next_run_date": "2024-02-01",
                "is_active": true,
                "description": "Generate monthly invoices for all active subscriptions"
            }
        ]
    }
}
```

#### POST /api/billing/generate
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "billing_cycle_id": 1,
    "billing_date": "2024-02-01",
    "dry_run": false,
    "customer_ids": [1, 2, 3], // Optional: specific customers
    "send_invoices": true
}

// Response
{
    "success": true,
    "message": "Billing generation completed",
    "data": {
        "summary": {
            "total_customers": 150,
            "invoices_generated": 145,
            "invoices_failed": 5,
            "total_amount": 79750000,
            "processing_time": "2m 15s"
        },
        "invoices": [
            {
                "id": 100,
                "invoice_number": "INV-2024-100",
                "customer_id": 1,
                "total_amount": 550000,
                "status": "sent"
            }
        ],
        "errors": [
            {
                "customer_id": 5,
                "error": "No active subscription found"
            }
        ]
    }
}
```

#### POST /api/billing/reminders
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "reminder_type": "due_soon", // due_soon, overdue, payment_failed
    "days_before": 3,
    "send_email": true,
    "send_sms": true
}

// Response
{
    "success": true,
    "message": "Payment reminders sent successfully",
    "data": {
        "summary": {
            "total_reminders": 25,
            "email_sent": 25,
            "sms_sent": 20,
            "failed": 0
        }
    }
}
```

### Financial Reporting Endpoints

#### GET /api/financial/revenue
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: from, to, group_by, customer_id

// Response
{
    "success": true,
    "data": {
        "period": {
            "from": "2024-01-01",
            "to": "2024-01-31"
        },
        "revenue": {
            "total_revenue": 85000000,
            "paid_amount": 75000000,
            "pending_amount": 8000000,
            "overdue_amount": 2000000,
            "refunded_amount": 500000
        },
        "breakdown": {
            "by_month": [
                {
                    "month": "2024-01",
                    "revenue": 85000000,
                    "paid_amount": 75000000,
                    "pending_amount": 8000000,
                    "overdue_amount": 2000000
                }
            ],
            "by_service_plan": [
                {
                    "service_plan_id": 1,
                    "service_plan_name": "Home 10Mbps",
                    "revenue": 45000000,
                    "customer_count": 90
                }
            ],
            "by_payment_method": [
                {
                    "payment_method": "credit_card",
                    "amount": 40000000,
                    "transaction_count": 80
                },
                {
                    "payment_method": "bank_transfer",
                    "amount": 35000000,
                    "transaction_count": 70
                }
            ]
        },
        "growth": {
            "revenue_growth": 12.5,
            "customer_growth": 8.3
        }
    }
}
```

#### GET /api/financial/aging-report
```php
// Headers: Authorization: Bearer {token}
// Query Parameters: as_of_date

// Response
{
    "success": true,
    "data": {
        "as_of_date": "2024-01-31",
        "summary": {
            "total_outstanding": 15000000,
            "current": 8000000,
            "days_1_30": 4000000,
            "days_31_60": 2000000,
            "days_61_90": 700000,
            "days_over_90": 300000
        },
        "details": [
            {
                "customer_id": 1,
                "customer_name": "John Doe",
                "total_outstanding": 1100000,
                "current": 550000,
                "days_1_30": 550000,
                "days_31_60": 0,
                "days_61_90": 0,
                "days_over_90": 0,
                "oldest_invoice_date": "2024-01-15",
                "contact_info": {
                    "email": "john@example.com",
                    "phone": "+628123456789"
                }
            }
        ]
    }
}
```

#### POST /api/financial/reports/generate
```php
// Headers: Authorization: Bearer {token}
// Request
{
    "report_type": "revenue",
    "name": "Monthly Revenue Report - January 2024",
    "parameters": {
        "from": "2024-01-01",
        "to": "2024-01-31",
        "include_charts": true,
        "include_details": true,
        "format": "pdf",
        "email_recipients": ["finance@example.com", "manager@example.com"]
    }
}

// Response
{
    "success": true,
    "message": "Report generation started",
    "data": {
        "report": {
            "id": 1,
            "name": "Monthly Revenue Report - January 2024",
            "report_type": "revenue",
            "status": "generating",
            "estimated_completion": "2024-01-31T10:05:00Z"
        }
    }
}
```

## Implementation Details

### Backend Implementation

#### Payment Gateway Service
```php
<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentGateway;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

abstract class PaymentGatewayService
{
    protected PaymentGateway $gateway;

    public function __construct(PaymentGateway $gateway)
    {
        $this->gateway = $gateway;
    }

    abstract public function createPayment(Invoice $invoice, array $data): array;
    abstract public function checkPaymentStatus(string $transactionId): array;
    abstract public function processCallback(array $data): bool;
    abstract public function refundPayment(Payment $payment, float $amount, string $reason): array;

    protected function getConfig(string $key = null)
    {
        $config = $this->gateway->config;
        
        if ($key) {
            return $config[$key] ?? null;
        }

        return $config;
    }

    protected function calculateFee(float $amount, string $paymentMethod): float
    {
        $fees = $this->gateway->fees[$paymentMethod] ?? [];
        
        if (isset($fees['fixed'])) {
            return $fees['fixed'];
        }

        if (isset($fees['percentage'])) {
            return ($amount * $fees['percentage']) / 100;
        }

        if (isset($fees['tiered'])) {
            foreach ($fees['tiered'] as $tier) {
                if ($amount >= $tier['min'] && $amount <= $tier['max']) {
                    return ($amount * $tier['percentage']) / 100 + ($tier['fixed'] ?? 0);
                }
            }
        }

        return 0;
    }

    protected function createPaymentRecord(Invoice $invoice, array $data): Payment
    {
        $feeAmount = $this->calculateFee($data['amount'], $data['payment_method']);
        $netAmount = $data['amount'] - $feeAmount;

        return Payment::create([
            'invoice_id' => $invoice->id,
            'transaction_id' => $data['transaction_id'],
            'payment_gateway' => $this->gateway->code,
            'payment_method' => $data['payment_method'],
            'amount' => $data['amount'],
            'fee_amount' => $feeAmount,
            'net_amount' => $netAmount,
            'status' => 'pending',
            'payment_url' => $data['payment_url'] ?? null,
            'expiry_time' => $data['expiry_time'] ?? null,
            'gateway_response' => $data['gateway_response'] ?? null,
        ]);
    }

    protected function updatePaymentStatus(Payment $payment, string $status, array $additionalData = []): void
    {
        $updateData = ['status' => $status];

        if ($status === 'success') {
            $updateData['paid_at'] = now();
        } elseif ($status === 'failed') {
            $updateData['failed_at'] = now();
        } elseif ($status === 'cancelled') {
            $updateData['cancelled_at'] = now();
        } elseif ($status === 'refunded') {
            $updateData['refunded_at'] = now();
            $updateData['refund_amount'] = $additionalData['refund_amount'] ?? null;
            $updateData['refund_reason'] = $additionalData['refund_reason'] ?? null;
        }

        $payment->update(array_merge($updateData, $additionalData));
    }
}
```

#### Midtrans Service
```php
<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;

class MidtransService extends PaymentGatewayService
{
    private string $serverKey;
    private string $clientKey;
    private bool $isProduction;

    public function __construct(PaymentGateway $gateway)
    {
        parent::__construct($gateway);
        
        $this->serverKey = $this->getConfig('server_key');
        $this->clientKey = $this->getConfig('client_key');
        $this->isProduction = $this->getConfig('is_production', false);
    }

    public function createPayment(Invoice $invoice, array $data): array
    {
        $payload = [
            'transaction_details' => [
                'order_id' => $invoice->invoice_number,
                'gross_amount' => $data['amount']
            ],
            'customer_details' => $data['customer_details'],
            'item_details' => [
                [
                    'id' => $invoice->id,
                    'price' => $data['amount'],
                    'quantity' => 1,
                    'name' => $data['description'] ?? $invoice->description
                ]
            ],
            'expiry' => [
                'unit' => 'hours',
                'duration' => $data['expiry_hours'] ?? 24
            ]
        ];

        if (isset($data['billing_address'])) {
            $payload['billing_address'] = $data['billing_address'];
        }

        if (isset($data['callback_url'])) {
            $payload['callback_url'] = $data['callback_url'];
        }

        if (isset($data['return_url'])) {
            $payload['redirect_url'] = $data['return_url'];
        }

        // Add payment method specific parameters
        if ($data['payment_method'] === 'credit_card') {
            $payload['credit_card'] = [
                'secure' => true,
                'bank' => $data['bank'] ?? null,
                'installment' => $data['installment'] ?? null
            ];
        }

        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($this->serverKey . ':'),
            'Content-Type' => 'application/json'
        ])->post($this->getApiUrl() . '/v2/charge', $payload);

        $responseData = $response->json();

        if ($response->successful()) {
            $paymentData = [
                'transaction_id' => $responseData['transaction_id'],
                'payment_method' => $data['payment_method'],
                'amount' => $data['amount'],
                'payment_url' => $responseData['redirect_url'] ?? $responseData['va_numbers'][0]['va_number'] ?? null,
                'expiry_time' => now()->addHours($data['expiry_hours'] ?? 24),
                'gateway_response' => $responseData
            ];

            $payment = $this->createPaymentRecord($invoice, $paymentData);

            return [
                'success' => true,
                'payment' => $payment->fresh(),
                'redirect_url' => $responseData['redirect_url'] ?? null
            ];
        }

        return [
            'success' => false,
            'error' => $responseData['error_messages'] ?? 'Payment creation failed'
        ];
    }

    public function checkPaymentStatus(string $transactionId): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($this->serverKey . ':')
        ])->get($this->getApiUrl() . "/v2/{$transactionId}/status");

        $responseData = $response->json();

        if ($response->successful()) {
            return [
                'success' => true,
                'status' => $this->mapMidtransStatus($responseData['transaction_status']),
                'payment_data' => $responseData
            ];
        }

        return [
            'success' => false,
            'error' => 'Failed to check payment status'
        ];
    }

    public function processCallback(array $data): bool
    {
        try {
            // Verify signature
            if (!$this->verifySignature($data)) {
                Log::error('Invalid Midtrans callback signature', $data);
                return false;
            }

            $orderId = $data['order_id'];
            $transactionStatus = $data['transaction_status'];
            $fraudStatus = $data['fraud_status'] ?? null;

            $payment = Payment::whereHas('invoice', function ($query) use ($orderId) {
                $query->where('invoice_number', $orderId);
            })->first();

            if (!$payment) {
                Log::error('Payment not found for order ID: ' . $orderId);
                return false;
            }

            $status = $this->mapMidtransStatus($transactionStatus);

            if ($status === 'success' && $fraudStatus === 'challenge') {
                $status = 'pending'; // Wait for fraud review
            }

            $this->updatePaymentStatus($payment, $status, [
                'gateway_response' => $data,
                'callback_data' => $data
            ]);

            // Update invoice status if payment is successful
            if ($status === 'success') {
                $payment->invoice->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'paid_amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'payment_gateway' => $payment->payment_gateway
                ]);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Error processing Midtrans callback: ' . $e->getMessage());
            return false;
        }
    }

    public function refundPayment(Payment $payment, float $amount, string $reason): array
    {
        $payload = [
            'refund_key' => $this->getConfig('refund_key'),
            'amount' => $amount,
            'reason' => $reason
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($this->serverKey . ':')
        ])->post($this->getApiUrl() . "/v2/{$payment->transaction_id}/refund", $payload);

        $responseData = $response->json();

        if ($response->successful()) {
            $this->updatePaymentStatus($payment, 'refunded', [
                'refund_amount' => $amount,
                'refund_reason' => $reason,
                'gateway_response' => $responseData
            ]);

            return [
                'success' => true,
                'refund_data' => $responseData
            ];
        }

        return [
            'success' => false,
            'error' => $responseData['error_messages'] ?? 'Refund failed'
        ];
    }

    private function getApiUrl(): string
    {
        return $this->isProduction 
            ? 'https://api.midtrans.com' 
            : 'https://api.sandbox.midtrans.com';
    }

    private function mapMidtransStatus(string $midtransStatus): string
    {
        return match ($midtransStatus) {
            'capture', 'settlement' => 'success',
            'authorize' => 'pending',
            'deny' => 'failed',
            'cancel', 'expire' => 'cancelled',
            'pending' => 'pending',
            'refund', 'partial_refund' => 'refunded',
            'partial_refund' => 'partial_refund',
            default => 'pending'
        };
    }

    private function verifySignature(array $data): bool
    {
        $orderId = $data['order_id'];
        $statusCode = $data['status_code'];
        $grossAmount = $data['gross_amount'];
        $serverKey = $this->serverKey;

        $input = $orderId . $statusCode . $grossAmount . $serverKey;
        $signature = hash('sha512', $input);

        return $signature === $data['signature_key'];
    }
}
```

#### Tripay Service
```php
<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;

class TripayService extends PaymentGatewayService
{
    private string $apiKey;
    private string $privateKey;
    private string $merchantCode;
    private bool $isProduction;

    public function __construct(PaymentGateway $gateway)
    {
        parent::__construct($gateway);
        
        $this->apiKey = $this->getConfig('api_key');
        $this->privateKey = $this->getConfig('private_key');
        $this->merchantCode = $this->getConfig('merchant_code');
        $this->isProduction = $this->getConfig('is_production', false);
    }

    public function createPayment(Invoice $invoice, array $data): array
    {
        $payload = [
            'method' => $data['payment_method'],
            'merchant_ref' => $invoice->invoice_number,
            'amount' => $data['amount'],
            'customer_name' => $data['customer_details']['first_name'] . ' ' . $data['customer_details']['last_name'],
            'customer_email' => $data['customer_details']['email'],
            'customer_phone' => $data['customer_details']['phone'],
            'order_items' => [
                [
                    'sku' => 'INV-' . $invoice->id,
                    'name' => $data['description'] ?? $invoice->description,
                    'price' => $data['amount'],
                    'quantity' => 1
                ]
            ],
            'callback_url' => $data['callback_url'],
            'return_url' => $data['return_url'],
            'expired_time' => (time() + ($data['expiry_hours'] ?? 24) * 3600)
        ];

        if (isset($data['billing_address'])) {
            $payload['customer_detail'] = [
                'first_name' => $data['customer_details']['first_name'],
                'last_name' => $data['customer_details']['last_name'],
                'email' => $data['customer_details']['email'],
                'phone' => $data['customer_details']['phone'],
                'billing_address' => $data['billing_address']
            ];
        }

        $signature = $this->generateSignature($payload);
        $payload['signature'] = $signature;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey
        ])->post($this->getApiUrl() . '/transaction/create', $payload);

        $responseData = $response->json();

        if ($response->successful() && $responseData['success']) {
            $paymentData = [
                'transaction_id' => $responseData['data']['reference'],
                'payment_method' => $data['payment_method'],
                'amount' => $data['amount'],
                'payment_url' => $responseData['data']['checkout_url'],
                'expiry_time' => date('Y-m-d H:i:s', $responseData['data']['expired_time']),
                'gateway_response' => $responseData
            ];

            $payment = $this->createPaymentRecord($invoice, $paymentData);

            return [
                'success' => true,
                'payment' => $payment->fresh(),
                'redirect_url' => $responseData['data']['checkout_url']
            ];
        }

        return [
            'success' => false,
            'error' => $responseData['message'] ?? 'Payment creation failed'
        ];
    }

    public function checkPaymentStatus(string $transactionId): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey
        ])->get($this->getApiUrl() . "/transaction/detail?reference={$transactionId}");

        $responseData = $response->json();

        if ($response->successful() && $responseData['success']) {
            return [
                'success' => true,
                'status' => $this->mapTripayStatus($responseData['data']['status']),
                'payment_data' => $responseData['data']
            ];
        }

        return [
            'success' => false,
            'error' => 'Failed to check payment status'
        ];
    }

    public function processCallback(array $data): bool
    {
        try {
            // Verify signature
            if (!$this->verifyCallbackSignature($data)) {
                Log::error('Invalid Tripay callback signature', $data);
                return false;
            }

            $reference = $data['reference'];
            $status = $data['status'];

            $payment = Payment::where('transaction_id', $reference)->first();

            if (!$payment) {
                Log::error('Payment not found for reference: ' . $reference);
                return false;
            }

            $mappedStatus = $this->mapTripayStatus($status);

            $this->updatePaymentStatus($payment, $mappedStatus, [
                'gateway_response' => $data,
                'callback_data' => $data
            ]);

            // Update invoice status if payment is successful
            if ($mappedStatus === 'success') {
                $payment->invoice->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'paid_amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'payment_gateway' => $payment->payment_gateway
                ]);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Error processing Tripay callback: ' . $e->getMessage());
            return false;
        }
    }

    public function refundPayment(Payment $payment, float $amount, string $reason): array
    {
        $payload = [
            'reference' => $payment->transaction_id,
            'amount' => $amount,
            'reason' => $reason
        ];

        $signature = $this->generateRefundSignature($payload);
        $payload['signature'] = $signature;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey
        ])->post($this->getApiUrl() . '/transaction/refund', $payload);

        $responseData = $response->json();

        if ($response->successful() && $responseData['success']) {
            $this->updatePaymentStatus($payment, 'refunded', [
                'refund_amount' => $amount,
                'refund_reason' => $reason,
                'gateway_response' => $responseData
            ]);

            return [
                'success' => true,
                'refund_data' => $responseData['data']
            ];
        }

        return [
            'success' => false,
            'error' => $responseData['message'] ?? 'Refund failed'
        ];
    }

    private function getApiUrl(): string
    {
        return $this->isProduction 
            ? 'https://tripay.co.id/api' 
            : 'https://tripay.co.id/api-sandbox';
    }

    private function generateSignature(array $payload): string
    {
        unset($payload['signature']); // Remove signature if exists
        
        $jsonPayload = json_encode($payload);
        return hash_hmac('sha256', $jsonPayload, $this->privateKey);
    }

    private function generateRefundSignature(array $payload): string
    {
        $stringToSign = $payload['reference'] . $payload['amount'];
        return hash_hmac('sha256', $stringToSign, $this->privateKey);
    }

    private function verifyCallbackSignature(array $data): bool
    {
        $signature = $data['signature'] ?? '';
        unset($data['signature']);
        
        $calculatedSignature = $this->generateSignature($data);
        return hash_equals($signature, $calculatedSignature);
    }

    private function mapTripayStatus(string $tripayStatus): string
    {
        return match ($tripayStatus) {
            'PAID' => 'success',
            'UNPAID' => 'pending',
            'EXPIRED' => 'expired',
            'FAILED' => 'failed',
            'REFUND' => 'refunded',
            'PARTIAL_REFUND' => 'partial_refund',
            default => 'pending'
        };
    }
}
```

#### Billing Service
```php
<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\CustomerSubscription;
use App\Models\BillingCycle;
use App\Models\InvoiceItem;
use App\Jobs\SendInvoiceNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingService
{
    public function generateInvoices(BillingCycle $billingCycle, Carbon $billingDate, array $options = []): array
    {
        $dryRun = $options['dry_run'] ?? false;
        $customerIds = $options['customer_ids'] ?? null;
        $sendInvoices = $options['send_invoices'] ?? false;

        $results = [
            'total_customers' => 0,
            'invoices_generated' => 0,
            'invoices_failed' => 0,
            'total_amount' => 0,
            'errors' => [],
            'invoices' => []
        ];

        try {
            DB::beginTransaction();

            // Get active subscriptions for billing
            $query = CustomerSubscription::with(['customer', 'servicePlan'])
                ->where('status', 'active')
                ->where('start_date', '<=', $billingDate)
                ->where(function ($q) use ($billingDate) {
                    $q->whereNull('end_date')
                      ->orWhere('end_date', '>', $billingDate);
                });

            if ($customerIds) {
                $query->whereIn('customer_id', $customerIds);
            }

            $subscriptions = $query->get();
            $results['total_customers'] = $subscriptions->count();

            foreach ($subscriptions as $subscription) {
                try {
                    $invoice = $this->generateSubscriptionInvoice($subscription, $billingDate, $billingCycle);
                    
                    if ($invoice) {
                        $results['invoices_generated']++;
                        $results['total_amount'] += $invoice->total_amount;
                        $results['invoices'][] = $invoice;

                        if (!$dryRun && $sendInvoices) {
                            SendInvoiceNotification::dispatch($invoice);
                        }
                    }

                } catch (\Exception $e) {
                    $results['invoices_failed']++;
                    $results['errors'][] = [
                        'customer_id' => $subscription->customer_id,
                        'subscription_id' => $subscription->id,
                        'error' => $e->getMessage()
                    ];
                    Log::error("Failed to generate invoice for subscription {$subscription->id}: {$e->getMessage()}");
                }
            }

            if (!$dryRun) {
                // Update next run date for billing cycle
                $nextRunDate = $this->calculateNextRunDate($billingCycle, $billingDate);
                $billingCycle->update(['next_run_date' => $nextRunDate]);
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Billing generation failed: {$e->getMessage()}");
            $results['errors'][] = [
                'error' => $e->getMessage()
            ];
        }

        return $results;
    }

    private function generateSubscriptionInvoice(
        CustomerSubscription $subscription, 
        Carbon $billingDate, 
        BillingCycle $billingCycle
    ): ?Invoice {
        // Check if invoice already exists for this period
        $existingInvoice = Invoice::where('subscription_id', $subscription->id)
            ->where('type', 'subscription')
            ->whereMonth('created_at', $billingDate->month)
            ->whereYear('created_at', $billingDate->year)
            ->first();

        if ($existingInvoice) {
            return null; // Skip if invoice already exists
        }

        $invoiceNumber = $this->generateInvoiceNumber($billingDate);
        $dueDate = $this->calculateDueDate($billingDate, $billingCycle);

        // Calculate prorated amount if needed
        $amount = $this->calculateBillingAmount($subscription, $billingDate, $billingCycle);
        $taxAmount = $amount * 0.10; // 10% tax
        $totalAmount = $amount + $taxAmount;

        DB::beginTransaction();

        try {
            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'customer_id' => $subscription->customer_id,
                'subscription_id' => $subscription->id,
                'type' => 'subscription',
                'description' => $this->generateInvoiceDescription($subscription, $billingDate),
                'amount' => $amount,
                'tax_amount' => $taxAmount,
                'discount_amount' => 0,
                'total_amount' => $totalAmount,
                'due_date' => $dueDate,
                'status' => 'draft',
                'created_by' => auth()->id()
            ]);

            // Create invoice item
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => $subscription->servicePlan->name . ' - ' . $billingDate->format('F Y'),
                'quantity' => 1,
                'unit_price' => $amount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'item_type' => 'subscription',
                'reference_id' => $subscription->id,
                'reference_type' => 'customer_subscription'
            ]);

            DB::commit();

            return $invoice;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function calculateBillingAmount(
        CustomerSubscription $subscription, 
        Carbon $billingDate, 
        BillingCycle $billingCycle
    ): float {
        $baseAmount = $subscription->price;

        // Check if proration is needed
        if ($this->needsProration($subscription, $billingDate, $billingCycle)) {
            return $this->calculateProratedAmount($subscription, $billingDate, $billingCycle);
        }

        return $baseAmount;
    }

    private function needsProration(
        CustomerSubscription $subscription, 
        Carbon $billingDate, 
        BillingCycle $billingCycle
    ): bool {
        // Proration needed if:
        // 1. Subscription started during current billing period
        // 2. Subscription ends during current billing period
        
        $periodStart = $this->getBillingPeriodStart($billingDate, $billingCycle);
        $periodEnd = $this->getBillingPeriodEnd($billingDate, $billingCycle);

        return $subscription->start_date > $periodStart ||
               ($subscription->end_date && $subscription->end_date < $periodEnd);
    }

    private function calculateProratedAmount(
        CustomerSubscription $subscription, 
        Carbon $billingDate, 
        BillingCycle $billingCycle
    ): float {
        $periodStart = $this->getBillingPeriodStart($billingDate, $billingCycle);
        $periodEnd = $this->getBillingPeriodEnd($billingDate, $billingCycle);
        
        $serviceStart = max($subscription->start_date, $periodStart);
        $serviceEnd = $subscription->end_date ? min($subscription->end_date, $periodEnd) : $periodEnd;
        
        $totalDaysInPeriod = $periodStart->diffInDays($periodEnd) + 1;
        $serviceDays = $serviceStart->diffInDays($serviceEnd) + 1;
        
        $dailyRate = $subscription->price / $totalDaysInPeriod;
        
        return $dailyRate * $serviceDays;
    }

    private function getBillingPeriodStart(Carbon $date, BillingCycle $billingCycle): Carbon
    {
        return match ($billingCycle->frequency) {
            'monthly' => $date->copy()->startOfMonth()->day($billingCycle->billing_day),
            'weekly' => $date->copy()->startOfWeek(),
            'daily' => $date->copy()->startOfDay(),
            'quarterly' => $date->copy()->startOfQuarter(),
            'yearly' => $date->copy()->startOfYear(),
            default => $date->copy()->startOfMonth()
        };
    }

    private function getBillingPeriodEnd(Carbon $date, BillingCycle $billingCycle): Carbon
    {
        $start = $this->getBillingPeriodStart($date, $billingCycle);
        
        return match ($billingCycle->frequency) {
            'monthly' => $start->copy()->addMonth()->subDay(),
            'weekly' => $start->copy()->addWeek()->subDay(),
            'daily' => $start->copy()->addDay()->subSecond(),
            'quarterly' => $start->copy()->addQuarter()->subDay(),
            'yearly' => $start->copy()->addYear()->subDay(),
            default => $start->copy()->addMonth()->subDay()
        };
    }

    private function calculateDueDate(Carbon $billingDate, BillingCycle $billingCycle): Carbon
    {
        $gracePeriod = $billingCycle->grace_period ?? 7; // Default 7 days grace period
        
        return $billingDate->copy()->addDays($gracePeriod);
    }

    private function generateInvoiceNumber(Carbon $date): string
    {
        $prefix = 'INV';
        $yearMonth = $date->format('Ym');
        
        $lastInvoice = Invoice::whereYear('created_at', $date->year)
            ->whereMonth('created_at', $date->month)
            ->orderBy('invoice_number', 'desc')
            ->first();

        $sequence = $lastInvoice ? intval(substr($lastInvoice->invoice_number, -4)) + 1 : 1;
        
        return sprintf('%s-%s%04d', $prefix, $yearMonth, $sequence);
    }

    private function generateInvoiceDescription(CustomerSubscription $subscription, Carbon $date): string
    {
        return sprintf(
            '%s - %s',
            $subscription->servicePlan->name,
            $date->format('F Y')
        );
    }

    private function calculateNextRunDate(BillingCycle $billingCycle, Carbon $currentDate): Carbon
    {
        return match ($billingCycle->frequency) {
            'daily' => $currentDate->copy()->addDay(),
            'weekly' => $currentDate->copy()->addWeek(),
            'monthly' => $currentDate->copy()->addMonth(),
            'quarterly' => $currentDate->copy()->addQuarter(),
            'yearly' => $currentDate->copy()->addYear(),
            default => $currentDate->copy()->addMonth()
        };
    }

    public function sendPaymentReminders(string $reminderType, int $daysBefore = 3): array
    {
        $results = [
            'total_reminders' => 0,
            'email_sent' => 0,
            'sms_sent' => 0,
            'failed' => 0,
            'errors' => []
        ];

        try {
            $query = Invoice::with('customer')
                ->where('status', 'sent')
                ->whereNull('paid_at');

            if ($reminderType === 'due_soon') {
                $query->whereBetween('due_date', [
                    now()->startOfDay(),
                    now()->addDays($daysBefore)->endOfDay()
                ]);
            } elseif ($reminderType === 'overdue') {
                $query->where('due_date', '<', now()->startOfDay());
            }

            $invoices = $query->get();
            $results['total_reminders'] = $invoices->count();

            foreach ($invoices as $invoice) {
                try {
                    // Send email reminder
                    SendInvoiceNotification::dispatch($invoice, 'reminder');
                    $results['email_sent']++;

                    // Send SMS reminder if phone number available
                    if ($invoice->customer->phone) {
                        // SendSmsReminder::dispatch($invoice);
                        $results['sms_sent']++;
                    }

                    // Update reminder timestamps
                    $invoice->update([
                        'last_reminder_at' => now()
                    ]);

                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'invoice_id' => $invoice->id,
                        'error' => $e->getMessage()
                    ];
                    Log::error("Failed to send reminder for invoice {$invoice->id}: {$e->getMessage()}");
                }
            }

        } catch (\Exception $e) {
            Log::error("Payment reminder sending failed: {$e->getMessage()}");
            $results['errors'][] = [
                'error' => $e->getMessage()
            ];
        }

        return $results;
    }
}
```

### Frontend Implementation

#### Payment Form Component
```javascript
// src/components/payments/PaymentForm.jsx
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { paymentService } from '../../services/paymentService';
import Cards from 'react-credit-cards';
import { formatCurrency } from '../../utils/formatters';

const PaymentForm = ({ invoiceId, onPaymentSuccess, onPaymentError }) => {
  const [selectedGateway, setSelectedGateway] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: invoice } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => paymentService.getInvoice(invoiceId),
    enabled: !!invoiceId
  });

  const { data: gateways } = useQuery({
    queryKey: ['payment-gateways'],
    queryFn: () => paymentService.getPaymentGateways()
  });

  const createPaymentMutation = useMutation({
    mutationFn: paymentService.createPayment,
    onSuccess: (data) => {
      if (data.payment_url) {
        // Redirect to payment gateway
        window.location.href = data.payment_url;
      } else {
        onPaymentSuccess?.(data);
      }
    },
    onError: (error) => {
      onPaymentError?.(error);
    }
  });

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      payment_gateway: '',
      payment_method: '',
      customer_details: {
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
      },
      billing_address: {
        address: '',
        city: '',
        postal_code: '',
        country_code: 'IDN'
      }
    }
  });

  const watchedGateway = watch('payment_gateway');
  const watchedMethod = watch('payment_method');

  useEffect(() => {
    if (invoice?.data) {
      setValue('customer_details.first_name', invoice.data.customer.name.split(' ')[0]);
      setValue('customer_details.last_name', invoice.data.customer.name.split(' ').slice(1).join(' '));
      setValue('customer_details.email', invoice.data.customer.email);
      setValue('customer_details.phone', invoice.data.customer.phone);
    }
  }, [invoice, setValue]);

  useEffect(() => {
    setSelectedGateway(watchedGateway);
    setSelectedMethod(watchedMethod);
  }, [watchedGateway, watchedMethod]);

  const onSubmit = (data) => {
    setIsProcessing(true);
    
    const paymentData = {
      invoice_id: invoiceId,
      payment_gateway: data.payment_gateway,
      payment_method: data.payment_method,
      amount: invoice.data.total_amount,
      customer_details: data.customer_details,
      billing_address: data.billing_address,
      callback_url: `${window.location.origin}/payment/callback`,
      return_url: `${window.location.origin}/payment/return`,
      expiry_hours: 24
    };

    createPaymentMutation.mutate(paymentData);
  };

  const getPaymentMethodsForGateway = (gatewayCode) => {
    const gateway = gateways?.data?.gateways?.find(g => g.code === gatewayCode);
    return gateway?.supported_methods || [];
  };

  const renderPaymentMethodForm = () => {
    if (!selectedGateway || !selectedMethod) {
      return null;
    }

    switch (selectedMethod) {
      case 'credit_card':
        return <CreditCardForm control={control} errors={errors} />;
      case 'bank_transfer':
        return <BankTransferForm gateway={selectedGateway} />;
      case 'ewallet':
        return <EwalletForm gateway={selectedGateway} />;
      case 'va':
        return <VAForm gateway={selectedGateway} />;
      default:
        return null;
    }
  };

  if (!invoice?.data) {
    return <div>Loading invoice details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

        {/* Invoice Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Invoice Summary</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Invoice Number:</span>
              <span className="font-medium">{invoice.data.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Description:</span>
              <span className="font-medium">{invoice.data.description}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">{formatCurrency(invoice.data.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span className="font-medium">{formatCurrency(invoice.data.tax_amount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(invoice.data.total_amount)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Payment Gateway Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Gateway
            </label>
            <Controller
              name="payment_gateway"
              control={control}
              rules={{ required: 'Please select a payment gateway' }}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Payment Gateway</option>
                  {gateways?.data?.gateways?.map((gateway) => (
                    <option key={gateway.code} value={gateway.code}>
                      {gateway.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.payment_gateway && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_gateway.message}</p>
            )}
          </div>

          {/* Payment Method Selection */}
          {selectedGateway && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <Controller
                name="payment_method"
                control={control}
                rules={{ required: 'Please select a payment method' }}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-4">
                    {getPaymentMethodsForGateway(selectedGateway).map((method) => (
                      <label key={method.code} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          {...field}
                          value={method.code}
                          className="mr-3"
                        />
                        <span>{method.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.payment_method && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
              )}
            </div>
          )}

          {/* Customer Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Controller
                  name="customer_details.first_name"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                />
                {errors.customer_details?.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_details.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Controller
                  name="customer_details.last_name"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                />
                {errors.customer_details?.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_details.last_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Controller
                  name="customer_details.email"
                  control={control}
                  rules={{ 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                />
                {errors.customer_details?.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_details.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Controller
                  name="customer_details.phone"
                  control={control}
                  rules={{ required: 'Phone number is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                />
                {errors.customer_details?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_details.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Specific Form */}
          {renderPaymentMethodForm()}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isProcessing || createPaymentMutation.isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing || createPaymentMutation.isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Credit Card Form Component
const CreditCardForm = ({ control, errors }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number
        </label>
        <Controller
          name="card_number"
          control={control}
          rules={{ 
            required: 'Card number is required',
            pattern: {
              value: /^[0-9]{16}$/,
              message: 'Card number must be 16 digits'
            }
          }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        />
        {errors.card_number && (
          <p className="mt-1 text-sm text-red-600">{errors.card_number.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <Controller
            name="expiry_date"
            control={control}
            rules={{ required: 'Expiry date is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="MM/YY"
                className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
          {errors.expiry_date && (
            <p className="mt-1 text-sm text-red-600">{errors.expiry_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <Controller
            name="cvv"
            control={control}
            rules={{ 
              required: 'CVV is required',
              pattern: {
                value: /^[0-9]{3,4}$/,
                message: 'CVV must be 3 or 4 digits'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="123"
                className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
```

#### Invoice Management Component
```javascript
// src/components/billing/InvoiceManagement.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { billingService } from '../../services/billingService';

const InvoiceManagement = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    page: 1,
    status: '',
    customer_id: '',
    from: '',
    to: ''
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => billingService.getInvoices(filters)
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: billingService.sendInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
    }
  });

  const generatePdfMutation = useMutation({
    mutationFn: billingService.generateInvoicePdf,
    onSuccess: (data) => {
      // Download PDF
      const link = document.createElement('a');
      link.href = data.pdf_url;
      link.download = data.filename;
      link.click();
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-yellow-600 bg-yellow-100';
      case 'refunded': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSendInvoice = (invoiceId) => {
    sendInvoiceMutation.mutate({
      invoice_id: invoiceId,
      send_email: true,
      send_sms: false
    });
  };

  const handleGeneratePdf = (invoiceId) => {
    generatePdfMutation.mutate(invoiceId);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Generate Invoices
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          <input
            type="text"
            placeholder="Customer ID"
            value={filters.customer_id}
            onChange={(e) => setFilters({...filters, customer_id: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          />

          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({...filters, from: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          />

          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({...filters, to: e.target.value, page: 1})}
            className="border rounded px-3 py-2"
          />

          <button
            onClick={() => setFilters({page: 1, status: '', customer_id: '', from: '', to: ''})}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Invoices</h3>
          <p className="text-2xl font-bold">{invoices?.data?.summary?.total_invoices || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Amount</h3>
          <p className="text-2xl font-bold">{formatCurrency(invoices?.data?.summary?.total_amount || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Paid Amount</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(invoices?.data?.summary?.paid_amount || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600">Unpaid Amount</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(invoices?.data?.summary?.unpaid_amount || 0)}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices?.data?.invoices?.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                      <div className="text-sm text-gray-500">{invoice.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.customer.name}</div>
                    <div className="text-sm text-gray-500">{invoice.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(invoice.total_amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(invoice.due_date)}</div>
                    {invoice.days_overdue > 0 && (
                      <div className="text-sm text-red-600">{invoice.days_overdue} days overdue</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGeneratePdf(invoice.id)}
                        disabled={generatePdfMutation.isLoading}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        PDF
                      </button>
                      {invoice.status === 'draft' && (
                        <button
                          onClick={() => handleSendInvoice(invoice.id)}
                          disabled={sendInvoiceMutation.isLoading}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Send
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
              disabled={filters.page >= (invoices?.data?.pagination?.total_pages || 1)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(filters.page - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(filters.page * 10, invoices?.data?.pagination?.total_items || 0)}</span> of{' '}
                <span className="font-medium">{invoices?.data?.pagination?.total_items || 0}</span> results
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
                  Page {filters.page} of {invoices?.data?.pagination?.total_pages || 1}
                </span>
                <button
                  onClick={() => setFilters({...filters, page: filters.page + 1})}
                  disabled={filters.page >= (invoices?.data?.pagination?.total_pages || 1)}
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

export default InvoiceManagement;
```

## Testing Requirements

### Unit Tests

#### Payment Gateway Service Tests
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\PaymentGatewayService;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class PaymentGatewayServiceTest extends TestCase
{
    use RefreshDatabase;

    private PaymentGatewayService $service;
    private Invoice $invoice;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->invoice = Invoice::factory()->create([
            'total_amount' => 100000,
            'status' => 'sent'
        ]);
    }

    public function test_can_create_payment_record()
    {
        $gateway = \App\Models\PaymentGateway::factory()->create([
            'code' => 'test_gateway',
            'config' => [
                'api_key' => 'test_key'
            ]
        ]);

        $this->service = new class($gateway) extends PaymentGatewayService {
            public function createPayment(Invoice $invoice, array $data): array
            {
                $paymentData = [
                    'transaction_id' => 'TEST-123',
                    'payment_method' => 'test_method',
                    'amount' => $data['amount'],
                    'payment_url' => 'https://test.com/pay',
                    'gateway_response' => ['success' => true]
                ];
                
                $payment = $this->createPaymentRecord($invoice, $paymentData);
                
                return [
                    'success' => true,
                    'payment' => $payment,
                    'redirect_url' => $paymentData['payment_url']
                ];
            }

            public function checkPaymentStatus(string $transactionId): array { return []; }
            public function processCallback(array $data): bool { return true; }
            public function refundPayment(Payment $payment, float $amount, string $reason): array { return []; }
        };

        $result = $this->service->createPayment($this->invoice, [
            'amount' => 100000,
            'payment_method' => 'test_method'
        ]);

        $this->assertTrue($result['success']);
        $this->assertInstanceOf(Payment::class, $result['payment']);
        $this->assertEquals('TEST-123', $result['payment']->transaction_id);
        $this->assertEquals(100000, $result['payment']->amount);
    }

    public function test_calculates_fee_correctly()
    {
        $gateway = \App\Models\PaymentGateway::factory()->create([
            'code' => 'test_gateway',
            'fees' => [
                'credit_card' => [
                    'percentage' => 2.5
                ],
                'bank_transfer' => [
                    'fixed' => 5000
                ]
            ]
        ]);

        $this->service = new class($gateway) extends PaymentGatewayService {
            public function createPayment(Invoice $invoice, array $data): array { return []; }
            public function checkPaymentStatus(string $transactionId): array { return []; }
            public function processCallback(array $data): bool { return true; }
            public function refundPayment(Payment $payment, float $amount, string $reason): array { return []; }
        };

        // Test percentage fee
        $creditCardFee = $this->service->calculateFee(100000, 'credit_card');
        $this->assertEquals(2500, $creditCardFee);

        // Test fixed fee
        $bankTransferFee = $this->service->calculateFee(100000, 'bank_transfer');
        $this->assertEquals(5000, $bankTransferFee);

        // Test no fee
        $noFee = $this->service->calculateFee(100000, 'unknown_method');
        $this->assertEquals(0, $noFee);
    }
}
```

#### Billing Service Tests
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\BillingService;
use App\Models\CustomerSubscription;
use App\Models\BillingCycle;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BillingServiceTest extends TestCase
{
    use RefreshDatabase;

    private BillingService $billingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->billingService = app(BillingService::class);
    }

    public function test_generates_monthly_invoices()
    {
        // Create test data
        $billingCycle = BillingCycle::factory()->create([
            'frequency' => 'monthly',
            'billing_day' => 1,
            'next_run_date' => Carbon::now()
        ]);

        $subscription = CustomerSubscription::factory()->create([
            'status' => 'active',
            'price' => 500000,
            'start_date' => Carbon::now()->subMonth()
        ]);

        $billingDate = Carbon::now();
        
        $results = $this->billingService->generateInvoices($billingCycle, $billingDate);

        $this->assertEquals(1, $results['total_customers']);
        $this->assertEquals(1, $results['invoices_generated']);
        $this->assertEquals(550000, $results['total_amount']); // 500000 + 10% tax

        $this->assertDatabaseHas('invoices', [
            'customer_id' => $subscription->customer_id,
            'subscription_id' => $subscription->id,
            'type' => 'subscription',
            'amount' => 500000,
            'tax_amount' => 50000,
            'total_amount' => 550000
        ]);
    }

    public test test_calculates_prorated_amount()
    {
        $billingCycle = BillingCycle::factory()->create([
            'frequency' => 'monthly',
            'billing_day' => 1
        ]);

        $subscription = CustomerSubscription::factory()->create([
            'status' => 'active',
            'price' => 300000, // Monthly price
            'start_date' => Carbon::now()->startOfMonth()->addDays(15) // Started mid-month
        ]);

        $billingDate = Carbon::now();
        
        $results = $this->billingService->generateInvoices($billingCycle, $billingDate);

        // Should be prorated for ~15 days
        $expectedAmount = 300000 * (15 / 30); // Approximately half month
        $this->assertEquals($expectedAmount, $results['total_amount'], '', 1000);
    }

    public function test_skips_existing_invoices()
    {
        $billingCycle = BillingCycle::factory()->create([
            'frequency' => 'monthly',
            'billing_day' => 1
        ]);

        $subscription = CustomerSubscription::factory()->create([
            'status' => 'active',
            'price' => 500000
        ]);

        // Create existing invoice for this month
        Invoice::factory()->create([
            'customer_id' => $subscription->customer_id,
            'subscription_id' => $subscription->id,
            'type' => 'subscription',
            'created_at' => Carbon::now()
        ]);

        $billingDate = Carbon::now();
        
        $results = $this->billingService->generateInvoices($billingCycle, $billingDate);

        $this->assertEquals(0, $results['invoices_generated']);
        $this->assertEquals(0, $results['total_amount']);
    }
}
```

### Integration Tests

#### Payment API Tests
```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($this->admin, 'sanctum');
    }

    public function test_can_create_payment()
    {
        $invoice = Invoice::factory()->create([
            'status' => 'sent',
            'total_amount' => 100000
        ]);

        $paymentData = [
            'invoice_id' => $invoice->id,
            'payment_gateway' => 'midtrans',
            'payment_method' => 'credit_card',
            'amount' => 100000,
            'customer_details' => [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john@example.com',
                'phone' => '+628123456789'
            ],
            'callback_url' => 'https://example.com/callback',
            'return_url' => 'https://example.com/return'
        ];

        $response = $this->postJson('/api/payments/create', $paymentData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'payment' => [
                            'id',
                            'transaction_id',
                            'payment_gateway',
                            'payment_method',
                            'amount',
                            'status'
                        ]
                    ]
                ]);

        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'payment_gateway' => 'midtrans',
            'payment_method' => 'credit_card',
            'amount' => 100000,
            'status' => 'pending'
        ]);
    }

    public function test_can_check_payment_status()
    {
        $payment = Payment::factory()->create([
            'transaction_id' => 'TEST-123456',
            'status' => 'pending'
        ]);

        $response = $this->getJson("/api/payments/{$payment->transaction_id}/status");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'payment' => [
                            'id',
                            'transaction_id',
                            'status',
                            'amount',
                            'paid_at'
                        ]
                    ]
                ]);
    }

    public function test_can_process_callback()
    {
        $payment = Payment::factory()->create([
            'transaction_id' => 'TEST-123456',
            'status' => 'pending'
        ]);

        $callbackData = [
            'status_code' => '200',
            'transaction_id' => 'TEST-123456',
            'order_id' => $payment->invoice->invoice_number,
            'gross_amount' => '100000.00',
            'payment_type' => 'credit_card',
            'transaction_status' => 'capture',
            'signature_key' => 'valid_signature'
        ];

        $response = $this->postJson("/api/payments/{$payment->transaction_id}/callback", $callbackData);

        $response->assertStatus(200);
        
        $payment->refresh();
        $this->assertEquals('success', $payment->status);
        $this->assertNotNull($payment->paid_at);
    }

    public function test_can_refund_payment()
    {
        $payment = Payment::factory()->create([
            'status' => 'success',
            'amount' => 100000,
            'paid_at' => now()->subDay()
        ]);

        $refundData = [
            'refund_amount' => 100000,
            'refund_reason' => 'Customer requested refund'
        ];

        $response = $this->postJson("/api/payments/{$payment->id}/refund", $refundData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'payment' => [
                            'id',
                            'status',
                            'refund_amount',
                            'refund_reason',
                            'refunded_at'
                        ]
                    ]
                ]);

        $payment->refresh();
        $this->assertEquals('refunded', $payment->status);
        $this->assertEquals(100000, $payment->refund_amount);
    }
}
```

### Frontend Tests

#### Payment Form Tests
```javascript
// src/components/__tests__/PaymentForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PaymentForm from '../payments/PaymentForm';
import { paymentService } from '../../services/paymentService';

// Mock payment service
jest.mock('../../services/paymentService');

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

describe('PaymentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders payment form with invoice details', async () => {
    const mockInvoice = {
      data: {
        id: 1,
        invoice_number: 'INV-2024-001',
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+628123456789'
        },
        description: 'Monthly subscription fee',
        amount: 500000,
        tax_amount: 50000,
        total_amount: 550000
      }
    };

    paymentService.getInvoice.mockResolvedValue(mockInvoice);

    renderWithClient(<PaymentForm invoiceId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Payment Details')).toBeInTheDocument();
      expect(screen.getByText('Invoice Summary')).toBeInTheDocument();
      expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      expect(screen.getByText('Monthly subscription fee')).toBeInTheDocument();
      expect(screen.getByText('550,000')).toBeInTheDocument();
    });
  });

  test('submits payment form with valid data', async () => {
    const mockInvoice = {
      data: {
        id: 1,
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+628123456789'
        },
        total_amount: 550000
      }
    };

    const mockGateways = {
      data: {
        gateways: [
          {
            code: 'midtrans',
            name: 'Midtrans',
            supported_methods: ['credit_card', 'bank_transfer']
          }
        ]
      }
    };

    paymentService.getInvoice.mockResolvedValue(mockInvoice);
    paymentService.getPaymentGateways.mockResolvedValue(mockGateways);
    paymentService.createPayment.mockResolvedValue({
      success: true,
      payment_url: 'https://payment.example.com/pay'
    });

    renderWithClient(<PaymentForm invoiceId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Midtrans')).toBeInTheDocument();
    });

    // Select payment gateway
    fireEvent.change(screen.getByDisplayValue('Select Payment Gateway'), {
      target: { value: 'midtrans' }
    });

    // Select payment method
    await waitFor(() => {
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Credit Card'));

    // Fill form and submit
    fireEvent.click(screen.getByText('Proceed to Payment'));

    await waitFor(() => {
      expect(paymentService.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          invoice_id: 1,
          payment_gateway: 'midtrans',
          payment_method: 'credit_card',
          amount: 550000
        })
      );
    });
  });

  test('validates required fields', async () => {
    const mockInvoice = {
      data: {
        id: 1,
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+628123456789'
        },
        total_amount: 550000
      }
    };

    paymentService.getInvoice.mockResolvedValue(mockInvoice);

    renderWithClient(<PaymentForm invoiceId={1} />);

    // Try to submit without selecting gateway
    fireEvent.click(screen.getByText('Proceed to Payment'));

    await waitFor(() => {
      expect(screen.getByText('Please select a payment gateway')).toBeInTheDocument();
    });
  });
});
```

## Deployment Requirements

### Environment Configuration

#### Additional .env Variables
```env
# Payment Gateway Configuration
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false

TRIPAY_API_KEY=your_tripay_api_key
TRIPAY_PRIVATE_KEY=your_tripay_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
TRIPAY_IS_PRODUCTION=false

# Billing Configuration
BILLING_ENABLED=true
BILLING_TIMEZONE=Asia/Jakarta
DEFAULT_GRACE_PERIOD=7
LATE_FEE_PERCENTAGE=5
LATE_FEE_MAX_AMOUNT=50000

# Invoice Configuration
INVOICE_PREFIX=INV
INVOICE_NUMBER_PADDING=4
INVOICE_TAX_PERCENTAGE=10
INVOICE_CURRENCY=IDR

# Email Configuration
INVOICE_EMAIL_TEMPLATE=invoice.default
PAYMENT_SUCCESS_EMAIL_TEMPLATE=payment.success
PAYMENT_FAILED_EMAIL_TEMPLATE=payment.failed

# PDF Generation
PDF_STORAGE_DISK=local
PDF_TEMP_PATH=storage/app/temp/pdfs

# Webhook Configuration
PAYMENT_WEBHOOK_SECRET=your_webhook_secret
PAYMENT_WEBHOOK_TIMEOUT=30
```

### Queue Configuration

#### Payment Jobs
```php
<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Services\PaymentGatewayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessPaymentCallback implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(
        private string $gatewayCode,
        private array $callbackData
    ) {}

    public function handle(): void
    {
        try {
            $gateway = \App\Models\PaymentGateway::where('code', $this->gatewayCode)->first();
            
            if (!$gateway) {
                Log::error("Payment gateway not found: {$this->gatewayCode}");
                return;
            }

            $service = PaymentGatewayService::factory($gateway);
            $service->processCallback($this->callbackData);

        } catch (\Exception $e) {
            Log::error("Failed to process payment callback: {$e->getMessage()}");
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Payment callback job failed: {$exception->getMessage()}");
    }
}
```

#### Scheduler Configuration
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Generate monthly invoices
    $schedule->command('billing:generate')
             ->monthlyOn(1, '02:00')
             ->withoutOverlapping();

    // Send payment reminders
    $schedule->command('billing:reminders')
             ->dailyAt('09:00')
             ->withoutOverlapping();

    // Process pending payments
    $schedule->command('payments:check-pending')
             ->everyFiveMinutes()
             ->withoutOverlapping();

    // Update expired payments
    $schedule->command('payments:update-expired')
             ->hourly()
             ->withoutOverlapping();

    // Generate financial reports
    $schedule->command('reports:generate-financial')
             ->dailyAt('03:00')
             ->withoutOverlapping();
}
```

## Success Criteria

### Functional Requirements
- ✅ Midtrans & Tripay integration working
- ✅ Automated invoice generation
- ✅ Multiple payment methods support
- ✅ Payment status tracking and callbacks
- ✅ Refund processing capabilities
- ✅ Financial reporting and analytics

### Performance Requirements
- ✅ Payment creation < 3 seconds
- ✅ Invoice generation < 30 seconds for 1000+ customers
- ✅ Payment callback processing < 1 second
- ✅ Financial report generation < 2 minutes
- ✅ PDF generation < 5 seconds

### Security Requirements
- ✅ Secure payment gateway integration
- ✅ Webhook signature verification
- ✅ Encrypted sensitive data storage
- ✅ PCI DSS compliance for credit card processing
- ✅ Audit trail for all financial transactions

### Reliability Requirements
- ✅ 99.9% payment processing uptime
- ✅ Automatic retry for failed transactions
- ✅ Graceful handling of gateway downtime
- ✅ Data consistency across payment and invoice systems

## Next Steps

Setelah Fase 5 selesai, sistem akan memiliki:
1. Complete payment gateway integration
2. Automated billing system
3. Invoice management capabilities
4. Financial reporting and analytics
5. Refund and dispute handling
6. Foundation untuk Geniacs integration di Fase 6

Fase 6 akan membangun di atas financial capabilities ini dengan menambahkan Geniacs integration untuk comprehensive business process automation.