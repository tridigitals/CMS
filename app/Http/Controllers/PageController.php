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
        $publishedPages = Page::with('author')->published()->latest()->get();
        $draftPages = Page::with('author')->draft()->latest()->get();
        $trashedPages = Page::with('author')->trash()->latest()->get();

        return Inertia::render('Pages/Index', [
            'pages' => [
                'published' => $publishedPages->map(function ($page) {
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
                        'featured_image_id' => $page->featured_image_id,
                        'featured_image_url' => $page->featured_image_url
                    ];
                }),
                'draft' => $draftPages->map(function ($page) {
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
                        'featured_image_id' => $page->featured_image_id,
                        'featured_image_url' => $page->featured_image_url
                    ];
                }),
                'trash' => $trashedPages->map(function ($page) {
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
                        'featured_image_id' => $page->featured_image_id,
                        'featured_image_url' => $page->featured_image_url
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
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug',
            'content' => 'required|string',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
            'featured_image_id' => 'nullable|integer|exists:media,id',
            'editor_type' => 'required|in:classic,pagebuilder',
            'parent_id' => 'nullable|integer|exists:pages,id',
            'order' => 'integer',
            'status' => 'required|in:draft,published',
        ]);

        $page = Page::create([
            'title' => $request->title,
            'slug' => $request->slug,
            'content' => $request->content,
            'meta_description' => $request->meta_description,
            'meta_keywords' => $request->meta_keywords,
            'status' => $request->status,
            'editor_type' => $request->editor_type,
            'parent_id' => $request->parent_id,
            'order' => $request->order,
            'author_id' => auth()->id(),
            'updated_at' => now(),
        ]);

        // Handle featured image upload atau dari media library
        if ($request->hasFile('featured_image')) {
            // Upload file ke media library
            $media = $page->addMediaFromRequest('featured_image')->toMediaCollection('featured_image');
            $page->featured_image_id = $media->id;
            $page->save();
            // Hapus file original jika konversi webp sudah ada
            if ($media->hasGeneratedConversion('webp')) {
                $originalPath = $media->getPath();
                if (file_exists($originalPath) && pathinfo($originalPath, PATHINFO_EXTENSION) !== 'webp') {
                    @unlink($originalPath);
                }
            }
        } elseif ($request->filled('featured_image_id')) {
            // Pilih dari media library, hanya simpan id
            $page->featured_image_id = $request->featured_image_id;
            $page->save();
        } elseif ($request->featured_image === null && $request->featured_image_id === null) {
            $page->featured_image_id = null;
            $page->clearMediaCollection('featured_image');
            $page->save();
        }

        return redirect('/pages')->with('success', 'Page created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Page $page)
    {
        $page->load(['author', 'featuredImage']);
        
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
                'featured_image_url' => $page->featuredImage ? ($page->featuredImage->hasGeneratedConversion('webp') ? $page->featuredImage->getUrl('webp') : $page->featuredImage->getUrl()) : null,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Page $page)
    {
        $page->load(['featuredImage', 'author']);
        return Inertia::render('Pages/Edit', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content,
                'status' => $page->status,
                'meta_description' => $page->meta_description,
                'meta_keywords' => $page->meta_keywords,
                'editor_type' => $page->editor_type,
                'parent_id' => $page->parent_id,
                'order' => $page->order,
                'featured_image_url' => $page->featuredImage ? $page->featuredImage->getUrl('thumb') : null,
                'author' => [
                    'name' => $page->author->name,
                ],
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Page $page)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug,' . $page->id,
            'content' => 'required|string',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
            'editor_type' => 'required|in:classic,pagebuilder',
            'parent_id' => 'nullable|integer|exists:pages,id',
            'order' => 'integer',
            'status' => 'required|in:draft,published',
        ]);

        $page->update([
            'title' => $request->title,
            'slug' => $request->slug,
            'content' => $request->content,
            'meta_description' => $request->meta_description,
            'meta_keywords' => $request->meta_keywords,
            'editor_type' => $request->editor_type,
            'parent_id' => $request->parent_id,
            'order' => $request->order,
            'status' => $request->status,
            'updated_at' => now(),
        ]);

        // Handle featured image upload atau dari media library
        if ($request->hasFile('featured_image')) {
            // Upload file ke media library
            $media = $page->addMediaFromRequest('featured_image')->toMediaCollection('featured_image');
            $page->featured_image_id = $media->id;
            $page->save();
            // Hapus file original jika konversi webp sudah ada
            if ($media->hasGeneratedConversion('webp')) {
                $originalPath = $media->getPath();
                if (file_exists($originalPath) && pathinfo($originalPath, PATHINFO_EXTENSION) !== 'webp') {
                    @unlink($originalPath);
                }
            }
        } elseif ($request->filled('featured_image_id')) {
            // Pilih dari media library, hanya simpan id
            $page->featured_image_id = $request->featured_image_id;
            $page->save();
        } elseif ($request->featured_image === null && $request->featured_image_id === null) {
            $page->featured_image_id = null;
            $page->clearMediaCollection('featured_image');
            $page->save();
        }

        return redirect('/pages')->with('success', 'Page updated successfully.');
    }

    /**
     * Update only the status of a page (for quick status change from index).
     */
    public function updateStatus(Request $request, Page $page)
    {
        $request->validate([
            'status' => 'required|in:draft,published',
        ]);
        $page->status = $request->status;
        $page->save();
        return redirect()->back()->with('success', 'Status updated!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Page $page)
    {
        $page->delete();

        return redirect()->back()
            ->with('success', 'Page moved to trash.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id)
    {
        $page = Page::onlyTrashed()->findOrFail($id);
        $page->restore();

        return redirect()->back()
            ->with('success', 'Page restored successfully.');
    }

    /**
     * Force delete the specified resource from storage.
     */
    public function forceDelete($id)
    {
        $page = Page::onlyTrashed()->findOrFail($id);
        $page->clearMediaCollection('featured_image');
        $page->forceDelete();

        return redirect()->back()
            ->with('success', 'Page permanently deleted.');
    }
}
