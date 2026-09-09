const CurrencyEnum = {
    EUR: "EUR",
    USD: "USD",
};

const CurrencyLabel = {
    [CurrencyEnum.EUR]: "EUR",
    [CurrencyEnum.USD]: "USD",
};

export const CurrencyOptions = Object.entries(CurrencyLabel).map(
    ([value, label]) => ({
        label,
        value,
    }),
);

export { CurrencyLabel, CurrencyEnum };
