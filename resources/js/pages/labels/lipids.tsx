import { Head } from '@inertiajs/react';
import { CalendarIcon, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

type AlertLevel = 'low' | 'medium' | 'high';

type LipidsLabelData = {
    alertLevel: AlertLevel;
    concentration: string;
    dose: string;
    patientName: string;
    expiryDate: string;
};

function tomorrow() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForPrint(dateStr: string) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return dateStr;
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
        alertLevel: 'high',
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

function EditableField({
    label,
    value,
    type = 'text',
    onChange,
}: {
    label: string;
    value: string;
    type?: string;
    onChange: (value: string) => void;
}) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [draftDate, setDraftDate] = useState<Date | undefined>();

    if (type === 'date') {
        const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;

        let displayValue = 'Select date';
        if (selectedDate && !isNaN(selectedDate.getTime())) {
            displayValue = selectedDate.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
            });
        }

        return (
            <div className="grid gap-2">
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                    <Input
                        value={displayValue}
                        readOnly
                        className="cursor-pointer"
                        onClick={() => {
                            setDraftDate(selectedDate);
                            setDialogOpen(true);
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 cursor-pointer"
                        onClick={() => {
                            setDraftDate(selectedDate);
                            setDialogOpen(true);
                        }}
                    >
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="w-auto max-w-none p-0">
                        <DialogHeader className="border-b px-5 py-4">
                            <DialogTitle>Select {label}</DialogTitle>
                        </DialogHeader>
                        <div className="px-4 py-4">
                            <Calendar
                                mode="single"
                                selected={draftDate}
                                onSelect={setDraftDate}
                                captionLayout="dropdown"
                                hideNavigation
                                startMonth={new Date(2020, 0)}
                                endMonth={new Date(new Date().getFullYear() + 5, 11)}
                            />
                        </div>
                        <DialogFooter className="border-t px-5 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => {
                                    onChange('');
                                    setDialogOpen(false);
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="cursor-pointer"
                                onClick={() => {
                                    if (draftDate) {
                                        const year = draftDate.getFullYear();
                                        const month = String(draftDate.getMonth() + 1).padStart(2, '0');
                                        const day = String(draftDate.getDate()).padStart(2, '0');
                                        onChange(`${year}-${month}-${day}`);
                                    }
                                    setDialogOpen(false);
                                }}
                            >
                                Apply
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
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

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [printCopies, setPrintCopies] = useState(1);
    const previewCopies = Math.min(printCopies, 30);

    const labelsPerPrintPage = 70;

    const printPages = Array.from(
        { length: Math.ceil(printCopies / labelsPerPrintPage) },
        (_, pageIndex) => {
            const start = pageIndex * labelsPerPrintPage;
            const count = Math.min(labelsPerPrintPage, printCopies - start);
            return Array.from({ length: count }, (_, labelIndex) => start + labelIndex);
        },
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

    function updatePrintCopies(value: string) {
        const copies = Number(value);
        if (!Number.isFinite(copies)) {
            setPrintCopies(1);
            return;
        }
        setPrintCopies(Math.min(Math.max(copies, 1), 100));
    }

    return (
        <>
            <Head title="Lipids Label" />

            <style>{`
                @media print {
                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 210mm !important;
                        background: #ffffff !important;
                        height: auto !important; 
                        overflow: visible !important;
                    }

                    body > * {
                        display: none !important;
                    }

                    body > .label-print-area {
                        display: block !important;
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                    }

                    .label-preview-area {
                        display: none !important;
                    }

                    .print-page {
                        visibility: visible !important;
                        width: 820px !important;
                        height: 1160px !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;

                        display: grid !important;
                        grid-template-columns: repeat(5, 4cm) !important;
                        gap: 1mm 1mm !important;
                        align-content: start !important;
                        justify-content: center !important;
                        padding-top: 2mm !important;

                        transform: scale(0.97) !important;
                        transform-origin: top left !important;

                        page-break-after: always !important;
                        break-after: page !important;
                    }

                    .print-page:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }

                    .label-copy {
                        width: 4cm !important;
                        height: 2cm !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }

                @page {
                    size: A4;
                    margin: 0mm;
                }

                .label-preview-area {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px; 
                    align-items: flex-start;
                    align-content: flex-start;
                }

                .label-print-area {
                    display: none;
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

                    <div className="flex items-end gap-3">
                        <div className="grid gap-1">
                            <Label htmlFor="print-copies" className="text-xs">
                                Copies
                            </Label>
                            <Input
                                id="print-copies"
                                type="number"
                                min={1}
                                max={100}
                                value={printCopies}
                                onChange={(event) => updatePrintCopies(event.target.value)}
                                className="h-9 w-24 text-center"
                            />
                        </div>

                        <Button
                            className="cursor-pointer bg-[#2f7d32] text-white hover:bg-[#27692a]"
                            onClick={() => window.print()}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Label
                        </Button>
                    </div>
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
                                    <SelectTrigger className="w-full text-center cursor-pointer">
                                        <SelectValue
                                            placeholder="Select order"
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orders.map((order) => (
                                            <SelectItem
                                                className="cursor-pointer"
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

                            <div className="grid gap-2">
                                <Label>Alert Level</Label>
                                <Select
                                    value={labelData.alertLevel}
                                    onValueChange={(value) =>
                                        updateField(
                                            'alertLevel',
                                            value as AlertLevel,
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full cursor-pointer">
                                        <SelectValue placeholder="Select alert level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low" className="cursor-pointer">
                                            Low Alert
                                        </SelectItem>
                                        <SelectItem value="medium" className="cursor-pointer">
                                            Medium Alert
                                        </SelectItem>
                                        <SelectItem value="high" className="cursor-pointer">
                                            High Alert
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {(
                                    [
                                        ['concentration', 'Lipids Concentration', 'text'],
                                        ['dose', 'Dose / Volume', 'text'],
                                        ['patientName', 'Patient Name', 'text'],
                                        ['expiryDate', 'Expiration Date', 'date'],
                                    ] as Array<[keyof LipidsLabelData, string, string]>
                                ).map(([field, label, inputType]) => (
                                    <EditableField
                                        key={field}
                                        label={label}
                                        type={inputType}
                                        value={labelData[field]}
                                        onChange={(value) => updateField(field, value)}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="label-preview-area">
                        {Array.from({ length: previewCopies }).map((_, index) => (
                            <div className="label-copy" key={`preview-${index}`}>
                                <LipidsPrintableLabel data={labelData} />
                            </div>
                        ))}
                    </div>

                    {mounted && typeof document !== 'undefined'
                        ? createPortal(
                            <div className="label-print-area">
                                {printPages.map((pageLabels, pageIndex) => (
                                    <div className="print-page" key={`print-page-${pageIndex}`}>
                                        {pageLabels.map((labelNumber) => (
                                            <div className="label-copy" key={`print-${labelNumber}`}>
                                                <LipidsPrintableLabel data={labelData} />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>,
                            document.body,
                        )
                        : null}
                </div>
            </div>
        </>
    );
}

function LipidsPrintableLabel({ data }: { data: LipidsLabelData }) {
    const alertConfig = {
        low: {
            text: 'LOW ALERT',
            bg: '#16a34a',
            fg: '#ffffff',
        },
        medium: {
            text: 'MEDIUM ALERT',
            bg: '#fde047',
            fg: '#000000',
        },
        high: {
            text: 'HIGH ALERT',
            bg: '#dc2626',
            fg: '#ffffff',
        },
    } satisfies Record<AlertLevel, { text: string; bg: string; fg: string }>;

    const alert = alertConfig[data.alertLevel];

    return (
        <div className="w-[4cm] h-[2cm] overflow-hidden bg-white text-black border-[1px] border-black flex flex-col font-sans">
            <div
                className="w-full py-[1px] text-center text-[9px] font-bold border-b-[1px] border-black"
                style={{
                    backgroundColor: alert.bg,
                    color: alert.fg,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                }}
            >
                {alert.text}
            </div>

            <div className="px-1 text-[9px] font-bold mt-0.5 leading-tight">
                LIPIDS {data.concentration}%
            </div>

            <table className="w-full mt-auto mb-[2px] table-fixed text-[8px] font-bold leading-tight">
                <tbody>
                    <tr>
                        <td className="w-8 px-1 align-bottom">Dose</td>
                        <td className="text-center text-[10px] align-bottom px-0.5 border-b-[1px] border-black">
                            {data.dose}
                        </td>
                        <td className="w-5 px-0.5 text-right align-bottom">mL</td>
                    </tr>
                    <tr>
                        <td className="px-1 pt-0.5 align-bottom">PN:</td>
                        <td className="text-center pt-0.5 px-0.5 uppercase align-bottom" colSpan={2}>
                            {data.patientName}
                        </td>
                    </tr>
                    <tr>
                        <td className="px-1 align-bottom">ED:</td>
                        <td className="text-center px-0.5 align-bottom" colSpan={2}>
                            {formatDateForPrint(data.expiryDate)}
                        </td>
                    </tr>
                </tbody>
            </table>
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
