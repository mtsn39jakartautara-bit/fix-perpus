<?php
// app/Http/Controllers/Admin/ClassPromotionController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\ClassRoom;
use App\Models\AcademicYears;
use App\Models\Enrollments;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ClassPromotionImport;

class ClassPromotionController extends Controller
{
    /**
     * Display the class promotion page
     */
    public function index()
    {
        $classes = ClassRoom::orderBy('level')->orderBy('name')->get();
        $activeAcademicYear = AcademicYears::where('is_active', true)->first();
        $statuses = Student::getStatuses();

        // Get special class for graduated
        $graduatedClass = ClassRoom::where('name', 'graduated')->where('level', 0)->first();

        return Inertia::render('Admin/ClassPromotion/ClassPromotion', [
            'classes' => $classes,
            'activeAcademicYear' => $activeAcademicYear,
            'statuses' => $statuses,
            'graduatedClass' => $graduatedClass,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Search students by NIS or Name
     */
    public function searchStudents(Request $request)
    {
        $search = $request->get('search');

        $students = User::where('role', 'student')
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
                    'status' => $student->status ?? 'active',
                    'status_label' => Student::getStatuses()[$student->status ?? 'active'] ?? 'Aktif',
                    'current_class' => $student?->activeEnrollment?->classRoom?->name ?? 'Belum memiliki kelas',
                    'current_class_id' => $student?->activeEnrollment?->class_id,
                    'can_promote' => $student?->canPromote() ?? false,
                    'can_graduate' => $student?->canGraduate() ?? false,
                ];
            });

        return response()->json($students);
    }

    /**
     * Get or create special class for graduation
     */
    private function getOrCreateGraduatedClass()
    {
        $class = ClassRoom::where('name', 'graduated')->where('level', 0)->first();

        if (!$class) {
            // Create the special class for graduated students
            $class = ClassRoom::create([
                'name' => 'graduated',
                'level' => 0,
            ]);
        }

        return $class;
    }

