// File ini di-GENERATE OTOMATIS oleh script generate-menu.js
// Edit manual tidak disarankan.

import { LayoutGrid, Users, Shield, Settings, User, Tag } from 'lucide-react';
import { NavItem } from './types';

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Post Management',
    icon: LayoutGrid,
    children: [
      {
        title: 'Posts',
        href: '/posts',
        icon: LayoutGrid,
        permission: 'manage posts',
      },
      {
        title: 'Categories',
        href: '/categories',
        icon: LayoutGrid,
        permission: 'manage posts',
      },
      {
        title: 'Tags',
        href: '/tags',
        icon: Tag,
        permission: 'manage posts',
      },
      {
        title: 'Comments',
        href: '/comments',
        icon: LayoutGrid,
        permission: 'manage posts',
      },
      {
        title: 'Media',
        href: '/media',
        icon: LayoutGrid,
        permission: 'manage media',
      },
    ],
  },
  {
    title: 'Pages Management',
    icon: LayoutGrid,
    children: [
      {
        title: 'Pages',
        href: '/pages',
        icon: LayoutGrid,
        permission: 'manage pages',
      },
    ],
  },
  {
    title: 'Account Management',
    icon: User,
    children: [
      {
        title: 'Users',
        href: '/users',
        icon: Users,
        permission: 'manage users',
      },
      {
        title: 'Roles',
        href: '/roles',
        icon: Shield,
        permission: 'manage roles',
      },
      {
        title: 'Permissions',
        href: '/permissions',
        icon: Settings,
        permission: 'manage permissions',
      },
    ],
  },
  
];
