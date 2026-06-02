<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\AcademicYears;
use App\Models\ClassRoom;
use App\Models\Enrollments;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $students = Student::all();
        $classes = ClassRoom::all();
        $activeYear = AcademicYears::where('is_active', true)->first();

        if (!$activeYear) {
            $activeYear = AcademicYears::first();
        }

        // Assign students ke classes
        $assignments = [
            1 => 1,  // Student 1 ke Class 1 (7A)
            2 => 1,  // Student 2 ke Class 1 (7A)
            3 => 2,  // Student 3 ke Class 2 (7B)
            4 => 2,  // Student 4 ke Class 2 (7B)
            5 => 3,  // Student 5 ke Class 3 (7C)
            6 => 3,  // Student 6 ke Class 3 (7C)
            7 => 4,  // Student 7 ke Class 4 (8A)
        ];

        foreach ($assignments as $studentId => $classId) {
            Enrollments::create([
                'student_id' => $studentId,
                'class_id' => $classId,
                'academic_year_id' => $activeYear->id,
            ]);
        }
    }
}
