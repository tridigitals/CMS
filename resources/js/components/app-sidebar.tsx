import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder } from 'lucide-react';
import AppLogo from './app-logo';

import { mainNavItems } from '../menu-items';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const page = usePage();
    // Safe access: fallback ke [] jika tidak ada permissions
    const userPermissions: string[] =
        (page.props &&
            typeof page.props === 'object' &&
            'auth' in page.props &&
            page.props.auth &&
            typeof page.props.auth === 'object' &&
            'user' in page.props.auth &&
            page.props.auth.user &&
            typeof page.props.auth.user === 'object' &&
            'permissions' in page.props.auth.user &&
            Array.isArray(page.props.auth.user.permissions)
        )
            ? page.props.auth.user.permissions
            : [];

    // DEBUG: log userPermissions
    // eslint-disable-next-line no-console
    console.log('userPermissions:', userPermissions);

    // Fungsi rekursif untuk filter menu dan children sesuai permission user
    function filterNavItems(items: NavItem[]): NavItem[] {
        return items
            .filter((item) => {
                // Jika ada permission, cek apakah user punya permission tsb
                if (item.permission && !userPermissions.includes(item.permission)) {
                    return false;
                }
                // Jika tidak ada permission, tampilkan
                return true;
            })
            .map((item) => {
                if (item.children) {
                    const filteredChildren = filterNavItems(item.children);
                    // Hanya tampilkan parent jika ada child yang lolos filter
                    if (filteredChildren.length > 0) {
                        return { ...item, children: filteredChildren };
                    }
                    // Jika tidak ada child yang lolos, sembunyikan parent
                    return null;
                }
                return item;
            })
            .filter(Boolean) as NavItem[];
    }

    const filteredNavItems = filterNavItems(mainNavItems);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
