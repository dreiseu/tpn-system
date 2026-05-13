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
    diagnosis: string;

    total_fluid_req_ml_kg_day: string;
    total_fluid_ml: string;
    total_fluid_with_overfill_ml: string;
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
    heparin_iu_per_ml: string;

    use_osmolarity_calculator: boolean;

    osmolarity_ppn_solution: string;
    osmolarity_ppn_volume_ml: string;
    osmolarity_ppn_lock_total_volume: string;

    osmolarity_amino_acid_10_grams: string;
    osmolarity_amino_acid_15_grams: string;
    osmolarity_dextrose_concentration: string;
    osmolarity_dextrose_grams: string;
    osmolarity_hepatamine_8_grams: string;
    osmolarity_lipid_10_ml: string;
    osmolarity_lipid_20_ml: string;
    osmolarity_novamine_15_grams: string;
    osmolarity_sterile_water_ml: string;

    osmolarity_calcium_gluconate_10_ml: string;
    osmolarity_calcium_chloride_10_ml: string;
    osmolarity_magnesium_sulfate_ml: string;
    osmolarity_multi_trace_elements_ml: string;
    osmolarity_multivitamin_12_ml: string;
    osmolarity_potassium_acetate_ml: string;
    osmolarity_potassium_chloride_ml: string;
    osmolarity_potassium_phosphate_ml: string;
    osmolarity_sodium_acetate_ml: string;
    osmolarity_sodium_bicarbonate_4_2_ml: string;
    osmolarity_sodium_bicarbonate_7_5_ml: string;
    osmolarity_sodium_bicarbonate_8_4_ml: string;
    osmolarity_sodium_chloride_14_6_ml: string;
    osmolarity_sodium_chloride_23_4_ml: string;
    osmolarity_sodium_phosphate_ml: string;

    osmolarity_notes: string;
    osmolarity_inputs_json: string;
    osmolarity_computed_mosm_l: string;
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
    diagnosis: '',

    total_fluid_req_ml_kg_day: '',
    total_fluid_ml: '',
    total_fluid_with_overfill_ml: '',
    duration_hours: '24',
    route: '',

    protein_g_per_kg_day: '',

    dextrose_percent: '',

    lipid_g_per_kg_day: '',
    lipid_concentration: '20',
    lipid_duration_hours: '24',
    lipid_piggyback: false,
    lipid_separate_line: true,

    sodium_meq_kg_day: '',
    potassium_meq_kg_day: '',
    calcium_mg_kg_day: '',
    magnesium_meq_kg_day: '',
    phosphorus_mmol_kg_day: '',

    trace_elements_ml_kg_day: '',
    multivitamins_ml_day: '',
    heparin_ml: '',
    heparin_iu_per_ml: '',

    use_osmolarity_calculator: false,

    osmolarity_ppn_solution: '',
    osmolarity_ppn_volume_ml: '',
    osmolarity_ppn_lock_total_volume: 'no',

    osmolarity_amino_acid_10_grams: '',
    osmolarity_amino_acid_15_grams: '',
    osmolarity_dextrose_concentration: '',
    osmolarity_dextrose_grams: '',
    osmolarity_hepatamine_8_grams: '',
    osmolarity_lipid_10_ml: '',
    osmolarity_lipid_20_ml: '',
    osmolarity_novamine_15_grams: '',
    osmolarity_sterile_water_ml: '',

    osmolarity_calcium_gluconate_10_ml: '',
    osmolarity_calcium_chloride_10_ml: '',
    osmolarity_magnesium_sulfate_ml: '',
    osmolarity_multi_trace_elements_ml: '',
    osmolarity_multivitamin_12_ml: '',
    osmolarity_potassium_acetate_ml: '',
    osmolarity_potassium_chloride_ml: '',
    osmolarity_potassium_phosphate_ml: '',
    osmolarity_sodium_acetate_ml: '',
    osmolarity_sodium_bicarbonate_4_2_ml: '',
    osmolarity_sodium_bicarbonate_7_5_ml: '',
    osmolarity_sodium_bicarbonate_8_4_ml: '',
    osmolarity_sodium_chloride_14_6_ml: '',
    osmolarity_sodium_chloride_23_4_ml: '',
    osmolarity_sodium_phosphate_ml: '',

    osmolarity_notes: '',
    osmolarity_inputs_json: '',
    osmolarity_computed_mosm_l: '',
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

export type OsmolarityOption = {
    label: string;
    value: string;
};

