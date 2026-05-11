import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
    calculateDextroseVolumeMl,
    calculatePerKgPerDay,
    calculateProteinVolumeMl,
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
    potassiumDose: string;
    magnesiumDose: string;
    calciumDose: string;
    traceElementDose: string;
    multivitaminsDose: string;
    heparinDose: string;
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
    return new Date().toLocaleDateString('en-US');
}

function tomorrow() {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    return date.toLocaleDateString('en-US');
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

    return {
        alertLevel: 'high',
        patientName: order ? getPatientName(order) || '-' : '-',
        hospitalNumber: order?.hospital_number || '',
        ward: [order?.ward, order?.room].filter(Boolean).join(' / '),
        date: today(),
        btlNumber: '',
        aminoAcidDose: aminoAcidGrams || '-',
        aminoAcidVolume: calculateProteinVolumeMl(aminoAcidGrams) || '-',
        dextrosePercent: order?.dextrose_percent || '-',
        dextroseVolume:
            calculateDextroseVolumeMl(
                order?.total_fluid_ml ?? '',
                order?.dextrose_percent ?? '',
            ) || '-',
        sodiumDose: order?.sodium_meq_kg_day || '-',
        potassiumDose: order?.potassium_meq_kg_day || '-',
        magnesiumDose: order?.magnesium_meq_kg_day || '-',
        calciumDose: order?.calcium_mg_kg_day || '-',
        traceElementDose: order?.trace_elements_ml_kg_day || '-',
        multivitaminsDose: order?.multivitamins_ml_day || '-',
        heparinDose:
            order?.heparin_ml || order?.heparin_iu_per_ml
                ? `${order.heparin_ml || '-'} mL x ${order.heparin_iu_per_ml || '-'} IU/mL`
                : '-',
        sterileWaterVolume: order?.sterile_water_level_ml_day || '-',
        totalVolume: order?.total_fluid_ml || '-',
        rate:
            order?.total_fluid_ml && order?.duration_hours
                ? (
                    Number(order.total_fluid_ml) /
                    Number(order.duration_hours)
                ).toFixed(1)
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
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input
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

    const [printCopies, setPrintCopies] = useState(1);
    const previewCopies = Math.min(printCopies, 4);

    const labelsPerPrintPage = 6;

    const printPages = Array.from(
        { length: Math.ceil(printCopies / labelsPerPrintPage) },
        (_, pageIndex) => {
            const start = pageIndex * labelsPerPrintPage;
            const count = Math.min(labelsPerPrintPage, printCopies - start);

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
                    size: 8.5in 14in portrait;
                    margin: 0;
                }

                .label-preview-area {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: flex-start;
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
                    display: grid;
                    grid-template-columns: 34px 1fr 34px;
                    align-items: center;
                    gap: 2px;
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
                        background: #ffffff !important;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    .label-preview-area,
                    .label-preview-area * {
                        visibility: hidden !important;
                        display: none !important;
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
                        background: #ffffff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                    }

                    .print-page {
                        width: 100% !important;
                        box-sizing: border-box !important;

                        padding-top: 24px !important;
                        padding-left: 24px !important;
                        padding-right: 0 !important;
                        padding-bottom: 0 !important;

                        display: grid !important;
                        grid-template-columns: 380px 380px !important;
                        grid-auto-rows: 372px !important;
                        column-gap: 6px !important;
                        row-gap: 6px !important;
                        justify-content: start !important;
                        align-items: start !important;

                        page-break-after: always !important;
                        break-after: page !important;
                    }

                    .print-page:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }

                    .label-copy {
                        width: 380px !important;
                        height: 372px !important;
                        box-sizing: border-box !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    .tpn-label-sheet {
                        width: 380px !important;
                        height: 372px !important;
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
                                className="h-9 w-24"
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

                <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
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
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select alert level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">
                                            Low Alert
                                        </SelectItem>
                                        <SelectItem value="medium">
                                            Medium Alert
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High Alert
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {(
                                    [
                                        ['patientName', 'Name'],
                                        ['hospitalNumber', 'Hospital No.'],
                                        ['ward', 'Ward'],
                                        ['date', 'Date'],
                                        ['btlNumber', 'BTL #'],
                                        ['expiresOn', 'Expires On'],
                                        ['preparedBy', 'Prepared By'],
                                        ['cautionText', 'Caution'],
                                    ] as Array<[keyof TpnLabelData, string]>
                                ).map(([field, label]) => (
                                    <EditableField
                                        key={field}
                                        label={label}
                                        value={labelData[field]}
                                        onChange={(value) =>
                                            updateField(field, value)
                                        }
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="label-preview-area">
                        {Array.from({ length: previewCopies }).map((_, index) => (
                            <div className="label-copy" key={`preview-${index}`}>
                                <TpnPrintableLabel data={labelData} />
                            </div>
                        ))}
                    </div>

                    <div className="label-print-area">
                        {printPages.map((pageLabels, pageIndex) => (
                            <div className="print-page" key={`print-page-${pageIndex}`}>
                                {pageLabels.map((labelNumber) => (
                                    <div className="label-copy" key={`print-${labelNumber}`}>
                                        <TpnPrintableLabel data={labelData} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
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
        ['Sodium', data.sodiumDose, 'meq/day', '-', 'mL'],
        ['Potassium', data.potassiumDose, 'meq/day', '-', 'mL'],
        ['Mag Sulfate', data.magnesiumDose, 'meq/day', '-', 'mL'],
        ['Ca Gluconate', data.calciumDose, 'meq/day', '-', 'mL'],
        ['Trace Element', data.traceElementDose, 'mL', '', 'mL'],
        ['MVS', data.multivitaminsDose, 'mL', '', 'mL'],
        ['Heparin', data.heparinDose, 'units', '', 'mL'],
        ['qs ad water', data.sterileWaterVolume, 'mL', '', 'mL'],
    ];

    return (
        <div className="tpn-label-sheet">
            <div className="label-header">
                <img src={dohLogoUrl} alt="" className="label-logo" />
                <div className="label-header-text">
                    BATAAN GENERAL HOSPITAL AND MEDICAL CENTER
                    <br /><br />
                    PHARMACY DEPARTMENT
                </div>
                <img src={bghmcLogoUrl} alt="" className="label-logo" />
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
                <div className="value-line">{data.date}</div>
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
                <div className="value-line">{data.expiresOn}</div>

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
