import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { ActiveLabel } from "@/enum/ActiveLabel.enum";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Button, Flex, Input, Modal, Tag, message } from "antd";
import React, { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import TableButtonAction from "@/Components/TableButtonAction";

interface EshopAttributeItem {
    id: number;
    name: string;
    slug: string;
    format_type?: string;
    sort_order?: number;
    is_active?: boolean;
    created_at?: string;
    translates?: Array<{ id: number; locale: string; name: string }>;
}

interface IndexAttributePageProps {
    eshopAttributes?:
        | {
              data: EshopAttributeItem[];
              current_page?: number;
              per_page?: number;
              total?: number;
          }
        | EshopAttributeItem[];
    filters?: {
        q?: string;
    };
}

export default function IndexAttributePage({
    eshopAttributes,
    filters = {},
}: IndexAttributePageProps) {
    const rawData = Array.isArray(eshopAttributes)
        ? eshopAttributes
        : eshopAttributes?.data || [];

    const [attributesData, setAttributesData] =
        useState<EshopAttributeItem[]>(rawData);
    const [searchTerm, setSearchTerm] = useState(filters?.q || "");

    useEffect(() => {
        const updated = Array.isArray(eshopAttributes)
            ? eshopAttributes
            : eshopAttributes?.data || [];
        setAttributesData(updated);
    }, [eshopAttributes]);

    const handleSearch = (value: string) => {
        router.get(
            RouteList.eshopAttributes(),
            { q: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleEdit = (attribute: EshopAttributeItem) => {
        router.visit(RouteList.editEshopAttribute(attribute.id));
    };

    const handleDelete = (attribute: EshopAttributeItem) => {
        Modal.confirm({
            title: "Delete Attribute",
            content: `Are you sure you want to delete attribute "${attribute.name}"?`,
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                router.delete(RouteList.deleteEshopAttribute(attribute.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success("Attribute deleted successfully");
                    },
                    onError: () => {
                        message.error("Failed to delete attribute");
                    },
                });
            },
        });
    };

    const formatTypeColors: Record<string, string> = {
        select: "blue",
        radio: "cyan",
        color: "magenta",
        text: "default",
        number: "orange",
        checkbox: "green",
        date: "purple",
        image: "gold",
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (name: string, record: EshopAttributeItem) => (
                <a
                    onClick={() => handleEdit(record)}
                    style={{
                        fontWeight: 600,
                        color: "#1677ff",
                        cursor: "pointer",
                    }}
                >
                    {name}
                </a>
            ),
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            render: (slug: string) => <Tag color="blue">{slug}</Tag>,
        },
        {
            title: "Format Type",
            dataIndex: "format_type",
            key: "format_type",
            render: (formatType: string) => (
                <Tag color={formatTypeColors[formatType] || "geekblue"}>
                    {formatType
                        ? formatType.toUpperCase().replace(/_/g, " ")
                        : "SELECT"}
                </Tag>
            ),
        },
        {
            title: "Sort Order",
            dataIndex: "sort_order",
            key: "sort_order",
            width: 100,
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            width: 110,
            render: (isActive: boolean | number) =>
                ActiveLabel(Boolean(isActive)),
        },
        {
            title: "Actions",
            key: "actions",
            width: 170,
            render: (_: any, record: EshopAttributeItem) => (
                <TableButtonAction
                    editAction={() => handleEdit(record)}
                    deleteAction={() => handleDelete(record)}
                    pagePermissions={{
                        edit: "eshop.attributes.edit",
                        delete: "eshop.attributes.delete",
                    }}
                />
            ),
        },
    ];

    const paginationMeta =
        !Array.isArray(eshopAttributes) && eshopAttributes?.current_page
            ? eshopAttributes
            : undefined;

    return (
        <div>
            <PageHeaderActions
                title="Eshop Attributes"
                addAction={RouteList.createEshopAttribute()}
                addName="Add Attribute"
            >
                <Input.Search
                    placeholder="Search attributes..."
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                    style={{ width: 260 }}
                />
            </PageHeaderActions>

            <DraggableTable
                dataSource={attributesData}
                setDataSource={setAttributesData}
                columns={columns}
                rowKey="id"
                paginationMeta={paginationMeta}
                paginationRoute={RouteList.eshopAttributes()}
                paginationParams={filters}
                onOrderChange={(newData) => {
                    setAttributesData(newData);
                }}
            />
        </div>
    );
}

IndexAttributePage.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);