export const osmolarityPpnSolutionOptions: OsmolarityOption[] = [
    { label: 'D5W', value: 'd5w' },
    { label: '0.9% NaCl', value: 'normal_saline_0_9' },
    { label: 'D5 0.45% NaCl', value: 'd5_half_normal_saline' },
    { label: 'D5 0.9% NaCl', value: 'd5_normal_saline' },
    { label: '0.45% NaCl', value: 'half_normal_saline' },
    { label: 'D10W', value: 'd10w' },
    { label: 'Lactated Ringer’s', value: 'lactated_ringers' },
    { label: 'D5 Lactated Ringer’s', value: 'd5_lactated_ringers' },
    { label: 'Sterile Water', value: 'sterile_water' },
];

export const osmolarityLockTotalVolumeOptions: OsmolarityOption[] = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
];

export const osmolarityDextroseConcentrationOptions: OsmolarityOption[] = [
    { label: 'Dextrose 6%', value: '6' },
    { label: 'Dextrose 10%', value: '10' },
    { label: 'Dextrose 20%', value: '20' },
    { label: 'Dextrose 30%', value: '30' },
    { label: 'Dextrose 40%', value: '40' },
    { label: 'Dextrose 50%', value: '50' },
    { label: 'Dextrose 70%', value: '70' },
];

export const osmolarityTpnMacronutrientFields: OsmolarityOption[] = [
    { label: 'Amino Acids 10%', value: 'osmolarity_amino_acid_10_grams' },
    { label: 'Amino Acids 15%', value: 'osmolarity_amino_acid_15_grams' },
    { label: 'Dextrose Amount', value: 'osmolarity_dextrose_grams' },
    { label: 'Hepatamine 8%', value: 'osmolarity_hepatamine_8_grams' },
    { label: 'Lipid 10%', value: 'osmolarity_lipid_10_ml' },
    { label: 'Lipid 20%', value: 'osmolarity_lipid_20_ml' },
    { label: 'Novamine 15%', value: 'osmolarity_novamine_15_grams' },
    { label: 'Sterile Water', value: 'osmolarity_sterile_water_ml' },
];

export const osmolarityAdditiveFields: OsmolarityOption[] = [
    {
        label: 'Calcium Gluconate 10%',
        value: 'osmolarity_calcium_gluconate_10_ml',
    },
    {
        label: 'Calcium Chloride 10%',
        value: 'osmolarity_calcium_chloride_10_ml',
    },
    {
        label: 'Magnesium Sulfate',
        value: 'osmolarity_magnesium_sulfate_ml',
    },
    {
        label: 'Multi-Trace Elements',
        value: 'osmolarity_multi_trace_elements_ml',
    },
    {
        label: 'Multivitamin 12',
        value: 'osmolarity_multivitamin_12_ml',
    },
    {
        label: 'Potassium Acetate',
        value: 'osmolarity_potassium_acetate_ml',
    },
    {
        label: 'Potassium Chloride',
        value: 'osmolarity_potassium_chloride_ml',
    },
    {
        label: 'Potassium Phosphate',
        value: 'osmolarity_potassium_phosphate_ml',
    },
    {
        label: 'Sodium Acetate',
        value: 'osmolarity_sodium_acetate_ml',
    },
    {
        label: 'Sodium Bicarbonate 4.2%',
        value: 'osmolarity_sodium_bicarbonate_4_2_ml',
    },
    {
        label: 'Sodium Bicarbonate 7.5%',
        value: 'osmolarity_sodium_bicarbonate_7_5_ml',
    },
    {
        label: 'Sodium Bicarbonate 8.4%',
        value: 'osmolarity_sodium_bicarbonate_8_4_ml',
    },
    {
        label: 'Sodium Chloride 14.6%',
        value: 'osmolarity_sodium_chloride_14_6_ml',
    },
    {
        label: 'Sodium Chloride 23.4%',
        value: 'osmolarity_sodium_chloride_23_4_ml',
    },
    {
        label: 'Sodium Phosphate',
        value: 'osmolarity_sodium_phosphate_ml',
    },
];

export function getPatientName(
    order: Pick<
        TpnOrderFormData,
        'last_name' | 'first_name' | 'middle_name' | 'suffix'
    >,
) {
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
    return birthWeightKg;
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

    const factor = 10 ** decimals;

    return (Math.round((value + Number.EPSILON) * factor) / factor).toFixed(
        decimals,
    );
}

export function formatVolumeNumber(value: number | null): string {
    return formatComputedNumber(value, 1);
}

