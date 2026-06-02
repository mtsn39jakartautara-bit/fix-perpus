<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
