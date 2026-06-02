<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointPeriods extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'started_at',
        'ended_at',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Semua histori point dalam periode ini.
     */
    public function pointHistories()
    {
        return $this->hasMany(PointHistory::class);
    }

    /**
     * Hasil akhir/ranking periode.
     */
    public function results()
    {
        return $this->hasMany(PointPeriodResults::class);
    }
}
