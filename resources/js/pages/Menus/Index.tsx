import { Head } from '@inertiajs/react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import MenuManager from './MenuManager';
import { BreadcrumbItem } from '@/types';

interface Props {
  menus: Array<{
    id: number;
    name: string;
    slug: string;
    items: Array<{
      id: number;
      title: string;
      url: string;
      type: string;
      target: string;
      order: number;
      parent_id: number | null;
      children?: any[];
    }>;
  }>;
  activeMenu: {
    id: number;
    name: string;
    slug: string;
    items: Array<any>;
  } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Menus', href: '/menus' },
];

const Index: React.FC<Props> = ({ menus, activeMenu }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Menu Management" />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Menu Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <MenuManager menus={menus} activeMenu={activeMenu} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
