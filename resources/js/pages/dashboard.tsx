import { Head, Link } from '@inertiajs/react';
import { Beaker, ClipboardCheck, PackageCheck, Plus, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { OrderRegistrationDialog } from '@/components/orders/order-registration-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getPatientName, type TpnOrder } from '@/types/orders';

type DashboardProps = {
    stats?: {
        total_orders: number;
        orders_today: number;
        pending_review: number;
        for_dispensing: number;
    };
    recentOrders?: TpnOrder[];
};

const statCards = [
    {
        key: 'total_orders',
        title: 'TPN Orders',
        description: 'Digitized TPN order forms',
        icon: UsersRound,
    },
    {
        key: 'orders_today',
        title: 'Orders Today',
        description: 'TPN forms encoded today',
        icon: ClipboardCheck,
    },
    {
        key: 'pending_review',
        title: 'Pending Review',
        description: 'Orders awaiting pharmacist review',
        icon: Beaker,
    },
    {
        key: 'for_dispensing',
        title: 'For Dispensing',
        description: 'Prepared bags pending release',
        icon: PackageCheck,
    },
] as const;

const emptyStats = {
    total_orders: 0,
    orders_today: 0,
    pending_review: 0,
    for_dispensing: 0,
};

export default function Dashboard({
    stats = emptyStats,
    recentOrders = [],
}: DashboardProps) {
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);

    return (
        <>
            <Head title="Dashboard" />
            <div className="emr-content-surface flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            TPN Operations Dashboard
                        </h1>
                        <p className="text-sm text-slate-500">
                            Digital TPN order forms and recent nutrition support
                            requests.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            className="bg-[#2f7d32] text-white hover:bg-[#27692a] cursor-pointer"
                            onClick={() => setOrderDialogOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New TPN Order
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => (
                        <Card
                            key={card.key}
                            className="group rounded-2xl border-slate-200 bg-white text-slate-900 shadow-sm transition-all duration-200 hover:border-[#1f5d30] hover:bg-gradient-to-br hover:from-[#1f5d30] hover:via-[#2f7d32] hover:to-[#164423] hover:text-white hover:shadow-md"
                        >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-medium text-slate-900 transition-colors duration-200 group-hover:text-white">
                                        {card.title}
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 transition-colors duration-200 group-hover:text-white/75">
                                        {card.description}
                                    </CardDescription>
                                </div>
                                <div className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors duration-200 group-hover:border-white/20 group-hover:text-white/80">
                                    <card.icon className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-semibold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-white">
                                    {stats[card.key]}
                                </div>
                                <div className="mt-3 text-sm text-slate-500 transition-colors duration-200 group-hover:text-white/75">
                                    {card.description}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 pb-5">
                        <div>
                            <CardTitle className="pb-2 text-slate-900">
                                Recent TPN Orders
                            </CardTitle>
                            <CardDescription className="text-slate-500">
                                Latest digitized TPN order forms.
                            </CardDescription>
                        </div>
                        <Badge
                            variant="outline"
                            className="border-slate-300 bg-white text-slate-700"
                        >
                            {recentOrders.length} visible
                        </Badge>
                    </CardHeader>
                    <CardContent className="emr-scrollbar overflow-x-auto">
                        <div className="min-w-[820px]">
                            <div className="grid grid-cols-[1.2fr_1.8fr_1.2fr_0.8fr_1fr_1.2fr] gap-4 border-b border-slate-200 pt-3 pb-3 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
                                <span>Order No.</span>
                                <span>Patient</span>
                                <span>Hospital No.</span>
                                <span>Weight</span>
                                <span>Ward</span>
                                <span>Order Date</span>
                            </div>
                            <div className="divide-y divide-slate-200">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="grid grid-cols-[1.2fr_1.8fr_1.2fr_0.8fr_1fr_1.2fr] gap-4 py-4 text-sm"
                                        >
                                            <span className="font-medium text-slate-900">
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="hover:text-[#2f7d32] hover:underline"
                                                >
                                                    {order.order_no}
                                                </Link>
                                            </span>
                                            <span className="font-medium text-slate-900">
                                                {getPatientName(order) || 'N/A'}
                                            </span>
                                            <span className="text-slate-700">
                                                {order.hospital_number || 'N/A'}
                                            </span>
                                            <span className="text-slate-700">
                                                {order.current_weight_kg ||
                                                    order.birth_weight_kg ||
                                                    'N/A'}
                                            </span>
                                            <span className="text-slate-700">
                                                {order.ward || 'N/A'}
                                            </span>
                                            <span className="text-slate-700">
                                                {order.order_date || 'N/A'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-sm text-slate-500">
                                        No TPN orders have been recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <OrderRegistrationDialog
                open={orderDialogOpen}
                onOpenChange={setOrderDialogOpen}
            />
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
