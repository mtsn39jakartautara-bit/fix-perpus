<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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
}
