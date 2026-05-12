import dohLogoUrl from '../../../images/DOH Logo.png';
import bghmcLogoUrl from '../../../images/BGHMC logo hi-res.png';
import {
    calculateAge,
    calculateBmi,
    calculateCalciumContentPerDay,
    calculateCalciumVolumeMl,
    calculateDextroseCalories,
    calculateDextroseGramsPerDay,
    calculateDextroseVolumeMl,
    calculateGir,
    calculateInfusionRate,
    calculateLipidBottleVolumeMl,
    calculateLipidCalories,
    calculateLipidVolumeMl,
    calculateMagnesiumVolumeMl,
    calculatePerKgPerDay,
    calculatePhosphorusVolumeMl,
    calculatePotassiumVolumeMl,
    calculateProteinCalories,
    calculateProteinVolumeMl,
    calculateQsVolumeMl,
    calculateRateMlPerHour,
    calculateSodiumVolumeMl,
    calculateTotalNonProteinCaloriesPerKgDay,
    getPatientName,
    resolveWeightForComputation,
    type TpnOrder,
} from '@/types/orders';

type OrderExportSheetProps = {
    order: TpnOrder;
    standalone?: boolean;
};

function value(value?: string | number | boolean | null) {
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    if (value === null || value === undefined || value === '') {
        return '';
    }

    return String(value);
}

function formatContentDisplay(value: string | number | null | undefined): string {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return '';
    }

    return numericValue.toFixed(1);
}

function formatQsCalculationValue(value: string | number | null | undefined): string {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return '';
    }

    return numericValue.toFixed(1);
}

function splitOrderDateTime(orderDate?: string) {
    if (!orderDate) {
        return {
            date: '',
            time: '',
        };
    }

    const separatorIndex = orderDate.lastIndexOf(',');

    if (separatorIndex === -1) {
        return {
            date: orderDate,
            time: '',
        };
    }

    return {
        date: orderDate.slice(0, separatorIndex).trim(),
        time: orderDate.slice(separatorIndex + 1).trim(),
    };
}

function UnderlineValue({
    children,
    className = '',
    style,
}: {
    children?: string | number | boolean | null;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <span className={`tpn-form-underline ${className}`} style={style}>
            {value(children) || '\u00a0'}
        </span>
    );
}

function NameBox({
    value,
    caption,
    style,
}: {
    value?: string | number | boolean | null;
    caption: string;
    style?: React.CSSProperties;
}) {
    return (
        <span className="tpn-form-name-box" style={style}>
            <strong>{value ? String(value) : '\u00a0'}</strong>
            <small>{caption}</small>
        </span>
    );
}

function PdfCheck({ label, checked }: { label?: string; checked: boolean }) {
    return (
        <span className="tpn-pdf-check">
            <span className="tpn-pdf-check-circle">
                {checked ? '✓' : '\u00a0'}
            </span>
            {label && <span>{label}</span>}
        </span>
    );
}

function BoxCheck({ checked }: { checked: boolean }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                width: '12px',
                height: '12px',
                border: '1px solid #000',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                marginRight: '6px',
                verticalAlign: 'middle',
            }}
        >
            {checked ? '✓' : '\u00a0'}
        </span>
    );
}

function CircleCheck({ label, checked }: { label: string; checked: boolean }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: '16px',
            }}
        >
            <span
                style={{
                    display: 'inline-flex',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '1px solid #000',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    marginRight: '4px',
                }}
            >
                {checked ? '✓' : '\u00a0'}
            </span>
            {label}
        </span>
    );
}

function BlankLine({
    width = '40px',
    text,
}: {
    width?: string;
    text?: string | number | null;
}) {
    return (
        <span
            style={{
                display: 'inline-block',
                width,
                borderBottom: '1px solid #000',
                textAlign: 'center',
                lineHeight: '1',
                minHeight: '12px',
                padding: '0 2px',
            }}
        >
            {text !== undefined && text !== null && text !== ''
                ? String(text)
                : '\u00a0'}
        </span>
    );
}

