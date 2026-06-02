<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::query();

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('category', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        // Sort
        $sort = $request->get('sort', 'date');
        $direction = $request->get('direction', 'desc');

        if ($sort === 'title') {
            $query->orderBy('title', $direction);
        } elseif ($sort === 'category') {
            $query->orderBy('category', $direction);
        } elseif ($sort === 'date') {
            $query->orderBy('date', $direction);
        } else {
            $query->orderBy($sort, $direction);
        }

        $announcements = $query
            ->paginate(12)
            ->appends($request->query());

        // Get unique categories for filter
        $categories = Announcement::select('category')->distinct()->pluck('category');

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
            'filters' => [
                'search' => $request->get('search', ''),
                'category' => $request->get('category', ''),
                'status' => $request->get('status', ''),
                'date_from' => $request->get('date_from', ''),
                'date_to' => $request->get('date_to', ''),
                'sort' => $sort,
                'direction' => $direction,
            ],
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Announcements/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'date' => 'required|date',
            'is_active' => 'boolean',
        ]);

        Announcement::create([
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'date' => $request->date,
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Pengumuman berhasil ditambahkan');
    }

    public function edit(Announcement $announcement)
    {
        return Inertia::render('Admin/Announcements/Edit', [
            'announcement' => $announcement,
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'date' => 'required|date',
            'is_active' => 'boolean',
        ]);

        $announcement->update([
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'date' => $request->date,
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Pengumuman berhasil diperbarui');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Pengumuman berhasil dihapus');
    }

    public function toggleStatus(Announcement $announcement)
    {
        $announcement->update([
            'is_active' => !$announcement->is_active
        ]);

        return back()->with('success', 'Status pengumuman berhasil diubah');
    }
}
