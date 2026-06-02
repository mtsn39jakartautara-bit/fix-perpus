<?php
// app/Http/Controllers/Admin/StudentStatusController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use App\Models\ClassRoom;
use App\Models\AcademicYears;
use App\Models\Enrollments;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\StudentStatusImport;
use App\Exports\StudentStatusTemplateExport;

class StudentStatusController extends Controller
{
    /**
     * Display the student status change page
     */
    public function index()
    {
        $statuses = [
            'transferred' => 'Pindah Sekolah',
            'dropped' => 'Drop Out',
        ];

        $classes = ClassRoom::orderBy('level')->orderBy('name')->get();
        $activeAcademicYear = AcademicYears::where('is_active', true)->first();

        // Get special classes for each status
        $specialClasses = [
            'graduated' => ClassRoom::where('name', 'graduated')->where('level', 0)->first(),
            'transferred' => ClassRoom::where('name', 'transferred')->where('level', 0)->first(),
            'dropped' => ClassRoom::where('name', 'dropped')->where('level', 0)->first(),
        ];

        return Inertia::render('Admin/StudentStatus/StudentStatus', [
            'statuses' => $statuses,
            'classes' => $classes,
            'activeAcademicYear' => $activeAcademicYear,
            'specialClasses' => $specialClasses,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Search students by NIS or Name (only active students)
     */
    public function searchStudents(Request $request)
    {
        $search = $request->get('search');

        $students = User::where('role', 'student')
            ->whereHas('student', function ($q) {
                $q->where('status', 'active');
            })
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhereHas('student', function ($q) use ($search) {
                        $q->where('nis', 'like', "%{$search}%");
                    });
            })
            ->with(['student' => function ($query) {
                $query->with(['activeEnrollment.classRoom']);
            }])
            ->limit(10)
            ->get()
            ->map(function ($user) {
                $student = $user->student;
                return [
                    'id' => $user->id,
                    'student_id' => $student->id ?? null,
                    'name' => $user->name,
                    'nis' => $student->nis ?? null,
                    'current_status' => $student->status ?? 'active',
                    'current_class' => $student?->activeEnrollment?->classRoom?->name ?? 'Belum memiliki kelas',
                    'current_class_id' => $student?->activeEnrollment?->class_id,
                ];
            });

        return response()->json($students);
    }

    /**
     * Get or create special class for status
     */
    private function getOrCreateSpecialClass($status)
    {
        $className = $status; // 'graduated', 'transferred', or 'dropped'

        $class = ClassRoom::where('name', $className)->where('level', 0)->first();

        if (!$class) {
            // Create the special class if it doesn't exist
            $class = ClassRoom::create([
                'name' => $className,
                'level' => 0,
            ]);
        }

        return $class;
    }

    /**
     * Assign student to special class based on status
     */
    private function assignToSpecialClass($student, $newStatus, $academicYearId)
    {
        // Get the special class for this status
        $specialClass = $this->getOrCreateSpecialClass($newStatus);

        if (!$specialClass) {
            throw new \Exception("Kelas khusus untuk status {$newStatus} tidak ditemukan atau gagal dibuat.");
        }

        // Check if enrollment already exists for this academic year
        $existingEnrollment = Enrollments::where('student_id', $student->id)
            ->where('academic_year_id', $academicYearId)
            ->first();

        if ($existingEnrollment) {
            // Update existing enrollment
            $existingEnrollment->update([
                'class_id' => $specialClass->id,
            ]);
        } else {
            // Create new enrollment
            Enrollments::create([
                'student_id' => $student->id,
                'class_id' => $specialClass->id,
                'academic_year_id' => $academicYearId,
            ]);
        }

        return $specialClass;
    }

    /**
     * Update single student status
     */
    public function updateSingle(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'new_status' => 'required|in:transferred,dropped',
            'notes' => 'nullable|string',
        ]);

        $activeAcademicYear = AcademicYears::where('is_active', true)->first();

        if (!$activeAcademicYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif. Silakan buat tahun ajaran terlebih dahulu.');
        }

