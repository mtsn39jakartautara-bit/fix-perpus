<?php
// app/Imports/ExternalsImport.php

namespace App\Imports;

use App\Models\User;
use App\Models\External;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ExternalsImport implements ToCollection, WithHeadingRow, WithValidation
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
        // Get existing NIK and emails for validation
        $existingNik = External::pluck('nik')->toArray();
        $existingEmails = User::pluck('email')->toArray();

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            // Auto-generate email from NIK
            $nik = trim($row['nik']);
            $generatedEmail = $this->generateEmailFromNik($nik);

            // Prepare data
            $externalData = [
                'row_number' => $rowNumber,
                'name' => trim($row['nama']),
                'nik' => $nik,
                'email' => $generatedEmail,
                'gender' => strtolower(trim($row['jenis_kelamin'])),
                'number_phone' => trim($row['no_hp'] ?? ''),
                'password' => $nik,
            ];

            // Validate
            $validationErrors = $this->validateRow($externalData, $existingNik, $existingEmails);

            if (empty($validationErrors)) {
                $externalData['status'] = 'valid';
                $externalData['is_new_nik'] = !in_array($nik, $existingNik);
                $externalData['is_new_email'] = !in_array($generatedEmail, $existingEmails);

                if (!$this->isPreview) {
                    // Actually save the data
                    $this->saveExternal($externalData);
                }
            } else {
                $externalData['status'] = 'invalid';
                $externalData['errors'] = $validationErrors;
                $this->failedCount++;
                $this->errors[] = "Baris {$rowNumber}: " . implode(', ', $validationErrors);
            }

            $this->previewData[] = $externalData;

            if (empty($validationErrors) && !$this->isPreview) {
                $this->successCount++;
            }
        }
    }

    private function validateRow($data, $existingNik, $existingEmails)
    {
        $errors = [];

        // Validate name
        if (empty($data['name'])) {
            $errors[] = 'Nama wajib diisi';
        }

        // Validate NIK
        if (empty($data['nik'])) {
            $errors[] = 'NIK wajib diisi';
        } elseif (!in_array($data['nik'], $existingNik) && !preg_match('/^\d+$/', $data['nik'])) {
            $errors[] = 'NIK harus berupa angka';
        }

        // Validate gender
        if (empty($data['gender'])) {
            $errors[] = 'Jenis kelamin wajib diisi';
        } elseif (!in_array($data['gender'], ['male', 'female'])) {
            $errors[] = 'Jenis kelamin harus "male" atau "female"';
        }

        // Check for duplicates in existing database
        if (in_array($data['nik'], $existingNik)) {
            $errors[] = "NIK {$data['nik']} sudah terdaftar";
        }

        if (in_array($data['email'], $existingEmails)) {
            $errors[] = "Email {$data['email']} sudah terdaftar";
        }

        return $errors;
    }

    private function generateEmailFromNik($nik)
    {
        return "external.{$nik}@mtsn39.com";
    }

    private function saveExternal($data)
    {
        try {
            DB::beginTransaction();

            // Create user
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'external',
                'barcode' => $this->generateBarcode(),
                'total_points' => 0,
            ]);

            // Create external profile
            External::create([
                'user_id' => $user->id,
                'nik' => $data['nik'],
                'gender' => $data['gender'],
                'number_phone' => $data['number_phone'],
                'status' => 'active',
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
        $prefix = 'EXT';
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
            'nik' => 'required',
            'jenis_kelamin' => 'required|in:male,female',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nama.required' => 'Nama wajib diisi',
            'nik.required' => 'NIK wajib diisi',
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
