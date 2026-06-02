<?php
// app/Http/Controllers/Admin/UploadExternalController.php

namespace App\Http\Controllers\Admin;

use App\Exports\ExternalsTemplateExport;
use App\Http\Controllers\Controller;
use App\Imports\ExternalsImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\External;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UploadExternalController extends Controller
{
    /**
     * Display the external upload page
     */
    public function index()
    {
        return Inertia::render('Admin/Uploads/Externals/ExternalUpload', [
            'flash' => session('flash'),
        ]);
    }

    /**
     * Create single external
     */
    public function storeSingle(Request $request)
    {
        // Auto-generate email from NIK
        $email = $this->generateEmailFromNik($request->nik);

        $validate = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nik' => 'required|string|unique:externals,nik',
            'gender' => 'required|in:male,female',
            'number_phone' => 'nullable|string',
        ]);

        // Override email with generated one
        $request->merge(['email' => $email]);

        try {
            DB::beginTransaction();

            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $email,
                'password' => Hash::make($request->nik),
                'role' => 'external',
                'barcode' => $this->generateBarcode(),
                'total_points' => 0,
            ]);

            // Create external profile
            External::create([
                'user_id' => $user->id,
                'nik' => $request->nik,
                'gender' => $request->gender,
                'number_phone' => $request->number_phone,
                'status' => 'active',
            ]);

            DB::commit();

            return back()->with('success', 'Pengguna eksternal berhasil ditambahkan! Password: ' . $request->nik . ', Email: ' . $email);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menambahkan pengguna eksternal: ' . $e->getMessage());
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
            $import = new ExternalsImport(true);
            Excel::import($import, $request->file('file'));

            $previewData = $import->getPreviewData();
            $validCount = count(array_filter($previewData, fn($item) => $item['status'] === 'valid'));
            $invalidCount = count(array_filter($previewData, fn($item) => $item['status'] === 'invalid'));

            // Get duplicate NIK from preview
            $nikCounts = [];
            foreach ($previewData as $data) {
                if ($data['status'] === 'valid') {
                    $nikCounts[$data['nik']] = ($nikCounts[$data['nik']] ?? 0) + 1;
                }
            }
            $duplicateNik = array_filter($nikCounts, fn($count) => $count > 1);

            return response()->json([
                'success' => true,
                'data' => $previewData,
                'summary' => [
                    'total' => count($previewData),
                    'valid' => $validCount,
                    'invalid' => $invalidCount,
                    'duplicate_nik' => array_keys($duplicateNik),
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
     * Import multiple externals from Excel
     */
    public function storeMultiple(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            $import = new ExternalsImport(false);
            Excel::import($import, $request->file('file'));

            $successCount = $import->getSuccessCount();
            $failedCount = $import->getFailedCount();
            $errors = $import->getErrors();

            if ($successCount > 0) {
                $message = "Berhasil mengimport {$successCount} pengguna eksternal.";
                if ($failedCount > 0) {
                    $message .= " Gagal: {$failedCount} pengguna.";
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
        return Excel::download(new ExternalsTemplateExport(), 'template_external.xlsx');
    }

    /**
     * Generate unique barcode for user
     */
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

    /**
     * Generate email from NIK
     */
    private function generateEmailFromNik($nik)
    {
        return "external.{$nik}@mtsn39.com";
    }
}
