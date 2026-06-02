<?php
// app/Imports/StudentStatusImport.php

namespace App\Imports;

use App\Models\Student;
use App\Models\ClassRoom;
use App\Models\Enrollments;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class StudentStatusImport implements ToCollection, WithHeadingRow, WithValidation
{
    private $newStatus;
    private $academicYearId;
    private $isPreview;
    private $successCount = 0;
    private $failedCount = 0;
    private $errors = [];
    private $previewData = [];

    public function __construct($newStatus, $academicYearId, $isPreview = false)
    {
        $this->newStatus = $newStatus;
        $this->academicYearId = $academicYearId;
        $this->isPreview = $isPreview;
    }

    public function collection(Collection $rows)
    {
        // Get existing active students NIS
        $existingActiveStudents = Student::where('status', 'active')
            ->pluck('nis')
            ->toArray();

        // Get or create special class for this status
        $specialClass = $this->getOrCreateSpecialClass();

        if (!$specialClass && !$this->isPreview) {
            throw new \Exception("Gagal membuat atau menemukan kelas khusus untuk status {$this->newStatus}");
        }

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;
            $nis = trim($row['nis']);
            $notes = trim($row['catatan'] ?? '');

            // Find student by NIS
            $student = Student::with('user')->where('nis', $nis)->first();

            $statusData = [
                'row_number' => $rowNumber,
                'nis' => $nis,
                'notes' => $notes,
                'student_name' => $student?->user?->name ?? 'Tidak ditemukan',
                'current_status' => $student?->status ?? 'unknown',
                'current_class' => $this->getStudentCurrentClass($student),
                'new_status' => $this->newStatus,
                'new_class' => $specialClass?->name ?? $this->newStatus,
                'status' => 'valid',
                'errors' => [],
            ];

            // Validate
            $validationErrors = $this->validateRow($student, $nis, $existingActiveStudents);

            if (empty($validationErrors)) {
                if (!$this->isPreview) {
                    $this->updateStudentStatusAndClass($student);
                }
                $this->successCount++;
            } else {
                $statusData['status'] = 'invalid';
                $statusData['errors'] = $validationErrors;
                $this->failedCount++;
                $this->errors[] = "Baris {$rowNumber}: " . implode(', ', $validationErrors);
            }

            $this->previewData[] = $statusData;
        }
    }

    /**
     * Get or create special class for status
     */
    private function getOrCreateSpecialClass()
    {
        $class = ClassRoom::where('name', $this->newStatus)->where('level', 0)->first();

        if (!$class && !$this->isPreview) {
            // Create the special class if it doesn't exist (only when actually saving, not during preview)
            $class = ClassRoom::create([
                'name' => $this->newStatus,
                'level' => 0,
            ]);
        }

        return $class;
    }

    /**
     * Get student's current class name
     */
    private function getStudentCurrentClass($student)
    {
        if (!$student) {
            return 'Tidak ditemukan';
        }

        $enrollment = Enrollments::where('student_id', $student->id)
            ->where('academic_year_id', $this->academicYearId)
            ->with('classRoom')
            ->first();

        return $enrollment?->classRoom?->name ?? 'Belum memiliki kelas';
    }

    private function validateRow($student, $nis, $existingActiveStudents)
    {
        $errors = [];

        if (!$student) {
            $errors[] = 'NIS tidak ditemukan dalam database';
        } elseif ($student->status !== 'active') {
            $errors[] = "Siswa sudah berstatus {$student->status}. Hanya siswa aktif yang dapat diubah statusnya";
        } elseif (!in_array($nis, $existingActiveStudents)) {
            $errors[] = "NIS {$nis} tidak terdaftar sebagai siswa aktif";
        }

        return $errors;
    }

    private function updateStudentStatusAndClass($student)
    {
        try {
            DB::beginTransaction();

            // Get the special class
            $specialClass = ClassRoom::where('name', $this->newStatus)->where('level', 0)->first();

            if (!$specialClass) {
                throw new \Exception("Kelas khusus untuk status {$this->newStatus} tidak ditemukan");
            }

            // Update student status
            $student->update([
                'status' => $this->newStatus,
            ]);

            // Assign to special class
            $existingEnrollment = Enrollments::where('student_id', $student->id)
                ->where('academic_year_id', $this->academicYearId)
                ->first();

            if ($existingEnrollment) {
                $existingEnrollment->update([
                    'class_id' => $specialClass->id,
                ]);
            } else {
                Enrollments::create([
                    'student_id' => $student->id,
                    'class_id' => $specialClass->id,
                    'academic_year_id' => $this->academicYearId,
                ]);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function rules(): array
    {
        return [
            'nis' => 'required',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nis.required' => 'NIS wajib diisi',
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
