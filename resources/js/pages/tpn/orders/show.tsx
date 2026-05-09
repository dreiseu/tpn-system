import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    ClipboardList,
    Droplets,
    FlaskConical,
    UserRound,
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
import {
    calculateBmi,
    calculateInfusionRate,
    findOrderById,
    getPatientName,
    getStatusClass,
    type TpnOrder,
} from '@/pages/tpn/orders/data';

function getOrderIdFromPath() {
    if (typeof window === 'undefined') {
        return null;
    }

    const id = Number(
        window.location.pathname.split('/').filter(Boolean).at(-1),
    );

    return Number.isFinite(id) ? id : null;
}

function displayValue(value?: string | boolean) {
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return value || 'N/A';
}

function InfoItem({
    label,
    value,
}: {
    label: string;
    value?: string | boolean;
}) {
    return (
        <div>
            <dt className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
                {displayValue(value)}
            </dd>
        </div>
    );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
    return (
        <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</dl>
    );
}

function WorkflowStatus({ order }: { order: TpnOrder }) {
    const stages = [
        {
            title: 'Pending Review',
            description:
                'The pharmacist reviews the request, validates clinical details, and checks if the order is ready for formulation.',
        },
        {
            title: 'For Compounding',
            description:
                'The approved formulation is prepared by the compounding team using the verified TPN requirements.',
        },
        {
            title: 'For Dispensing',
            description:
                'The compounded TPN is ready for final release, documentation, and ward/unit dispensing.',
        },
    ];

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Activity className="h-5 w-5 text-[#2f7d32]" />
                    Workflow Status
                </CardTitle>
                <CardDescription>
                    Current status and expected movement of this order.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Badge
                    variant="outline"
                    className={getStatusClass(order.status)}
                >
                    {order.status}
                </Badge>

                <div className="grid gap-3 lg:grid-cols-3">
                    {stages.map((stage) => (
                        <div
                            key={stage.title}
                            className="rounded-md border border-slate-200 p-4"
                        >
                            <h3 className="text-sm font-semibold text-slate-900">
                                {stage.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {stage.description}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function TpnOrderShow() {
    const orderId = getOrderIdFromPath();
    const order = orderId ? findOrderById(orderId) : null;

    if (!order) {
        return (
            <>
                <Head title="TPN Order Not Found" />

                <div className="emr-content-surface flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <Button variant="outline" className="w-fit" asChild>
                        <Link href="/tpn/orders">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Link>
                    </Button>

                    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle>TPN Order Not Found</CardTitle>
                            <CardDescription>
                                The selected order could not be found in the
                                current order directory.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </>
        );
    }

    const patientName = getPatientName(order) || 'N/A';
    const bmi = calculateBmi(order.height_cm, order.current_weight_kg);
    const infusionRate = calculateInfusionRate(
        order.total_fluid_ml,
        order.duration_hours,
    );

    return (
        <>
            <Head title={`${order.order_no} - ${patientName}`} />

            <div className="emr-content-surface flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-3">
                        <Button variant="outline" className="w-fit" asChild>
                            <Link href="/tpn/orders">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Orders
                            </Link>
                        </Button>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                {patientName}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {order.order_no} /{' '}
                                {order.hospital_number || 'No hospital number'}
                            </p>
                        </div>
                    </div>

                    <Badge
                        variant="outline"
                        className={getStatusClass(order.status)}
                    >
                        {order.status}
                    </Badge>
                </div>

                <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <UserRound className="h-5 w-5 text-[#2f7d32]" />
                            Patient and Case Information
                        </CardTitle>
                        <CardDescription>
                            Admitted patient details tied to this TPN request.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InfoGrid>
                            <InfoItem label="Patient" value={patientName} />
                            <InfoItem
                                label="Hospital No."
                                value={order.hospital_number}
                            />
                            <InfoItem
                                label="Date of Birth"
                                value={order.date_of_birth}
                            />
                            <InfoItem label="Sex" value={order.sex} />
                            <InfoItem label="Ward" value={order.ward} />
                            <InfoItem label="Room / Bed" value={order.room} />
                            <InfoItem
                                label="Prescribing Physician"
                                value={order.prescribing_physician}
                            />
                            <InfoItem
                                label="Temporary Request"
                                value={order.temporary_request}
                            />
                            <InfoItem
                                label="Initial Order"
                                value={order.is_initial_order}
                            />
                        </InfoGrid>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <ClipboardList className="h-5 w-5 text-[#2f7d32]" />
                            Clinical Details
                        </CardTitle>
                        <CardDescription>
                            Clinical basis used to review and formulate the TPN.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InfoGrid>
                            <InfoItem
                                label="Birth Weight"
                                value={
                                    order.birth_weight_kg
                                        ? `${order.birth_weight_kg} kg`
                                        : ''
                                }
                            />
                            <InfoItem
                                label="Current Weight"
                                value={
                                    order.current_weight_kg
                                        ? `${order.current_weight_kg} kg`
                                        : ''
                                }
                            />
                            <InfoItem
                                label="Height"
                                value={
                                    order.height_cm
                                        ? `${order.height_cm} cm`
                                        : ''
                                }
                            />
                            <InfoItem label="BMI" value={bmi} />
                            <InfoItem
                                label="Diagnosis / Clinical Notes"
                                value={order.diagnosis}
                            />
                        </InfoGrid>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <Droplets className="h-5 w-5 text-[#2f7d32]" />
                            TPN Requirements
                        </CardTitle>
                        <CardDescription>
                            Target volume, duration, route, and calculated rate.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InfoGrid>
                            <InfoItem
                                label="Total Fluid"
                                value={
                                    order.total_fluid_ml
                                        ? `${order.total_fluid_ml} mL`
                                        : ''
                                }
                            />
                            <InfoItem
                                label="Duration"
                                value={
                                    order.duration_hours
                                        ? `${order.duration_hours} hours`
                                        : ''
                                }
                            />
                            <InfoItem
                                label="Infusion Rate"
                                value={
                                    infusionRate ? `${infusionRate} mL/hr` : ''
                                }
                            />
                            <InfoItem label="Route" value={order.route} />
                        </InfoGrid>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <FlaskConical className="h-5 w-5 text-[#2f7d32]" />
                            Formula Preview
                        </CardTitle>
                        <CardDescription>
                            Initial macronutrient fields captured from the
                            order.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InfoGrid>
                            <InfoItem label="Dextrose" value={order.dextrose} />
                            <InfoItem
                                label="Amino Acid"
                                value={order.amino_acid}
                            />
                            <InfoItem label="Lipids" value={order.lipids} />
                            <InfoItem label="Remarks" value={order.remarks} />
                        </InfoGrid>
                    </CardContent>
                </Card>

                <WorkflowStatus order={order} />
            </div>
        </>
    );
}

TpnOrderShow.layout = {
    breadcrumbs: [
        {
            title: 'TPN Orders',
            href: '/tpn/orders',
        },
        {
            title: 'Order Detail',
            href: '#',
        },
    ],
};
