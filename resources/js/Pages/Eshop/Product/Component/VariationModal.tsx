import React, { useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Switch,
    Row,
    Col,
    Card,
    Space,
} from "antd";
import { AppstoreOutlined } from "@ant-design/icons";

export interface VariationItem {
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
    attribute_options?: Record<string, any>;
}

interface VariationModalProps {
    open: boolean;
    editingIndex: number | null;
    record?: VariationItem | null;
    productAttributes: any[];
    basePrice?: number | string;
    productSlug?: string;
    totalVariationsCount?: number;
    onCancel: () => void;
    onSave: (variation: VariationItem, index: number | null) => void;
}

export default function VariationModal({
    open,
    editingIndex,
    record = null,
    productAttributes = [],
    basePrice = 0,
    productSlug = "prod",
    totalVariationsCount = 0,
    onCancel,
    onSave,
}: VariationModalProps) {
    const [form] = Form.useForm();
    const isEditing = editingIndex !== null && record !== null;

    useEffect(() => {
        if (!open) return;

        if (isEditing && record) {
            const initialAttrOptions: Record<string, any> = {};
            productAttributes.forEach((attr: any) => {
                const attrKey = String(attr.attribute_id);
                if (
                    record.attribute_options &&
                    record.attribute_options[attrKey] !== undefined
                ) {
                    initialAttrOptions[attrKey] =
                        record.attribute_options[attrKey];
                } else {
                    const matchedById = (attr.options || []).find((opt: any) =>
                        record.attribute_option_ids?.includes(opt.id),
                    );
                    if (matchedById) {
                        initialAttrOptions[attrKey] = matchedById.id;
                    } else {
                        const tags =
                            record.attribute_tags ||
                            record.name.split("/").map((s) => s.trim());
                        const matchedByName = (attr.options || []).find(
                            (opt: any) => tags.includes(opt.name),
                        );
                        if (matchedByName) {
                            initialAttrOptions[attrKey] =
                                matchedByName.id ?? matchedByName.name;
                        }
                    }
                }
            });

            form.setFieldsValue({
                name: record.name,
                sku: record.sku,
                price: record.price,
                sale_price: record.sale_price,
                quantity: record.quantity ?? 10,
                is_available: record.is_available ?? true,
                attribute_options: initialAttrOptions,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                price: basePrice || 0,
                quantity: 10,
                is_available: true,
                attribute_options: {},
            });
        }
    }, [open, editingIndex, record]);

    const handleAttributeOptionChange = () => {
        const selectedMap = form.getFieldValue("attribute_options") || {};

        const selectedOpts: Array<{
            optName: string;
            optId?: number;
            extraPrice: number;
        }> = [];

        productAttributes.forEach((attr: any) => {
            const val = selectedMap[String(attr.attribute_id)];
            if (val !== undefined && val !== null && val !== "") {
                const found = (attr.options || []).find(
                    (o: any) => o.id === val || o.name === val,
                );
                if (found) {
                    selectedOpts.push({
                        optName: found.name,
                        optId: found.id,
                        extraPrice: Number(found.extra_price) || 0,
                    });
                }
            }
        });

        if (selectedOpts.length > 0) {
            const autoName = selectedOpts.map((o) => o.optName).join(" / ");
            if (!isEditing || !form.getFieldValue("name")) {
                form.setFieldsValue({ name: autoName });
            }

            if (!isEditing) {
                const prefix = (productSlug || "prod")
                    .substring(0, 4)
                    .toUpperCase();
                const skuCode = selectedOpts
                    .map((o) => o.optName.substring(0, 2).toUpperCase())
                    .join("-");
                form.setFieldsValue({
                    sku: `${prefix}-${skuCode}-${totalVariationsCount + 1}`,
                });

                const numBasePrice = Number(basePrice) || 0;
                const totalExtra = selectedOpts.reduce(
                    (sum, o) => sum + o.extraPrice,
                    0,
                );
                form.setFieldsValue({ price: numBasePrice + totalExtra });
            }
        }
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            const selectedMap = values.attribute_options || {};
            const selectedOptionIds: number[] = [];
            const selectedOptionTags: string[] = [];

            productAttributes.forEach((attr: any) => {
                const val = selectedMap[String(attr.attribute_id)];
                if (val !== undefined && val !== null && val !== "") {
                    const found = (attr.options || []).find(
                        (o: any) => o.id === val || o.name === val,
                    );
                    if (found) {
                        if (found.id) selectedOptionIds.push(found.id);
                        selectedOptionTags.push(found.name);
                    }
                }
            });

            const newVar: VariationItem = {
                ...values,
                price: Number(values.price) || 0,
                sale_price: values.sale_price ? Number(values.sale_price) : null,
                quantity: Number(values.quantity) || 0,
                is_available: Boolean(values.is_available),
                attribute_option_ids: selectedOptionIds,
                attribute_tags:
                    selectedOptionTags.length > 0
                        ? selectedOptionTags
                        : values.name
                          ? values.name.split("/").map((s: string) => s.trim())
                          : [],
                attribute_options: selectedMap,
            };

            onSave(newVar, editingIndex);
        });
    };

    return (
        <Modal
            title={isEditing ? "Edit Variation" : "Add Variation"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText="Save Variation"
            width={650}
            destroyOnClose
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                {productAttributes.length > 0 && (
                    <Card
                        size="small"
                        title={
                            <Space>
                                <AppstoreOutlined style={{ color: "#1890ff" }} />
                                <span>Select Attributes for this Variation</span>
                            </Space>
                        }
                        style={{
                            marginBottom: 16,
                            backgroundColor: "#fafafa",
                            borderRadius: 6,
                        }}
                    >
                        <Row gutter={16}>
                            {productAttributes.map((attr: any) => (
                                <Col
                                    xs={24}
                                    sm={
                                        productAttributes.length === 1
                                            ? 24
                                            : 12
                                    }
                                    key={attr.attribute_id}
                                >
                                    <Form.Item
                                        name={[
                                            "attribute_options",
                                            String(attr.attribute_id),
                                        ]}
                                        label={
                                            <span>
                                                <strong>{attr.name}</strong>
                                                {attr.is_required && (
                                                    <span
                                                        style={{
                                                            color: "#ff4d4f",
                                                            marginLeft: 4,
                                                        }}
                                                    >
                                                        *
                                                    </span>
                                                )}
                                            </span>
                                        }
                                        rules={
                                            attr.is_required
                                                ? [
                                                      {
                                                          required: true,
                                                          message: `Please select ${attr.name}`,
                                                      },
                                                  ]
                                                : []
                                        }
                                    >
                                        <Select
                                            placeholder={`Select ${attr.name}`}
                                            allowClear
                                            onChange={
                                                handleAttributeOptionChange
                                            }
                                            options={(attr.options || []).map(
                                                (opt: any) => ({
                                                    label: `${opt.name}${
                                                        opt.extra_price
                                                            ? ` (+€${Number(opt.extra_price).toFixed(2)})`
                                                            : ""
                                                    }`,
                                                    value: opt.id ?? opt.name,
                                                }),
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                )}

                <Form.Item
                    name="name"
                    label="Variation Name"
                    rules={[
                        {
                            required: true,
                            message: "Please enter variation name",
                        },
                    ]}
                >
                    <Input placeholder="e.g. Heart / Small / Vanilla" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="sku"
                            label="SKU"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter SKU",
                                },
                            ]}
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
                            <InputNumber
                                min={0}
                                step={0.5}
                                prefix="€"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="sale_price" label="Sale Price (€)">
                            <InputNumber
                                min={0}
                                step={0.5}
                                prefix="€"
                                style={{ width: "100%" }}
                            />
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
    );
}
