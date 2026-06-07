<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class ReadingReward extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
        'points_earned',
        'reward_date'
    ];

    protected $casts = [
        'reward_date' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    // Scope untuk reward hari ini
    public function scopeToday($query)
    {
        return $query->where('reward_date', Carbon::today());
    }
}
