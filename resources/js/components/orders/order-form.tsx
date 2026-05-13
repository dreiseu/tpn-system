import {
    useEffect,
    useMemo,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
    calculateAge,
    calculateBmi,
    calculateDextroseCalories,
    calculateDextroseGramsPerDay,
    calculateGir,
    calculateInfusionRate,
    calculateLipidCalories,
    calculateProteinVolumeMl,
    calculateDextroseVolumeMl,
    calculateLipidVolumeMl,
    calculateLipidBottleVolumeMl,
    calculateSodiumVolumeMl,
    calculatePotassiumVolumeMl,
    calculateCalciumVolumeMl,
    calculateCalciumContentPerDay,
    calculateMagnesiumVolumeMl,
    calculatePhosphorusVolumeMl,
    calculatePerKgPerDay,
    calculateProteinCalories,
    calculateRateMlPerHour,
    calculateTotalNonProteinCaloriesPerKgDay,
    calculateGlobalRphStyleOsmolarity,
    getPatientName,
    initialOrderFormData,
    orderTabs,
    resolveWeightForComputation,
    calculateQsVolumeMl,
    osmolarityPpnSolutionOptions,
    osmolarityLockTotalVolumeOptions,
    osmolarityDextroseConcentrationOptions,
    osmolarityTpnMacronutrientFields,
    osmolarityAdditiveFields,
    type OrderTabKey,
    type TpnOrder,
    type TpnOrderFormData,
} from '@/types/orders';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type OrderFormProps = {
    initialData?: Partial<TpnOrder>;
    submitLabel?: string;
    isSubmitting?: boolean;
    onCancel: () => void;
    onSubmit: (data: TpnOrderFormData) => void;
};

