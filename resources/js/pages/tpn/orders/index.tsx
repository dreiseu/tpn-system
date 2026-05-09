import { Head, Link } from '@inertiajs/react';
import {
    ClipboardList,
    Filter,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
import {
    TpnOrderDialog,
    type TpnOrderFormData,
} from '@/pages/tpn/orders/components/tpn-order-dialog';
import {
    getPatientName,
    getStatusClass,
    initialOrders,
    statusOptions,
    type TpnOrder,
    type TpnOrderStatus,
} from '@/pages/tpn/orders/data';

export default function TpnOrdersIndex() {
    const [orders, setOrders] = useState<TpnOrder[]>(initialOrders);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<TpnOrderStatus | 'All'>('All');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<TpnOrder | null>(null);

    const filteredOrders = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesStatus = status === 'All' || order.status === status;
            const searchable = [
                order.order_no,
                order.hospital_number,
                getPatientName(order),
                order.ward,
                order.room,
                order.prescribing_physician,
                order.status,
            ]
                .join(' ')
                .toLowerCase();

            return matchesStatus && searchable.includes(normalizedQuery);
        });
    }, [orders, query, status]);

    function handleCreate() {
        setEditingOrder(null);
        setDialogOpen(true);
    }

    function handleEdit(order: TpnOrder) {
        setEditingOrder(order);
        setDialogOpen(true);
    }

    function handleDelete(order: TpnOrder) {
        const confirmed = window.confirm(
            `Delete ${order.order_no} for ${getPatientName(order)}?`,
        );

        if (!confirmed) {
            return;
        }

        setOrders((currentOrders) =>
            currentOrders.filter((item) => item.id !== order.id),
        );
    }

    function handleSubmit(data: TpnOrderFormData) {
        if (editingOrder) {
            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === editingOrder.id
                        ? {
                              ...order,
                              ...data,
                          }
                        : order,
                ),
            );
            return;
        }

        const nextId =
            orders.reduce((maxId, order) => Math.max(maxId, order.id), 0) + 1;

        setOrders((currentOrders) => [
            {
                ...data,
                id: nextId,
                order_no: `TPN-2026-${String(nextId).padStart(4, '0')}`,
                order_date: new Intl.DateTimeFormat('en-PH', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }).format(new Date()),
                status: 'Draft',
            },
            ...currentOrders,
        ]);
    }

    return (
        <>
            <Head title="TPN Orders" />

            <div className="emr-content-surface flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            TPN Orders
                        </h1>
                        <p className="text-sm text-slate-500">
                            Search and review parenteral nutrition orders before
                            formulation, compounding, and dispensing.
                        </p>
                    </div>

                    <Button
                        className="bg-[#2f7d32] text-white hover:bg-[#27692a]"
                        onClick={handleCreate}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New TPN Order
                    </Button>
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

                                <Select
                                    value={status}
                                    onValueChange={(value) =>
                                        setStatus(
                                            value as TpnOrderStatus | 'All',
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full sm:w-[210px]">
                                        <Filter className="mr-2 h-4 w-4 text-slate-400" />
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                            >
                                                {option === 'All'
                                                    ? 'All Statuses'
                                                    : option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-6 pb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1040px] text-sm">
                                <thead className="border-b border-slate-200 text-left text-xs tracking-[0.16em] text-slate-600 uppercase">
                                    <tr>
                                        <th className="py-3 pr-5 font-semibold">
                                            Order No.
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Patient
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Hospital No.
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Location
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Physician
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Order Date
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-right font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="py-4 pr-5 font-medium text-slate-900">
                                                <Link
                                                    href={`/tpn/orders/${order.id}`}
                                                    className="font-medium text-slate-900 hover:text-[#2f7d32] hover:underline"
                                                >
                                                    {order.order_no}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Link
                                                    href={`/tpn/orders/${order.id}`}
                                                    className="font-medium text-slate-900 hover:text-[#2f7d32] hover:underline"
                                                >
                                                    {getPatientName(order) ||
                                                        'N/A'}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4 font-medium text-slate-900">
                                                {order.hospital_number || 'N/A'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">
                                                {[order.ward, order.room]
                                                    .filter(Boolean)
                                                    .join(' / ') || 'N/A'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">
                                                {order.prescribing_physician ||
                                                    'N/A'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">
                                                {order.order_date}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className={getStatusClass(
                                                        order.status,
                                                    )}
                                                >
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9"
                                                        onClick={() =>
                                                            handleEdit(order)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Edit order
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                                        onClick={() =>
                                                            handleDelete(order)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Delete order
                                                        </span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="py-10 text-center text-sm text-slate-500"
                                            >
                                                No TPN orders match your search
                                                or filter.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <TpnOrderDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialData={editingOrder ?? undefined}
                title={editingOrder ? 'Edit TPN Order' : 'New TPN Order'}
                submitLabel={editingOrder ? 'Save Changes' : 'Save Draft'}
                onSubmit={handleSubmit}
            />
        </>
    );
}

TpnOrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'TPN Orders',
            href: '/tpn/orders',
        },
    ],
};
