<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassRoom extends Model
{
    use HasFactory;
    protected $table = 'classes';

    protected $casts = [
        'id' => 'integer',
        'level' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $fillable = [
        'name',
        'level',
    ];


    public function enrollments()
    {
        return $this->hasMany(Enrollments::class, 'class_id');
    }
}
