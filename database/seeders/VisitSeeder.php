<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Visit;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class VisitSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::whereIn('role', ['student', 'teacher'])->get();

        foreach ($users as $user) {
            // Create offline visits
            for ($i = 0; $i < rand(5, 15); $i++) {
                Visit::create([
                    'user_id' => $user->id,
                    'type' => 'offline',
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                ]);
            }

            // Create online visits
            for ($i = 0; $i < rand(3, 10); $i++) {
                Visit::create([
                    'user_id' => $user->id,
                    'type' => 'online',
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                ]);
            }
        }
    }
}
