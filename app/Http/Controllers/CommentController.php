<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function index()
    {
        $comments = [
            'approved' => Comment::with(['user', 'post'])
                ->where('status', Comment::STATUS_APPROVED)
                ->whereNull('parent_id')
                ->orderBy('created_at', 'desc')
                ->get(),
            'pending' => Comment::with(['user', 'post'])
                ->where('status', Comment::STATUS_PENDING)
                ->whereNull('parent_id')
                ->orderBy('created_at', 'desc')
                ->get(),
            'spam' => Comment::with(['user', 'post'])
                ->where('status', Comment::STATUS_SPAM)
                ->whereNull('parent_id')
                ->orderBy('created_at', 'desc')
                ->get(),
        ];

        $counts = [
            'approved' => $comments['approved']->count(),
            'pending' => $comments['pending']->count(),
            'spam' => $comments['spam']->count(),
        ];

        return Inertia::render('Comments/Index', [
            'comments' => $comments,
            'counts' => $counts,
        ]);
    }

    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id'
        ]);

        $comment = new Comment([
            'content' => $validated['content'],
            'user_id' => Auth::id(),
            'post_id' => $post->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'status' => Auth::user()->can('moderate comments') ? 'approved' : 'pending'
        ]);

        $comment->save();

        return back()->with('success', 'Komentar berhasil ditambahkan');
    }

    public function update(Request $request, Comment $comment)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000'
        ]);

        $comment->update([
            'content' => $validated['content'],
            'edited_at' => now()
        ]);

        return back()->with('success', 'Komentar berhasil diperbarui');
    }

    public function destroy(Comment $comment)
    {
        $comment->delete();

        if (request()->expectsJson() || request()->ajax()) {
            return response()->json(['success' => true, 'message' => 'Komentar berhasil dihapus']);
        }

        return back()->with('success', 'Komentar berhasil dihapus');
    }

    public function moderate(Request $request, Comment $comment)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,pending,spam'
        ]);

        $comment->update([
            'status' => $validated['status'],
            'moderated_at' => now(),
            'moderated_by' => Auth::id()
        ]);

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Status komentar berhasil diperbarui']);
        }

        return back()->with('success', 'Status komentar berhasil diperbarui');
    }

    public function moderationQueue()
    {

        $pendingComments = Comment::with(['user', 'post'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return Inertia::render('Comments/Moderation', [
            'comments' => $pendingComments
        ]);
    }
}