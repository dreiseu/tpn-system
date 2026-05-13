import { Head, Link } from '@inertiajs/react';
import { Beaker, ClipboardCheck, PackageCheck, Plus, UsersRound } from 'lucide-react';
import { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getPatientName, getStatusClass, type TpnOrder } from '@/types/orders';
import { router } from '@inertiajs/react';
import { Check, ChevronRight, Lock, Search, Filter } from 'lucide-react';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { useEffect } from 'react';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const filteredOrders = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return recentOrders.filter((order) => {
            const matchesSearch =
                query === '' ||
                order.order_no.toLowerCase().includes(query) ||
                getPatientName(order).toLowerCase().includes(query) ||
                (order.hospital_number || '').toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'All' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [recentOrders, searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const emptyRows = Math.max(0, ITEMS_PER_PAGE - paginatedOrders.length);

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
                    <CardHeader className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="pb-1 text-slate-900">
                                Recent TPN Orders
                            </CardTitle>
                            <CardDescription className="text-slate-500">
                                Latest digitized TPN order forms.
                            </CardDescription>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    placeholder="Search order, patient..."
                                    className="h-9 w-full pl-9 sm:w-64"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-9 w-full sm:w-44">
                                    <Filter className="mr-2 h-4 w-4 text-slate-400" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Statuses</SelectItem>
                                    <SelectItem value="Pending Review">Pending Review</SelectItem>
                                    <SelectItem value="For Dispensing">For Dispensing</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            <Badge
                                variant="outline"
                                className="h-7 border-slate-300 bg-white text-slate-700"
                            >
                                {filteredOrders.length} shown
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="emr-scrollbar overflow-x-auto">
                        <div className="min-w-[820px]">
                            <div className="grid grid-cols-[1fr_1.5fr_1fr_0.6fr_0.8fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 pt-3 pb-3 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
                                <span>Order No.</span>
                                <span>Patient</span>
                                <span>Hospital No.</span>
                                <span>Weight</span>
                                <span>Ward</span>
                                <span>Status</span>
                                <span>Order Date</span>
                                <span className="text-center">Actions</span>
                            </div>
                             <div className="divide-y divide-slate-200">
                                {paginatedOrders.length > 0 ? (
                                    paginatedOrders.map((order: TpnOrder) => (
                                        <div
                                            key={order.id}
                                            className="grid h-[64px] grid-cols-[1fr_1.5fr_1fr_0.6fr_0.8fr_1fr_1fr_1fr] items-center gap-4 py-3 text-sm"
                                        >
                                            <span className="font-medium text-slate-900">
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="hover:text-[#2f7d32] hover:underline"
                                                >
                                                    {order.order_no}
                                                </Link>
                                            </span>
                                            <span className="truncate font-medium text-slate-900">
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
                                            <span>
                                                <Badge
                                                    variant="outline"
                                                    className={`font-semibold ${getStatusClass(order.status as any)}`}
                                                >
                                                    {order.status}
                                                </Badge>
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {order.order_date || 'N/A'}
                                            </span>
                                            <div className="flex justify-center gap-2">
                                                <StatusAction order={order} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-[640px] items-center justify-center text-sm text-slate-500">
                                        No TPN orders match your search or filter.
                                    </div>
                                )}

                                {paginatedOrders.length > 0 && Array.from({ length: emptyRows }).map((_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        className="grid h-[64px] grid-cols-[1fr_1.5fr_1fr_0.6fr_0.8fr_1fr_1fr_1fr] items-center gap-4"
                                    />
                                ))}
                            </div>
                        </div>

                        {filteredOrders.length > ITEMS_PER_PAGE && (
                            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-slate-500">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
                                    </span>{' '}
                                    of <span className="font-medium">{filteredOrders.length}</span> orders
                                </div>

                                <Pagination className="mx-0 w-auto justify-end">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                                                }}
                                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }).map((_, i) => {
                                            const page = i + 1;
                                            // Simple pagination for brevity
                                            if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                                                if (page === 2 || page === totalPages - 1) {
                                                    return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>;
                                                }
                                                return null;
                                            }

                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={page === currentPage}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentPage(page);
                                                        }}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        })}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                                }}
                                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
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

function StatusAction({ order }: { order: TpnOrder }) {
    const [processing, setProcessing] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<string | null>(null);

    const updateStatus = (newStatus: string) => {
        setTargetStatus(newStatus);
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        if (!targetStatus || processing) return;

        setProcessing(true);
        router.patch(route('orders.update-status', order.id), {
            status: targetStatus,
        }, {
            onFinish: () => {
                setProcessing(false);
                setConfirmOpen(false);
                setTargetStatus(null);
            },
        });
    };

    const getConfirmConfig = () => {
        if (targetStatus === 'For Dispensing') {
            return {
                title: 'Mark for Dispensing?',
                description: `This will move order ${order.order_no} to the dispensing queue.`,
                confirmLabel: 'Mark for Dispensing',
            };
        }
        if (targetStatus === 'Completed') {
            return {
                title: 'Complete Order?',
                description: `This will mark order ${order.order_no} as completed and lock it for further changes.`,
                confirmLabel: 'Complete Order',
            };
        }
        return { title: 'Are you sure?', confirmLabel: 'Proceed' };
    };

    const config = getConfirmConfig();

    return (
        <>
            {order.status === 'Pending Review' && (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 cursor-pointer"
                    disabled={processing}
                    onClick={() => updateStatus('For Dispensing')}
                >
                    <ChevronRight className="mr-1 h-3 w-3" />
                    Dispense
                </Button>
            )}

            {order.status === 'For Dispensing' && (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    disabled={processing}
                    onClick={() => updateStatus('Completed')}
                >
                    <Check className="mr-1 h-3 w-3" />
                    Complete
                </Button>
            )}

            {order.status === 'Completed' && (
                <div className="flex items-center text-xs font-medium text-slate-400">
                    <Lock className="mr-1 h-3 w-3" />
                    Closed
                </div>
            )}

            <ConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                onConfirm={handleConfirm}
                title={config.title}
                description={config.description}
                confirmLabel={config.confirmLabel}
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
