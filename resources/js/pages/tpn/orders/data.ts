import type { TpnOrderFormData } from '@/pages/tpn/orders/components/tpn-order-dialog';

export type TpnOrderStatus =
    | 'Draft'
    | 'Pending Review'
    | 'Approved'
    | 'For Compounding'
    | 'For Dispensing'
    | 'Completed';

export type TpnOrder = TpnOrderFormData & {
    id: number;
    order_no: string;
    order_date: string;
    status: TpnOrderStatus;
};

export const initialOrders: TpnOrder[] = [
    {
        id: 1,
        order_no: 'TPN-2026-0001',
        order_date: 'May 9, 2026 08:30 AM',
        status: 'Pending Review',
        temporary_request: false,
        last_name: 'Dela Cruz',
        first_name: 'Juan',
        middle_name: '',
        suffix: '',
        hospital_number: 'HN-000124',
        date_of_birth: '1990-04-12',
        sex: 'male',
        ward: 'NICU',
        room: '201 / Bed 03',
        prescribing_physician: 'Dr. Santos',
        is_initial_order: true,
        birth_weight_kg: '',
        current_weight_kg: '62',
        height_cm: '168',
        diagnosis: 'Post-operative nutrition support',
        total_fluid_ml: '1800',
        duration_hours: '24',
        route: 'central',
        dextrose: 'D10',
        amino_acid: '3%',
        lipids: '20%',
        remarks: '',
    },
    {
        id: 2,
        order_no: 'TPN-2026-0002',
        order_date: 'May 9, 2026 09:15 AM',
        status: 'For Compounding',
        temporary_request: false,
        last_name: 'Santos',
        first_name: 'Maria',
        middle_name: '',
        suffix: '',
        hospital_number: 'HN-000221',
        date_of_birth: '1984-11-03',
        sex: 'female',
        ward: 'ICU',
        room: '104 / Bed 01',
        prescribing_physician: 'Dr. Reyes',
        is_initial_order: false,
        birth_weight_kg: '',
        current_weight_kg: '54',
        height_cm: '160',
        diagnosis: 'Bowel rest',
        total_fluid_ml: '1600',
        duration_hours: '24',
        route: 'central',
        dextrose: 'D12.5',
        amino_acid: '4%',
        lipids: '20%',
        remarks: '',
    },
    {
        id: 3,
        order_no: 'TPN-2026-0003',
        order_date: 'May 8, 2026 02:20 PM',
        status: 'For Dispensing',
        temporary_request: false,
        last_name: 'Reyes',
        first_name: 'Pedro',
        middle_name: '',
        suffix: '',
        hospital_number: 'HN-000358',
        date_of_birth: '2018-07-24',
        sex: 'male',
        ward: 'Pedia',
        room: '305 / Bed 02',
        prescribing_physician: 'Dr. Lim',
        is_initial_order: false,
        birth_weight_kg: '',
        current_weight_kg: '22',
        height_cm: '118',
        diagnosis: 'Poor enteral tolerance',
        total_fluid_ml: '1000',
        duration_hours: '24',
        route: 'peripheral',
        dextrose: 'D10',
        amino_acid: '3%',
        lipids: '20%',
        remarks: '',
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
];

export function getStatusClass(status: TpnOrderStatus) {
    switch (status) {
        case 'Draft':
            return 'border-muted-foreground/30 bg-muted text-muted-foreground';
        case 'Pending Review':
            return 'border-yellow-500/30 bg-yellow-50 text-yellow-700';
        case 'Approved':
            return 'border-blue-500/30 bg-blue-50 text-blue-700';
        case 'For Compounding':
            return 'border-purple-500/30 bg-purple-50 text-purple-700';
        case 'For Dispensing':
            return 'border-emerald-500/30 bg-emerald-50 text-emerald-700';
        case 'Completed':
            return 'border-green-500/30 bg-green-50 text-green-700';
        default:
            return 'border-muted-foreground/30 bg-muted text-muted-foreground';
    }
}

export function getPatientName(order: TpnOrder) {
    return [
        order.last_name ? `${order.last_name},` : '',
        order.first_name,
        order.middle_name,
        order.suffix,
    ]
        .filter(Boolean)
        .join(' ');
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

export function findOrderById(id: number) {
    return initialOrders.find((order) => order.id === id) ?? null;
}
