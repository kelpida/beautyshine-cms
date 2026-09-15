import {
    Button,
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
    Tabs,
    Tag,
    Typography,
    message,
} from "antd";
import React, { useState } from "react";
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    GiftOutlined,
    FormOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface AddonItem {
    id?: number;
    name: string;
    description?: string;
    price: number | string;
    sale_price?: number | string | null;
    is_available?: boolean;
    sort_order?: number;
}

interface CustomFieldItem {
    id?: number;
    name: string;
    key?: string;
    field_type: string;
    is_required?: boolean;
    max_length?: number | null;
    sort_order?: number;
    is_active?: boolean;
}

interface AddonsFieldsStepProps {
    data: any;
    setData: any;
}

export default function AddonsFieldsStep({
    data,
    setData,
}: AddonsFieldsStepProps) {
    const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
    const [editingAddonIndex, setEditingAddonIndex] = useState<number | null>(null);
    const [addonForm] = Form.useForm();

    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
    const [fieldForm] = Form.useForm();

    const addons: AddonItem[] = Array.isArray(data.addons) ? data.addons : [];
    const customFields: CustomFieldItem[] = Array.isArray(data.custom_fields)
        ? data.custom_fields
        : [];

    // Addon Handlers
    const handleOpenAddAddon = () => {
        setEditingAddonIndex(null);
        addonForm.resetFields();
        addonForm.setFieldsValue({ price: 0, is_available: true });
        setIsAddonModalOpen(true);
    };

    const handleOpenEditAddon = (item: AddonItem, idx: number) => {
        setEditingAddonIndex(idx);
        addonForm.setFieldsValue({
            name: item.name,
            description: item.description,
            price: item.price,
            is_available: item.is_available ?? true,
        });
        setIsAddonModalOpen(true);
    };

    const handleSaveAddon = () => {
        addonForm.validateFields().then((values) => {
            const updated = [...addons];
            const item: AddonItem = {
                ...values,
                price: Number(values.price) || 0,
                is_available: Boolean(values.is_available),
                sort_order: updated.length + 1,
            };

            if (editingAddonIndex !== null) {
                updated[editingAddonIndex] = item;
                message.success("Add-on updated");
            } else {
                updated.push(item);
                message.success("Add-on added");
            }

            setData("addons", updated);
            setIsAddonModalOpen(false);
        });
    };

    const handleDeleteAddon = (idx: number) => {
        const updated = [...addons];
        updated.splice(idx, 1);
        setData("addons", updated);
    };

    // Custom Field Handlers
    const handleOpenAddField = () => {
        setEditingFieldIndex(null);
        fieldForm.resetFields();
        fieldForm.setFieldsValue({ field_type: "text", is_required: false, is_active: true });
        setIsFieldModalOpen(true);
    };

    const handleOpenEditField = (item: CustomFieldItem, idx: number) => {
        setEditingFieldIndex(idx);
        fieldForm.setFieldsValue({
            name: item.name,
            field_type: item.field_type,
            is_required: item.is_required ?? false,
            max_length: item.max_length,
            is_active: item.is_active ?? true,
        });
        setIsFieldModalOpen(true);
    };

    const handleSaveField = () => {
        fieldForm.validateFields().then((values) => {
            const updated = [...customFields];
            const item: CustomFieldItem = {
                ...values,
                is_required: Boolean(values.is_required),
                is_active: Boolean(values.is_active),
                sort_order: updated.length + 1,
            };

            if (editingFieldIndex !== null) {
                updated[editingFieldIndex] = item;
                message.success("Custom field updated");
            } else {
                updated.push(item);
                message.success("Custom field added");
            }

            setData("custom_fields", updated);
            setIsFieldModalOpen(false);
        });
    };

    const handleDeleteField = (idx: number) => {
        const updated = [...customFields];
        updated.splice(idx, 1);
        setData("custom_fields", updated);
    };

    const addonColumns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (name: string, record: AddonItem) => (
                <div>
                    <span style={{ fontWeight: 600 }}>{name}</span>
                    {record.description && (
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                            {record.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price: number | string) => (
                <span style={{ fontWeight: 600 }}>€{Number(price || 0).toFixed(2)}</span>
            ),
        },
        {
            title: "Available For",
            key: "available_for",
            render: () => <Tag color="blue">All variations</Tag>,
        },
        {
            title: "Status",
            dataIndex: "is_available",
            key: "is_available",
            render: (avail: boolean, record: AddonItem, idx: number) => (
                <Switch
                    checked={avail !== false}
                    onChange={(checked) => {
                        const updated = [...addons];
                        updated[idx].is_available = checked;
                        setData("addons", updated);
                    }}
                    size="small"
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (_: any, record: AddonItem, idx: number) => (
                <Flex gap={8}>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleOpenEditAddon(record, idx)}
                    />
                    <Popconfirm
                        title="Delete this add-on?"
                        onConfirm={() => handleDeleteAddon(idx)}
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

    const fieldColumns = [
        {
            title: "Field Name",
            dataIndex: "name",
            key: "name",
            render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>,
        },
        {
            title: "Field Type",
            dataIndex: "field_type",
            key: "field_type",
            render: (type: string) => (
                <Tag color="cyan">{(type || "text").toUpperCase()}</Tag>
            ),
        },
        {
            title: "Required",
            dataIndex: "is_required",
            key: "is_required",
            render: (req: boolean) => (
                <Tag color={req ? "red" : "default"}>
                    {req ? "Required" : "Optional"}
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            render: (active: boolean, record: CustomFieldItem, idx: number) => (
                <Switch
                    checked={active !== false}
                    onChange={(checked) => {
                        const updated = [...customFields];
                        updated[idx].is_active = checked;
                        setData("custom_fields", updated);
                    }}
                    size="small"
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (_: any, record: CustomFieldItem, idx: number) => (
                <Flex gap={8}>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleOpenEditField(record, idx)}
                    />
                    <Popconfirm
                        title="Delete this custom field?"
                        onConfirm={() => handleDeleteField(idx)}
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
            <Tabs
                defaultActiveKey="addons"
                items={[
                    {
                        key: "addons",
                        label: (
                            <Space>
                                <GiftOutlined />
                                <span>Product Add-ons ({addons.length})</span>
                            </Space>
                        ),
                        children: (
                            <div>
                                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                                    <Text type="secondary">
                                        Optional extras customers can purchase with this item (e.g. Cherries, Candles, Gift Box, Toppers).
                                    </Text>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleOpenAddAddon}
                                    >
                                        Add Add-on
                                    </Button>
                                </Flex>

                                {addons.length === 0 ? (
                                    <Empty description="No add-ons created for this product." />
                                ) : (
                                    <Table
                                        rowKey={(_, idx) => String(idx)}
                                        dataSource={addons}
                                        columns={addonColumns}
                                        pagination={false}
                                        size="small"
                                        bordered
                                    />
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "custom_fields",
                        label: (
                            <Space>
                                <FormOutlined />
                                <span>Custom Information Fields ({customFields.length})</span>
                            </Space>
                        ),
                        children: (
                            <div>
                                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                                    <Text type="secondary">
                                        Custom input prompts asked to the customer during checkout (e.g. "Message on Cake", "Age", "Inscription").
                                    </Text>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleOpenAddField}
                                    >
                                        Add Custom Field
                                    </Button>
                                </Flex>

                                {customFields.length === 0 ? (
                                    <Empty description="No custom fields configured for this product." />
                                ) : (
                                    <Table
                                        rowKey={(_, idx) => String(idx)}
                                        dataSource={customFields}
                                        columns={fieldColumns}
                                        pagination={false}
                                        size="small"
                                        bordered
                                    />
                                )}
                            </div>
                        ),
                    },
                ]}
            />

            {/* Add/Edit Addon Modal */}
            <Modal
                title={editingAddonIndex !== null ? "Edit Add-on" : "Add Product Add-on"}
                open={isAddonModalOpen}
                onOk={handleSaveAddon}
                onCancel={() => setIsAddonModalOpen(false)}
                okText="Save Add-on"
            >
                <Form form={addonForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="name"
                        label="Add-on Name"
                        rules={[{ required: true, message: "Please enter add-on name" }]}
                    >
                        <Input placeholder="e.g. Cherries, Candles, Ribbon" />
                    </Form.Item>

                    <Form.Item name="description" label="Short Description">
                        <Input placeholder="e.g. Fresh organic maraschino cherries" />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Price (€)"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={0} step={0.5} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="is_available"
                        label="Available"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add/Edit Field Modal */}
            <Modal
                title={editingFieldIndex !== null ? "Edit Custom Field" : "Add Custom Information Field"}
                open={isFieldModalOpen}
                onOk={handleSaveField}
                onCancel={() => setIsFieldModalOpen(false)}
                okText="Save Field"
            >
                <Form form={fieldForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="name"
                        label="Field Name"
                        rules={[{ required: true, message: "Please enter field name" }]}
                    >
                        <Input placeholder="e.g. Message on Cake, Number of candles" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="field_type"
                                label="Field Type"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    options={[
                                        { value: "text", label: "Single-line Text" },
                                        { value: "textarea", label: "Multi-line Text" },
                                        { value: "select", label: "Dropdown Select" },
                                        { value: "checkbox", label: "Checkbox" },
                                        { value: "date", label: "Date Picker" },
                                        { value: "file", label: "File Upload" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="max_length" label="Max Characters">
                                <InputNumber min={1} max={500} style={{ width: "100%" }} placeholder="e.g. 50" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="is_required"
                                label="Is Required"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="is_active"
                                label="Active"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
}
