import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    calculateLipidVolumeMl,
    calculatePerKgPerDay,
    getPatientName,
    resolveWeightForComputation,
    type TpnOrder,
} from '@/types/orders';

type LabelPageProps = {
    orders?: TpnOrder[];
};

type LipidsLabelData = {
    concentration: string;
    dose: string;
    patientName: string;
    expiryDate: string;
};

function tomorrow() {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    return date.toLocaleDateString('en-US');
}

function lipidsLabelFromOrder(order?: TpnOrder | null): LipidsLabelData {
    const weight = resolveWeightForComputation(
        order?.birth_weight_kg ?? '',
        order?.current_weight_kg ?? '',
    );
    const lipidGrams = calculatePerKgPerDay(
        order?.lipid_g_per_kg_day ?? '',
        weight,
    );

    return {
        concentration: order?.lipid_concentration || '20',
        dose:
            calculateLipidVolumeMl(
                lipidGrams,
                order?.lipid_concentration || '20',
            ) || '',
        patientName: order ? getPatientName(order) || '' : '',
        expiryDate: tomorrow(),
    };
}

export default function LipidsLabelsPage({ orders = [] }: LabelPageProps) {
    const [selectedOrderId, setSelectedOrderId] = useState(
        orders[0]?.id ? String(orders[0].id) : '',
    );

    const selectedOrder = useMemo(
        () => orders.find((order) => String(order.id) === selectedOrderId),
        [orders, selectedOrderId],
    );

    const [labelData, setLabelData] = useState<LipidsLabelData>(() =>
        lipidsLabelFromOrder(orders[0]),
    );

    useEffect(() => {
        setLabelData(lipidsLabelFromOrder(selectedOrder));
    }, [selectedOrder]);

    function updateField<K extends keyof LipidsLabelData>(
        field: K,
        value: LipidsLabelData[K],
    ) {
        setLabelData((current) => ({ ...current, [field]: value }));
    }

    return (
        <>
            <Head title="Lipids Label" />

            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    .label-print-area,
                    .label-print-area * {
                        visibility: visible !important;
                    }

                    .label-print-area {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        background: white !important;
                        padding: 0 !important;
                    }
                }
            `}</style>

            <div className="emr-content-surface flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between print:hidden">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Lipids Label
                        </h1>
                        <p className="text-sm text-slate-500">
                            Select an order, modify the lipid label, then print.
                        </p>
                    </div>

                    <Button
                        className="cursor-pointer bg-[#2f7d32] text-white hover:bg-[#27692a]"
                        onClick={() => window.print()}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Print Label
                    </Button>
                </div>

                <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
                    <Card className="rounded-lg border-slate-200 bg-white shadow-sm print:hidden">
                        <CardHeader>
                            <CardTitle>Label Setup</CardTitle>
                            <CardDescription>
                                Changes here are for printing only and do not
                                alter the saved order.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label>Order</Label>
                                <Select
                                    value={selectedOrderId}
                                    onValueChange={setSelectedOrderId}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select order" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orders.map((order) => (
                                            <SelectItem
                                                key={order.id}
                                                value={String(order.id)}
                                            >
                                                {order.order_no} -{' '}
                                                {getPatientName(order) || 'N/A'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Lipids Concentration</Label>
                                    <Input
                                        value={labelData.concentration}
                                        onChange={(event) =>
                                            updateField(
                                                'concentration',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Dose / Volume</Label>
                                    <Input
                                        value={labelData.dose}
                                        onChange={(event) =>
                                            updateField(
                                                'dose',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Patient Name</Label>
                                    <Input
                                        value={labelData.patientName}
                                        onChange={(event) =>
                                            updateField(
                                                'patientName',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Expiration Date</Label>
                                    <Input
                                        value={labelData.expiryDate}
                                        onChange={(event) =>
                                            updateField(
                                                'expiryDate',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="label-print-area">
                        <LipidsPrintableLabels data={labelData} />
                    </div>
                </div>
            </div>
        </>
    );
}

function LipidsPrintableLabels({ data }: { data: LipidsLabelData }) {
    return (
        <div className="w-full max-w-[520px] bg-white text-black">
            {[0, 1].map((index) => (
                <table
                    key={index}
                    className="mb-1 w-full table-fixed border-collapse border-2 border-black text-[18px] leading-tight"
                >
                    <tbody>
                        <tr>
                            <td
                                className="border border-black bg-red-600 py-0.5 text-center text-2xl font-bold text-white"
                                colSpan={3}
                            >
                                HIGH ALERT
                            </td>
                        </tr>
                        <tr>
                            <td
                                className="border border-black px-1 font-bold"
                                colSpan={3}
                            >
                                LIPIDS {data.concentration}%
                            </td>
                        </tr>
                        <tr>
                            <td className="w-24 border border-black px-1 font-bold">
                                Dose
                            </td>
                            <td className="border border-black px-1 text-center text-2xl font-bold">
                                {data.dose}
                            </td>
                            <td className="w-20 border border-black px-1 text-right font-bold">
                                mL
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black px-1 font-bold">
                                PN:
                            </td>
                            <td
                                className="border border-black px-1 text-center font-bold"
                                colSpan={2}
                            >
                                {data.patientName}
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black px-1 font-bold">
                                ED:
                            </td>
                            <td
                                className="border border-black px-1 text-center font-bold"
                                colSpan={2}
                            >
                                {data.expiryDate}
                            </td>
                        </tr>
                    </tbody>
                </table>
            ))}
        </div>
    );
}

LipidsLabelsPage.layout = {
    breadcrumbs: [
        {
            title: 'Labels',
            href: '/labels/tpn',
        },
        {
            title: 'Lipids Label',
            href: '/labels/lipids',
        },
    ],
};
