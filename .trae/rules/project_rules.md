# 📚 Aturan Pengembangan Proyek CMS Laravel + React

## 1. Struktur Folder
- Ikuti standar Laravel untuk backend (`app/`, `routes/`, `database/`, dll) dan React untuk frontend (`resources/js/`, `resources/views/`).
- Semua modul/plugin diletakkan di `Modules/` (menggunakan Nwidart/laravel-modules).
- Theme diletakkan di `Themes/` dengan struktur: `Themes/NamaTheme/`.
- Media, uploads, dan file publik di `public/`.

## 2. Konvensi Penamaan
- Gunakan PascalCase untuk nama class, camelCase untuk variabel dan fungsi.
- Nama modul/plugin/theme harus unik, konsisten, dan deskriptif.
- Route dan endpoint API gunakan snake_case, versi di prefix (`/api/v1/...`).

## 3. Modularitas & Plugin System
- Semua fitur utama (Pages, Posts, Menu, Media, dsb) harus berbentuk modul.
- Plugin dan theme harus autodiscovery (autoload via registry), support hook/event system.
- Setiap modul/plugin wajib punya ServiceProvider, config, migration, dan dokumentasi singkat.
- Theme harus support template hierarchy, customizer, widget area, dan API frontend.

## 4. Standar Kode & Best Practice
- Ikuti PSR-12 untuk PHP, ESLint/Prettier untuk JS/React.
- Gunakan type hinting, dependency injection, dan separation of concern.
- Semua kode harus mudah di-extend tanpa modifikasi core.
- Testing wajib: PHPUnit untuk backend, React Testing Library untuk frontend.

## 5. Keamanan
- Validasi dan sanitasi input di semua endpoint.
- Gunakan signed URL untuk upload/download file.
- Batasi permission via middleware dan policy.
- Pastikan plugin/theme tidak bisa override core tanpa izin eksplisit.

## 6. Extensibility & Integrasi
- Media CRUD dan fitur lain harus expose hook untuk plugin.
- Page builder dan block system harus support custom block dari plugin.
- Integrasi theme dengan modul Pages, Posts, Menu, dsb via API.

## 7. Dokumentasi & Standar Kolaborasi
- Semua modul/plugin/theme wajib ada README.md minimal: deskripsi, cara install, cara extend.
- Dokumentasi API dan hook harus up-to-date.
- Gunakan issue tracker untuk bug/fitur baru, pull request untuk kontribusi.

## 8. Lain-lain
- Responsive design dan dark/light mode wajib.
- Refactor dan review kode minimal setiap akhir sprint.
- Demo internal dan feedback rutin.

---

**Catatan:**
- Aturan ini wajib diikuti semua kontributor.
- Update aturan jika ada perubahan roadmap atau kebutuhan proyek.