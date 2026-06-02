<?php

namespace Database\Seeders;




use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    public function run()
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            BookSeeder::class,
            BookCategorySeeder::class,
            ClassSeeder::class,
            AcademicYearSeeder::class,
            EnrollmentSeeder::class,
            LibraryCheckPointSeeder::class,
            PhysicalBookSeeder::class,
            BookItemSeeder::class,
            BorrowingSeeder::class,
            VisitSeeder::class,
            WishlistSeeder::class,
            AnnouncementSeeder::class,
            PointPeriodSeeder::class,
            PointHistorySeeder::class,
            PointPeriodResultSeeder::class,
        ]);
    }
}