export function OrderForm({
    initialData,
    submitLabel = 'Submit for Review',
    isSubmitting = false,
    onCancel,
    onSubmit,
}: OrderFormProps) {
    const [data, setData] = useState<TpnOrderFormData>({
        ...initialOrderFormData,
        ...initialData,
    });

    const [activeTab, setActiveTab] = useState<OrderTabKey>('patient');

    const [attemptedRequiredFields, setAttemptedRequiredFields] = useState<
        Partial<Record<keyof TpnOrderFormData, boolean>>
    >({});

    useEffect(() => {
        setData({
            ...initialOrderFormData,
            ...initialData,
        });

        setActiveTab('patient');
        setAttemptedRequiredFields({});
    }, [initialData]);

    const computedAge = useMemo(() => {
        return calculateAge(data.date_of_birth);
    }, [data.date_of_birth]);

    const computedWeightKg = useMemo(() => {
        return resolveWeightForComputation(
            data.birth_weight_kg,
            data.current_weight_kg,
        );
    }, [data.birth_weight_kg, data.current_weight_kg]);

    const computedBmi = useMemo(() => {
        return calculateBmi(data.height_cm, computedWeightKg);
    }, [data.height_cm, computedWeightKg]);

    const computedRateMlPerHour = useMemo(() => {
        return calculateInfusionRate(data.total_fluid_ml, data.duration_hours);
    }, [data.total_fluid_ml, data.duration_hours]);

    const proteinGramsPerDay = useMemo(() => {
        return calculatePerKgPerDay(
            data.protein_g_per_kg_day,
            computedWeightKg,
        );
    }, [data.protein_g_per_kg_day, computedWeightKg]);

    const proteinVolumeMl = useMemo(() => {
        return calculateProteinVolumeMl(proteinGramsPerDay);
    }, [proteinGramsPerDay]);

    const dextroseGramsPerDay = useMemo(() => {
        return calculateDextroseGramsPerDay(
            data.total_fluid_ml,
            data.dextrose_percent,
        );
    }, [data.total_fluid_ml, data.dextrose_percent]);

    const dextroseVolumeMl = useMemo(() => {
        return calculateDextroseVolumeMl(
            data.total_fluid_ml,
            data.dextrose_percent,
        );
    }, [data.total_fluid_ml, data.dextrose_percent]);

    const gir = useMemo(() => {
        return calculateGir(
            dextroseGramsPerDay,
            computedWeightKg,
            data.duration_hours,
        );
    }, [dextroseGramsPerDay, computedWeightKg, data.duration_hours]);

    const lipidGramsPerDay = useMemo(() => {
        return calculatePerKgPerDay(data.lipid_g_per_kg_day, computedWeightKg);
    }, [data.lipid_g_per_kg_day, computedWeightKg]);

    const lipidVolumeMl = useMemo(() => {
        return calculateLipidVolumeMl(
            lipidGramsPerDay,
            data.lipid_concentration,
        );
    }, [lipidGramsPerDay, data.lipid_concentration]);

    const lipidBottleVolumeMl = useMemo(() => {
        return calculateLipidBottleVolumeMl(lipidVolumeMl);
    }, [lipidVolumeMl]);

    const lipidRateMlPerHour = useMemo(() => {
        return calculateRateMlPerHour(lipidVolumeMl, data.lipid_duration_hours);
    }, [lipidVolumeMl, data.lipid_duration_hours]);

    const sodiumMeqPerDay = useMemo(() => {
        return calculatePerKgPerDay(data.sodium_meq_kg_day, computedWeightKg);
    }, [data.sodium_meq_kg_day, computedWeightKg]);

    const potassiumMeqPerDay = useMemo(() => {
        return calculatePerKgPerDay(
            data.potassium_meq_kg_day,
            computedWeightKg,
        );
    }, [data.potassium_meq_kg_day, computedWeightKg]);

    const calciumMgPerDay = useMemo(() => {
        return calculateCalciumContentPerDay(
            data.calcium_mg_kg_day,
            computedWeightKg,
        );
    }, [data.calcium_mg_kg_day, computedWeightKg]);

    const magnesiumMeqPerDay = useMemo(() => {
        return calculatePerKgPerDay(
            data.magnesium_meq_kg_day,
            computedWeightKg,
        );
    }, [data.magnesium_meq_kg_day, computedWeightKg]);

    const phosphorusMmolPerDay = useMemo(() => {
        return calculatePerKgPerDay(
            data.phosphorus_mmol_kg_day,
            computedWeightKg,
        );
    }, [data.phosphorus_mmol_kg_day, computedWeightKg]);

    const sodiumVolumeMl = useMemo(() => {
        return calculateSodiumVolumeMl(sodiumMeqPerDay);
    }, [sodiumMeqPerDay]);

    const potassiumVolumeMl = useMemo(() => {
        return calculatePotassiumVolumeMl(potassiumMeqPerDay);
    }, [potassiumMeqPerDay]);

    const calciumVolumeMl = useMemo(() => {
        return calculateCalciumVolumeMl(calciumMgPerDay);
    }, [calciumMgPerDay]);

    const magnesiumVolumeMl = useMemo(() => {
        return calculateMagnesiumVolumeMl(magnesiumMeqPerDay);
    }, [magnesiumMeqPerDay]);

    const phosphorusVolumeMl = useMemo(() => {
        return calculatePhosphorusVolumeMl(phosphorusMmolPerDay);
    }, [phosphorusMmolPerDay]);

    const traceElementsMlPerDay = useMemo(() => {
        return data.trace_elements_ml_kg_day;
    }, [data.trace_elements_ml_kg_day]);

    const traceElementsVolumeMl = useMemo(() => {
        return formatVolumeDisplay(traceElementsMlPerDay);
    }, [traceElementsMlPerDay]);

    const dextroseCalories = useMemo(() => {
        return calculateDextroseCalories(dextroseGramsPerDay);
    }, [dextroseGramsPerDay]);

    const proteinCalories = useMemo(() => {
        return calculateProteinCalories(proteinGramsPerDay);
    }, [proteinGramsPerDay]);

    const lipidCalories = useMemo(() => {
        return calculateLipidCalories(lipidGramsPerDay);
    }, [lipidGramsPerDay]);

    const totalNonProteinCaloriesPerKgDay = useMemo(() => {
        return calculateTotalNonProteinCaloriesPerKgDay(
            dextroseCalories,
            lipidCalories,
            computedWeightKg,
        );
    }, [dextroseCalories, lipidCalories, computedWeightKg]);

    const multivitaminsVolumeMl = useMemo(() => {
        return formatVolumeDisplay(data.multivitamins_ml_day);
    }, [data.multivitamins_ml_day]);

    const heparinTotalIu = useMemo(() => {
        const ml = Number(data.heparin_ml) || 0;
        const iuPerMl = Number(data.heparin_iu_per_ml) || 0;
        const total = ml * iuPerMl;
        return total > 0 ? total.toFixed(2) : '';
    }, [data.heparin_ml, data.heparin_iu_per_ml]);

    const lipidVolumeForQs = data.lipid_piggyback ? lipidVolumeMl : '';

    const qsVolumeMl = useMemo(() => {
        return calculateQsVolumeMl(data.total_fluid_ml, [
            proteinVolumeMl,
            dextroseVolumeMl,
            lipidVolumeForQs,
            sodiumVolumeMl,
            potassiumVolumeMl,
            calciumVolumeMl,
            magnesiumVolumeMl,
            phosphorusVolumeMl,
            traceElementsVolumeMl,
            multivitaminsVolumeMl,
            data.heparin_ml,
        ]);
    }, [
        data.total_fluid_ml,
        proteinVolumeMl,
        dextroseVolumeMl,
        lipidVolumeForQs,
        sodiumVolumeMl,
        potassiumVolumeMl,
        calciumVolumeMl,
        magnesiumVolumeMl,
        phosphorusVolumeMl,
        traceElementsVolumeMl,
        multivitaminsVolumeMl,
        data.heparin_ml,
    ]);

    const effectiveOsmolarityData = useMemo<TpnOrderFormData>(() => {
        const useOverrideOrComputed = (
            overrideValue: string,
            computedValue: string,
        ) => {
            return String(overrideValue ?? '').trim() !== ''
                ? overrideValue
                : computedValue;
        };

        const lipid10VolumeMl =
            data.lipid_concentration === '10' ? lipidVolumeMl : '';

        const lipid20VolumeMl =
            data.lipid_concentration === '20' ? lipidVolumeMl : '';

        const sterileWaterVolumeMl =
            String(data.sterile_water_level_ml_day ?? '').trim() !== ''
                ? data.sterile_water_level_ml_day
                : qsVolumeMl;

        return {
            ...data,

            osmolarity_ppn_volume_ml: useOverrideOrComputed(
                data.osmolarity_ppn_volume_ml,
                data.total_fluid_ml,
            ),

            osmolarity_amino_acid_10_grams: useOverrideOrComputed(
                data.osmolarity_amino_acid_10_grams,
                proteinGramsPerDay,
            ),

            osmolarity_dextrose_concentration: useOverrideOrComputed(
                data.osmolarity_dextrose_concentration,
                data.dextrose_percent,
            ),

            osmolarity_dextrose_grams: useOverrideOrComputed(
                data.osmolarity_dextrose_grams,
                dextroseGramsPerDay,
            ),

            osmolarity_lipid_10_ml: useOverrideOrComputed(
                data.osmolarity_lipid_10_ml,
                lipid10VolumeMl,
            ),

            osmolarity_lipid_20_ml: useOverrideOrComputed(
                data.osmolarity_lipid_20_ml,
                lipid20VolumeMl,
            ),

            osmolarity_sterile_water_ml: useOverrideOrComputed(
                data.osmolarity_sterile_water_ml,
                sterileWaterVolumeMl,
            ),

            osmolarity_calcium_gluconate_10_ml: useOverrideOrComputed(
                data.osmolarity_calcium_gluconate_10_ml,
                calciumVolumeMl,
            ),

            osmolarity_magnesium_sulfate_ml: useOverrideOrComputed(
                data.osmolarity_magnesium_sulfate_ml,
                magnesiumVolumeMl,
            ),

            osmolarity_multi_trace_elements_ml: useOverrideOrComputed(
                data.osmolarity_multi_trace_elements_ml,
                traceElementsVolumeMl,
            ),

            osmolarity_multivitamin_12_ml: useOverrideOrComputed(
                data.osmolarity_multivitamin_12_ml,
                multivitaminsVolumeMl,
            ),

            osmolarity_potassium_chloride_ml: useOverrideOrComputed(
                data.osmolarity_potassium_chloride_ml,
                potassiumVolumeMl,
            ),

            osmolarity_sodium_chloride_14_6_ml: useOverrideOrComputed(
                data.osmolarity_sodium_chloride_14_6_ml,
                sodiumVolumeMl,
            ),

            osmolarity_sodium_phosphate_ml: useOverrideOrComputed(
                data.osmolarity_sodium_phosphate_ml,
                phosphorusVolumeMl,
            ),
        };
    }, [
        data,
        proteinGramsPerDay,
        dextroseGramsPerDay,
        lipidVolumeMl,
        qsVolumeMl,
        sodiumVolumeMl,
        potassiumVolumeMl,
        calciumVolumeMl,
        magnesiumVolumeMl,
        phosphorusVolumeMl,
        traceElementsVolumeMl,
        multivitaminsVolumeMl,
    ]);

    const useOsmolarityCalculator = data.use_osmolarity_calculator === true;

    const computedOsmolarity = useMemo(() => {
        if (!useOsmolarityCalculator) {
            return '';
        }

        return calculateGlobalRphStyleOsmolarity(
            effectiveOsmolarityData,
            data.total_fluid_ml,
        );
    }, [
        useOsmolarityCalculator,
        effectiveOsmolarityData,
        data.total_fluid_ml,
    ]);

    const isPeripheralDanger =
        useOsmolarityCalculator &&
        data.route === 'Peripheral Line' &&
        Number(computedOsmolarity) >= 900;

    const currentTabIndex = orderTabs.findIndex((tab) => tab.key === activeTab);
    const isFirstTab = currentTabIndex === 0;
    const isLastTab = currentTabIndex === orderTabs.length - 1;

    const requiredFieldsByTab: Record<
        OrderTabKey,
        Array<keyof TpnOrderFormData>
    > = {
        patient: ['last_name', 'first_name'],
        clinical: ['current_weight_kg'],
        requirements: ['total_fluid_ml', 'duration_hours', 'route'],
        computation: [],
        review: [],
    };

    const requiredFieldLabels: Partial<Record<keyof TpnOrderFormData, string>> =
    {
        last_name: 'Last name',
        first_name: 'First name',
        current_weight_kg: 'Current weight',
        total_fluid_ml: 'Total fluid',
        duration_hours: 'Duration',
        route: 'Infusion Route',
    };

    function isRequiredFieldEmpty(field: keyof TpnOrderFormData) {
        const value = data[field];

        if (typeof value === 'boolean') {
            return false;
        }

        return String(value ?? '').trim() === '';
    }

    function getMissingRequiredFields(tab: OrderTabKey) {
        return requiredFieldsByTab[tab].filter((field) =>
            isRequiredFieldEmpty(field),
        );
    }

    function markRequiredFieldsAsAttempted(
        fields: Array<keyof TpnOrderFormData>,
    ) {
        setAttemptedRequiredFields((current) => {
            const next = { ...current };

            fields.forEach((field) => {
                next[field] = true;
            });

            return next;
        });
    }

    function fieldHasError(field: keyof TpnOrderFormData) {
        return (
            attemptedRequiredFields[field] === true &&
            isRequiredFieldEmpty(field)
        );
    }

    function getFieldErrorClass(field: keyof TpnOrderFormData) {
        return fieldHasError(field)
            ? 'border-red-500 bg-red-50 focus-visible:ring-red-500'
            : '';
    }

    function getFieldErrorMessage(field: keyof TpnOrderFormData) {
        if (!fieldHasError(field)) {
            return undefined;
        }

        return `${requiredFieldLabels[field] ?? 'This field'} is required.`;
    }

    function updateField<K extends keyof TpnOrderFormData>(
        field: K,
        value: TpnOrderFormData[K],
    ) {
        setData((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function requestPreviousTab() {
        if (isFirstTab) {
            return;
        }

        setActiveTab(orderTabs[currentTabIndex - 1].key);
    }

    function requestNextTab() {
        const missingFields = getMissingRequiredFields(activeTab);

        if (missingFields.length > 0) {
            markRequiredFieldsAsAttempted(missingFields);
            return;
        }

        if (!isLastTab) {
            setActiveTab(orderTabs[currentTabIndex + 1].key);
        }
    }

    function handleSubmit() {
        const tabsToValidate: OrderTabKey[] = [
            'patient',
            'clinical',
            'requirements',
        ];

        for (const tab of tabsToValidate) {
            const missingFields = getMissingRequiredFields(tab);

            if (missingFields.length > 0) {
                markRequiredFieldsAsAttempted(missingFields);
                setActiveTab(tab);
                return;
            }
        }

        const payload: TpnOrderFormData = {
            ...data,

            osmolarity_inputs_json: useOsmolarityCalculator
                ? JSON.stringify(buildOsmolarityInputsPayload(effectiveOsmolarityData))
                : '',

            osmolarity_computed_mosm_l: useOsmolarityCalculator
                ? computedOsmolarity || ''
                : '',

            osmolarity_notes: useOsmolarityCalculator
                ? data.osmolarity_notes
                : '',
        };

        onSubmit?.(payload);
    }

    const tabContent: Record<OrderTabKey, ReactNode> = {
        patient: (
            <PatientInformationSection
                data={data}
                updateField={updateField}
                computedAge={computedAge}
                getFieldErrorClass={getFieldErrorClass}
                getFieldErrorMessage={getFieldErrorMessage}
            />
        ),
        clinical: (
            <ClinicalDetailsSection
                data={data}
                updateField={updateField}
                computedWeightKg={computedWeightKg}
                computedBmi={computedBmi}
                getFieldErrorClass={getFieldErrorClass}
                getFieldErrorMessage={getFieldErrorMessage}
            />
        ),
        requirements: (
            <TpnRequirementsSection
                data={data}
                updateField={updateField}
                computedRateMlPerHour={computedRateMlPerHour}
                getFieldErrorClass={getFieldErrorClass}
                getFieldErrorMessage={getFieldErrorMessage}
            />
        ),
        computation: (
            <ComputationSection
                data={data}
                effectiveOsmolarityData={effectiveOsmolarityData}
                computedOsmolarity={computedOsmolarity}
                isPeripheralDanger={isPeripheralDanger}
                useOsmolarityCalculator={useOsmolarityCalculator}
                computedWeightKg={computedWeightKg}
                computedRateMlPerHour={computedRateMlPerHour}
                proteinGramsPerDay={proteinGramsPerDay}
                proteinVolumeMl={proteinVolumeMl}
                dextroseGramsPerDay={dextroseGramsPerDay}
                dextroseVolumeMl={dextroseVolumeMl}
                gir={gir}
                lipidGramsPerDay={lipidGramsPerDay}
                lipidVolumeMl={lipidVolumeMl}
                lipidBottleVolumeMl={lipidBottleVolumeMl}
                lipidRateMlPerHour={lipidRateMlPerHour}
                sodiumMeqPerDay={sodiumMeqPerDay}
                potassiumMeqPerDay={potassiumMeqPerDay}
                calciumMgPerDay={calciumMgPerDay}
                magnesiumMeqPerDay={magnesiumMeqPerDay}
                phosphorusMmolPerDay={phosphorusMmolPerDay}
                sodiumVolumeMl={sodiumVolumeMl}
                potassiumVolumeMl={potassiumVolumeMl}
                calciumVolumeMl={calciumVolumeMl}
                magnesiumVolumeMl={magnesiumVolumeMl}
                phosphorusVolumeMl={phosphorusVolumeMl}
                traceElementsMlPerDay={traceElementsMlPerDay}
                traceElementsVolumeMl={traceElementsVolumeMl}
                dextroseCalories={dextroseCalories}
                proteinCalories={proteinCalories}
                lipidCalories={lipidCalories}
                totalNonProteinCaloriesPerKgDay={
                    totalNonProteinCaloriesPerKgDay
                }
                qsVolumeMl={qsVolumeMl}
                multivitaminsVolumeMl={multivitaminsVolumeMl}
                heparinTotalIu={heparinTotalIu}
                updateField={updateField}
            />
        ),
        review: (
            <ReviewSection
                data={data}
                computedOsmolarity={computedOsmolarity}
                isPeripheralDanger={isPeripheralDanger}
                computedAge={computedAge}
                computedWeightKg={computedWeightKg}
                computedBmi={computedBmi}
                computedRateMlPerHour={computedRateMlPerHour}
                proteinGramsPerDay={proteinGramsPerDay}
                proteinCalories={proteinCalories}
                proteinVolumeMl={proteinVolumeMl}
                dextroseGramsPerDay={dextroseGramsPerDay}
                dextroseCalories={dextroseCalories}
                dextroseVolumeMl={dextroseVolumeMl}
                gir={gir}
                lipidGramsPerDay={lipidGramsPerDay}
                lipidVolumeMl={lipidVolumeMl}
                lipidBottleVolumeMl={lipidBottleVolumeMl}
                lipidRateMlPerHour={lipidRateMlPerHour}
                lipidCalories={lipidCalories}
                sodiumMeqPerDay={sodiumMeqPerDay}
                potassiumMeqPerDay={potassiumMeqPerDay}
                calciumMgPerDay={calciumMgPerDay}
                magnesiumMeqPerDay={magnesiumMeqPerDay}
                phosphorusMmolPerDay={phosphorusMmolPerDay}
                sodiumVolumeMl={sodiumVolumeMl}
                potassiumVolumeMl={potassiumVolumeMl}
                calciumVolumeMl={calciumVolumeMl}
                magnesiumVolumeMl={magnesiumVolumeMl}
                phosphorusVolumeMl={phosphorusVolumeMl}
                traceElementsMlPerDay={traceElementsMlPerDay}
                traceElementsVolumeMl={traceElementsVolumeMl}
                totalNonProteinCaloriesPerKgDay={
                    totalNonProteinCaloriesPerKgDay
                }
                qsVolumeMl={qsVolumeMl}
                multivitaminsVolumeMl={multivitaminsVolumeMl}
                heparinTotalIu={heparinTotalIu}
            />
        ),
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 border-b border-border pb-4">
                <div className="grid gap-3 lg:grid-cols-5">
                    {orderTabs.map((tab, index) => {
                        const isActive = tab.key === activeTab;
                        const isCompleted = index < currentTabIndex;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => {
                                    if (index <= currentTabIndex) {
                                        setActiveTab(tab.key);
                                        return;
                                    }

                                    const missingFields =
                                        getMissingRequiredFields(activeTab);

                                    if (missingFields.length > 0) {
                                        markRequiredFieldsAsAttempted(
                                            missingFields,
                                        );
                                        return;
                                    }

                                    setActiveTab(tab.key);
                                }}
                                className={[
                                    'flex min-h-[76px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition',
                                    isActive
                                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                        : isCompleted
                                            ? 'border-primary/30 bg-primary/5 text-foreground'
                                            : 'border-border bg-background text-foreground hover:bg-muted/60',
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                        isActive
                                            ? 'bg-primary-foreground text-primary'
                                            : isCompleted
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground',
                                    ].join(' ')}
                                >
                                    {index + 1}
                                </span>

                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold">
                                        {tab.label}
                                    </span>
                                    <span
                                        className={[
                                            'block truncate text-xs',
                                            isActive
                                                ? 'text-primary-foreground/80'
                                                : 'text-muted-foreground',
                                        ].join(' ')}
                                    >
                                        {isActive
                                            ? 'Current step'
                                            : isCompleted
                                                ? 'Completed'
                                                : tab.description}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-5 pr-2">
                {tabContent[activeTab]}
            </div>

            <div className="relative z-10 shrink-0 border-t border-border bg-background pt-4">
                {getMissingRequiredFields(activeTab).some(
                    (field) => attemptedRequiredFields[field],
                ) ? (
                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        Please complete the required fields before continuing.
                    </div>
                ) : null}

                <div className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        {!isFirstTab ? (
                            <Button
                                variant="outline"
                                type="button"
                                className="cursor-pointer"
                                onClick={requestPreviousTab}
                                disabled={isSubmitting}
                            >
                                Back
                            </Button>
                        ) : null}

                        {isLastTab ? (
                            <div className="flex items-center gap-4">
                                {useOsmolarityCalculator && isPeripheralDanger && (
                                    <span className="text-sm font-semibold text-red-600">
                                        Fix Osmolarity limits to submit
                                    </span>
                                )}
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="cursor-pointer"
                                    disabled={isSubmitting}
                                >
                                    {submitLabel}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                onClick={requestNextTab}
                                className="cursor-pointer"
                                disabled={isSubmitting}
                            >
                                Next
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

type SectionProps = {
    data: TpnOrderFormData;
    updateField: <K extends keyof TpnOrderFormData>(
        field: K,
        value: TpnOrderFormData[K],
    ) => void;
    getFieldErrorClass?: (field: keyof TpnOrderFormData) => string;
    getFieldErrorMessage?: (
        field: keyof TpnOrderFormData,
    ) => string | undefined;
};

type PatientInformationSectionProps = SectionProps & {
    computedAge: string;
};

type ClinicalDetailsSectionProps = SectionProps & {
    computedWeightKg: string;
    computedBmi: string;
};

type TpnRequirementsSectionProps = SectionProps & {
    computedRateMlPerHour: string;
};

type ComputationSectionProps = SectionProps & {
    computedWeightKg: string;
    computedRateMlPerHour: string;
    effectiveOsmolarityData: TpnOrderFormData;
    computedOsmolarity: string;
    isPeripheralDanger: boolean;
    useOsmolarityCalculator: boolean;
    proteinGramsPerDay: string;
    proteinVolumeMl: string;
    dextroseGramsPerDay: string;
    dextroseVolumeMl: string;
    gir: string;
    lipidGramsPerDay: string;
    lipidVolumeMl: string;
    lipidBottleVolumeMl: string;
    lipidRateMlPerHour: string;
    sodiumMeqPerDay: string;
    potassiumMeqPerDay: string;
    calciumMgPerDay: string;
    magnesiumMeqPerDay: string;
    phosphorusMmolPerDay: string;
    sodiumVolumeMl: string;
    potassiumVolumeMl: string;
    calciumVolumeMl: string;
    magnesiumVolumeMl: string;
    phosphorusVolumeMl: string;
    traceElementsMlPerDay: string;
    traceElementsVolumeMl: string;
    dextroseCalories: string;
    proteinCalories: string;
    lipidCalories: string;
    totalNonProteinCaloriesPerKgDay: string;
    qsVolumeMl: string;
    multivitaminsVolumeMl: string;
    heparinTotalIu: string;
};

type ReviewSectionProps = {
    data: TpnOrderFormData;
    computedOsmolarity: string;
    isPeripheralDanger: boolean;
    computedAge: string;
    computedWeightKg: string;
    computedBmi: string;
    computedRateMlPerHour: string;
    proteinGramsPerDay: string;
    proteinVolumeMl: string;
    proteinCalories: string;
    dextroseGramsPerDay: string;
    dextroseVolumeMl: string;
    dextroseCalories: string;
    gir: string;
    lipidGramsPerDay: string;
    lipidVolumeMl: string;
    lipidBottleVolumeMl: string;
    lipidRateMlPerHour: string;
    lipidCalories: string;
    sodiumMeqPerDay: string;
    potassiumMeqPerDay: string;
    calciumMgPerDay: string;
    magnesiumMeqPerDay: string;
    phosphorusMmolPerDay: string;
    sodiumVolumeMl: string;
    potassiumVolumeMl: string;
    calciumVolumeMl: string;
    magnesiumVolumeMl: string;
    phosphorusVolumeMl: string;
    traceElementsMlPerDay: string;
    traceElementsVolumeMl: string;
    totalNonProteinCaloriesPerKgDay: string;
    qsVolumeMl: string;
    multivitaminsVolumeMl: string;
    heparinTotalIu: string;
};

function formatVolumeDisplay(value: string): string {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return '';
    }

    return numericValue.toFixed(2);
}

function formatContentDisplay(value: string): string {
    const numericValue = Number(value);

    return numericValue.toFixed(1);
}

function parseDateString(value: string | null | undefined): Date | undefined {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
}

function formatDateForInput(date: Date | undefined): string {
    if (!date) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateForDisplay(value: string | null | undefined): string {
    const date = parseDateString(value);

    if (!date) {
        return 'Select date of birth';
    }

    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    });
}

function PatientInformationSection({
    data,
    computedAge,
    updateField,
    getFieldErrorClass,
    getFieldErrorMessage,
}: PatientInformationSectionProps) {
    const [birthDateDialogOpen, setBirthDateDialogOpen] = useState(false);
    const [draftBirthDate, setDraftBirthDate] = useState<Date | undefined>();

    const selectedBirthDate = parseDateString(data.date_of_birth);

    function openBirthDateDialog() {
        setDraftBirthDate(selectedBirthDate);
        setBirthDateDialogOpen(true);
    }

    function confirmBirthDate() {
        updateField('date_of_birth', formatDateForInput(draftBirthDate));
        setBirthDateDialogOpen(false);
    }

    function clearBirthDate() {
        updateField('date_of_birth', '');
        setDraftBirthDate(undefined);
        setBirthDateDialogOpen(false);
    }

    return (
        <Card className="rounded-lg border-border/80 shadow-sm">
            <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>
                    Encode the patient identity and current hospital location
                    for this TPN request.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Grid>
                    <div style={{ gridColumn: '1 / -1' }}>
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
                        required
                        error={getFieldErrorMessage?.('last_name')}
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Input
                            id="last_name"
                            value={data.last_name}
                            onChange={(event) =>
                                updateField('last_name', event.target.value)
                            }
                            placeholder="Last name"
                            className={getFieldErrorClass?.('last_name')}
                        />
                    </Field>

                    <Field
                        label="First Name"
                        htmlFor="first_name"
                        required
                        error={getFieldErrorMessage?.('first_name')}
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Input
                            id="first_name"
                            value={data.first_name}
                            onChange={(event) =>
                                updateField('first_name', event.target.value)
                            }
                            placeholder="First name"
                            className={getFieldErrorClass?.('first_name')}
                        />
                    </Field>

                    <Field
                        label="Middle Name"
                        htmlFor="middle_name"
                        style={{ gridColumn: 'span 3' }}
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
                        style={{ gridColumn: 'span 3' }}
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
                        style={{ gridColumn: 'span 3' }}
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
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Button
                            id="date_of_birth"
                            type="button"
                            variant="outline"
                            className="h-10 w-full justify-between bg-background px-3 text-left font-normal cursor-pointer"
                            onClick={openBirthDateDialog}
                        >
                            <span
                                className={
                                    data.date_of_birth
                                        ? 'truncate text-foreground'
                                        : 'truncate text-muted-foreground'
                                }
                            >
                                {formatDateForDisplay(data.date_of_birth)}
                            </span>

                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        </Button>

                        <Dialog
                            open={birthDateDialogOpen}
                            onOpenChange={setBirthDateDialogOpen}
                        >
                            <DialogContent className="w-auto max-w-none p-0">
                                <DialogHeader className="border-b px-5 py-4">
                                    <DialogTitle>
                                        Select Date of Birth
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="px-4 py-4">
                                    <Calendar
                                        mode="single"
                                        selected={draftBirthDate}
                                        onSelect={(date) =>
                                            setDraftBirthDate(date)
                                        }
                                        captionLayout="dropdown"
                                        hideNavigation
                                        startMonth={new Date(1900, 0)}
                                        endMonth={
                                            new Date(
                                                new Date().getFullYear(),
                                                11,
                                            )
                                        }
                                        disabled={(date) => date > new Date()}
                                    />
                                </div>

                                <DialogFooter className="border-t px-5 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="cursor-pointer"
                                        onClick={clearBirthDate}
                                    >
                                        Clear
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="cursor-pointer"
                                        onClick={() =>
                                            setBirthDateDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="button"
                                        className="cursor-pointer"
                                        onClick={confirmBirthDate}
                                    >
                                        Apply
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </Field>

                    <Field
                        label="Age"
                        htmlFor="age"
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Input
                            id="age"
                            className="text-center"
                            value={computedAge}
                            placeholder="Auto"
                            readOnly
                        />
                    </Field>

                    <Field
                        label="Sex"
                        htmlFor="sex"
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Select
                            value={data.sex}
                            onValueChange={(value) => updateField('sex', value)}
                        >
                            <SelectTrigger id="sex" className="w-full cursor-pointer">
                                <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    value="Male"
                                    className="cursor-pointer"
                                >
                                    Male
                                </SelectItem>
                                <SelectItem
                                    value="Male"
                                    className="cursor-pointer"
                                >
                                    Female
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field
                        label="Ward"
                        htmlFor="ward"
                        style={{ gridColumn: 'span 3' }}
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
                        style={{ gridColumn: 'span 3' }}
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
                        style={{ gridColumn: 'span 6' }}
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
                                    proceeding to computation, compounding, or
                                    dispensing.
                                </div>
                            </div>
                        </div>
                    ) : null}
                </Grid>
            </CardContent>
        </Card>
    );
}

function ClinicalDetailsSection({
    data,
    computedWeightKg,
    computedBmi,
    updateField,
    getFieldErrorClass,
    getFieldErrorMessage,
}: ClinicalDetailsSectionProps) {
    return (
        <Card className="rounded-lg border-border/80 shadow-sm">
            <CardHeader>
                <CardTitle>Clinical Details</CardTitle>
                <CardDescription>
                    Enter the clinical basis and anthropometric data for the TPN
                    order.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Grid>
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
                        required
                        error={getFieldErrorMessage?.('current_weight_kg')}
                        style={{ gridColumn: 'span 3' }}
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
                            className={getFieldErrorClass?.(
                                'current_weight_kg',
                            )}
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
                </Grid>
            </CardContent>
        </Card>
    );
}

function TpnRequirementsSection({
    data,
    computedRateMlPerHour,
    updateField,
    getFieldErrorClass,
    getFieldErrorMessage,
}: TpnRequirementsSectionProps) {
    return (
        <Card className="rounded-lg border-border/80 shadow-sm">
            <CardHeader>
                <CardTitle>TPN Requirements</CardTitle>
                <CardDescription>
                    Define the target volume, infusion duration, route, and
                    computed hourly rate.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Grid>
                    <Field
                        label="Total Fluid by mL"
                        htmlFor="total_fluid_ml"
                        required
                        error={getFieldErrorMessage?.('total_fluid_ml')}
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
                            className={getFieldErrorClass?.('total_fluid_ml')}
                        />
                    </Field>

                    <Field
                        label="Duration by Hours"
                        htmlFor="duration_hours"
                        required
                        error={getFieldErrorMessage?.('duration_hours')}
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
                            className={getFieldErrorClass?.('duration_hours')}
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
                        required
                        error={getFieldErrorMessage?.('route')}
                        style={{ gridColumn: 'span 3' }}
                    >
                        <Select
                            value={data.route}
                            onValueChange={(value) =>
                                updateField('route', value)
                            }
                        >
                            <SelectTrigger id="route" className={`w-full ${getFieldErrorClass?.('route') ?? ''}`}>
                                <SelectValue placeholder="Select route" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Central Line">
                                    Central Line
                                </SelectItem>
                                <SelectItem value="Peripheral Line">
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
                </Grid>
            </CardContent>
        </Card>
    );
}

function ComputationSection({
    data,
    updateField,
    computedWeightKg,
    computedRateMlPerHour,
    effectiveOsmolarityData,
    computedOsmolarity,
    isPeripheralDanger,
    useOsmolarityCalculator,
    proteinGramsPerDay,
    proteinVolumeMl,
    dextroseGramsPerDay,
    dextroseVolumeMl,
    gir,
    lipidGramsPerDay,
    lipidVolumeMl,
    lipidBottleVolumeMl,
    lipidRateMlPerHour,
    sodiumMeqPerDay,
    potassiumMeqPerDay,
    calciumMgPerDay,
    magnesiumMeqPerDay,
    phosphorusMmolPerDay,
    sodiumVolumeMl,
    potassiumVolumeMl,
    calciumVolumeMl,
    magnesiumVolumeMl,
    phosphorusVolumeMl,
    traceElementsMlPerDay,
    traceElementsVolumeMl,
    dextroseCalories,
    proteinCalories,
    lipidCalories,
    totalNonProteinCaloriesPerKgDay,
    qsVolumeMl,
    multivitaminsVolumeMl,
    heparinTotalIu,
}: ComputationSectionProps) {
    return (
        <div className="space-y-4">
            <Card className="rounded-lg border-border/80 shadow-sm">
                <CardHeader>
                    <CardTitle>Macronutrients</CardTitle>
                    <CardDescription>
                        Encode protein, carbohydrate, and fat targets. The
                        calculated contents and volumes are shown immediately.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 xl:grid-cols-3">
                        <MacronutrientCard title="Protein">
                            <CompactInputRow
                                label="Dose"
                                htmlFor="protein_g_per_kg_day"
                                value={data.protein_g_per_kg_day}
                                unit="g/kg/day"
                                onChange={(value) =>
                                    updateField('protein_g_per_kg_day', value)
                                }
                            />

                            <div className="mt-4 grid gap-2">
                                <ComputationLine
                                    label="Weight Used"
                                    value={computedWeightKg}
                                    unit="kg"
                                />
                                <ComputationLine
                                    label="Contents"
                                    value={proteinGramsPerDay}
                                    unit="g/day"
                                />
                                <ComputationLine
                                    label="Volume"
                                    value={proteinVolumeMl}
                                    unit="mL"
                                />
                            </div>
                        </MacronutrientCard>

                        <MacronutrientCard title="Carbohydrates">
                            <CompactInputRow
                                label="Dextrose"
                                htmlFor="dextrose_percent"
                                value={data.dextrose_percent}
                                unit="%"
                                onChange={(value) =>
                                    updateField('dextrose_percent', value)
                                }
                            />

                            <div className="mt-4 grid gap-2">
                                <ComputationLine
                                    label="IV Rate"
                                    value={computedRateMlPerHour}
                                    unit="mL/hr"
                                />
                                <ComputationLine
                                    label="GIR"
                                    value={gir}
                                    unit="mg/kg/min"
                                />
                                <ComputationLine
                                    label="Contents"
                                    value={dextroseGramsPerDay}
                                    unit="g/day"
                                />
                                <ComputationLine
                                    label="Volume"
                                    value={dextroseVolumeMl}
                                    unit="mL"
                                />
                            </div>
                        </MacronutrientCard>

                        <MacronutrientCard title="Fat">
                            <CompactInputRow
                                label="Dose"
                                htmlFor="lipid_g_per_kg_day"
                                value={data.lipid_g_per_kg_day}
                                unit="g/kg/day"
                                onChange={(value) =>
                                    updateField('lipid_g_per_kg_day', value)
                                }
                            />

                            <div className="mt-3 grid gap-2">
                                <Label>Lipid Concentration</Label>

                                <div className="flex flex-wrap gap-4 rounded-md border border-border/70 bg-background px-3 py-2">
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            checked={
                                                data.lipid_concentration ===
                                                '20'
                                            }
                                            onChange={() =>
                                                updateField(
                                                    'lipid_concentration',
                                                    '20',
                                                )
                                            }
                                        />
                                        20%
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            checked={
                                                data.lipid_concentration ===
                                                '10'
                                            }
                                            onChange={() =>
                                                updateField(
                                                    'lipid_concentration',
                                                    '10',
                                                )
                                            }
                                        />
                                        10%
                                    </label>
                                </div>
                            </div>

                            <div className="mt-3">
                                <CompactInputRow
                                    label="Duration"
                                    htmlFor="lipid_duration_hours"
                                    value={data.lipid_duration_hours}
                                    unit="hours"
                                    onChange={(value) =>
                                        updateField(
                                            'lipid_duration_hours',
                                            value,
                                        )
                                    }
                                />
                            </div>

                            <div className="mt-4 grid gap-2">
                                <ComputationLine
                                    label="Contents"
                                    value={lipidGramsPerDay}
                                    unit="g/day"
                                />
                                <ComputationLine
                                    label="Volume"
                                    value={lipidVolumeMl}
                                    unit="mL"
                                />
                                <ComputationLine
                                    label="Bottle Qty"
                                    value={lipidBottleVolumeMl}
                                    unit="mL"
                                />
                                <ComputationLine
                                    label="Rate"
                                    value={lipidRateMlPerHour}
                                    unit="mL/hr"
                                />
                            </div>

                            <div className="mt-4 grid gap-2 rounded-md border border-border/70 bg-muted/30 p-3">
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={data.lipid_piggyback}
                                        onCheckedChange={(checked) =>
                                            updateField(
                                                'lipid_piggyback',
                                                checked === true,
                                            )
                                        }
                                    />
                                    As Piggyback into PN solution
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={data.lipid_separate_line}
                                        onCheckedChange={(checked) =>
                                            updateField(
                                                'lipid_separate_line',
                                                checked === true,
                                            )
                                        }
                                    />
                                    As Separate IV line
                                </label>
                            </div>
                        </MacronutrientCard>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-lg border-emerald-200 bg-emerald-50 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-emerald-950">
                        Calorie Summary
                    </CardTitle>
                    <CardDescription className="text-emerald-800">
                        Calorie contribution from protein, dextrose, and lipids.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-3 lg:grid-cols-4">
                        <ComputationValue
                            label="Protein Calories"
                            value={proteinCalories}
                            unit="Cal/day"
                        />
                        <ComputationValue
                            label="Dextrose Calories"
                            value={dextroseCalories}
                            unit="Cal/day"
                        />
                        <ComputationValue
                            label="Lipid Calories"
                            value={lipidCalories}
                            unit="Cal/day"
                        />
                        <ComputationValue
                            label="Non-Protein Calories"
                            value={totalNonProteinCaloriesPerKgDay}
                            unit="Cal/kg/day"
                        />
                    </div>

                    <div className="mt-3 rounded-md border border-emerald-200 bg-white/70 px-4 py-2 text-sm text-emerald-900">
                        ((Fat g/day × 9) + (Dextrose g/day × 3.4)) ÷ Weight Used
                        = Total Non-Protein Calories
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-lg border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle>Electrolytes</CardTitle>
                    <CardDescription>
                        Enter daily electrolyte targets. Results are calculated
                        using the selected computation weight.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="overflow-hidden rounded-lg border border-border">
                        <div className="grid grid-cols-[1.1fr_1.5fr_1fr_1.2fr_1fr] bg-[#0b5d0b] text-sm font-semibold text-white">
                            <div className="px-3 py-2">Electrolyte</div>
                            <div className="px-3 py-2">Dose</div>
                            <div className="px-3 py-2">Weight</div>
                            <div className="px-3 py-2">Result</div>
                            <div className="px-3 py-2">Volume</div>
                        </div>

                        <ElectrolyteTableRow
                            label="Sodium"
                            dose={data.sodium_meq_kg_day}
                            onDoseChange={(value) =>
                                updateField('sodium_meq_kg_day', value)
                            }
                            doseUnit="meqs/kg/day"
                            weight={computedWeightKg}
                            result={sodiumMeqPerDay}
                            resultUnit="meqs/day"
                            volume={sodiumVolumeMl}
                        />

                        <ElectrolyteTableRow
                            label="Potassium"
                            dose={data.potassium_meq_kg_day}
                            onDoseChange={(value) =>
                                updateField('potassium_meq_kg_day', value)
                            }
                            doseUnit="meqs/kg/day"
                            weight={computedWeightKg}
                            result={potassiumMeqPerDay}
                            resultUnit="meqs/day"
                            volume={potassiumVolumeMl}
                        />

                        <ElectrolyteTableRow
                            label="Calcium"
                            dose={data.calcium_mg_kg_day}
                            onDoseChange={(value) =>
                                updateField('calcium_mg_kg_day', value)
                            }
                            doseUnit="mg/kg/day"
                            weight={computedWeightKg}
                            result={calciumMgPerDay}
                            resultUnit="mg/day"
                            volume={calciumVolumeMl}
                        />

                        <ElectrolyteTableRow
                            label="Magnesium"
                            dose={data.magnesium_meq_kg_day}
                            onDoseChange={(value) =>
                                updateField('magnesium_meq_kg_day', value)
                            }
                            doseUnit="meqs/kg/day"
                            weight={computedWeightKg}
                            result={magnesiumMeqPerDay}
                            resultUnit="meqs/day"
                            volume={magnesiumVolumeMl}
                        />

                        <ElectrolyteTableRow
                            label="Phosphorus"
                            dose={data.phosphorus_mmol_kg_day}
                            onDoseChange={(value) =>
                                updateField('phosphorus_mmol_kg_day', value)
                            }
                            doseUnit="mmol/kg/day"
                            weight={computedWeightKg}
                            result={phosphorusMmolPerDay}
                            resultUnit="mmol/day"
                            volume={phosphorusVolumeMl}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-lg border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle>Additives</CardTitle>
                    <CardDescription>
                        Encode trace elements and multivitamins.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="overflow-hidden rounded-lg border border-border">
                        <div className="grid grid-cols-[1.1fr_1.6fr_1.2fr] bg-[#0b5d0b] text-sm font-semibold text-white">
                            <div className="px-3 py-2">Additive</div>
                            <div className="px-3 py-2">Input</div>
                            <div className="px-3 py-2">Result</div>
                        </div>

                        <AdditiveTableRow
                            label="Trace Elements"
                            input={
                                <div className="flex flex-wrap items-center gap-2">
                                    <ComputationNumberInput
                                        value={data.trace_elements_ml_kg_day}
                                        onChange={(value) =>
                                            updateField(
                                                'trace_elements_ml_kg_day',
                                                value,
                                            )
                                        }
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        mL/kg/day
                                    </span>
                                </div>
                            }
                            result={
                                formatContentDisplay(traceElementsMlPerDay)
                                    ? `${formatContentDisplay(traceElementsMlPerDay)} mL/day / ${formatContentDisplay(traceElementsVolumeMl)} mL`
                                    : '—'
                            }
                        />

                        <AdditiveTableRow
                            label="Multivitamins"
                            input={
                                <div className="flex flex-wrap items-center gap-2">
                                    <ComputationNumberInput
                                        value={data.multivitamins_ml_day}
                                        onChange={(value) =>
                                            updateField(
                                                'multivitamins_ml_day',
                                                value,
                                            )
                                        }
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        mL/day
                                    </span>
                                </div>
                            }
                            result={
                                formatContentDisplay(data.multivitamins_ml_day)
                                    ? `${formatContentDisplay(data.multivitamins_ml_day)} mL/day / ${formatContentDisplay(multivitaminsVolumeMl)} mL`
                                    : '—'
                            }
                        />

                        <AdditiveTableRow
                            label="Heparin"
                            input={
                                <div className="flex flex-wrap items-center gap-2">
                                    <ComputationNumberInput
                                        value={data.heparin_ml}
                                        onChange={(value) =>
                                            updateField('heparin_ml', value)
                                        }
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        mL
                                    </span>
                                    <span className="text-sm font-medium">×</span>
                                    <ComputationNumberInput
                                        value={data.heparin_iu_per_ml}
                                        onChange={(value) =>
                                            updateField('heparin_iu_per_ml', value)
                                        }
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        I.U./mL
                                    </span>
                                </div>
                            }
                            result={
                                formatContentDisplay(heparinTotalIu)
                                    ? `${formatContentDisplay(heparinTotalIu)} I.U.`
                                    : '—'
                            }
                        />

                        <AdditiveTableRow
                            label="QS / Sterile Water"
                            input={
                                <div className="flex flex-wrap items-center gap-2">
                                    <ComputationNumberInput
                                        value={data.sterile_water_level_ml_day}
                                        onChange={(value) =>
                                            updateField(
                                                'sterile_water_level_ml_day',
                                                value,
                                            )
                                        }
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        mL
                                    </span>
                                </div>
                            }
                            result={
                                formatContentDisplay(qsVolumeMl)
                                    ? `${formatContentDisplay(qsVolumeMl)} mL (Recommended)`
                                    : '—'
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-lg border-border/80 shadow-sm">
                <CardContent>
                    <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox
                            checked={useOsmolarityCalculator}
                            onCheckedChange={(checked) => {
                                const shouldUseCalculator = checked === true;

                                updateField('use_osmolarity_calculator', shouldUseCalculator);

                                if (!shouldUseCalculator) {
                                    updateField('osmolarity_inputs_json', '');
                                    updateField('osmolarity_computed_mosm_l', '');
                                    updateField('osmolarity_notes', '');
                                }
                            }}
                            className="mt-1 shrink-0 cursor-pointer"
                        />

                        <span className="grid gap-1">
                            <span className="text-sm font-semibold text-foreground">
                                Use Osmolarity Calculator
                            </span>

                            <span className="text-xs leading-relaxed text-muted-foreground">
                                Enable this if you want to compute and validate the order
                                osmolarity. When disabled, osmolarity will not block
                                submission.
                            </span>

                            {useOsmolarityCalculator ? (
                                <span className="text-xs font-medium text-green-700">
                                    Osmolarity calculator is enabled.
                                </span>
                            ) : (
                                <span className="text-xs font-medium text-muted-foreground">
                                    Osmolarity calculator is disabled.
                                </span>
                            )}
                        </span>
                    </label>
                </CardContent>
            </Card>

            {useOsmolarityCalculator ? (
                <GlobalRphOsmolarityCalculator
                    data={data}
                    effectiveData={effectiveOsmolarityData}
                    updateField={updateField}
                    computedOsmolarity={computedOsmolarity}
                    isPeripheralDanger={isPeripheralDanger}
                    totalVolumeMl={Number(data.total_fluid_ml) || 0}
                    route={data.route}
                />
            ) : null}
        </div>
    );
}

function MacronutrientCard({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-lg border border-border/80 bg-background p-4 shadow-sm">
            <div className="mb-3 border-b border-border pb-2 text-base font-semibold text-[#0b5d0b]">
                {title}
            </div>

            {children}
        </div>
    );
}

function CompactInputRow({
    label,
    htmlFor,
    value,
    unit,
    onChange,
}: {
    label: string;
    htmlFor: string;
    value: string;
    unit: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={htmlFor}>{label}</Label>

            <div className="flex items-center gap-2">
                <ComputationNumberInput
                    id={htmlFor}
                    value={value}
                    onChange={onChange}
                />
                <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
        </div>
    );
}

function ComputationLine({
    label,
    value,
    unit,
}: {
    label: string;
    value: string;
    unit?: string;
}) {
    const displayValue = formatContentDisplay(value);

    return (
        <div className="flex min-h-[34px] items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/30 px-3 py-1.5">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </span>

            <span className="text-sm font-semibold text-foreground">
                {displayValue || '—'}
                {displayValue && unit ? (
                    <span className="ml-1 font-normal text-muted-foreground">
                        {unit}
                    </span>
                ) : null}
            </span>
        </div>
    );
}

function ComputationValue({
    label,
    value,
    unit,
}: {
    label: string;
    value: string;
    unit?: string;
}) {
    const displayValue = formatContentDisplay(value);

    return (
        <div className="rounded-md border border-emerald-200 bg-white/80 px-3 py-2">
            <span className="block text-xs font-medium tracking-wide text-emerald-800 uppercase">
                {label}
            </span>

            <span className="mt-1 block text-sm font-semibold text-emerald-950">
                {displayValue || '—'}
                {displayValue && unit ? (
                    <span className="ml-1 font-normal text-emerald-700">
                        {unit}
                    </span>
                ) : null}
            </span>
        </div>
    );
}

function ElectrolyteTableRow({
    label,
    dose,
    onDoseChange,
    doseUnit,
    weight,
    result,
    resultUnit,
    volume,
}: {
    label: string;
    dose: string;
    onDoseChange: (value: string) => void;
    doseUnit: string;
    weight: string;
    result: string;
    resultUnit: string;
    volume: string;
}) {
    const displayWeight = formatContentDisplay(weight);
    const displayResult = formatContentDisplay(result);
    const displayVolume = formatContentDisplay(volume);

    return (
        <div className="grid grid-cols-[1.1fr_1.5fr_1fr_1.2fr_1fr] border-t border-border bg-background">
            <div className="px-3 py-2 text-sm font-semibold text-[#0b5d0b]">
                {label}
            </div>

            <div className="px-3 py-2">
                <div className="flex items-center gap-2">
                    <ComputationNumberInput
                        value={dose}
                        onChange={onDoseChange}
                    />

                    <span className="text-sm text-muted-foreground">
                        {doseUnit}
                    </span>
                </div>
            </div>

            <div className="px-3 py-2 text-sm text-muted-foreground">
                {displayWeight ? `${displayWeight} kg` : '—'}
            </div>

            <div className="px-3 py-2 text-sm font-medium">
                {displayResult ? `${displayResult} ${resultUnit}` : '—'}
            </div>

            <div className="px-3 py-2 text-sm font-medium">
                {displayVolume ? `${displayVolume} mL/day` : '—'}
            </div>
        </div>
    );
}

function AdditiveTableRow({
    label,
    input,
    result,
}: {
    label: string;
    input: ReactNode;
    result: string;
}) {
    return (
        <div className="grid grid-cols-[1.1fr_1.6fr_1.2fr] border-t border-border bg-background">
            <div className="px-3 py-2 text-sm font-semibold text-[#0b5d0b]">
                {label}
            </div>

            <div className="px-3 py-2">{input}</div>

            <div className="px-3 py-2 text-sm font-medium">{result}</div>
        </div>
    );
}

function ComputationNumberInput({
    id,
    value,
    onChange,
}: {
    id?: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Input
            id={id}
            type="number"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-8 w-24 border-border bg-white text-center shadow-sm focus-visible:ring-[#2f7d32]"
        />
    );
}

function ReviewSection({
    data,
    computedOsmolarity,
    isPeripheralDanger,
    computedAge,
    computedWeightKg,
    computedBmi,
    computedRateMlPerHour,
    proteinGramsPerDay,
    proteinVolumeMl,
    proteinCalories,
    dextroseGramsPerDay,
    dextroseVolumeMl,
    dextroseCalories,
    gir,
    lipidGramsPerDay,
    lipidVolumeMl,
    lipidBottleVolumeMl,
    lipidRateMlPerHour,
    lipidCalories,
    sodiumMeqPerDay,
    potassiumMeqPerDay,
    calciumMgPerDay,
    magnesiumMeqPerDay,
    phosphorusMmolPerDay,
    sodiumVolumeMl,
    potassiumVolumeMl,
    calciumVolumeMl,
    magnesiumVolumeMl,
    phosphorusVolumeMl,
    traceElementsMlPerDay,
    traceElementsVolumeMl,
    totalNonProteinCaloriesPerKgDay,
    qsVolumeMl,
    multivitaminsVolumeMl,
}: ReviewSectionProps) {
    const patientName = getPatientName(data);

    return (
        <Card className="rounded-lg border-border/80 shadow-sm">
            <CardHeader>
                <CardTitle>Review</CardTitle>
                <CardDescription>
                    Confirm the request details before sending the TPN order for
                    pharmacist review.
                </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 text-sm lg:grid-cols-2">
                <div className="grid gap-3 rounded-lg border border-border/80 bg-muted/30 p-4">
                    <div className="font-semibold text-foreground">
                        Patient Information
                    </div>

                    <ReviewRow label="Patient" value={patientName} />
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
                        label="Prescribing Physician"
                        value={data.prescribing_physician}
                    />
                    <ReviewRow
                        label="Initial Order"
                        value={data.is_initial_order ? 'Yes' : 'No'}
                    />
                    <ReviewRow
                        label="Temporary Request"
                        value={data.temporary_request ? 'Yes' : 'No'}
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

                <div className="grid gap-4 rounded-lg border border-border/80 bg-muted/30 p-4 lg:col-span-2">
                    <div className="font-semibold text-foreground">
                        Computation Summary
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3">
                        <div className="grid gap-3 rounded-lg border border-border/70 bg-background p-4">
                            <div className="text-sm font-semibold text-[#0b5d0b]">
                                Protein
                            </div>

                            <ReviewRow
                                label="Dose"
                                value={
                                    data.protein_g_per_kg_day
                                        ? `${data.protein_g_per_kg_day} g/kg/day`
                                        : ''
                                }
                            />
                            <ReviewRow
                                label="Contents"
                                value={
                                    proteinGramsPerDay
                                        ? `${proteinGramsPerDay} g/day`
                                        : ''
                                }
                            />
                            <ReviewRow
                                label="Volume"
                                value={
                                    proteinVolumeMl
                                        ? `${proteinVolumeMl} mL`
                                        : ''
                                }
                            />
                        </div>

                        <div className="grid gap-3 rounded-lg border border-border/70 bg-background p-4">
                            <div className="text-sm font-semibold text-[#0b5d0b]">
                                Carbohydrates
                            </div>

                            <ReviewRow
                                label="Dextrose"
                                value={
                                    data.dextrose_percent
                                        ? `${data.dextrose_percent}%`
                                        : ''
                                }
                            />
                            <ReviewRow
                                label="Contents"
                                value={
                                    dextroseGramsPerDay
                                        ? `${dextroseGramsPerDay} g/day`
                                        : ''
                                }
                            />
                            <ReviewRow
                                label="Volume"
                                value={
                                    dextroseVolumeMl
                                        ? `${dextroseVolumeMl} mL`
                                        : ''
                                }
                            />
                        </div>

                        <div className="grid gap-3 rounded-lg border border-border/70 bg-background p-4">
                            <div className="text-sm font-semibold text-[#0b5d0b]">
                                Fat
                            </div>

                            <ReviewRow
                                label="Dose"
                                value={
                                    data.lipid_g_per_kg_day
                                        ? `${data.lipid_g_per_kg_day} g/kg/day`
                                        : ''
                                }
                            />
                            <ReviewRow
                                label="Contents"
                                value={
                                    lipidGramsPerDay
                                        ? `${lipidGramsPerDay} g/day`
                                        : ''
                                }
                            />
                            <ReviewRow
                                label="Volume"
                                value={
                                    lipidVolumeMl ? `${lipidVolumeMl} mL` : ''
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 rounded-lg border border-border/70 bg-background p-4">
                        <div className="text-sm font-semibold text-[#0b5d0b]">
                            Electrolytes and Additives
                        </div>

                        <div className="grid gap-3 lg:grid-cols-2">
                            <ReviewRow
                                label="Sodium"
                                value={
                                    sodiumVolumeMl ? `${sodiumVolumeMl} mL` : ''
                                }
                            />
                            <ReviewRow
                                label="Potassium"
                                value={
                                    potassiumVolumeMl
                                        ? `${potassiumVolumeMl} mL`
                                        : ''
                                }
                            />

                            <ReviewRow
                                label="Calcium"
                                value={
                                    calciumVolumeMl
                                        ? `${calciumVolumeMl} mL`
                                        : ''
                                }
                            />

                            <ReviewRow
                                label="Magnesium"
                                value={
                                    magnesiumVolumeMl
                                        ? `${magnesiumVolumeMl} mL`
                                        : ''
                                }
                            />

                            <ReviewRow
                                label="Phosphorus"
                                value={
                                    phosphorusVolumeMl
                                        ? `${phosphorusVolumeMl} mL`
                                        : ''
                                }
                            />
                            <ReviewRow
                                label="Trace Elements"
                                value={
                                    traceElementsVolumeMl
                                        ? `${traceElementsVolumeMl} mL`
                                        : ''
                                }
                            />
                            <ReviewRow
                                label="Multivitamins"
                                value={
                                    multivitaminsVolumeMl
                                        ? `${multivitaminsVolumeMl} mL`
                                        : ''
                                }
                            />
                            <ReviewRow
                                label="Heparin"
                                value={
                                    data.heparin_ml
                                        ? `${data.heparin_ml} mL`
                                        : ''
                                }
                            />
                            <ReviewRow
                                label="QS / Sterile Water"
                                value={
                                    data.sterile_water_level_ml_day
                                        ? `${data.sterile_water_level_ml_day} mL`
                                        : ''
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                        <div className="text-sm font-semibold">
                            Total Non-Protein Calories
                        </div>

                        <ReviewRow
                            label="Result"
                            value={
                                totalNonProteinCaloriesPerKgDay
                                    ? `${totalNonProteinCaloriesPerKgDay} Cal/kg/day`
                                    : ''
                            }
                        />
                    </div>

                    <div className="grid gap-3 rounded-lg border border-border/70 bg-background p-4">
                        <ReviewRow
                            label="Osmolarity"
                            value={computedOsmolarity ? `${computedOsmolarity} mOsm/L` : '—'}
                        />

                        {isPeripheralDanger ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                Peripheral line osmolarity is above the safe limit. Please adjust the formulation before submitting.
                            </div>
                        ) : null}
                    </div>

                    {data.is_initial_order ? (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            This initial TPN order requires Nutrition Support
                            Team approval.
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

function Grid({ children }: { children: ReactNode }) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                gap: '1rem',
            }}
        >
            {children}
        </div>
    );
}

function Field({
    label,
    htmlFor,
    children,
    style,
    required = false,
    error,
}: {
    label: string;
    htmlFor?: string;
    children: ReactNode;
    style?: CSSProperties;
    required?: boolean;
    error?: string;
}) {
    return (
        <div className="grid gap-2" style={style}>
            <Label htmlFor={htmlFor}>
                {label}
                {required ? <span className="ml-1 text-red-600">*</span> : null}
            </Label>

            {children}

            {error ? (
                <p className="text-xs font-medium text-red-600">{error}</p>
            ) : null}
        </div>
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

type OsmolarityFormField = keyof TpnOrderFormData;

function isOsmolarityFormField(value: string): value is OsmolarityFormField {
    return value in initialOrderFormData;
}

function getOsmolarityFieldValue(
    data: TpnOrderFormData,
    field: string,
): string {
    if (!isOsmolarityFormField(field)) {
        return '';
    }

    return String(data[field] ?? '');
}

function buildOsmolarityInputsPayload(data: TpnOrderFormData) {
    return {
        route: data.route,

        ppn: {
            solution: data.osmolarity_ppn_solution,
            volume_ml: data.osmolarity_ppn_volume_ml,
            lock_total_volume: data.osmolarity_ppn_lock_total_volume,
        },

        tpn: {
            amino_acid_10_grams: data.osmolarity_amino_acid_10_grams,
            amino_acid_15_grams: data.osmolarity_amino_acid_15_grams,
            dextrose_concentration: data.osmolarity_dextrose_concentration,
            dextrose_grams: data.osmolarity_dextrose_grams,
            hepatamine_8_grams: data.osmolarity_hepatamine_8_grams,
            lipid_10_ml: data.osmolarity_lipid_10_ml,
            lipid_20_ml: data.osmolarity_lipid_20_ml,
            novamine_15_grams: data.osmolarity_novamine_15_grams,
            sterile_water_ml: data.osmolarity_sterile_water_ml,
        },

        additives: {
            calcium_gluconate_10_ml:
                data.osmolarity_calcium_gluconate_10_ml,
            calcium_chloride_10_ml:
                data.osmolarity_calcium_chloride_10_ml,
            magnesium_sulfate_ml: data.osmolarity_magnesium_sulfate_ml,
            multi_trace_elements_ml:
                data.osmolarity_multi_trace_elements_ml,
            multivitamin_12_ml: data.osmolarity_multivitamin_12_ml,
            potassium_acetate_ml: data.osmolarity_potassium_acetate_ml,
            potassium_chloride_ml: data.osmolarity_potassium_chloride_ml,
            potassium_phosphate_ml: data.osmolarity_potassium_phosphate_ml,
            sodium_acetate_ml: data.osmolarity_sodium_acetate_ml,
            sodium_bicarbonate_4_2_ml:
                data.osmolarity_sodium_bicarbonate_4_2_ml,
            sodium_bicarbonate_7_5_ml:
                data.osmolarity_sodium_bicarbonate_7_5_ml,
            sodium_bicarbonate_8_4_ml:
                data.osmolarity_sodium_bicarbonate_8_4_ml,
            sodium_chloride_14_6_ml:
                data.osmolarity_sodium_chloride_14_6_ml,
            sodium_chloride_23_4_ml:
                data.osmolarity_sodium_chloride_23_4_ml,
            sodium_phosphate_ml: data.osmolarity_sodium_phosphate_ml,
        },
    };
}

function GlobalRphOsmolarityCalculator({
    data,
    effectiveData,
    updateField,
    computedOsmolarity,
    isPeripheralDanger,
    totalVolumeMl,
    route,
}: {
    data: TpnOrderFormData;
    effectiveData: TpnOrderFormData;
    updateField: <K extends keyof TpnOrderFormData>(
        field: K,
        value: TpnOrderFormData[K],
    ) => void;
    computedOsmolarity: string;
    isPeripheralDanger: boolean;
    totalVolumeMl: number;
    route: string;
}) {
    // PPN States
    const ppnSolution = effectiveData.osmolarity_ppn_solution || 'd10w';
    const ppnVolume =
        effectiveData.osmolarity_ppn_volume_ml || totalVolumeMl.toString();
    const lockTotalVolume =
        effectiveData.osmolarity_ppn_lock_total_volume || 'no';

    const isPeripheral = route === 'Peripheral Line';
    const isTpn = route !== 'Peripheral Line';

    const renderOsmolarityInput = (field: string, label: string) => {
        if (!isOsmolarityFormField(field)) {
            return null;
        }

        const unit = field.endsWith('_ml') ? 'mL' : 'g';

        return (
            <div key={field} className="flex items-center justify-between gap-4">
                <Label className="w-1/2 leading-tight">
                    {label}
                    <span className="ml-1 text-xs text-muted-foreground">
                        ({unit})
                    </span>
                </Label>

                <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={getOsmolarityFieldValue(effectiveData, field)}
                    onChange={(e) => updateField(field, e.target.value)}
                    className="w-1/2 bg-white text-center"
                />
            </div>
        );
    };

    const renderDextroseConcentrationSelect = () => {
        return (
            <div className="flex items-center justify-between gap-4">
                <Label className="w-1/2 leading-tight">
                    Dextrose Concentration
                    <span className="ml-1 text-xs text-muted-foreground">
                        (%)
                    </span>
                </Label>

                <Select
                    value={effectiveData.osmolarity_dextrose_concentration || '50'}
                    onValueChange={(value) =>
                        updateField('osmolarity_dextrose_concentration', value)
                    }
                >
                    <SelectTrigger className="w-1/2 bg-white">
                        <SelectValue placeholder="Select concentration" />
                    </SelectTrigger>

                    <SelectContent>
                        {osmolarityDextroseConcentrationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    };

    return (
        <Card className={`rounded-lg shadow-sm mt-8 ${isPeripheralDanger ? 'border-red-400' : 'border-blue-200'}`}>
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>
                        {isPeripheral ? 'PPN Osmolarity Calculator' : 'TPN Osmolarity Calculator'}
                    </span>
                    <span className="text-xl font-bold px-4 py-1 rounded-md">
                        {computedOsmolarity || '—'} mOsm/L
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* LEFT COLUMN: BASE SOLUTION */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase text-muted-foreground border-b pb-1">
                            {isPeripheral ? 'Base Solution' : 'TPN Components'}
                        </h4>

                        {isPeripheral ? (
                            <>
                                <div className="flex items-center justify-between gap-4">
                                    <Label className="w-1/2">Solution</Label>
                                    <Select
                                        value={ppnSolution}
                                        onValueChange={(value) =>
                                            updateField('osmolarity_ppn_solution', value)
                                        }
                                    >
                                        <SelectTrigger className="w-1/2 bg-white">
                                            <SelectValue placeholder="Select solution" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {osmolarityPpnSolutionOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Label className="w-1/2">Volume (mL)</Label>
                                    <Input
                                        type="number"
                                        value={ppnVolume}
                                        onChange={(e) =>
                                            updateField('osmolarity_ppn_volume_ml', e.target.value)
                                        }
                                        className="w-1/2 bg-white text-center"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4 pt-2">
                                    <Label className="w-1/2 leading-tight">Lock total volume to amount listed above?</Label>
                                    <Select
                                        value={lockTotalVolume}
                                        onValueChange={(value) =>
                                            updateField('osmolarity_ppn_lock_total_volume', value)
                                        }
                                    >
                                        <SelectTrigger className="w-1/2 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {osmolarityLockTotalVolumeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : (
                            <div className="grid gap-3">
                                {renderDextroseConcentrationSelect()}

                                {osmolarityTpnMacronutrientFields.map((field) =>
                                    renderOsmolarityInput(field.value, field.label),
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: SHARED ADDITIVES */}
                    <div className="space-y-4">
                        <h4 className="border-b pb-1 text-sm font-semibold text-muted-foreground uppercase">
                            Additives
                        </h4>

                        <div className="grid gap-3">
                            {osmolarityAdditiveFields.map((field) =>
                                renderOsmolarityInput(field.value, field.label),
                            )}
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}