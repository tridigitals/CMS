<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $publishedPages = Page::with(['author'])
            ->published()
            ->latest()
            ->get();

        $draftPages = Page::with(['author'])
            ->draft()
            ->latest()
            ->get();

        $trashedPages = Page::with(['author'])
            ->trash()
            ->latest()
            ->get();

        return Inertia::render('Pages/Index', [
            'pages' => [
                'published' => $publishedPages->map(function ($page) {
                    $media = $page->featuredImage;
                    $webpUrl = $media && $media->hasGeneratedConversion('webp') ? $media->getUrl('webp') : ($media ? $media->getUrl() : null);
                    return [
                        'id' => $page->id,
                        'title' => $page->title,
                        'slug' => $page->slug,
                        'content' => Str::limit($page->content, 100),
                        'status' => $page->status,
                        'editor_type' => $page->editor_type,
                        'author' => [
                            'name' => $page->author->name,
                        ],
                        'created_at' => $page->created_at ? $page->created_at->format('Y-m-d H:i:s') : null,
                        'updated_at' => $page->updated_at ? $page->updated_at->format('Y-m-d H:i:s') : null,
                        'featured_image_url' => $webpUrl,
                    ];
                }),
                'draft' => $draftPages->map(function ($page) {
                    $media = $page->featuredImage;
                    $webpUrl = $media && $media->hasGeneratedConversion('webp') ? $media->getUrl('webp') : ($media ? $media->getUrl() : null);
                    return [
                        'id' => $page->id,
                        'title' => $page->title,
                        'slug' => $page->slug,
                        'content' => Str::limit($page->content, 100),
                        'status' => $page->status,
                        'editor_type' => $page->editor_type,
                        'author' => [
                            'name' => $page->author->name,
                        ],
                        'created_at' => $page->created_at ? $page->created_at->format('Y-m-d H:i:s') : null,
                        'updated_at' => $page->updated_at ? $page->updated_at->format('Y-m-d H:i:s') : null,
                        'featured_image_url' => $webpUrl,
                    ];
                }),
                'trash' => $trashedPages->map(function ($page) {
                    $media = $page->featuredImage;
                    $webpUrl = $media && $media->hasGeneratedConversion('webp') ? $media->getUrl('webp') : ($media ? $media->getUrl() : null);
                    return [
                        'id' => $page->id,
                        'title' => $page->title,
                        'slug' => $page->slug,
                        'content' => Str::limit($page->content, 100),
                        'status' => $page->status,
                        'editor_type' => $page->editor_type,
                        'author' => [
                            'name' => $page->author->name,
                        ],
                        'created_at' => $page->created_at ? $page->created_at->format('Y-m-d H:i:s') : null,
                        'updated_at' => $page->updated_at ? $page->updated_at->format('Y-m-d H:i:s') : null,
                        'featured_image_url' => $webpUrl,
                    ];
                }),
            ],
            'counts' => [
                'published' => $publishedPages->count(),
                'draft' => $draftPages->count(),
                'trash' => $trashedPages->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Pages/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug',
            'content' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'status' => 'required|in:draft,published',
            'editor_type' => 'required|in:classic,pagebuilder',
            'parent_id' => 'nullable|exists:pages,id',
            'order' => 'nullable|integer',
            'featured_image' => 'nullable|image|max:2048',
        ]);

        $validated['author_id'] = auth()->id();

        $page = Page::create($validated);

        if ($request->hasFile('featured_image')) {
            $page->addMediaFromRequest('featured_image')
                ->toMediaCollection('featured_image');
        }

        return redirect()->route('pages.edit', $page)
            ->with('success', 'Page created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Page $page)
    {
        $page->load('author');
        
        return Inertia::render('Pages/Show', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content,
                'meta_description' => $page->meta_description,
                'meta_keywords' => $page->meta_keywords,
                'status' => $page->status,
                'editor_type' => $page->editor_type,
                'author' => [
                    'name' => $page->author->name,
                ],
                'created_at' => $page->created_at ? $page->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $page->updated_at ? $page->updated_at->format('Y-m-d H:i:s') : null,
                'featured_image_url' => $page->featuredImage ? $page->featuredImage->getUrl() : null,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Page $page)
    {
        $page->load('author');
        
        return Inertia::render('Pages/Edit', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content,
                'meta_description' => $page->meta_description,
                'meta_keywords' => $page->meta_keywords,
                'status' => $page->status,
                'editor_type' => $page->editor_type,
                'parent_id' => $page->parent_id,
                'order' => $page->order,
                'author' => [
                    'name' => $page->author->name,
                ],
                'created_at' => $page->created_at ? $page->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $page->updated_at ? $page->updated_at->format('Y-m-d H:i:s') : null,
                'featured_image_url' => $page->featuredImage ? $page->featuredImage->getUrl() : null,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug,' . $page->id,
            'content' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'status' => 'required|in:draft,published',
            'editor_type' => 'required|in:classic,pagebuilder',
            'parent_id' => 'nullable|exists:pages,id',
            'order' => 'nullable|integer',
            'featured_image' => 'nullable|image|max:2048',
        ]);

        $page->update($validated);

        if ($request->hasFile('featured_image')) {
            $page->clearMediaCollection('featured_image');
            $page->addMediaFromRequest('featured_image')
                ->toMediaCollection('featured_image');
        }

        return redirect()->route('pages.edit', $page)
            ->with('success', 'Page updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Page $page)
    {
        $page->delete();

        return redirect()->route('pages.index')
            ->with('success', 'Page moved to trash.');
    }

    /**
     * Force delete the specified resource from storage.
     */
    public function forceDelete($id)
    {
        $page = Page::withTrashed()->findOrFail($id);
        $page->clearMediaCollection('featured_image');
        $page->forceDelete();

        return redirect()->route('pages.index')
            ->with('success', 'Page permanently deleted.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id)
    {
        $page = Page::withTrashed()->findOrFail($id);
        $page->restore();

        return redirect()->route('pages.index')
            ->with('success', 'Page restored from trash.');
    }
}
