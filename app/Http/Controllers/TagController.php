<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Tags\Tag;
use Inertia\Inertia;
use Illuminate\Support\Str;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tags = Tag::all();
        return Inertia::render('Tags/Index', [
            'tags' => $tags,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Tags/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
        ]);

        // Gunakan findOrCreateFromString dari Spatie Tags
        $tag = Tag::findOrCreateFromString($request->name);

        if ($request->expectsJson()) {
            return response()->json([
                'id' => $tag->id,
                'name' => $tag->name instanceof \Spatie\Tags\HasTranslations ? $tag->name['en'] : $tag->name,
                'slug' => $tag->slug instanceof \Spatie\Tags\HasTranslations ? $tag->slug['en'] : $tag->slug,
            ]);
        }

        return redirect()->route('tags.index')->with('success', 'Tag created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $tag = Tag::findOrFail($id);
        return Inertia::render('Tags/Show', [
            'tag' => $tag,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $tag = Tag::findOrFail($id);
        return Inertia::render('Tags/Edit', [
            'tag' => $tag,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:tags,name,' . $id,
            'slug' => 'required|string|unique:tags,slug,' . $id,
            'type' => 'nullable|string',
        ]);

        $tag = Tag::findOrFail($id);
        $tag->name = $validated['name'];
        $tag->slug = $validated['slug'];
        $tag->type = $validated['type'] ?? null;
        $tag->save();

        return redirect()->route('tags.index')->with('success', 'Tag updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $tag = Tag::findOrFail($id);
        $tag->delete();

        return redirect()->route('tags.index')->with('success', 'Tag deleted successfully.');
    }
}
