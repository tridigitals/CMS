# ISP Management System Documentation

## Overview

ISP Management System adalah sistem manajemen lengkap untuk penyedia layanan internet yang mendukung integrasi dengan MikroTik RouterOS, payment gateway, dan sistem monitoring real-time.

## Technology Stack

- **Backend**: Laravel 10+ (PHP 8.1+)
- **Frontend**: React 18+ dengan Vite
- **Database**: MySQL 8.0+ / PostgreSQL 13+
- **Cache**: Redis 6+
- **Queue**: Redis / Database
- **Authentication**: Laravel Sanctum
- **API Documentation**: Laravel API Resources + Swagger/OpenAPI

## Core Features

1. **MikroTik RouterOS Integration** (v6 & v7)
2. **Multi-NAS Management** (Multi MikroTik)
3. **Customer Management & Mapping**
4. **Live Monitoring System**
5. **Payment Gateway Integration** (Midtrans & Tripay)
6. **Geniacs Integration**

## Documentation Structure

```
docs/
├── README.md                           # Overview dan getting started
├── architecture/                       # Arsitektur sistem
│   ├── system-overview.md
│   ├── api-design.md
│   └── security.md
├── database/                          # Database schema
│   ├── erd.md
│   ├── migrations.md
│   └── seeders.md
├── phases/                            # Dokumentasi per fase
│   ├── phase-1-core-system.md
│   ├── phase-2-mikrotik-integration.md
│   ├── phase-3-customer-management.md
│   ├── phase-4-live-monitoring.md
│   ├── phase-5-payment-gateway.md
│   └── phase-6-geniacs-integration.md
├── api/                               # API Documentation
│   ├── authentication.md
│   ├── mikrotik.md
│   ├── customers.md
│   ├── monitoring.md
│   ├── payments.md
│   └── geniacs.md
├── deployment/                        # Deployment guide
│   ├── environment-setup.md
│   ├── production-deployment.md
│   └── monitoring.md
└── testing/                          # Testing requirements
    ├── unit-testing.md
    ├── integration-testing.md
    └── end-to-end-testing.md
```

## Development Roadmap

Sistem ini dikembangkan dalam 6 fase yang dapat diimplementasikan secara bertahap:

1. **Fase 1**: Core System & User Management
2. **Fase 2**: MikroTik Integration & NAS Management
3. **Fase 3**: Customer Management & Mapping
4. **Fase 4**: Live Monitoring System
5. **Fase 5**: Payment Gateway Integration
6. **Fase 6**: Geniacs Integration

Setiap fase dirancang untuk dapat berdiri sendiri dan langsung dapat digunakan tanpa menunggu fase lain selesai.

## Quick Start

1. Clone repository
2. Install dependencies: `composer install` dan `npm install`
3. Setup environment: `cp .env.example .env`
4. Run migrations: `php artisan migrate`
5. Start development server: `php artisan serve` dan `npm run dev`

## Requirements

- PHP 8.1+
- Node.js 16+
- MySQL 8.0+ / PostgreSQL 13+
- Redis 6+
- Composer
- NPM/Yarn

## Contributing

Setiap developer diharapkan membaca dokumentasi fase yang sedang dikerjakan dan mengikuti guidelines yang telah ditentukan.

## License

MIT License