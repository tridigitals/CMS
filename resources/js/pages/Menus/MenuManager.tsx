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
import { Search } from 'lucide-react';

interface MenuItem {
  id: number;
  title: string;
  url: string;
  type: 'page' | 'post' | 'category' | 'custom';
  icon?: string;
  target?: string;
  css_class?: string;
  text_color?: string;
  bg_color?: string;
  highlight?: boolean;
  order?: number;
  children?: MenuItem[];
}

interface MenuSource {
  id: number;
  title: string;
  url: string;
  type: string;
  icon?: string;
  target?: string;
  css_class?: string;
  text_color?: string;
  bg_color?: string;
  highlight?: boolean;
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

interface EditFormData {
  title: string;
  url: string;
  type: 'page' | 'post' | 'category' | 'custom';
  target: '_self' | '_blank';
  icon: string;
  css_class: string;
  text_color: string;
  bg_color: string;
  highlight: boolean;
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
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: '',
    url: '',
    type: 'custom',
    target: '_self',
    icon: '',
    css_class: '',
    text_color: '',
    bg_color: '',
    highlight: false
  });
  
  // Search states
  const [pageSearch, setPageSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  
  // Filtered sources based on search
  const filteredPages = menuSources.pages.filter(page => 
    page.title.toLowerCase().includes(pageSearch.toLowerCase())
  );
  
  const filteredPosts = menuSources.posts.filter(post => 
    post.title.toLowerCase().includes(postSearch.toLowerCase())
  );
  
  const filteredCategories = menuSources.categories.filter(category => 
    category.title.toLowerCase().includes(categorySearch.toLowerCase())
  );

  useEffect(() => {
    // Fetch menu sources when component mounts
    fetch('/menu-sources')
      .then(res => res.json())
      .then(data => setMenuSources(data))
      .catch(err => {
        console.error('Error fetching menu sources:', err);
        // Set default empty data if fetch fails
        setMenuSources({
          pages: [],
          posts: [],
          categories: []
        });
      });
      
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
    const newItems: MenuItem[] = items.map((item: any, index) => ({
      id: -(timestamp + index), // Negative IDs for new items to avoid conflicts
      title: item.title,
      url: item.url,
      type: item.type as 'page' | 'post' | 'category' | 'custom',
      target: item.target || '_self',
      icon: item.icon || '',
      css_class: item.css_class || '',
      text_color: item.text_color || '',
      bg_color: item.bg_color || '',
      highlight: item.highlight || false,
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
      target: item.target || '_self',
      icon: item.icon || '',
      css_class: item.css_class || '',
      text_color: item.text_color || '',
      bg_color: item.bg_color || '',
      highlight: item.highlight || false
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
              type: editFormData.type,
              target: editFormData.target,
              icon: editFormData.icon,
              css_class: editFormData.css_class,
              text_color: editFormData.text_color,
              bg_color: editFormData.bg_color,
              highlight: editFormData.highlight
            };
            return true;
          }
          if (items[i].children) {
            const childrenArray = items[i].children || [];
            if (updateItem(childrenArray)) {
              items[i].children = childrenArray; // Update children array
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
      return items.map((item, index) => {
        // Create a clean object with only the necessary properties
        const processedItem: any = {
          id: item.id > 0 ? item.id : undefined,
          title: item.title,
          url: item.url,
          type: item.type,
          target: item.target || '_self',
          order: order + index,
          parent_id: parentId
        };
        
        // Only add styling properties if they have values
        if (item.icon) processedItem.icon = item.icon;
        if (item.css_class) processedItem.css_class = item.css_class;
        if (item.text_color) processedItem.text_color = item.text_color;
        if (item.bg_color) processedItem.bg_color = item.bg_color;
        if (item.highlight !== undefined) processedItem.highlight = item.highlight;
        
        // Add children if they exist
        if (item.children && item.children.length > 0) {
          processedItem.children = processItems(
            item.children, 
            0, 
            item.id > 0 ? item.id : undefined
          );
        }
        
        return processedItem;
      });
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
      console.error(error);
      
      // Extract error message from response if available
      let errorMessage = 'Failed to save menu items';
      
      if (error.response && error.response.data) {
        if (error.response.data.error && typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message && typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        }
        
        // Handle specific error types
        if (errorMessage.includes('Duplicate entry') && errorMessage.includes('menus_location_unique')) {
          errorMessage = 'A menu with this location already exists. Please choose a different location.';
        }
      }
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
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
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="pages">Pages</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="pages">
                  <div className="space-y-2 mt-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search pages..."
                        className="pl-8"
                        value={pageSearch}
                        onChange={(e) => setPageSearch(e.target.value)}
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2 border rounded-md p-2">
                      {filteredPages.length === 0 ? (
                        <div className="text-center py-2 text-gray-500">
                          No pages found matching your search
                        </div>
                      ) : (
                        filteredPages.map(page => (
                          <div key={page.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`page-${page.id}`}
                              className="form-checkbox h-4 w-4"
                            />
                            <label htmlFor={`page-${page.id}`} className="truncate">{page.title}</label>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleAddItems(
                        filteredPages.filter(page => 
                          document.getElementById(`page-${page.id}`) && 
                          (document.getElementById(`page-${page.id}`) as HTMLInputElement).checked
                        )
                      )}
                      disabled={filteredPages.length === 0}
                    >
                      Add Selected Pages
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="posts">
                  <div className="space-y-2 mt-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search posts..."
                        className="pl-8"
                        value={postSearch}
                        onChange={(e) => setPostSearch(e.target.value)}
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2 border rounded-md p-2">
                      {filteredPosts.length === 0 ? (
                        <div className="text-center py-2 text-gray-500">
                          No posts found matching your search
                        </div>
                      ) : (
                        filteredPosts.map(post => (
                          <div key={post.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`post-${post.id}`}
                              className="form-checkbox h-4 w-4"
                            />
                            <label htmlFor={`post-${post.id}`} className="truncate">{post.title}</label>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleAddItems(
                        filteredPosts.filter(post => 
                          document.getElementById(`post-${post.id}`) && 
                          (document.getElementById(`post-${post.id}`) as HTMLInputElement).checked
                        )
                      )}
                      disabled={filteredPosts.length === 0}
                    >
                      Add Selected Posts
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="categories">
                  <div className="space-y-2 mt-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search categories..."
                        className="pl-8"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2 border rounded-md p-2">
                      {filteredCategories.length === 0 ? (
                        <div className="text-center py-2 text-gray-500">
                          No categories found matching your search
                        </div>
                      ) : (
                        filteredCategories.map(category => (
                          <div key={category.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`category-${category.id}`}
                              className="form-checkbox h-4 w-4"
                            />
                            <label htmlFor={`category-${category.id}`} className="truncate">{category.title}</label>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleAddItems(
                        filteredCategories.filter(category => 
                          document.getElementById(`category-${category.id}`) && 
                          (document.getElementById(`category-${category.id}`) as HTMLInputElement).checked
                        )
                      )}
                      disabled={filteredCategories.length === 0}
                    >
                      Add Selected Categories
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="custom">
                  <div className="space-y-4 mt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="custom-title">Link Text</Label>
                      <Input 
                        id="custom-title" 
                        placeholder="Menu item text" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="custom-url">URL</Label>
                      <Input 
                        id="custom-url" 
                        placeholder="https://example.com" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="custom-target">Open in</Label>
                      <Select defaultValue="_self">
                        <SelectTrigger id="custom-target">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_self">Same window</SelectItem>
                          <SelectItem value="_blank">New window</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Styling Options */}
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium text-gray-700 mb-3">Styling Options</h3>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="custom-icon">Icon</Label>
                        <Input 
                          id="custom-icon" 
                          placeholder="fa-home or other icon class" 
                        />
                        <p className="text-xs text-gray-500">Enter a Font Awesome or other icon class</p>
                      </div>
                      
                      <div className="grid gap-2 mt-3">
                        <Label htmlFor="custom-css-class">CSS Class</Label>
                        <Input 
                          id="custom-css-class" 
                          placeholder="Custom CSS class" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="grid gap-2">
                          <Label htmlFor="custom-text-color">Text Color</Label>
                          <Input 
                            id="custom-text-color" 
                            placeholder="#000000 or color name" 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="custom-bg-color">Background Color</Label>
                          <Input 
                            id="custom-bg-color" 
                            placeholder="#ffffff or color name" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-3">
                        <input
                          type="checkbox"
                          id="custom-highlight"
                          className="mr-2"
                        />
                        <Label htmlFor="custom-highlight">Highlight this menu item</Label>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full mt-4"
                      onClick={() => {
                        const titleElement = document.getElementById('custom-title') as HTMLInputElement;
                        const urlElement = document.getElementById('custom-url') as HTMLInputElement;
                        const targetElement = document.querySelector('[id="custom-target"] [data-value]') as HTMLElement;
                        const iconElement = document.getElementById('custom-icon') as HTMLInputElement;
                        const cssClassElement = document.getElementById('custom-css-class') as HTMLInputElement;
                        const textColorElement = document.getElementById('custom-text-color') as HTMLInputElement;
                        const bgColorElement = document.getElementById('custom-bg-color') as HTMLInputElement;
                        const highlightElement = document.getElementById('custom-highlight') as HTMLInputElement;
                        
                        if (titleElement?.value && urlElement?.value) {
                          const customItem: MenuSource = {
                            id: -Date.now(), // Use negative timestamp as temporary ID
                            title: titleElement.value,
                            url: urlElement.value,
                            type: 'custom'
                          };
                          
                          // Add styling properties to the item
                          const customItemWithStyling: any = {
                            ...customItem,
                            target: targetElement?.getAttribute('data-value') || '_self',
                            icon: iconElement?.value || '',
                            css_class: cssClassElement?.value || '',
                            text_color: textColorElement?.value || '',
                            bg_color: bgColorElement?.value || '',
                            highlight: highlightElement?.checked || false
                          };
                          
                          handleAddItems([customItemWithStyling]);
                          
                          // Clear inputs after adding
                          titleElement.value = '';
                          urlElement.value = '';
                          iconElement.value = '';
                          cssClassElement.value = '';
                          textColorElement.value = '';
                          bgColorElement.value = '';
                          highlightElement.checked = false;
                        } else {
                          Swal.fire({
                            title: 'Error!',
                            text: 'Please enter both title and URL for the custom link',
                            icon: 'error',
                            confirmButtonText: 'OK'
                          });
                        }
                      }}
                    >
                      Add Custom Link
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
                onValueChange={(value: 'page' | 'post' | 'category' | 'custom') => 
                  setEditFormData({...editFormData, type: value})
                }
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
                onValueChange={(value: '_self' | '_blank') => 
                  setEditFormData({...editFormData, target: value})
                }
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <Input
                id="icon"
                value={editFormData.icon}
                onChange={(e) => setEditFormData({...editFormData, icon: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="css_class" className="text-right">
                CSS Class
              </Label>
              <Input
                id="css_class"
                value={editFormData.css_class}
                onChange={(e) => setEditFormData({...editFormData, css_class: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="text_color" className="text-right">
                Text Color
              </Label>
              <Input
                id="text_color"
                value={editFormData.text_color}
                onChange={(e) => setEditFormData({...editFormData, text_color: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bg_color" className="text-right">
                Background Color
              </Label>
              <Input
                id="bg_color"
                value={editFormData.bg_color}
                onChange={(e) => setEditFormData({...editFormData, bg_color: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="highlight" className="text-right">
                Highlight
              </Label>
              <div className="col-span-3">
                <input
                  type="checkbox"
                  id="highlight"
                  checked={editFormData.highlight}
                  onChange={(e) => setEditFormData({...editFormData, highlight: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="highlight">Highlight this menu item</label>
              </div>
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