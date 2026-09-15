/**
 * Converts any string into a clean, URL-friendly slug.
 * Safely handles null, undefined, accents, and special characters.
 */
export const slugify = (text?: any): string => {
    if (text === null || text === undefined) {
        return "";
    }

    const str = typeof text === "string" ? text : String(text);

    return str
        .toLowerCase()
        .trim()
        .normalize("NFD") // Decompose accented characters (e.g., é -> e + ´)
        .replace(/[\u0300-\u036f]/g, "") // Remove accent diacritics
        .replace(/[^\w\s-]/g, "") // Remove any non-alphanumeric chars (except hyphens & spaces)
        .replace(/[\s_-]+/g, "-") // Collapse consecutive spaces & underscores into a single hyphen
        .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
};

/**
 * Extracts sluggable candidates from either a string or an object.
 */
export const sluggableFields = (data: any): string[] => {
    if (data === null || data === undefined) {
        return [];
    }

    if (typeof data === "string") {
        return data.trim().length > 0 ? [data] : [];
    }

    if (typeof data === "object") {
        // Prioritize name, title, or slug fields
        const candidates = [data.name, data.title, data.slug];
        return candidates.filter(
            (field): field is string =>
                typeof field === "string" && field.trim().length > 0,
        );
    }

    return [String(data)];
};

/**
 * Generates a URL slug from either a string or a data object.
 *
 * Examples:
 *   slugifyFields("Fresh Red Roses") -> "fresh-red-roses"
 *   slugifyFields({ name: "Fresh Red Roses" }) -> "fresh-red-roses"
 */
export const slugifyFields = (data: any): string => {
    if (typeof data === "string") {
        return slugify(data);
    }

    const fields = sluggableFields(data);
    if (fields.length > 0) {
        return slugify(fields[0]);
    }

    return "";
};

export const slugifyAllFields = slugifyFields;
