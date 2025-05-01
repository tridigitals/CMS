import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { PageProps, BreadcrumbItem } from "@/types";
import MenuSelector from "./MenuSelector";
import MenuTree from "./MenuTree";

interface MenuItem {
  id: number;
  title: string;
  url: string;
  type: 'page' | 'post' | 'category' | 'custom';
  target?: string;
  parent_id: number | null;
  order: number;
  children?: MenuItem[];
}

interface Menu {
  id: number;
  name: string;
  slug: string;
  items: MenuItem[];
}

interface Props extends PageProps {
  menu: Menu;
  menus: { id: number; name: string }[];
}

const getTree = (items: MenuItem[], parentId: number | null = null): MenuItem[] => {
  return items
    .filter(item => item.parent_id === parentId)
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      ...item,
      children: getTree(items, item.id),
    }));
};

const breadcrumbs = (menuName: string): BreadcrumbItem[] => [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Menus", href: "/menus" },
  { title: menuName, href: "" },
];

const MenuBuilder: React.FC<Props> = ({ menu, menus }) => {
  const [currentMenuId, setCurrentMenuId] = useState<number | null>(menu.id);
  const [items, setItems] = useState<MenuItem[]>(menu.items);

  // Handler untuk select menu
  const handleMenuChange = (id: number) => {
    window.location.href = `/menus/${id}`;
  };

  // Handler untuk tambah item
  const handleAddItem = (data: { title: string; url: string; type: 'page' | 'post' | 'category' | 'custom'; target: '_self' | '_blank'; }) => {
    // TODO: API call ke backend, lalu update state
    const newItem: MenuItem = {
      id: Math.random(), // Sementara pakai random, nanti pakai dari backend
      title: data.title,
      url: data.url,
      type: data.type,
      target: data.target,
      parent_id: null,
      order: items.length,
    };
    setItems([...items, newItem]);
  };

  // Handler edit/hapus item
  const handleEditItem = (item: MenuItem) => {
    // Redirect to edit page
    window.location.href = `/menus/${menu.id}/edit`;
  };
  
  const handleDeleteItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleItemMove = (draggedId: number, hoverId: number | null, position: 'before' | 'after' | 'inside') => {
    // Handle item move logic here
    console.log('Item moved:', draggedId, hoverId, position);
  };

  const tree = getTree(items);

  return (
    <AppLayout breadcrumbs={breadcrumbs(menu.name)}>
      <Head title={`Menu Builder: ${menu.name}`} />
      <div className="mt-8 mx-6">
        <MenuSelector menus={menus} currentMenuId={currentMenuId} onChange={handleMenuChange} />
        <div className="flex gap-8">
          <div className="w-1/3">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-4">Add Menu Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input 
                    type="text" 
                    className="w-full border rounded p-2" 
                    placeholder="Menu item title"
                    id="custom-title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input 
                    type="text" 
                    className="w-full border rounded p-2" 
                    placeholder="https://example.com"
                    id="custom-url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target</label>
                  <select 
                    className="w-full border rounded p-2"
                    id="custom-target"
                    defaultValue="_self"
                  >
                    <option value="_self">Same Window</option>
                    <option value="_blank">New Window</option>
                  </select>
                </div>
                <button 
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => {
                    const titleElement = document.getElementById('custom-title') as HTMLInputElement;
                    const urlElement = document.getElementById('custom-url') as HTMLInputElement;
                    const targetElement = document.getElementById('custom-target') as HTMLSelectElement;
                    
                    if (titleElement?.value && urlElement?.value) {
                      handleAddItem({
                        title: titleElement.value,
                        url: urlElement.value,
                        type: 'custom',
                        target: targetElement.value as '_self' | '_blank'
                      });
                      
                      // Clear inputs after adding
                      titleElement.value = '';
                      urlElement.value = '';
                    } else {
                      alert('Please enter both title and URL for the custom link');
                    }
                  }}
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
          <div className="w-2/3">
            <h3 className="font-medium mb-2">Menu Structure</h3>
            <MenuTree 
              items={tree} 
              onEdit={handleEditItem} 
              onDelete={handleDeleteItem}
              onMove={handleItemMove}
            />
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Save menu</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MenuBuilder;
