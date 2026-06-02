# Dokumentasi Model Sistem Perpustakaan Digital

## Daftar Isi

1. AcademicYears
2. Announcement
3. Book
4. BookCategory
5. BookItem
6. Borrowing
7. Category
8. ClassRoom
9. Enrollments
10. LibraryCheckPoint
11. PhysicalBook
12. PointHistory
13. PointPeriodResults
14. PointPeriods
15. Student
16. Teacher
17. User
18. Visit
19. Wishlist

---

# 1. AcademicYears

```php
class AcademicYears extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'is_active',
    ];

    public function enrollments()
    {
        return $this->hasMany(Enrollments::class);
    }
}
```

## Deskripsi

Model yang digunakan untuk menyimpan data tahun ajaran sekolah.

### Fillable

| Field     | Keterangan                                |
| --------- | ----------------------------------------- |
| name      | Nama tahun ajaran                         |
| is_active | Menandakan tahun ajaran yang sedang aktif |

### Relasi

| Relasi      | Tipe    |
| ----------- | ------- |
| enrollments | hasMany |

---

# 2. Announcement

```php
class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'date',
        'is_active',
    ];

    protected $casts = [
        'date' => 'date',
        'is_active' => 'boolean',
    ];
}
```

## Deskripsi

Digunakan untuk menyimpan data pengumuman yang ditampilkan pada sistem perpustakaan.

### Fillable

| Field       | Keterangan              |
| ----------- | ----------------------- |
| title       | Judul pengumuman        |
| description | Isi pengumuman          |
| category    | Kategori pengumuman     |
| date        | Tanggal pengumuman      |
| is_active   | Status aktif atau tidak |

### Casting

| Field     | Tipe    |
| --------- | ------- |
| date      | date    |
| is_active | boolean |

---

# 3. Book

```php
class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'publisher',
        'author',
        'publish_year',
        'abstract',
        'pdf_file',
    ];

    protected static function booted()
    {
        static::creating(function ($book) {
            if (!$book->uuid) {
                $book->uuid = Str::uuid();
            }
        });
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function wishlistedBy()
    {
        return $this->belongsToMany(User::class, 'wishlists')
            ->withPivot('notes', 'priority', 'created_at')
            ->withTimestamps();
    }

    public function getWishlistCountAttribute()
    {
        return $this->wishlists()->count();
    }

    public function isWishlistedBy($userId)
    {
        return $this->wishlists()
            ->where('user_id', $userId)
            ->exists();
    }
}
```

## Deskripsi

Model utama untuk koleksi buku digital yang dapat dibaca secara online melalui file PDF.

### Fillable

| Field        | Keterangan     |
| ------------ | -------------- |
| title        | Judul buku     |
| publisher    | Penerbit       |
| author       | Penulis        |
| publish_year | Tahun terbit   |
| abstract     | Ringkasan buku |
| pdf_file     | File PDF buku  |

### Fitur

#### UUID Otomatis

Saat buku dibuat, sistem otomatis menghasilkan UUID apabila belum tersedia.

#### Wishlist Counter

Accessor:

```php
$book->wishlist_count
```

Mengembalikan jumlah pengguna yang memasukkan buku ke wishlist.

#### Wishlist Checker

```php
$book->isWishlistedBy($userId)
```

Memeriksa apakah buku telah dimasukkan ke wishlist oleh pengguna tertentu.

### Relasi

| Relasi       | Tipe          |
| ------------ | ------------- |
| categories   | belongsToMany |
| wishlists    | hasMany       |
| wishlistedBy | belongsToMany |

---

# 4. BookCategory

```php
class BookCategory extends Model
{
    use HasFactory;

    protected $table = 'book_category';

    protected $fillable = [
        'book_id',
        'category_id',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
```

## Deskripsi

Tabel pivot yang menghubungkan buku dengan kategori.

### Relasi

| Relasi   | Tipe      |
| -------- | --------- |
| book     | belongsTo |
| category | belongsTo |

---

# 5. BookItem

```php
class BookItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'barcode',
        'physical_book_id',
        'status',
    ];

    public function physicalBook()
    {
        return $this->belongsTo(PhysicalBook::class);
    }

    public function borrowings()
    {
        return $this->hasMany(Borrowing::class);
    }
}
```

