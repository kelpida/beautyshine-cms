import { usePage } from "@inertiajs/react";

export const usePermissions = () => {
    const user = usePage().props.auth?.user ?? {};
    const permissions = user.permissions ?? [];

    // ✅ Handle single `role` instead of `roles`
    const role = user.role ?? null;

    // ✅ Determine if user is super admin
    const isSuperAdmin = role && (role.id === 1 || role.name === "super-admin");

    // console.log("~ usePermissions ~ isSuperAdmin:", isSuperAdmin);

    return (permission) => {
        if (isSuperAdmin) return true; // full access
        return permissions.includes(permission);
    };
};
