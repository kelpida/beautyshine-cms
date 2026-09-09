export const shortName = (name, length = 50) => {
    if (name.length > length) {
        return name.substring(0, length) + "...";
    }
    return name;
};
