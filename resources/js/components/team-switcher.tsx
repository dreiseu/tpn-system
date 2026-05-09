import { ChevronsUpDown, Hospital } from 'lucide-react';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export function TeamSwitcher() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="h-12 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/50 px-3 text-sidebar-foreground hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent"
                >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                        <Hospital className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">BGHMC EMR+</span>
                        <span className="truncate text-xs text-sidebar-foreground/55">
                            Government Tertiary Hospital
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/50" />
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