## Deskripsi

Representasi setiap eksemplar fisik buku yang ada di perpustakaan.

### Fillable

| Field            | Keterangan           |
| ---------------- | -------------------- |
| barcode          | Barcode unik buku    |
| physical_book_id | Referensi buku fisik |
| status           | Status buku          |

### Relasi

| Relasi       | Tipe      |
| ------------ | --------- |
| physicalBook | belongsTo |
| borrowings   | hasMany   |

---

# 6. Borrowing

```php
class Borrowing extends Model
{
    use HasFactory;
}
```

## Deskripsi

Mencatat seluruh transaksi peminjaman buku fisik.

### Fillable

-   user_id
-   book_item_id
-   borrowed_at
-   due_date
-   returned_at
-   status
-   fine_amount
-   fine_paid
-   extended_at

### Relasi

| Relasi   | Tipe      |
| -------- | --------- |
| user     | belongsTo |
| bookItem | belongsTo |

### Casting

| Field       | Tipe     |
| ----------- | -------- |
| borrowed_at | datetime |
| due_date    | datetime |
| returned_at | datetime |
| fine_paid   | boolean  |

---

# 7. Category

```php
class Category extends Model
{
    use HasFactory;
}
```

## Deskripsi

Kategori buku digital.

### Fillable

| Field | Keterangan    |
| ----- | ------------- |
| name  | Nama kategori |
| slug  | URL slug      |

### Fitur

#### Auto Generate Slug

Slug dibuat otomatis ketika data dibuat.

#### Auto Update Slug

Slug diperbarui ketika nama kategori berubah.

#### Route Model Binding

Menggunakan slug sebagai identifier URL.

```php
public function getRouteKeyName()
{
    return 'slug';
}
```

### Relasi

| Relasi | Tipe          |
| ------ | ------------- |
| books  | belongsToMany |

---

# 8. ClassRoom

```php
class ClassRoom extends Model
{
    use HasFactory;
}
```

## Deskripsi

Data kelas siswa.

### Fillable

-   name
-   level

### Relasi

| Relasi      | Tipe    |
| ----------- | ------- |
| enrollments | hasMany |

---

# 9. Enrollments

```php
class Enrollments extends Model
{
    use HasFactory;
}
```

## Deskripsi

Riwayat penempatan siswa pada kelas tertentu di tahun ajaran tertentu.

### Relasi

| Relasi       | Tipe      |
| ------------ | --------- |
| student      | belongsTo |
| classRoom    | belongsTo |
| academicYear | belongsTo |

---

# 10. LibraryCheckPoint

```php
class LibraryCheckPoint extends Model
{
    use HasFactory;
}
```

## Deskripsi

Checkpoint scanner yang digunakan untuk proses absensi atau kunjungan perpustakaan.

### Fillable

-   name
-   barcode
-   type

---

# 11. PhysicalBook

```php
class PhysicalBook extends Model
{
    use HasFactory;
}
```

## Deskripsi

Master data buku fisik.

### Fillable

-   title
-   isbn
-   publisher
-   author
-   location_rack
-   publish_year
-   abstract
-   stock

### Relasi

| Relasi    | Tipe    |
| --------- | ------- |
| bookItems | hasMany |

---

# 12. PointHistory

```php
class PointHistory extends Model
{
    use HasFactory;
}
```

## Deskripsi

Riwayat perubahan poin pengguna.

### Fillable

-   user_id
-   point_period_id
-   type
-   points
-   description

### Relasi

| Relasi      | Tipe      |
| ----------- | --------- |
| user        | belongsTo |
| pointPeriod | belongsTo |

---

# 13. PointPeriodResults

```php
class PointPeriodResults extends Model
{
    use HasFactory;
}
```

## Deskripsi

Menyimpan hasil akhir peringkat poin pada suatu periode.

### Fillable

-   point_period_id
-   user_id
-   final_points
-   rank

### Relasi

| Relasi      | Tipe      |
| ----------- | --------- |
| pointPeriod | belongsTo |
| user        | belongsTo |

---

# 14. PointPeriods

```php
class PointPeriods extends Model
{
    use HasFactory;
}
```

## Deskripsi

