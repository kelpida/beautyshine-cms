export enum OrderStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export const OrderStatusLabel = {
    [OrderStatus.PENDING] : "Pending",
    [OrderStatus.PROCESSING] : "Processing",
    [OrderStatus.COMPLETED] : "Completed",
    [OrderStatus.CANCELLED] : "Cancelled",
}

export const OrderStatusOptions = Object.values(OrderStatus).map(status => ({
    value: status,
    label: OrderStatusLabel[status],
}));