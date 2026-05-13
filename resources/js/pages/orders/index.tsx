import { Head, Link, router } from '@inertiajs/react';
import {
    ClipboardList,
    Download,
    Eye,
    Filter,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { OrderExportSheet } from '@/components/orders/order-export-sheet';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { Checkbox } from '@/components/ui/checkbox';
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
import { OrderRegistrationDialog } from '@/components/orders/order-registration-dialog';
import {
    getPatientName,
    getStatusClass,
    initialOrders,
    statusOptions,
    type TpnOrder,
    type TpnOrderStatus,
} from '@/types/orders';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type OrdersIndexProps = {
    orders?: TpnOrder[];
};

const ITEMS_PER_PAGE = 5;

export default function OrdersIndex({
    orders = initialOrders,
}: OrdersIndexProps) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<TpnOrderStatus | 'All'>('All');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<TpnOrder | null>(null);
    const [deletingOrder, setDeletingOrder] = useState<TpnOrder | null>(null);
    const [exportingOrder, setExportingOrder] = useState<TpnOrder | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());

    const [currentPage, setCurrentPage] = useState(1);

    const filteredOrders = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return orders.filter((order) => {
            const patientName = getPatientName(order).toLowerCase();

            const matchesQuery =
                normalizedQuery === '' ||
                order.order_no.toLowerCase().includes(normalizedQuery) ||
                patientName.includes(normalizedQuery) ||
                order.hospital_number.toLowerCase().includes(normalizedQuery);

            const matchesStatus =
                status === 'All' ||
                String(order.status ?? '').toLowerCase() ===
                String(status).toLowerCase();

            return matchesQuery && matchesStatus;
        });
    }, [orders, query, status]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / ITEMS_PER_PAGE),
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedOrders = filteredOrders.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE,
    );

    const emptyRows = Math.max(0, ITEMS_PER_PAGE - paginatedOrders.length);

    useEffect(() => {
        setCurrentPage(1);
    }, [query, status]);

    function toggleOrderSelection(orderId: number) {
        setSelectedOrderIds((prev) => {
            const next = new Set(prev);
            if (next.has(orderId)) {
                next.delete(orderId);
            } else {
                next.add(orderId);
            }
            return next;
        });
    }

    function toggleAllOnPage() {
        if (paginatedOrders.length === 0) return;
        const allPageIds = paginatedOrders.map(o => o.id);
        const allSelected = allPageIds.every(id => selectedOrderIds.has(id));

        setSelectedOrderIds(prev => {
            const next = new Set(prev);
            if (allSelected) {
                allPageIds.forEach(id => next.delete(id));
            } else {
                allPageIds.forEach(id => next.add(id));
            }
            return next;
        });
    }

    function handleCreate() {
        setEditingOrder(null);
        setDialogOpen(true);
    }

    function handleEdit(order: TpnOrder) {
        setEditingOrder(order);
        setDialogOpen(true);
    }

    function handleDelete(order: TpnOrder) {
        setDeletingOrder(order);
    }

    function confirmDelete() {
        if (!deletingOrder) {
            return;
        }

        router.delete(`/orders/${deletingOrder.id}`, {
            preserveScroll: true,
            onFinish: () => setDeletingOrder(null),
        });
    }

    function handleShow(order: TpnOrder) {
        router.visit(`/orders/${order.id}`);
    }

    function handleExport(order: TpnOrder) {
        setExportingOrder(order);
        window.setTimeout(() => window.print(), 100);
    }

    return (
        <>
            <Head title="Orders" />

            <div className="emr-content-surface flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Orders
                        </h1>
                        <p className="text-sm text-slate-500">
                            Search and review parenteral nutrition orders before
                            formulation, compounding, and dispensing.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {selectedOrderIds.size > 0 && (
                            <div className="flex items-center gap-2 mr-2">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(`/labels/tpn?ids=${Array.from(selectedOrderIds).join(',')}`, '_blank')}
                                    className="cursor-pointer"
                                >
                                    <ClipboardList className="mr-2 h-4 w-4 text-[#2f7d32]" />
                                    Print TPN ({selectedOrderIds.size})
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(`/labels/lipids?ids=${Array.from(selectedOrderIds).join(',')}`, '_blank')}
                                    className="cursor-pointer"
                                >
                                    <ClipboardList className="mr-2 h-4 w-4 text-orange-600" />
                                    Print Lipids ({selectedOrderIds.size})
                                </Button>
                            </div>
                        )}
                        <Button
                            className="cursor-pointer bg-[#2f7d32] text-white hover:bg-[#27692a]"
                            onClick={handleCreate}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New TPN Order
                        </Button>
                    </div>
                </div>

                <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 pb-2 text-slate-900">
                                    <ClipboardList className="h-5 w-5 text-[#2f7d32]" />
                                    TPN Order Directory
                                </CardTitle>
                                <CardDescription className="text-slate-500">
                                    {filteredOrders.length} orders available for
                                    lookup.
                                </CardDescription>
                            </div>

                            <div className="flex flex-col gap-2 pb-4 sm:flex-row">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder="Search order, patient, hospital no."
                                        className="w-full pl-9 sm:w-[320px]"
                                    />
                                </div>

                                {/* <Select
                                    value={status}
                                    onValueChange={(value) =>
                                        setStatus(
                                            value as TpnOrderStatus | 'All',
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full cursor-pointer sm:w-[210px]">
                                        <Filter className="mr-2 h-4 w-4 text-slate-400" />
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                                className="cursor-pointer"
                                            >
                                                {option === 'All'
                                                    ? 'All Statuses'
                                                    : option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select> */}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-6 pb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1040px] text-sm">
                                <thead className="border-b border-slate-200 text-left text-xs tracking-[0.16em] text-slate-600 uppercase">
                                    <tr>
                                        <th className="w-[40px] px-4 py-3">
                                            <Checkbox
                                                checked={paginatedOrders.length > 0 && paginatedOrders.every(o => selectedOrderIds.has(o.id))}
                                                onCheckedChange={toggleAllOnPage}
                                                aria-label="Select all on page"
                                            />
                                        </th>
                                        <th className="py-3 pr-5 font-semibold">
                                            Order No.
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Patient
                                        </th>
                                        <th className="px-5 py-3 text-center font-semibold">
                                            Hospital No.
                                        </th>
                                        <th className="px-5 py-3 text-center font-semibold">
                                            Date of Birth
                                        </th>
                                        <th className="px-5 py-3 text-center font-semibold">
                                            Sex
                                        </th>
                                        <th className="px-5 py-3 text-center font-semibold">
                                            Weight (Kg)
                                        </th>
                                        <th className="px-5 py-3 text-center font-semibold">
                                            Ward
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Order Date
                                        </th>
                                        <th className="px-5 py-3 text-center font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {paginatedOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-4">
                                                <Checkbox
                                                    checked={selectedOrderIds.has(order.id)}
                                                    onCheckedChange={() => toggleOrderSelection(order.id)}
                                                    aria-label={`Select order ${order.order_no}`}
                                                />
                                            </td>
                                            <td className="py-4 pr-5 font-medium text-slate-900">
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="font-medium text-slate-900 hover:text-[#2f7d32] hover:underline"
                                                >
                                                    {order.order_no}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="font-medium text-slate-900 hover:text-[#2f7d32] hover:underline"
                                                >
                                                    {getPatientName(order) ||
                                                        'N/A'}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4 text-center font-medium text-slate-900">
                                                {order.hospital_number || 'N/A'}
                                            </td>
                                            <td className="px-5 py-4 text-center text-slate-700">
                                                {order.date_of_birth || 'N/A'}
                                            </td>
                                            <td className="px-5 py-4 text-center text-slate-700">
                                                {order.sex || 'N/A'}
                                            </td>
                                            <td className="px-5 py-4 text-center text-slate-700">
                                                {order.birth_weight_kg ||
                                                    order.current_weight_kg
                                                    ? `${order.birth_weight_kg || order.current_weight_kg} kg`
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-5 py-4 text-center text-slate-700">
                                                {[order.ward, order.room]
                                                    .filter(Boolean)
                                                    .join(' / ') || 'N/A'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">
                                                {order.order_date}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9 cursor-pointer"
                                                                aria-label="Open order actions"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Open actions
                                                                </span>
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-44"
                                                        >
                                                            <DropdownMenuItem
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    handleShow(
                                                                        order,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Show
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        order,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    handleExport(
                                                                        order,
                                                                    )
                                                                }
                                                            >
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Export
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem
                                                                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        order,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="h-[544px] text-center text-sm text-slate-500"
                                            >
                                                No orders match your search or
                                                filter.
                                            </td>
                                        </tr>
                                    ) : null}

                                    {filteredOrders.length > 0
                                        ? Array.from({ length: emptyRows }).map(
                                            (_, index) => (
                                                <tr
                                                    key={`empty-row-${index}`}
                                                    className="h-[68px]"
                                                    aria-hidden="true"
                                                >
                                                    <td
                                                        colSpan={9}
                                                        className="border-b border-slate-100"
                                                    >
                                                        &nbsp;
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                        : null}
                                </tbody>
                            </table>
                        </div>

                        {filteredOrders.length > ITEMS_PER_PAGE ? (
                            <div className="mt-6 flex flex-col gap-3 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing{' '}
                                    <span className="font-medium text-foreground">
                                        {(safeCurrentPage - 1) *
                                            ITEMS_PER_PAGE +
                                            1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-foreground">
                                        {Math.min(
                                            safeCurrentPage * ITEMS_PER_PAGE,
                                            filteredOrders.length,
                                        )}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-foreground">
                                        {filteredOrders.length}
                                    </span>{' '}
                                    orders
                                </div>

                                <Pagination className="mx-0 w-auto justify-end">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();

                                                    if (safeCurrentPage > 1) {
                                                        setCurrentPage(
                                                            safeCurrentPage - 1,
                                                        );
                                                    }
                                                }}
                                                className={
                                                    safeCurrentPage === 1
                                                        ? 'pointer-events-none opacity-50'
                                                        : ''
                                                }
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }).map(
                                            (_, index) => {
                                                const page = index + 1;

                                                if (
                                                    totalPages > 7 &&
                                                    page !== 1 &&
                                                    page !== totalPages &&
                                                    Math.abs(
                                                        page - safeCurrentPage,
                                                    ) > 1
                                                ) {
                                                    if (
                                                        page === 2 ||
                                                        page === totalPages - 1
                                                    ) {
                                                        return (
                                                            <PaginationItem
                                                                key={page}
                                                            >
                                                                <PaginationEllipsis />
                                                            </PaginationItem>
                                                        );
                                                    }

                                                    return null;
                                                }

                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationLink
                                                            href="#"
                                                            isActive={
                                                                page ===
                                                                safeCurrentPage
                                                            }
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                event.preventDefault();
                                                                setCurrentPage(
                                                                    page,
                                                                );
                                                            }}
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            },
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();

                                                    if (
                                                        safeCurrentPage <
                                                        totalPages
                                                    ) {
                                                        setCurrentPage(
                                                            safeCurrentPage + 1,
                                                        );
                                                    }
                                                }}
                                                className={
                                                    safeCurrentPage ===
                                                        totalPages
                                                        ? 'pointer-events-none opacity-50'
                                                        : ''
                                                }
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>

            <OrderRegistrationDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);

                    if (!open) {
                        setEditingOrder(null);
                    }
                }}
                initialData={editingOrder ?? undefined}
                title={editingOrder ? 'Edit TPN Order' : 'New TPN Order'}
                submitLabel={
                    editingOrder ? 'Save Changes' : 'Submit for Review'
                }
            />

            {exportingOrder ? (
                <OrderExportSheet order={exportingOrder} />
            ) : null}

            <ConfirmationDialog
                open={Boolean(deletingOrder)}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingOrder(null);
                    }
                }}
                title="Delete this TPN order?"
                description={
                    deletingOrder
                        ? `${deletingOrder.order_no} for ${getPatientName(deletingOrder) || 'this patient'} will be permanently removed. This cannot be undone.`
                        : undefined
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={confirmDelete}
            />
        </>
    );
}

OrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Orders',
            href: '/orders',
        },
    ],
};
