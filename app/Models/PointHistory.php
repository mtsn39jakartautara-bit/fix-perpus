<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointHistory extends Model
{
    use HasFactory;

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'point_period_id' => 'integer',
        'points' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    protected $fillable = [
        'user_id',
        'point_period_id',
        'type',
        'points',
        'description',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pointPeriod()
    {
        return $this->belongsTo(PointPeriods::class);
    }
}
