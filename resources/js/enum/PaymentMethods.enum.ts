export enum PaymentMethods {
    CASH= 'cash',
    CARD ='card',
    BANK_TRANSFER ='bank_transfer',
    CASH_ON_DELIVERY ='cash_on_delivery',
}

export const PaymentMethodsLabel = {
    [PaymentMethods.CASH] : "Cash",
    [PaymentMethods.CARD] : "Card",
    [PaymentMethods.BANK_TRANSFER] : "Bank Transfer",
    [PaymentMethods.CASH_ON_DELIVERY] : "Cash on Delivery",  
}

export const PaymentMethodsOptions = Object.entries(PaymentMethodsLabel).map(([key, value]) => ({
    label: value,
    value: key
}))
