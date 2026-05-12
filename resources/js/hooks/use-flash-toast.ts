import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

type FlashToast = {
    id?: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
};

type SharedProps = {
    flash?: {
        toast?: FlashToast | null;
    };
};

export function useFlashToast(): void {
    const { flash } = usePage<SharedProps>().props;
    const lastMessageId = useRef<string | null>(null);

    useEffect(() => {
        const data = flash?.toast;

        if (!data?.message) {
            return;
        }

        const toastId = data.id || `${data.type}:${data.message}`;

        if (lastMessageId.current === toastId) {
            return;
        }

        lastMessageId.current = toastId;

        toast[data.type](data.message);
    }, [flash?.toast]);
}