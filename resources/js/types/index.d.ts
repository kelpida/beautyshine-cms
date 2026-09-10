import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    let route: typeof ziggyRoute;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            email_verified_at?: string;
            [key: string]: any;
        };
        impersonator_id?: number | string | null;
        permissions?: string[];
        roles?: string[];
        [key: string]: any;
    };
    ziggy: {
        location: string;
        [key: string]: any;
    };
    flash?: {
        message?: string;
        success?: string;
        error?: string;
    };
    [key: string]: any;
};
