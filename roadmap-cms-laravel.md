# 🛣️ Roadmap CMS Laravel (Seperti WordPress)
**Tanggal Pembuatan:** 09 April 2025
**Estimasi Penyelesaian:** November 2025
**Framework:** Laravel 11.x + Filament 3.x
**Status Proyek:** Dalam Pengerjaan
**Project Manager:** [Nama PM]
**Lead Developer:** [Nama Lead]

## 📋 Ringkasan Proyek
CMS Laravel ini bertujuan menyediakan alternatif WordPress dengan pendekatan modern menggunakan Laravel dan Filament. Fokus utama pada performa, keamanan, dan kemudahan pengembangan plugin/tema.

## 🛠️ Quick Start (Mulai Hari Ini: 9 April 2025)

```bash
1. Install Laravel
composer create-project laravel/laravel cms-laravel
cd cms-laravel

2. Install Modul Support
composer require nwidart/laravel-modules
php artisan vendor:publish --provider="Nwidart\Modules\LaravelModulesServiceProvider"

3. Install Admin Panel – Filament
composer require filament/filament:^3.3
php artisan vendor:publish --provider="Filament\FilamentServiceProvider"
php artisan filament:install

4. Setup Role & Permission
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate

5. Buat Modular Struktur Awal
php artisan module:make Blog
php artisan module:make Page
php artisan module:make Setting
php artisan module:make Media

```

**Langkah Selanjutnya:**
1. Buat model dan migrasi untuk Post, Category, Tag
2. Setup Filament Resource untuk Blog
3. Implementasikan Permission untuk Admin panel

## 🎯 Strategi Pengembangan
1. **Pendekatan Modular** - Semua fitur dikembangkan sebagai modul independen
2. **API-First** - Semua fungsi memiliki REST API endpoint
3. **Testing-Driven** - Unit dan integration test untuk semua fitur utama
4. **Design System** - Menggunakan Tailwind CSS dan komponen Filament yang konsisten

## 📊 Database Schema

### Core Tables
| **Table** | **Description** | **Relations** |
|-----------|-----------------|---------------|
| `users` | User information | hasMany posts, pages |
| `roles` | User roles | belongsToMany users, permissions |
| `permissions` | Available permissions | belongsToMany roles |
| `posts` | Blog posts | belongsTo user, belongsToMany categories, tags |
| `categories` | Content categories | belongsToMany posts |
| `tags` | Content tags | belongsToMany posts |
| `pages` | Static pages | belongsTo user |
| `media` | Uploaded files | morphTo mediable |
| `settings` | Global settings | - |
| `menus` | Navigation menus | hasMany menu_items |
| `menu_items` | Menu entries | belongsTo menu, hasMany children |

### Advanced Tables
| **Table** | **Description** | **Relations** |
|-----------|-----------------|---------------|
| `page_blocks` | Page builder blocks | belongsTo page, hasMany block_attributes |
| `block_attributes` | Block content data | belongsTo page_blocks |
| `plugins` | Registered plugins | - |
| `revisions` | Content version history | morphTo revisionable |
| `form_submissions` | Form entries | belongsTo form |
| `notifications` | User notifications | belongsTo user |

## 🧱 Fase 1 – Core CMS (Minggu 1-2)
✅ *Tujuan: CMS dasar siap dipakai untuk blog dan halaman statis.*

- [x] **Instalasi & Struktur Modular** (2 hari)
  - [x] Setup Laravel dan Filament (`composer create-project laravel/laravel cms-laravel`)
  - [x] Instalasi nwidart/laravel-modules (`composer require nwidart/laravel-modules`)
  - [x] Konfigurasi struktur autoload di `composer.json`
  - [x] Setup database dan environment (`.env`)

- [ ] **Auth & Role Permission** (1 hari)
  - [ ] Setup login dan registrasi (Filament Shield atau Laravel Breeze)
  - [ ] Implementasi Spatie Permission (`composer require spatie/laravel-permission`)
  - [ ] Konfigurasi role Admin, Editor, Author dengan permissions
  - [ ] Membuat middleware untuk permission check

