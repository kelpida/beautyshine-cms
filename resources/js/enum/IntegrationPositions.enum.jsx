export const IntegrationPositions = {
    BODY: "body",
    HEAD: "head",
    FOOTER: "footer",
};

export const IntegrationPositionsLabels = {
    [IntegrationPositions.BODY]: "Body",
    [IntegrationPositions.HEAD]: "Head",
    [IntegrationPositions.FOOTER]: "Footer",
};

export const IntegrationPositionsOptions = [
    {
        value: IntegrationPositions.BODY,
        label: IntegrationPositionsLabels[IntegrationPositions.BODY],
    },
    {
        value: IntegrationPositions.HEAD,
        label: IntegrationPositionsLabels[IntegrationPositions.HEAD],
    },
    {
        value: IntegrationPositions.FOOTER,
        label: IntegrationPositionsLabels[IntegrationPositions.FOOTER],
    },
];

export const IntegrationPositionsName = (tpye) =>
    IntegrationPositionsLabels[tpye];
