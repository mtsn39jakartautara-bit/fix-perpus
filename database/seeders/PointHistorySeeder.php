<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\PointHistory;
use App\Models\PointPeriods;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PointHistorySeeder extends Seeder
{
    public function run(): void
    {
        $users = User::whereIn('role', ['student', 'teacher'])->get();
        $activePeriod = PointPeriods::where('is_active', true)->first();

        $activities = [
            'visit_online' => 10,
            'visit_offline' => 20,
            'borrow_book' => 15,
            'return_book' => 5,
        ];

        foreach ($users as $user) {
            $totalPoints = 0;

            // Create visit online points
            $onlineVisits = rand(3, 10);
            for ($i = 0; $i < $onlineVisits; $i++) {
                $points = $activities['visit_online'];
                PointHistory::create([
                    'user_id' => $user->id,
                    'point_period_id' => $activePeriod->id,
                    'type' => 'visit_online',
                    'points' => $points,
                    'description' => 'Kunjungan online ke perpustakaan',
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                ]);
                $totalPoints += $points;
            }

            // Create visit offline points
            $offlineVisits = rand(5, 15);
            for ($i = 0; $i < $offlineVisits; $i++) {
                $points = $activities['visit_offline'];
                PointHistory::create([
                    'user_id' => $user->id,
                    'point_period_id' => $activePeriod->id,
                    'type' => 'visit_offline',
                    'points' => $points,
                    'description' => 'Kunjungan offline ke perpustakaan',
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                ]);
                $totalPoints += $points;
            }

            // Create borrow book points
            $borrowCount = rand(2, 8);
            for ($i = 0; $i < $borrowCount; $i++) {
                $points = $activities['borrow_book'];
                PointHistory::create([
                    'user_id' => $user->id,
                    'point_period_id' => $activePeriod->id,
                    'type' => 'borrow_book',
                    'points' => $points,
                    'description' => 'Meminjam buku',
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                ]);
                $totalPoints += $points;
            }

            // Create return book points
            $returnCount = rand(2, 8);
            for ($i = 0; $i < $returnCount; $i++) {
                $points = $activities['return_book'];
                PointHistory::create([
                    'user_id' => $user->id,
                    'point_period_id' => $activePeriod->id,
                    'type' => 'return_book',
                    'points' => $points,
                    'description' => 'Mengembalikan buku',
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                ]);
                $totalPoints += $points;
            }

            // Update user total points
            $user->update(['total_points' => $totalPoints]);
        }
    }
}
