import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { OrderForm } from '@/components/orders/order-form';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { TpnOrder, TpnOrderFormData } from '@/types/orders';

type OrderRegistrationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Partial<TpnOrder>;
    title?: string;
    description?: string;
    submitLabel?: string;
    onSubmit?: (data: TpnOrderFormData) => void;
};

export function OrderRegistrationDialog({
    open,
    onOpenChange,
    initialData,
    title = 'New TPN Order',
    description = 'Create a parenteral nutrition request for pharmacist review, computation, compounding, and dispensing.',
    submitLabel = 'Submit for Review',
    onSubmit,
}: OrderRegistrationDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [pendingData, setPendingData] = useState<TpnOrderFormData | null>(
        null,
    );

    function submitOrder(data: TpnOrderFormData) {
        setIsSubmitting(true);

        router.post('/orders', data, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmationOpen(false);
                setPendingData(null);
                onOpenChange(false);
            },
            onError: (errors) => {
                setConfirmationOpen(false);

                const firstError = Object.values(errors)[0];

                toast.error(
                    typeof firstError === 'string'
                        ? firstError
                        : 'The TPN order could not be saved. Please review the form and try again.',
                );
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="flex h-[92vh] w-[calc(100vw-3rem)] !max-w-[1500px] flex-col overflow-hidden rounded-xl border bg-background p-0 shadow-2xl [&>[data-slot=dialog-content-close]]:hidden"
                    onEscapeKeyDown={(event) => event.preventDefault()}
                    onInteractOutside={(event) => event.preventDefault()}
                >
                    <DialogHeader className="border-b border-border bg-background px-6 py-4 text-left">
                        <DialogTitle className="text-xl font-semibold">
                            {title}
                        </DialogTitle>

                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 px-6 py-5">
                        <OrderForm
                            initialData={initialData}
                            submitLabel={
                                isSubmitting ? 'Submitting...' : submitLabel
                            }
                            isSubmitting={isSubmitting}
                            onCancel={() => onOpenChange(false)}
                            onSubmit={(data) => {
                                if (onSubmit) {
                                    onSubmit(data);
                                    return;
                                }

                                setPendingData(data);
                                setConfirmationOpen(true);
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={confirmationOpen}
                title="Submit this TPN order for review?"
                description="Please confirm that the patient details, requirements, and computations are correct before submitting."
                confirmLabel={isSubmitting ? 'Submitting...' : 'Submit'}
                cancelLabel="Review Again"
                onOpenChange={(nextOpen) => {
                    if (isSubmitting) {
                        return;
                    }

                    setConfirmationOpen(nextOpen);

                    if (!nextOpen) {
                        setPendingData(null);
                    }
                }}
                onConfirm={() => {
                    if (!pendingData || isSubmitting) {
                        return;
                    }

                    submitOrder(pendingData);
                }}
            />
        </>
    );
}
