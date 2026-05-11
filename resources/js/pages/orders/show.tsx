import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ClipboardList,
    Download,
    Droplets,
    FlaskConical,
    Pencil,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';

import { OrderRegistrationDialog } from '@/components/orders/order-registration-dialog';
import { OrderExportSheet } from '@/components/orders/order-export-sheet';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    calculateAge,
    calculateBmi,
    calculateDextroseCalories,
    calculateDextroseGramsPerDay,
    calculateGir,
    calculateInfusionRate,
    calculateLipidCalories,
    calculateLipidVolumeMl,
    calculatePerKgPerDay,
    calculateProteinCalories,
    calculateRateMlPerHour,
    calculateTotalNonProteinCaloriesPerKgDay,
    getPatientName,
    resolveWeightForComputation,
    type TpnOrder,
} from '@/types/orders';

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

export default function OrderShow({ order }: { order?: TpnOrder | null }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    if (!order) {
        return (
            <>
                <Head title="TPN Order Not Found" />

                <div className="emr-content-surface flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <Button variant="outline" className="w-fit" asChild>
                        <Link href="/orders">
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

    const age = calculateAge(order.date_of_birth);

    const computedWeightKg = resolveWeightForComputation(
        order.birth_weight_kg,
        order.current_weight_kg,
    );

    const bmi = calculateBmi(order.height_cm, computedWeightKg);

    const infusionRate = calculateInfusionRate(
        order.total_fluid_ml,
        order.duration_hours,
    );

    const proteinGramsPerDay = calculatePerKgPerDay(
        order.protein_g_per_kg_day,
        computedWeightKg,
    );

    const proteinCalories = calculateProteinCalories(proteinGramsPerDay);

    const dextroseGramsPerDay = calculateDextroseGramsPerDay(
        order.total_fluid_ml,
        order.dextrose_percent,
    );

    const dextroseCalories = calculateDextroseCalories(dextroseGramsPerDay);

    const gir = calculateGir(
        dextroseGramsPerDay,
        computedWeightKg,
        order.duration_hours,
    );

    const lipidGramsPerDay = calculatePerKgPerDay(
        order.lipid_g_per_kg_day,
        computedWeightKg,
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
        computedWeightKg,
    );

    const potassiumMeqPerDay = calculatePerKgPerDay(
        order.potassium_meq_kg_day,
        computedWeightKg,
    );

    const calciumMgPerDay = calculatePerKgPerDay(
        order.calcium_mg_kg_day,
        computedWeightKg,
    );

    const magnesiumMeqPerDay = calculatePerKgPerDay(
        order.magnesium_meq_kg_day,
        computedWeightKg,
    );

    const phosphorusMmolPerDay = calculatePerKgPerDay(
        order.phosphorus_mmol_kg_day,
        computedWeightKg,
    );

    const traceElementsMlPerDay = calculatePerKgPerDay(
        order.trace_elements_ml_kg_day,
        computedWeightKg,
    );

    const totalNonProteinCaloriesPerKgDay =
        calculateTotalNonProteinCaloriesPerKgDay(
            dextroseCalories,
            lipidCalories,
            computedWeightKg,
        );

    return (
        <>
            <Head title={`${order.order_no} - ${patientName}`} />

            <div className="emr-content-surface flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between print:hidden">
                    <div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                {patientName}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {order.order_no} |{' '}
                                {order.hospital_number || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button variant="outline" asChild>
                            <Link href="/orders">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Orders
                            </Link>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => setEditDialogOpen(true)}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>

                        <Button
                            type="button"
                            className="cursor-pointer bg-[#2f7d32] text-white hover:bg-[#27692a]"
                            onClick={() => window.print()}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                <Card className="rounded-lg border-slate-200 bg-white shadow-sm print:hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <FlaskConical className="h-5 w-5 text-[#2f7d32]" />
                            Computation Summary
                        </CardTitle>
                        <CardDescription>
                            Macronutrients, electrolytes, additives, calories,
                            and osmolarity details for this TPN order.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-[#2f7d32]">
                                    Protein
                                </h3>

                                <InfoGrid>
                                    <InfoItem
                                        label="Dose"
                                        value={
                                            order.protein_g_per_kg_day
                                                ? `${order.protein_g_per_kg_day} g/kg/day`
                                                : ''
                                        }
                                    />
                                    <InfoItem
                                        label="Contents"
                                        value={
                                            proteinGramsPerDay
                                                ? `${proteinGramsPerDay} g/day`
                                                : ''
                                        }
                                    />
                                    <InfoItem
                                        label="Calories"
                                        value={
                                            proteinCalories
                                                ? `${proteinCalories} Cal/day`
                                                : ''
                                        }
                                    />
                                </InfoGrid>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-[#2f7d32]">
                                    Carbohydrates
                                </h3>

                                <InfoGrid>
                                    <InfoItem
                                        label="Dextrose"
                                        value={
                                            order.dextrose_percent
                                                ? `${order.dextrose_percent}%`
                                                : ''
                                        }
                                    />
                                    <InfoItem
                                        label="Contents"
                                        value={
                                            dextroseGramsPerDay
                                                ? `${dextroseGramsPerDay} g/day`
                                                : ''
                                        }
                                    />
                                    <InfoItem
                                        label="Calories"
                                        value={
                                            dextroseCalories
                                                ? `${dextroseCalories} Cal/day`
                                                : ''
                                        }
                                    />
                                    <InfoItem
                                        label="GIR"
                                        value={gir ? `${gir} mg/kg/min` : ''}
                                    />
                                </InfoGrid>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-[#2f7d32]">
                                    Fat
                                </h3>

                                <InfoGrid>
                                    <InfoItem
                                        label="Dose"
                                        value={
                                            order.lipid_g_per_kg_day
                                                ? `${order.lipid_g_per_kg_day} g/kg/day`
                                                : ''
                                        }
                                    />
                                    <InfoItem
                                        label="Contents"
                                        value={
                                            lipidGramsPerDay
                                                ? `${lipidGramsPerDay} g/day`
                                                : ''
                                        }
                                    />
                                    <InfoItem
                                        label="Volume"
                                        value={
                                            lipidVolumeMl
                                                ? `${lipidVolumeMl} mL`
                                                : ''
                                        }
                                    />
                                    <InfoItem
                                        label="Rate"
                                        value={
                                            lipidRateMlPerHour
                                                ? `${lipidRateMlPerHour} mL/hr`
                                                : ''
                                        }
                                    />
                                    <InfoItem
                                        label="Calories"
                                        value={
                                            lipidCalories
                                                ? `${lipidCalories} Cal/day`
                                                : ''
                                        }
                                    />
                                </InfoGrid>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <h3 className="mb-3 text-sm font-semibold text-[#2f7d32]">
                                Electrolytes and Additives
                            </h3>

                            <InfoGrid>
                                <InfoItem
                                    label="Sodium"
                                    value={
                                        sodiumMeqPerDay
                                            ? `${sodiumMeqPerDay} meqs/day`
                                            : ''
                                    }
                                />
                                <InfoItem
                                    label="Potassium"
                                    value={
                                        potassiumMeqPerDay
                                            ? `${potassiumMeqPerDay} meqs/day`
                                            : ''
                                    }
                                />
                                <InfoItem
                                    label="Calcium"
                                    value={
                                        calciumMgPerDay
                                            ? `${calciumMgPerDay} meqs/day`
                                            : ''
                                    }
                                />
                                <InfoItem
                                    label="Magnesium"
                                    value={
                                        magnesiumMeqPerDay
                                            ? `${magnesiumMeqPerDay} meqs/day`
                                            : ''
                                    }
                                />
                                <InfoItem
                                    label="Phosphorus"
                                    value={
                                        phosphorusMmolPerDay
                                            ? `${phosphorusMmolPerDay} mmol/day`
                                            : ''
                                    }
                                />
                                <InfoItem
                                    label="Trace Elements"
                                    value={
                                        traceElementsMlPerDay
                                            ? `${traceElementsMlPerDay} mL/day`
                                            : ''
                                    }
                                />
                                <InfoItem
                                    label="Multivitamins"
                                    value={
                                        order.multivitamins_ml_day
                                            ? `${order.multivitamins_ml_day} mL/day`
                                            : ''
                                    }
                                />
                            </InfoGrid>
                        </div>

                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                            <h3 className="mb-3 text-sm font-semibold text-emerald-900">
                                Total Non-Protein Calories
                            </h3>

                            <InfoItem
                                label="Result"
                                value={
                                    totalNonProteinCaloriesPerKgDay
                                        ? `${totalNonProteinCaloriesPerKgDay} Cal/kg/day`
                                        : ''
                                }
                            />
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <h3 className="mb-3 text-sm font-semibold text-[#2f7d32]">
                                Osmolarity Computation
                            </h3>

                            <p className="text-sm whitespace-pre-wrap text-slate-600">
                                {order.osmolarity_notes || 'N/A'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border-slate-200 bg-white shadow-sm print:hidden">
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
                                label="Weight Used"
                                value={
                                    computedWeightKg
                                        ? `${computedWeightKg} kg`
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

                <Card className="rounded-lg border-slate-200 bg-white shadow-sm print:hidden">
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
                                label="Rate"
                                value={
                                    infusionRate ? `${infusionRate} mL/hr` : ''
                                }
                            />
                            <InfoItem label="Route" value={order.route} />
                        </InfoGrid>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border-slate-200 bg-white shadow-sm print:hidden">
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
                            <InfoItem
                                label="Dextrose"
                                value={
                                    order.dextrose_percent
                                        ? `${order.dextrose_percent}%`
                                        : ''
                                }
                            />
                            <InfoItem
                                label="Protein Dose"
                                value={
                                    order.protein_g_per_kg_day
                                        ? `${order.protein_g_per_kg_day} g/kg/day`
                                        : ''
                                }
                            />
                            <InfoItem
                                label="Lipid Dose"
                                value={
                                    order.lipid_g_per_kg_day
                                        ? `${order.lipid_g_per_kg_day} g/kg/day`
                                        : ''
                                }
                            />
                            <InfoItem
                                label="Osmolarity Notes"
                                value={order.osmolarity_notes}
                            />
                        </InfoGrid>
                    </CardContent>
                </Card>
            </div>

            <OrderExportSheet order={order} />
            <OrderRegistrationDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                initialData={order}
                title="Edit TPN Order"
                submitLabel="Save Changes"
            />
        </>
    );
}

OrderShow.layout = {
    breadcrumbs: [
        {
            title: 'Orders',
            href: '/orders',
        },
        {
            title: 'Order Details',
            href: '#',
        },
    ],
};