Periode kompetisi atau pengumpulan poin.

### Fillable

-   name
-   description
-   is_active
-   started_at
-   ended_at
-   created_by

### Relasi

| Relasi         | Tipe      |
| -------------- | --------- |
| creator        | belongsTo |
| pointHistories | hasMany   |
| results        | hasMany   |

---

# 15. Student

```php
class Student extends Model
{
    use HasFactory;
}
```

## Deskripsi

Profil siswa yang terhubung dengan akun pengguna.

### Fillable

-   user_id
-   nis
-   gender
-   parent_phone
-   address
-   status

### Relasi

| Relasi           | Tipe      |
| ---------------- | --------- |
| user             | belongsTo |
| enrollments      | hasMany   |
| activeEnrollment | hasOne    |

### Accessor

#### name

Mengambil nama siswa dari tabel users.

#### email

Mengambil email siswa dari tabel users.

#### current_class_name

Mengambil nama kelas aktif siswa.

#### class_histories

Mengambil seluruh riwayat kelas siswa.

---

# 16. Teacher

```php
class Teacher extends Model
{
    use HasFactory;
}
```

## Deskripsi

Profil guru.

### Fillable

-   user_id
-   nip
-   subject
-   phone
-   address

### Relasi

| Relasi | Tipe      |
| ------ | --------- |
| user   | belongsTo |

### Accessor

-   name
-   email

---

# 17. User

```php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

## Deskripsi

Model utama autentikasi sistem.

### Relasi Profil

| Relasi  | Tipe   |
| ------- | ------ |
| student | hasOne |
| teacher | hasOne |

### Relasi Perpustakaan

| Relasi          | Tipe          |
| --------------- | ------------- |
| borrowings      | hasMany       |
| visits          | hasMany       |
| wishlists       | hasMany       |
| wishlistedBooks | belongsToMany |

### Relasi Point System

| Relasi              | Tipe    |
| ------------------- | ------- |
| createdPointPeriods | hasMany |
| pointPeriodResults  | hasMany |
| pointHistories      | hasMany |

### Helper Method

```php
isStudent()
isTeacher()
isAdmin()
profile()
```

### Accessor

#### role_name

| Role    | Nama          |
| ------- | ------------- |
| student | Siswa         |
| teacher | Guru          |
| admin   | Administrator |

---

# 18. Visit

```php
class Visit extends Model
{
    use HasFactory;
}
```

## Deskripsi

Mencatat kunjungan pengguna ke perpustakaan.

### Fillable

-   user_id
-   type

### Relasi

| Relasi | Tipe      |
| ------ | --------- |
| user   | belongsTo |

---

# 19. Wishlist

```php
class Wishlist extends Model
{
    use HasFactory;
}
```

## Deskripsi

Daftar buku yang ingin dibaca atau dipinjam pengguna.

### Fillable

-   user_id
-   book_id
-   notes
-   priority

### Relasi

| Relasi | Tipe      |
| ------ | --------- |
| user   | belongsTo |
| book   | belongsTo |

### Query Scope

#### High Priority

```php
Wishlist::highPriority()
```

Mengambil wishlist dengan prioritas ≥ 4.

#### Filter User

```php
Wishlist::forUser($userId)
```

Filter berdasarkan pengguna.

#### Filter Priority

```php
Wishlist::priority($priority)
```

Filter berdasarkan tingkat prioritas.

#### Search

```php
Wishlist::search($keyword)
```

Pencarian berdasarkan judul atau penulis buku.

### Accessor

#### priority_label

| Priority | Label          |
| -------- | -------------- |
| 5        | Sangat Penting |
| 4        | Penting        |
| 3        | Biasa          |
| 2        | Kurang Penting |
| 1        | Tidak Penting  |

---

# Diagram Relasi Sederhana

```text
User
├── Student
├── Teacher
├── Borrowings
├── Visits
├── Wishlists
├── PointHistories
├── PointPeriodResults
└── PointPeriods (creator)

Student
└── Enrollments
    ├── AcademicYears
    └── ClassRoom

Book
├── Categories
├── Wishlists
└── WishlistedBy (Users)

PhysicalBook
└── BookItems
    └── Borrowings

PointPeriods
├── PointHistories
└── PointPeriodResults
```
