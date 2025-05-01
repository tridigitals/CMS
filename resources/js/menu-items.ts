// File ini di-GENERATE OTOMATIS oleh script generate-menu.js
// Edit manual tidak disarankan.

import { Home, Users, Shield, Settings, User, Tag, Folder, FileText, BookOpen, Briefcase, Pencil, List } from 'lucide-react';
import { NavItem } from './types';

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Post Management',
    icon: Briefcase,
    children: [
      {
        title: 'Posts',
        href: '/posts',
        icon: FileText,
        permission: 'manage posts',
      },
      {
        title: 'Categories',
        href: '/categories',
        icon: Folder,
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
        icon: List,
        permission: 'manage posts',
      },
      {
        title: 'Media',
        href: '/media',
        icon: BookOpen,
        permission: 'manage media',
      },
    ],
  },
  {
    title: 'Pages Management',
    icon: Pencil,
    children: [
      {
        title: 'Pages',
        href: '/pages',
        icon: FileText,
        permission: 'manage pages',
      },
    ],
  },
  {
    title: 'Appearance',
    icon: Briefcase,
    children: [
      {
        title: 'Menus',
        href: '/menus',
        icon: Folder,
        permission: 'manage menus',
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
