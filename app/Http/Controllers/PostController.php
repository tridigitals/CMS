<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $publishedPosts = Post::with(['category', 'author'])
            ->withCount('comments')
            ->published()
            ->latest()
            ->get();

        $draftPosts = Post::with(['category', 'author'])
            ->withCount('comments')
            ->draft()
            ->latest()
            ->get();

        $trashedPosts = Post::with(['category', 'author'])
            ->withCount('comments')
            ->trash()
            ->latest()
            ->get();

        return Inertia::render('Posts/Index', [
            'posts' => [
                'published' => $publishedPosts->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'content' => Str::limit($post->content, 100),
                        'category' => $post->category->name,
                        'status' => $post->status,
                        'author' => [
                            'name' => $post->author->name,
                        ],
                        'created_at' => $post->created_at ? $post->created_at->format('Y-m-d H:i:s') : null,
                        'updated_at' => $post->updated_at ? $post->updated_at->format('Y-m-d H:i:s') : null,
                        'comments_count' => $post->comments_count,
                    ];
                }),
                'draft' => $draftPosts->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'content' => Str::limit($post->content, 100),
                        'category' => $post->category->name,
                        'status' => $post->status,
                        'author' => [
                            'name' => $post->author->name,
                        ],
                        'created_at' => $post->created_at ? $post->created_at->format('Y-m-d H:i:s') : null,
                        'updated_at' => $post->updated_at ? $post->updated_at->format('Y-m-d H:i:s') : null,
                        'comments_count' => $post->comments_count,
                    ];
                }),
                'trash' => $trashedPosts->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'content' => Str::limit($post->content, 100),
                        'category' => $post->category->name,
                        'status' => $post->status,
                        'author' => [
                            'name' => $post->author->name,
                        ],
                        'created_at' => $post->created_at ? $post->created_at->format('Y-m-d H:i:s') : null,
                        'updated_at' => $post->updated_at ? $post->updated_at->format('Y-m-d H:i:s') : null,
                        'comments_count' => $post->comments_count,
                    ];
                }),
            ],
            'counts' => [
                'published' => $publishedPosts->count(),
                'draft' => $draftPosts->count(),
                'trash' => $trashedPosts->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::all();
        $tags = \Spatie\Tags\Tag::all();
        return Inertia::render('Posts/Create', [
            'categories' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                ];
            }),
            'tags' => $tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                ];
            }),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Add image validation
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id',
        ]);

        $post = Post::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'content' => $request->content,
            'category_id' => $request->category_id,
            'meta_description' => $request->meta_description,
            'meta_keywords' => $request->meta_keywords,
            'status' => Post::STATUS_DRAFT,
            'author_id' => auth()->id(),
            'updated_at' => now(),
        ]);

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $post->addMediaFromRequest('featured_image')->toMediaCollection('featured_image');
        }

        if ($request->tags) {
            $tagNames = \Spatie\Tags\Tag::whereIn('id', $request->tags)->pluck('name')->toArray();
            $post->syncTags($tagNames);
        }

        return redirect('/posts')->with('success', 'Post created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        $post->load(['category', 'author', 'revisions.author']);

        return Inertia::render('Posts/Show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => $post->content,
                'category' => $post->category->name,
                'status' => $post->status,
                'meta_description' => $post->meta_description,
                'meta_keywords' => $post->meta_keywords,
                'featured_image_url' => $post->featured_image_url,
                'author' => [
                    'name' => $post->author->name,
                ],
                'created_at' => $post->created_at ? $post->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $post->updated_at ? $post->updated_at->format('Y-m-d H:i:s') : null,
                'revisions' => $post->revisions->map(function ($revision) {
                    return [
                        'id' => $revision->id,
                        'author' => $revision->author->name,
                        'changes' => $revision->changes,
                        'created_at' => $revision->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
            ],
        ]);
        /**
         * Get all images in the media library (for modal/gallery).
         */
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        $categories = Category::all();
        $tags = \Spatie\Tags\Tag::all();
        $post->load(['revisions.author']);
        return Inertia::render('Posts/Edit', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => $post->content,
                'category_id' => $post->category_id,
                'status' => $post->status,
                'meta_description' => $post->meta_description,
                'meta_keywords' => $post->meta_keywords,
                'featured_image_url' => $post->featured_image_url,
                'tags' => $post->tags->pluck('id')->toArray(),
                'revisions' => $post->revisions->map(function ($revision) {
                    return [
                        'id' => $revision->id,
                        'author' => $revision->author->name,
                        'changes' => $revision->changes,
                        'created_at' => $revision->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
            ],
            'categories' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                ];
            }),
            'tagsList' => $tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                ];
            }),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        // Note: When sending FormData with PUT/PATCH, Laravel/PHP might have issues reading
        // normal fields if a file is present. We validate the file separately if needed.
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id',
        ]);

        // Validate image separately if present
        if ($request->hasFile('featured_image')) {
            $request->validate([
                'featured_image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);
        }

        // Update post with validated data (excluding the file for now)
        $post->update($validatedData);
        $post->updated_at = now();
        $post->save();

        // Handle featured image upload if present
        if ($request->hasFile('featured_image')) {
            // Clear existing image before adding new one
            $post->clearMediaCollection('featured_image');
            $post->addMediaFromRequest('featured_image')->toMediaCollection('featured_image');
        }

        // Remove featured image if requested
        if ($request->input('remove_featured_image')) {
            $post->clearMediaCollection('featured_image');
        }

        if ($request->tags) {
            $tagNames = \Spatie\Tags\Tag::whereIn('id', $request->tags)->pluck('name')->toArray();
            $post->syncTags($tagNames);
        }

        return redirect('/posts')->with('success', 'Post updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $post->delete();
        return redirect('/posts')->with('success', 'Post deleted successfully.');
    }

    /**
     * Update post status
     */
    public function updateStatus(Request $request, Post $post)
    {
        $request->validate([
            'status' => 'required|in:draft,published,trash',
        ]);

        $post->toggleStatus($request->status);
        return redirect()->back()->with('success', 'Post status updated successfully.');
    }

    /**
     * Restore the post from trash
     */
    public function restore(Post $post)
    {
        $post->restore();
        return redirect()->back()->with('success', 'Post restored successfully.');
    }

    /**
     * Get post revisions
     */
    public function revisions(Post $post)
    {
        return response()->json($post->revisions->load('author'));
    }
    /**
     * Permanently delete a post from storage.
     */
    public function forceDelete(Post $post)
    {
        $post->forceDelete();

        if (request()->expectsJson() || request()->ajax()) {
            return response()->json(['success' => true, 'message' => 'Post permanently deleted']);
        }

        return redirect()->back()->with('success', 'Post permanently deleted');
    }

    /**
     * Restore a post to a specific revision.
     */
    public function restoreRevision(Post $post, $revisionId)
    {
        $revision = $post->revisions()->findOrFail($revisionId);

        $post->update([
            'title' => $revision->title,
            'content' => $revision->content,
            'meta_description' => $revision->meta_description,
            'meta_keywords' => $revision->meta_keywords,
        ]);

        return redirect()->back()->with('success', 'Post restored to selected revision.');
    }

    public function mediaLibrary(Request $request)
    {
        $query = \Spatie\MediaLibrary\MediaCollections\Models\Media::where('collection_name', 'featured_image')
            ->orderBy('created_at', 'desc');

        // Apply search if provided
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Paginate results
        $media = $query->paginate(12)->through(function ($media) {
            return [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'name' => $media->name,
                'created_at' => $media->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json($media);
    }

    /**
     * Upload a media file to the library
     */
    public function uploadMedia(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // Create a temporary post to hold the media
        $tempPost = new Post([
            'title' => 'Media Library ' . now()->format('Y-m-d H:i:s'),
            'slug' => 'media-library-' . now()->timestamp,
            'content' => 'Temporary post for media library',
            'author_id' => auth()->id(),
            'category_id' => 1, // Default category
            'status' => 'draft'
        ]);
        $tempPost->save();

        // Add the media to the temporary post
        $media = $tempPost->addMediaFromRequest('file')
            ->toMediaCollection('featured_image');

        return response()->json([
            'id' => $media->id,
            'url' => $media->getUrl(),
            'name' => $media->name,
            'created_at' => $media->created_at->format('Y-m-d H:i:s'),
        ]);
    }
}
