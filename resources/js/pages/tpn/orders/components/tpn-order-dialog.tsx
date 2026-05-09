import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type TpnOrderDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function TpnOrderDialog({ open, onOpenChange }: TpnOrderDialogProps) {
    const [data, setData] = useState<TpnOrderFormData>(initialFormData);

    const computedWeightKg = useMemo(() => {
        return resolveWeightForComputation(
            data.birth_weight_kg,
            data.current_weight_kg,
        );
    }, [data.birth_weight_kg, data.current_weight_kg]);

    const computedBmi = useMemo(() => {
        return calculateBmi(data.height_cm, computedWeightKg);
    }, [data.height_cm, computedWeightKg]);

    const computedAge = useMemo(() => {
        return calculateAge(data.date_of_birth);
    }, [data.date_of_birth]);

    const computedRateMlPerHour = useMemo(() => {
        return calculateInfusionRate(data.total_fluid_ml, data.duration_hours);
    }, [data.total_fluid_ml, data.duration_hours]);

    function updateField<K extends keyof TpnOrderFormData>(
        field: K,
        value: TpnOrderFormData[K],
    ) {
        setData((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function handleOpenChange(nextOpen: boolean) {
        onOpenChange(nextOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="!flex flex-col gap-0 space-y-4 overflow-hidden rounded-xl border bg-background p-0 shadow-2xl [&>button]:hidden"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: 'min(1320px, calc(100vw - 2rem))',
                    maxWidth: 'min(1320px, calc(100vw - 2rem))',
                    height: 'calc(100vh - 2rem)',
                    maxHeight: 'calc(100vh - 2rem)',
                    overflow: 'hidden',
                }}
                onEscapeKeyDown={(event) => event.preventDefault()}
                onInteractOutside={(event) => event.preventDefault()}
            >
                <DialogHeader className="shrink-0 border-b border-border bg-background px-6 py-4 text-left">
                    <DialogTitle className="text-xl font-semibold">
                        New TPN Order
                    </DialogTitle>

                    <DialogDescription>
                        Create a parenteral nutrition request for pharmacist
                        review, formulation, compounding, and dispensing.
                    </DialogDescription>
                </DialogHeader>

                <div
                    className="min-h-0 flex-1 bg-muted/20 px-6 py-5"
                    style={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                >
                    <div className="mx-auto grid max-w-[1160px] gap-4 pb-4">
                        <PatientStep
                            data={data}
                            computedAge={computedAge}
                            updateField={updateField}
                        />
                        <ClinicalStep
                            data={data}
                            computedWeightKg={computedWeightKg}
                            computedBmi={computedBmi}
                            updateField={updateField}
                        />
                        <RequirementsStep
                            data={data}
                            computedRateMlPerHour={computedRateMlPerHour}
                            updateField={updateField}
                        />
                        <FormulaStep data={data} updateField={updateField} />
                        <ReviewStep
                            data={data}
                            computedWeightKg={computedWeightKg}
                            computedBmi={computedBmi}
                            computedAge={computedAge}
                            computedRateMlPerHour={computedRateMlPerHour}
                        />
                    </div>
                </div>

                <div className="shrink-0 border-t border-border bg-background px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button>
                            <Save className="mr-2 h-4 w-4" />
                            Submit for Review
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

type TpnOrderFormData = {
    temporary_request: boolean;
    last_name: string;
    first_name: string;
    middle_name: string;
    suffix: string;
    hospital_number: string;
    date_of_birth: string;
    sex: string;
    ward: string;
    room: string;
    prescribing_physician: string;
    is_initial_order: boolean;
    birth_weight_kg: string;
    current_weight_kg: string;
    height_cm: string;
    diagnosis: string;
    total_fluid_ml: string;
    duration_hours: string;
    route: string;
    dextrose: string;
    amino_acid: string;
    lipids: string;
    remarks: string;
};

const initialFormData: TpnOrderFormData = {
    temporary_request: false,
    last_name: '',
    first_name: '',
    middle_name: '',
    suffix: '',
    hospital_number: '',
    date_of_birth: '',
    sex: '',
    ward: '',
    room: '',
    prescribing_physician: '',
    is_initial_order: false,
    birth_weight_kg: '',
    current_weight_kg: '',
    height_cm: '',
    diagnosis: '',
    total_fluid_ml: '',
    duration_hours: '24',
    route: '',
    dextrose: '',
    amino_acid: '',
    lipids: '',
    remarks: '',
};
function calculateBmi(heightCm: string, weightKg: string): string {
    const height = Number(heightCm);
    const weight = Number(weightKg);

    if (
        !Number.isFinite(height) ||
        !Number.isFinite(weight) ||
        height <= 0 ||
        weight <= 0
    ) {
        return '';
    }

    const heightMeters = height / 100;

    return (weight / (heightMeters * heightMeters)).toFixed(2);
}

function calculateAge(dateOfBirth: string): string {
    if (!dateOfBirth) {
        return '';
    }

    const birthDate = new Date(`${dateOfBirth}T00:00:00`);
    const today = new Date();

    if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
        return '';
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
        months -= 1;

        const previousMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0,
        );

        days += previousMonth.getDate();
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    const parts: string[] = [];

    if (years > 0) {
        parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    }

    if (months > 0) {
        parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    }

    if (days > 0 || parts.length === 0) {
        parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    }

    return parts.join(', ');
}

function resolveWeightForComputation(
    birthWeightKg: string,
    currentWeightKg: string,
): string {
    const birthWeight = Number(birthWeightKg);
    const currentWeight = Number(currentWeightKg);

    const hasBirthWeight = Number.isFinite(birthWeight) && birthWeight > 0;

    const hasCurrentWeight =
        Number.isFinite(currentWeight) && currentWeight > 0;

    if (hasBirthWeight && hasCurrentWeight) {
        return currentWeight > birthWeight
            ? currentWeight.toString()
            : birthWeight.toString();
    }

    if (hasCurrentWeight) {
        return currentWeight.toString();
    }

    if (hasBirthWeight) {
        return birthWeight.toString();
    }

    return '';
}

function calculateInfusionRate(
    totalFluidMl: string,
    durationHours: string,
): string {
    const totalFluid = Number(totalFluidMl);
    const duration = Number(durationHours);

    if (
        !Number.isFinite(totalFluid) ||
        !Number.isFinite(duration) ||
        totalFluid <= 0 ||
        duration <= 0
    ) {
        return '';
    }

    return (totalFluid / duration).toFixed(2);
}

type SectionProps = {
    data: TpnOrderFormData;
    updateField: <K extends keyof TpnOrderFormData>(
        field: K,
        value: TpnOrderFormData[K],
    ) => void;
};

type PatientSectionProps = SectionProps & {
    computedAge: string;
};

type ClinicalSectionProps = SectionProps & {
    computedWeightKg: string;
    computedBmi: string;
};

type RequirementsSectionProps = SectionProps & {
    computedRateMlPerHour: string;
};

type ReviewSectionProps = {
    data: TpnOrderFormData;
    computedWeightKg: string;
    computedBmi: string;
    computedAge: string;
    computedRateMlPerHour: string;
};

function PatientStep({ data, computedAge, updateField }: PatientSectionProps) {
    return (
        <Card className="rounded-lg border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>
                    Encode the patient identity and current hospital location
                    for this TPN request.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div
                    className="grid gap-4"
                    style={{
                        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                    }}
                >
                    <div style={{ gridColumn: 'span 12 / span 12' }}>
                        <div className="flex min-h-[76px] items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/30 px-4 py-3">
                            <div className="grid gap-1">
                                <span className="text-sm font-medium text-foreground">
                                    Use temporary TPN request
                                </span>
                                <span className="text-xs leading-snug text-muted-foreground">
                                    Use this when the complete nutrition
                                    assessment is still pending.
                                </span>
                            </div>

                            <Checkbox
                                checked={data.temporary_request}
                                onCheckedChange={(checked) =>
                                    updateField(
                                        'temporary_request',
                                        checked === true,
                                    )
                                }
                                className="shrink-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <Field
                        label="Last Name"
                        htmlFor="last_name"
                        style={{ gridColumn: 'span 3 / span 3' }}
                    >
                        <Input
                            id="last_name"
                            value={data.last_name}
                            onChange={(event) =>
                                updateField('last_name', event.target.value)
                            }
                            placeholder="Last name"
                        />
                    </Field>

                    <Field
                        label="First Name"
                        htmlFor="first_name"
                        style={{ gridColumn: 'span 3 / span 3' }}
                    >
                        <Input
                            id="first_name"
                            value={data.first_name}
                            onChange={(event) =>
                                updateField('first_name', event.target.value)
                            }
                            placeholder="First name"
                        />
                    </Field>

                    <Field
                        label="Middle Name"
                        htmlFor="middle_name"
                        style={{ gridColumn: 'span 3 / span 3' }}
                    >
                        <Input
                            id="middle_name"
                            value={data.middle_name}
                            onChange={(event) =>
                                updateField('middle_name', event.target.value)
                            }
                            placeholder="Middle name"
                        />
                    </Field>

                    <Field
                        label="Suffix"
                        htmlFor="suffix"
                        style={{ gridColumn: 'span 3 / span 3' }}
                    >
                        <Input
                            id="suffix"
                            value={data.suffix}
                            onChange={(event) =>
                                updateField('suffix', event.target.value)
                            }
                            placeholder="Jr., Sr., III"
                        />
                    </Field>

                    <Field
                        label="Hospital Number"
                        htmlFor="hospital_number"
                        style={{ gridColumn: 'span 3 / span 3' }}
                    >
                        <Input
                            id="hospital_number"
                            value={data.hospital_number}
                            onChange={(event) =>
                                updateField(
                                    'hospital_number',
                                    event.target.value,
                                )
                            }
                            placeholder="Hospital no."
                        />
                    </Field>

                    <Field
                        label="Date of Birth"
                        htmlFor="date_of_birth"
                        style={{ gridColumn: 'span 3 / span 3' }}
                    >
                        <Input
                            id="date_of_birth"
                            type="date"
                            value={data.date_of_birth}
                            onChange={(event) =>
                                updateField('date_of_birth', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        label="Age"
                        htmlFor="age"
                        style={{ gridColumn: 'span 3 / span 3' }}
                    >
                        <Input
                            id="age"
                            value={computedAge}
                            className="text-center"
                            placeholder="Auto"
                            readOnly
                        />
                    </Field>

                    <Field
                        label="Sex"
                        htmlFor="sex"
                        style={{ gridColumn: 'span 3 / span 3' }}
                    >
                        <Select
                            value={data.sex}
                            onValueChange={(value) => updateField('sex', value)}
                        >
                            <SelectTrigger id="sex" className="w-full">
                                <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field
                        label="Ward"
                        htmlFor="ward"
                        style={{ gridColumn: 'span 3 / span 3' }}
                    >
                        <Input
                            id="ward"
                            value={data.ward}
                            onChange={(event) =>
                                updateField('ward', event.target.value)
                            }
                            placeholder="Ward"
                        />
                    </Field>

                    <Field
                        label="Room"
                        htmlFor="room"
                        style={{ gridColumn: 'span 3/ span 3' }}
                    >
                        <Input
                            id="room"
                            value={data.room}
                            onChange={(event) =>
                                updateField('room', event.target.value)
                            }
                            placeholder="Room"
                        />
                    </Field>

                    <Field
                        label="Prescribing Physician"
                        htmlFor="prescribing_physician"
                        style={{ gridColumn: 'span 6 / span 6' }}
                    >
                        <Input
                            id="prescribing_physician"
                            value={data.prescribing_physician}
                            onChange={(event) =>
                                updateField(
                                    'prescribing_physician',
                                    event.target.value,
                                )
                            }
                            placeholder="Enter prescribing physician"
                        />
                    </Field>

                    <div style={{ gridColumn: 'span 6' }}>
                        <div className="flex min-h-[76px] items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/30 px-4 py-3">
                            <div className="grid gap-1">
                                <span className="text-sm font-medium text-foreground">
                                    Initial TPN Order
                                </span>
                                <span className="text-xs leading-snug text-muted-foreground">
                                    Mark this if this is the patient&apos;s
                                    first TPN order for this therapy.
                                </span>
                            </div>

                            <Checkbox
                                checked={data.is_initial_order}
                                onCheckedChange={(checked) =>
                                    updateField(
                                        'is_initial_order',
                                        checked === true,
                                    )
                                }
                                className="shrink-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {data.is_initial_order ? (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                <div className="font-semibold">
                                    Nutrition Support Team approval required
                                </div>
                                <div className="mt-1 text-xs leading-relaxed">
                                    This is marked as an initial TPN order.
                                    Initial orders must be reviewed and approved
                                    by the Nutrition Support Team before
                                    proceeding to formulation, compounding, or
                                    dispensing.
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

function ClinicalStep({
    data,
    computedWeightKg,
    computedBmi,
    updateField,
}: ClinicalSectionProps) {
    return (
        <Card className="rounded-lg border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle>Clinical Details</CardTitle>
                <CardDescription>
                    Enter the clinical basis and anthropometric data for the TPN
                    order.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                        gap: '1rem',
                    }}
                >
                    <Field
                        label="Birth Weight by Kg"
                        htmlFor="birth_weight_kg"
                        style={{ gridColumn: 'span 4' }}
                    >
                        <Input
                            id="birth_weight_kg"
                            type="number"
                            value={data.birth_weight_kg}
                            onChange={(event) =>
                                updateField(
                                    'birth_weight_kg',
                                    event.target.value,
                                )
                            }
                            placeholder="0.00"
                        />
                    </Field>

                    <Field
                        label="Current Weight by Kg"
                        htmlFor="current_weight_kg"
                        style={{ gridColumn: 'span 4' }}
                    >
                        <Input
                            id="current_weight_kg"
                            type="number"
                            value={data.current_weight_kg}
                            onChange={(event) =>
                                updateField(
                                    'current_weight_kg',
                                    event.target.value,
                                )
                            }
                            placeholder="0.00"
                        />
                    </Field>

                    <Field
                        label="Height by Cm"
                        htmlFor="height_cm"
                        style={{ gridColumn: 'span 4' }}
                    >
                        <Input
                            id="height_cm"
                            type="number"
                            value={data.height_cm}
                            onChange={(event) =>
                                updateField('height_cm', event.target.value)
                            }
                            placeholder="0.00"
                        />
                    </Field>

                    <Field
                        label="Weight Used by Kg"
                        htmlFor="computed_weight_kg"
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Input
                            id="computed_weight_kg"
                            value={computedWeightKg}
                            placeholder="Auto-selected"
                            readOnly
                        />
                    </Field>

                    <Field
                        label="BMI"
                        htmlFor="bmi"
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Input
                            id="bmi"
                            value={computedBmi}
                            placeholder="Auto-computed"
                            readOnly
                        />
                    </Field>

                    <div
                        style={{
                            gridColumn: 'span 6',
                            alignSelf: 'end',
                        }}
                    >
                        <div className="flex min-h-10 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs leading-relaxed text-emerald-800">
                            Current weight will be used when it is greater than
                            birth weight. Otherwise, birth weight will be used
                            for computation.
                        </div>
                    </div>

                    <Field
                        label="Diagnosis / Clinical Notes"
                        htmlFor="diagnosis"
                        style={{ gridColumn: '1 / -1' }}
                    >
                        <Textarea
                            id="diagnosis"
                            value={data.diagnosis}
                            onChange={(event) =>
                                updateField('diagnosis', event.target.value)
                            }
                            placeholder="Enter diagnosis or nutrition-related notes"
                            className="min-h-[86px]"
                        />
                    </Field>
                </div>
            </CardContent>
        </Card>
    );
}

function RequirementsStep({
    data,
    computedRateMlPerHour,
    updateField,
}: RequirementsSectionProps) {
    return (
        <Card className="rounded-lg border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle>TPN Requirements</CardTitle>
                <CardDescription>
                    Define the target volume, infusion duration, route, and
                    computed hourly rate.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                        gap: '1rem',
                    }}
                >
                    <Field
                        label="Total Fluid by mL"
                        htmlFor="total_fluid_ml"
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Input
                            id="total_fluid_ml"
                            type="number"
                            value={data.total_fluid_ml}
                            onChange={(event) =>
                                updateField(
                                    'total_fluid_ml',
                                    event.target.value,
                                )
                            }
                            placeholder="0"
                        />
                    </Field>

                    <Field
                        label="Duration by Hours"
                        htmlFor="duration_hours"
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Input
                            id="duration_hours"
                            type="number"
                            value={data.duration_hours}
                            onChange={(event) =>
                                updateField(
                                    'duration_hours',
                                    event.target.value,
                                )
                            }
                            placeholder="24"
                        />
                    </Field>

                    <Field
                        label="Rate by mL/hr"
                        htmlFor="rate_ml_per_hour"
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Input
                            id="rate_ml_per_hour"
                            value={computedRateMlPerHour}
                            placeholder="Auto-computed"
                            readOnly
                        />
                    </Field>

                    <Field
                        label="Infusion Route"
                        htmlFor="route"
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Select
                            value={data.route}
                            onValueChange={(value) =>
                                updateField('route', value)
                            }
                        >
                            <SelectTrigger id="route" className="w-full">
                                <SelectValue placeholder="Select route" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="central">
                                    Central Line
                                </SelectItem>
                                <SelectItem value="peripheral">
                                    Peripheral Line
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800">
                            Infusion rate is automatically computed by dividing
                            total fluid volume by infusion duration.
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function FormulaStep({ data, updateField }: SectionProps) {
    return (
        <Card className="rounded-lg border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle>Formula Preview</CardTitle>
                <CardDescription>
                    Initial formula fields for macronutrients, electrolytes, and
                    additives.
                </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
                <Field
                    label="Dextrose"
                    htmlFor="dextrose"
                    className="xl:col-span-4"
                >
                    <Input
                        id="dextrose"
                        value={data.dextrose}
                        onChange={(event) =>
                            updateField('dextrose', event.target.value)
                        }
                        placeholder="Example: D10"
                    />
                </Field>

                <Field
                    label="Amino Acid"
                    htmlFor="amino_acid"
                    className="xl:col-span-4"
                >
                    <Input
                        id="amino_acid"
                        value={data.amino_acid}
                        onChange={(event) =>
                            updateField('amino_acid', event.target.value)
                        }
                        placeholder="Example: 3%"
                    />
                </Field>

                <Field
                    label="Lipids"
                    htmlFor="lipids"
                    className="xl:col-span-4"
                >
                    <Input
                        id="lipids"
                        value={data.lipids}
                        onChange={(event) =>
                            updateField('lipids', event.target.value)
                        }
                        placeholder="Example: 20%"
                    />
                </Field>

                <Field
                    label="Remarks"
                    htmlFor="remarks"
                    className="xl:col-span-12"
                >
                    <Textarea
                        id="remarks"
                        value={data.remarks}
                        onChange={(event) =>
                            updateField('remarks', event.target.value)
                        }
                        placeholder="Additional order instructions"
                        className="min-h-[76px]"
                    />
                </Field>
            </CardContent>
        </Card>
    );
}

function ReviewStep({
    data,
    computedWeightKg,
    computedBmi,
    computedAge,
    computedRateMlPerHour,
}: ReviewSectionProps) {
    const fullName = [
        data.last_name,
        data.first_name,
        data.middle_name,
        data.suffix,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <Card className="rounded-lg border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle>Review and Submit</CardTitle>
                <CardDescription>
                    Confirm the request details before sending the TPN order for
                    pharmacist review.
                </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 text-sm md:grid-cols-2">
                <div className="grid gap-3 rounded-lg border border-border/80 bg-muted/30 p-4">
                    <div className="font-semibold text-foreground">
                        Patient Information
                    </div>

                    <ReviewRow label="Patient" value={fullName} />
                    <ReviewRow
                        label="Hospital No."
                        value={data.hospital_number}
                    />
                    <ReviewRow
                        label="Date of Birth"
                        value={data.date_of_birth}
                    />
                    <ReviewRow label="Age" value={computedAge} />
                    <ReviewRow label="Sex" value={data.sex} />
                    <ReviewRow label="Ward" value={data.ward} />
                    <ReviewRow label="Room" value={data.room} />
                    <ReviewRow
                        label="Temporary Request"
                        value={data.temporary_request ? 'Yes' : 'No'}
                    />
                    <ReviewRow
                        label="Prescribing Physician"
                        value={data.prescribing_physician}
                    />
                    <ReviewRow
                        label="Initial Order"
                        value={data.is_initial_order ? 'Yes' : 'No'}
                    />
                </div>

                <div className="grid gap-3 rounded-lg border border-border/80 bg-muted/30 p-4">
                    <div className="font-semibold text-foreground">
                        Clinical and Requirements
                    </div>

                    <ReviewRow
                        label="Birth Weight"
                        value={data.birth_weight_kg}
                    />
                    <ReviewRow
                        label="Current Weight"
                        value={data.current_weight_kg}
                    />
                    <ReviewRow label="Weight Used" value={computedWeightKg} />
                    <ReviewRow label="Height" value={data.height_cm} />
                    <ReviewRow label="BMI" value={computedBmi} />
                    <ReviewRow
                        label="Total Fluid"
                        value={data.total_fluid_ml}
                    />
                    <ReviewRow
                        label="Duration"
                        value={
                            data.duration_hours
                                ? `${data.duration_hours} hours`
                                : ''
                        }
                    />
                    <ReviewRow
                        label="Rate"
                        value={
                            computedRateMlPerHour
                                ? `${computedRateMlPerHour} mL/hr`
                                : ''
                        }
                    />
                    <ReviewRow label="Route" value={data.route} />
                </div>
            </CardContent>
        </Card>
    );
}
function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
            <span className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                {label}
            </span>
            <span className="text-right text-sm font-medium text-foreground">
                {value || '—'}
            </span>
        </div>
    );
}

function Field({
    label,
    htmlFor,
    className = '',
    style,
    children,
}: {
    label: string;
    htmlFor: string;
    className?: string;
    style?: CSSProperties;
    children: ReactNode;
}) {
    return (
        <div className={`grid content-start gap-2 ${className}`} style={style}>
            <Label
                htmlFor={htmlFor}
                className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
            >
                {label}
            </Label>
            {children}
        </div>
    );
}
