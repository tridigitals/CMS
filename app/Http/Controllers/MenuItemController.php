<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Post;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function getSources()
    {
        $pages = Page::where('status', 'published')
            ->select('id', 'title', 'slug')
            ->get()
            ->map(function ($page) {
                return [
                    'id' => $page->id,
                    'title' => $page->title,
                    'url' => '/pages/' . $page->slug,
                    'type' => 'page'
                ];
            });

        $posts = Post::where('status', 'published')
            ->select('id', 'title', 'slug')
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'url' => '/posts/' . $post->slug,
                    'type' => 'post'
                ];
            });

        $categories = Category::select('id', 'name', 'slug')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'title' => $category->name,
                    'url' => '/categories/' . $category->slug,
                    'type' => 'category'
                ];
            });

        return response()->json([
            'pages' => $pages,
            'posts' => $posts,
            'categories' => $categories
        ]);
    }

    public function getItems(Menu $menu)
    {
        $items = $menu->items()
            ->whereNull('parent_id')
            ->with('children.children.children') // Load three levels of nesting
            ->orderBy('order')
            ->get();
            
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'items' => 'required|array',
            'items.*.title' => 'required|string|max:255',
            'items.*.url' => 'required|string|max:255',
            'items.*.type' => 'required|string|in:page,post,category,custom',
            'items.*.target' => 'nullable|string|in:_self,_blank',
            'items.*.order' => 'required|integer|min:0',
            'items.*.parent_id' => 'nullable|integer',
            'items.*.children' => 'nullable|array'
        ]);

        $menu = Menu::findOrFail($request->menu_id);

        // Clear existing menu items
        $menu->items()->delete();

        // Function to recursively create menu items
        $createItems = function($items, $parentId = null) use (&$createItems, $menu) {
            foreach ($items as $index => $item) {
                $menuItem = $menu->items()->create([
                    'title' => $item['title'],
                    'url' => $item['url'],
                    'type' => $item['type'],
                    'target' => $item['target'] ?? '_self',
                    'order' => $item['order'] ?? $index,
                    'parent_id' => $parentId
                ]);

                if (!empty($item['children'])) {
                    $createItems($item['children'], $menuItem->id);
                }
            }
        };

        // Create menu items
        $createItems($validated['items']);

        return response()->json(['message' => 'Menu items saved successfully']);
    }

    public function move(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:menu_items,id',
            'order' => 'required|integer|min:0'
        ]);

        $menuItem->update($validated);

        return response()->json($menuItem);
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();
        return response()->noContent();
    }
}