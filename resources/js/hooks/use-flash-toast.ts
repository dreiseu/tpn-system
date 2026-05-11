import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

type FlashToast = {
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
    const lastMessage = useRef<string | null>(null);

    useEffect(() => {
        const data = flash?.toast;

        if (!data?.message) {
            return;
        }

        const key = `${data.type}:${data.message}`;

        if (lastMessage.current === key) {
            return;
        }

        lastMessage.current = key;

        toast[data.type](data.message);
    }, [flash?.toast]);
}