<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'barcode',
        'total_points',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function createdPointPeriods()
    {
        return $this->hasMany(PointPeriods::class, 'created_by');
    }

    public function pointPeriodResults()
    {
        return $this->hasMany(PointPeriodResults::class);
    }
    public function pointHistories()
    {
        return $this->hasMany(PointHistory::class);
    }
    public function borrowings()
    {
        return $this->hasMany(Borrowing::class);
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    // Relasi One-to-One ke Teacher
    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }

    public function external()
    {
        return $this->hasOne(External::class);
    }

    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function wishlistedBooks()
    {
        return $this->belongsToMany(Book::class, 'wishlists')
            ->withPivot('notes', 'priority', 'created_at')
            ->withTimestamps();
    }

    public function hasWishlisted($bookId)
    {
        return $this->wishlists()->where('book_id', $bookId)->exists();
    }

    // Helper methods untuk cek role
    public function isStudent()
    {
        return $this->role === 'student';
    }

    public function isTeacher()
    {
        return $this->role === 'teacher';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    // Get profile berdasarkan role
    public function profile()
    {
        if ($this->isStudent()) {
            return $this->student;
        }

        if ($this->isTeacher()) {
            return $this->teacher;
        }

        return null;
    }

    // Accessor untuk mendapatkan nama role dalam Bahasa Indonesia
    public function getRoleNameAttribute()
    {
        return match ($this->role) {
            'student' => 'Siswa',
            'teacher' => 'Guru',
            'admin' => 'Administrator',
            default => 'Unknown',
        };
    }
}
