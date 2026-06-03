```markdown
# 📦 Laravel 10 + Inertia React TSX - cPanel Deployment Guide

Dokumentasi ini digunakan untuk workflow deploy manual di cPanel dengan struktur:

---

## 📁 Struktur Project di Server
```

/perpus
├── fix-perpus/ (Laravel project utama)
├── index.php (entry point)
├── .htaccess (routing)
├── assets/ (Vite assets)
├── build/ (Vite manifest + bundle)

````

---

# 🚀 1. Workflow Deploy (Update dari Git)

## 🔁 Step 1 - Masuk ke project

```bash
cd /perpus/fix-perpus
````

---

## 📥 Step 2 - Pull update dari Git

```bash
git pull origin main
```

---

## 📦 Step 3 - Install dependency (jika ada perubahan)

```bash
composer install
npm install
```

---

## 🏗️ Step 4 - Build frontend (WAJIB untuk Vite)

```bash
npm run build
```

Hasil build akan masuk ke:

```
fix-perpus/public/build
fix-perpus/public/assets
```

---

# 📤 2. Sync ke Public Web Root (/perpus)

## ⚠️ Step penting: bersihkan asset lama dulu

```bash
cd /perpus
rm -rf assets build
```

---

## 📁 Step 2 - Copy assets

```bash
cp -r fix-perpus/public/assets .
```

---

## 📁 Step 3 - Copy Vite build

```bash
cp -r fix-perpus/public/build .
```

---

# ⚠️ 3. Alternatif Copy Full Public (Hati-hati)

```bash
cp -r fix-perpus/public/* .
```

❗ Risiko:

-   overwrite `.htaccess`
-   overwrite `index.php`
-   bisa merusak routing Laravel

---

# 🧠 4. Error Umum (Vite Manifest)

## ❌ Error:

```
Unable to locate file in Vite manifest
```

## ✔ Penyebab:

-   belum `npm run build`
-   manifest tidak sinkron

## ✔ Solusi:

```bash
cd /perpus/fix-perpus
npm run build

cd /perpus
rm -rf build
cp -r fix-perpus/public/build .
```

---

# 🧹 5. Clear Cache Laravel

```bash
php artisan optimize:clear
```

---

# 🔥 6. Deployment Checklist

-   [ ] git pull dilakukan
-   [ ] composer install selesai
-   [ ] npm install selesai (jika perlu)
-   [ ] npm run build sudah dijalankan
-   [ ] assets disync ke /perpus
-   [ ] build disync ke /perpus
-   [ ] cache sudah dibersihkan

---

# 📌 7. Quick Deploy (Ringkasan)

```bash
cd /perpus/fix-perpus
git pull origin main
composer install
npm install
npm run build

cd /perpus
rm -rf assets build
cp -r fix-perpus/public/assets .
cp -r fix-perpus/public/build .
php artisan optimize:clear
```

---

# 🚀 Goal

✔ stabil di cPanel
✔ Laravel + Inertia + React TSX
✔ tanpa VPS
✔ build Vite tetap aman

---

```

```
