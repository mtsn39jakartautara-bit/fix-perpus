<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [

            ['name' => '7A', 'level' => 7],
            ['name' => '7B', 'level' => 7],
            ['name' => '7C', 'level' => 7],
            ['name' => '8A', 'level' => 8],
            ['name' => '8B', 'level' => 8],
            ['name' => '8C', 'level' => 8],
            ['name' => '9A', 'level' => 9],
            ['name' => '9B', 'level' => 9],
            ['name' => '9C', 'level' => 9],

            ['name' => 'graduated', 'level' => 0],
            ['name' => 'transferred', 'level' => 0],
            ['name' => 'dropped', 'level' => 0],
        ];

        foreach ($classes as $class) {
            ClassRoom::create($class);
        }
    }
}
