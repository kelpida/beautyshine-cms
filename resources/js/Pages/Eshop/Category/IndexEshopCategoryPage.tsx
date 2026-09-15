import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { ActiveLabel } from "@/enum/ActiveLabel.enum";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Button, Flex, Image, Input, Modal, Space, Tag, message } from "antd";
import React, { useEffect, useState } from "react";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";

interface EshopCategoryItem {
    id: number;
    name: string;
    slug: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
    parent_id?: number | null;
    parent?: { id: number; name: string } | null;
    image_id?: number | null;
    image?: { id: number; url?: string; path?: string } | null;
    created_at?: string;
}

interface IndexEshopCategoryPageProps {
    eshopCategories?:
        | {
              data: EshopCategoryItem[];
              current_page?: number;
              per_page?: number;
              total?: number;
          }
        | EshopCategoryItem[];
    filters?: {
        q?: string;
    };
}

export default function IndexEshopCategoryPage({
    eshopCategories,
    filters = {},
}: IndexEshopCategoryPageProps) {
    const rawData = Array.isArray(eshopCategories)
        ? eshopCategories
        : eshopCategories?.data || [];

    const [categoriesData, setCategoriesData] =
        useState<EshopCategoryItem[]>(rawData);
    const [searchTerm, setSearchTerm] = useState(filters?.q || "");

    useEffect(() => {
        const updated = Array.isArray(eshopCategories)
            ? eshopCategories
            : eshopCategories?.data || [];
        setCategoriesData(updated);
    }, [eshopCategories]);

    const handleSearch = (value: string) => {
        router.get(
            RouteList.eshopCategories(),
            { q: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleEdit = (category: EshopCategoryItem) => {
        router.visit(RouteList.editEshopCategory(category.id));
    };

    const handleDelete = (category: EshopCategoryItem) => {
        Modal.confirm({
            title: "Delete Category",
            content: `Are you sure you want to delete "${category.name}"?`,
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                router.delete(RouteList.deleteEshopCategory(category.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success("Category deleted successfully");
                    },
                    onError: () => {
                        message.error("Failed to delete category");
                    },
                });
            },
        });
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
            render: (name: string, record: EshopCategoryItem) => (
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
            title: "Parent Category",
            dataIndex: "parent",
            key: "parent",
            render: (parent: any, record: EshopCategoryItem) =>
                parent?.name ? (
                    <Tag>{parent.name}</Tag>
                ) : record.parent_id ? (
                    <Tag>#{record.parent_id}</Tag>
                ) : (
                    <span style={{ color: "#bfbfbf" }}>—</span>
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
            render: (_: any, record: EshopCategoryItem) => (
                <Flex gap={8}>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record)}
                    >
                        Delete
                    </Button>
                </Flex>
            ),
        },
    ];

    const paginationMeta =
        !Array.isArray(eshopCategories) && eshopCategories?.current_page
            ? eshopCategories
            : undefined;

    return (
        <div>
            <PageHeaderActions
                title="Eshop Categories"
                addAction={RouteList.createEshopCategory()}
                addName="Add Category"
            >
                <Input.Search
                    placeholder="Search category..."
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                    style={{ width: 260 }}
                />
            </PageHeaderActions>

            <DraggableTable
                dataSource={categoriesData}
                setDataSource={setCategoriesData}
                columns={columns}
                rowKey="id"
                paginationMeta={paginationMeta}
                paginationRoute={RouteList.eshopCategories()}
                paginationParams={filters}
                onOrderChange={(newData) => {
                    // Reordered locally in table
                    setCategoriesData(newData);
                }}
            />
        </div>
    );
}

IndexEshopCategoryPage.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);
