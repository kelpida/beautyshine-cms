
export enum OrderSource {
    STORE = 'store',
    ONLINE = 'online'
}

export const OrderSourceLabel = {
    [OrderSource.STORE] : "Store",
    [OrderSource.ONLINE] : "Online",
}

export const OrderSourceOptions = Object.entries(OrderSourceLabel).map(([key, value]) => ({
    label: value,
    value: key
}))
