import { Head, Link } from '@inertiajs/react';
import {
    Beaker,
    ClipboardCheck,
    Filter,
    PackageCheck,
    Plus,
    Search,
    UsersRound,
} from 'lucide-react';

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

type TpnOrderStatus =
    | 'Draft'
    | 'Pending Review'
    | 'Approved'
    | 'For Compounding'
    | 'For Dispensing'
    | 'Completed';

type TpnOrder = {
    id: number;
    order_no: string;
    hospital_no: string;
    patient_name: string;
    case_no: string;
    location: string;
    order_date: string;
    status: TpnOrderStatus;
};

const summaryCards = [
    {
        title: 'Active TPN Patients',
        value: 18,
        description: 'Patients currently monitored for nutrition support',
        icon: UsersRound,
    },
    {
        title: 'Pending Review',
        value: 6,
        description: 'Orders waiting for pharmacist validation',
        icon: ClipboardCheck,
    },
    {
        title: 'For Compounding',
        value: 4,
        description: 'Approved formulas queued for preparation',
        icon: Beaker,
    },
    {
        title: 'For Dispensing',
        value: 3,
        description: 'Prepared TPN bags pending release',
        icon: PackageCheck,
    },
];

const orders: TpnOrder[] = [
    {
        id: 1,
        order_no: 'TPN-2026-0001',
        hospital_no: 'HN-000124',
        patient_name: 'Juan Dela Cruz',
        case_no: 'CSNUM20260000001',
        location: 'NICU / Room 201 / Bed 03',
        order_date: 'May 9, 2026 08:30 AM',
        status: 'Pending Review',
    },
    {
        id: 2,
        order_no: 'TPN-2026-0002',
        hospital_no: 'HN-000221',
        patient_name: 'Maria Santos',
        case_no: 'CSNUM20260000002',
        location: 'ICU / Room 104 / Bed 01',
        order_date: 'May 9, 2026 09:15 AM',
        status: 'For Compounding',
    },
    {
        id: 3,
        order_no: 'TPN-2026-0003',
        hospital_no: 'HN-000358',
        patient_name: 'Pedro Reyes',
        case_no: 'CSNUM20260000003',
        location: 'Pedia / Room 305 / Bed 02',
        order_date: 'May 8, 2026 02:20 PM',
        status: 'For Dispensing',
    },
];

function getStatusClass(status: TpnOrderStatus) {
    switch (status) {
        case 'Draft':
            return 'border-muted-foreground/30 bg-muted text-muted-foreground';
        case 'Pending Review':
            return 'border-yellow-500/30 bg-yellow-50 text-yellow-700';
        case 'Approved':
            return 'border-blue-500/30 bg-blue-50 text-blue-700';
        case 'For Compounding':
            return 'border-purple-500/30 bg-purple-50 text-purple-700';
        case 'For Dispensing':
            return 'border-emerald-500/30 bg-emerald-50 text-emerald-700';
        case 'Completed':
            return 'border-green-500/30 bg-green-50 text-green-700';
        default:
            return 'border-muted-foreground/30 bg-muted text-muted-foreground';
    }
}

export default function TpnOrdersIndex() {
    return (
        <>
            <Head title="TPN Orders" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            TPN Orders
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage parenteral nutrition requests, formulation
                            review, compounding, and dispensing workflow.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/tpn/orders/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New TPN Order
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Card key={card.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {card.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {card.value}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {card.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Card>
                    <CardHeader className="gap-3">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle>TPN Order Registry</CardTitle>
                                <CardDescription>
                                    Static layout preview for the initial TPN
                                    order workflow.
                                </CardDescription>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search patient or case no."
                                        className="w-full pl-9 sm:w-[260px]"
                                    />
                                </div>

                                <Select defaultValue="all">
                                    <SelectTrigger className="w-full sm:w-[190px]">
                                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Statuses
                                        </SelectItem>
                                        <SelectItem value="pending-review">
                                            Pending Review
                                        </SelectItem>
                                        <SelectItem value="for-compounding">
                                            For Compounding
                                        </SelectItem>
                                        <SelectItem value="for-dispensing">
                                            For Dispensing
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-hidden rounded-lg border">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">
                                                Order No.
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Patient
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Case No.
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Location
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Order Date
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {orders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="transition hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {order.order_no}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">
                                                        {order.patient_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {order.hospital_no}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {order.case_no}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {order.location}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {order.order_date}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={getStatusClass(
                                                            order.status,
                                                        )}
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
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