- [x] **Modul Blog** (3 hari)
  - [x] CRUD Post dengan fields: title, content, excerpt, featured_image
  - [x] Status post: draft/scheduled/published
  - [x] Kategori (hierarchical) dan tag management (flat)
  - [x] Slug generation dengan unique constraint
  - [x] Integrasi editor Markdown/WYSIWYG (TinyMCE/TipTap)
  - [x] Featured image selection dengan Media Library

- [ ] **Modul Page** (2 hari)
  - [ ] CRUD halaman statis
  - [ ] Sistem drag ke menu

- [ ] **Modul Media Manager** (2 hari)
  - [ ] Upload gambar/file
  - [ ] Integrasi MediaLibrary Spatie

- [ ] **Modul Setting & Menu** (2 hari)
  - [ ] Global settings (logo, site name) 
  - [ ] Menu builder interface

- [ ] **Modul Tema** (1 hari)
  - [ ] Load tema dari folder `themes/mytheme`
  - [ ] Setting tema aktif

- [ ] **Testing & QA** (1 hari)
  - [ ] Pengujian unit dan integrasi
  - [ ] Bug fixing

**Milestone Deliverable:** MVP CMS dengan kemampuan mengelola konten blog dan halaman statis

**Kriteria Penyelesaian:**
- [x] Repository Git diinisialisasi dengan struktur proyek dasar
- [ ] Semua modul dasar (Blog, Page, Media, Menu) berfungsi dengan 100% test coverage pada model dan repository
- [ ] Admin panel dapat diakses dengan role-based permissions (test dengan 3 role berbeda)
- [ ] Tema dasar responsive dapat menampilkan post dan page dengan optimasi mobile
- [ ] Performa load time < 1 detik untuk halaman blog list
- [ ] Database migrations dan seeders lengkap untuk demo content

**Tantangan Teknis:**
- Memastikan struktur modular yang fleksibel tetapi tetap performa tinggi
- Memisahkan logic admin panel dan frontend theme dengan benar

## 📝 Definition of Done

Untuk memastikan konsistensi kualitas di setiap fitur yang dikembangkan, sebuah fitur dianggap "selesai" jika memenuhi kriteria berikut:

1. **Fungsionalitas Lengkap**
   - Semua acceptance criteria terpenuhi
   - Edge cases tertangani

2. **Kode Berkualitas**
   - Mengikuti coding standards
   - Unit tests mencakup minimal coverage target
   - Tidak ada warning dari static analyzer

3. **Dokumentasi**
   - Code documentation (PHPDoc) lengkap 
   - API endpoints terdokumentasi (jika ada)
   - Update README atau wiki jika diperlukan

4. **Review**
   - Code review oleh minimal 1 developer lain
   - Semua feedback code review ditangani

5. **Deployable**
   - Dapat diinstall pada environment baru
   - Tidak ada conflict dengan fitur lain
   - Database migrations berjalan tanpa error

## 🚀 Fase 2 – Advanced Features (Minggu 3-5)
✅ *Tujuan: Menambahkan fitur yang memperkaya konten dan pengelolaan.*

- [ ] **Modul SEO** (2 hari)
  - [ ] Custom title dan meta description
  - [ ] OpenGraph tags
  - [ ] Sitemap generator (spatie/laravel-sitemap)

- [ ] **Modul Page Builder JSON** (4 hari)
  - [ ] Editor blok konten dinamis
  - [ ] Komponen: text, image, video, column
  - [ ] Sistem drag-n-drop dengan Livewire dan Alpine.js

- [ ] **Theme Dynamic Layout** (3 hari)
  - [ ] Sistem layout theme
  - [ ] Section injection dari builder
  - [ ] Custom blade components

- [ ] **Plugin System** (3 hari)
  - [ ] Sistem aktivasi/deaktivasi plugin via UI
  - [ ] Event hooks untuk plugin
  - [ ] Plugin dependencies management

- [ ] **REST API (Headless)** (3 hari)
  - [ ] API endpoints untuk post, page, media
  - [ ] Authentication dengan Laravel Sanctum
  - [ ] Rate limiting dan dokumentasi API

- [ ] **Dashboard Analytics (basic)** (2 hari)
  - [ ] Statistik pengunjung (charts dengan ApexCharts)
  - [ ] Metrics post/page dan interaksi

- [ ] **Testing & QA** (2 hari)
  - [ ] Unit dan integrasi testing
  - [ ] Pengujian API endpoints

