const Permissions = {
    STORE: "store",
    INDEX: "index",
    VIEW: "view",
    EDIT: "edit",
    DESTROY: "destroy",
};

const PermissionLabel = {
    [Permissions.STORE]: "Create",
    [Permissions.INDEX]: "View all",
    [Permissions.VIEW]: "View single",
    [Permissions.EDIT]: "Edit",
    [Permissions.DESTROY]: "Delete",
};

export { Permissions, PermissionLabel };