export function calculatePerKgPerDay(dose: string, weightKg: string): string {
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

export function calculateVolumeByPercentConcentration(
    contents: string,
    concentrationPercent: string,
): string {
    const contentsValue = toSafeNumber(contents);
    const concentration = toSafeNumber(concentrationPercent);

    if (
        contentsValue === null ||
        concentration === null ||
        contentsValue <= 0 ||
        concentration <= 0
    ) {
        return '';
    }

    const amountPerMl = concentration / 100;

    return formatVolumeNumber(contentsValue / amountPerMl);
}

export function calculateProteinVolumeMl(
    proteinGramsPerDay: string,
    aminoAcidConcentrationPercent = '6',
): string {
    return calculateVolumeByPercentConcentration(
        proteinGramsPerDay,
        aminoAcidConcentrationPercent,
    );
}

export function calculateDextroseVolumeMl(
    totalFluidMl: string,
    dextrosePercent: string,
): string {
    const totalFluid = toSafeNumber(totalFluidMl);
    const dextrose = toSafeNumber(dextrosePercent);

    if (
        totalFluid === null ||
        dextrose === null ||
        totalFluid <= 0 ||
        dextrose <= 0
    ) {
        return '';
    }

    const factor = dextrose / 50;

    return formatVolumeNumber(totalFluid * factor);
}

export function calculateLipidVolumeMl(
    lipidGramsPerDay: string,
    lipidConcentration: string,
): string {
    return calculateVolumeByPercentConcentration(
        lipidGramsPerDay,
        lipidConcentration,
    );
}

export function calculateLipidBottleVolumeMl(lipidVolumeMl: string): string {
    const volume = toSafeNumber(lipidVolumeMl);

    if (volume === null || volume <= 0) {
        return '';
    }

    return formatVolumeNumber(volume * 1.2);
}

export function calculateVolumeByStockConcentration(
    requirementPerDay: string,
    stockConcentrationPerMl: string,
): string {
    const requirement = toSafeNumber(requirementPerDay);
    const stockConcentration = toSafeNumber(stockConcentrationPerMl);

    if (
        requirement === null ||
        stockConcentration === null ||
        requirement <= 0 ||
        stockConcentration <= 0
    ) {
        return '';
    }

    return formatVolumeNumber(requirement / stockConcentration);
}

export function calculateCalciumContentPerDay(
    calciumDose: string,
    weightKg: string,
): string {
    return calculatePerKgPerDay(calciumDose, weightKg);
}

export function calculateSodiumVolumeMl(sodiumMeqPerDay: string): string {
    return calculateVolumeByStockConcentration(sodiumMeqPerDay, '2.5');
}

export function calculatePotassiumVolumeMl(potassiumMeqPerDay: string): string {
    return calculateVolumeByStockConcentration(potassiumMeqPerDay, '2');
}

export function calculateCalciumVolumeMl(calciumMeqPerDay: string): string {
    return calculateVolumeByStockConcentration(calciumMeqPerDay, '100');
}

export function calculateMagnesiumVolumeMl(magnesiumMeqPerDay: string): string {
    return calculateVolumeByStockConcentration(magnesiumMeqPerDay, '1');
}

export function calculatePhosphorusVolumeMl(
    phosphorusMmolPerDay: string,
): string {
    return calculateVolumeByStockConcentration(phosphorusMmolPerDay, '3');
}

export function calculateRateMlPerHour(
    volumeMl: string,
    durationHours: string,
): string {
    const volume = toSafeNumber(volumeMl);
    const duration = toSafeNumber(durationHours);

    if (volume === null || duration === null || volume <= 0 || duration <= 0) {
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

    if (dextrose === null || lipid === null || weight === null || weight <= 0) {
        return '';
    }

    return formatComputedNumber((dextrose + lipid) / weight);
}

export function calculateQsVolumeMl(
    totalFluidMl: string,
    volumes: string[],
): string {
    const totalFluid = toSafeNumber(totalFluidMl);

    if (totalFluid === null || totalFluid <= 0) {
        return '';
    }

    const totalIngredientVolume = volumes.reduce((sum, volume) => {
        const parsedVolume = toSafeNumber(volume);

        if (parsedVolume === null || parsedVolume <= 0) {
            return sum;
        }

        return sum + parsedVolume;
    }, 0);

    const qsVolume = totalFluid - totalIngredientVolume;

    if (qsVolume < 0) {
        return formatVolumeNumber(qsVolume);
    }

    return formatVolumeNumber(qsVolume);
}

const OSMOLARITY_PPN_BASE_MOSM_PER_L: Record<string, number> = {
    d5w: 250,
    normal_saline_0_9: 308,
    d5_half_normal_saline: 404,
    d5_normal_saline: 558,
    half_normal_saline: 154,
    d10w: 500,
    lactated_ringers: 273,
    d5_lactated_ringers: 523,
    sterile_water: 0,
};

const OSMOLARITY_MACRONUTRIENT_MOSM: Record<string, number> = {
    amino_acid_per_gram: 10,
    dextrose_per_gram: 5,
    lipid_per_ml: 0.28,
};

const OSMOLARITY_ADDITIVE_MOSM_PER_ML: Record<string, number> = {
    osmolarity_calcium_gluconate_10_ml: 0.65,
    osmolarity_calcium_chloride_10_ml: 1.9,
    osmolarity_magnesium_sulfate_ml: 4,
    osmolarity_multi_trace_elements_ml: 0,
    osmolarity_multivitamin_12_ml: 0,
    osmolarity_potassium_acetate_ml: 4,
    osmolarity_potassium_chloride_ml: 4,
    osmolarity_potassium_phosphate_ml: 7.4,
    osmolarity_sodium_acetate_ml: 4,
    osmolarity_sodium_bicarbonate_4_2_ml: 1,
    osmolarity_sodium_bicarbonate_7_5_ml: 1.8,
    osmolarity_sodium_bicarbonate_8_4_ml: 2,
    osmolarity_sodium_chloride_14_6_ml: 5,
    osmolarity_sodium_chloride_23_4_ml: 8,
    osmolarity_sodium_phosphate_ml: 7,
};

function toOsmolarityNumber(value: string | number | boolean | null | undefined): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
        return 0;
    }

    return parsed;
}

