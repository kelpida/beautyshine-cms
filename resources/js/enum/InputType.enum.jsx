const InputType = {
    TEXT: "text",
    NUMBER: "number",
    SELECT: "select",
    CHECKBOX: "checkbox",
    RADIO: "radio",
    DATE: "date",
    TIME: "time",
    DATETIME: "datetime",
    MONTH: "month",
    WEEK: "week",
    COLOR: "color",
    RANGE: "range",
    STEPPER: "stepper",
    UPLOAD: "upload",
};

const RangeType = {
    NUMBER: "number",
    CHARACTER: "character",
};
const UploadType = {
    IMAGE: "image",
    FILE: "file",
};

const InputTypeName = {
    [InputType.TEXT]: "Text",
    [InputType.NUMBER]: "Number",
    [InputType.SELECT]: "Select",
    [InputType.CHECKBOX]: "Checkbox",
    [InputType.RADIO]: "Radio",
    [InputType.DATE]: "Date",
    [InputType.TIME]: "Time",
    [InputType.DATETIME]: "Datetime",
    [InputType.MONTH]: "Month",
    [InputType.WEEK]: "Week",
    [InputType.COLOR]: "Color",
    [InputType.RANGE]: "Range",
    [InputType.STEPPER]: "Stepper",
    [InputType.UPLOAD]: "Upload",
};

const UploadTypeName = {
    [UploadType.IMAGE]: "Image",
    [UploadType.FILE]: "File",
};

const RangeTypeName = {
    [RangeType.NUMBER]: "Number",
    [RangeType.CHARACTER]: "Character",
};

export const InputTypeList = Object.values(InputType);
export const RangeTypeList = Object.values(RangeType);
export const InputNameList = Object.values(InputTypeName);
export const UploadTypeList = Object.values(UploadType);
export { InputType, RangeType, InputTypeName, UploadType };

export const InputTypeArray = Object.entries(InputTypeName).map(
    ([value, label]) => ({
        label,
        value,
    })
);

export const UploadTypeArray = Object.entries(UploadTypeName).map(
    ([value, label]) => ({
        label,
        value,
    })
);

export const RangeTypeArray = Object.entries(RangeTypeName).map(
    ([value, label]) => ({
        label,
        value,
    })
);

export const FormatTypeArray = {
    [InputType.UPLOAD]: UploadTypeArray,
    [InputType.RANGE]: RangeTypeArray,
};
