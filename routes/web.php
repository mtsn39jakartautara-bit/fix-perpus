<?php

use App\Http\Controllers\Admin\AcademicYearController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\BookController;
use App\Http\Controllers\Admin\BorrowingController as AdminBorrowingController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\ClassPromotionController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\PhysicalBookController;
use App\Http\Controllers\Admin\PointController;
use App\Http\Controllers\Admin\ReturnController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StudentStatusController;
use App\Http\Controllers\Admin\UploadExternalController;
use App\Http\Controllers\Admin\UploadStudentController;
use App\Http\Controllers\Admin\UploadTeacherController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VisitController as AdminVisitController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\ReadingSessionController;
use App\Http\Controllers\TestingController;
use App\Http\Controllers\VisitController;
use App\Http\Controllers\WishlistController;
use App\Models\ClassRoom;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//----------------- test


Route::get('/barcode/user', [TestingController::class, 'user']);
Route::get('/barcode/buku', [TestingController::class, 'buku']);
Route::get('/barcode/visit', [TestingController::class, 'visit']);


Route::get('/today', [TestingController::class, 'today']);


Route::post('/testing', [TestingController::class, 'test'])->name('testing');
//----------------- test

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/test-403', fn() => abort(403));
Route::get('/test-404', fn() => abort(404));
Route::get('/test-419', fn() => abort(419));
Route::get('/test-500', fn() => abort(500));

