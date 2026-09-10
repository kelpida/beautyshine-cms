export const shortName = (name: string, length: number = 50): string => {
    if (!name) return "";
    if (name.length > length) {
        return name.substring(0, length) + "...";
    }
    return name;
};
