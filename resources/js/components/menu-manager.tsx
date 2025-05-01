import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  id: number;
  title: string;
  url: string;
  type: 'page' | 'post' | 'category' | 'custom';
  children?: MenuItem[];
}

interface MenuSource {
  id: number;
  title: string;
  url: string;
  type: string;
}

interface MenuSources {
  pages: MenuSource[];
  posts: MenuSource[];
  categories: MenuSource[];
}

type MenuFormData = {
  [key: string]: FormDataConvertible | FormDataConvertible[] | undefined;
  items: MenuItem[];
};

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuSources, setMenuSources] = useState<MenuSources>({
    pages: [],
    posts: [],
    categories: []
  });

  const form = useForm({
    items: [] as MenuItem[]
  });

  useEffect(() => {
    // Fetch menu sources when component mounts
    fetch('/menu-sources')
      .then(res => res.json())
      .then(data => setMenuSources(data));
  }, []);

  const handleAddItems = (items: MenuSource[]) => {
    const newItems: MenuItem[] = items.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      type: item.type as 'page' | 'post' | 'category' | 'custom',
    }));

    setMenuItems(prev => [...prev, ...newItems]);
  };

  const handleSave = () => {
    form.post('/menu-items', {
      preserveScroll: true,
      data: { items: menuItems },
      onSuccess: () => {
        // Optional: Show success message
      }
    });
  };

  const findAndRemoveItem = (items: MenuItem[], id: number): MenuItem | null => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        return items.splice(i, 1)[0];
      }
      const children = items[i].children;
      if (children && children.length > 0) {
        const found = findAndRemoveItem(children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findItemWithParentAndIndex = (
    items: MenuItem[],
    id: number,
    parent: MenuItem[] | null = null
  ): { item: MenuItem | null; parent: MenuItem[] | null; index: number } => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        return { item: items[i], parent, index: i };
      }
      const children = items[i].children;
      if (children && children.length > 0) {
        const found = findItemWithParentAndIndex(children, id, children);
        if (found.item) return found;
      }
    }
    return { item: null, parent: null, index: -1 };
  };

  const handleItemMove = (draggedId: number, hoverId: number | null, position: 'before' | 'after' | 'inside') => {
    setMenuItems(prevItems => {
      const newItems = [...prevItems];
      const draggedItem = findAndRemoveItem(newItems, draggedId);
      
      if (!draggedItem) return prevItems;

      if (!hoverId) {
        // If no hover target, add to root level
        newItems.push(draggedItem);
        return newItems;
      }

      const { item: hoverItem, parent: hoverParent, index: hoverIndex } = findItemWithParentAndIndex(newItems, hoverId);
      if (!hoverItem) return prevItems;

      if (position === 'inside') {
        if (!hoverItem.children) hoverItem.children = [];
        hoverItem.children.push(draggedItem);
      } else {
        const items = hoverParent || newItems;
        const newIndex = position === 'after' ? hoverIndex + 1 : hoverIndex;
        items.splice(newIndex, 0, draggedItem);
      }

      return newItems;
    });
  };

  const handleItemDelete = (id: number) => {
    setMenuItems(prevItems => {
      const newItems = [...prevItems];
      const deleteItem = (items: MenuItem[], targetId: number): boolean => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === targetId) {
            items.splice(i, 1);
            return true;
          }
          const children = items[i].children;
          if (children && children.length > 0 && deleteItem(children, targetId)) {
            return true;
          }
        }
        return false;
      };
      
      deleteItem(newItems, id);
      return newItems;
    });
  };

  return (
    <div className="p-4">
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side: Menu items selection */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium mb-4">Add menu items</h3>
            <Tabs defaultValue="pages" className="w-full">
              <TabsList>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>

              <TabsContent value="pages">
                <div className="space-y-2 mt-4">
                  {menuSources.pages.map(page => (
                    <div key={page.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`page-${page.id}`}
                        className="form-checkbox h-4 w-4"
                      />
                      <label htmlFor={`page-${page.id}`}>{page.title}</label>
                    </div>
                  ))}
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleAddItems(
                      menuSources.pages.filter(page => 
                        (document.getElementById(`page-${page.id}`) as HTMLInputElement)?.checked
                      )
                    )}
                  >
                    Add to Menu
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="posts">
                <div className="space-y-2 mt-4">
                  {menuSources.posts.map(post => (
                    <div key={post.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`post-${post.id}`}
                        className="form-checkbox h-4 w-4"
                      />
                      <label htmlFor={`post-${post.id}`}>{post.title}</label>
                    </div>
                  ))}
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleAddItems(
                      menuSources.posts.filter(post => 
                        (document.getElementById(`post-${post.id}`) as HTMLInputElement)?.checked
                      )
                    )}
                  >
                    Add to Menu
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="categories">
                <div className="space-y-2 mt-4">
                  {menuSources.categories.map(category => (
                    <div key={category.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        className="form-checkbox h-4 w-4"
                      />
                      <label htmlFor={`category-${category.id}`}>{category.title}</label>
                    </div>
                  ))}
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleAddItems(
                      menuSources.categories.filter(category => 
                        (document.getElementById(`category-${category.id}`) as HTMLInputElement)?.checked
                      )
                    )}
                  >
                    Add to Menu
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right side: Menu structure */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Menu Structure</h3>
              <Button 
                onClick={handleSave} 
                disabled={form.processing}
              >
                {form.processing ? 'Saving...' : 'Save Menu'}
              </Button>
            </div>
            <MenuTree 
              items={menuItems}
              onMove={handleItemMove}
              onDelete={handleItemDelete}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MenuManager;