<?php
// app/Imports/ClassPromotionImport.php

namespace App\Imports;

use App\Models\Student;
use App\Models\ClassRoom;
use App\Models\Enrollments;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ClassPromotionImport implements ToCollection, WithHeadingRow, WithValidation
{
    private $actionType;
    private $newClassId;
    private $academicYearId;
    private $isPreview;
    private $successCount = 0;
    private $failedCount = 0;
    private $errors = [];
    private $previewData = [];

    public function __construct($actionType, $newClassId, $academicYearId, $isPreview = false)
    {
        $this->actionType = $actionType;
        $this->newClassId = $newClassId;
        $this->academicYearId = $academicYearId;
        $this->isPreview = $isPreview;
    }

    public function collection(Collection $rows)
    {
        // Get or create graduated class if action is graduate
        $graduatedClass = null;
        if ($this->actionType === 'graduate') {
            $graduatedClass = ClassRoom::where('name', 'graduated')->where('level', 0)->first();
            if (!$graduatedClass && !$this->isPreview) {
                $graduatedClass = ClassRoom::create([
                    'name' => 'graduated',
                    'level' => 0,
                ]);
            }
        }

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;
            $nis = trim($row['nis']);

            // Find student by NIS
            $student = Student::with(['user', 'enrollments' => function ($query) {
                $query->where('academic_year_id', $this->academicYearId)
                    ->with('classRoom');
            }])->where('nis', $nis)->first();

            $currentClass = $student?->enrollments->first()?->classRoom;
            $statusLabel = Student::getStatuses()[$student?->status ?? 'active'] ?? 'Aktif';

            // Determine target class based on action type
            $targetClass = null;
            if ($this->actionType === 'graduate') {
                $targetClass = $graduatedClass;
            } else {
                $targetClass = ClassRoom::find($this->newClassId);
            }

            $promotionData = [
                'row_number' => $rowNumber,
                'nis' => $nis,
                'student_name' => $student?->user?->name ?? 'Tidak ditemukan',
                'current_status' => $student?->status ?? 'unknown',
                'current_status_label' => $statusLabel,
                'current_class' => $currentClass?->name ?? 'Belum memiliki kelas',
                'current_class_id' => $currentClass?->id,
                'action_type' => $this->actionType,
                'new_class_id' => $this->newClassId,
                'target_class' => $targetClass?->name ?? ($this->actionType === 'graduate' ? 'graduated' : 'Tidak diketahui'),
                'status' => 'valid',
                'errors' => [],
            ];

            // Validate based on action type
            $validationErrors = $this->validateRow($student, $currentClass, $targetClass);

            if (empty($validationErrors)) {
                if (!$this->isPreview) {
                    if ($this->actionType === 'graduate') {
                        $this->graduateStudent($student, $graduatedClass);
                    } else {
                        $this->promoteStudent($student, $currentClass);
                    }
                }
                $this->successCount++;
            } else {
                $promotionData['status'] = 'invalid';
                $promotionData['errors'] = $validationErrors;
                $this->failedCount++;
                $this->errors[] = "Baris {$rowNumber}: " . implode(', ', $validationErrors);
            }

            $this->previewData[] = $promotionData;
        }
    }

    private function validateRow($student, $currentClass, $targetClass)
    {
        $errors = [];

        if (!$student) {
            $errors[] = 'NIS tidak ditemukan dalam database';
            return $errors;
        }

        if ($this->actionType === 'graduate') {
            // Validation for graduation
            if ($student->status !== Student::STATUS_ACTIVE) {
                $errors[] = "Siswa sudah berstatus {$student->status}. Hanya siswa aktif yang bisa diluluskan";
            }
        } else {
            // Validation for class promotion
            if ($student->status !== Student::STATUS_ACTIVE) {
                $errors[] = "Siswa berstatus {$student->status}. Hanya siswa aktif yang bisa dipromosikan";
            } elseif ($targetClass && $targetClass->level === 0) {
                $errors[] = "Tidak dapat memindahkan siswa ke kelas khusus ({$targetClass->name})";
            } elseif ($currentClass && $targetClass && $currentClass->id == $targetClass->id) {
                $errors[] = "Siswa sudah berada di kelas {$currentClass->name}";
            }
        }

        return $errors;
    }

    private function promoteStudent($student, $currentClass)
    {
        try {
            DB::beginTransaction();

            // Check if enrollment exists for this academic year
            $enrollment = Enrollments::where('student_id', $student->id)
                ->where('academic_year_id', $this->academicYearId)
                ->first();

            if ($enrollment) {
                // Update existing enrollment
                $enrollment->update([
                    'class_id' => $this->newClassId,
                ]);
            } else {
                // Create new enrollment
                Enrollments::create([
                    'student_id' => $student->id,
                    'class_id' => $this->newClassId,
                    'academic_year_id' => $this->academicYearId,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function graduateStudent($student, $graduatedClass)
    {
        try {
            DB::beginTransaction();

            // Update student status to graduated
            $student->update([
                'status' => Student::STATUS_GRADUATED,
            ]);

            // Assign to graduated class
            $enrollment = Enrollments::where('student_id', $student->id)
                ->where('academic_year_id', $this->academicYearId)
                ->first();

            if ($enrollment) {
                $enrollment->update([
                    'class_id' => $graduatedClass->id,
                ]);
            } else {
                Enrollments::create([
                    'student_id' => $student->id,
                    'class_id' => $graduatedClass->id,
                    'academic_year_id' => $this->academicYearId,
                ]);
            }

            DB::commit();
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
