import { Head } from '@inertiajs/react';
import { CalendarIcon, Printer } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import bghmcLogoUrl from '../../../images/BGHMC logo hi-res.png';
import dohLogoUrl from '../../../images/DOH Logo.png';
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
    calculateCalciumContentPerDay,
    calculateCalciumVolumeMl,
    calculateDextroseVolumeMl,
    calculateMagnesiumVolumeMl,
    calculatePerKgPerDay,
    calculatePotassiumVolumeMl,
    calculateProteinVolumeMl,
    calculateSodiumVolumeMl,
    getPatientName,
    resolveWeightForComputation,
    type TpnOrder,
} from '@/types/orders';

type LabelPageProps = {
    orders?: TpnOrder[];
};

type AlertLevel = 'low' | 'medium' | 'high';

type TpnLabelData = {
    alertLevel: AlertLevel;
    patientName: string;
    hospitalNumber: string;
    ward: string;
    date: string;
    btlNumber: string;
    aminoAcidDose: string;
    aminoAcidVolume: string;
    dextrosePercent: string;
    dextroseVolume: string;
    sodiumDose: string;
    sodiumVolume: string;
    potassiumDose: string;
    potassiumVolume: string;
    magnesiumDose: string;
    magnesiumVolume: string;
    calciumDose: string;
    calciumVolume: string;
    traceElementDose: string;
    traceElementVolume: string;
    multivitaminsDose: string;
    multivitaminsVolume: string;
    heparinDose: string;
    heparinVolume: string;
    sterileWaterVolume: string;
    totalVolume: string;
    rate: string;
    duration: string;
    expiresOn: string;
    lipidText: string;
    preparedBy: string;
    dutyText: string;
    cautionText: string;
};

