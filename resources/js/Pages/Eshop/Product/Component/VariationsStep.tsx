import {
    Alert,
    Button,
    Card,
    Empty,
    Flex,
    Popconfirm,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import React, { useState } from "react";
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    ThunderboltOutlined,
    BranchesOutlined,
} from "@ant-design/icons";
import VariationModal, { VariationItem } from "./VariationModal";

const { Text } = Typography;

interface VariationsStepProps {
    data: any;
    setData: any;
    errors: any;
}

export default function VariationsStep({
    data,
    setData,
    errors,
}: VariationsStepProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const isConfigurable = data.product_type === "configurable";
    const variations: VariationItem[] = Array.isArray(data.variations)
        ? data.variations
        : [];
    const productAttributes = Array.isArray(data.attributes)
        ? data.attributes
        : [];

    const handleOpenAddModal = () => {
        setEditingIndex(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (record: VariationItem, index: number) => {
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const handleSaveVariation = (
        newVar: VariationItem,
        index: number | null,
    ) => {
        const updated = [...variations];
        if (index !== null && index >= 0) {
            updated[index] = {
                ...updated[index],
                ...newVar,
            };
            message.success("Variation updated");
        } else {
            updated.push(newVar);
            message.success("Variation added");
        }

        setData("variations", updated);
        setIsModalOpen(false);
    };

    const handleDeleteVariation = (index: number) => {
        const updated = [...variations];
        updated.splice(index, 1);
        setData("variations", updated);
        message.success("Variation removed");
    };

    const handleToggleAvailable = (index: number, checked: boolean) => {
        const updated = [...variations];
        updated[index].is_available = checked;
        setData("variations", updated);
    };

    // Auto-generate cartesian matrix of combinations from attributes
    const handleGenerateVariations = () => {
        const validAttrs = productAttributes.filter(
            (a: any) => a.options && a.options.length > 0,
        );

        if (validAttrs.length === 0) {
            message.warning("Please define attribute options in Step 4 first.");
            return;
        }

        // Cartesian product helper
        const cartesian = (arrays: any[][]) =>
            arrays.reduce(
                (acc, curr) => acc.flatMap((c) => curr.map((n) => [...c, n])),
                [[]] as any[][],
            );

        const optionsArray = validAttrs.map((a: any) =>
            a.options.map((opt: any) => ({
                attrId: a.attribute_id,
                attrName: a.name,
                optName: opt.name,
                optId: opt.id,
                extraPrice: Number(opt.extra_price) || 0,
            })),
        );

        const combinations = cartesian(optionsArray);
        const basePrice = Number(data.base_price) || 0;
        const prefix = (data.slug || "prod").substring(0, 4).toUpperCase();

        const newVariations: VariationItem[] = combinations.map(
            (comb: any[], idx: number) => {
                const names = comb.map((c) => c.optName).join(" / ");
                const totalExtra = comb.reduce(
                    (sum, c) => sum + c.extraPrice,
                    0,
                );
                const skuCode = comb
                    .map((c) => c.optName.substring(0, 2).toUpperCase())
                    .join("-");

                const attrOptionsMap: Record<string, any> = {};
                comb.forEach((c) => {
                    attrOptionsMap[String(c.attrId)] = c.optId ?? c.optName;
                });

                return {
                    name: names,
                    sku: `${prefix}-${skuCode}-${idx + 1}`,
                    price: basePrice + totalExtra,
                    quantity: 10,
                    is_available: true,
                    attribute_tags: comb.map((c) => c.optName),
                    attribute_option_ids: comb
                        .map((c) => c.optId)
                        .filter(Boolean),
                    attribute_options: attrOptionsMap,
                };
            },
        );

        setData("variations", newVariations);
        message.success(
            `Generated ${newVariations.length} variations successfully!`,
        );
    };

    if (!isConfigurable) {
        return (
            <Card style={{ textAlign: "center", padding: "30px 20px" }}>
                <BranchesOutlined
                    style={{ fontSize: 42, color: "#bfbfbf", marginBottom: 16 }}
                />
                <h3>Product Type is "Simple"</h3>
                <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 20 }}
                >
                    Simple products do not have variations. If this product
                    comes in different sizes, shapes, or flavours with their own
                    SKU, price, or inventory, change the Product Type to
                    "Configurable" in Step 1 (General).
                </Text>
                <Button
                    type="primary"
                    onClick={() => setData("product_type", "configurable")}
                >
                    Switch to Configurable Product
                </Button>
            </Card>
        );
    }

    const columns = [
        {
            title: "Variation",
            dataIndex: "name",
            key: "name",
            render: (name: string) => (
                <span style={{ fontWeight: 600 }}>{name}</span>
            ),
        },
        {
            title: "Attributes",
            key: "attributes",
            render: (_: any, record: VariationItem) => (
                <Space wrap size={4}>
                    {(record.attribute_tags || record.name.split("/")).map(
                        (tagStr, idx) => (
                            <Tag key={idx} color="geekblue">
                                {tagStr.trim()}
                            </Tag>
                        ),
                    )}
                </Space>
            ),
        },
        {
            title: "SKU",
            dataIndex: "sku",
            key: "sku",
            render: (sku: string) => (
                <span style={{ fontFamily: "monospace" }}>{sku}</span>
            ),
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price: number | string, record: VariationItem) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: 600 }}>
                        €{Number(price).toFixed(2)}
                    </span>
                    {Boolean(record.sale_price) && (
                        <span style={{ color: "#ff4d4f", fontSize: 12 }}>
                            Sale: €{Number(record.sale_price).toFixed(2)}
                        </span>
                    )}
                </Space>
            ),
        },
        {
            title: "Stock",
            dataIndex: "quantity",
            key: "quantity",
            render: (qty: number) => (
                <Tag color={Number(qty) > 0 ? "green" : "red"}>
                    {Number(qty) > 0 ? `${qty} in stock` : "Out of stock"}
                </Tag>
            ),
        },
        {
            title: "Available",
            dataIndex: "is_available",
            key: "is_available",
            render: (avail: boolean, _: any, idx: number) => (
                <Switch
                    checked={Boolean(avail)}
                    onChange={(checked) => handleToggleAvailable(idx, checked)}
                    size="small"
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: VariationItem, idx: number) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEditModal(record, idx)}
                    />
                    <Popconfirm
                        title="Delete this variation?"
                        onConfirm={() => handleDeleteVariation(idx)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Alert
                message="Create variations for valid combinations"
                description="Only available combinations will be shown to customers in the storefront."
                type="info"
                showIcon
                style={{ marginBottom: 20 }}
            />

            <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: 16 }}
                wrap="wrap"
                gap={12}
            >
                <div>
                    <Text strong style={{ fontSize: 16 }}>
                        Configured Variations ({variations.length})
                    </Text>
                </div>
                <Space>
                    <Button
                        icon={<ThunderboltOutlined />}
                        onClick={handleGenerateVariations}
                    >
                        Auto-generate Matrix
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenAddModal}
                    >
                        Add Variation
                    </Button>
                </Space>
            </Flex>

            {variations.length === 0 ? (
                <Empty
                    description="No variations added yet. Click 'Auto-generate Matrix' or 'Add Variation'."
                    style={{ margin: "40px 0" }}
                />
            ) : (
                <Table
                    rowKey={(_, idx) => String(idx)}
                    dataSource={variations}
                    columns={columns}
                    pagination={false}
                    bordered
                    size="small"
                />
            )}

            <VariationModal
                open={isModalOpen}
                editingIndex={editingIndex}
                record={editingIndex !== null ? variations[editingIndex] : null}
                productAttributes={productAttributes}
                basePrice={data.base_price || 0}
                productSlug={data.slug || "prod"}
                totalVariationsCount={variations.length}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSaveVariation}
            />
        </div>
    );
}
