<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookItem extends Model
{
    use HasFactory;

    protected $casts = [
        'id' => 'integer',
        'physical_book_id' => 'integer',
    ];

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
