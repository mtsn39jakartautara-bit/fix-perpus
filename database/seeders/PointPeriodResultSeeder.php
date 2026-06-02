<?php

namespace Database\Seeders;

use App\Models\PointHistory;
use App\Models\PointPeriodResults;
use App\Models\PointPeriods;
use Illuminate\Database\Seeder;

class PointPeriodResultSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PointPeriodResults::truncate();

        $periods = PointPeriods::all();

        foreach ($periods as $period) {

            $results = PointHistory::query()
                ->selectRaw('
                    user_id,
                    SUM(points) as final_points
                ')
                ->where('point_period_id', $period->id)
                ->groupBy('user_id')
                ->orderByDesc('final_points')
                ->get();

            $rank = 1;

            foreach ($results as $result) {
                PointPeriodResults::create([
                    'point_period_id' => $period->id,
                    'user_id' => $result->user_id,
                    'final_points' => $result->final_points,
                    'rank' => $rank++,
                ]);
            }
        }
    }
}
