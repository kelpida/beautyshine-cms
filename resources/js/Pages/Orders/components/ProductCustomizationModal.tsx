import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Button,
    Radio,
    Checkbox,
    Input,
    InputNumber,
    Typography,
    Space,
    Divider,
    Tag,
    Row,
    Col,
    Card,
    Badge,
} from "antd";
import {
    PlusOutlined,
    MinusOutlined,
    ShoppingCartOutlined,
    CheckCircleFilled,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ProductCustomizationModalProps {
    open: boolean;
    onClose: () => void;
    product: any;
    initialItem?: any;
    onSave: (itemData: any) => void;
}

export default function ProductCustomizationModal({
    open,
    onClose,
    product,
    initialItem,
    onSave,
}: ProductCustomizationModalProps) {
    if (!product) return null;

    const variations = product.variations || [];
    const addons = product.addons || [];
    const customFields = product.customFields || product.custom_fields || [];

    // State
    const [selectedVariationId, setSelectedVariationId] = useState<
        number | null
    >(null);
    const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
    const [customNote, setCustomNote] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);

    // Initialize or reset form when modal opens or product/initialItem changes
    useEffect(() => {
        if (open) {
            if (initialItem) {
                setSelectedVariationId(
                    initialItem.variation_id ?? (variations[0]?.id || null),
                );
                const addonIds = (initialItem.options || [])
                    .filter((opt: any) => opt.addon_id)
                    .map((opt: any) => opt.addon_id);
                setSelectedAddonIds(addonIds);
                setCustomNote(
                    initialItem.note ||
                        initialItem.custom_fields?.[0]?.value ||
                        "",
                );
                setQuantity(initialItem.quantity || 1);
            } else {
                setSelectedVariationId(
                    variations.length > 0 ? variations[0].id : null,
                );
                setSelectedAddonIds([]);
                setCustomNote("");
                setQuantity(1);
            }
        }
    }, [open, product, initialItem]);

    // Resolved selected variation object
    const selectedVariation = useMemo(() => {
        if (!selectedVariationId) return null;
        return (
            variations.find((v: any) => v.id === selectedVariationId) || null
        );
    }, [variations, selectedVariationId]);

    // Base / variation unit price
    const baseUnitPrice = useMemo(() => {
        if (selectedVariation) {
            return parseFloat(
                selectedVariation.sale_price !== null &&
                    selectedVariation.sale_price !== undefined
                    ? selectedVariation.sale_price
                    : selectedVariation.price || 0,
            );
        }
        return parseFloat(
            product.sale_price !== null && product.sale_price !== undefined
                ? product.sale_price
                : product.base_price || 0,
        );
    }, [selectedVariation, product]);

    // Addons unit price
    const addonsUnitPrice = useMemo(() => {
        return selectedAddonIds.reduce((sum, addonId) => {
            const addon = addons.find((a: any) => a.id === addonId);
            if (!addon) return sum;
            const price = parseFloat(
                addon.sale_price !== null && addon.sale_price !== undefined
                    ? addon.sale_price
                    : addon.price || 0,
            );
            return sum + (isNaN(price) ? 0 : price);
        }, 0);
    }, [selectedAddonIds, addons]);

    const unitPrice = baseUnitPrice + addonsUnitPrice;
    const totalPrice = unitPrice * quantity;

    const handleToggleAddon = (addonId: number) => {
        setSelectedAddonIds((prev) =>
            prev.includes(addonId)
                ? prev.filter((id) => id !== addonId)
                : [...prev, addonId],
        );
    };

    const handleSave = () => {
        const selectedAddonsList = addons.filter((a: any) =>
            selectedAddonIds.includes(a.id),
        );

        const itemOptions = selectedAddonsList.map((addon: any) => {
            const priceModifier = parseFloat(
                addon.sale_price !== null && addon.sale_price !== undefined
                    ? addon.sale_price
                    : addon.price || 0,
            );
            return {
                attribute_name: "Addon",
                option_name: addon.name,
                price_modifier: priceModifier,
                addon_id: addon.id,
            };
        });

        const customFieldsData = customNote.trim()
            ? [
                  {
                      field_name: "Inscription / Note",
                      value: customNote.trim(),
                  },
              ]
            : [];

        const uniqueKey =
            initialItem?.unique_key ||
            `item-${product.id}-${selectedVariationId || "base"}-${Date.now()}-${Math.floor(
                Math.random() * 1000,
            )}`;

        const itemData = {
            unique_key: uniqueKey,
            item_id: product.id,
            product_id: product.id,
            product_name: product.name,
            product_image:
                product.main_image?.url || product.image?.url || null,
            variation_id: selectedVariationId || null,
            variation_name: selectedVariation ? selectedVariation.name : null,
            price: baseUnitPrice,
            unit_price: unitPrice,
            quantity: quantity,
            total_price: totalPrice,
            options: itemOptions,
            custom_fields: customFieldsData,
            note: customNote.trim(),
        };

        onSave(itemData);
        onClose();
    };

    const imageUrl = product.main_image?.url || product.image?.url;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={680}
            centered
            title={
                <Space align="center" size={12}>
                    <ShoppingCartOutlined
                        style={{ fontSize: 20, color: "#1677ff" }}
                    />
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>
                            {product.name}
                        </div>
                        <Text
                            type="secondary"
                            style={{ fontSize: 13, fontWeight: "normal" }}
                        >
                            Cashier Item Customization
                        </Text>
                    </div>
                </Space>
            }
            footer={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 0",
                    }}
                >
                    <div style={{ textAlign: "left" }}>
                        <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                        >
                            Unit: €{unitPrice.toFixed(2)} × {quantity}
                        </Text>
                        <span
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#52c41a",
                            }}
                        >
                            Total: €{totalPrice.toFixed(2)}
                        </span>
                    </div>
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={handleSave}
                        >
                            {initialItem ? "Update Item" : "Add to Order"}
                        </Button>
                    </Space>
                </div>
            }
        >
            <div
                style={{
                    maxHeight: "65vh",
                    overflowY: "auto",
                    paddingRight: 4,
                }}
            >
                {/* Product Header Information */}
                <div
                    style={{
                        display: "flex",
                        gap: 16,
                        background: "#fafafa",
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                    }}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            style={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 6,
                                border: "1px solid #e8e8e8",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 6,
                                background: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#999",
                                fontSize: 24,
                            }}
                        >
                            🍰
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 600,
                                color: "#1f1f1f",
                            }}
                        >
                            {product.name}
                        </div>
                        {product.short_description && (
                            <Paragraph
                                type="secondary"
                                ellipsis={{ rows: 2 }}
                                style={{ margin: "4px 0", fontSize: 13 }}
                            >
                                {product.short_description}
                            </Paragraph>
                        )}
                        <div style={{ marginTop: 4 }}>
                            <Text
                                strong
                                style={{ fontSize: 15, color: "#1677ff" }}
                            >
                                Base Price: €
                                {parseFloat(
                                    product.sale_price ??
                                        product.base_price ??
                                        0,
                                ).toFixed(2)}
                            </Text>
                        </div>
                    </div>
                </div>

                {/* 1. VARIATIONS SECTION */}
                {variations.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 8,
                            }}
                        >
                            <Text strong style={{ fontSize: 15 }}>
                                Select Variation / Size
                            </Text>
                            <Tag color="red" style={{ marginLeft: 8 }}>
                                Required
                            </Tag>
                        </div>

                        <Radio.Group
                            value={selectedVariationId}
                            onChange={(e) =>
                                setSelectedVariationId(e.target.value)
                            }
                            style={{ width: "100%" }}
                        >
                            <Row gutter={[10, 10]}>
                                {variations.map((v: any) => {
                                    const isSelected =
                                        selectedVariationId === v.id;
                                    const price = parseFloat(
                                        v.sale_price ?? v.price ?? 0,
                                    );
                                    return (
                                        <Col key={v.id} span={12}>
                                            <div
                                                onClick={() =>
                                                    setSelectedVariationId(v.id)
                                                }
                                                style={{
                                                    border: isSelected
                                                        ? "2px solid #1677ff"
                                                        : "1px solid #d9d9d9",
                                                    borderRadius: 8,
                                                    padding: "10px 12px",
                                                    background: isSelected
                                                        ? "#e6f4ff"
                                                        : "#fff",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s",
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Space>
                                                    <Radio value={v.id} />
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontWeight:
                                                                    isSelected
                                                                        ? 600
                                                                        : 500,
                                                                color: isSelected
                                                                    ? "#0958d9"
                                                                    : "#262626",
                                                            }}
                                                        >
                                                            {v.name}
                                                        </div>
                                                        {v.attributeOptions
                                                            ?.length > 0 && (
                                                            <Text
                                                                type="secondary"
                                                                style={{
                                                                    fontSize: 11,
                                                                }}
                                                            >
                                                                {v.attributeOptions
                                                                    .map(
                                                                        (
                                                                            opt: any,
                                                                        ) =>
                                                                            opt.name,
                                                                    )
                                                                    .join(
                                                                        " / ",
                                                                    )}
                                                            </Text>
                                                        )}
                                                    </div>
                                                </Space>
                                                <Tag
                                                    color={
                                                        isSelected
                                                            ? "blue"
                                                            : "default"
                                                    }
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 13,
                                                        margin: 0,
                                                    }}
                                                >
                                                    €{price.toFixed(2)}
                                                </Tag>
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Radio.Group>
                    </div>
                )}

                {/* 2. ADD-ONS SECTION */}
                {addons.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 8,
                            }}
                        >
                            <Text strong style={{ fontSize: 15 }}>
                                Add-ons & Extras
                            </Text>
                            <Tag color="green" style={{ marginLeft: 8 }}>
                                Optional
                            </Tag>
                        </div>

                        <Row gutter={[10, 10]}>
                            {addons.map((addon: any) => {
                                const isSelected = selectedAddonIds.includes(
                                    addon.id,
                                );
                                const addonPrice = parseFloat(
                                    addon.sale_price ?? addon.price ?? 0,
                                );
                                return (
                                    <Col key={addon.id} span={12}>
                                        <div
                                            onClick={() =>
                                                handleToggleAddon(addon.id)
                                            }
                                            style={{
                                                border: isSelected
                                                    ? "2px solid #52c41a"
                                                    : "1px solid #d9d9d9",
                                                borderRadius: 8,
                                                padding: "10px 12px",
                                                background: isSelected
                                                    ? "#f6ffed"
                                                    : "#fff",
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Space>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        handleToggleAddon(
                                                            addon.id,
                                                        )
                                                    }
                                                />
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                isSelected
                                                                    ? 600
                                                                    : 500,
                                                            color: isSelected
                                                                ? "#389e0d"
                                                                : "#262626",
                                                        }}
                                                    >
                                                        {addon.name}
                                                    </div>
                                                    {addon.description && (
                                                        <Text
                                                            type="secondary"
                                                            style={{
                                                                fontSize: 11,
                                                            }}
                                                        >
                                                            {addon.description}
                                                        </Text>
                                                    )}
                                                </div>
                                            </Space>
                                            <Tag
                                                color={
                                                    isSelected
                                                        ? "success"
                                                        : "default"
                                                }
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: 13,
                                                    margin: 0,
                                                }}
                                            >
                                                +€{addonPrice.toFixed(2)}
                                            </Tag>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                )}

                {/* 3. CUSTOM MESSAGE / INSCRIPTION */}
                <div style={{ marginBottom: 20 }}>
                    <Text
                        strong
                        style={{
                            fontSize: 15,
                            display: "block",
                            marginBottom: 6,
                        }}
                    >
                        Cake Inscription / Special Instructions
                    </Text>
                    <TextArea
                        rows={2}
                        placeholder="e.g. Write on cake: 'Happy 30th Birthday Elena!', dietary notes, or packaging request..."
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        maxLength={255}
                        showCount
                    />
                </div>

                <Divider style={{ margin: "16px 0" }} />

                {/* 4. QUANTITY SELECTOR */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#f5f5f5",
                        padding: "12px 16px",
                        borderRadius: 8,
                    }}
                >
                    <div>
                        <Text strong style={{ fontSize: 15 }}>
                            Quantity
                        </Text>
                        <Text
                            type="secondary"
                            style={{ display: "block", fontSize: 12 }}
                        >
                            Number of items with this configuration
                        </Text>
                    </div>

                    <Space size={8}>
                        <Button
                            icon={<MinusOutlined />}
                            shape="circle"
                            size="middle"
                            disabled={quantity <= 1}
                            onClick={() =>
                                setQuantity((q) => Math.max(1, q - 1))
                            }
                        />
                        <InputNumber
                            min={1}
                            max={999}
                            value={quantity}
                            onChange={(val) =>
                                setQuantity(val ? Math.max(1, val) : 1)
                            }
                            style={{ width: 64, textAlign: "center" }}
                        />
                        <Button
                            icon={<PlusOutlined />}
                            shape="circle"
                            size="middle"
                            onClick={() => setQuantity((q) => q + 1)}
                        />
                    </Space>
                </div>
            </div>
        </Modal>
    );
}
