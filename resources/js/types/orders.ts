export type TpnOrderStatus =
    | 'Draft'
    | 'Pending Review'
    | 'Approved'
    | 'For Compounding'
    | 'For Dispensing'
    | 'Completed'
    | 'Cancelled';

export type OrderTabKey =
    | 'patient'
    | 'clinical'
    | 'requirements'
    | 'computation'
    | 'review';

export type TpnOrderFormData = {
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

    protein_g_per_kg_day: string;

    dextrose_percent: string;

    lipid_g_per_kg_day: string;
    lipid_concentration: string;
    lipid_duration_hours: string;
    lipid_piggyback: boolean;
    lipid_separate_line: boolean;

    sodium_meq_kg_day: string;
    potassium_meq_kg_day: string;
    calcium_mg_kg_day: string;
    magnesium_meq_kg_day: string;
    phosphorus_mmol_kg_day: string;

    trace_elements_ml_kg_day: string;
    multivitamins_ml_day: string;
    heparin_ml: string;
    heparin_units_per_ml: string;

    osmolarity_notes: string;
};

export type TpnOrder = TpnOrderFormData & {
    id: number;
    order_no: string;
    order_date: string;
    status: TpnOrderStatus;
};

export const initialOrderFormData: TpnOrderFormData = {
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

    protein_g_per_kg_day: '',

    dextrose_percent: '',

    lipid_g_per_kg_day: '',
    lipid_concentration: '20',
    lipid_duration_hours: '24',
    lipid_piggyback: false,
    lipid_separate_line: false,

    sodium_meq_kg_day: '',
    potassium_meq_kg_day: '',
    calcium_mg_kg_day: '',
    magnesium_meq_kg_day: '',
    phosphorus_mmol_kg_day: '',

    trace_elements_ml_kg_day: '',
    multivitamins_ml_day: '',
    heparin_ml: '',
    heparin_units_per_ml: '',

    osmolarity_notes: '',
};

export const orderTabs: Array<{
    key: OrderTabKey;
    label: string;
    description: string;
}> = [
    {
        key: 'patient',
        label: 'Patient Information',
        description: 'Patient identity and location',
    },
    {
        key: 'clinical',
        label: 'Clinical Details',
        description: 'Weight, height, BMI, and notes',
    },
    {
        key: 'requirements',
        label: 'TPN Requirements',
        description: 'Fluid, duration, rate, and route',
    },
    {
        key: 'computation',
        label: 'Computation',
        description: 'Formula and calculated components',
    },
    {
        key: 'review',
        label: 'Review',
        description: 'Final verification',
    },
];

export const statusOptions: Array<TpnOrderStatus | 'All'> = [
    'All',
    'Draft',
    'Pending Review',
    'Approved',
    'For Compounding',
    'For Dispensing',
    'Completed',
    'Cancelled',
];

export const initialOrders: TpnOrder[] = [];

export function getPatientName(order: Pick<
    TpnOrderFormData,
    'last_name' | 'first_name' | 'middle_name' | 'suffix'
>) {
    const lastName = order.last_name.trim();
    const firstName = order.first_name.trim();
    const middleName = order.middle_name.trim();
    const suffix = order.suffix.trim();

    const givenNames = [firstName, middleName].filter(Boolean).join(' ');
    const fullName = [lastName, givenNames].filter(Boolean).join(', ');

    return [fullName, suffix].filter(Boolean).join(' ');
}

export function getStatusClass(status: TpnOrderStatus) {
    switch (status) {
        case 'Draft':
            return 'border-slate-300 bg-slate-50 text-slate-700';
        case 'Pending Review':
            return 'border-amber-300 bg-amber-50 text-amber-700';
        case 'Approved':
            return 'border-blue-300 bg-blue-50 text-blue-700';
        case 'For Compounding':
            return 'border-purple-300 bg-purple-50 text-purple-700';
        case 'For Dispensing':
            return 'border-emerald-300 bg-emerald-50 text-emerald-700';
        case 'Completed':
            return 'border-green-300 bg-green-50 text-green-700';
        case 'Cancelled':
            return 'border-red-300 bg-red-50 text-red-700';
        default:
            return 'border-slate-300 bg-slate-50 text-slate-700';
    }
}

