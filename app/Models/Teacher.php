<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'nip',
        'subject',
        'phone',
        'address',
    ];

    // Relasi balik ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessor untuk mendapatkan nama guru
    public function getNameAttribute()
    {
        return $this->user->name;
    }

    // Accessor untuk mendapatkan email guru
    public function getEmailAttribute()
    {
        return $this->user->email;
    }
}
