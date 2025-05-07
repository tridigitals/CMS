# 🚀 Roadmap CMS Laravel + React: Menuju Website Powerful & Modern

## 1. 📌 Informasi Proyek
| **Informasi**         | **Detail**                                  |
|-----------------------|---------------------------------------------|
| **Tanggal Mulai**     | 11 April 2025                               |
| **Target Selesai**    | November 2025                               |
| **Framework**         | Laravel 12.x + React 19 + Inertia.js        |
| **Status**            | Dalam Pengerjaan                            |
| **Project Manager**   | [Isi Nama PM]                               |
| **Lead Developer**    | [Isi Nama Lead]                             |
| **Starter Kit**       | [Laravel React Starter Kit](https://github.com/laravel/react-starter-kit) |
| **Deployment Target** | VPS/Docker/Cloud (CI/CD Otomatis)           |

---

## 2. 🎯 Visi & Tujuan
Membangun CMS modern, modular, dan scalable berbasis Laravel & React, setara atau lebih baik dari WordPress:
- **Performa tinggi** (load < 500ms)
- **Keamanan enterprise**
- **Ekstensi mudah (plugin & tema)**
- **UI/UX modern & responsif**
- **Developer experience terbaik**

---

## 3. 👤 Persona & User Story
- **Admin:** Mengelola konten, user, plugin, tema, dan pengaturan.
- **Editor:** Membuat & mengedit post/page, mengelola media.
- **Developer:** Membuat plugin/tema, mengakses API, mengembangkan fitur baru.
- **End User:** Menikmati website cepat, aman, dan mudah dinavigasi.

---

## 4. 🗺️ Strategi Pengembangan

### a. Arsitektur Modular
- Monorepo: Backend (Laravel) & Frontend (React) dalam satu repo.
- Modular: Fitur utama (post, page, media, user, plugin, theme) sebagai modul terpisah.
- Plugin/Themes API: Standar API untuk ekstensi pihak ketiga.

### b. Teknologi Kunci
- **Laravel 12.x**: Backend, API, Auth, Permission, Modular
- **React 19 + Inertia.js**: SPA, UI modern, SSR opsional
- **TypeScript**: Type safety, DX
- **RadixUI, shadcn/ui, TailwindCSS**: Komponen UI modern
- **Spatie Packages**: Permission, Media, Settings, Backup, Sitemap, Translatable
- **Nwidart Modules**: Plugin system
- **Lighthouse**: GraphQL API
- **Sanctum**: API Auth
- **Jest, React Testing Library, PHPUnit, Dusk**: Testing

### c. Standar Kode & DevOps
- PSR-12, Prettier, ESLint, Pint
- CI/CD: Test, build, deploy otomatis (GitHub Actions/GitLab CI)
- Zero-downtime deployment
- Monitoring: Sentry, Laravel Telescope, error boundary React

---

## 5. 🧱 Database & Fitur Inti

### a. Skema Database
- **User, Role, Permission** (Spatie)
- **Post, Category, Tag, Page**
- **Media, Menu, Menu Item**
- **Plugin, Theme, Revision, Setting**
- **Page Block, Block Attribute**
- **Multisite (opsional), E-Commerce (opsional), AI Tools (opsional)**

### b. Fitur Utama
- CRUD Post/Page/Media/Menu
- Modular plugin & theme
- Page builder (drag & drop)
- SEO & Analytics dashboard
- Multi-language & RTL support
- Advanced media management
- REST & GraphQL API
- Security: 2FA, rate limiting, audit log
- Backup & restore
- Performance & cache management
- Spatie Media Library integration for media management
- Slugs for SEO-friendly URLs
- Meta descriptions and keywords for SEO
- Tagging functionality using Spatie's laravel-tags
- Support for featured images
- WYSIWYG editor for content creation
- Support for categories
- Social sharing buttons
- Support for comments
- Sitemap generator
- Structured data markup (Schema.org)
- Open Graph meta tags for social media sharing

---

## 6. 🏗️ Timeline, Deliverable & Breakdown Task

### Fase 1: Core CMS (2 minggu)
**Minggu 1**
- [x] Hari 1: Integrasi starter kit, setup repo, konfigurasi Vite & Tailwind
- [x] Hari 2: Setup autentikasi, role, permission (Spatie)
- [x] Hari 3: CRUD User
- [x] Hari 3: CRUD Role
- [x] Hari 3: CRUD Permission
- [x] Hari 4: CRUD Category (model, migration, controller, React form)
- [x] Hari 4: CRUD Tag (model, migration, controller, React form)
- [x] Hari 4: CRUD Post (model, migration, controller, React form) dengan fitur :
    Use Spatie's Media Library for managing media associated with posts.
    Implement slugs for SEO-friendly URLs.
    Add meta descriptions and keywords for SEO.
    Implement tagging functionality using Spatie's laravel-tags.
    Add support for featured images.
    Implement a WYSIWYG editor for content creation.
    Add support for categories.
    Implement social sharing buttons.
    Add support for comments.
    Implement a sitemap generator.
    Implement structured data markup (Schema.org) for better search engine understanding.
    Implement Open Graph meta tags for social media sharing.
- [x] Hari 5: CRUD Page (model, migration, controller, React form)
  - Buat model, migration, dan controller untuk pages.
  - Buat form CRUD Page di React.
  - **Dual Editor System:**
    - Classic Editor dengan TinyMCE untuk editing konten sederhana
    - Page Builder dengan GrapesJS untuk layout yang lebih kompleks
    - Implementasi selector untuk memilih tipe editor
    - Simpan tipe editor yang digunakan di database
  - **TinyMCE Integration:**
    - Setup TinyMCE dengan konfigurasi dasar
    - Plugins untuk table, lists, media, dan fitur umum lainnya
    - Integrasi dengan Media Library untuk upload gambar
  - **GrapesJS Page Builder:**
    - Implementasi GrapesJS untuk mengedit konten body halaman
    - Header dan footer tetap mengikuti template utama website
    - Simpan hasil body builder (HTML) ke database
    - Saat render page, gabungkan header/footer dari template dengan konten
    - Custom blocks dan komponen untuk GrapesJS
- [x] Hari 6: CRUD Media (Enhanced with Spatie MediaLibrary and React Dropzone)
  - Automated Media Optimization: Implement image processing (e.g., using Spatie Image) to automatically compress, resize, and optimize media uploads for better performance.
  - Advanced Metadata and Tagging: Add custom metadata fields (e.g., alt text, captions) and integrate with existing tagging system for improved accessibility and searchability.
  - Frontend UX Improvements: Upgrade React Dropzone with features like multi-file uploads, progress bars, and previews using modern React components.
  - Security Enhancements: Add file validation, sanitization, and signed URLs to prevent malicious uploads and enhance security.
  - Seamless Integration and Extensibility: Make media CRUD modular with hooks for plugins, allowing custom media types and behaviors for future extensibility.
  
- [x] Hari 7: CRUD Menu & Menu Item, integrasi ke layout
  - **Database Structure:**
    - Tabel `menus`: id, name, slug, description, location, timestamps
    - Tabel `menu_items`: id, menu_id, parent_id, title, url, type, order, target, icon, timestamps
  - **Model & Relationship:**
    - Menu hasMany MenuItem
    - MenuItem belongsTo Menu
    - MenuItem self-referencing (parent_id) untuk nested menu
  - **Migration:**
    - Buat migration untuk `menus` dan `menu_items` dengan relasi dan index yang tepat
  - **Controller & CRUD Logic:**
    - MenuController: CRUD Menu (list, create, edit, delete)
    - MenuItemController: CRUD Menu Item (add, edit, delete, reorder, support nested)
    - Validasi loop parent-child dan url
  - **Frontend (React/TypeScript):**
    - Halaman Manajemen Menu: List, tambah/edit/hapus menu
    - Menu Item Builder: drag-and-drop, form tambah/edit item, autocomplete link Page/Post/Category
    - Visualisasi tree view, inline edit & reorder, konfirmasi hapus
  - **Integrasi ke Layout:**
    - Helper backend untuk nested menu
    - Render menu di layout (main, footer, dsb)
    - Support update dinamis dan cache
  - **API/Route:**
    - RESTful API CRUD Menu & Menu Item
    - Route frontend untuk get menu by location/slug
  - **Testing:**
    - Unit test model, migration, controller
    - Integration test drag-and-drop dan parent-child
  - **Saran & Best Practice:**
    - Support nested menu, flexible type, reorder & nesting, location-based rendering, cache output, extensible, SEO friendly

**Minggu 2**
- [x] Hari 8: UI dasar (RadixUI, shadcn/ui), layout, theme switcher
- [x] Hari 9: Integrasi Inertia.js, routing, protected route
- [x] Hari 10: Testing unit (PHPUnit), testing komponen React
- [x] Hari 11: Responsive design, dark/light mode
- [x] Hari 12: Review & refactor kode
- [x] Hari 13: Dokumentasi awal (README, struktur folder)
- [x] Hari 14: Internal demo, feedback, perbaikan

**Deliverable:** CMS dasar siap CRUD, UI responsif, role & permission berjalan

---

### Fase 2: Modular & Plugin System (2 minggu)
**Minggu 3 — Fokus: Setup Modular, Plugin, dan Theme System**

### Hari 15: Setup Struktur Modular (Plugin/Theme Separation)
- Install nwidart/laravel-modules:
  ```bash
  composer require nwidart/laravel-modules
  php artisan vendor:publish --provider="Nwidart\Modules\LaravelModulesServiceProvider"
  ```
- Buat folder modular:
  ```
  Modules/         # Untuk plugin
  themes/          # Untuk theme (manual, tidak pakai Nwidart)
  ```
- Buat contoh module plugin:
  ```bash
  php artisan module:make ContactForm
  ```
- Folder theme tetap dibuat manual seperti:
  ```
  themes/default/
  ├── views/
  ├── assets/
  └── theme.json
  ```

### Hari 16: Plugin System dan Hook Engine
- Buat sistem plugin registry:
  - Scan otomatis module aktif di Modules/
  - Simpan info plugin aktif di tabel plugins
  - Plugin bisa diaktifkan/nonaktifkan dari admin panel
- Buat sistem hook sederhana:
  - Fungsi add_action($hook, $callback)
  - Fungsi do_action($hook, $params)
  - Hook digunakan untuk plugin masuk ke theme, sidebar, menu, dll

### Hari 17: Theme System Implementation (Manual, Non-Nwidart)
- Struktur dasar:
  - Buat class ThemeManager di app/Services/ThemeManager.php
  - Tambahkan ThemeServiceProvider untuk inject view path dinamis dari theme aktif
  - Buat themes dan theme_options table:
    ```php
    themes: id, name, slug, type (blade/react), author, version, status
    theme_options: id, theme_id, key, value
    ```
  - Template hierarchy:
    - Seperti WordPress, cari page-{slug}.blade.php, fallback ke page.blade.php
  - Integrasi ke modul:
    - Pages, Posts, dan Menus harus bisa dirender melalui theme view
  - Buat Theme API:
    - Endpoint publik untuk render page/post menggunakan theme view

### Hari 18: Theme Customizer dan Frontend Renderer
- Buat halaman admin untuk Theme Customizer:
  - Form untuk mengubah theme_options seperti warna, font, logo
  - Tambahkan fitur Live Preview:
    - Simpan perubahan sementara ke session
    - Preview layout langsung tanpa menyimpan ke database
  - Buat sistem widget/area:
    - Misal: sidebar, footer, header-right
    - Gunakan hook untuk injeksi widget dari plugin
  - Hook system di theme:
    - Allow do_action('theme.head'), do_action('theme.sidebar'), dll
  - Buat BlockRenderer:
    - Render builder block dari database untuk page-builder

### Hari 19: Page Builder Integration
- Buat drag & drop page builder:
  - Gunakan React (di admin panel)
  - Integrasi dengan Laravel backend via API
  - Buat blocks table:
    ```php
    blocks: id, name, slug, config_schema, render_view
    ```
  - Buat block registry:
    - Mirip plugin hook: register block lewat plugin/theme
    - Tiap block punya partial blade atau komponen React untuk render
  - Integrasi ke page CRUD:
    - Saat user edit halaman, builder bisa digunakan
    - Simpan struktur block di field content_json
  - Preview system:
    - Builder bisa preview langsung di halaman dengan theme yang aktif

### Hari 20: Media Manager Lanjutan
- Tambah fitur:
  - Kategori media
  - Bulk delete/upload
  - Integrasi media dengan editor WYSIWYG
  - Plugin bisa gunakan media browser

### Hari 21: Testing & Integrasi Final
- Pastikan:
  - Plugin bisa hook ke theme (sidebar/menu)
  - Theme bisa menggunakan data dari modul Pages & Posts
  - Builder berfungsi untuk generate halaman frontend
  - Admin bisa aktifkan theme atau plugin dari UI
- Buat dokumentasi untuk:
  - Menambahkan plugin
  - Membuat theme baru
  - Menambahkan custom block

## Bonus Rekomendasi
- Gunakan App\Providers\ThemeServiceProvider untuk inject view path berdasarkan theme aktif
- Buat facade Theme::view('home') agar lebih rapi
- Jika ingin React-based theme, buat render.blade.php yang load 1 file React SPA (komunikasi via API)

---

### Fase 3: API, SEO, Analytics (2 minggu)
**Minggu 5**
- Hari 26: REST API endpoint (Laravel Resource, QueryBuilder)
- Hari 27: GraphQL API (Lighthouse), schema utama
- Hari 28: API Auth (Sanctum), rate limiting, caching
- Hari 29: SEO tools (meta, sitemap, OG, Twitter Card)
- Hari 30: Integrasi SEO ke post/page

**Minggu 6**
- Hari 31: Analytics dashboard (React chart, metrics)
- Hari 32: Dokumentasi API (Swagger, Postman)
- Hari 33: User guide, developer guide
- Hari 34: E2E testing (Dusk)
- Hari 35: Review, refactor, optimasi performa
- Hari 36: Internal demo, feedback, perbaikan

**Deliverable:** API siap, SEO & analytics aktif, dokumentasi lengkap

---

### Fase 4: Ekstensi & Marketplace (2 minggu)
**Minggu 7**
- Hari 37: Plugin/theme marketplace backend (model, migration, API)
- Hari 38: Marketplace UI (React, listing, install/update)
- Hari 39: Community tools (comment, form builder, newsletter)
- Hari 40: Multisite (opsional): arsitektur, domain/subdomain
- Hari 41: E-commerce (opsional): produk, cart, order, payment
- Hari 42: AI content tools (opsional): integrasi API AI

**Minggu 8**
- Hari 43: Security & performance audit, backup & restore
- Hari 44: Review, refactor, optimasi akhir
- Hari 45: UAT (User Acceptance Test) checklist
- Hari 46: Final demo, feedback, perbaikan
- Hari 47: Deployment ke staging/production
- Hari 48: Retrospective & roadmap update

**Deliverable:** Marketplace aktif, fitur komunitas, multisite/e-commerce/AI (jika dipilih), audit selesai

---

## 7. 🛡️ Risiko & Mitigasi

| **Risiko**                | **Mitigasi**                                 |
|---------------------------|----------------------------------------------|
| Integrasi plugin gagal    | Standar API, test coverage tinggi            |
| Performa lambat           | Cache, query optimization, SSR, CDN          |
| Keamanan                  | Audit rutin, 2FA, rate limit, backup         |
| Developer onboarding      | Dokumentasi lengkap, code generator, guide   |
| Fitur terlalu banyak      | Prioritas milestone, feedback rutin          |

---

## 8. 📦 Tools & Dependensi

### Starter Kit
- `laravel/framework`, `inertiajs/inertia-laravel`, `@inertiajs/react`, `react`, `vite`, `typescript`, `radix-ui`, `shadcn/ui`, `tailwindcss`, `eslint`, `prettier`, `pint`, `jest`, `react-testing-library`

### Tambahan
- `spatie/laravel-permission`, `spatie/laravel-medialibrary`, `spatie/laravel-settings`, `spatie/laravel-backup`, `spatie/laravel-sitemap`, `spatie/laravel-translatable`
- `nwidart/laravel-modules`, `tiptap/core`, `react-dropzone`, `nuwave/lighthouse`, `spatie/laravel-query-builder`, `laravel/sanctum`

---

## 9. 📝 Standar & Dokumentasi

- **Code:** PSR-12, Prettier, ESLint, Pint, TypeScript strict
- **Testing:** PHPUnit, Jest, React Testing Library, Dusk
- **Dokumentasi:** PHPDoc, TSDoc, Storybook, API docs, user guide
- **CI/CD:** Test, build, deploy otomatis

---

## 10. 📊 Metrik Keberhasilan

| **Metrik**           | **Target**                |
|----------------------|--------------------------|
| Page load            | < 500ms                  |
| Server response      | < 200ms                  |
| Test coverage        | > 80%                    |
| Error rate           | < 0.1%                   |
| Active user          | > 500/bulan              |
| Plugin/theme aktif   | > 5/site                 |
| Backup success       | 100%                     |
| Cache hit rate       | > 90%                    |

---

## 11. 🔄 Feedback & Iterasi

- Review mingguan dengan stakeholder
- Uji coba user (admin/editor/developer)
- Feedback loop setiap akhir fase
- Perbaikan & iterasi roadmap

---

## 12. 📎 Lampiran

- [ ] Wireframe/mockup UI utama (link Figma/Whimsical)
- [ ] Draft API plugin/theme (link docs)
- [ ] Contoh user story (link Notion/Docs)

---

### ❓ Apakah roadmap & stack ini bisa membuat website powerful?
**Jawaban:**  
Ya, roadmap dan stack di atas sangat mumpuni untuk membangun website CMS modern yang powerful, scalable, dan mudah dikembangkan. Dengan arsitektur modular, plugin/theme API, UI modern, serta standar devops & keamanan tinggi, sistem ini bisa bersaing bahkan melampaui WordPress dalam hal fleksibilitas, performa, dan kemudahan pengembangan. Kunci utamanya adalah eksekusi disiplin sesuai roadmap, test coverage tinggi, dan feedback rutin dari user/developer.
