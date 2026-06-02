<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointPeriodResults extends Model
{
    use HasFactory;

    protected $fillable = [
        'point_period_id',
        'user_id',
        'final_points',
        'rank',
    ];

    public function pointPeriod()
    {
        return $this->belongsTo(PointPeriods::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
