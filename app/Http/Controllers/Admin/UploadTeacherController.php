<?php
// app/Http/Controllers/Admin/UploadTeacherController.php

namespace App\Http\Controllers\Admin;

use App\Exports\TeachersTemplateExport;
use App\Http\Controllers\Controller;
use App\Imports\TeachersImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UploadTeacherController extends Controller
{
    /**
     * Display the teacher upload page
     */
    public function index()
    {
        return Inertia::render('Admin/Uploads/Teachers/TeacherUpload', [
            'flash' => session('flash'),
        ]);
    }

    /**
     * Create single teacher
     */
    public function storeSingle(Request $request)
    {
        // Auto-generate email from NIP
        $email = $this->generateEmailFromNip($request->nip);

        $validate = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nip' => 'required|string|unique:teachers,nip',
            'subject' => 'required|string|max:255',
            'phone' => 'nullable|string',
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
                'password' => Hash::make($request->nip),
                'role' => 'teacher',
                'barcode' => $this->generateBarcode(),
                'total_points' => 0,
            ]);

            // Create teacher profile
            Teacher::create([
                'user_id' => $user->id,
                'nip' => $request->nip,
                'subject' => $request->subject,
                'phone' => $request->phone,
                'address' => $request->address,
            ]);

            DB::commit();

            return back()->with('success', 'Guru berhasil ditambahkan! Password: ' . $request->nip . ', Email: ' . $email);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menambahkan guru: ' . $e->getMessage());
        }
    }

    /**
     * Preview imported data from Excel
     */
    public function previewMultiple(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            $import = new TeachersImport(true);
            Excel::import($import, $request->file('file'));

            $previewData = $import->getPreviewData();
            $validCount = count(array_filter($previewData, fn($item) => $item['status'] === 'valid'));
            $invalidCount = count(array_filter($previewData, fn($item) => $item['status'] === 'invalid'));

            // Get duplicate NIP from preview
            $nipCounts = [];
            foreach ($previewData as $data) {
                if ($data['status'] === 'valid') {
                    $nipCounts[$data['nip']] = ($nipCounts[$data['nip']] ?? 0) + 1;
                }
            }
            $duplicateNip = array_filter($nipCounts, fn($count) => $count > 1);

            return response()->json([
                'success' => true,
                'data' => $previewData,
                'summary' => [
                    'total' => count($previewData),
                    'valid' => $validCount,
                    'invalid' => $invalidCount,
                    'duplicate_nip' => array_keys($duplicateNip),
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
     * Import multiple teachers from Excel
     */
    public function storeMultiple(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            $import = new TeachersImport(false);
            Excel::import($import, $request->file('file'));

            $successCount = $import->getSuccessCount();
            $failedCount = $import->getFailedCount();
            $errors = $import->getErrors();

            if ($successCount > 0) {
                $message = "Berhasil mengimport {$successCount} guru.";
                if ($failedCount > 0) {
                    $message .= " Gagal: {$failedCount} guru.";
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
        return Excel::download(new TeachersTemplateExport(), 'template_guru.xlsx');
    }

    /**
     * Generate unique barcode for user
     */
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

    /**
     * Generate email from NIP
     */
    private function generateEmailFromNip($nip)
    {
        return "teacher.{$nip}@mtsn39.com";
    }
}
