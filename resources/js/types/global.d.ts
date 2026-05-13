import type { Auth } from '@/types/auth';
import { Config, RouteName, RouteParams } from 'ziggy-js';

declare global {
    function route(): Config;
    function route<T extends RouteName>(
        name: T,
        params?: RouteParams<T>,
        absolute?: boolean,
        config?: Config,
    ): string;
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
