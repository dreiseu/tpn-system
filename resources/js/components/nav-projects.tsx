import { Link } from '@inertiajs/react';
import { Beaker, ClipboardPlus, PackageCheck } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';

const items = [
    {
        title: 'New TPN Order',
        href: '/tpn/orders/create',
        icon: ClipboardPlus,
    },
    {
        title: 'Formulation Queue',
        href: '/tpn/formulations',
        icon: Beaker,
    },
    {
        title: 'Dispensing Queue',
        href: '/tpn/dispensing',
        icon: PackageCheck,
    },
];

export function NavProjects() {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="px-2 text-[0.68rem] font-semibold tracking-[0.16em] text-sidebar-foreground/45 uppercase">
                Workflows
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                className="h-9 rounded-lg px-3 font-medium text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-sm"
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
