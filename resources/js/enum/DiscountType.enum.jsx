export const DiscountTypeEnum = {
    Percentage: "percent",
    FixedAmount: "amount",
};

export const DiscountTypeName = {
    [DiscountTypeEnum.Percentage]: "Percentage",
    [DiscountTypeEnum.FixedAmount]: "Fixed Amount",
};

export const DiscountTypeList = Object.values(DiscountTypeEnum);
export const DiscountTypeNameList = Object.values(DiscountTypeName);

export const DiscountTypeArray = Object.entries(DiscountTypeName).map(
    ([value, label]) => ({
        label,
        value,
    }),
);
