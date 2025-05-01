import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { PageProps, BreadcrumbItem } from "@/types";
import MenuSelector from "./MenuSelector";
import MenuItemForm from "./MenuItemForm";
import MenuTree, { MenuItem as MenuTreeItem } from "./MenuTree";

interface MenuItem extends MenuTreeItem {}

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
  const handleAddItem = (data: { label: string; url: string }) => {
    // TODO: API call ke backend, lalu update state
    const newItem: MenuItem = {
      id: Math.random(), // Sementara pakai random, nanti pakai dari backend
      label: data.label,
      url: data.url,
      parent_id: null,
      order: items.length,
    };
    setItems([...items, newItem]);
  };

  // Handler edit/hapus item (dummy)
  const handleEditItem = (item: MenuItem) => {
    // TODO: tampilkan modal/form edit
    alert(`Edit item: ${item.label}`);
  };
  const handleDeleteItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const tree = getTree(items);

  return (
    <AppLayout breadcrumbs={breadcrumbs(menu.name)}>
      <Head title={`Menu Builder: ${menu.name}`} />
      <div className="mt-8 mx-6">
        <MenuSelector menus={menus} currentMenuId={currentMenuId} onChange={handleMenuChange} />
        <div className="flex gap-8">
          <div className="w-1/3">
            <MenuItemForm onSubmit={handleAddItem} />
          </div>
          <div className="w-2/3">
            <h3 className="font-medium mb-2">Menu Structure</h3>
            <MenuTree items={tree} onEdit={handleEditItem} onDelete={handleDeleteItem} />
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Save menu</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MenuBuilder;
