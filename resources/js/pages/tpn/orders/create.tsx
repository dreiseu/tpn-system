import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, ClipboardPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { TpnOrderDialog } from '@/pages/tpn/orders/components/tpn-order-dialog';

export default function CreateTpnOrder() {
    const [open, setOpen] = useState(true);

    return (
        <>
            <Head title="New TPN Order" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/tpn/orders">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Orders
                            </Link>
                        </Button>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                New TPN Order
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Create a parenteral nutrition request for
                                pharmacist review, formulation, compounding, and
                                dispensing.
                            </p>
                        </div>
                    </div>

                    <Button onClick={() => setOpen(true)}>
                        <ClipboardPlus className="mr-2 h-4 w-4" />
                        Open Order Dialog
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>TPN Order Workflow</CardTitle>
                        <CardDescription>
                            Use the workflow dialog to capture patient,
                            clinical, requirement, formula, and review details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setOpen(true)}>
                            <ClipboardPlus className="mr-2 h-4 w-4" />
                            Create TPN Order
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <TpnOrderDialog open={open} onOpenChange={setOpen} />
        </>
    );
}

CreateTpnOrder.layout = {
    breadcrumbs: [
        {
            title: 'TPN Orders',
            href: '/tpn/orders',
        },
        {
            title: 'New Order',
            href: '/tpn/orders/create',
        },
    ],
};
