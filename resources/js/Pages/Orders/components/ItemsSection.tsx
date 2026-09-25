import React, { useMemo, useState, useEffect, useRef } from "react";
import {
    Card,
    Col,
    Divider,
    Flex,
    Input,
    Row,
    Typography,
    Button,
    Badge,
    Tag,
    Empty,
    Space,
    Tooltip,
    Spin,
    Pagination,
} from "antd";
import {
    SearchOutlined,
    ShoppingCartOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    MinusOutlined,
    ShopOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import ProductCustomizationModal from "./ProductCustomizationModal";

const { Text, Title, Paragraph } = Typography;

interface ItemsSectionProps {
    items: any[];
    loading?: boolean;
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
    onPageChange?: (page: number, pageSize?: number) => void;
    searchQuery?: string;
    onSearchChange?: (q: string) => void;
    selectedItems: any[];
    setSelectedItems: (items: any[]) => void;
    onNext: () => void;
}

export default function ItemsSection({
    items = [],
    loading = false,
    pagination,
    onPageChange,
    searchQuery = "",
    onSearchChange,
    selectedItems = [],
    setSelectedItems,
    onNext,
}: ItemsSectionProps) {
    const [localSearch, setLocalSearch] = useState("");
    const [searchTerm, setSearchTerm] = useState(searchQuery || "");
    const lastEmittedSearchRef = useRef(searchQuery || "");
    const [activeModalProduct, setActiveModalProduct] = useState<any | null>(
        null,
    );
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const isControlledSearch = typeof onSearchChange === "function";

    // Synchronize local search term if parent searchQuery changes externally
    useEffect(() => {
        if (searchQuery !== lastEmittedSearchRef.current) {
            lastEmittedSearchRef.current = searchQuery || "";
            setSearchTerm(searchQuery || "");
        }
    }, [searchQuery]);

    // Debounce calling API/filter until the user stops typing (400ms delay)
    useEffect(() => {
        if (searchTerm === lastEmittedSearchRef.current) {
            return;
        }

        const timer = setTimeout(() => {
            lastEmittedSearchRef.current = searchTerm;
            if (isControlledSearch) {
                onSearchChange(searchTerm);
            } else {
                setLocalSearch(searchTerm);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchTerm, isControlledSearch, onSearchChange]);

    const handleSearchInput = (val: string) => {
        setSearchTerm(val);
        // If user clears the input, reset immediately without waiting for delay
        if (val === "") {
            lastEmittedSearchRef.current = "";
            if (isControlledSearch) {
                onSearchChange("");
            } else {
                setLocalSearch("");
            }
        }
    };

    // If local filtering is needed (when no onSearchChange handler provided)
    const activeFilter = isControlledSearch ? searchQuery : localSearch;
    const displayProducts = useMemo(() => {
        if (isControlledSearch) return items;
        if (!activeFilter.trim()) return items;
        const q = activeFilter.toLowerCase().trim();
        return items.filter(
            (item: any) =>
                item.name?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.short_description?.toLowerCase().includes(q),
        );
    }, [items, activeFilter, isControlledSearch]);

    // Calculate cart totals
    const cartTotalAmount = useMemo(() => {
        return selectedItems.reduce((sum, item) => {
            const lineTotal =
                item.total_price !== undefined
                    ? item.total_price
                    : (parseFloat(item.price || 0) +
                          (item.options || []).reduce(
                              (optSum: number, o: any) =>
                                  optSum + parseFloat(o.price_modifier || 0),
                              0,
                          )) *
                      (item.quantity || 1);
            return sum + lineTotal;
        }, 0);
    }, [selectedItems]);

    const totalQuantityCount = useMemo(() => {
        return selectedItems.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0,
        );
    }, [selectedItems]);

    // Open modal to configure new product
    const handleOpenConfigure = (product: any) => {
        setEditingItem(null);
        setActiveModalProduct(product);
    };

    // Open modal to edit existing line item
    const handleEditItem = (lineItem: any) => {
        const product = items.find(
            (p) => p.id === (lineItem.product_id || lineItem.item_id),
        );
        if (product) {
            setEditingItem(lineItem);
            setActiveModalProduct(product);
        }
    };

    // Save item from modal (either add new line item or update existing)
    const handleSaveConfiguredItem = (configuredItem: any) => {
        if (editingItem) {
            // Update existing item
            setSelectedItems(
                selectedItems.map((item) =>
                    (item.unique_key &&
                        item.unique_key === editingItem.unique_key) ||
                    (!item.unique_key &&
                        item.item_id === editingItem.item_id &&
                        item.variation_id === editingItem.variation_id)
                        ? configuredItem
                        : item,
                ),
            );
        } else {
            // Check if exact same product + variation + options exists to increment qty, else append
            const sameExistingIndex = selectedItems.findIndex((item) => {
                const sameProduct =
                    (item.product_id || item.item_id) ===
                    (configuredItem.product_id || configuredItem.item_id);
                const sameVariation =
                    item.variation_id === configuredItem.variation_id;
                const sameAddons =
                    JSON.stringify(
                        (item.options || []).map((o: any) => o.addon_id).sort(),
                    ) ===
                    JSON.stringify(
                        (configuredItem.options || [])
                            .map((o: any) => o.addon_id)
                            .sort(),
                    );
                const sameNote =
                    (item.note || "").trim() ===
                    (configuredItem.note || "").trim();

                return sameProduct && sameVariation && sameAddons && sameNote;
            });

            if (sameExistingIndex > -1) {
                const updated = [...selectedItems];
                const existing = updated[sameExistingIndex];
                const newQty =
                    (existing.quantity || 1) + configuredItem.quantity;
                const unitPrice =
                    configuredItem.unit_price ||
                    configuredItem.price +
                        (configuredItem.options || []).reduce(
                            (s: number, o: any) =>
                                s + parseFloat(o.price_modifier || 0),
                            0,
                        );
                updated[sameExistingIndex] = {
                    ...existing,
                    quantity: newQty,
                    total_price: unitPrice * newQty,
                };
                setSelectedItems(updated);
            } else {
                setSelectedItems([...selectedItems, configuredItem]);
            }
        }
    };

    // Remove line item
    const handleRemoveItem = (uniqueKeyOrIndex: string | number) => {
        setSelectedItems(
            selectedItems.filter((item, idx) => {
                if (typeof uniqueKeyOrIndex === "string" && item.unique_key) {
                    return item.unique_key !== uniqueKeyOrIndex;
                }
                return idx !== uniqueKeyOrIndex;
            }),
        );
    };

    // Increment / decrement quantity directly in cart
    const handleQuickQuantity = (
        uniqueKeyOrIndex: string | number,
        delta: number,
    ) => {
        setSelectedItems(
            selectedItems
                .map((item, idx) => {
                    const isTarget =
                        (typeof uniqueKeyOrIndex === "string" &&
                            item.unique_key === uniqueKeyOrIndex) ||
                        idx === uniqueKeyOrIndex;

                    if (!isTarget) return item;

                    const newQty = (item.quantity || 1) + delta;
                    if (newQty <= 0) return null;

                    const unitPrice =
                        item.unit_price ||
                        parseFloat(item.price || 0) +
                            (item.options || []).reduce(
                                (s: number, o: any) =>
                                    s + parseFloat(o.price_modifier || 0),
                                0,
                            );

                    return {
                        ...item,
                        quantity: newQty,
                        total_price: unitPrice * newQty,
                    };
                })
                .filter(Boolean) as any[],
        );
    };

    // Helper to get total count in cart for a specific product ID
    const getProductCartCount = (productId: number) => {
        return selectedItems
            .filter((item) => (item.product_id || item.item_id) === productId)
            .reduce((sum, item) => sum + (item.quantity || 1), 0);
    };

    return (
        <>
            {/* Top Bar with Search & Quick Info */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 20,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ShopOutlined style={{ fontSize: 24, color: "#1677ff" }} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>
                            Cashier Desk - Order Items
                        </Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Filter confectionery products, choose variations,
                            add-ons, and inscriptions
                        </Text>
                    </div>
                </div>
            </div>

            {/* Main Content Layout: Product Catalog (Left) + Cashier Order Ticket (Right) */}
            <Row gutter={[20, 20]}>
                {/* LEFT: Product Catalog Grid */}
                <Col xs={24} lg={15}>
                    <Spin
                        spinning={loading}
                        indicator={<LoadingOutlined style={{ fontSize: 32 }} />}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 20,
                            }}
                        >
                            <Input
                                prefix={
                                    <SearchOutlined
                                        style={{ color: "#bfbfbf" }}
                                    />
                                }
                                suffix={
                                    loading ? (
                                        <Spin size="small" />
                                    ) : null
                                }
                                placeholder="Search items by name..."
                                value={searchTerm}
                                onChange={(e) =>
                                    handleSearchInput(e.target.value)
                                }
                                allowClear
                                style={{ width: 280 }}
                            />
                            {pagination?.total !== undefined && (
                                <Tag
                                    color="blue"
                                    style={{
                                        fontSize: 13,
                                        padding: "4px 10px",
                                    }}
                                >
                                    {pagination.total} Products
                                </Tag>
                            )}
                        </div>
                        <div style={{ minHeight: 480 }}>
                            {displayProducts.length === 0 && !loading ? (
                                <Card className="text-center p-8">
                                    <Empty description="No products found matching your search" />
                                </Card>
                            ) : (
                                <Row gutter={[16, 16]}>
                                    {displayProducts.map((product: any) => {
                                        const cartCount = getProductCartCount(
                                            product.id,
                                        );
                                        const imageUrl =
                                            product.main_image?.url ||
                                            product.image?.url;
                                        const hasVariations =
                                            product.variations?.length > 0;
                                        const hasAddons =
                                            product.addons?.length > 0;
                                        const basePrice = parseFloat(
                                            product.sale_price !== null &&
                                                product.sale_price !== undefined
                                                ? product.sale_price
                                                : product.base_price || 0,
                                        );

                                        return (
                                            <Col
                                                key={product.id}
                                                xs={24}
                                                sm={12}
                                                md={8}
                                            >
                                                <Badge.Ribbon
                                                    text={`x${cartCount} in order`}
                                                    color="green"
                                                    style={{
                                                        display:
                                                            cartCount > 0
                                                                ? "block"
                                                                : "none",
                                                    }}
                                                >
                                                    <Card
                                                        hoverable
                                                        size="small"
                                                        style={{
                                                            height: "100%",
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                            borderColor:
                                                                cartCount > 0
                                                                    ? "#b7eb8f"
                                                                    : "#f0f0f0",
                                                            borderRadius: 8,
                                                            overflow: "hidden",
                                                        }}
                                                        styles={{
                                                            body: {
                                                                display: "flex",
                                                                flexDirection:
                                                                    "column",
                                                                flex: 1,
                                                                padding: 12,
                                                            },
                                                        }}
                                                        cover={
                                                            imageUrl ? (
                                                                <div
                                                                    style={{
                                                                        height: 140,
                                                                        overflow:
                                                                            "hidden",
                                                                        background:
                                                                            "#fafafa",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={
                                                                            imageUrl
                                                                        }
                                                                        alt={
                                                                            product.name
                                                                        }
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit:
                                                                                "cover",
                                                                        }}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    style={{
                                                                        height: 140,
                                                                        background:
                                                                            "#f7f7f7",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "center",
                                                                        fontSize: 40,
                                                                        color: "#ccc",
                                                                    }}
                                                                >
                                                                    🍰
                                                                </div>
                                                            )
                                                        }
                                                        onClick={() =>
                                                            handleOpenConfigure(
                                                                product,
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            style={{ flex: 1 }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontWeight: 600,
                                                                    fontSize: 14,
                                                                    color: "#262626",
                                                                    marginBottom: 4,
                                                                }}
                                                            >
                                                                {product.name}
                                                            </div>

                                                            {product.short_description && (
                                                                <Paragraph
                                                                    type="secondary"
                                                                    ellipsis={{
                                                                        rows: 2,
                                                                    }}
                                                                    style={{
                                                                        fontSize: 12,
                                                                        marginBottom: 8,
                                                                    }}
                                                                >
                                                                    {
                                                                        product.short_description
                                                                    }
                                                                </Paragraph>
                                                            )}

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    flexWrap:
                                                                        "wrap",
                                                                    gap: 4,
                                                                    marginBottom: 8,
                                                                }}
                                                            >
                                                                {hasVariations && (
                                                                    <Tag
                                                                        color="cyan"
                                                                        style={{
                                                                            fontSize: 10,
                                                                            margin: 0,
                                                                        }}
                                                                    >
                                                                        {
                                                                            product
                                                                                .variations
                                                                                .length
                                                                        }{" "}
                                                                        Sizes/Variations
                                                                    </Tag>
                                                                )}
                                                                {hasAddons && (
                                                                    <Tag
                                                                        color="purple"
                                                                        style={{
                                                                            fontSize: 10,
                                                                            margin: 0,
                                                                        }}
                                                                    >
                                                                        {
                                                                            product
                                                                                .addons
                                                                                .length
                                                                        }{" "}
                                                                        Add-ons
                                                                    </Tag>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "space-between",
                                                                marginTop: 8,
                                                                paddingTop: 8,
                                                                borderTop:
                                                                    "1px solid #f0f0f0",
                                                            }}
                                                        >
                                                            <div>
                                                                <Text
                                                                    type="secondary"
                                                                    style={{
                                                                        fontSize: 11,
                                                                        display:
                                                                            "block",
                                                                    }}
                                                                >
                                                                    {hasVariations
                                                                        ? "Starts at"
                                                                        : "Price"}
                                                                </Text>
                                                                <Text
                                                                    strong
                                                                    style={{
                                                                        fontSize: 15,
                                                                        color: "#1677ff",
                                                                    }}
                                                                >
                                                                    €
                                                                    {basePrice.toFixed(
                                                                        2,
                                                                    )}
                                                                </Text>
                                                            </div>

                                                            <Button
                                                                type={
                                                                    cartCount >
                                                                    0
                                                                        ? "default"
                                                                        : "primary"
                                                                }
                                                                size="small"
                                                                icon={
                                                                    cartCount >
                                                                    0 ? (
                                                                        <CheckOutlined />
                                                                    ) : (
                                                                        <PlusOutlined />
                                                                    )
                                                                }
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleOpenConfigure(
                                                                        product,
                                                                    );
                                                                }}
                                                            >
                                                                {cartCount > 0
                                                                    ? "Configure"
                                                                    : "Add"}
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                </Badge.Ribbon>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            )}

                            {/* Pagination Controls */}
                            {pagination &&
                                pagination.total > 0 &&
                                onPageChange && (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            marginTop: 24,
                                        }}
                                    >
                                        <Pagination
                                            current={pagination.current_page}
                                            pageSize={pagination.per_page}
                                            total={pagination.total}
                                            onChange={onPageChange}
                                            showSizeChanger={false}
                                        />
                                    </div>
                                )}
                        </div>
                    </Spin>
                </Col>

                {/* RIGHT: Cashier Order Ticket / Cart */}
                <Col xs={24} lg={9}>
                    <Card
                        title={
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Space>
                                    <ShoppingCartOutlined
                                        style={{
                                            fontSize: 18,
                                            color: "#52c41a",
                                        }}
                                    />
                                    <span style={{ fontWeight: 600 }}>
                                        Cashier Order Ticket
                                    </span>
                                </Space>
                                <Tag
                                    color="green"
                                    style={{ fontWeight: 600, fontSize: 12 }}
                                >
                                    {totalQuantityCount} Items
                                </Tag>
                            </div>
                        }
                        style={{
                            position: "sticky",
                            top: 20,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            borderRadius: 8,
                        }}
                        styles={{ body: { padding: "16px" } }}
                    >
                        {selectedItems.length === 0 ? (
                            <div
                                style={{
                                    padding: "32px 16px",
                                    textAlign: "center",
                                }}
                            >
                                <ShoppingCartOutlined
                                    style={{
                                        fontSize: 40,
                                        color: "#d9d9d9",
                                        marginBottom: 12,
                                    }}
                                />
                                <div
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                        color: "#595959",
                                    }}
                                >
                                    Order is empty
                                </div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Click on any product on the left to
                                    customize variations and extras
                                </Text>
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        maxHeight: 360,
                                        overflowY: "auto",
                                        paddingRight: 4,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 10,
                                    }}
                                >
                                    {selectedItems.map((lineItem, index) => {
                                        const uniqueKey =
                                            lineItem.unique_key || index;
                                        const unitPrice =
                                            lineItem.unit_price ||
                                            parseFloat(lineItem.price || 0) +
                                                (lineItem.options || []).reduce(
                                                    (s: number, o: any) =>
                                                        s +
                                                        parseFloat(
                                                            o.price_modifier ||
                                                                0,
                                                        ),
                                                    0,
                                                );
                                        const lineTotal =
                                            lineItem.total_price ||
                                            unitPrice *
                                                (lineItem.quantity || 1);

                                        return (
                                            <div
                                                key={uniqueKey}
                                                style={{
                                                    background: "#fafafa",
                                                    border: "1px solid #f0f0f0",
                                                    borderRadius: 8,
                                                    padding: 10,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 6,
                                                }}
                                            >
                                                {/* Line Item Header */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems:
                                                            "flex-start",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            paddingRight: 8,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontWeight: 600,
                                                                fontSize: 13,
                                                                color: "#1f1f1f",
                                                            }}
                                                        >
                                                            {
                                                                lineItem.product_name
                                                            }
                                                        </div>
                                                        {lineItem.variation_name && (
                                                            <Tag
                                                                color="blue"
                                                                style={{
                                                                    fontSize: 11,
                                                                    padding:
                                                                        "0 6px",
                                                                    marginTop: 2,
                                                                }}
                                                            >
                                                                Size:{" "}
                                                                {
                                                                    lineItem.variation_name
                                                                }
                                                            </Tag>
                                                        )}
                                                    </div>

                                                    <Space size={4}>
                                                        <Tooltip title="Edit Item">
                                                            <Button
                                                                size="small"
                                                                type="text"
                                                                icon={
                                                                    <EditOutlined
                                                                        style={{
                                                                            color: "#1677ff",
                                                                        }}
                                                                    />
                                                                }
                                                                onClick={() =>
                                                                    handleEditItem(
                                                                        lineItem,
                                                                    )
                                                                }
                                                            />
                                                        </Tooltip>
                                                        <Tooltip title="Remove Item">
                                                            <Button
                                                                size="small"
                                                                type="text"
                                                                danger
                                                                icon={
                                                                    <DeleteOutlined />
                                                                }
                                                                onClick={() =>
                                                                    handleRemoveItem(
                                                                        uniqueKey,
                                                                    )
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </Space>
                                                </div>

                                                {/* Addons List */}
                                                {lineItem.options?.length >
                                                    0 && (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: 4,
                                                        }}
                                                    >
                                                        {lineItem.options.map(
                                                            (
                                                                opt: any,
                                                                oIdx: number,
                                                            ) => (
                                                                <Tag
                                                                    key={oIdx}
                                                                    color="purple"
                                                                    style={{
                                                                        fontSize: 10,
                                                                        margin: 0,
                                                                    }}
                                                                >
                                                                    +{" "}
                                                                    {
                                                                        opt.option_name
                                                                    }{" "}
                                                                    (€
                                                                    {parseFloat(
                                                                        opt.price_modifier ||
                                                                            0,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                    )
                                                                </Tag>
                                                            ),
                                                        )}
                                                    </div>
                                                )}

                                                {/* Custom Note */}
                                                {(lineItem.note ||
                                                    lineItem.custom_fields?.[0]
                                                        ?.value) && (
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#595959",
                                                            fontStyle: "italic",
                                                            background: "#fff",
                                                            padding: "2px 6px",
                                                            borderRadius: 4,
                                                            border: "1px dashed #d9d9d9",
                                                        }}
                                                    >
                                                        ✍️ "
                                                        {lineItem.note ||
                                                            lineItem
                                                                .custom_fields?.[0]
                                                                ?.value}
                                                        "
                                                    </div>
                                                )}

                                                {/* Quantity Stepper & Line Price */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "space-between",
                                                        marginTop: 4,
                                                        paddingTop: 6,
                                                        borderTop:
                                                            "1px dashed #e8e8e8",
                                                    }}
                                                >
                                                    <Space size={4}>
                                                        <Button
                                                            size="small"
                                                            icon={
                                                                <MinusOutlined />
                                                            }
                                                            shape="circle"
                                                            style={{
                                                                width: 22,
                                                                height: 22,
                                                                minWidth: 22,
                                                            }}
                                                            onClick={() =>
                                                                handleQuickQuantity(
                                                                    uniqueKey,
                                                                    -1,
                                                                )
                                                            }
                                                        />
                                                        <span
                                                            style={{
                                                                fontWeight: 600,
                                                                minWidth: 20,
                                                                textAlign:
                                                                    "center",
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            {lineItem.quantity ||
                                                                1}
                                                        </span>
                                                        <Button
                                                            size="small"
                                                            icon={
                                                                <PlusOutlined />
                                                            }
                                                            shape="circle"
                                                            style={{
                                                                width: 22,
                                                                height: 22,
                                                                minWidth: 22,
                                                            }}
                                                            onClick={() =>
                                                                handleQuickQuantity(
                                                                    uniqueKey,
                                                                    1,
                                                                )
                                                            }
                                                        />
                                                        <Text
                                                            type="secondary"
                                                            style={{
                                                                fontSize: 11,
                                                                marginLeft: 4,
                                                            }}
                                                        >
                                                            @ €
                                                            {unitPrice.toFixed(
                                                                2,
                                                            )}
                                                        </Text>
                                                    </Space>

                                                    <Text
                                                        strong
                                                        style={{
                                                            fontSize: 14,
                                                            color: "#389e0d",
                                                        }}
                                                    >
                                                        €{lineTotal.toFixed(2)}
                                                    </Text>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Divider style={{ margin: "8px 0" }} />

                                {/* Total Summary */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 14 }}
                                    >
                                        Order Total:
                                    </Text>
                                    <span
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: "#1677ff",
                                        }}
                                    >
                                        €{cartTotalAmount.toFixed(2)}
                                    </span>
                                </div>

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<ShoppingCartOutlined />}
                                    onClick={() => onNext()}
                                    disabled={selectedItems.length === 0}
                                    style={{ marginTop: 8 }}
                                >
                                    Proceed to Client Details →
                                </Button>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Bottom Actions Bar */}
            <Flex justify="end" className="mt-5">
                <Button
                    onClick={() => onNext()}
                    type="primary"
                    disabled={selectedItems.length === 0}
                >
                    Next Step ({selectedItems.length} items)
                </Button>
            </Flex>

            {/* Cashier Item Customization Modal */}
            <ProductCustomizationModal
                open={!!activeModalProduct}
                product={activeModalProduct}
                initialItem={editingItem}
                onClose={() => {
                    setActiveModalProduct(null);
                    setEditingItem(null);
                }}
                onSave={handleSaveConfiguredItem}
            />
        </>
    );
}