function today() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${month}/${day}/${year}`;
}

function getOrderDateString(orderDate?: string) {
    if (!orderDate) return today();

    const d = new Date(orderDate);
    // Fallback to today if the database string is invalid
    if (isNaN(d.getTime())) return today();

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function labelValue(value: unknown, fallback = '-') {
    if (value === null || value === undefined) {
        return fallback;
    }

    const text = String(value).trim();

    if (text === '' || text === '0.00') {
        return fallback;
    }

    return text;
}

function formatLabelContentDisplay(value: unknown, fallback = '-') {
    const text = labelValue(value, fallback);

    if (text === fallback) {
        return fallback;
    }

    const numericValue = Number(text);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return fallback;
    }

    return numericValue.toFixed(1);
}

function formatSterileWaterDisplay(value: unknown, fallback = '-') {
    if (value === null || value === undefined) {
        return fallback;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return fallback;
    }

    return numericValue.toFixed(1);
}

function getSterileWaterFromOsmolarityInputs(order?: TpnOrder | null): string {
    const rawJson = order?.osmolarity_inputs_json;

    if (!rawJson) {
        return '';
    }

    try {
        const parsed =
            typeof rawJson === 'string'
                ? JSON.parse(rawJson)
                : rawJson;

        const sterileWaterValue =
            parsed?.tpn?.sterile_water_ml ??
            parsed?.ppn?.sterile_water_ml ??
            parsed?.additives?.sterile_water_ml ??
            '';

        return String(sterileWaterValue ?? '').trim();
    } catch {
        return '';
    }
}

function tpnLabelFromOrder(order?: TpnOrder | null): TpnLabelData {
    const weight = resolveWeightForComputation(
        order?.birth_weight_kg ?? '',
        order?.current_weight_kg ?? '',
    );
    const aminoAcidGrams = calculatePerKgPerDay(
        order?.protein_g_per_kg_day ?? '',
        weight,
    );

    const sodiumDosePerDay = calculatePerKgPerDay(order?.sodium_meq_kg_day ?? '', weight);
    const potassiumDosePerDay = calculatePerKgPerDay(order?.potassium_meq_kg_day ?? '', weight);
    const magnesiumDosePerDay = calculatePerKgPerDay(order?.magnesium_meq_kg_day ?? '', weight);
    const calciumDosePerDay = calculateCalciumContentPerDay(order?.calcium_mg_kg_day ?? '', weight);
    const traceElementDosePerDay = order?.trace_elements_ml_kg_day || '';
    const multivitaminsDosePerDay = order?.multivitamins_ml_day || '';
    const heparinMl = Number(order?.heparin_ml);
    const heparinIuPerMl = Number(order?.heparin_iu_per_ml);

    const heparinDose =
        Number.isFinite(heparinMl) &&
            Number.isFinite(heparinIuPerMl) &&
            heparinMl > 0 &&
            heparinIuPerMl > 0
            ? String(heparinMl * heparinIuPerMl)
            : '';

    const sterileWaterFromJson = getSterileWaterFromOsmolarityInputs(order);

    const sterileWaterVolume =
        String(order?.sterile_water_level_ml_day ?? '').trim() !== ''
            ? order?.sterile_water_level_ml_day
            : sterileWaterFromJson;

    return {
        alertLevel: 'high',
        patientName: order ? getPatientName(order) || '-' : '-',
        hospitalNumber: labelValue(order?.hospital_number),
        ward: labelValue([order?.ward, order?.room].filter(Boolean).join(' / ')),
        date: order?.order_date ? getOrderDateString(order.order_date) : today(),
        btlNumber: '-',
        aminoAcidDose: formatLabelContentDisplay(aminoAcidGrams),
        aminoAcidVolume: formatLabelContentDisplay(
            calculateProteinVolumeMl(aminoAcidGrams),
        ),

        dextrosePercent: formatLabelContentDisplay(order?.dextrose_percent),
        dextroseVolume: formatLabelContentDisplay(
            calculateDextroseVolumeMl(
                order?.total_fluid_ml ?? '',
                order?.dextrose_percent ?? '',
            ),
        ),

        sodiumDose: formatLabelContentDisplay(sodiumDosePerDay),
        sodiumVolume: formatLabelContentDisplay(
            calculateSodiumVolumeMl(sodiumDosePerDay),
        ),

        potassiumDose: formatLabelContentDisplay(potassiumDosePerDay),
        potassiumVolume: formatLabelContentDisplay(
            calculatePotassiumVolumeMl(potassiumDosePerDay),
        ),

        magnesiumDose: formatLabelContentDisplay(magnesiumDosePerDay),
        magnesiumVolume: formatLabelContentDisplay(
            calculateMagnesiumVolumeMl(magnesiumDosePerDay),
        ),

        calciumDose: formatLabelContentDisplay(calciumDosePerDay),
        calciumVolume: formatLabelContentDisplay(
            calculateCalciumVolumeMl(calciumDosePerDay),
        ),

        traceElementDose: labelValue(traceElementDosePerDay),
        traceElementVolume: labelValue(traceElementDosePerDay),

        multivitaminsDose: formatLabelContentDisplay(multivitaminsDosePerDay),
        multivitaminsVolume: formatLabelContentDisplay(multivitaminsDosePerDay),

        heparinDose: formatLabelContentDisplay(heparinDose),
        heparinVolume: formatLabelContentDisplay(order?.heparin_ml),

        sterileWaterVolume: formatSterileWaterDisplay(sterileWaterVolume),
        totalVolume: formatLabelContentDisplay(order?.total_fluid_ml),

        rate:
            order?.total_fluid_ml && order?.duration_hours
                ? formatLabelContentDisplay(
                    Number(order.total_fluid_ml) /
                    Number(order.duration_hours),
                )
                : '-',
        duration: order?.duration_hours || '24',
        expiresOn: tomorrow(),
        lipidText: order?.lipid_concentration
            ? `Lipids ${order.lipid_concentration}%`
            : 'Lipids 20%',
        preparedBy: '',
        dutyText: 'Pharmacist on Duty',
        cautionText: 'Light sensitive, Cover with carbon',
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

export default function TpnLabelsPage({ orders = [] }: LabelPageProps) {
    const [selectedOrderId, setSelectedOrderId] = useState(
        orders[0]?.id ? String(orders[0].id) : '',
    );

    const selectedOrder = useMemo(
        () => orders.find((order) => String(order.id) === selectedOrderId),
        [orders, selectedOrderId],
    );

    const [labelData, setLabelData] = useState<TpnLabelData>(() =>
        tpnLabelFromOrder(orders[0]),
    );

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const isBatchMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('ids');
    const batchLabels = useMemo(() => orders.map(tpnLabelFromOrder), [orders]);

    const [printCopies, setPrintCopies] = useState(1);
    const previewCopies = Math.min(printCopies, 4);

    const labelsPerPrintPage = 6;
    const totalLabelsToPrint = isBatchMode ? orders.length * printCopies : printCopies;

    const printPages = Array.from(
        { length: Math.ceil(totalLabelsToPrint / labelsPerPrintPage) },
        (_, pageIndex) => {
            const start = pageIndex * labelsPerPrintPage;
            const count = Math.min(labelsPerPrintPage, totalLabelsToPrint - start);

            return Array.from({ length: count }, (_, labelIndex) => start + labelIndex);
        },
    );

    useEffect(() => {
        setLabelData(tpnLabelFromOrder(selectedOrder));
    }, [selectedOrder]);

    function updateField<K extends keyof TpnLabelData>(
        field: K,
        value: TpnLabelData[K],
    ) {
        setLabelData((current) => ({ ...current, [field]: value }));
    }

    function updatePrintCopies(value: string) {
        const copies = Number(value);

        if (!Number.isFinite(copies)) {
            setPrintCopies(1);
            return;
        }

        setPrintCopies(Math.min(Math.max(copies, 1), 20));
    }

    return (
        <>
            <Head title="TPN Label" />

            <style>{`
                @page {
                    size: letter portrait;
                    margin: 0;
                }

                .label-preview-area {
                    /* Custom Tailwind classes will handle the layout */
                }

                .label-preview-area .label-copy {
                    width: 357px !important;
                    height: 350px !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                }
                
                .label-preview-area .tpn-label-sheet {
                    transform: scale(0.94) !important;
                    transform-origin: top left !important;
                }

                .label-print-area {
                    display: none;
                }

                .label-copy {
                    width: 380px;
                    height: 372px;
                    box-sizing: border-box;
                    flex: 0 0 380px;
                }

                .tpn-label-sheet {
                    width: 380px;
                    height: 372px;
                    box-sizing: border-box;
                    overflow: hidden;
                    background: #ffffff;
                    color: #000000;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 8px;
                    line-height: 1;
                    border: 2px solid #000000;
                    padding: 4px;
                }

                .tpn-label-sheet .label-header {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    height: 42px;
                    border-bottom: 1px solid #000000;
                    padding-bottom: 1px;
                }

                .tpn-label-sheet .label-logo {
                    width: 28px;
                    height: 28px;
                    object-fit: contain;
                    justify-self: center;
                }

                .tpn-label-sheet .label-header-text {
                    text-align: center;
                    font-size: 7px;
                    font-weight: 700;
                    line-height: 1.05;
                }

                .tpn-label-sheet .label-title-band {
                    display: grid;
                    grid-template-columns: 1fr 104px;
                    align-items: stretch;
                    min-height: 16px;
                    border-bottom: 1px solid #000000;
                    margin-bottom: 1px;
                }

                .tpn-label-sheet .label-title-text {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                    font-weight: 700;
                    line-height: 1;
                }

                .tpn-label-sheet .alert-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 16px;
                    font-size: 7px;
                    font-weight: 700;
                    letter-spacing: 0.4px;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                .tpn-label-sheet .patient-row {
                    display: grid;
                    align-items: end;
                    column-gap: 3px;
                    min-height: 15px;
                    font-size: 8px;
                }

                .tpn-label-sheet .patient-row.name-date-row {
                    grid-template-columns: 66px 1fr 34px 82px;
                }

                .tpn-label-sheet .patient-row.hospital-ward-btl-row {
                    grid-template-columns: 66px 1fr 34px 58px 34px 56px;
                }

                .tpn-label-sheet .compound-rows {
                    margin-top: 1px;
                }

                .tpn-label-sheet .label-row {
                    display: grid;
                    grid-template-columns: 76px 1fr 42px 70px 22px;
                    align-items: end;
                    column-gap: 3px;
                    min-height: 15px;
                    font-size: 8px;
                }

                .tpn-label-sheet .label-row.compound {
                    grid-template-columns: 76px 1fr 46px 70px 22px;
                }

                .tpn-label-sheet .label-row.compound.rate {
                    grid-template-columns: 76px 1fr 38px 70px 18px;
                }

                .tpn-label-sheet .footer-row {
                    display: grid;
                    grid-template-columns: 66px 70px 58px 1fr 22px;
                    align-items: end;
                    min-height: 23px;
                    column-gap: 3px;
                    margin-top: 2px;
                    font-size: 7px;
                }

                .tpn-label-sheet .footer-label {
                    font-weight: 700;
                    white-space: nowrap;
                }

                .tpn-label-sheet .lipid-label {
                    font-weight: 700;
                    white-space: nowrap;
                    align-self: center;
                    padding-top: 14px;
                    padding-left: 4px;
                }

                .tpn-label-sheet .prepared-row {
                    display: grid;
                    grid-template-columns: 1fr 104px;
                    align-items: end;
                    min-height: 40px;
                    column-gap: 3px;
                    margin-top: 10px;
                    font-size: 7px;
                }

                .tpn-label-sheet .prepared-left {
                    display: grid;
                    grid-template-rows: 14px 1fr;
                    min-height: 36px;
                }

                .tpn-label-sheet .value-line {
                    border-bottom: 1px solid #000000;
                    text-align: center;
                    font-weight: 700;
                    min-height: 10px;
                    padding: 0 1px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .tpn-label-sheet .label-cell {
                    font-weight: 700;
                    white-space: nowrap;
                }

                .tpn-label-sheet .unit-cell {
                    text-align: right;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .tpn-label-sheet .prepared-label {
                    font-weight: 700;
                    white-space: nowrap;
                    align-self: start;
                }

                .tpn-label-sheet .prepared-signature {
                    width: 150px;
                    text-align: center;
                    align-self: end;
                }

                .tpn-label-sheet .duty-text {
                    padding-top: 6px;
                    font-size: 7px;
                }

                .tpn-label-sheet .caution-box {
                    border: 2px solid #000000;
                    min-height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    align-self: end;
                    text-align: center;
                    font-size: 7px;
                    line-height: 1.1;
                    margin-top: 8px;
                    transform: translateY(3px);
                }
                
                .tpn-label-sheet .alert-low {
                    background: #16a34a !important;
                    color: #ffffff !important;
                }

                .tpn-label-sheet .alert-medium {
                    background: #fde047 !important;
                    color: #000000 !important;
                }

                .tpn-label-sheet .alert-high {
                    background: #dc2626 !important;
                    color: #ffffff !important;
                }

                .tpn-label-sheet .label-cell {
                    font-weight: 700;
                    white-space: nowrap;
                }

                .tpn-label-sheet .unit-cell {
                    text-align: right;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .tpn-label-sheet .patient-section-divider {
                    border-bottom: 1px solid #000000;
                    height: 2px;
                    margin-bottom: 2px;
                    padding-bottom: 8px;
                }

                @media print {
                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 816px !important;
                        background: #ffffff !important;
                        height: auto !important; 
                        overflow: visible !important;
                    }

                    body > * {
                        display: none !important;
                    }

                    body > .label-print-area {
                        display: block !important;
                        width: 816px !important;
                        margin-top: 40px !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                    }

                    .label-preview-area {
                        display: none !important;
                    }

                    .print-page {
                        visibility: visible !important;
                        width: 816px !important;
                        height: 1056px !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;

                        display: grid !important;
                        grid-template-columns: repeat(2, 357px) !important;
                        gap: 0px 0px !important;
                        align-content: start !important;
                        justify-content: center !important;
                        padding-top: 2px !important;

                        page-break-after: always !important;
                        break-after: page !important;
                    }

                    .print-page:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }

                    .label-copy {
                        width: 357px !important;
                        height: 350px !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    .tpn-label-sheet {
                        width: 380px !important;
                        height: 372px !important;
                        transform: scale(0.94) !important;
                        transform-origin: top left !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                    }

                    .tpn-label-sheet,
                    .tpn-label-sheet * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="emr-content-surface flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between print:hidden">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            TPN Label
                        </h1>
                        <p className="text-sm text-slate-500">
                            Select an order, modify the label, then print the
                            TPN bottle label.
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
                                max={20}
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

                <div className={isBatchMode ? "grid gap-6" : "grid gap-6 xl:grid-cols-[400px_1fr]"}>
                    {!isBatchMode && (
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

                                <div className="grid grid-cols-1 gap-4">
                                    {(
                                        [
                                            ['patientName', 'Name', 'text'],
                                            ['hospitalNumber', 'Hospital No.', 'text'],
                                            ['ward', 'Ward', 'text'],
                                            ['date', 'Date', 'date'], // <--- Changed to 'date'
                                            ['btlNumber', 'BTL #', 'text'],
                                            ['expiresOn', 'Expires On', 'date'], // <--- Changed to 'date'
                                            ['preparedBy', 'Prepared By', 'text'],
                                            ['cautionText', 'Caution', 'text'],
                                        ] as Array<[keyof TpnLabelData, string, string]>
                                    ).map(([field, label, inputType]) => (
                                        <EditableField
                                            key={field}
                                            label={label}
                                            type={inputType} // <--- Pass the type here
                                            value={labelData[field]}
                                            onChange={(value) =>
                                                updateField(field, value)
                                            }
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="label-preview-area flex flex-col items-center gap-8 rounded-lg bg-slate-100 py-8 overflow-y-auto border border-slate-200" style={{ maxHeight: '800px' }}>
                        {printPages.map((page, pageIndex) => (
                            <div
                                key={`preview-page-${pageIndex}`}
                                className="bg-white shadow-sm ring-1 ring-slate-200 flex-shrink-0"
                                style={{
                                    width: '816px',
                                    height: '1248px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 357px)',
                                    alignContent: 'start',
                                    justifyContent: 'center',
                                    paddingTop: '60px',
                                }}
                            >
                                {page.map((labelIndex) => (
                                    <div className="label-copy" key={`preview-${labelIndex}`}>
                                        <TpnPrintableLabel
                                            data={isBatchMode ? batchLabels[Math.floor(labelIndex / printCopies)] : labelData}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {mounted && typeof document !== 'undefined'
                        ? createPortal(
                            <div className="label-print-area">
                                {printPages.map((page, pageIndex) => (
                                    <div className="print-page" key={`page-${pageIndex}`}>
                                        {page.map((labelIndex) => (
                                            <div className="label-copy" key={`print-${labelIndex}`}>
                                                <TpnPrintableLabel
                                                    data={isBatchMode ? batchLabels[Math.floor(labelIndex / printCopies)] : labelData}
                                                />
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

function TpnPrintableLabel({ data }: { data: TpnLabelData }) {
    const alertConfig = {
        low: {
            text: 'LOW ALERT',
            className: 'alert-low',
        },
        medium: {
            text: 'MEDIUM ALERT',
            className: 'alert-medium',
        },
        high: {
            text: 'HIGH ALERT',
            className: 'alert-high',
        },
    } satisfies Record<AlertLevel, { text: string; className: string }>;

    const alert = alertConfig[data.alertLevel];

    const rows = [
        ['Amino Acid', data.aminoAcidDose, 'g', data.aminoAcidVolume, 'mL'],
        ['Dextrose', data.dextrosePercent, '%', data.dextroseVolume, 'mL'],
        ['Sodium', data.sodiumDose, 'meq/day', data.sodiumVolume, 'mL'],
        ['Potassium', data.potassiumDose, 'meq/day', data.potassiumVolume, 'mL'],
        ['Mag Sulfate', data.magnesiumDose, 'meq/day', data.magnesiumVolume, 'mL'],
        ['Ca Gluconate', data.calciumDose, 'meq/day', data.calciumVolume, 'mL'],
        ['Trace Element', data.traceElementDose, 'mL', data.traceElementVolume, 'mL'],
        ['MVS', data.multivitaminsDose, 'mL', data.multivitaminsVolume, 'mL'],
        ['Heparin', data.heparinDose, 'units', data.heparinVolume, 'mL'],
        ['qs ad water', '', 'mL', data.sterileWaterVolume, 'mL'],
    ];

    return (
        <div className="tpn-label-sheet">
            <div className="label-header">
                <img src={bghmcLogoUrl} alt="" className="label-logo" />
                <div className="label-header-text">
                    BATAAN GENERAL HOSPITAL AND MEDICAL CENTER
                    <br /><br />
                    PHARMACY DEPARTMENT
                </div>
                <img src={dohLogoUrl} alt="" className="label-logo" />
            </div>

            <div className="label-title-band">
                <div className="label-title-text">
                    TOTAL PARENTERAL NUTRITION
                </div>
                <div className={`alert-box ${alert.className}`}>
                    {alert.text}
                </div>
            </div>

            <div className="patient-row name-date-row">
                <div className="label-cell">NAME:</div>
                <div className="value-line">{data.patientName}</div>
                <div className="label-cell">DATE:</div>
                <div className="value-line">{formatDateForPrint(data.date)}</div>
            </div>

            <div className="patient-row hospital-ward-btl-row">
                <div className="label-cell">HOSPITAL NO.</div>
                <div className="value-line">{data.hospitalNumber}</div>

                <div className="label-cell">WARD:</div>
                <div className="value-line">{data.ward}</div>

                <div className="label-cell">BTL #:</div>
                <div className="value-line">{data.btlNumber}</div>
            </div>

            <div className="patient-section-divider" />

            <div className="compound-rows">
                {rows.map(([label, dose, unit, volume, volumeUnit]) => (
                    <div className="label-row compound" key={label}>
                        <div>{label}</div>
                        <div className="value-line">{dose}</div>
                        <div className="unit-cell">{unit}</div>
                        <div className="value-line">{volume}</div>
                        <div className="unit-cell">{volumeUnit}</div>
                    </div>
                ))}
            </div>

            <div className="label-row compound">
                <div>To make</div>
                <div className="value-line" style={{ gridColumn: '2 / 5' }}>
                    {data.totalVolume}
                </div>
                <div className="unit-cell">mL</div>
            </div>

            <div className="label-row compound rate">
                <div>Rate:</div>
                <div className="value-line">{data.rate}</div>
                <div className="unit-cell">mL/hr</div>
                <div className="value-line">{data.duration}</div>
                <div className="unit-cell">hr</div>
            </div>

            <div className="footer-row">
                <div className="footer-label">EXPIRES ON</div>
                <div className="value-line">{formatDateForPrint(data.expiresOn)}</div>

                <div className="lipid-label">{data.lipidText}</div>
                <div className="value-line"></div>
                <div className="unit-cell">mL</div>
            </div>

            <div className="prepared-row">
                <div className="prepared-left">
                    <div className="prepared-label">Prepared By:</div>

                    <div className="prepared-signature">
                        <div className="value-line">{data.preparedBy}</div>
                        <div className="duty-text">{data.dutyText}</div>
                    </div>
                </div>

                <div className="caution-box">
                    {data.cautionText}
                </div>
            </div>
        </div>
    );
}

TpnLabelsPage.layout = {
    breadcrumbs: [
        {
            title: 'Labels',
            href: '/labels/tpn',
        },
        {
            title: 'TPN Label',
            href: '/labels/tpn',
        },
    ],
};
