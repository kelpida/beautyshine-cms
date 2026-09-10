const PublicStatus = {
    PUBLIC: "public",
    PRIVATE: "private",
};

const PublicStatusLabels = {
    [PublicStatus.PUBLIC]: "Public",
    [PublicStatus.PRIVATE]: "Private",
};

export { PublicStatus, PublicStatusLabels };

const PublicStatusOptions = Object.keys(PublicStatus).map((key) => ({
    label: PublicStatusLabels[PublicStatus[key]],
    value: PublicStatus[key],
}));

export { PublicStatusOptions };