export function calculateAge(dateOfBirth: string): string {
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

export function resolveWeightForComputation(
    birthWeightKg: string,
    currentWeightKg: string,
): string {
    const birthWeight = Number(birthWeightKg);
    const currentWeight = Number(currentWeightKg);

    const hasBirthWeight = Number.isFinite(birthWeight) && birthWeight > 0;
    const hasCurrentWeight = Number.isFinite(currentWeight) && currentWeight > 0;

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

export function calculateBmi(heightCm: string, weightKg: string): string {
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

export function calculateInfusionRate(
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

export function toSafeNumber(value: string): number | null {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue < 0) {
        return null;
    }

    return numberValue;
}

export function formatComputedNumber(
    value: number | null,
    decimals = 2,
): string {
    if (value === null || !Number.isFinite(value)) {
        return '';
    }

    return value.toFixed(decimals);
}

export function calculatePerKgPerDay(
    dose: string,
    weightKg: string,
): string {
    const doseValue = toSafeNumber(dose);
    const weight = toSafeNumber(weightKg);

    if (doseValue === null || weight === null || weight <= 0) {
        return '';
    }

    return formatComputedNumber(doseValue * weight);
}

export function calculateDextroseGramsPerDay(
    totalFluidMl: string,
    dextrosePercent: string,
): string {
    const totalFluid = toSafeNumber(totalFluidMl);
    const percent = toSafeNumber(dextrosePercent);

    if (totalFluid === null || percent === null || totalFluid <= 0) {
        return '';
    }

    return formatComputedNumber((totalFluid * percent) / 100);
}

export function calculateGir(
    dextroseGramsPerDay: string,
    weightKg: string,
    durationHours: string,
): string {
    const dextroseGrams = toSafeNumber(dextroseGramsPerDay);
    const weight = toSafeNumber(weightKg);
    const duration = toSafeNumber(durationHours);

    if (
        dextroseGrams === null ||
        weight === null ||
        duration === null ||
        weight <= 0 ||
        duration <= 0
    ) {
        return '';
    }

    return formatComputedNumber(
        (dextroseGrams * 1000) / (weight * duration * 60),
    );
}

export function calculateLipidVolumeMl(
    lipidGramsPerDay: string,
    lipidConcentration: string,
): string {
    const lipidGrams = toSafeNumber(lipidGramsPerDay);
    const concentration = toSafeNumber(lipidConcentration);

    if (
        lipidGrams === null ||
        concentration === null ||
        lipidGrams <= 0 ||
        concentration <= 0
    ) {
        return '';
    }

    const gramsPerMl = concentration / 100;

    return formatComputedNumber(lipidGrams / gramsPerMl);
}

export function calculateRateMlPerHour(
    volumeMl: string,
    durationHours: string,
): string {
    const volume = toSafeNumber(volumeMl);
    const duration = toSafeNumber(durationHours);

    if (
        volume === null ||
        duration === null ||
        volume <= 0 ||
        duration <= 0
    ) {
        return '';
    }

    return formatComputedNumber(volume / duration);
}

export function calculateDextroseCalories(dextroseGramsPerDay: string): string {
    const grams = toSafeNumber(dextroseGramsPerDay);

    if (grams === null || grams <= 0) {
        return '';
    }

    return formatComputedNumber(grams * 3.4);
}

export function calculateProteinCalories(proteinGramsPerDay: string): string {
    const grams = toSafeNumber(proteinGramsPerDay);

    if (grams === null || grams <= 0) {
        return '';
    }

    return formatComputedNumber(grams * 4);
}

export function calculateLipidCalories(lipidGramsPerDay: string): string {
    const grams = toSafeNumber(lipidGramsPerDay);

    if (grams === null || grams <= 0) {
        return '';
    }

    return formatComputedNumber(grams * 9);
}

export function calculateTotalNonProteinCaloriesPerKgDay(
    dextroseCalories: string,
    lipidCalories: string,
    weightKg: string,
): string {
    const dextrose = toSafeNumber(dextroseCalories);
    const lipid = toSafeNumber(lipidCalories);
    const weight = toSafeNumber(weightKg);

    if (weight === null || weight <= 0) {
        return '';
    }

    return formatComputedNumber(((dextrose ?? 0) + (lipid ?? 0)) / weight);
}

export function findOrderById(id: number) {
    return initialOrders.find((order) => order.id === id) ?? null;
}