**Milestone Deliverable:** CMS dengan kemampuan headless dan page builder dinamis

**Kriteria Penyelesaian:**
- [ ] Page builder dapat membuat layout kompleks dengan komponen dinamis
- [ ] REST API endpoints terdokumentasi dan teruji
- [ ] Tema dapat menerima konten dari page builder
- [ ] Plugin dapat diaktifkan/nonaktifkan tanpa restart aplikasi

**Tantangan Teknis:**
- Mendesain page builder yang intuitif namun fleksibel
- Memastikan kinerja API tetap cepat dengan caching yang tepat

## 🔧 Fase 3 – Admin UX & Power Tools (Minggu 6-7)
✅ *Tujuan: Meningkatkan kenyamanan dan kekuatan admin panel.*

- [ ] **Editor Multibahasa** (3 hari, opsional)
  - [ ] Support konten multi-bahasa
  - [ ] Integrasi dengan Spatie Translatable

- [ ] **Modul Backup & Restore** (2 hari)
  - [ ] Backup ke zip dengan spatie/laravel-backup
  - [ ] Backup ke cloud storage (S3, Google Drive)
  - [ ] Jadwal backup otomatis

- [ ] **Media Gallery** (2 hari)
  - [ ] UI galeri koleksi gambar
  - [ ] Organisasi media dengan folder
  - [ ] Image editor basic

- [ ] **File Manager UI** (3 hari, opsional)
  - [ ] File browser dengan elFinder
  - [ ] Upload dan organize files

- [ ] **Notification System** (2 hari)
  - [ ] Notifikasi di admin panel
  - [ ] Email notifications untuk events penting
  - [ ] Notification preferences

- [ ] **Testing & QA** (2 hari)
  - [ ] User acceptance testing
  - [ ] Bug fixing dan performance improvement

**Milestone Deliverable:** CMS dengan UX admin yang intuitif dan tools pengelolaan konten komprehensif

**Kriteria Penyelesaian:**
- [ ] UI admin konsisten dan responsif di semua perangkat
- [ ] Backup/restore berfungsi dengan aman tanpa downtime
- [ ] User dapat mengelola notifikasi sesuai preferensi
- [ ] Media gallery mendukung berbagai format file

**Kebutuhan UX Research:**
- User testing untuk alur kerja admin panel
- Pengujian performa pada perangkat mobile

## 🧠 Fase 4 – Plugin & Theme Marketplace (Minggu 8+)
✅ *Tujuan: Menjadikan CMS sebagai platform yang bisa dikembangkan oleh user.*

- [ ] **Installer Plugin via ZIP** (3 hari)
  - [ ] Upload plugin ZIP
  - [ ] Extract otomatis ke folder `Modules`
  - [ ] Validasi plugin compatibility

- [ ] **Installer Theme via ZIP** (2 hari)
  - [ ] Upload tema ZIP
  - [ ] Extract otomatis ke `resources/views/themes`
  - [ ] Preview tema sebelum aktivasi

- [ ] **Hooks/Events System** (4 hari)
  - [ ] Sistem event/listener untuk extend behavior plugin
  - [ ] Action/filter hooks seperti WordPress
  - [ ] Dokumentasi hooks

- [ ] **Marketplace Integrasi** (4 hari)
  - [ ] Sistem katalog plugin & tema
  - [ ] API client untuk marketplace eksternal
  - [ ] One-click install dari marketplace

- [ ] **Testing & QA** (2 hari)
  - [ ] Plugin compatibility testing
  - [ ] Security review untuk installer

**Milestone Deliverable:** Ekosistem ekstensible untuk pengembangan plugin dan tema

**Kriteria Penyelesaian:**
- [ ] Plugin dapat diinstall via ZIP dengan validasi keamanan
- [ ] System hooks terdokumentasi untuk pengembang eksternal
- [ ] Marketplace memiliki rating dan review system
- [ ] Plugin dapat di-update secara otomatis

**Keamanan:**
- Code review semua installer plugin/tema
- Validasi signature plugin untuk mencegah malware

## 🐛 Risk Management

