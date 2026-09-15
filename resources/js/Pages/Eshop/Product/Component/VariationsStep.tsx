import {
    Alert,
    Button,
    Card,
    Col,
    Empty,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Select,
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

const { Text } = Typography;

interface VariationItem {
    id?: number;
    sku: string;
    name: string;
    short_description?: string;
    price: number | string;
    sale_price?: number | string | null;
    quantity?: number;
    is_available?: boolean;
    attribute_option_ids?: number[];
    attribute_tags?: string[];
}

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
    const [form] = Form.useForm();

    const isConfigurable = data.product_type === "configurable";
    const variations: VariationItem[] = Array.isArray(data.variations)
        ? data.variations
        : [];
    const productAttributes = Array.isArray(data.attributes) ? data.attributes : [];

    const handleOpenAddModal = () => {
        setEditingIndex(null);
        form.resetFields();
        form.setFieldsValue({
            price: data.base_price || 0,
            quantity: 10,
            is_available: true,
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (record: VariationItem, index: number) => {
        setEditingIndex(index);
        form.setFieldsValue({
            name: record.name,
            sku: record.sku,
            price: record.price,
            sale_price: record.sale_price,
            quantity: record.quantity,
            is_available: record.is_available ?? true,
            attribute_tags: record.attribute_tags,
        });
        setIsModalOpen(true);
    };

    const handleModalSubmit = () => {
        form.validateFields().then((values) => {
            const updated = [...variations];
            const newVar: VariationItem = {
                ...values,
                price: Number(values.price) || 0,
                quantity: Number(values.quantity) || 0,
                is_available: Boolean(values.is_available),
            };

            if (editingIndex !== null) {
                updated[editingIndex] = {
                    ...updated[editingIndex],
                    ...newVar,
                };
                message.success("Variation updated");
            } else {
                updated.push(newVar);
                message.success("Variation added");
            }

            setData("variations", updated);
            setIsModalOpen(false);
        });
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
                const totalExtra = comb.reduce((sum, c) => sum + c.extraPrice, 0);
                const skuCode = comb.map((c) => c.optName.substring(0, 2).toUpperCase()).join("-");

                return {
                    name: names,
                    sku: `${prefix}-${skuCode}-${idx + 1}`,
                    price: basePrice + totalExtra,
                    quantity: 10,
                    is_available: true,
                    attribute_tags: comb.map((c) => c.optName),
                };
            },
        );

        setData("variations", newVariations);
        message.success(`Generated ${newVariations.length} variations successfully!`);
    };

    if (!isConfigurable) {
        return (
            <Card style={{ textAlign: "center", padding: "30px 20px" }}>
                <BranchesOutlined style={{ fontSize: 42, color: "#bfbfbf", marginBottom: 16 }} />
                <h3>Product Type is "Simple"</h3>
                <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
                    Simple products do not have variations. If this product comes in different sizes, shapes, or flavours with their own SKU, price, or inventory, change the Product Type to "Configurable" in Step 1 (General).
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
            render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>,
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
            render: (sku: string) => <Tag color="default">{sku}</Tag>,
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price: number | string) => (
                <span style={{ fontWeight: 600 }}>
                    €{Number(price || 0).toFixed(2)}
                </span>
            ),
        },
        {
            title: "Stock",
            dataIndex: "quantity",
            key: "quantity",
            render: (qty: number) => (
                <Tag color={Number(qty) > 0 ? "green" : "red"}>
                    {qty ?? 0} in stock
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "is_available",
            key: "is_available",
            render: (available: boolean, record: VariationItem, idx: number) => (
                <Switch
                    checked={available !== false}
                    onChange={(checked) => handleToggleAvailable(idx, checked)}
                    size="small"
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 110,
            render: (_: any, record: VariationItem, idx: number) => (
                <Flex gap={8}>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleOpenEditModal(record, idx)}
                    />
                    <Popconfirm
                        title="Delete this variation?"
                        onConfirm={() => handleDeleteVariation(idx)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                </Flex>
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

            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap={12}>
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

            {/* Add / Edit Variation Modal */}
            <Modal
                title={editingIndex !== null ? "Edit Variation" : "Add Variation"}
                open={isModalOpen}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save Variation"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="name"
                        label="Variation Name"
                        rules={[{ required: true, message: "Please enter variation name" }]}
                    >
                        <Input placeholder="e.g. Heart / Small / Vanilla" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="sku"
                                label="SKU"
                                rules={[{ required: true, message: "Please enter SKU" }]}
                            >
                                <Input placeholder="e.g. VH-S" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="quantity"
                                label="Stock Quantity"
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Price (€)"
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} step={0.5} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="sale_price" label="Sale Price (€)">
                                <InputNumber min={0} step={0.5} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="is_available"
                        label="Is Available"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
