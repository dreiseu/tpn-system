import { AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmationDialogProps = {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export default function ConfirmationDialog({
    open,
    title,
    description,
    confirmLabel = 'Proceed',
    cancelLabel = 'Cancel',
    onOpenChange,
    onConfirm,
}: ConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden border-0 p-0 shadow-2xl sm:max-w-[560px] [&>[data-slot=dialog-content-close]]:right-5 [&>[data-slot=dialog-content-close]]:top-5 [&>[data-slot=dialog-content-close]]:rounded-full [&>[data-slot=dialog-content-close]]:bg-zinc-800 [&>[data-slot=dialog-content-close]]:p-2 [&>[data-slot=dialog-content-close]]:text-white [&>[data-slot=dialog-content-close]]:opacity-100 [&>[data-slot=dialog-content-close]]:hover:bg-zinc-700 [&>[data-slot=dialog-content-close]>svg]:size-4">
                <div className="flex min-h-[240px]">
                    <div className="w-1.5 shrink-0 bg-amber-400" />

                    <div className="flex flex-1 flex-col px-5 py-9">
                        <div className="flex justify-center">
                            <div className="flex size-14 items-center justify-center rounded-full border-4 border-amber-400 text-amber-500">
                                <AlertCircle className="size-8" />
                            </div>
                        </div>

                        <DialogHeader className="mt-5 gap-2 text-center">
                            <DialogDescription className="px-4 text-base leading-7 text-zinc-700 text-center">
                                <span className="font-medium">{title}</span>
                                {description ? ` ${description}` : ''}
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="mt-8 justify-center gap-3 sm:flex-row sm:justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                className="min-w-28 border-zinc-300 text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                                onClick={() => onOpenChange(false)}
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                type="button"
                                className="min-w-28 bg-amber-400 text-zinc-900 hover:bg-amber-300 cursor-pointer"
                                onClick={onConfirm}
                            >
                                {confirmLabel}
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
