<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Reaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReactionController extends Controller
{
    public function toggle(Request $request, Book $book)
    {
        $request->validate([
            'type' => 'required|in:like,love,haha,angry,sad'
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $existingReaction = Reaction::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->first();

        $userReaction = null;

        if ($existingReaction) {
            if ($existingReaction->type === $request->type) {
                // Remove reaction if same type
                $existingReaction->delete();
                $userReaction = null;
                $message = 'Reaction removed';
            } else {
                // Update reaction type
                $existingReaction->update(['type' => $request->type]);
                $userReaction = $request->type;
                $message = 'Reaction updated';
            }
        } else {
            // Create new reaction
            Reaction::create([
                'user_id' => $user->id,
                'book_id' => $book->id,
                'type' => $request->type
            ]);
            $userReaction = $request->type;
            $message = 'Reaction added';
        }

        // Refresh book instance to get updated counts
        $book->refresh();
        $reactionsCount = [
            'like' => $book->reactions()->where('type', 'like')->count(),
            'love' => $book->reactions()->where('type', 'love')->count(),
            'haha' => $book->reactions()->where('type', 'haha')->count(),
            'angry' => $book->reactions()->where('type', 'angry')->count(),
            'sad' => $book->reactions()->where('type', 'sad')->count(),
            'total' => $book->reactions()->count(),
        ];

        return response()->json([
            'message' => $message,
            'reactions_count' => $reactionsCount,
            'user_reaction' => $userReaction
        ]);
    }
}
