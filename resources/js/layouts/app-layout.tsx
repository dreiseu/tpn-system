import { Toaster } from '@/components/ui/sonner';
import { useTabSessionEnd } from '@/hooks/use-tab-session-end';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    useTabSessionEnd();

    return (
        <>
            <AppLayoutTemplate breadcrumbs={breadcrumbs}>
                {children}
            </AppLayoutTemplate>

            <Toaster />
        </>
    );
}