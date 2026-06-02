<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class External extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nik',
        'gender',
        'number_phone',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
