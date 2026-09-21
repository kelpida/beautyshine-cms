import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import TableButtonAction from "@/Components/TableButtonAction";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Table, Tag, Typography, Modal, message, Space, Avatar, Tooltip } from "antd";
import {
    CreditCardOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SafetyCertificateOutlined,
    ExperimentOutlined,
} from "@ant-design/icons";

import {
    PaymentProviderCode,
    PaymentProviderStatus,
} from "@/enum/PaymentProvider.enum";

const { Text } = Typography;

export interface PaymentProviderItem {
    id: number;
    name: string;
    code: PaymentProviderCode | string;
    description?: string;
    status: PaymentProviderStatus | string;
    is_production: boolean;
    logo_id?: number;
    logo?: {
        id: number;
        name: string;
        path: string;
        url: string;
    } | null;
    merchant_id?: string;
    api_key?: string;
    client_id?: string;
    source_code?: string;
    public_key?: string;
    acquirer_id?: string;
    created_at?: string;
    updated_at?: string;
}

interface IndexPaymentProviderPageProps {
    paymentProviders?:
        | {
              data: PaymentProviderItem[];
          }
        | PaymentProviderItem[];
    filters?: {
        status?: string;
        code?: string;
    };
}

const providerBadgeColors: Record<string, string> = {
    [PaymentProviderCode.VIVA]: "geekblue",
    [PaymentProviderCode.STRIPE]: "purple",
    [PaymentProviderCode.JCC]: "gold",
    [PaymentProviderCode.REVOLUT]: "cyan",
};

export default function IndexPaymentProviderPage({
    paymentProviders,
}: IndexPaymentProviderPageProps) {
    const rawData = Array.isArray(paymentProviders)
        ? paymentProviders
        : paymentProviders?.data || [];

    const [data, setData] = useState<PaymentProviderItem[]>(rawData);

    React.useEffect(() => {
        const updated = Array.isArray(paymentProviders)
            ? paymentProviders
            : paymentProviders?.data || [];
        setData(updated);
    }, [paymentProviders]);

    const handleEdit = (record: PaymentProviderItem) => {
        router.visit(RouteList.editPaymentProvider(record.id));
    };

    const handleDelete = (record: PaymentProviderItem) => {
        Modal.confirm({
            title: "Delete Payment Provider",
            content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                router.delete(RouteList.deletePaymentProvider(record.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success("Payment provider deleted successfully.");
                    },
                    onError: () => {
                        message.error("Failed to delete payment provider.");
                    },
                });
            },
        });
    };

    const pagePermissions = {
        add: "create-payment-provider",
        edit: "edit-payment-provider",
        delete: "delete-payment-provider",
    };

    const columns = [
        {
            title: "Provider",
            key: "provider",
            render: (_: any, record: PaymentProviderItem) => (
                <Space size="middle">
                    {record.logo?.url ? (
                        <Avatar
                            shape="square"
                            size={44}
                            src={record.logo.url}
                            alt={record.name}
                            style={{
                                border: "1px solid #f0f0f0",
                                objectFit: "contain",
                                backgroundColor: "#fafafa",
                            }}
                        />
                    ) : (
                        <Avatar
                            shape="square"
                            size={44}
                            icon={<CreditCardOutlined />}
                            style={{ backgroundColor: "#1890ff" }}
                        />
                    )}
                    <div>
                        <div style={{ fontWeight: 600, fontSize: "14px" }}>
                            {record.name}
                        </div>
                        {record.description && (
                            <Text
                                type="secondary"
                                style={{ fontSize: "12px", display: "block" }}
                            >
                                {record.description}
                            </Text>
                        )}
                    </div>
                </Space>
            ),
        },
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            render: (code: string) => {
                const color = providerBadgeColors[code] || "blue";
                return (
                    <Tag color={color} style={{ textTransform: "uppercase", fontWeight: 600 }}>
                        {code}
                    </Tag>
                );
            },
        },
        {
            title: "Environment",
            dataIndex: "is_production",
            key: "is_production",
            render: (isProduction: boolean) =>
                isProduction ? (
                    <Tag
                        color="success"
                        icon={<SafetyCertificateOutlined />}
                        style={{ padding: "2px 8px" }}
                    >
                        Live / Production
                    </Tag>
                ) : (
                    <Tag
                        color="warning"
                        icon={<ExperimentOutlined />}
                        style={{ padding: "2px 8px" }}
                    >
                        Sandbox / Test
                    </Tag>
                ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) =>
                status === "active" ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                        Active
                    </Tag>
                ) : (
                    <Tag color="default" icon={<CloseCircleOutlined />}>
                        Inactive
                    </Tag>
                ),
        },
        {
            title: "Credentials Preview",
            key: "credentials_info",
            render: (_: any, record: PaymentProviderItem) => {
                switch (record.code) {
                    case "viva":
                        return (
                            <Space direction="vertical" size={0}>
                                {record.merchant_id && (
                                    <Text type="secondary" style={{ fontSize: "12px" }}>
                                        Merchant: <b>{record.merchant_id}</b>
                                    </Text>
                                )}
                                {record.source_code && (
                                    <Text type="secondary" style={{ fontSize: "12px" }}>
                                        Source: <b>{record.source_code}</b>
                                    </Text>
                                )}
                            </Space>
                        );
                    case "stripe":
                    case "revolut":
                        return record.public_key ? (
                            <Tooltip title={record.public_key}>
                                <Text code style={{ fontSize: "11px" }}>
                                    {record.public_key.length > 20
                                        ? `${record.public_key.substring(0, 18)}...`
                                        : record.public_key}
                                </Text>
                            </Tooltip>
                        ) : (
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                —
                            </Text>
                        );
                    case "jcc":
                        return (
                            <Space direction="vertical" size={0}>
                                {record.merchant_id && (
                                    <Text type="secondary" style={{ fontSize: "12px" }}>
                                        Merchant: <b>{record.merchant_id}</b>
                                    </Text>
                                )}
                                {record.acquirer_id && (
                                    <Text type="secondary" style={{ fontSize: "12px" }}>
                                        Acquirer: <b>{record.acquirer_id}</b>
                                    </Text>
                                )}
                            </Space>
                        );
                    default:
                        return (
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                —
                            </Text>
                        );
                }
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: PaymentProviderItem) => (
                <TableButtonAction
                    editAction={() => handleEdit(record)}
                    deleteAction={() => handleDelete(record)}
                    pagePermissions={pagePermissions}
                />
            ),
        },
    ];

    return (
        <div>
            <PageHeaderActions
                title="Payment Providers"
                addAction={RouteList.createPaymentProvider()}
                addName="Add Payment Provider"
                pagePermissions={pagePermissions}
            />

            <Table
                dataSource={data}
                columns={columns}
                rowKey="id"
                pagination={false}
                bordered={false}
            />
        </div>
    );
}

IndexPaymentProviderPage.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);