export function OrderExportSheet({
    order,
    standalone = false,
}: OrderExportSheetProps) {
    const age = calculateAge(order.date_of_birth);
    const weightForComputation = resolveWeightForComputation(
        order.birth_weight_kg,
        order.current_weight_kg,
    );
    const infusionRate = calculateInfusionRate(
        order.total_fluid_ml,
        order.duration_hours,
    );

    const proteinGramsPerDay = calculatePerKgPerDay(
        order.protein_g_per_kg_day,
        weightForComputation,
    );
    const proteinVolumeMl = calculateProteinVolumeMl(proteinGramsPerDay);

    const dextroseGramsPerDay = calculateDextroseGramsPerDay(
        order.total_fluid_ml,
        order.dextrose_percent,
    );
    const dextroseVolumeMl = calculateDextroseVolumeMl(
        order.total_fluid_ml,
        order.dextrose_percent,
    );
    const dextroseCalories = calculateDextroseCalories(dextroseGramsPerDay);
    const gir = calculateGir(
        dextroseGramsPerDay,
        weightForComputation,
        order.duration_hours,
    );

    const lipidGramsPerDay = calculatePerKgPerDay(
        order.lipid_g_per_kg_day,
        weightForComputation,
    );
    const lipidVolumeMl = calculateLipidVolumeMl(
        lipidGramsPerDay,
        order.lipid_concentration,
    );
    const lipidRateMlPerHour = calculateRateMlPerHour(
        lipidVolumeMl,
        order.lipid_duration_hours,
    );
    const lipidCalories = calculateLipidCalories(lipidGramsPerDay);

    const sodiumMeqPerDay = calculatePerKgPerDay(
        order.sodium_meq_kg_day,
        weightForComputation,
    );
    const potassiumMeqPerDay = calculatePerKgPerDay(
        order.potassium_meq_kg_day,
        weightForComputation,
    );
    const calciumMeqPerDay = calculateCalciumContentPerDay(
        order.calcium_mg_kg_day,
        weightForComputation,
    );
    const magnesiumMeqPerDay = calculatePerKgPerDay(
        order.magnesium_meq_kg_day,
        weightForComputation,
    );
    const phosphorusMmolPerDay = calculatePerKgPerDay(
        order.phosphorus_mmol_kg_day,
        weightForComputation,
    );

    const sodiumVolumeMl = calculateSodiumVolumeMl(sodiumMeqPerDay);
    const potassiumVolumeMl = calculatePotassiumVolumeMl(potassiumMeqPerDay);
    const calciumVolumeMl = calculateCalciumVolumeMl(calciumMeqPerDay);
    const magnesiumVolumeMl = calculateMagnesiumVolumeMl(magnesiumMeqPerDay);
    const phosphorusVolumeMl =
        calculatePhosphorusVolumeMl(phosphorusMmolPerDay);

    const traceElementsVolumeMl = order.trace_elements_ml_kg_day || '';
    const multivitaminsVolumeMl = order.multivitamins_ml_day || '';
    const heparinVolumeMl = (order as any).heparin_ml || '';

    const lipidVolumeForQs = order.lipid_piggyback ? lipidVolumeMl : '';

    const qsVolumeMl = calculateQsVolumeMl(
        formatQsCalculationValue(order.total_fluid_ml),
        [
            formatQsCalculationValue(proteinVolumeMl),
            formatQsCalculationValue(dextroseVolumeMl),
            formatQsCalculationValue(lipidVolumeForQs),
            formatQsCalculationValue(sodiumVolumeMl),
            formatQsCalculationValue(potassiumVolumeMl),
            formatQsCalculationValue(calciumVolumeMl),
            formatQsCalculationValue(magnesiumVolumeMl),
            formatQsCalculationValue(phosphorusVolumeMl),
            formatQsCalculationValue(traceElementsVolumeMl),
            formatQsCalculationValue(multivitaminsVolumeMl),
            formatQsCalculationValue(heparinVolumeMl),
        ],
    );

    const totalNonProteinCaloriesPerKgDay =
        calculateTotalNonProteinCaloriesPerKgDay(
            dextroseCalories,
            lipidCalories,
            weightForComputation,
        );

    const heparinMl = (order as any).heparin_ml || '';
    const heparinIuPerMl = (order as any).heparin_iu_per_ml || '';
    const heparinTotal =
        heparinMl && heparinIuPerMl
            ? Number(heparinMl) * Number(heparinIuPerMl)
            : '';

    const orderDateTime = splitOrderDateTime(order.order_date);

    // Compute Osmolarity for the printout using the existing variables from above!
    const osmolarityValue = value((order as any).osmolarity_computed_mosm_l);

    const osmolarityDisplay = osmolarityValue
        ? `${osmolarityValue} mOsm/L`
        : '';

    const isPeripheralOsmolarityHigh =
        order.route === 'Peripheral Line' &&
        Number(osmolarityValue) >= 900;

    return (
        <section
            id="tpn-export-sheet"
            className={
                standalone
                    ? 'tpn-export-sheet tpn-export-standalone'
                    : 'tpn-export-sheet'
            }
        >
            <style>{`
                .tpn-export-sheet {
                    display: none;
                    width: 100%;
                    max-width: 210mm;
                    margin: 0 auto;
                    background: #fff;
                    color: #000;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 10px;
                    line-height: 1.2;
                }

                .tpn-export-sheet.tpn-export-standalone {
                    display: block;
                }

                .tpn-export-page {
                    position: relative;
                    width: 100%;
                    min-height: 297mm;
                    box-sizing: border-box;
                    padding: 8mm; 
                    padding-bottom: 25mm;
                }

                .tpn-export-footer-container {
                    position: absolute;
                    bottom: 10mm;
                    left: 8mm;
                    right: 8mm;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    font-size: 9px;
                }

                .tpn-export-header {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 30px;
                    text-align: center;
                }

                .tpn-export-header-top {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 60px;
                    text-align: center;
                }

                .tpn-export-logo {
                    width: 55px;
                    height: 55px;
                    object-fit: contain;
                    flex-shrink: 0;
                }

                .tpn-header-center {
                    flex: 1;
                    padding: 0 10px;
                }

                .tpn-export-hospital {
                    font-family: "Times New Roman", Times, serif;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                    text-transform: uppercase;
                }

                .tpn-export-subtitle {
                    font-family: "Times New Roman", Times, serif;
                    font-size: 10px;
                    margin-top: 3px;
                }

                .tpn-export-form-title {
                    margin-top: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                    text-align: center;
                }

                .tpn-patient-info {
                    margin-top: 16px;
                    font-size: 10px;
                }

                .tpn-patient-label {
                    font-weight: bold;
                    white-space: nowrap;
                }

                .tpn-form-underline {
                    display: inline-block;
                    border-bottom: 1px solid #000;
                    text-align: center;
                    padding: 0 4px;
                    line-height: 1.1;
                    vertical-align: bottom;
                    min-height: 12px;
                }
                .tpn-form-underline.fluid { flex: 1; min-width: 0; }
                .tpn-form-underline.medium { width: 80px; }

                .tpn-form-name-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .tpn-form-name-box strong {
                    width: 100%;
                    border-bottom: 1px solid #000;
                    text-align: center;
                    line-height: 1;
                    vertical-align: bottom;
                    min-height: 12px;
                }

                .tpn-form-name-box small {
                    font-size: 8px;
                    margin-top: 2px;
                    color: #333;
                }

                .tpn-pdf-check {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    cursor: default;
                }
                .tpn-pdf-check-circle {
                    display: inline-flex;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 1px solid #000;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                }

                .tpn-comp-table {
                    width: 100%;
                    table-layout: fixed; 
                    border-collapse: collapse;
                    margin-top: 10px;
                    border: 2px solid #000;
                    margin-bottom: 0;
                }
                .tpn-comp-table th, .tpn-comp-table td {
                    border: 1px solid #000;
                    padding: 6px 8px;
                    vertical-align: top;
                }
                .tpn-comp-table th {
                    background-color: #fff;
                    text-align: center;
                    font-weight: bold;
                    padding: 8px;
                }

                .tpn-comp-title-row {
                    font-weight: bold;
                    padding: 6px 4px !important;
                }
                
                .tpn-col-comp { width: 55%; }
                .tpn-col-content { width: 22%; text-align: center; }
                .tpn-col-vol { width: 23%; text-align: center; }

                .tpn-export-footer {
                    margin-top: 20px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 9px;
                }
                
                @page {
                    size: A4 portrait;
                    margin: 0;
                }

                @media print {
                    html,
                    body {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        background: #fff !important;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    #tpn-export-sheet,
                    #tpn-export-sheet * {
                        visibility: visible !important;
                    }

                    #tpn-export-sheet {
                        display: block !important;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        z-index: 999999 !important;
                    }

                    #tpn-export-sheet .tpn-export-page {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        box-sizing: border-box !important;
                        padding: 8mm 10mm 10mm !important;
                        margin: 0 !important;
                    }
                }
            `}</style>

            <div className="tpn-export-page">
                <header>
                    <div className="tpn-export-header-top">
                        <img
                            src={dohLogoUrl}
                            alt="Logo"
                            className="tpn-export-logo"
                        />

                        <div>
                            <div className="tpn-export-hospital">
                                Bataan General Hospital and Medical Center
                            </div>
                            <div className="tpn-export-subtitle">
                                City of Balanga, Bataan
                            </div>
                            <div className="tpn-export-subtitle">
                                ISO-QMS 9001:2015 Certified
                            </div>
                        </div>

                        <img
                            src={bghmcLogoUrl}
                            alt="Logo"
                            className="tpn-export-logo"
                        />
                    </div>

                    <div className="tpn-export-form-title">
                        Parenteral Nutrition Order Form
                    </div>
                </header>

                <div className="tpn-patient-info">
                    {/* Patient Header Details */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '14px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flex: 1,
                                alignItems: 'flex-start',
                                marginRight: '30px',
                            }}
                        >
                            <span
                                className="tpn-patient-label"
                                style={{
                                    paddingBottom: '12px',
                                    marginRight: '10px',
                                }}
                            >
                                Patient's Name:
                            </span>
                            <div style={{ display: 'flex', flex: 1, gap: '0' }}>
                                <NameBox
                                    style={{ flex: 2 }}
                                    value={order.last_name}
                                    caption="Surname"
                                />
                                <NameBox
                                    style={{ flex: 2 }}
                                    value={order.first_name}
                                    caption="First Name"
                                />
                                <NameBox
                                    style={{ flex: 1 }}
                                    value={order.middle_name}
                                    caption="Middle Initial"
                                />
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                width: '220px',
                                paddingBottom: '12px',
                            }}
                        >
                            <span
                                className="tpn-patient-label"
                                style={{ marginRight: '10px' }}
                            >
                                Admission ID:
                            </span>
                            <UnderlineValue
                                className="fluid"
                                style={{ fontWeight: 'bold' }}
                            >
                                {order.order_no}
                            </UnderlineValue>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '10px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flex: 1,
                                alignItems: 'flex-end',
                                gap: '15px',
                                marginRight: '30px',
                            }}
                        >
                            <span className="tpn-patient-label">
                                Date of Birth:
                            </span>
                            <UnderlineValue style={{ flex: 1 }}>
                                {order.date_of_birth}
                            </UnderlineValue>
                            <span className="tpn-patient-label">Age:</span>
                            <UnderlineValue style={{ width: '140px' }}>
                                {age}
                            </UnderlineValue>
                            <span className="tpn-patient-label">Sex:</span>
                            <UnderlineValue style={{ width: '60px' }}>
                                {order.sex}
                            </UnderlineValue>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                width: '220px',
                            }}
                        >
                            <span
                                className="tpn-patient-label"
                                style={{ marginRight: '10px' }}
                            >
                                Ward:
                            </span>
                            <UnderlineValue className="fluid">
                                {order.ward}
                            </UnderlineValue>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '20px',
                            marginBottom: '8px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flex: 1,
                                alignItems: 'flex-end',
                            }}
                        >
                            <span
                                className="tpn-patient-label"
                                style={{ marginRight: '10px' }}
                            >
                                Date Ordered:
                            </span>
                            <UnderlineValue className="fluid">
                                {orderDateTime.date}
                            </UnderlineValue>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flex: 1,
                                alignItems: 'flex-end',
                            }}
                        >
                            <span
                                className="tpn-patient-label"
                                style={{ marginRight: '10px' }}
                            >
                                Time Ordered:
                            </span>
                            <UnderlineValue className="fluid">
                                {orderDateTime.time}
                            </UnderlineValue>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            marginBottom: '8px',
                        }}
                    >
                        <span
                            className="tpn-patient-label"
                            style={{ marginRight: '10px' }}
                        >
                            Diagnosis:
                        </span>
                        <UnderlineValue className="fluid">
                            {order.diagnosis}
                        </UnderlineValue>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                        }}
                    >
                        <span
                            className="tpn-patient-label"
                            style={{ marginRight: '10px' }}
                        >
                            Is this the initial order?
                        </span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <PdfCheck
                                label="Yes"
                                checked={order.is_initial_order === true}
                            />
                            <PdfCheck
                                label="No"
                                checked={order.is_initial_order !== true}
                            />
                        </div>
                        <span
                            style={{
                                marginLeft: '10px',
                                fontStyle: 'italic',
                                fontSize: '9px',
                            }}
                        >
                            If Yes, must be approved by Neonatologist
                        </span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            marginBottom: '4px',
                        }}
                    >
                        <span
                            className="tpn-patient-label"
                            style={{ marginRight: '10px' }}
                        >
                            Birth Weight:
                        </span>
                        <UnderlineValue className="medium">
                            {order.birth_weight_kg}
                        </UnderlineValue>{' '}
                        <span style={{ marginLeft: '4px' }}>kg</span>
                        <span
                            className="tpn-patient-label"
                            style={{ marginLeft: '25px', marginRight: '10px' }}
                        >
                            Current Weight:
                        </span>
                        <UnderlineValue className="medium">
                            {order.current_weight_kg}
                        </UnderlineValue>{' '}
                        <span style={{ marginLeft: '4px' }}>kg</span>
                    </div>
                    <div
                        style={{
                            fontSize: '8px',
                            fontStyle: 'italic',
                            marginLeft: '75px',
                            marginBottom: '8px',
                        }}
                    >
                        Use Current Weight in computation if Current Weight is
                        more than the Birth Weight
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                        }}
                    >
                        <span
                            className="tpn-patient-label"
                            style={{ marginRight: '10px' }}
                        >
                            TPN Line:
                        </span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <PdfCheck
                                label="Peripheral"
                                checked={order.route === 'Peripheral Line'}
                            />
                            <PdfCheck
                                label="Central"
                                checked={order.route === 'Central Line'}
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            marginBottom: '8px',
                        }}
                    >
                        <span
                            className="tpn-patient-label"
                            style={{ marginRight: '10px' }}
                        >
                            Total Fluid Req:
                        </span>
                        <UnderlineValue className="medium">
                            {order.total_fluid_ml}
                        </UnderlineValue>{' '}
                        <span style={{ marginLeft: '4px' }}>mL</span>
                        <span
                            className="tpn-patient-label"
                            style={{ marginLeft: '25px', marginRight: '10px' }}
                        >
                            Rate:
                        </span>
                        <UnderlineValue className="medium">
                            {infusionRate}
                        </UnderlineValue>{' '}
                        <span style={{ marginLeft: '4px' }}>
                            mL/hr. to run over 24 hrs
                        </span>
                    </div>
                    
                </div>

                <div style={{ marginTop: '14px', fontWeight: 'bold' }}>
                    CONTENTS:{' '}
                    <span
                        style={{
                            fontSize: '9px',
                            fontWeight: 'normal',
                            fontStyle: 'italic',
                        }}
                    >
                        (Please see recommendations for initiation of Parenteral
                        Nutrition at the back)
                    </span>
                </div>

                <table className="tpn-comp-table">
                    <thead>
                        <tr>
                            <th className="tpn-col-comp">COMPUTATIONS</th>
                            <th className="tpn-col-content">CONTENTS</th>
                            <th className="tpn-col-vol">VOLUME (x1.5mL)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Protein Section */}
                        <tr>
                            <td className="tpn-col-comp">
                                <div
                                    style={{
                                        fontWeight: 'bold',
                                        marginBottom: '2px',
                                    }}
                                >
                                    Protein
                                </div>
                                <div style={{ paddingLeft: '16px' }}>
                                    <BlankLine
                                        width="35px"
                                        text={order.protein_g_per_kg_day}
                                    />{' '}
                                    g/kg/day{' '}
                                    <span style={{ fontSize: '14px' }}>X</span>{' '}
                                    <BlankLine
                                        width="35px"
                                        text={formatContentDisplay(weightForComputation)}
                                    />{' '}
                                    kg
                                </div>
                            </td>
                            <td
                                className="tpn-col-content"
                                style={{
                                    verticalAlign: 'bottom',
                                    paddingBottom: '16px',
                                }}
                            >
                                <BlankLine
                                    width="45px"
                                    text={formatContentDisplay(proteinGramsPerDay)}
                                />{' '}
                                g/day
                            </td>
                            <td
                                className="tpn-col-vol"
                                style={{
                                    verticalAlign: 'bottom',
                                    paddingBottom: '16px',
                                }}
                            >
                                <BlankLine
                                    width="45px"
                                    text={formatContentDisplay(proteinVolumeMl)}
                                />{' '}
                                mL
                            </td>
                        </tr>

                        {/* Carbohydrates Section */}
                        <tr>
                            <td className="tpn-col-comp">
                                <div
                                    style={{
                                        fontWeight: 'bold',
                                        marginBottom: '2px',
                                    }}
                                >
                                    Carbohydrates
                                </div>
                                <div style={{ paddingLeft: '16px' }}>
                                    Glucose Infusion Rate (GIR):{' '}
                                    <BlankLine width="35px" text={formatContentDisplay(gir)} />{' '}
                                    mg/kg/min
                                </div>
                                <div
                                    style={{
                                        paddingLeft: '16px',
                                        marginTop: '10px',
                                    }}
                                >
                                    <BlankLine
                                        width="30px"
                                        text={order.dextrose_percent}
                                    />{' '}
                                    % /{' '}
                                    <BlankLine
                                        width="35px"
                                        text={formatContentDisplay(dextroseGramsPerDay)}
                                    />{' '}
                                    g/day
                                </div>
                            </td>
                            <td
                                className="tpn-col-content"
                                style={{
                                    verticalAlign: 'bottom',
                                    paddingBottom: '16px',
                                }}
                            >
                                <BlankLine
                                    width="45px"
                                    text={dextroseGramsPerDay}
                                />{' '}
                                g/day
                            </td>
                            <td
                                className="tpn-col-vol"
                                style={{
                                    verticalAlign: 'bottom',
                                    paddingBottom: '16px',
                                }}
                            >
                                <BlankLine
                                    width="45px"
                                    text={formatContentDisplay(dextroseVolumeMl)}
                                />{' '}
                                mL
                            </td>
                        </tr>

                        {/* Fat Section */}
                        <tr>
                            <td className="tpn-col-comp">
                                <div
                                    style={{
                                        fontWeight: 'bold',
                                        marginBottom: '2px',
                                    }}
                                >
                                    Fat
                                </div>
                                <div style={{ paddingLeft: '16px' }}>
                                    <BlankLine
                                        width="35px"
                                        text={order.lipid_g_per_kg_day}
                                    />{' '}
                                    g/kg/day{' '}
                                    <span
                                        style={{
                                            fontSize: '14px',
                                            margin: '0 4px',
                                        }}
                                    >
                                        X
                                    </span>{' '}
                                    <BlankLine
                                        width="35px"
                                        text={formatContentDisplay(weightForComputation)}
                                    />{' '}
                                    kg{' '}
                                    <strong
                                        style={{
                                            fontSize: '16px',
                                            margin: '0 4px',
                                        }}
                                    >
                                        =
                                    </strong>{' '}
                                    <BlankLine
                                        width="35px"
                                        text={formatContentDisplay(lipidGramsPerDay)}
                                    />{' '}
                                    g/day
                                </div>
                                <div
                                    style={{
                                        paddingLeft: '16px',
                                        marginTop: '6px',
                                    }}
                                >
                                    <CircleCheck
                                        checked={
                                            order.lipid_concentration === '20'
                                        }
                                        label="20%"
                                    />
                                    <CircleCheck
                                        checked={
                                            order.lipid_concentration === '10'
                                        }
                                        label="10%"
                                    />
                                </div>
                                <div
                                    style={{
                                        paddingLeft: '32px',
                                        marginTop: '6px',
                                    }}
                                >
                                    Infuse{' '}
                                    <BlankLine
                                        width="35px"
                                        text={formatContentDisplay(lipidVolumeMl)}
                                    />{' '}
                                    mL of emulsion at{' '}
                                    <BlankLine
                                        width="35px"
                                        text={formatContentDisplay(lipidRateMlPerHour)}
                                    />{' '}
                                    mL/hr over{' '}
                                    <BlankLine
                                        width="25px"
                                        text={
                                            order.lipid_duration_hours || '24'
                                        }
                                    />{' '}
                                    hrs
                                </div>
                                <div
                                    style={{
                                        paddingLeft: '16px',
                                        marginTop: '6px',
                                    }}
                                >
                                    As{' '}
                                    <CircleCheck
                                        checked={order.lipid_piggyback === true}
                                        label="Piggyback into PN solution"
                                    />
                                </div>
                                <div
                                    style={{
                                        paddingLeft: '16px',
                                        marginTop: '2px',
                                        marginBottom: '4px',
                                    }}
                                >
                                    As{' '}
                                    <CircleCheck
                                        checked={
                                            order.lipid_piggyback === false
                                        }
                                        label="Separate IV line"
                                    />
                                </div>
                            </td>
                            <td
                                className="tpn-col-content"
                                style={{
                                    verticalAlign: 'bottom',
                                    paddingBottom: '36px',
                                }}
                            >
                                <BlankLine width="35px" text={lipidVolumeMl} />{' '}
                                mL /{' '}
                                <BlankLine
                                    width="25px"
                                    text={order.lipid_duration_hours || '24'}
                                />{' '}
                                hrs
                            </td>
                            <td
                                className="tpn-col-vol"
                                style={{
                                    verticalAlign: 'bottom',
                                    paddingBottom: '36px',
                                }}
                            >
                                <BlankLine width="45px" text={lipidVolumeMl} />{' '}
                                mL
                            </td>
                        </tr>

                        {/* Electrolytes Section */}
                        <tr>
                            <td
                                className="tpn-col-comp"
                                style={{
                                    borderBottom: 'none',
                                    paddingBottom: '2px',
                                    paddingTop: '8px',
                                }}
                            >
                                <div style={{ fontWeight: 'bold' }}>
                                    Electrolytes
                                </div>
                            </td>
                            <td
                                className="tpn-col-content"
                                style={{ borderBottom: 'none' }}
                            ></td>
                            <td
                                className="tpn-col-vol"
                                style={{ borderBottom: 'none' }}
                            ></td>
                        </tr>
                        {[
                            {
                                label: 'Sodium',
                                formula: 'meqs/kg/day',
                                unit: 'meqs/day',
                                val: sodiumMeqPerDay,
                                req: order.sodium_meq_kg_day,
                                vol: sodiumVolumeMl,
                            },
                            {
                                label: 'Potassium',
                                formula: 'meqs/kg/day',
                                unit: 'meqs/day',
                                val: potassiumMeqPerDay,
                                req: order.potassium_meq_kg_day,
                                vol: potassiumVolumeMl,
                            },
                            {
                                label: 'Calcium',
                                formula: 'mg/kg/day ',
                                unit: 'mg/day',
                                val: calciumMeqPerDay,
                                req: order.calcium_mg_kg_day,
                                vol: calciumVolumeMl,
                            },
                            {
                                label: 'Magnesium',
                                formula: 'meqs/kg/day',
                                unit: 'meqs/day',
                                val: magnesiumMeqPerDay,
                                req: order.magnesium_meq_kg_day,
                                vol: magnesiumVolumeMl,
                            },
                            {
                                label: 'Phosphorus',
                                formula: 'mmol/kg/day',
                                unit: 'mmol/day',
                                val: phosphorusMmolPerDay,
                                req: order.phosphorus_mmol_kg_day,
                                vol: phosphorusVolumeMl,
                            },
                        ].map((item, index, array) => {
                            const isLast = index === array.length - 1;
                            const cellStyle = {
                                borderTop: 'none',
                                borderBottom: isLast
                                    ? '1px solid #000'
                                    : 'none',
                                paddingTop: '2px',
                                paddingBottom: isLast ? '8px' : '2px',
                            };

                            return (
                                <tr key={item.label}>
                                    <td
                                        className="tpn-col-comp"
                                        style={{
                                            paddingLeft: '16px',
                                            ...cellStyle,
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                width: '70px',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                        <BlankLine
                                            width="30px"
                                            text={item.req}
                                        />{' '}
                                        {item.formula}{' '}
                                        <span
                                            style={{
                                                fontSize: '14px',
                                                margin: '0 4px',
                                            }}
                                        >
                                            X
                                        </span>{' '}
                                        <BlankLine
                                            width="30px"
                                            text={formatContentDisplay(weightForComputation)}
                                        />{' '}
                                        kg
                                    </td>
                                    <td
                                        className="tpn-col-content"
                                        style={cellStyle}
                                    >
                                        <BlankLine
                                            width="45px"
                                            text={formatContentDisplay(item.val)}
                                        />{' '}
                                        {item.unit}
                                    </td>
                                    <td
                                        className="tpn-col-vol"
                                        style={cellStyle}
                                    >
                                        <BlankLine
                                            width="45px"
                                            text={formatContentDisplay(item.vol)}
                                        />{' '}
                                        mL/day
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Additives Header */}
                        <tr>
                            <td
                                className="tpn-col-comp"
                                style={{
                                    borderBottom: 'none',
                                    paddingBottom: '2px',
                                    paddingTop: '8px',
                                }}
                            >
                                <div style={{ fontWeight: 'bold' }}>
                                    Additives
                                </div>
                            </td>
                            <td colSpan={2} style={{ borderBottom: 'none' }}></td>
                        </tr>

                        {/* Trace Elements */}
                        <tr>
                            <td className="tpn-col-comp" style={{ paddingLeft: '16px', borderTop: 'none', borderBottom: 'none', paddingTop: '2px', paddingBottom: '2px' }}>
                                <span style={{ display: 'inline-block', width: '90px', fontWeight: 'bold' }}>
                                    Trace Elements
                                </span>
                                <BlankLine width="30px" text={order.trace_elements_ml_kg_day} /> mL/kg/day{' '}
                                <span style={{ fontSize: '14px', margin: '0 4px' }}>X</span>{' '}
                                <BlankLine width="30px" text={formatContentDisplay(weightForComputation)} /> kg
                            </td>
                            <td colSpan={2} style={{ borderTop: 'none', borderBottom: 'none', paddingTop: '2px', paddingBottom: '2px', textAlign: 'center' }}>
                                <BlankLine
                                    width="45px"
                                    text={formatContentDisplay(traceElementsVolumeMl)}
                                />{' '}
                                mL
                            </td>
                        </tr>

                        {/* Multivitamins */}
                        <tr>
                            <td className="tpn-col-comp" style={{ paddingLeft: '16px', borderTop: 'none', borderBottom: 'none', paddingTop: '2px', paddingBottom: '2px' }}>
                                <span style={{ display: 'inline-block', width: '90px', fontWeight: 'bold' }}>
                                    Multivitamins
                                </span>
                                <BlankLine width="30px" text={order.multivitamins_ml_day} /> mL/day
                            </td>
                            <td colSpan={2} style={{ borderTop: 'none', borderBottom: 'none', paddingTop: '2px', paddingBottom: '2px', textAlign: 'center' }}>
                                <BlankLine width="45px" text={formatContentDisplay(multivitaminsVolumeMl)} /> mL
                            </td>
                        </tr>

                        {/* Heparin */}
                        <tr>
                            <td className="tpn-col-comp" style={{ paddingLeft: '16px', borderTop: 'none', borderBottom: '1px solid #000', paddingTop: '2px', paddingBottom: '8px' }}>
                                <span style={{ display: 'inline-block', width: '90px', fontWeight: 'bold' }}>
                                    Heparin
                                </span>
                                <BlankLine width="30px" text={order.heparin_ml} /> mL{' '}
                                <span style={{ fontSize: '14px', margin: '0 4px' }}>X</span>{' '}
                                <BlankLine width="30px" text={order.heparin_iu_per_ml} /> I.U./ml
                            </td>
                            <td colSpan={2} style={{ borderTop: 'none', borderBottom: '1px solid #000', paddingTop: '2px', paddingBottom: '8px', textAlign: 'center' }}>
                                <BlankLine
                                    width="45px"
                                    text={formatContentDisplay(heparinTotal)}
                                /> I.U.
                            </td>
                        </tr>

                        {/* Sterile Water */}
                        <tr>
                            <td
                                className="tpn-col-comp"
                                style={{
                                    textAlign: 'left',
                                    fontWeight: 'bold',
                                    paddingRight: '20px',
                                    paddingTop: '8px',
                                    paddingBottom: '8px'
                                }}
                            >
                                Sterile Water / QS
                            </td>
                            <td colSpan={2} style={{ paddingTop: '8px', paddingBottom: '8px', textAlign: 'center' }}>
                                <BlankLine width="45px" text={formatContentDisplay(qsVolumeMl)} /> mL
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Final Calculations Box */}
                <div
                    style={{
                        border: '2px solid #000',
                        borderTop: 'none',
                        padding: '10px 8px',
                    }}
                >
                    <div
                        style={{
                            fontWeight: 'bold',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '4px',
                        }}
                    >
                        Total Non-Protein Calories:
                        <span
                            style={{
                                fontWeight: 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginLeft: '4px',
                            }}
                        >
                            (Fat{' '}
                            <BlankLine width="30px" text={formatContentDisplay(lipidGramsPerDay)} />{' '}
                            g/day X 9) + (Dextrose{' '}
                            <BlankLine
                                width="35px"
                                text={formatContentDisplay(dextroseGramsPerDay)}
                            />{' '}
                            g/day X 3.4 /
                            <BlankLine
                                width="30px"
                                text={formatContentDisplay(weightForComputation)}
                            />{' '}
                            kg) =
                        </span>
                        <strong
                            style={{
                                borderBottom: '1px solid #000',
                                padding: '0 4px',
                                minWidth: '40px',
                                textAlign: 'center',
                            }}
                        >
                            {formatContentDisplay(totalNonProteinCaloriesPerKgDay) || '\u00a0'}
                        </strong>{' '}
                        Cal/kg/day
                    </div>

                    <div
                        style={{
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        Osmolarity Computation:

                        <strong
                            style={{
                                borderBottom: '1px solid #000',
                                padding: '0 8px',
                                minWidth: '80px',
                                textAlign: 'center',
                                fontSize: '12px',
                            }}
                        >
                            {osmolarityDisplay || '\u00a0'}
                        </strong>

                        {order.osmolarity_notes ? (
                            <span
                                style={{
                                    fontWeight: 'normal',
                                    fontStyle: 'italic',
                                    marginLeft: '12px',
                                }}
                            >
                                (Notes: {order.osmolarity_notes})
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* --- PHARMACY SIGNATURES SECTION (TWO COLUMNS) --- */}
                <div
                    style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        pageBreakInside: 'avoid',
                    }}
                >
                    <div style={{ display: 'flex', gap: '48px' }}>

                        {/* ======================= */}
                        {/* LEFT COLUMN             */}
                        {/* ======================= */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>

                            {/* LEFT HEADER */}
                            <div style={{ fontWeight: 'bold' }}>
                                To be filled up by Pharmacy only:
                            </div>

                            {/* A. Preparation */}
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>A. Preparation</div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <div style={{ display: 'flex', gap: '8px', flex: 1, paddingLeft: '14px' }}>
                                        <span>Date:</span>
                                        <span style={{ borderBottom: '1px solid #000', flex: 0.5 }}></span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                        <span>Time:</span>
                                        <span style={{ borderBottom: '1px solid #000', flex: 0.5 }}></span>
                                    </div>
                                </div>
                            </div>

                            {/* B. Expiration */}
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>B. Expiration</div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <div style={{ display: 'flex', gap: '8px', flex: 1, paddingLeft: '14px' }}>
                                        <span>Date:</span>
                                        <span style={{ borderBottom: '1px solid #000', flex: 0.5 }}></span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                        <span>Time:</span>
                                        <span style={{ borderBottom: '1px solid #000', flex: 0.5 }}></span>
                                    </div>
                                </div>
                            </div>

                            {/* Prepared By + Date */}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', flex: 2 }}>
                                    <span style={{ fontWeight: 'bold', marginRight: '8px', whiteSpace: 'nowrap' }}>Prepared by:</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ borderBottom: '1px solid #000', height: '10px' }}></div> {/* Reduced height */}
                                        <div style={{ textAlign: 'center', fontSize: '9px', lineHeight: '1.2', marginTop: '2px' }}>
                                            Signature over Printed Name<br />
                                            <strong>Pharmacist</strong>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                                    <span style={{ marginRight: '8px' }}>Date:</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ borderBottom: '1px solid #000', height: '10px' }}></div>
                                        <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '2px' }}>(mm/dd/yyyy)</div>
                                    </div>
                                </div>
                            </div>

                        </div>


                        {/* ======================= */}
                        {/* RIGHT COLUMN            */}
                        {/* ======================= */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* RIGHT HEADER */}
                            <div style={{ fontWeight: 'bold' }}>
                                For INITIAL ORDERS:
                            </div>

                            {/* Approved By + Date */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', flex: 2 }}>
                                    <span style={{ fontWeight: 'bold', marginRight: '8px', whiteSpace: 'nowrap' }}>Approved by:</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ borderBottom: '1px solid #000', height: '10px' }}></div>
                                        <div style={{ textAlign: 'center', fontSize: '9px', lineHeight: '1.2', marginTop: '2px' }}>
                                            Signature over Printed Name<br />
                                            <strong>Neonatologist</strong>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                                    <span style={{ marginRight: '8px' }}>Date:</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ borderBottom: '1px solid #000', height: '10px' }}></div>
                                        <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '2px' }}>(mm/dd/yyyy)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Received By + Date */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', flex: 2 }}>
                                    <span style={{ fontWeight: 'bold', marginRight: '8px', whiteSpace: 'nowrap' }}>Received by:</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ borderBottom: '1px solid #000', height: '10px' }}></div>
                                        <div style={{ textAlign: 'center', fontSize: '9px', lineHeight: '1.2', marginTop: '2px' }}>
                                            Signature over Printed Name<br />
                                            <strong>Nurse-on-duty</strong>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                                    <span style={{ marginRight: '8px' }}>Date:</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ borderBottom: '1px solid #000', height: '10px' }}></div>
                                        <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '2px' }}>(mm/dd/yyyy)</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
