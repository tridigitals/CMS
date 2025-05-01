<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Page;
use App\Models\Post;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $menus = Menu::with(['items' => function($query) {
            $query->whereNull('parent_id')->with('children');
        }])->get();
        
        $pages = Page::select('id', 'title', 'slug')->get();
        $posts = Post::select('id', 'title', 'slug')->get();
        $categories = Category::select('id', 'name', 'slug')->get();
        
        return Inertia::render('Menus/Index', [
            'menus' => $menus->map(function ($menu) {
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'location' => $menu->location,
                    'items_count' => $menu->items->count(),
                    'items' => $menu->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'url' => $item->url,
                            'type' => $item->type,
                            'order' => $item->order,
                            'target' => $item->target,
                            'parent_id' => $item->parent_id,
                            'children' => $item->children->map(function ($child) {
                                return [
                                    'id' => $child->id,
                                    'title' => $child->title,
                                    'url' => $child->url,
                                    'type' => $child->type,
                                    'order' => $child->order,
                                    'target' => $child->target,
                                    'parent_id' => $child->parent_id,
                                ];
                            })
                        ];
                    })
                ];
            }),
            'available_items' => [
                'pages' => $pages->map(function ($page) {
                    return [
                        'id' => $page->id,
                        'title' => $page->title,
                        'url' => '/pages/' . $page->slug,
                        'type' => 'page'
                    ];
                }),
                'posts' => $posts->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'url' => '/posts/' . $post->slug,
                        'type' => 'post'
                    ];
                }),
                'categories' => $categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'title' => $category->name,
                        'url' => '/categories/' . $category->slug,
                        'type' => 'category'
                    ];
                })
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Menus/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $menu = Menu::create($validated);

        return redirect()->route('menus.edit', $menu)->with('success', 'Menu created successfully.');
    }

    public function edit(Menu $menu)
    {
        $menu->load('items');
        return Inertia::render('Menus/Edit', [
            'menu' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'location' => $menu->location,
                'description' => $menu->description,
                'items' => $menu->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'title' => $item->title,
                        'url' => $item->url,
                        'type' => $item->type,
                        'parent_id' => $item->parent_id,
                        'order' => $item->order,
                    ];
                }),
            ],
        ]);
    }

    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'items' => 'array',
            'items.*.id' => 'nullable|integer',
            'items.*.title' => 'required|string|max:255',
            'items.*.url' => 'required|string|max:255',
            'items.*.type' => 'required|string|in:page,post,category,custom',
            'items.*.target' => 'nullable|string|in:_self,_blank',
            'items.*.order' => 'nullable|integer',
            'items.*.parent_id' => 'nullable|integer',
            'items.*.children' => 'array|nullable',
            'items.*.children.*.id' => 'nullable|integer',
            'items.*.children.*.title' => 'required|string|max:255',
            'items.*.children.*.url' => 'required|string|max:255',
            'items.*.children.*.type' => 'required|string|in:page,post,category,custom',
            'items.*.children.*.target' => 'nullable|string|in:_self,_blank',
            'items.*.children.*.order' => 'nullable|integer',
            'items.*.children.*.parent_id' => 'nullable|integer'
        ]);

        $menu->update([
            'name' => $validated['name'],
            'location' => $validated['location'],
            'description' => $validated['description'] ?? null,
        ]);

        if (isset($validated['items'])) {
            // Delete existing menu items
            $menu->items()->delete();
            
            // Update menu items structure
            $this->updateMenuItems($menu, $validated['items']);
        }

        return redirect()->route('menus.index')->with('success', 'Menu updated successfully.');
    }

    public function destroy(Menu $menu)
    {
        $menu->items()->delete();
        $menu->delete();

        return redirect()->route('menus.index')->with('success', 'Menu deleted successfully.');
    }

    protected function updateMenuItems(Menu $menu, array $items, $parentId = null)
    {
        foreach ($items as $index => $item) {
            $menuItem = $menu->items()->create([
                'title' => $item['title'],
                'url' => $item['url'],
                'type' => $item['type'],
                'target' => $item['target'] ?? '_self',
                'parent_id' => $parentId,
                'order' => $item['order'] ?? $index,
            ]);

            if (!empty($item['children']) && is_array($item['children'])) {
                $this->updateMenuItems($menu, $item['children'], $menuItem->id);
            }
        }
    }
}
