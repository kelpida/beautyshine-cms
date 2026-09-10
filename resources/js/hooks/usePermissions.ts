import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

export const usePermissions = () => {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user ?? ({} as any);
    const permissions: string[] = user.permissions ?? [];

    // Handle single `role` instead of `roles`
    const role = user.role ?? null;

    // Determine if user is super admin
    const isSuperAdmin = Boolean(
        role && (role.id === 1 || role.name === "super-admin")
    );

    return (permission: string): boolean => {
        if (isSuperAdmin) return true; // full access
        return permissions.includes(permission);
    };
};
