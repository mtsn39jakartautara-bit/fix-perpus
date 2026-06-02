<?php

namespace Database\Seeders;

use App\Models\External;
use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{

    public function run(): void
    {
        // Create Admin
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
            'barcode' => $this->generateBarcode('admin'),
            'total_points' => 0,
        ]);

        // Create Teachers
        $teachers = [
            [
                'name' => 'Dr. Budi Santoso, M.Pd',
                'email' => 'budi.santoso@gmail.com',
                'password' => Hash::make('password'),
                'nip' => '197501012005011001',
                'subject' => 'Matematika',
                'phone' => '081234567890',
                'address' => 'Jl. Pendidikan No. 1, Jakarta',
            ],
            [
                'name' => 'Siti Aminah, S.Pd',
                'email' => 'siti.aminah@gmail.com',
                'password' => Hash::make('password'),
                'nip' => '197802152008012002',
                'subject' => 'Bahasa Indonesia',
                'phone' => '081234567891',
                'address' => 'Jl. Merdeka No. 2, Bandung',
            ],
            [
                'name' => 'Drs. Ahmad Hidayat',
                'email' => 'ahmad.hidayat@gmail.com',
                'password' => Hash::make('password'),
                'nip' => '197503102006041001',
                'subject' => 'IPA',
                'phone' => '081234567892',
                'address' => 'Jl. Sains No. 3, Surabaya',
            ],
        ];

        foreach ($teachers as $teacherData) {


            $user = User::create([
                'name' => $teacherData['name'],
                'email' => $teacherData['email'],
                'password' => $teacherData['password'],
                'role' => 'teacher',
                'email_verified_at' => now(),
                'barcode' => $this->generateBarcode($teacherData['nip']),
                'total_points' => 0,
            ]);

            Teacher::create([
                'user_id' => $user->id,
                'nip' => $teacherData['nip'],
                'subject' => $teacherData['subject'],
                'phone' => $teacherData['phone'],
                'address' => $teacherData['address'],
            ]);
        }

        // Create Students
        $students = [
            [
                'name' => 'Citra Maharani',
                'email' => 'citra.maharani@student.com',
                'password' => Hash::make('password'),
                'nis' => '2026001',
                'gender' => 'female',
                'parent_phone' => '081234567901',
                'address' => 'Jl. Mawar No. 1, Jakarta',
                'status' => 'active',
            ],
            [
                'name' => 'Andini Putri',
                'email' => 'andini.putri@student.com',
                'password' => Hash::make('password'),
                'nis' => '2026002',
                'gender' => 'female',
                'parent_phone' => '081234567902',
                'address' => 'Jl. Melati No. 2, Bandung',
                'status' => 'active',
            ],
            [
                'name' => 'Gita Larasati',
                'email' => 'gita.larasati@student.com',
                'password' => Hash::make('password'),
                'nis' => '2026003',
                'gender' => 'female',
                'parent_phone' => '081234567903',
                'address' => 'Jl. Anggrek No. 3, Surabaya',
                'status' => 'active',
            ],
            [
                'name' => 'Fajar Nugroho',
                'email' => 'fajar.nugroho@student.com',
                'password' => Hash::make('password'),
                'nis' => '2026004',
                'gender' => 'male',
                'parent_phone' => '081234567904',
                'address' => 'Jl. Cendana No. 4, Yogyakarta',
                'status' => 'active',
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@student.com',
                'password' => Hash::make('password'),
                'nis' => '2026005',
                'gender' => 'male',
                'parent_phone' => '081234567905',
                'address' => 'Jl. Kenanga No. 5, Semarang',
                'status' => 'active',
            ],
            [
                'name' => 'Rina Wulandari',
                'email' => 'rina.wulandari@student.com',
                'password' => Hash::make('password'),
                'nis' => '2026006',
                'gender' => 'female',
                'parent_phone' => '081234567906',
                'address' => 'Jl. Dahlia No. 6, Medan',
                'status' => 'active',
            ],
            [
                'name' => 'Dian Pratiwi',
                'email' => 'dian.pratiwi@student.com',
                'password' => Hash::make('password'),
                'nis' => '2026007',
                'gender' => 'female',
                'parent_phone' => '081234567907',
                'address' => 'Jl. Teratai No. 7, Makassar',
                'status' => 'active',
            ],
        ];

        foreach ($students as $studentData) {



            $user = User::create([
                'name' => $studentData['name'],
                'email' => $studentData['email'],
                'password' => $studentData['password'],
                'role' => 'student',
                'email_verified_at' => now(),
                'barcode' => $this->generateBarcode($studentData['nis']),
                'total_points' => 0,
            ]);

            Student::create([
                'user_id' => $user->id,
                'nis' => $studentData['nis'],
                'gender' => $studentData['gender'],
                'parent_phone' => $studentData['parent_phone'],
                'address' => $studentData['address'],
                'status' => $studentData['status'],
            ]);
        }

        $externals = [
            [
                'name' => 'Muhammad Rizki',
                'email' => 'external1@gmail.com',
                'nik' => '3273010101010001',
                'gender' => 'male',
                'number_phone' => '081234567999',
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'external2@gmail.com',
                'nik' => '3273010101010002',
                'gender' => 'female',
                'number_phone' => '081234567998',
            ],
            [
                'name' => 'Ahmad Fauzi',
                'email' => 'external3@gmail.com',
                'nik' => '3273010101010003',
                'gender' => 'male',
                'number_phone' => '081234567997',
            ],
        ];

        // Create External User
        foreach ($externals as $externalData) {

            $user = User::create([
                'name' => $externalData['name'],
                'email' => $externalData['email'],
                'password' => Hash::make('password'),
                'role' => 'external',
                'email_verified_at' => now(),
                'barcode' => $this->generateBarcode($externalData['nik']),
                'total_points' => 0,
            ]);

            External::create([
                'user_id' => $user->id,
                'nik' => $externalData['nik'],
                'gender' => $externalData['gender'],
                'number_phone' => $externalData['number_phone'],
                'status' => 'active',
            ]);
        }
    }
    private function generateBarcode(string $identifier): string
    {
        return 'MTSN39-JAKUT-' . $identifier;
    }
}
