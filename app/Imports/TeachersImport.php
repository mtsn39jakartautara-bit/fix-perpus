<?php
// app/Imports/TeachersImport.php

namespace App\Imports;

use App\Models\User;
use App\Models\Teacher;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class TeachersImport implements ToCollection, WithHeadingRow, WithValidation
{
    private $successCount = 0;
    private $failedCount = 0;
    private $errors = [];
    private $previewData = [];
    private $isPreview = false;

    public function __construct($isPreview = false)
    {
        $this->isPreview = $isPreview;
    }

    public function collection(Collection $rows)
    {
        // Get existing NIP and emails for validation
        $existingNip = Teacher::pluck('nip')->toArray();
        $existingEmails = User::pluck('email')->toArray();

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            // Auto-generate email from NIP
            $nip = trim($row['nip']);
            $generatedEmail = $this->generateEmailFromNip($nip);

            // Prepare data
            $teacherData = [
                'row_number' => $rowNumber,
                'name' => trim($row['nama']),
                'nip' => $nip,
                'email' => $generatedEmail,
                'subject' => trim($row['mata_pelajaran'] ?? ''),
                'phone' => trim($row['no_hp'] ?? ''),
                'address' => trim($row['alamat'] ?? ''),
                'password' => $nip,
            ];

            // Validate
            $validationErrors = $this->validateRow($teacherData, $existingNip, $existingEmails);

            if (empty($validationErrors)) {
                $teacherData['status'] = 'valid';
                $teacherData['is_new_nip'] = !in_array($nip, $existingNip);
                $teacherData['is_new_email'] = !in_array($generatedEmail, $existingEmails);

                if (!$this->isPreview) {
                    // Actually save the data
                    $this->saveTeacher($teacherData);
                }
            } else {
                $teacherData['status'] = 'invalid';
                $teacherData['errors'] = $validationErrors;
                $this->failedCount++;
                $this->errors[] = "Baris {$rowNumber}: " . implode(', ', $validationErrors);
            }

            $this->previewData[] = $teacherData;

            if (empty($validationErrors) && !$this->isPreview) {
                $this->successCount++;
            }
        }
    }

    private function validateRow($data, $existingNip, $existingEmails)
    {
        $errors = [];

        // Validate name
        if (empty($data['name'])) {
            $errors[] = 'Nama wajib diisi';
        }

        // Validate NIP
        if (empty($data['nip'])) {
            $errors[] = 'NIP wajib diisi';
        } elseif (!in_array($data['nip'], $existingNip) && !preg_match('/^\d+$/', $data['nip'])) {
            $errors[] = 'NIP harus berupa angka';
        }

        // Validate subject
        if (empty($data['subject'])) {
            $errors[] = 'Mata pelajaran wajib diisi';
        }

        // Check for duplicates in existing database
        if (in_array($data['nip'], $existingNip)) {
            $errors[] = "NIP {$data['nip']} sudah terdaftar";
        }

        if (in_array($data['email'], $existingEmails)) {
            $errors[] = "Email {$data['email']} sudah terdaftar";
        }

        return $errors;
    }

    private function generateEmailFromNip($nip)
    {
        return "teacher.{$nip}@mtsn39.com";
    }

    private function saveTeacher($data)
    {
        try {
            DB::beginTransaction();

            // Create user
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'teacher',
                'barcode' => $this->generateBarcode(),
                'total_points' => 0,
            ]);

            // Create teacher profile
            Teacher::create([
                'user_id' => $user->id,
                'nip' => $data['nip'],
                'subject' => $data['subject'],
                'phone' => $data['phone'],
                'address' => $data['address'],
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
        $prefix = 'TCH';
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
            'nip' => 'required',
            'mata_pelajaran' => 'required',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nama.required' => 'Nama wajib diisi',
            'nip.required' => 'NIP wajib diisi',
            'mata_pelajaran.required' => 'Mata pelajaran wajib diisi',
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
