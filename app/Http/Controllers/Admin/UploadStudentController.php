<?php
// app/Http/Controllers/Admin/UploadStudentController.php

namespace App\Http\Controllers\Admin;

use App\Exports\StudentsTemplateExport;
use App\Http\Controllers\Controller;
use App\Imports\StudentsImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\AcademicYears;
use App\Models\ClassRoom;
use App\Models\Enrollments;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UploadStudentController extends Controller
{
    /**
     * Display the student upload page
     */
    public function index()
    {
        $classes = ClassRoom::orderBy('level')->orderBy('name')->get();
        $academicYears = AcademicYears::orderBy('name', 'desc')->get();
        $activeAcademicYear = AcademicYears::where('is_active', true)->first();

        return Inertia::render('Admin/Uploads/Students/StudentUpload', [
            'classes' => $classes,
            'academicYears' => $academicYears,
            'activeAcademicYear' => $activeAcademicYear,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Create single student
     */
    public function storeSingle(Request $request)
    {
        // Auto-generate email from NIS if not provided
        $email = $request->email;
        if (empty($email) && $request->nis) {
            $email = $this->generateEmailFromNis($request->nis);
        }

        $validate = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nis' => 'required|string|unique:students,nis',
            'gender' => 'required|in:male,female',
            'class_id' => 'required|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'parent_phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        // Override email with generated one
        $request->merge(['email' => $email]);

        try {
            DB::beginTransaction();

            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $email,
                'password' => Hash::make($request->nis),
                'role' => 'student',
                'barcode' => $this->generateBarcode(),
                'total_points' => 0,
            ]);

            // Create student profile
            $student = Student::create([
                'user_id' => $user->id,
                'nis' => $request->nis,
                'gender' => $request->gender,
                'parent_phone' => $request->parent_phone,
                'address' => $request->address,
                'status' => 'active',
            ]);

            // Create enrollment
            Enrollments::create([
                'student_id' => $student->id,
                'class_id' => $request->class_id,
                'academic_year_id' => $request->academic_year_id,
            ]);

            DB::commit();

            return back()->with('success', 'Siswa berhasil ditambahkan! Password: ' . $request->nis . ', Email: ' . $email);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menambahkan siswa: ' . $e->getMessage());
        }
    }

    /**
     * Preview imported data from Excel
     */
    public function previewMultiple(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'class_id' => 'required|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
        ]);



        try {
            $import = new StudentsImport($request->class_id, $request->academic_year_id, true);
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

            return response()->json([
                'success' => true,
                'data' => $previewData,
                'summary' => [
                    'total' => count($previewData),
                    'valid' => $validCount,
                    'invalid' => $invalidCount,
                    'duplicate_nis' => array_keys($duplicateNis),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses file: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Import multiple students from Excel
     */
    public function storeMultiple(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'class_id' => 'required|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
        ]);

        try {
            $import = new StudentsImport($request->class_id, $request->academic_year_id, false);
            Excel::import($import, $request->file('file'));

            $successCount = $import->getSuccessCount();
            $failedCount = $import->getFailedCount();
            $errors = $import->getErrors();

            if ($successCount > 0) {
                $message = "Berhasil mengimport {$successCount} siswa.";
                if ($failedCount > 0) {
                    $message .= " Gagal: {$failedCount} siswa.";
                }

                return redirect()->back()->with('success', $message)->with('importErrors', $errors);
            } else {
                return redirect()->back()->with('error', 'Tidak ada data yang berhasil diimport. Silakan periksa format file.');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengimport file: ' . $e->getMessage());
        }
    }

    /**
     * Download template Excel
     */
    public function downloadTemplate()
    {
        return Excel::download(new StudentsTemplateExport(), 'template_siswa.xlsx');
    }

    /**
     * Get classes for dropdown
     */
    public function getClasses()
    {
        $classes = ClassRoom::withCount('enrollments')->orderBy('level')->orderBy('name')->get();
        return response()->json($classes);
    }

    /**
     * Generate unique barcode for user
     */
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

    /**
     * Generate email from NIS
     */
    private function generateEmailFromNis($nis)
    {
        return "student.{$nis}@mtsn39.com";
    }
}
