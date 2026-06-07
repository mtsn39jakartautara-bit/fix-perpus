<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Book extends Model
{
    use HasFactory;
    protected $casts = [
        'id' => 'integer',
        'publish_year' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    protected $fillable = [
        'title',
        'publisher',
        'author',
        'publish_year',
        'abstract',
        'pdf_file',
        'reading_duration'
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

    /**
     * User yang mewishlist buku ini
     */
    public function wishlistedBy()
    {
        return $this->belongsToMany(User::class, 'wishlists')
            ->withPivot('notes', 'priority', 'created_at')
            ->withTimestamps();
    }

    /**
     * Hitung berapa banyak yang mewishlist buku ini
     */
    public function getWishlistCountAttribute()
    {
        return $this->wishlists()->count();
    }

    /**
     * Cek apakah user tertentu mewishlist buku ini
     */
    public function isWishlistedBy($userId)
    {
        return $this->wishlists()->where('user_id', $userId)->exists();
    }

    // Reactions

    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    public function userReaction($userId)
    {
        return $this->reactions()->where('user_id', $userId)->first();
    }

    public function getReactionsCountAttribute()
    {
        return [
            'like' => $this->reactions()->where('type', 'like')->count(),
            'love' => $this->reactions()->where('type', 'love')->count(),
            'haha' => $this->reactions()->where('type', 'haha')->count(),
            'angry' => $this->reactions()->where('type', 'angry')->count(),
            'sad' => $this->reactions()->where('type', 'sad')->count(),
            'total' => $this->reactions()->count(),
        ];
    }

    // Bookmark
    public function userBookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function userBookmark($userId)
    {
        return $this->userBookmarks()->where('user_id', $userId)->first();
    }
}
