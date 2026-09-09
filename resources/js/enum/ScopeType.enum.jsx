const ScopeType = {
    COUNTRY: "country",
    TYPE: "type",
    CITY: "city",
    STATUS: "status",
};

const ScopeLabels = {
    [ScopeType.COUNTRY]: "Country",
    [ScopeType.TYPE]: "Type",
    [ScopeType.CITY]: "City",
    [ScopeType.STATUS]: "Status",
};

const ScopeTypeOptions = Object.entries(ScopeLabels).map(([value, label]) => ({
    label,
    value,
}));

const ScopeMode = {
    ALLOW: "allow",
    DENY: "deny",
};
const ScopeModeLabels = {
    [ScopeMode.ALLOW]: "Allow",
    [ScopeMode.DENY]: "Deny",
};
const ScopeModeOptions = Object.entries(ScopeModeLabels).map(
    ([value, label]) => ({
        label,
        value,
    })
);
export {
    ScopeType,
    ScopeTypeOptions,
    ScopeMode,
    ScopeModeOptions,
    ScopeLabels,
    ScopeModeLabels,
};
