# 🎨 Design System Documentation

## Overview

Design system ini dibangun dengan pendekatan **Modern Educational Dashboard** yang mengutamakan:

-   Keterbacaan tinggi (High Readability)
-   Nuansa profesional namun tetap ramah pengguna
-   Visual yang bersih (Clean UI)
-   Konsistensi antar halaman
-   Mendukung mode terang (Light Mode) dan gelap (Dark Mode)

Tema utama yang digunakan bukanlah tema korporat yang kaku, melainkan kombinasi antara:

> **Modern Library System + Educational Platform + Analytics Dashboard**

Hal ini terlihat dari dominasi warna **Teal / Aqua** yang memberikan kesan:

-   Tenang
-   Terpercaya
-   Modern
-   Edukatif
-   Teknologis
-   Ramah untuk penggunaan jangka panjang

---

# 🌊 Design Philosophy

## Primary Theme

Sistem ini berfokus pada tema:

### "Modern Aqua Learning Experience"

Karakteristik utama:

-   Dominasi warna teal/aqua
-   Banyak whitespace
-   Card-based layout
-   Soft shadows dan soft colors
-   Informasi statistik yang mudah dipindai
-   Fokus pada kenyamanan mata pengguna

---

# 🎯 Color Strategy

## Aturan Utama

Seluruh halaman harus mengutamakan penggunaan warna yang sudah tersedia pada design token.

### Prioritas Penggunaan Warna

1. `primary`
2. `primary-soft`
3. `accent`
4. `secondary`
5. Utility Colors (`sky`, `mint`, `peach`, `lavender`)

Hindari penggunaan:

```tsx
bg - blue - 500;
bg - green - 500;
text - purple - 600;
border - orange - 300;
```

Kecuali untuk:

-   Status
-   Badge khusus
-   Ranking
-   Visual analytics tertentu

---

# 🎨 Core Color Palette

## Primary

Warna identitas utama aplikasi.

```css
--primary: 180 92% 26%;
```

Penggunaan:

-   Button utama
-   CTA
-   Link penting
-   Active state
-   Heading penting

Contoh:

```tsx
<Button>
<Button variant="default">
text-primary
bg-primary
```

---

## Primary Soft

Versi lembut dari warna utama.

```css
--primary-soft: 180 60% 94%;
```

Penggunaan:

-   Background section
-   Highlight card
-   Empty state
-   Hover state

Contoh:

```tsx
bg - primary - soft;
border - primary / 20;
```

---

## Primary Glow

Digunakan untuk efek visual dan aksen.

```css
--primary-glow: 185 85% 45%;
```

Penggunaan:

-   Gradient
-   Hero section
-   Statistik utama
-   Decorative element

Contoh:

```tsx
bg - gradient - to - r;
from - primary;
to - primary - glow;
```

---

## Secondary

Warna pendukung netral.

```css
--secondary: 180 30% 95%;
```

Penggunaan:

-   Secondary button
-   Tab background
-   Filter panel
-   Utility card

---

## Accent

Digunakan untuk area yang membutuhkan perhatian ringan.

```css
--accent: 185 70% 92%;
```

Penggunaan:

-   Hover card
-   Selected state
-   Badge ringan
-   Highlight informasi

---

# 🌈 Utility Palette

## Sky

```css
--sky: 200 90% 90%;
```

Makna:

-   Informasi
-   Statistik
-   Monitoring

Contoh:

```tsx
Card Statistik
Card Total Pengguna
```

---

## Mint

```css
--mint: 160 70% 88%;
```

Makna:

-   Sukses
-   Valid
-   Aktif

Contoh:

```tsx
Success Alert
Success Badge
```

---

## Peach

```css
--peach: 25 95% 90%;
```

Makna:

-   Warning
-   Reminder
-   Notification

Contoh:

```tsx
Peringatan
Due Date
Informasi penting
```

---

## Lavender

```css
--lavender: 260 70% 92%;
```

Makna:

-   Analytics
-   Insight
-   Ranking
-   Achievement

Contoh:

```tsx
Point System
Leaderboard
Achievement
```

---

# 📦 Component Guidelines

## Button

### Primary Button

```tsx
<Button>
```

Untuk:

-   Simpan
-   Tambah
-   Submit
-   Konfirmasi

---

### Secondary Button

```tsx
<Button variant="secondary">
```

Untuk:

-   Filter
-   Navigasi
-   Aksi tambahan

---

### Destructive Button

```tsx
<Button variant="destructive">
```

Untuk:

-   Delete
-   Reset
-   Hapus Data

---

# 🃏 Card Design

Semua informasi utama harus dibungkus menggunakan Card.

Contoh:

```tsx
<Card>
    <CardHeader />
    <CardContent />
</Card>
```

Karakteristik:

-   Rounded besar
-   Padding lega
-   Border tipis
-   Tidak menggunakan shadow berlebihan

---

# 📊 Dashboard Rules

Untuk statistik dashboard:

## Yang Direkomendasikan

```tsx
bg - primary - soft;
border - primary / 20;
```

atau

```tsx
bg - sky;
bg - mint;
bg - peach;
bg - lavender;
```

## Yang Tidak Direkomendasikan

```tsx
bg - blue - 500;
bg - green - 500;
bg - orange - 500;
bg - purple - 500;
```

Karena memecah konsistensi tema.

---

# 🏆 Analisis Halaman Point Management

Pada halaman Point Management saat ini terdapat penggunaan:

```tsx
bg - blue - 500;
bg - green - 500;
bg - purple - 500;
bg - orange - 500;
```

Padahal design system sudah menyediakan:

| Saat Ini | Sebaiknya |
| -------- | --------- |
| Blue     | Sky       |
| Green    | Mint      |
| Purple   | Lavender  |
| Orange   | Peach     |

Contoh:

```tsx
<Card className="bg-sky border-primary/10">
```

```tsx
<Card className="bg-mint border-primary/10">
```

```tsx
<Card className="bg-lavender border-primary/10">
```

```tsx
<Card className="bg-peach border-primary/10">
```

Dengan begitu seluruh dashboard akan terlihat berasal dari satu sistem desain yang sama.

---

# 🌙 Dark Mode Philosophy

Dark mode tidak menggunakan hitam pekat.

Melainkan:

```css
--background: 195 30% 8%;
```

Tujuannya:

-   Mengurangi kelelahan mata
-   Menjaga kontras tetap nyaman
-   Memberikan kesan premium

Karakter dark mode:

-   Deep Navy
-   Dark Aqua
-   Modern Tech Dashboard

---

# ✅ Kesimpulan

Design system ini berfokus pada:

### Modern Aqua Educational Dashboard

Karakter utama:

-   Teal sebagai warna identitas
-   Soft color palette
-   Dashboard analytics
-   Library Management System
-   Educational Platform
-   Modern SaaS Experience

Aturan terpenting:

> Gunakan `primary`, `primary-soft`, `accent`, `secondary`, serta utility palette (`sky`, `mint`, `peach`, `lavender`) sebelum menggunakan warna Tailwind bawaan seperti `blue-500`, `green-500`, `purple-500`, atau `orange-500`.

Dengan konsistensi ini, seluruh aplikasi akan terlihat lebih profesional, premium, dan memiliki identitas visual yang kuat.
