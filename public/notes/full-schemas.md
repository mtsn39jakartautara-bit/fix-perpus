# Dokumentasi Schema Database Perpustakaan

## users

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();

    // Barcode identitas user untuk scan perpustakaan
    $table->text('barcode')->unique()->nullable();

    // Role user dalam sistem
    $table->enum('role', [
        'student',
        'teacher',
        'admin',
        'external'
    ])->default('student');

    // Informasi akun user
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->rememberToken();

    // Total point user dari aktivitas perpustakaan
    $table->integer('total_points')->default(0);

    $table->timestamps();
});
```

### Penjelasan

-   Table utama untuk autentikasi & data seluruh user.
-   Direlasikan ke:

    -   students
    -   teachers
    -   borrowings
    -   visits
    -   wishlists
    -   point_histories

---

# books

```php
// Buku digital / ebook
Schema::create('books', function (Blueprint $table) {
    $table->id();

    // UUID untuk public identifier
    $table->uuid('uuid')->unique();

    // Informasi buku
    $table->string('title');
    $table->string('publisher')->nullable();
    $table->string('author')->nullable();

    // Tahun terbit
    $table->integer('publish_year')->nullable();

    // Deskripsi buku
    $table->text('abstract')->nullable();

    // File ebook/pdf
    $table->text('pdf_file')->nullable();

    $table->timestamps();
});
```

### Penjelasan

-   Digunakan untuk menyimpan buku digital.
-   Direlasikan ke:

    -   categories melalui book_category
    -   wishlists

---

# categories

```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();

    // Nama kategori buku
    $table->string('name')->unique();

    // URL friendly slug
    $table->string('slug')->unique();

    $table->timestamps();
});
```

### Penjelasan

-   Menyimpan kategori buku digital.
-   Relasi many-to-many dengan books.

---

# book_category

```php
Schema::create('book_category', function (Blueprint $table) {
    $table->id();

    // Relasi ke buku
    $table->foreignId('book_id')
        ->constrained()
        ->cascadeOnDelete();

    // Relasi ke kategori
    $table->foreignId('category_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->timestamps();

    // Mencegah duplicate kategori pada buku
    $table->unique(['book_id', 'category_id']);
});
```

### Penjelasan

-   Pivot table relasi many-to-many antara:

    -   books
    -   categories

---

# students

```php
Schema::create('students', function (Blueprint $table) {
    $table->id();

    // Relasi ke akun user
    $table->foreignId('user_id')
        ->constrained()
        ->onDelete('cascade');

    // Nomor induk siswa
    $table->string('nis')->unique();

    // Jenis kelamin
    $table->enum('gender', ['male', 'female']);

    // Informasi tambahan siswa
    $table->string('parent_phone')->nullable();
    $table->text('address')->nullable();

    // Status akademik siswa
    $table->enum('status', [
        'active',
        'graduated',
        'transferred',
        'dropped'
    ])->default('active');

    $table->timestamps();

    // Index pencarian siswa
    $table->index('nis');
});
```

### Penjelasan

-   Detail data siswa.
-   Relasi:

    -   belongsTo users
    -   hasMany enrollments

---

# teachers

```php
Schema::create('teachers', function (Blueprint $table) {
    $table->id();

    // Relasi ke akun user
    $table->foreignId('user_id')
        ->constrained()
        ->onDelete('cascade');

    // Nomor induk pegawai
    $table->string('nip')->unique();

    // Mata pelajaran
    $table->string('subject');

    // Kontak guru
    $table->string('phone')->nullable();
    $table->text('address')->nullable();

    $table->timestamps();

    $table->index('nip');
    $table->index('subject');
});
```

### Penjelasan

-   Detail data guru.
-   Relasi:

    -   belongsTo users

---

# externals

```php
Schema::create('externals', function (Blueprint $table) {
    $table->id();

    // Relasi ke akun user
    $table->foreignId('user_id')
        ->constrained()
        ->onDelete('cascade');

    // Nomor Induk Kependudukan
    $table->string('nik')->unique();

    // Jenis kelamin
    $table->enum('gender', ['male', 'female']);

    // Nomor telepon anggota eksternal
    $table->string('number_phone')->nullable();

    // Status keanggotaan
    $table->enum('status', [
        'active',
        'inactive'
    ])->default('active');

    $table->timestamps();

    // Index pencarian anggota eksternal
    $table->index('nik');
});
```

### Penjelasan

-   Menyimpan data profil anggota eksternal perpustakaan.
-   Digunakan untuk pengguna yang bukan siswa maupun guru, seperti:
    -   Alumni
    -   Orang tua siswa
    -   Masyarakat umum
    -   Pengunjung atau anggota luar sekolah
-   Data autentikasi tetap disimpan pada tabel `users`, sedangkan tabel ini menyimpan informasi tambahan yang spesifik untuk anggota eksternal.

### Relasi

-   belongsTo users

### Keterangan Field

| Field        | Tipe             | Keterangan                                |
| ------------ | ---------------- | ----------------------------------------- |
| id           | bigint           | Primary key                               |
| user_id      | foreignId        | Relasi ke tabel `users`                   |
| nik          | string, unique   | Nomor Induk Kependudukan anggota          |
| gender       | enum             | Jenis kelamin (`male`, `female`)          |
| number_phone | string, nullable | Nomor telepon anggota                     |
| status       | enum             | Status keanggotaan (`active`, `inactive`) |
| created_at   | timestamp        | Waktu data dibuat                         |
| updated_at   | timestamp        | Waktu data terakhir diperbarui            |

### Status Anggota

| Status   | Keterangan                                               |
| -------- | -------------------------------------------------------- |
| active   | Anggota aktif dan dapat menggunakan layanan perpustakaan |
| inactive | Keanggotaan dinonaktifkan atau tidak lagi digunakan      |

---

# classes

```php
Schema::create('classes', function (Blueprint $table) {
    $table->id();

    // Nama kelas
    $table->string('name'); // 7A, 8B

    // Tingkatan kelas
    $table->integer('level'); // 7, 8, 9

    $table->timestamps();
});
```

### Penjelasan

-   Menyimpan data kelas sekolah.
-   Relasi:

    -   hasMany enrollments

---

# academic_years

```php
Schema::create('academic_years', function (Blueprint $table) {
    $table->id();

    // Tahun ajaran
    $table->string('name'); // 2025/2026

    // Tahun aktif
    $table->boolean('is_active')
        ->default(false);

    $table->timestamps();
});
```

### Penjelasan

-   Menyimpan data tahun ajaran sekolah.
-   Relasi:

    -   hasMany enrollments

---

# enrollments

```php
Schema::create('enrollments', function (Blueprint $table) {
    $table->id();

    // Relasi siswa
    $table->foreignId('student_id')
        ->constrained()
        ->cascadeOnDelete();

    // Relasi kelas
    $table->foreignId('class_id')
        ->constrained()
        ->cascadeOnDelete();

    // Relasi tahun ajaran
    $table->foreignId('academic_year_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->timestamps();

    // 1 siswa hanya boleh punya
    // 1 kelas dalam 1 tahun ajaran
    $table->unique([
        'student_id',
        'academic_year_id'
    ]);
});
```

### Penjelasan

-   Menyimpan histori kelas siswa.
-   Menghubungkan:

    -   students
    -   classes
    -   academic_years

---

# library_check_points

```php
// Barcode checkpoint perpustakaan
Schema::create('library_check_points', function (Blueprint $table) {
    $table->id();

    // Nama checkpoint
    $table->string('name');

    // Barcode scan
    $table->string('barcode')->unique();

    // Jenis checkpoint
    $table->string('type')
        ->default('library_visit');

    $table->timestamps();
});
```

### Penjelasan

-   Digunakan untuk sistem scan kehadiran perpustakaan.

---

# visits

```php
Schema::create('visits', function (Blueprint $table) {
    $table->id();

    // Relasi user
    $table->foreignId('user_id')
        ->constrained()
        ->cascadeOnDelete();

    // Jenis kunjungan
    $table->enum('type', [
        'online',
        'offline'
    ]);

    $table->timestamps();
});
```

### Penjelasan

-   Menyimpan riwayat kunjungan perpustakaan user.
-   Relasi:

    -   belongsTo users

---

# physical_books

```php
Schema::create('physical_books', function (Blueprint $table) {
    $table->id();

    // Informasi buku fisik
    $table->string('title');
    $table->string('isbn')->nullable();
    $table->string('publisher')->nullable();
    $table->string('author')->nullable();

    // Lokasi rak buku
    $table->string('location_rack')->nullable();

    // Tahun terbit
    $table->integer('publish_year')->nullable();

    // Deskripsi buku
    $table->text('abstract')->nullable();

    // Cover buku
    $table->string('cover_image')->nullable();

    // Total stok
    $table->integer('stock')->default(0);

    $table->timestamps();
});
```

### Penjelasan

-   Master data buku fisik.
-   Relasi:

    -   hasMany book_items

---

# book_items

```php
// Copy fisik buku
Schema::create('book_items', function (Blueprint $table) {
    $table->id();

    // Barcode unik per buku
    $table->string('barcode')->unique();

    // Relasi ke buku fisik
    $table->foreignId('physical_book_id')
        ->constrained()
        ->cascadeOnDelete();

    // Status buku
    $table->enum('status', [
        'available',
        'borrowed',
        'lost',
        'damaged',
    ])->default('available');

    $table->timestamps();
});
```

### Penjelasan

-   Menyimpan setiap copy buku fisik.
-   Digunakan untuk sistem scan peminjaman.
-   Relasi:

    -   belongsTo physical_books
    -   hasMany borrowings

---

# borrowings

```php
Schema::create('borrowings', function (Blueprint $table) {
    $table->id();

    // User peminjam
    $table->foreignId('user_id')
        ->constrained()
        ->cascadeOnDelete();

    // Buku yang dipinjam
    $table->foreignId('book_item_id')
        ->constrained()
        ->cascadeOnDelete();

    // Tanggal pinjam
    $table->timestamp('borrowed_at')
        ->useCurrent();

    // Batas pengembalian
    $table->timestamp('due_date');

    // Tanggal dikembalikan
    $table->timestamp('returned_at')
        ->nullable();

    // Status peminjaman
    $table->enum('status', [
        'borrowed',
        'returned',
        'late',
    ])->default('borrowed');

    // Denda keterlambatan
    $table->integer('fine_amount')
        ->default(0);

    // Status pembayaran denda
    $table->boolean('fine_paid')
        ->default(false);

    // Tanggal perpanjangan
    $table->timestamp('extended_at')
        ->nullable();

    $table->timestamps();
});
```

### Penjelasan

-   Menyimpan transaksi peminjaman buku.
-   Relasi:

    -   belongsTo users
    -   belongsTo book_items

---

# wishlists

```php
Schema::create('wishlists', function (Blueprint $table) {
    $table->id();

    // User pemilik wishlist
    $table->foreignId('user_id')
        ->constrained()
        ->cascadeOnDelete();

    // Buku digital yang disimpan
    $table->foreignId('book_id')
        ->constrained()
        ->cascadeOnDelete();

    // Catatan tambahan
    $table->text('notes')->nullable();

    // Prioritas wishlist
    $table->tinyInteger('priority')
        ->default(3);

    $table->timestamps();

    // Mencegah duplicate wishlist
    $table->unique(['user_id', 'book_id']);

    // Index performa query
    $table->index('user_id');
    $table->index('book_id');
    $table->index('priority');
    $table->index('created_at');
});
```

### Penjelasan

-   Menyimpan daftar buku favorit user.
-   Relasi:

    -   belongsTo users
    -   belongsTo books

---

# announcements

```php
Schema::create('announcements', function (Blueprint $table) {
    $table->id();

    // Judul pengumuman
    $table->string('title');

    // Isi pengumuman
    $table->text('description');

    // Kategori pengumuman
    $table->string('category');

    // Tanggal pengumuman
    $table->date('date');

    // Status aktif
    $table->boolean('is_active')->default(true);

    $table->timestamps();
});
```

### Penjelasan

-   Menyimpan pengumuman sistem/perpustakaan.
-   Digunakan untuk informasi kepada user.

---

# point_periods

```php
Schema::create('point_periods', function (Blueprint $table) {
    $table->id();

    // Nama season/periode point
    $table->string('name');

    // Deskripsi periode
    $table->text('description')->nullable();

    // Status periode aktif
    $table->boolean('is_active')
        ->default(false);

    // Tanggal mulai periode
    $table->timestamp('started_at');

    // Tanggal berakhir periode
    $table->timestamp('ended_at')
        ->nullable();

    // Admin pembuat periode
    $table->foreignId('created_by')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete();

    $table->timestamps();
});
```

### Penjelasan

-   Menyimpan data season/periode point perpustakaan.
-   Digunakan untuk sistem leaderboard musiman (season).
-   Saat season berakhir, seluruh hasil akhir disimpan ke `point_period_results`.
-   Setelah season ditutup, point aktif user dapat direset tanpa kehilangan histori season sebelumnya.

### Relasi

-   hasMany point_histories
-   hasMany point_period_results
-   belongsTo users (created_by)

### Kegunaan

-   Menentukan season aktif.
-   Menyimpan histori season.
-   Mendukung fitur reset point.
-   Menyimpan periode kompetisi perpustakaan.

---

# point_histories

```php
Schema::create('point_histories', function (Blueprint $table) {
    $table->id();

    // Relasi user
    $table->foreignId('user_id')
        ->constrained()
        ->cascadeOnDelete();

    // Jenis aktivitas point
    $table->enum('type', [
        'visit_online',
        'visit_offline',
        'borrow_book',
        'return_book',
    ]);

    // Jumlah point
    $table->integer('points');

    // Catatan tambahan
    $table->text('description')->nullable();

    $table->timestamps();
});
```

### Penjelasan

-   Menyimpan histori aktivitas point user.
-   Setiap histori point terkait dengan satu season/periode melalui `point_period_id`.
-   Digunakan untuk sistem gamifikasi perpustakaan.
-   Menjadi sumber data utama aktivitas point user.

### Relasi

-   belongsTo users
-   belongsTo point_periods

---

# Perubahan point_histories

```php
Schema::table('point_histories', function (Blueprint $table) {

    // Season/periode saat point diperoleh
    $table->foreignId('point_period_id')
        ->after('user_id')
        ->constrained();

    $table->index([
        'user_id',
        'point_period_id'
    ]);
});
```

### Penjelasan

Field `point_period_id` digunakan untuk menghubungkan setiap histori point dengan season yang aktif saat point diperoleh.

Dengan demikian seluruh histori point tetap tersimpan meskipun season telah berganti atau leaderboard telah direset.

### Relasi Tambahan

-   belongsTo point_periods

### Kegunaan

-   Mengetahui season asal suatu point.
-   Menampilkan histori aktivitas per season.
-   Mendukung audit histori point.
-   Menjadi sumber data perhitungan hasil season.

---

# point_period_results

```php
Schema::create('point_period_results', function (Blueprint $table) {
    $table->id();

    // Season yang telah selesai
    $table->foreignId('point_period_id')
        ->constrained()
        ->cascadeOnDelete();

    // User peserta season
    $table->foreignId('user_id')
        ->constrained()
        ->cascadeOnDelete();

    // Total point akhir saat season ditutup
    $table->integer('final_points');

    // Ranking akhir season
    $table->integer('rank')
        ->nullable();

    $table->timestamps();

    $table->unique([
        'point_period_id',
        'user_id'
    ]);
});
```

### Penjelasan

-   Menyimpan snapshot hasil akhir leaderboard ketika season ditutup.
-   Bukan pengganti `point_histories`.
-   Digunakan untuk menyimpan hasil akhir kompetisi agar tidak perlu menghitung ulang seluruh histori point.

### Relasi

-   belongsTo point_periods
-   belongsTo users

### Kegunaan

-   Menampilkan juara season.
-   Menampilkan ranking akhir season.
-   Menampilkan histori prestasi user.
-   Menampilkan Hall of Fame perpustakaan.
-   Menghindari query agregasi besar pada histori point lama.

### Contoh Data

| point_period_id | user_id | final_points | rank |
| --------------- | ------- | ------------ | ---- |
| 3               | 1       | 530          | 1    |
| 3               | 2       | 420          | 2    |
| 3               | 3       | 350          | 3    |

---
