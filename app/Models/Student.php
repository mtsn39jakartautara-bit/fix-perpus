<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nis',
        'gender',
        'parent_phone',
        'address',
        'status',
    ];

    protected $casts = [
        'points' => 'integer',
    ];

    // Relasi balik ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollments::class);
    }

    // Status constants
    const STATUS_ACTIVE = 'active';
    const STATUS_GRADUATED = 'graduated';
    const STATUS_TRANSFERRED = 'transferred';
    const STATUS_DROPPED = 'dropped';

    public static function getStatuses()
    {
        return [
            self::STATUS_ACTIVE => 'Aktif',
            self::STATUS_GRADUATED => 'Lulus',
            self::STATUS_TRANSFERRED => 'Pindah',
            self::STATUS_DROPPED => 'Drop Out',
        ];
    }

    public static function getStatusColors()
    {
        return [
            self::STATUS_ACTIVE => 'success',
            self::STATUS_GRADUATED => 'info',
            self::STATUS_TRANSFERRED => 'warning',
            self::STATUS_DROPPED => 'destructive',
        ];
    }



    public function canPromote()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function canGraduate()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    // Accessor untuk mendapatkan nama siswa dari relasi user
    public function getNameAttribute()
    {
        return $this->user->name;
    }

    // Accessor untuk mendapatkan email siswa
    public function getEmailAttribute()
    {
        return $this->user->email;
    }
    public function activeEnrollment()
    {
        return $this->hasOne(Enrollments::class)
            ->whereHas('academicYear', function ($query) {
                $query->where('is_active', true);
            });
    }


    // mengambil kelas saat ini
    public function getCurrentClassNameAttribute()
    {
        return $this->activeEnrollment?->classRoom?->name;
    }

    //mengambil history kelas student
    public function getClassHistoriesAttribute()
    {
        return $this->enrollments()
            ->with([
                'classRoom',
                'academicYear'
            ])
            ->orderByDesc('academic_year_id')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'class_name' => $enrollment->classRoom?->name,
                    'level' => $enrollment->classRoom?->level,
                    'academic_year' => $enrollment->academicYear?->name,
                ];
            });
    }
}