Route::middleware('auth')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard.index');


    // perpus
    Route::get('/perpus', [LibraryController::class, 'index'])->name('perpus.index');
    Route::get('/perpus/{uuid}', [LibraryController::class, 'show'])->name('perpus.show');

    Route::prefix('reading')->group(function () {
        Route::get('/session/{book}', [ReadingSessionController::class, 'getSession']);
        Route::put('/session/{book}', [ReadingSessionController::class, 'updateSession']);
        Route::post('/claim/{book}', [ReadingSessionController::class, 'claimReward']);
    });

    //Reaction Book
    Route::post('/books/{book}/reaction', [ReactionController::class, 'toggle'])->name('reaction.toggle');

    // bookmark
    Route::prefix('books')->name('bookmark.')->group(function () {
        Route::post('/{book}/bookmark', [BookmarkController::class, 'store'])->name('store');
        Route::get('/{book}/bookmark', [BookmarkController::class, 'show'])->name('show');
        Route::delete('/{book}/bookmark', [BookmarkController::class, 'destroy'])->name('destroy');
    });


    // visit
    Route::get('/visits', [VisitController::class, 'index'])->name('visits.index');
    Route::post('/visits/scan', [VisitController::class, 'scanCheckpoint'])->name('visits.scan');
    Route::get('/visits/activities', [VisitController::class, 'getActivities'])->name('visits.activities');
    Route::get('/visits/user-barcode', [VisitController::class, 'getUserBarcode'])->name('visits.user-barcode');

    // borrow
    Route::get('/borrowings', [BorrowingController::class, 'index'])->name('borrowing.index');
    Route::post('/borrowings/{id}/return', [BorrowingController::class, 'returnBook'])->name('borrowings.return');
    Route::post('/borrowings/{id}/extend', [BorrowingController::class, 'extendBook'])->name('borrowings.extend');

    // wishlist
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::put('/wishlist/{id}', [WishlistController::class, 'update'])->name('wishlist.update');
    Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::post('/wishlist/bulk-destroy', [WishlistController::class, 'bulkDestroy'])->name('wishlist.bulk-destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Manajemen Buku Digital
        Route::resource('books/digital', BookController::class)->names('books.digital');

        // Manajemen Buku Fisik
        Route::resource('books/physical', PhysicalBookController::class)->names('books.physical');

        Route::post('/books/physical/{physical}/add-item', [PhysicalBookController::class, 'addItem'])->name('books.physical.add-item');
        Route::delete('/books/physical/items/{item}', [PhysicalBookController::class, 'deleteItem'])->name('books.physical.delete-item');
        Route::put('/books/physical/items/{item}/status', [PhysicalBookController::class, 'updateItemStatus'])->name('books.physical.update-item-status');

        // Kategori
        Route::resource('categories', CategoryController::class);

        // Manajemen User
        Route::get('/users/students', [UserController::class, 'students'])->name('users.students');
        Route::get('/users/teachers', [UserController::class, 'teachers'])->name('users.teachers');
        Route::get('/users/external', [UserController::class, 'external'])->name('users.external');

        // Detail User
        Route::get('/users/students/{user}', [UserController::class, 'showStudent'])->name('users.show.student');
        Route::get('/users/teachers/{user}', [UserController::class, 'showTeacher'])->name('users.show.teacher');
        Route::get('/users/external/{user}', [UserController::class, 'showExternal'])->name('users.show.external');

        // Reset Barcode
        Route::post('/users/{user}/reset-barcode', [UserController::class, 'resetBarcode'])->name('users.reset-barcode');

        // Peminjaman
        // Borrowing routes
        Route::get('/borrowing', [AdminBorrowingController::class, 'index'])->name('borrowing.index');

        //find barcode user
        Route::post('/borrowing/find-user', [AdminBorrowingController::class, 'findUser'])->name('borrowing.find-user');

        //search manual user
        Route::get('/borrowing/search-users', [AdminBorrowingController::class, 'searchUsers'])->name('borrowing.search-users');

        Route::post('/borrowing/find-book-item', [AdminBorrowingController::class, 'findBookItem'])->name('borrowing.find-book-item');
        Route::post('/borrowing/search-books', [AdminBorrowingController::class, 'searchPhysicalBooks'])->name('borrowing.search-books');
        Route::get('/borrowing/book-items/{physicalBookId}', [AdminBorrowingController::class, 'getBookItems'])->name('borrowing.book-items');
        Route::post('/borrowing/store', [AdminBorrowingController::class, 'store'])->name('borrowing.store');
        Route::get('/borrowing/recent', [AdminBorrowingController::class, 'recent'])->name('borrowing.recent');

        // Pengembalian
        Route::prefix('returns')->name('returns.')->group(function () {
            Route::get('/', [ReturnController::class, 'index'])->name('index');
            Route::get('/find-user', [ReturnController::class, 'findUser'])->name('find-user');
            Route::get('/search-users', [ReturnController::class, 'searchUsers'])->name('search-users');
            Route::post('/process', [ReturnController::class, 'processReturn'])->name('process');
        });

        Route::get('/visits', [AdminVisitController::class, 'index'])->name('visits.index');
        Route::get('/visits/search', [AdminVisitController::class, 'search'])->name('visits.search');
        Route::post('/visits/scan', [AdminVisitController::class, 'scan'])->name('visits.scan');
        Route::post('/visits/manual', [AdminVisitController::class, 'manual'])->name('visits.manual');

        Route::post('/visits/batch', [AdminVisitController::class, 'batch'])->name('visits.batch');

        // Kelas
        Route::resource('classes', ClassController::class);

        // Tahun Ajaran
        Route::resource('academic-years', AcademicYearController::class);
        Route::post('/academic-years/{academicYear}/set-active', [AcademicYearController::class, 'setActive'])->name('academic-years.set-active');

        // Manajemen Point
        Route::get('/point', [PointController::class, 'index'])->name('points.index');
        Route::get('/points/{id}', [PointController::class, 'show'])->name('points.show');
        Route::post('/point-reset', [PointController::class, 'reset'])->name('points.reset');

        // Pengumuman
        Route::resource('announcements', AnnouncementController::class);
        Route::post('/announcements/{announcement}/toggle-status', [AnnouncementController::class, 'toggleStatus'])->name('announcements.toggle-status');

        // Pengaturan
        Route::get('/settings', [SettingController::class, 'index'])->name('settings');


        // Student upload routes
        Route::get('/students/upload', [UploadStudentController::class, 'index'])
            ->name('students.upload');
        Route::post('/students/single', [UploadStudentController::class, 'storeSingle'])
            ->name('students.single');
        Route::post('/students/multiple', [UploadStudentController::class, 'storeMultiple'])
            ->name('students.multiple');
        Route::post('/students/preview', [UploadStudentController::class, 'previewMultiple'])
            ->name('students.preview');
        Route::get('/students/template', [UploadStudentController::class, 'downloadTemplate'])
            ->name('students.template');
        Route::get('/students/classes', [UploadStudentController::class, 'getClasses'])
            ->name('students.classes');


        // Teacher upload routes
        Route::get('/teachers/upload', [UploadTeacherController::class, 'index'])
            ->name('teachers.upload');
        Route::post('/teachers/single', [UploadTeacherController::class, 'storeSingle'])
            ->name('teachers.single');
        Route::post('/teachers/multiple', [UploadTeacherController::class, 'storeMultiple'])
            ->name('teachers.multiple');
        Route::post('/teachers/preview', [UploadTeacherController::class, 'previewMultiple'])
            ->name('teachers.preview');
        Route::get('/teachers/template', [UploadTeacherController::class, 'downloadTemplate'])
            ->name('teachers.template');

        // External upload routes
        Route::get('/externals/upload', [UploadExternalController::class, 'index'])
            ->name('externals.upload');
        Route::post('/externals/single', [UploadExternalController::class, 'storeSingle'])
            ->name('externals.single');
        Route::post('/externals/multiple', [UploadExternalController::class, 'storeMultiple'])
            ->name('externals.multiple');
        Route::post('/externals/preview', [UploadExternalController::class, 'previewMultiple'])
            ->name('externals.preview');
        Route::get('/externals/template', [UploadExternalController::class, 'downloadTemplate'])
            ->name('externals.template');

        // Class promotion routes
        Route::get('/class-promotion', [ClassPromotionController::class, 'index'])
            ->name('class-promotion');
        Route::get('/class-promotion/search', [ClassPromotionController::class, 'searchStudents'])
            ->name('class-promotion.search');
        Route::post('/class-promotion/single', [ClassPromotionController::class, 'promoteSingle'])
            ->name('class-promotion.single');
        Route::post('/class-promotion/multiple', [ClassPromotionController::class, 'promoteMultiple'])
            ->name('class-promotion.multiple');
        Route::post('/class-promotion/preview', [ClassPromotionController::class, 'previewMultiple'])
            ->name('class-promotion.preview');
        Route::get('/class-promotion/template', [ClassPromotionController::class, 'downloadTemplate'])
            ->name('class-promotion.template');
        Route::get('/class-promotion/student-class/{studentId}', [ClassPromotionController::class, 'getStudentClass'])
            ->name('class-promotion.student-class');


        // Student status routes
        Route::get('/student-status', [StudentStatusController::class, 'index'])
            ->name('student-status');
        Route::get('/student-status/search', [StudentStatusController::class, 'searchStudents'])
            ->name('student-status.search');
        Route::get('/classes/by-name/{name}', function ($name) {
            $class = ClassRoom::where('name', $name)->where('level', 0)->first();
            return response()->json($class);
        })->name('classes.by-name');
        Route::post('/student-status/single', [StudentStatusController::class, 'updateSingle'])
            ->name('student-status.single');
        Route::post('/student-status/multiple', [StudentStatusController::class, 'updateMultiple'])
            ->name('student-status.multiple');
        Route::post('/student-status/preview', [StudentStatusController::class, 'previewMultiple'])
            ->name('student-status.preview');
        Route::get('/student-status/template', [StudentStatusController::class, 'downloadTemplate'])
            ->name('student-status.template');
    });




require __DIR__ . '/auth.php';

// note : cara ambil kelas student

// $student = Student::find(2);
// $student = $student->current_class_name;

// dd($student);
// dd($student->class_histories);


// untuk menampilkan priode yang dia ikuti
// PointPeriodResult::query()
//     ->where('user_id', auth()->id())
//     ->with('pointPeriod')
//     ->latest()
//     ->get();