function calculateVolumeFromPercentConcentration(
    amountGrams: string,
    concentrationPercent: string,
): number {
    const grams = toOsmolarityNumber(amountGrams);
    const percent = toOsmolarityNumber(concentrationPercent);

    if (grams <= 0 || percent <= 0) {
        return 0;
    }

    return grams / (percent / 100);
}

function calculateOsmolarityAdditiveOsmoles(data: TpnOrderFormData): number {
    return Object.entries(OSMOLARITY_ADDITIVE_MOSM_PER_ML).reduce(
        (total, [field, multiplier]) => {
            const volumeMl = toOsmolarityNumber(
                data[field as keyof TpnOrderFormData],
            );

            return total + volumeMl * multiplier;
        },
        0,
    );
}

function calculateOsmolarityAdditiveVolumeMl(data: TpnOrderFormData): number {
    return Object.keys(OSMOLARITY_ADDITIVE_MOSM_PER_ML).reduce(
        (total, field) => {
            return (
                total +
                toOsmolarityNumber(data[field as keyof TpnOrderFormData])
            );
        },
        0,
    );
}

function calculateTpnComponentVolumeMl(data: TpnOrderFormData): number {
    const aminoAcid10Volume = calculateVolumeFromPercentConcentration(
        data.osmolarity_amino_acid_10_grams,
        '10',
    );

    const aminoAcid15Volume = calculateVolumeFromPercentConcentration(
        data.osmolarity_amino_acid_15_grams,
        '15',
    );

    const dextroseVolume = calculateVolumeFromPercentConcentration(
        data.osmolarity_dextrose_grams,
        data.osmolarity_dextrose_concentration || '50',
    );

    const hepatamineVolume = calculateVolumeFromPercentConcentration(
        data.osmolarity_hepatamine_8_grams,
        '8',
    );

    const novamineVolume = calculateVolumeFromPercentConcentration(
        data.osmolarity_novamine_15_grams,
        '15',
    );

    const lipid10Volume = toOsmolarityNumber(data.osmolarity_lipid_10_ml);
    const lipid20Volume = toOsmolarityNumber(data.osmolarity_lipid_20_ml);
    const sterileWaterVolume = toOsmolarityNumber(
        data.osmolarity_sterile_water_ml,
    );

    return (
        aminoAcid10Volume +
        aminoAcid15Volume +
        dextroseVolume +
        hepatamineVolume +
        novamineVolume +
        lipid10Volume +
        lipid20Volume +
        sterileWaterVolume
    );
}

