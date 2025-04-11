import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

import { SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    // Cari parent menu yang child-nya aktif untuk default openDropdown
    const getDefaultOpenDropdown = () => {
        for (const item of items) {
            if (item.children && item.children.some(child => child.href === page.url)) {
                return item.title;
            }
        }
        return null;
    };

    const [openDropdown, setOpenDropdown] = useState<string | null>(getDefaultOpenDropdown());

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    item.children && item.children.length > 0 ? (
                        <SidebarMenuItem key={item.title}>
                            {(() => {
                                // Cek apakah salah satu child aktif
                                const isChildActive = item.children.some(
                                    (child) => child.href === page.url
                                );
                                return (
                                    <>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={{ children: item.title }}
                                            isActive={isChildActive}
                                            onClick={() =>
                                                setOpenDropdown(openDropdown === item.title ? null : item.title)
                                            }
                                            aria-expanded={openDropdown === item.title}
                                        >
                                            <div className="flex items-center gap-2 cursor-pointer select-none">
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                                <svg
                                                    className={`ml-auto transition-transform ${openDropdown === item.title ? 'rotate-90' : ''}`}
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M6 10L10 8L6 6V10Z" fill="currentColor" />
                                                </svg>
                                            </div>
                                        </SidebarMenuButton>
                                        {openDropdown === item.title && (
                                            <SidebarMenuSub>
                                                {item.children.map((child) => (
                                                    <SidebarMenuSubItem key={child.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={child.href === page.url}
                                                        >
                                                            <Link href={child.href!} prefetch>
                                                                {child.icon && <child.icon />}
                                                                <span>{child.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        )}
                                    </>
                                );
                            })()}
                        </SidebarMenuItem>
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={item.href === page.url}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href!} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
