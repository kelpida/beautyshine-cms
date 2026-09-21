export enum PaymentProviderCode {
    VIVA = "viva",
    STRIPE = "stripe",
    JCC = "jcc",
    REVOLUT = "revolut",
}

export const PaymentProviderCodeLabels: Record<PaymentProviderCode, string> = {
    [PaymentProviderCode.VIVA]: "Viva Wallet",
    [PaymentProviderCode.STRIPE]: "Stripe",
    [PaymentProviderCode.JCC]: "JCC Payment Systems",
    [PaymentProviderCode.REVOLUT]: "Revolut Business",
};

export const PaymentProviderCodeOptions = [
    {
        label: PaymentProviderCodeLabels[PaymentProviderCode.VIVA],
        value: PaymentProviderCode.VIVA,
    },
    {
        label: PaymentProviderCodeLabels[PaymentProviderCode.STRIPE],
        value: PaymentProviderCode.STRIPE,
    },
    {
        label: PaymentProviderCodeLabels[PaymentProviderCode.JCC],
        value: PaymentProviderCode.JCC,
    },
    {
        label: PaymentProviderCodeLabels[PaymentProviderCode.REVOLUT],
        value: PaymentProviderCode.REVOLUT,
    },
];

export enum PaymentProviderStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export const PaymentProviderStatusLabels: Record<PaymentProviderStatus, string> = {
    [PaymentProviderStatus.ACTIVE]: "Active",
    [PaymentProviderStatus.INACTIVE]: "Inactive",
};

export const PaymentProviderStatusOptions = [
    {
        label: PaymentProviderStatusLabels[PaymentProviderStatus.ACTIVE],
        value: PaymentProviderStatus.ACTIVE,
    },
    {
        label: PaymentProviderStatusLabels[PaymentProviderStatus.INACTIVE],
        value: PaymentProviderStatus.INACTIVE,
    },
];

// Convenient aliases
export const PaymentProviderOptions = PaymentProviderCodeOptions;
export const StatusOptions = PaymentProviderStatusOptions;