function calculateTpnMacronutrientOsmoles(data: TpnOrderFormData): number {
    const aminoAcidGrams =
        toOsmolarityNumber(data.osmolarity_amino_acid_10_grams) +
        toOsmolarityNumber(data.osmolarity_amino_acid_15_grams) +
        toOsmolarityNumber(data.osmolarity_hepatamine_8_grams) +
        toOsmolarityNumber(data.osmolarity_novamine_15_grams);

    const dextroseGrams = toOsmolarityNumber(data.osmolarity_dextrose_grams);

    const lipidVolumeMl =
        toOsmolarityNumber(data.osmolarity_lipid_10_ml) +
        toOsmolarityNumber(data.osmolarity_lipid_20_ml);

    return (
        aminoAcidGrams *
        OSMOLARITY_MACRONUTRIENT_MOSM.amino_acid_per_gram +
        dextroseGrams *
        OSMOLARITY_MACRONUTRIENT_MOSM.dextrose_per_gram +
        lipidVolumeMl * OSMOLARITY_MACRONUTRIENT_MOSM.lipid_per_ml
    );
}

export function calculateGlobalRphStyleOsmolarity(
    data: TpnOrderFormData,
    fallbackTotalFluidMl: string | number = data.total_fluid_ml,
): string {
    const isPeripheral = data.route === 'Peripheral Line';

    const additiveOsmoles = calculateOsmolarityAdditiveOsmoles(data);
    const additiveVolumeMl = calculateOsmolarityAdditiveVolumeMl(data);

    if (isPeripheral) {
        const selectedSolution = data.osmolarity_ppn_solution || 'd10w';
        const baseOsmolarity =
            OSMOLARITY_PPN_BASE_MOSM_PER_L[selectedSolution] ?? 0;

        const baseVolumeMl =
            toOsmolarityNumber(data.osmolarity_ppn_volume_ml) ||
            toOsmolarityNumber(fallbackTotalFluidMl);

        if (baseVolumeMl <= 0) {
            return '';
        }

        const shouldLockTotalVolume =
            data.osmolarity_ppn_lock_total_volume !== 'no';

        const finalVolumeMl = shouldLockTotalVolume
            ? baseVolumeMl
            : baseVolumeMl + additiveVolumeMl;

        if (finalVolumeMl <= 0) {
            return '';
        }

        const baseOsmoles = baseOsmolarity * (baseVolumeMl / 1000);
        const totalOsmoles = baseOsmoles + additiveOsmoles;

        return formatComputedNumber(totalOsmoles / (finalVolumeMl / 1000));
    }

    const calculatedTpnVolumeMl =
        calculateTpnComponentVolumeMl(data) + additiveVolumeMl;

    const fallbackVolumeMl = toOsmolarityNumber(fallbackTotalFluidMl);

    const finalVolumeMl =
        calculatedTpnVolumeMl > 0 ? calculatedTpnVolumeMl : fallbackVolumeMl;

    if (finalVolumeMl <= 0) {
        return '';
    }

    const totalOsmoles =
        calculateTpnMacronutrientOsmoles(data) + additiveOsmoles;

    return formatComputedNumber(totalOsmoles / (finalVolumeMl / 1000));
}

export function calculateOsmolarity(
    proteinGramsPerDay: string | number,
    dextroseGramsPerDay: string | number,
    sodiumMeqPerDay: string | number,
    potassiumMeqPerDay: string | number,
    magnesiumMeqPerDay: string | number,
    calciumMgPerDay: string | number,
    totalFluidMl: string | number,
): string {
    const protein = Number(proteinGramsPerDay) || 0;
    const dextrose = Number(dextroseGramsPerDay) || 0;
    const sodium = Number(sodiumMeqPerDay) || 0;
    const potassium = Number(potassiumMeqPerDay) || 0;
    const magnesium = Number(magnesiumMeqPerDay) || 0;
    const calciumMg = Number(calciumMgPerDay) || 0;

    const totalFluidLiters = (Number(totalFluidMl) || 0) / 1000;

    if (totalFluidLiters <= 0) return '';

    // GlobalRPH Standard Multipliers
    const proteinOsm = protein * 10;
    const dextroseOsm = dextrose * 5;
    const sodiumOsm = sodium * 2;
    const potassiumOsm = potassium * 2;
    const magnesiumOsm = magnesium * 1;

    // GlobalRPH uses mEq for Calcium Gluconate (1 mEq = ~93mg)
    const calciumOsm = (calciumMg / 93) * 1.4;

    const totalOsmoles = proteinOsm + dextroseOsm + sodiumOsm + potassiumOsm + magnesiumOsm + calciumOsm;

    return formatComputedNumber(totalOsmoles / totalFluidLiters);
}

export function findOrderById(id: number) {
    return initialOrders.find((order) => order.id === id) ?? null;
}