| **Risiko** | **Impact** | **Probability** | **Mitigasi** |
|------------|------------|-----------------|--------------|
| Kompleksitas struktur modular memperlambat development | High | Medium | Prototype awal, dokumentasi arsitektur yang jelas |
| Integrasi Filament dengan sistem modular bermasalah | Medium | Medium | Riset awal, pattern alternatif jika diperlukan |
| Performa page builder menurun dengan komponen kompleks | High | Low | Caching strategy, lazy loading komponen |
| Konflik plugin dari marketplace | Medium | High | Namespace isolation, sandbox testing untuk plugin |
| Scaling database dengan konten besar | High | Medium | Indexing strategy, database sharding untuk multisite |

## 🏁 Fase Opsional (Enterprise)

- [ ] **User CMS Multisite** (Prioritas: Medium, Kompleksitas: Tinggi)
  - [ ] Setup subdomain/subfolder otomatis
  - [ ] Cross-site content sharing
  - [ ] Multisite admin dashboard

- [ ] **Form Builder** (Prioritas: High, Kompleksitas: Medium)
  - [ ] Drag and drop form builder
  - [ ] Form submissions storage
  - [ ] Export dan notifikasi hasil form

- [ ] **Newsletter Integration** (Prioritas: Medium, Kompleksitas: Low)
  - [ ] Integrasi dengan Mailchimp / SMTP
  - [ ] Template newsletter builder
  - [ ] Subscriber management

- [ ] **Page Revision** (Prioritas: High, Kompleksitas: Medium)
  - [ ] History versi halaman/post
  - [ ] Compare revisions
  - [ ] Restore ke versi sebelumnya

- [ ] **Workflow Editor** (Prioritas: Low, Kompleksitas: High)
  - [ ] Sistem approval workflow untuk publikasi
  - [ ] Multi-level review
  - [ ] Notifikasi workflow

- [ ] **Testing & QA** (Prioritas: High, Kompleksitas: Medium)
  - [ ] End-to-end testing
  - [ ] Performance dan load testing

**Pertimbangan Implementasi:** Form Builder dan Page Revision diimplementasikan lebih dulu karena prioritas tinggi

**Kriteria Evaluasi Enterprise:**
- Skalabilitas untuk jutaan konten
- Kinerja di bawah beban tinggi (high traffic)
- Dukungan multi-tenant yang aman

## ✨ Tools & Paket Disarankan

| **Tujuan**            | **Paket Laravel**                        | **Versi** | **Status**     |
|-----------------------|-------------------------------------------|-----------|----------------|
| Modular CMS           | `nwidart/laravel-modules`                | ^10.0     | [ ] Belum Terinstall |
| Admin Panel           | `filament/filament`                      | ^3.0      | [ ] Belum Terinstall |
| Role & Permission     | `spatie/laravel-permission`              | ^6.0      | [ ] Belum Terinstall |
| Media & Upload        | `spatie/laravel-medialibrary`            | ^11.0     | [ ] Belum Terinstall |
| Backup                | `spatie/laravel-backup`                  | ^8.0      | [ ] Belum Terinstall |
| Builder JSON render   | `livewire`, `alpinejs`                   | ^3.0      | [ ] Belum Terinstall |
| API & Auth            | `laravel/sanctum`                        | ^3.2      | [ ] Belum Terinstall |
| Testing               | `phpunit/phpunit`, `pestphp/pest`        | ^10.0     | [ ] Belum Terinstall |

**Setup Infrastruktur:**
- [ ] CI/CD Pipeline dengan GitHub Actions
- [ ] Monitoring dengan Sentry.io 
- [ ] Development environment dengan Laravel Sail/Docker

## 🛠 Development Setup

### Persyaratan Sistem
- PHP 8.2+
- MySQL 8.0+ / PostgreSQL 14+
- Node.js 18+ dan NPM/Yarn
- Composer 2.5+
- Redis (opsional, untuk caching)

### Setup Development Environment
```bash
# Clone repository
git clone [repository-url] cms-laravel

# Install dependencies
cd cms-laravel
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate
php artisan storage:link

# Setup database
php artisan migrate
php artisan db:seed
```

### Struktur Direktori
```
CMS/
├── app/                   # Laravel core
├── bootstrap/             # Laravel bootstrap
├── config/                # Konfigurasi aplikasi
├── database/              # Migrasi dan seeds
├── Modules/               # Modul-modul CMS
│   ├── Blog/              # Modul blog
│   ├── Page/              # Modul halaman
│   └── ...                # Modul lainnya
├── public/                # Public assets
├── resources/             # Frontend resources
│   └── views/
│       └── themes/        # Theme files
├── routes/                # API & web routes
└── tests/                 # Unit & feature tests
```

