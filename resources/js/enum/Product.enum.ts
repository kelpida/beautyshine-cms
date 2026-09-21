export enum ProductType {
    SIMPLE = "simple",
    CONFIGURABLE = "configurable",
}

export enum ProductStatus {
    DRAFT = "draft",
    PUBLIC = "public",
    ARCHIVED = "archived",
    INACTIVE = "inactive",
}

export enum ProductSortType {
    POPULAR = "popular",
    PRICE_ASC = "price_asc",
    PRICE_DESC = "price_desc",
    NEWEST = "newest",
    OLDEST = "oldest",
}

export enum ProductVisibility {
    PUBLIC = "public",
    PRIVATE = "private",
}

export enum ProductStockStatus {
    IN_STOCK = "in_stock",
    OUT_OF_STOCK = "out_of_stock",
    ON_BACKORDER = "on_backorder",
}

export enum ProductDisplayType {
    LIST = "list",
    GRID = "grid",
    CARDS = "cards",
    TABLE = "table",
}

export enum ProductListingDisplayType {
    LIST = "list",
    GRID = "grid",
    CARDS = "cards",
    TABLE = "table",
}

export enum ProductListingSortType {
    POPULAR = "popular",
    PRICE_ASC = "price_asc",
    PRICE_DESC = "price_desc",
    NEWEST = "newest",
    OLDEST = "oldest",
}

export const PRODUCT_TYPE_OPTIONS = [
    { value: ProductType.SIMPLE, label: "Simple" },
    { value: ProductType.CONFIGURABLE, label: "Configurable" },
];

export const PRODUCT_STATUS_OPTIONS = [
    { value: ProductStatus.DRAFT, label: "Draft" },
    { value: ProductStatus.PUBLIC, label: "Public" },
    { value: ProductStatus.ARCHIVED, label: "Archived" },
    { value: ProductStatus.INACTIVE, label: "Inactive" },
];
