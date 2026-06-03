<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Borrowing extends Model
{
    use HasFactory;

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'book_item_id' => 'integer',
        'fine_amount' => 'integer',
        'fine_paid' => 'boolean',
        'borrowed_at' => 'datetime',
        'due_date' => 'datetime',
        'returned_at' => 'datetime',
        'extended_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'book_item_id',
        'borrowed_at',
        'due_date',
        'returned_at',
        'status',
        'fine_amount',
        'fine_paid',
        'extended_at'
    ];

    protected function casts(): array
    {
        return [
            'borrowed_at' => 'datetime',
            'due_date' => 'datetime',
            'returned_at' => 'datetime',
            'fine_paid' => 'boolean',

        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookItem()
    {
        return $this->belongsTo(BookItem::class);
    }
}
