<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYears;
use App\Models\Enrollments;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    public function index(Request $request)
    {
        $query = AcademicYears::query();

        // Search
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Sort
        $sort = $request->get('sort', 'name');
        $direction = $request->get('direction', 'desc');

        if ($sort === 'name') {
            $query->orderBy('name', $direction);
        } elseif ($sort === 'created_at') {
            $query->orderBy('created_at', $direction);
        } else {
            $query->orderBy($sort, $direction);
        }

        $academicYears = $query
            ->paginate(12)
            ->appends($request->query());

        // Get enrollment count for each academic year
        foreach ($academicYears as $academicYear) {
            $academicYear->students_count = Enrollments::where('academic_year_id', $academicYear->id)
                ->distinct('student_id')
                ->count('student_id');
        }

        return Inertia::render('Admin/AcademicYears/Index', [
            'academicYears' => $academicYears,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/AcademicYears/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($request) {
            // If setting as active, deactivate all others
            if ($request->boolean('is_active')) {
                AcademicYears::where('is_active', true)->update(['is_active' => false]);
            }

            AcademicYears::create([
                'name' => $request->name,
                'is_active' => $request->boolean('is_active'),
            ]);
        });

        return redirect()->route('admin.academic-years.index')
            ->with('success', 'Tahun ajaran berhasil ditambahkan');
    }

    public function edit(AcademicYears $academicYear)
    {
        return Inertia::render('Admin/AcademicYears/Edit', [
            'academicYear' => $academicYear,
        ]);
    }

    public function update(Request $request, AcademicYears $academicYear)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name,' . $academicYear->id,
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($request, $academicYear) {
            // If setting as active, deactivate all others
            if ($request->boolean('is_active') && !$academicYear->is_active) {
                AcademicYears::where('is_active', true)->update(['is_active' => false]);
            }

            $academicYear->update([
                'name' => $request->name,
                'is_active' => $request->boolean('is_active'),
            ]);
        });

        return redirect()->route('admin.academic-years.index')
            ->with('success', 'Tahun ajaran berhasil diperbarui');
    }

    public function destroy(AcademicYears $academicYear)
    {
        // Check if academic year has enrollments
        if ($academicYear->enrollments()->count() > 0) {
            return redirect()->route('admin.academic-years.index')
                ->with('error', 'Tahun ajaran tidak dapat dihapus karena masih memiliki data pendaftaran siswa');
        }

        $academicYear->delete();

        return redirect()->route('admin.academic-years.index')
            ->with('success', 'Tahun ajaran berhasil dihapus');
    }

    public function setActive(AcademicYears $academicYear)
    {
        DB::transaction(function () use ($academicYear) {
            AcademicYears::where('is_active', true)->update(['is_active' => false]);
            $academicYear->update(['is_active' => true]);
        });

        return redirect()->route('admin.academic-years.index')
            ->with('success', 'Tahun ajaran aktif berhasil diubah');
    }
}
