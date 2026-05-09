import { Head, Link } from '@inertiajs/react';
import { Beaker, ClipboardCheck, PackageCheck, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatManilaDate, formatManilaDateTime } from '@/lib/date';

type DashboardProps = {
    stats?: {
        total_patients: number;
        registrations_today: number;
        active_encounters: number;
        admissions_today: number;
    };
    recentPatients?: Array<{
        id: number;
        hospital_number: string;
        display_name: string;
        birth_date?: string | null;
        sex: string | null;
        mobile_number?: string | null;
        created_at?: string | null;
    }>;
};

const statCards = [
    {
        key: 'total_patients',
        title: 'TPN Patients',
        description: 'Patients tracked for nutrition support',
        icon: UsersRound,
    },
    {
        key: 'registrations_today',
        title: 'New Requests Today',
        description: 'TPN orders opened for screening',
        icon: ClipboardCheck,
    },
    {
        key: 'active_encounters',
        title: 'Active Formulations',
        description: 'Therapy plans currently in progress',
        icon: Beaker,
    },
    {
        key: 'admissions_today',
        title: 'For Dispensing',
        description: 'Prepared bags pending release',
        icon: PackageCheck,
    },
] as const;

const emptyStats = {
    total_patients: 0,
    registrations_today: 0,
    active_encounters: 0,
    admissions_today: 0,
};

export default function Dashboard({
    stats = emptyStats,
    recentPatients = [],
}: DashboardProps) {
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
                            Patient nutrition support, formulation, and
                            dispensing activity for the current system snapshot.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                            asChild
                        >
                            <Link href="/patients" prefetch>
                                View Registry
                            </Link>
                        </Button>
                        <Button
                            className="bg-[#2f7d32] text-white hover:bg-[#27692a]"
                            asChild
                        >
                            <Link href="/tpn/orders/create" prefetch>
                                New TPN Order
                            </Link>
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
                                Recent TPN Patient Activity
                            </CardTitle>
                            <CardDescription className="text-slate-500">
                                Latest patients associated with nutrition
                                support workflows.
                            </CardDescription>
                        </div>
                        <Badge
                            variant="outline"
                            className="border-slate-300 bg-white text-slate-700"
                        >
                            {recentPatients.length} visible
                        </Badge>
                    </CardHeader>
                    <CardContent className="emr-scrollbar overflow-x-auto">
                        <div className="min-w-[820px]">
                            <div className="grid grid-cols-[1.2fr_1.8fr_1fr_0.8fr_1fr_1fr] gap-4 border-b border-slate-200 pt-3 pb-3 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
                                <span>Hospital No.</span>
                                <span>Patient</span>
                                <span>Birth Date</span>
                                <span>Sex</span>
                                <span>Mobile</span>
                                <span>Registered</span>
                            </div>
                            <div className="divide-y divide-slate-200">
                                {recentPatients.length > 0 ? (
                                    recentPatients.map((patient) => (
                                        <div
                                            key={patient.id}
                                            className="grid grid-cols-[1.2fr_1.8fr_1fr_0.8fr_1fr_1fr] gap-4 py-4 text-sm"
                                        >
                                            <span className="font-medium text-slate-900">
                                                {patient.hospital_number}
                                            </span>
                                            <span className="font-medium text-slate-900">
                                                {patient.display_name}
                                            </span>
                                            <span className="text-slate-700">
                                                {formatManilaDate(
                                                    patient.birth_date,
                                                )}
                                            </span>
                                            <span className="text-slate-700 capitalize">
                                                {patient.sex ?? 'N/A'}
                                            </span>
                                            <span className="text-slate-700">
                                                {patient.mobile_number ?? 'N/A'}
                                            </span>
                                            <span className="text-slate-700">
                                                {formatManilaDateTime(
                                                    patient.created_at,
                                                )}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-sm text-slate-500">
                                        No TPN patient activity has been
                                        recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
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
