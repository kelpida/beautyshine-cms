import {
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Flex,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Switch,
    Tag,
    Typography,
    message,
} from "antd";
import React, { useState } from "react";
import {
    PlusOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import SelectField from "@/Components/Form/SelectField";

const { Text } = Typography;

interface AttributeOption {
    id?: number;
    name: string;
    extra_price?: number;
    is_available?: boolean;
    sort_order?: number;
    translations?: Array<{ locale: string; name: string }>;
}

interface ProductAttributeItem {
    id?: number;
    attribute_id: number;
    name: string;
    format_type?: string;
    is_required?: boolean;
    sort_order?: number;
    options: AttributeOption[];
}

interface AttributesStepProps {
    data: any;
    setData: any;
    availableAttributes: any[];
}

export default function AttributesStep({
    data,
    setData,
    availableAttributes = [],
}: AttributesStepProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAttrIds, setSelectedAttrIds] = useState<number[]>([]);
    const [newOptionInputs, setNewOptionInputs] = useState<
        Record<number, { name: string; extra_price: number }>
    >({});

    const productAttributes: ProductAttributeItem[] = Array.isArray(
        data.attributes,
    )
        ? data.attributes
        : [];

    const handleAddAttribute = () => {
        if (!selectedAttrIds || selectedAttrIds.length === 0) {
            message.warning("Please select at least one attribute first");
            return;
        }

        const toAdd = availableAttributes.filter(
            (a) =>
                selectedAttrIds.includes(a.id) &&
                !productAttributes.some((pa) => pa.attribute_id === a.id),
        );

        if (toAdd.length === 0) {
            message.warning("Selected attributes are already added");
            return;
        }

        const newAttrs: ProductAttributeItem[] = toAdd.map((found, idx) => ({
            attribute_id: found.id,
            name: found.name,
            format_type: found.format_type || "select",
            is_required: true,
            sort_order: productAttributes.length + idx + 1,
            options: [],
        }));

        setData("attributes", [...productAttributes, ...newAttrs]);
        setIsAddModalOpen(false);
        setSelectedAttrIds([]);
        message.success(
            toAdd.length === 1
                ? `Attribute "${toAdd[0].name}" added`
                : `${toAdd.length} attributes added successfully`,
        );
    };

    const handleRemoveAttribute = (index: number) => {
        const updated = [...productAttributes];
        updated.splice(index, 1);
        setData("attributes", updated);
    };

    const handleToggleRequired = (index: number, checked: boolean) => {
        const updated = [...productAttributes];
        updated[index].is_required = checked;
        setData("attributes", updated);
    };

    const handleAddOption = (attrIndex: number) => {
        const input = newOptionInputs[attrIndex];
        if (!input || !input.name.trim()) {
            message.warning("Please enter an option name");
            return;
        }

        const updated = [...productAttributes];
        const currentOptions = updated[attrIndex].options || [];

        currentOptions.push({
            name: input.name.trim(),
            extra_price: Number(input.extra_price) || 0,
            is_available: true,
            sort_order: currentOptions.length + 1,
        });

        updated[attrIndex].options = currentOptions;
        setData("attributes", updated);

        // Reset input for this attribute
        setNewOptionInputs((prev) => ({
            ...prev,
            [attrIndex]: { name: "", extra_price: 0 },
        }));
    };

    const handleRemoveOption = (attrIndex: number, optIndex: number) => {
        const updated = [...productAttributes];
        updated[attrIndex].options.splice(optIndex, 1);
        setData("attributes", updated);
    };

    const unassignedAttributes = availableAttributes.filter(
        (a) => !productAttributes.some((pa) => pa.attribute_id === a.id),
    );

    return (
        <div>
            <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: 20 }}
            >
                <div>
                    <Text strong style={{ fontSize: 16 }}>
                        Product Customisation Options & Attributes
                    </Text>
                    <div>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Define options like size, flavour, filling, or color
                            with optional price adjustments.
                        </Text>
                    </div>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Add Attribute
                </Button>
            </Flex>

            {productAttributes.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No attributes added yet. Click 'Add Attribute' to add customisation options."
                >
                    <Button
                        type="primary"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add First Attribute
                    </Button>
                </Empty>
            ) : (
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                >
                    {productAttributes.map((attr, attrIdx) => (
                        <Card
                            key={attr.attribute_id || attrIdx}
                            size="small"
                            bordered
                            style={{
                                borderRadius: 8,
                                borderColor: "#e8e8e8",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                            }}
                            title={
                                <Flex
                                    justify="space-between"
                                    align="center"
                                    wrap="wrap"
                                >
                                    <Space size="middle">
                                        <AppstoreOutlined
                                            style={{ color: "#f73859" }}
                                        />
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                fontSize: 15,
                                            }}
                                        >
                                            {attr.name}
                                        </span>
                                        <Tag color="blue">
                                            {(
                                                attr.format_type || "select"
                                            ).toUpperCase()}
                                        </Tag>
                                        <Tag
                                            color={
                                                attr.is_required
                                                    ? "red"
                                                    : "default"
                                            }
                                        >
                                            {attr.is_required
                                                ? "Required"
                                                : "Optional"}
                                        </Tag>
                                    </Space>

                                    <Space>
                                        <span style={{ fontSize: 13 }}>
                                            Required:
                                        </span>
                                        <Switch
                                            checked={Boolean(attr.is_required)}
                                            onChange={(checked) =>
                                                handleToggleRequired(
                                                    attrIdx,
                                                    checked,
                                                )
                                            }
                                            size="small"
                                        />
                                        <Popconfirm
                                            title="Delete this attribute from product?"
                                            onConfirm={() =>
                                                handleRemoveAttribute(attrIdx)
                                            }
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
                                    </Space>
                                </Flex>
                            }
                        >
                            {/* Options List */}
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Configured Options:
                                </Text>
                                <div style={{ marginTop: 8 }}>
                                    {!attr.options ||
                                    attr.options.length === 0 ? (
                                        <Text
                                            type="secondary"
                                            style={{
                                                fontSize: 13,
                                                fontStyle: "italic",
                                            }}
                                        >
                                            No options added yet for {attr.name}
                                            . Add options below.
                                        </Text>
                                    ) : (
                                        <Flex wrap="wrap" gap={8}>
                                            {attr.options.map((opt, optIdx) => (
                                                <Tag
                                                    key={optIdx}
                                                    closable
                                                    onClose={() =>
                                                        handleRemoveOption(
                                                            attrIdx,
                                                            optIdx,
                                                        )
                                                    }
                                                    color="purple"
                                                    style={{
                                                        padding: "4px 10px",
                                                        fontSize: 13,
                                                        borderRadius: 4,
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {opt.name}
                                                    </span>
                                                    {Boolean(
                                                        opt.extra_price &&
                                                        Number(
                                                            opt.extra_price,
                                                        ) > 0,
                                                    ) && (
                                                        <span
                                                            style={{
                                                                color: "#52c41a",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            (+€
                                                            {Number(
                                                                opt.extra_price,
                                                            ).toFixed(2)}
                                                            )
                                                        </span>
                                                    )}
                                                </Tag>
                                            ))}
                                        </Flex>
                                    )}
                                </div>
                            </div>

                            {/* Quick Add Option */}
                            <Divider style={{ margin: "12px 0" }} />
                            <Row gutter={12} align="middle">
                                <Col xs={24} sm={10}>
                                    <Input
                                        placeholder={`New ${attr.name} Option (e.g. Heart, Small, Chocolate)`}
                                        value={
                                            newOptionInputs[attrIdx]?.name || ""
                                        }
                                        onChange={(e) =>
                                            setNewOptionInputs((prev) => ({
                                                ...prev,
                                                [attrIdx]: {
                                                    ...prev[attrIdx],
                                                    name: e.target.value,
                                                    extra_price:
                                                        prev[attrIdx]
                                                            ?.extra_price || 0,
                                                },
                                            }))
                                        }
                                        onPressEnter={() =>
                                            handleAddOption(attrIdx)
                                        }
                                    />
                                </Col>
                                <Col xs={14} sm={8}>
                                    <InputNumber
                                        style={{ width: "100%" }}
                                        placeholder="Extra price (€)"
                                        min={0}
                                        step={0.5}
                                        value={
                                            newOptionInputs[attrIdx]
                                                ?.extra_price || 0
                                        }
                                        prefix={<span>+ €</span>}
                                        onChange={(val) =>
                                            setNewOptionInputs((prev) => ({
                                                ...prev,
                                                [attrIdx]: {
                                                    ...prev[attrIdx],
                                                    name:
                                                        prev[attrIdx]?.name ||
                                                        "",
                                                    extra_price:
                                                        Number(val) || 0,
                                                },
                                            }))
                                        }
                                    />
                                </Col>
                                <Col xs={10} sm={6}>
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={() => handleAddOption(attrIdx)}
                                        block
                                    >
                                        Add Option
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </Space>
            )}

            {/* Modal to add an attribute from available ones */}
            <Modal
                title="Select Attributes to Add"
                open={isAddModalOpen}
                onCancel={() => {
                    setIsAddModalOpen(false);
                    setSelectedAttrIds([]);
                }}
                onOk={handleAddAttribute}
                okText="Add to Product"
                okButtonProps={{ disabled: selectedAttrIds.length === 0 }}
            >
                <div style={{ margin: "16px 0" }}>
                    <Text type="secondary">
                        Choose attributes from your store's attribute catalog:
                    </Text>
                </div>
                <SelectField
                    placeholder="Choose attributes (e.g. Size, Flavour, Colour, Shape)..."
                    value={selectedAttrIds}
                    mode="multiple"
                    onChange={(e: any) => setSelectedAttrIds(e.target.value || [])}
                    options={unassignedAttributes.map((a) => ({
                        value: a.id,
                        label: `${a.name} (${(a.format_type || "select").toUpperCase()})`,
                    }))}
                />
            </Modal>
        </div>
    );
}
