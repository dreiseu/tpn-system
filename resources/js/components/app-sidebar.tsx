import {
    Beaker,
    ClipboardCheck,
    LayoutGrid,
    Cog,
    FlaskConical,
    Hospital,
    Newspaper,
    PackageCheck,
    Pill,
    Search,
    ShieldCheck,
    UsersRound,
    Wrench,
} from 'lucide-react';
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
        title: 'Patient Registry',
        href: '/patients',
        icon: UsersRound,
        items: [
            {
                title: 'Patient Search',
                href: '/patients',
            },
            {
                title: 'TPN Candidates',
                href: '/patients/tpn-candidates',
            },
        ],
    },
    {
        title: 'TPN Orders',
        href: '/tpn/orders',
        icon: ClipboardCheck,
        items: [
            {
                title: 'New Order',
                href: '/tpn/orders/create',
            },
            {
                title: 'Pending Review',
                href: '/tpn/orders?status=pending-review',
            },
            {
                title: 'Active Therapy',
                href: '/tpn/orders?status=active',
            },
        ],
    },
    {
        title: 'Formulation',
        href: '/tpn/formulations',
        icon: Beaker,
        items: [
            {
                title: 'Macro Nutrients',
                href: '/tpn/formulations/macros',
            },
            {
                title: 'Electrolytes',
                href: '/tpn/formulations/electrolytes',
            },
            {
                title: 'Additives',
                href: '/tpn/formulations/additives',
            },
        ],
    },
    {
        title: 'Compounding',
        href: '/tpn/compounding',
        icon: FlaskConical,
        items: [
            {
                title: 'Preparation Queue',
                href: '/tpn/compounding/queue',
            },
            {
                title: 'Batch Verification',
                href: '/tpn/compounding/verification',
            },
        ],
    },
    {
        title: 'Dispensing',
        href: '/tpn/dispensing',
        icon: PackageCheck,
    },
    {
        title: 'Medication Profile',
        href: '/tpn/medications',
        icon: Pill,
    },
    {
        title: 'Clinical Units',
        href: '/modules/clinical-units',
        icon: Hospital,
    },
    {
        title: 'Utilities',
        href: '/modules/utilities',
        icon: Wrench,
        items: [
            {
                title: 'Ward Management',
                href: '/modules/ward-management',
            },
            {
                title: 'Infusion Routes',
                href: '/modules/infusion-routes',
            },
        ],
    },
    {
        title: 'Accessibility',
        href: '/modules/accessibility',
        icon: ShieldCheck,
        items: [
            {
                title: 'User Roles',
                href: '/modules/user-roles',
            },
            {
                title: 'Admin Roles',
                href: '/modules/admin-roles',
            },
            {
                title: 'Audit Logs',
                href: '/modules/audit-logs',
            },
        ],
    },
    {
        title: 'System Advisories',
        href: '/modules/system-advisories',
        icon: Newspaper,
    },
    {
        title: 'System Settings',
        href: '/modules/system-settings',
        icon: Cog,
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
