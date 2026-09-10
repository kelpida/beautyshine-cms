// Transliterate Greek characters to Latin and generate a URL-friendly slug
export const useGeneratePath = (text: string = ""): string => {
    if (!text) return "";

    // Remove diacritics (correct Unicode combining marks range)
    const cleaned = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Greek → Latin transliteration map
    const map: Record<string, string> = {
        Α: "A",
        Β: "V",
        Γ: "G",
        Δ: "D",
        Ε: "E",
        Ζ: "Z",
        Η: "I",
        Θ: "Th",
        Ι: "I",
        Κ: "K",
        Λ: "L",
        Μ: "M",
        Ν: "N",
        Ξ: "X",
        Ο: "O",
        Π: "P",
        Ρ: "R",
        Σ: "S",
        Τ: "T",
        Υ: "Y",
        Φ: "F",
        Χ: "Ch",
        Ψ: "Ps",
        Ω: "O",

        α: "a",
        β: "v",
        γ: "g",
        δ: "d",
        ε: "e",
        ζ: "z",
        η: "i",
        θ: "th",
        ι: "i",
        κ: "k",
        λ: "l",
        μ: "m",
        ν: "n",
        ξ: "x",
        ο: "o",
        π: "p",
        ρ: "r",
        σ: "s",
        ς: "s",
        τ: "t",
        υ: "y",
        φ: "f",
        χ: "ch",
        ψ: "ps",
        ω: "o",
    };

    // Transliterate
    let transliterated = "";
    for (const ch of cleaned) {
        transliterated += map[ch] ?? ch;
    }

    // Normalize → slug
    return transliterated
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};