        try {
            DB::beginTransaction();

            $student = Student::find($request->student_id);

            // Check if student is active
            if ($student->status !== 'active') {
                return back()->with('error', 'Hanya siswa dengan status AKTIF yang dapat diubah statusnya.');
            }

            $oldStatus = $student->status;

            // Update student status
            $student->update([
                'status' => $request->new_status,
            ]);

            // Assign to special class based on new status
            $specialClass = $this->assignToSpecialClass($student, $request->new_status, $activeAcademicYear->id);

            // Optional: Create log or point history entry
            // You can add this to point_histories if needed
            // PointHistory::create([...]);

            DB::commit();

            $statusLabel = $request->new_status === 'transferred' ? 'Pindah Sekolah' : 'Drop Out';
            return back()->with('success', "Status siswa berhasil diubah menjadi {$statusLabel} dan dipindahkan ke kelas {$specialClass->name}");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengubah status siswa: ' . $e->getMessage());
        }
    }

    /**
     * Preview multiple student status changes from Excel
     */
    public function previewMultiple(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'new_status' => 'required|in:transferred,dropped',
        ]);

        $activeAcademicYear = AcademicYears::where('is_active', true)->first();

        if (!$activeAcademicYear) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada tahun ajaran aktif. Silakan buat tahun ajaran terlebih dahulu.',
            ], 422);
        }

        try {
            $import = new StudentStatusImport($request->new_status, $activeAcademicYear->id, true);
            Excel::import($import, $request->file('file'));

            $previewData = $import->getPreviewData();
            $validCount = count(array_filter($previewData, fn($item) => $item['status'] === 'valid'));
            $invalidCount = count(array_filter($previewData, fn($item) => $item['status'] === 'invalid'));

            // Get duplicate NIS from preview
            $nisCounts = [];
            foreach ($previewData as $data) {
                if ($data['status'] === 'valid') {
                    $nisCounts[$data['nis']] = ($nisCounts[$data['nis']] ?? 0) + 1;
                }
            }
            $duplicateNis = array_filter($nisCounts, fn($count) => $count > 1);

            // Get special class info
            $specialClass = ClassRoom::where('name', $request->new_status)->where('level', 0)->first();
            $specialClassName = $specialClass ? $specialClass->name : $request->new_status;

            return response()->json([
                'success' => true,
                'data' => $previewData,
                'summary' => [
                    'total' => count($previewData),
                    'valid' => $validCount,
                    'invalid' => $invalidCount,
                    'duplicate_nis' => array_keys($duplicateNis),
                ],
                'special_class' => $specialClassName,
                'academic_year' => $activeAcademicYear->name,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses file: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Update multiple students status from Excel
     */
    public function updateMultiple(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'new_status' => 'required|in:transferred,dropped',
        ]);

        $activeAcademicYear = AcademicYears::where('is_active', true)->first();

        if (!$activeAcademicYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif. Silakan buat tahun ajaran terlebih dahulu.');
        }

        try {
            $import = new StudentStatusImport($request->new_status, $activeAcademicYear->id, false);
            Excel::import($import, $request->file('file'));

            $successCount = $import->getSuccessCount();
            $failedCount = $import->getFailedCount();
            $errors = $import->getErrors();

            if ($successCount > 0) {
                $statusLabel = $request->new_status === 'transferred' ? 'Pindah Sekolah' : 'Drop Out';
                $specialClass = ClassRoom::where('name', $request->new_status)->where('level', 0)->first();
                $className = $specialClass ? $specialClass->name : $request->new_status;

                $message = "Berhasil mengubah status {$successCount} siswa menjadi {$statusLabel} dan dipindahkan ke kelas {$className}.";
                if ($failedCount > 0) {
                    $message .= " Gagal: {$failedCount} siswa.";
                }

                return redirect()->back()->with('success', $message)->with('importErrors', $errors);
            } else {
                return redirect()->back()->with('error', 'Tidak ada data yang berhasil diubah. Silakan periksa format file.');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses file: ' . $e->getMessage());
        }
    }

    /**
     * Download template Excel
     */
    public function downloadTemplate(Request $request)
    {
        $status = $request->get('status', 'transferred');
        $filename = $status === 'transferred' ? 'template_pindah_sekolah.xlsx' : 'template_drop_out.xlsx';
        return Excel::download(new StudentStatusTemplateExport($status), $filename);
    }
}
