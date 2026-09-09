const ImportType = {
    API: "api",
    FILE: "file",
};

const ImportTypeLabel = {
    [ImportType.API]: "API",
    [ImportType.FILE]: "File",
};

const ImportTypeDescription = {
    [ImportType.API]: "Import packages from an API endpoint.",
    [ImportType.FILE]: "Import packages from a file. (xlsx, xls, csv, json)",
};

export const ImportTypeList = Object.values(ImportType);
export const ImportTypeLabelList = Object.values(ImportTypeLabel);
export const ImportTypeDescriptionList = Object.values(ImportTypeDescription);

export { ImportType, ImportTypeLabel, ImportTypeDescription };

export const ImportTypeArray = Object.entries(ImportTypeLabel).map(
    ([value, label]) => ({
        label,
        value,
    })
);
