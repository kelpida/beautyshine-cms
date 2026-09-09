export enum PaymentStatus {
    PENDING= 'pending',
    AUTHORIZED ='authorized',
    CAPTURED ='captured',
    FAILED ='failed',
    CANCELLED ='cancelled',
    REFUNDED ='refunded'
}

export const PaymentStatusLabel = {
    [PaymentStatus.PENDING] : "Pending",
    [PaymentStatus.AUTHORIZED] : "Authorized",
    [PaymentStatus.CAPTURED] : "Captured",
    [PaymentStatus.FAILED] : "Failed",
    [PaymentStatus.CANCELLED] : "Cancelled",
    [PaymentStatus.REFUNDED] : "Redunded",
}

export const PaymentStatusOptions = Object.entries(PaymentStatusLabel).map(([key, value]) => ({
    label: value,
    value: key
}))