    /**
     * Promote single student (Naik Kelas)
     */
    public function promoteSingle(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'action_type' => 'required|in:promote,graduate',
        ]);

        $activeAcademicYear = AcademicYears::where('is_active', true)->first();

        if (!$activeAcademicYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif. Silakan buat tahun ajaran terlebih dahulu.');
        }

        $student = Student::find($request->student_id);

        if ($request->action_type === 'graduate') {
            return $this->graduateStudent($student, $activeAcademicYear);
        } else {
            // For promote, we need new_class_id
            $request->validate([
                'new_class_id' => 'required|exists:classes,id',
            ]);
            return $this->promoteStudentToClass($student, $request->new_class_id, $activeAcademicYear);
        }
    }

    private function promoteStudentToClass($student, $newClassId, $activeAcademicYear)
    {
        if (!$student->canPromote()) {
            return back()->with('error', "Siswa dengan status {$student->status} tidak dapat dipromosikan.");
        }

        // Check if target class is a special class (level 0)
        $targetClass = ClassRoom::find($newClassId);
        if ($targetClass && $targetClass->level === 0) {
            return back()->with('error', 'Tidak dapat memindahkan siswa ke kelas khusus. Gunakan fitur yang sesuai.');
        }

        try {
            DB::beginTransaction();

            // Check if student already has enrollment for this academic year
            $existingEnrollment = Enrollments::where('student_id', $student->id)
                ->where('academic_year_id', $activeAcademicYear->id)
                ->first();

            if ($existingEnrollment) {
                // Update existing enrollment
                $existingEnrollment->update([
                    'class_id' => $newClassId,
                ]);
                $message = 'Kelas siswa berhasil diperbarui!';
            } else {
                // Create new enrollment
                Enrollments::create([
                    'student_id' => $student->id,
                    'class_id' => $newClassId,
                    'academic_year_id' => $activeAcademicYear->id,
                ]);
                $message = 'Siswa berhasil naik kelas!';
            }

            DB::commit();

            return back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mempromosikan siswa: ' . $e->getMessage());
        }
    }

    private function graduateStudent($student, $activeAcademicYear)
    {
        if (!$student->canGraduate()) {
            return back()->with('error', "Siswa dengan status {$student->status} tidak dapat diluluskan.");
        }

        try {
            DB::beginTransaction();

            // Get or create graduated special class
            $graduatedClass = $this->getOrCreateGraduatedClass();

            // Update student status to graduated
            $student->update([
                'status' => Student::STATUS_GRADUATED,
            ]);

            // Assign student to graduated class
            $existingEnrollment = Enrollments::where('student_id', $student->id)
                ->where('academic_year_id', $activeAcademicYear->id)
                ->first();

            if ($existingEnrollment) {
                // Update existing enrollment to graduated class
                $existingEnrollment->update([
                    'class_id' => $graduatedClass->id,
                ]);
            } else {
                // Create new enrollment for graduated class
                Enrollments::create([
                    'student_id' => $student->id,
                    'class_id' => $graduatedClass->id,
                    'academic_year_id' => $activeAcademicYear->id,
                ]);
            }

            DB::commit();

            return back()->with('success', "Siswa {$student->user->name} berhasil diluluskan dan dipindahkan ke kelas {$graduatedClass->name}!");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal meluluskan siswa: ' . $e->getMessage());
        }
    }

    /**
     * Preview class promotion from Excel
     */
    public function previewMultiple(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'action_type' => 'required|in:promote,graduate',
            'new_class_id' => 'required_if:action_type,promote|exists:classes,id',
        ]);

        try {
            $activeAcademicYear = AcademicYears::where('is_active', true)->first();

            if (!$activeAcademicYear) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada tahun ajaran aktif. Silakan buat tahun ajaran terlebih dahulu.',
                ], 422);
            }

            $import = new ClassPromotionImport(
                $request->action_type,
                $request->new_class_id ?? null,
                $activeAcademicYear->id,
                true
            );
            Excel::import($import, $request->file('file'));

            $previewData = $import->getPreviewData();
            $validCount = count(array_filter($previewData, fn($item) => $item['status'] === 'valid'));
            $invalidCount = count(array_filter($previewData, fn($item) => $item['status'] === 'invalid'));

            // Get special class info for graduation
            $specialClass = null;
            if ($request->action_type === 'graduate') {
                $graduatedClass = ClassRoom::where('name', 'graduated')->where('level', 0)->first();
                $specialClass = $graduatedClass ? $graduatedClass->name : 'graduated';
            }

            return response()->json([
                'success' => true,
                'data' => $previewData,
                'summary' => [
                    'total' => count($previewData),
                    'valid' => $validCount,
                    'invalid' => $invalidCount,
                ],
                'academic_year' => $activeAcademicYear->name,
                'action_type' => $request->action_type,
                'special_class' => $specialClass,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses file: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Promote multiple students from Excel
     */
    public function promoteMultiple(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'action_type' => 'required|in:promote,graduate',
            'new_class_id' => 'required_if:action_type,promote|exists:classes,id',
        ]);

        $activeAcademicYear = AcademicYears::where('is_active', true)->first();

        if (!$activeAcademicYear) {
            return back()->with('error', 'Tidak ada tahun ajaran aktif. Silakan buat tahun ajaran terlebih dahulu.');
        }

        try {
            $import = new ClassPromotionImport(
                $request->action_type,
                $request->new_class_id ?? null,
                $activeAcademicYear->id,
                false
            );
            Excel::import($import, $request->file('file'));

            $successCount = $import->getSuccessCount();
            $failedCount = $import->getFailedCount();
            $errors = $import->getErrors();

            if ($successCount > 0) {
                $actionText = $request->action_type === 'graduate' ? 'meluluskan' : 'mempromosikan';
                $subjectText = $request->action_type === 'graduate' ? 'siswa' : 'siswa';
                $message = "Berhasil {$actionText} {$successCount} {$subjectText}.";
                if ($failedCount > 0) {
                    $message .= " Gagal: {$failedCount} siswa.";
                }

                return redirect()->back()->with('success', $message)->with('importErrors', $errors);
            } else {
                return redirect()->back()->with('error', 'Tidak ada data yang berhasil diproses. Silakan periksa format file.');
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
        $actionType = $request->get('action_type', 'promote');
        $filename = $actionType === 'graduate' ? 'template_kelulusan.xlsx' : 'template_naik_kelas.xlsx';
        return Excel::download(new \App\Exports\ClassPromotionTemplateExport($actionType), $filename);
    }

    /**
     * Get current class of a student
     */
    public function getStudentClass($studentId)
    {
        $student = Student::with(['activeEnrollment.classRoom'])->find($studentId);

        return response()->json([
            'current_class' => $student?->activeEnrollment?->classRoom?->name ?? 'Belum memiliki kelas',
            'current_class_id' => $student?->activeEnrollment?->class_id,
            'status' => $student?->status,
            'status_label' => Student::getStatuses()[$student?->status ?? 'active'] ?? 'Aktif',
            'can_promote' => $student?->canPromote() ?? false,
        ]);
    }
}