## 📝 Standar Kode & Guidelines

### Coding Standards
- PSR-12 untuk PHP
- ESLint standard untuk JavaScript
- Laravel naming conventions

### Workflow Git
- `main` - production code
- `develop` - integration branch
- `feature/*` - feature branches
- Pull request wajib untuk semua perubahan

### Review & Quality Assurance
- Code review untuk semua PR
- Unit testing minimal 70% coverage
- Static analysis dengan PHPStan level 5
- Laravel Pint untuk formatting

## 📊 Monitoring & Performance

### Metrics Yang Dimonitor
- Response time halaman (<500ms target)
- Query database performance (max 10 queries per page)
- Cache hit ratio (target >80%)
- Memory usage (<50MB per request)

### Performance Baseline
| **Halaman** | **Target Load Time** | **Max Query Count** | **Cache Strategy** |
|-------------|----------------------|--------------------|-------------------|
| Homepage    | <500ms               | 5                  | Full page (1h)    |
| Blog List   | <800ms               | 10                 | Partial (30m)     |
| Single Post | <600ms               | 8                  | Partial (15m)     |
| Admin Panel | <1.2s                | 20                 | None              |

### Tools Monitoring
- Laravel Telescope untuk development
- Sentry.io untuk production errors
- Blackfire.io untuk profiling

## 📅 Timeline dan Sprint Planning

| **Sprint** | **Tanggal** | **Fokus** | **Deliverable** |
|------------|-------------|-----------|----------------|
| Sprint 1   | 10-24 Apr   | Core Setup & Blog | Struktur modular + Blog module |
| Sprint 2   | 25 Apr-9 May | Pages & Media | Page CRUD + Media Library |
| Sprint 3   | 10-24 May   | Settings & Theme | Settings panel + Basic theme |
| Sprint 4   | 25 May-9 Jun | SEO & API | SEO tooling + REST API basic |
| Sprint 5   | 10-24 Jun   | Page Builder | Dynamic page builder |

### Weekly Review Schedule
- Code review: Setiap Jumat, 14:00-16:00
- Demo progress: Setiap Senin, 10:00-11:00
- Retrospective: Bi-weekly, Jumat terakhir sprint

## 🐞 Bug Tracking & Issue Management

### Severity Levels
- **Critical**: Menghentikan fungsi utama CMS, harus diperbaiki dalam 24 jam
- **Major**: Mengganggu fitur penting, diperbaiki dalam 72 jam
- **Minor**: Bug kecil, diperbaiki dalam sprint berikutnya
- **Cosmetic**: UI/UX issue, dikelompokkan untuk perbaikan batch

### Issue Template
```
## Deskripsi
[Deskripsikan bug/fitur]

## Steps to Reproduce (untuk bugs)
1. 
2. 
3. 

## Expected vs Actual Behavior
**Expected**: 
**Actual**: 

## Screenshots / Logs

## Environment
- Browser: 
- OS: 
- Laravel version: 
```

## 🧪 Testing Strategy

### Unit Testing
- Models: 100% coverage
- Repositories: 100% coverage
- Services: 90% coverage
- Controllers: 80% coverage

### Feature Testing
- Critical user flows
- Admin CRUD operations
- Authentication flows

### Browser Testing
- Homepage across devices
- Admin panel responsiveness
- Cypress untuk end-to-end tests

## 📚 Dokumentasi

### Dokumentasi Eksternal
- [ ] User Guide (admin panel usage)
- [ ] Developer API Reference
- [ ] Plugin Development Guide
- [ ] Theme Development Guide

### Dokumentasi Internal
- [ ] Diagram arsitektur sistem
- [ ] Database schema documentation
- [ ] Deployment procedures
- [ ] Troubleshooting guide

## ⚙️ DevOps & Deployment

### CI/CD Pipeline
- [ ] GitHub Actions untuk automated testing
- [ ] Automated deployment ke staging
- [ ] Semantic versioning untuk releases

### Environments
- Development (local)
- Staging (UAT)
- Production

### Backup Strategy
- Daily database backups
- Weekly full system backups
- Retention policy: 30 hari
