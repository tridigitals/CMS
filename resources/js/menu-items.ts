// File ini di-GENERATE OTOMATIS oleh script generate-menu.js
// Edit manual tidak disarankan.

import { LayoutGrid, Users, Shield, Settings, User } from 'lucide-react';
import { NavItem } from './types';

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Account Management',
    icon: User,
    children: [
      {
        title: 'Users',
        href: '/users',
        icon: Users,
      },
      {
        title: 'Roles',
        href: '/roles',
        icon: Shield,
      },
      {
        title: 'Permissions',
        href: '/permissions',
        icon: Settings,
      },
    ],
  },
];
