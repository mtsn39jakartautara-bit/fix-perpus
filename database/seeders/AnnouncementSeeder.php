<?php

namespace Database\Seeders;

use App\Models\Announcement;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $announcements = [
            [
                'title' => 'Ujian Tengah Semester',
                'description' => 'Persiapkan diri untuk UTS semester genap. Jadwal ujian akan diumumkan minggu depan.',
                'category' => 'Akademik',
                'date' => Carbon::now()->addDays(7),
                'is_active' => true,
            ],
            [
                'title' => 'Lomba Sains Antar Kelas',
                'description' => 'Daftarkan diri sebelum 20 Mei untuk mengikuti lomba sains tingkat sekolah.',
                'category' => 'Kompetisi',
                'date' => Carbon::now()->addDays(14),
                'is_active' => true,
            ],
            [
                'title' => 'Libur Hari Raya Waisak',
                'description' => 'Libur nasional, sekolah tutup pada tanggal 23-24 Mei 2024.',
                'category' => 'Pengumuman',
                'date' => Carbon::now()->addDays(5),
                'is_active' => true,
            ],
            [
                'title' => 'Pengambilan Rapor',
                'description' => 'Rapor semester genap akan dibagikan pada tanggal 10 Juni 2024.',
                'category' => 'Akademik',
                'date' => Carbon::now()->addDays(21),
                'is_active' => true,
            ],
        ];

        foreach ($announcements as $announcement) {
            Announcement::create($announcement);
        }
    }
}
