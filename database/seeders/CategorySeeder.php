<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Fiksi', 'slug' => Str::slug('Fiksi')],
            ['name' => 'Non-Fiksi', 'slug' => Str::slug('Non-Fiksi')],
            ['name' => 'Pendidikan', 'slug' => Str::slug('Pendidikan')],
            ['name' => 'Sains', 'slug' => Str::slug('Sains')],
            ['name' => 'Teknologi', 'slug' => Str::slug('Teknologi')],
            ['name' => 'Sejarah', 'slug' => Str::slug('Sejarah')],
            ['name' => 'Biografi', 'slug' => Str::slug('Biografi')],
            ['name' => 'Agama', 'slug' => Str::slug('Agama')],
            ['name' => 'Komik', 'slug' => Str::slug('Komik')],
            ['name' => 'Novel', 'slug' => Str::slug('Novel')],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
