<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Wishlist extends Model
{
    use HasFactory;

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'book_id' => 'integer',
        'priority' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    protected $fillable = [
        'user_id',
        'book_id',
        'notes',
        'priority',
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function scopeHighPriority($query)
    {
        return $query->where('priority', '>=', 4);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope untuk filter berdasarkan priority
     */
    public function scopePriority($query, $priority)
    {
        if ($priority && $priority !== 'all') {
            return $query->where('priority', $priority);
        }
        return $query;
    }

    /**
     * Scope untuk search berdasarkan judul buku atau author
     */
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->whereHas('book', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    /**
     * Dapatkan label priority
     */
    public function getPriorityLabelAttribute()
    {
        return match ($this->priority) {
            5 => ['label' => 'Sangat Penting', 'color' => 'red'],
            4 => ['label' => 'Penting', 'color' => 'orange'],
            3 => ['label' => 'Biasa', 'color' => 'blue'],
            2 => ['label' => 'Kurang Penting', 'color' => 'yellow'],
            1 => ['label' => 'Tidak Penting', 'color' => 'gray'],
            default => ['label' => 'Biasa', 'color' => 'blue'],
        };
    }
}
