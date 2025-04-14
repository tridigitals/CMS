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
        $posts = Post::with('category')->get();

        return Inertia::render('Posts/Index', [
            'posts' => $posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'content' => $post->content,
                    'category' => $post->category->name,
                    'meta_description' => $post->meta_description,
                    'meta_keywords' => $post->meta_keywords,
                    'featured_image_url' => $post->featured_image_url,
                    'created_at' => $post->created_at ? $post->created_at->format('Y-m-d H:i:s') : null,
                    'updated_at' => $post->updated_at ? $post->updated_at->format('Y-m-d H:i:s') : null,
                ];
            }),
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
            'title' => 'required',
            'content' => 'required',
            'category_id' => 'required|exists:categories,id',
            'meta_description' => 'nullable|max:160',
            'meta_keywords' => 'nullable',
        ]);

        $post = Post::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'content' => $request->content,
            'category_id' => $request->category_id,
            'meta_description' => $request->meta_description,
            'meta_keywords' => $request->meta_keywords,
        ]);

        // Convert tag IDs to tag names before syncing
        $tagNames = \Spatie\Tags\Tag::whereIn('id', $request->tags)->pluck('name')->toArray();
        $post->syncTags($tagNames);

        return redirect('/posts')->with('success', 'Post created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return Inertia::render('Posts/Show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => $post->content,
                'category' => $post->category->name,
                'meta_description' => $post->meta_description,
                'meta_keywords' => $post->meta_keywords,
                'featured_image_url' => $post->featured_image_url,
                'created_at' => $post->created_at ? $post->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $post->updated_at ? $post->updated_at->format('Y-m-d H:i:s') : null,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        $categories = Category::all();
        $tags = \Spatie\Tags\Tag::all();
        return Inertia::render('Posts/Edit', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => $post->content,
                'category_id' => $post->category_id,
                'tags' => $post->tags->pluck('id')->toArray(),
                'meta_description' => $post->meta_description,
                'meta_keywords' => $post->meta_keywords,
                'featured_image_url' => $post->featured_image_url,
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
        $request->validate([
            'title' => 'required',
            'content' => 'required',
            'category_id' => 'required|exists:categories,id',
            'meta_description' => 'nullable|max:160',
            'meta_keywords' => 'nullable',
        ]);

        $post->update([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'content' => $request->content,
            'category_id' => $request->category_id,
            'meta_description' => $request->meta_description,
            'meta_keywords' => $request->meta_keywords,
        ]);

        // Convert tag IDs to tag names before syncing
        $tagNames = \Spatie\Tags\Tag::whereIn('id', $request->tags)->pluck('name')->toArray();
        $post->syncTags($tagNames);

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
}
