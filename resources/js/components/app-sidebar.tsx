import { ClipboardCheck, LayoutGrid, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarInput,
    SidebarRail,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'TPN Orders',
        href: '/tpn/orders',
        icon: ClipboardCheck,
    },
];

export function AppSidebar() {
    const [query, setQuery] = useState('');

    const filteredNavItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return mainNavItems;
        }

        const filterItems = (items: NavItem[]): NavItem[] =>
            items.flatMap((item) => {
                const titleMatches = item.title
                    .toLowerCase()
                    .includes(normalizedQuery);
                const filteredChildren = item.items?.length
                    ? filterItems(item.items)
                    : [];

                if (titleMatches) {
                    return [
                        {
                            ...item,
                            items: item.items?.length ? item.items : undefined,
                        },
                    ];
                }

                if (filteredChildren.length > 0) {
                    return [
                        {
                            ...item,
                            items: filteredChildren,
                        },
                    ];
                }

                return [];
            });

        return filterItems(mainNavItems);
    }, [query]);

    return (
        <Sidebar collapsible="icon" variant="inset" className="p-0">
            <SidebarContent className="gap-4 py-3">
                <div className="px-3 pt-2 group-data-[collapsible=icon]:hidden">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sidebar-foreground/45" />
                        <SidebarInput
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search menu..."
                            className="h-10 rounded-lg border-sidebar-border/70 bg-sidebar-accent/35 pl-9 text-sidebar-foreground placeholder:text-sidebar-foreground/45 focus-visible:ring-sidebar-ring"
                        />
                    </div>
                </div>

                <NavMain
                    title="Platform"
                    items={filteredNavItems}
                    emptyMessage="No matching menu items."
                />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
