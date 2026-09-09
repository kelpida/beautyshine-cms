const DateEnum = {
    MONDAY: "monday",
    TUESDAY: "tuesday",
    WEDNESDAY: "wednesday",
    THURSDAY: "thursday",
    FRIDAY: "friday",
    SATURDAY: "saturday",
    SUNDAY: "sunday",
};

const DateLabel = {
    [DateEnum.MONDAY]: "Monday",
    [DateEnum.TUESDAY]: "Tuesday",
    [DateEnum.WEDNESDAY]: "Wednesday",
    [DateEnum.THURSDAY]: "Thursday",
    [DateEnum.FRIDAY]: "Friday",
    [DateEnum.SATURDAY]: "Saturday",
    [DateEnum.SUNDAY]: "Sunday",
};

export const DateOptions = Object.entries(DateLabel).map(([value, label]) => ({
    label,
    value,
}));

export { DateLabel, DateEnum };
