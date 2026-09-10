const EmailType = {
    ADMIN: "admin",
    SYSTEM: "system",
    MARKETING: "marketing",
    SUPPORT: "support",
    INQUIRY: "inquiry",
};

const EmailLabel = {
    [EmailType.ADMIN]: "Admin",
    [EmailType.INQUIRY]: "Inquiry",
    [EmailType.SYSTEM]: "System",
    [EmailType.MARKETING]: "Marketing",
    [EmailType.SUPPORT]: "Support",
};

export const EmailOption = Object.entries(EmailLabel).map(([value, label]) => ({
    label,
    value,
}));

export { EmailLabel, EmailType };
