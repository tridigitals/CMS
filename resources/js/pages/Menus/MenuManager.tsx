import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import MenuTree from './MenuTree';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import MenuSelector from './MenuSelector';
import Swal from 'sweetalert2';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MenuItem {
  id: number;
  title: string;
  url: string;
  type: 'page' | 'post' | 'category' | 'custom';
  target?: string;
  order?: number;
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

interface Menu {
  id: number;
  name: string;
}

const MenuManager = ({ menus = [] }: { menus?: Menu[] }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuSources, setMenuSources] = useState<MenuSources>({
    pages: [],
    posts: [],
    categories: []
  });
  const [currentMenuId, setCurrentMenuId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    url: '',
    type: 'custom',
    target: '_self'
  });

  useEffect(() => {
    // Fetch menu sources when component mounts
    fetch('/menu-sources')
      .then(res => res.json())
      .then(data => setMenuSources(data));
      
    // If menus are available, set the first one as default
    if (menus.length > 0) {
      setCurrentMenuId(menus[0].id);
    }
  }, []);
  
  useEffect(() => {
    // When menu selection changes, fetch its items
    if (currentMenuId) {
      fetch(`/menus/${currentMenuId}/items`)
        .then(res => res.json())
        .then(data => setMenuItems(data))
        .catch(err => console.error('Error fetching menu items:', err));
    } else {
      setMenuItems([]);
    }
  }, [currentMenuId]);

  const handleAddItems = (items: MenuSource[]) => {
    const timestamp = Date.now(); // Used to generate unique temporary IDs
    const newItems: MenuItem[] = items.map((item, index) => ({
      id: -(timestamp + index), // Negative IDs for new items to avoid conflicts
      title: item.title,
      url: item.url,
      type: item.type as 'page' | 'post' | 'category' | 'custom',
      target: '_self',
      order: 0
    }));

    setMenuItems(prev => [...prev, ...newItems]);
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
      deleteItem(newItems, id);
      return newItems;
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title,
      url: item.url,
      type: item.type,
      target: item.target || '_self'
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    setMenuItems(prevItems => {
      const newItems = [...prevItems];
      const updateItem = (items: MenuItem[]): boolean => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === editingItem.id) {
            items[i] = {
              ...items[i],
              title: editFormData.title,
              url: editFormData.url,
              type: editFormData.type as 'page' | 'post' | 'category' | 'custom',
              target: editFormData.target
            };
            return true;
          }
          if (items[i].children) {
            const childrenArray = items[i].children || [];
            if (updateItem(childrenArray)) {
              return true;
            }
          }
        }
        return false;
      };

      updateItem(newItems);
      return newItems;
    });

    setIsEditDialogOpen(false);
    setEditingItem(null);

    // Show success message
    Swal.fire({
      title: 'Success!',
      text: 'Menu item updated successfully',
      icon: 'success',
      confirmButtonText: 'OK',
      timer: 2000,
      timerProgressBar: true
    });
  };

  const findAndRemoveItem = (items: MenuItem[], id: number): MenuItem | null => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        return items.splice(i, 1)[0];
      }
      if (items[i].children) {
        const found = findAndRemoveItem(items[i].children!, id);
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
      if (items[i].children) {
        const found = findItemWithParentAndIndex(items[i].children!, id, items[i].children);
        if (found.item) return found;
      }
    }
    return { item: null, parent: null, index: -1 };
  };

  const deleteItem = (items: MenuItem[], id: number): boolean => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        items.splice(i, 1);
        return true;
      }
      const children = items[i].children;
      if (children && children.length > 0 && deleteItem(children, id)) {
        return true;
      }
    }
    return false;
  };

  const handleSave = () => {
    if (!currentMenuId) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a menu first',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const processItems = (items: MenuItem[], order = 0, parentId: number | null = null): any[] => {
      return items.map((item, index) => ({
        id: item.id > 0 ? item.id : undefined,
        title: item.title,
        url: item.url,
        type: item.type,
        target: item.target || '_self',
        order: order + index,
        parent_id: parentId,
        ...(item.children && item.children.length > 0
          ? { children: processItems(item.children, 0, item.id > 0 ? item.id : undefined) }
          : {})
      }));
    };

    // Show loading state
    Swal.fire({
      title: 'Saving...',
      text: 'Please wait while we save your menu items',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Prepare data for submission
    const formData = {
      menu_id: currentMenuId,
      items: processItems(menuItems)
    };
    
    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    // Use fetch API for direct control
    fetch('/menu-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      Swal.fire({
        title: 'Success!',
        text: data.message || 'Menu items saved successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    })
    .catch(error => {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save menu items',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      console.error(error);
    });
  };

  const handleMenuChange = (menuId: number) => {
    setCurrentMenuId(menuId);
  };

  return (
    <div className="p-4">
      <Card className="p-6">
        <div className="mb-6">
          <MenuSelector 
            menus={menus} 
            currentMenuId={currentMenuId} 
            onChange={handleMenuChange} 
          />
        </div>
        
        {currentMenuId ? (
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
                          document.getElementById(`page-${page.id}`) && 
                          (document.getElementById(`page-${page.id}`) as HTMLInputElement).checked
                        )
                      )}
                    >
                      Add Selected Pages
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
                          document.getElementById(`post-${post.id}`) && 
                          (document.getElementById(`post-${post.id}`) as HTMLInputElement).checked
                        )
                      )}
                    >
                      Add Selected Posts
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
                          document.getElementById(`category-${category.id}`) && 
                          (document.getElementById(`category-${category.id}`) as HTMLInputElement).checked
                        )
                      )}
                    >
                      Add Selected Categories
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right side: Menu tree */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Menu Structure</h3>
                <Button onClick={handleSave}>
                  Save Menu
                </Button>
              </div>
              <MenuTree
                items={menuItems}
                onMove={handleItemMove}
                onDelete={handleItemDelete}
                onEdit={handleEditItem}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Please select a menu to edit or create a new one
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={editFormData.url}
                onChange={(e) => setEditFormData({...editFormData, url: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={editFormData.type}
                onValueChange={(value) => setEditFormData({...editFormData, type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Link</SelectItem>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target" className="text-right">
                Open in
              </Label>
              <Select
                value={editFormData.target}
                onValueChange={(value) => setEditFormData({...editFormData, target: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Same window</SelectItem>
                  <SelectItem value="_blank">New window</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManager;