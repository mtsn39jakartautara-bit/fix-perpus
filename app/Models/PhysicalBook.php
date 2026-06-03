<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhysicalBook extends Model
{
    use HasFactory;

    protected $casts = [
        'id' => 'integer',
        'publish_year' => 'integer',
        'stock' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

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
