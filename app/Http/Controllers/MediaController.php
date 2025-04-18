<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Post;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    /**
     * Display media library page or JSON data.
     */
    public function index(Request $request)
    {
        if (! $request->wantsJson()) {
            return Inertia::render('Media/Index');
        }

        $query = Media::where('collection_name', 'featured_image')
            ->orderBy('created_at', 'desc');

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $media = $query->paginate(12)->through(function ($m) {
            return [
                'id' => $m->id,
                'url' => $m->getUrl(),
                'name' => $m->name,
                'mime_type' => $m->mime_type,
                'custom_properties' => $m->custom_properties,
                'created_at' => $m->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json($media);
    }

    /**
     * Upload a media file.
     */
    public function upload(Request $request)
    {
        $request->validate([
            // Support images, videos, PDFs, and Word docs; max 20MB
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,svg,mp4,mov,avi,wmv,pdf,doc,docx|max:20480',
        ]);

        $tempPost = new Post([
            'title' => 'Media Library ' . now()->format('Y-m-d H:i:s'),
            'slug' => 'media-library-' . now()->timestamp,
            'content' => 'Temporary post for media library',
            'author_id' => auth()->id(),
            'status' => 'draft',
        ]);
        $tempPost->save();

        $media = $tempPost->addMediaFromRequest('file')
            ->toMediaCollection('featured_image');

        return response()->json([
            'id' => $media->id,
            'url' => $media->getUrl(),
            'name' => $media->name,
            'mime_type' => $media->mime_type,
            'custom_properties' => $media->custom_properties,
            'created_at' => $media->created_at->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Update media metadata.
     */
    public function update(Request $request, Media $media)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:255',
        ]);

        if ($request->has('name')) {
            $media->name = $request->name;
        }
        $media->setCustomProperty('alt_text', $request->alt_text);
        $media->setCustomProperty('caption', $request->caption);
        $media->save();

        return response()->json([
            'id' => $media->id,
            'url' => $media->getUrl(),
            'name' => $media->name,
            'mime_type' => $media->mime_type,
            'custom_properties' => $media->custom_properties,
            'created_at' => $media->created_at->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Delete a media file.
     */
    public function destroy(Media $media)
    {
        $media->delete();
        return response()->json(['success' => true]);
    }
}
