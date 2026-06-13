<?php

namespace Database\Seeders;

use App\Models\PointPeriods;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PointPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        PointPeriods::truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');


        PointPeriods::create([
            'name' => 'Periode 1',
            'description' => 'Priode 1',
            'is_active' => true,
            'started_at' => Carbon::create(2026, 1, 1),
            'ended_at' => null,
        ]);
    }
}
