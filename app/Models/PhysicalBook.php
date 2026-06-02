<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhysicalBook extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'isbn',
        'publisher',
        'author',
        'location_rack',
        'publish_year',
        'abstract',
        'stock',
    ];

    public function bookItems()
    {
        return $this->hasMany(BookItem::class);
    }
}
