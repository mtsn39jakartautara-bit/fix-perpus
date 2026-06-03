<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\AcademicYear;
use App\Models\AcademicYears;
use App\Models\ClassRoom;
use App\Models\Enrollments;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    public function index(Request $request)
    {
        $query = ClassRoom::withCount(['enrollments' => function ($q) {
            $activeAcademicYear = AcademicYears::where('is_active', true)->first();
            if ($activeAcademicYear) {
                $q->where('academic_year_id', $activeAcademicYear->id);
            }
        }]);

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('level', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by level
        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        // Sort
        $sort = $request->get('sort', 'level');
        $direction = $request->get('direction', 'asc');

        if ($sort === 'name') {
            $query->orderBy('level', $direction)->orderBy('name', $direction);
        } else {
            $query->orderBy($sort, $direction);
        }

        $classes = $query->paginate(12)->withQueryString();

        // Get student count for each class & CASTING MANUAL
        $activeAcademicYear = AcademicYears::where('is_active', true)->first();
        if ($activeAcademicYear) {
            foreach ($classes as $class) {
                $class->students_count = Enrollments::where('class_id', $class->id)
                    ->where('academic_year_id', $activeAcademicYear->id)
                    ->count();

                // 👇 CASTING MANUAL untuk students_count
                $class->students_count = (int) $class->students_count;
            }
        }

        // 👇 CASTING MANUAL untuk semua classes
        foreach ($classes as $class) {
            $class->id = (int) $class->id;
            $class->level = (int) $class->level;
            $class->enrollments_count = (int) ($class->enrollments_count ?? 0);
        }

        // Get available levels (sudah integer dari pluck, tapi amankan)
        $levels = ClassRoom::select('level')->distinct()->orderBy('level')->pluck('level');
        $levels = $levels->map(function ($level) {
            return (int) $level;
        });

        return Inertia::render('Admin/Classes/Index', [
            'classes' => $classes,
            'filters' => [
                'search' => $request->get('search', ''),
                'level' => $request->get('level', ''),
                'sort' => $sort,
                'direction' => $direction,
            ],
            'levels' => $levels,
            'activeAcademicYear' => $activeAcademicYear,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Classes/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:classes,name',
            'level' => 'required|integer|min:1|max:12',
        ]);

        ClassRoom::create([
            'name' => $request->name,
            'level' => $request->level,
        ]);

        return redirect()->route('admin.classes.index')
            ->with('success', 'Kelas berhasil ditambahkan');
    }

    public function edit($id)
    {
        $class = ClassRoom::find($id);
        return Inertia::render('Admin/Classes/Edit', [
            'class' => $class,
        ]);
    }

    public function update(Request $request,  $id)
    {
        $class = ClassRoom::find($id);
        $request->validate([
            'name' => 'required|string|max:255|unique:classes,name,' . $class->id,
            'level' => 'required|integer|min:1|max:12',
        ]);

        $class->update([
            'name' => $request->name,
            'level' => $request->level,
        ]);

        return redirect()->route('admin.classes.index')
            ->with('success', 'Kelas berhasil diperbarui');
    }

    public function destroy($id)
    {
        $class = ClassRoom::find($id);
        // Check if class has enrollments
        if ($class->enrollments()->count() > 0) {
            return redirect()->route('admin.classes.index')
                ->with('error', 'Kelas tidak dapat dihapus karena masih memiliki siswa terdaftar');
        }

        $class->delete();

        return redirect()->route('admin.classes.index')
            ->with('success', 'Kelas berhasil dihapus');
    }

    public function show($id)
    {
        $class = ClassRoom::find($id);
        $activeAcademicYear = AcademicYears::where('is_active', true)->first();

        $class->load(['enrollments' => function ($q) use ($activeAcademicYear) {
            if ($activeAcademicYear) {
                $q->where('academic_year_id', $activeAcademicYear->id);
            }
            $q->with(['student.user', 'academicYear']);
        }]);

        $students = [];
        if ($activeAcademicYear) {
            $students = Student::whereHas('enrollments', function ($q) use ($class, $activeAcademicYear) {
                $q->where('class_id', $class->id)
                    ->where('academic_year_id', $activeAcademicYear->id);
            })->with('user')->get();
        }

        return Inertia::render('Admin/Classes/Show', [
            'class' => $class,
            'students' => $students,
            'activeAcademicYear' => $activeAcademicYear,
        ]);
    }
}
