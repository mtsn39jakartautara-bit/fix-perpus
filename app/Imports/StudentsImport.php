<?php
// app/Imports/StudentsImport.php

namespace App\Imports;

use App\Models\User;
use App\Models\Student;
use App\Models\Enrollments;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class StudentsImport implements ToCollection, WithHeadingRow, WithValidation
{
    private $classId;
    private $academicYearId;
    private $successCount = 0;
    private $failedCount = 0;
    private $errors = [];
    private $previewData = [];
    private $isPreview = false;

    public function __construct($classId, $academicYearId, $isPreview = false)
    {
        $this->classId = $classId;
        $this->academicYearId = $academicYearId;
        $this->isPreview = $isPreview;
    }

    public function collection(Collection $rows)
    {
        // Get existing NIS and emails for validation
        $existingNis = Student::pluck('nis')->toArray();
        $existingEmails = User::pluck('email')->toArray();

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            // Auto-generate email from NIS
            $nis = trim($row['nis']);
            $generatedEmail = $this->generateEmailFromNis($nis);

            // Prepare data
            $studentData = [
                'row_number' => $rowNumber,
                'name' => trim($row['nama']),
                'nis' => $nis,
                'email' => $generatedEmail,
                'gender' => strtolower(trim($row['jenis_kelamin'])),
                'parent_phone' => trim($row['no_hp_orangtua'] ?? ''),
                'address' => trim($row['alamat'] ?? ''),
                'password' => $nis,
            ];

            // Validate
            $validationErrors = $this->validateRow($studentData, $existingNis, $existingEmails);

            if (empty($validationErrors)) {
                $studentData['status'] = 'valid';
                $studentData['is_new_nis'] = !in_array($nis, $existingNis);
                $studentData['is_new_email'] = !in_array($generatedEmail, $existingEmails);

                if (!$this->isPreview) {
                    // Actually save the data
                    $this->saveStudent($studentData);
                }
            } else {
                $studentData['status'] = 'invalid';
                $studentData['errors'] = $validationErrors;
                $this->failedCount++;
                $this->errors[] = "Baris {$rowNumber}: " . implode(', ', $validationErrors);
            }

            $this->previewData[] = $studentData;

            if (empty($validationErrors) && !$this->isPreview) {
                $this->successCount++;
            }
        }
    }

    private function validateRow($data, $existingNis, $existingEmails)
    {
        $errors = [];

        // Validate name
        if (empty($data['name'])) {
            $errors[] = 'Nama wajib diisi';
        }

        // Validate NIS
        if (empty($data['nis'])) {
            $errors[] = 'NIS wajib diisi';
        } elseif (!in_array($data['nis'], $existingNis) && !preg_match('/^\d+$/', $data['nis'])) {
            $errors[] = 'NIS harus berupa angka';
        }

        // Validate gender
        if (empty($data['gender'])) {
            $errors[] = 'Jenis kelamin wajib diisi';
        } elseif (!in_array($data['gender'], ['male', 'female'])) {
            $errors[] = 'Jenis kelamin harus "male" atau "female"';
        }

        // Check for duplicates in existing database (only if not preview or if checking existing)
        if (in_array($data['nis'], $existingNis)) {
            $errors[] = "NIS {$data['nis']} sudah terdaftar";
        }

        if (in_array($data['email'], $existingEmails)) {
            $errors[] = "Email {$data['email']} sudah terdaftar";
        }

        return $errors;
    }

    private function generateEmailFromNis($nis)
    {
        return "student.{$nis}@mtsn39.com";
    }

    private function saveStudent($data)
    {
        try {
            DB::beginTransaction();

            // Create user
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'student',
                'barcode' => $this->generateBarcode(),
                'total_points' => 0,
            ]);

            // Create student profile
            $student = Student::create([
                'user_id' => $user->id,
                'nis' => $data['nis'],
                'gender' => $data['gender'],
                'parent_phone' => $data['parent_phone'],
                'address' => $data['address'],
                'status' => 'active',
            ]);

            // Create enrollment
            Enrollments::create([
                'student_id' => $student->id,
                'class_id' => $this->classId,
                'academic_year_id' => $this->academicYearId,
            ]);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function generateBarcode()
    {
        $prefix = 'STD';
        $year = date('Y');
        $random = str_pad(random_int(1, 99999), 5, '0', STR_PAD_LEFT);
        $barcode = $prefix . $year . $random;

        while (User::where('barcode', $barcode)->exists()) {
            $random = str_pad(random_int(1, 99999), 5, '0', STR_PAD_LEFT);
            $barcode = $prefix . $year . $random;
        }

        return $barcode;
    }

    public function rules(): array
    {
        return [
            'nama' => 'required',
            'nis' => 'required',
            'jenis_kelamin' => 'required|in:male,female',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nama.required' => 'Nama wajib diisi',
            'nis.required' => 'NIS wajib diisi',
            'jenis_kelamin.required' => 'Jenis kelamin wajib diisi',
            'jenis_kelamin.in' => 'Jenis kelamin harus male atau female',
        ];
    }

    public function getSuccessCount()
    {
        return $this->successCount;
    }
    public function getFailedCount()
    {
        return $this->failedCount;
    }
    public function getErrors()
    {
        return $this->errors;
    }
    public function getPreviewData()
    {
        return $this->previewData;
    }
}
