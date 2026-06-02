<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYears;
use App\Models\ClassRoom;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function students(Request $request)
    {
        // Load student with active enrollment and class
        $query = User::with(['student' => function ($q) {
            $q->with(['activeEnrollment' => function ($eq) {
                $eq->with(['classRoom', 'academicYear']);
            }]);
        }])->where('role', 'student');

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhereHas('student', function ($sq) use ($request) {
                        $sq->where('nis', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        // Filter by class
        if ($request->filled('class_id')) {
            $query->whereHas('student.activeEnrollment', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        // Sort
        $sort = $request->get('sort', 'created_at');
        $direction = $request->get('direction', 'desc');

        if ($sort === 'nis') {
            $query->join('students', 'users.id', '=', 'students.user_id')
                ->orderBy('students.nis', $direction)
                ->select('users.*');
        } elseif ($sort === 'class_name') {
            $query->leftJoin('enrollments', function ($join) {
                $join->on('users.id', '=', 'enrollments.student_id')
                    ->join('academic_years', function ($aq) {
                        $aq->on('enrollments.academic_year_id', '=', 'academic_years.id')
                            ->where('academic_years.is_active', true);
                    });
            })
                ->leftJoin('classes', 'enrollments.class_id', '=', 'classes.id')
                ->orderBy('classes.name', $direction)
                ->select('users.*');
        } else {
            $query->orderBy($sort, $direction);
        }
        /** @var \Illuminate\Pagination\LengthAwarePaginator $users */
        $users = $query->paginate(12);

        $users->getCollection()->transform(function ($user) {
            $student = $user->student;
            $activeEnrollment = $student?->activeEnrollment;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'barcode' => $user->barcode,
                'total_points' => $user->total_points,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'student' => $student ? [
                    'id' => $student->id,
                    'nis' => $student->nis,
                    'gender' => $student->gender,
                    'parent_phone' => $student->parent_phone,
                    'address' => $student->address,
                    'status' => $student->status,
                    'current_class' => $activeEnrollment?->classRoom ? [
                        'id' => $activeEnrollment->classRoom->id,
                        'name' => $activeEnrollment->classRoom->name,
                        'level' => $activeEnrollment->classRoom->level,
                    ] : null,
                    'academic_year' => $activeEnrollment?->academicYear ? [
                        'id' => $activeEnrollment->academicYear->id,
                        'name' => $activeEnrollment->academicYear->name,
                    ] : null,
                ] : null,
            ];
        });

        $users->appends($request->query());

        // Get active academic year
        $activeAcademicYear = AcademicYears::where('is_active', true)->first();

        // Get classes for filter
        $classes = ClassRoom::orderBy('level')->orderBy('name')->get();

        // Get statuses for filter with labels
        $statuses = [
            'active' => 'Aktif',
            'graduated' => 'Lulus',
            'transferred' => 'Pindah',
            'dropped' => 'Drop Out',
        ];

        return Inertia::render('Admin/Users/Students', [
            'users' => $users,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'class_id' => $request->get('class_id', ''),
                'sort' => $sort,
                'direction' => $direction,
            ],
            'classes' => $classes,
            'statuses' => $statuses,
            'activeAcademicYear' => $activeAcademicYear ? [
                'id' => $activeAcademicYear->id,
                'name' => $activeAcademicYear->name,
            ] : null,
        ]);
    }

    public function teachers(Request $request)
    {
        $query = User::with('teacher')
            ->where('role', 'teacher');

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhereHas('teacher', function ($sq) use ($request) {
                        $sq->where('nip', 'like', '%' . $request->search . '%')
                            ->orWhere('subject', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Sort
        $sort = $request->get('sort', 'created_at');
        $direction = $request->get('direction', 'desc');

        if ($sort === 'nip') {
            $query->join('teachers', 'users.id', '=', 'teachers.user_id')
                ->orderBy('teachers.nip', $direction)
                ->select('users.*');
        } else {
            $query->orderBy($sort, $direction);
        }

        $users = $query
            ->paginate(12)
            ->appends($request->query());

        return Inertia::render('Admin/Users/Teachers', [
            'users' => $users,
            'filters' => [
                'search' => $request->get('search', ''),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function external(Request $request)
    {
        $query = User::where('role', 'external');



        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sort = $request->get('sort', 'created_at');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        $users = $query->paginate(12)->withQueryString();


        return Inertia::render('Admin/Users/External', [
            'users' => $users,
            'filters' => [
                'search' => $request->get('search', ''),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }




    public function showStudent($id)
    {
        $user = User::with([
            'student' => function ($query) {
                $query->with(['enrollments' => function ($q) {
                    $q->with(['classRoom', 'academicYear'])
                        ->orderBy('created_at', 'desc');
                }]);
            },
            'borrowings' => function ($query) {
                $query->with(['bookItem.physicalBook'])
                    ->orderBy('borrowed_at', 'desc')
                    ->limit(10);
            },
            'visits' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            },
            'pointHistories' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            }
        ])->find($id);

        // Get active academic year for current class
        $activeAcademicYear = AcademicYears::where('is_active', true)->first();

        // Find current active enrollment
        $currentEnrollment = null;
        if ($activeAcademicYear) {
            $currentEnrollment = $user->student?->enrollments
                ->where('academic_year_id', $activeAcademicYear->id)
                ->first();
        }

        // Get all class history
        $classHistory = $user->student?->enrollments
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'class_name' => $enrollment->classRoom?->name ?? '-',
                    'academic_year' => $enrollment->academicYear?->name ?? '-',
                    'is_active' => $enrollment->academicYear?->is_active ?? false,
                    'created_at' => $enrollment->created_at,
                ];
            }) ?? [];

        return Inertia::render('Admin/Users/ShowStudent', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'barcode' => $user->barcode,
                'total_points' => $user->total_points,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'student' => $user->student ? [
                    'id' => $user->student->id,
                    'nis' => $user->student->nis,
                    'gender' => $user->student->gender,
                    'parent_phone' => $user->student->parent_phone,
                    'address' => $user->student->address,
                    'status' => $user->student->status,
                    'current_class' => $currentEnrollment?->classRoom?->name ?? 'Belum memiliki kelas',
                    'current_class_id' => $currentEnrollment?->class_id,
                    'current_academic_year' => $currentEnrollment?->academicYear?->name ?? null,
                    'class_history' => $classHistory,
                ] : null,
            ],
            'borrowings' => $user->borrowings,
            'visits' => $user->visits,
            'pointHistory' => $user->pointHistories,
            'activeAcademicYear' => $activeAcademicYear,
        ]);
    }

    public function showTeacher(User $user)
    {
        $user->load('teacher');
        $borrowings = $user->borrowings()->with('bookItem.physicalBook')->orderBy('borrowed_at', 'desc')->limit(10)->get();
        $visits = $user->visits()->orderBy('created_at', 'desc')->limit(10)->get();

        return Inertia::render('Admin/Users/ShowTeacher', [
            'user' => $user,
            'borrowings' => $borrowings,
            'visits' => $visits,
        ]);
    }

    public function showExternal(User $user)
    {
        $user->load('external');


        $borrowings = $user->borrowings()->with('bookItem.physicalBook')->orderBy('borrowed_at', 'desc')->limit(10)->get();
        $visits = $user->visits()->orderBy('created_at', 'desc')->limit(10)->get();

        return Inertia::render('Admin/Users/ShowExternal', [
            'user' => $user,
            'borrowings' => $borrowings,
            'visits' => $visits,
        ]);
    }

    public function resetBarcode(User $user)
    {
        $user->update([
            'barcode' => Str::random(16)
        ]);

        return back()->with('success', 'Barcode berhasil direset');
    }
}
