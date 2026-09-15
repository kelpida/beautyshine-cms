import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { ActiveLabel } from "@/enum/ActiveLabel.enum";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Button, Flex, Input, Modal, Tag, message } from "antd";
import React, { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface EshopTagItem {
    id: number;
    name?: string;
    slug: string;
    sort_order?: number;
    is_active?: boolean;
    created_at?: string;
    translates?: Array<{ id: number; locale: string; name: string }>;
}

interface IndexEshopTagsPageProps {
    eshopTags?: {
        data: EshopTagItem[];
        current_page?: number;
        per_page?: number;
        total?: number;
    } | EshopTagItem[];
    filters?: {
        q?: string;
    };
}

export default function IndexEshopTagsPage({
    eshopTags,
    filters = {},
}: IndexEshopTagsPageProps) {
    const rawData = Array.isArray(eshopTags)
        ? eshopTags
        : eshopTags?.data || [];

    const [tagsData, setTagsData] = useState<EshopTagItem[]>(rawData);
    const [searchTerm, setSearchTerm] = useState(filters?.q || "");

    useEffect(() => {
        const updated = Array.isArray(eshopTags)
            ? eshopTags
            : eshopTags?.data || [];
        setTagsData(updated);
    }, [eshopTags]);

    const handleSearch = (value: string) => {
        router.get(
            RouteList.eshopTags(),
            { q: value || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleEdit = (tag: EshopTagItem) => {
        router.visit(RouteList.editEshopTag(tag.id));
    };

    const handleDelete = (tag: EshopTagItem) => {
        Modal.confirm({
            title: "Delete Tag",
            content: `Are you sure you want to delete tag "${tag.name || tag.slug}"?`,
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                router.delete(RouteList.deleteEshopTag(tag.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success("Tag deleted successfully");
                    },
                    onError: () => {
                        message.error("Failed to delete tag");
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
            width: 80,
        },
        {
            title: "Tag Name",
            dataIndex: "name",
            key: "name",
            render: (name: string, record: EshopTagItem) => (
                <a
                    onClick={() => handleEdit(record)}
                    style={{ fontWeight: 600, color: "#1677ff", cursor: "pointer" }}
                >
                    {name || <span style={{ color: "#aaa" }}>—</span>}
                </a>
            ),
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            render: (slug: string) => <Tag color="geekblue">{slug}</Tag>,
        },
        {
            title: "Sort Order",
            dataIndex: "sort_order",
            key: "sort_order",
            width: 110,
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            width: 120,
            render: (isActive: boolean | number) => ActiveLabel(Boolean(isActive)),
        },
        {
            title: "Actions",
            key: "actions",
            width: 170,
            render: (_: any, record: EshopTagItem) => (
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

    const paginationMeta = !Array.isArray(eshopTags) && eshopTags?.current_page
        ? eshopTags
        : undefined;

    return (
        <div>
            <PageHeaderActions
                title="Eshop Tags"
                addAction={RouteList.createEshopTag()}
                addName="Add Tag"
            >
                <Input.Search
                    placeholder="Search tags..."
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                    style={{ width: 260 }}
                />
            </PageHeaderActions>

            <DraggableTable
                dataSource={tagsData}
                setDataSource={setTagsData}
                columns={columns}
                rowKey="id"
                paginationMeta={paginationMeta}
                paginationRoute={RouteList.eshopTags()}
                paginationParams={filters}
                onOrderChange={(newData) => {
                    setTagsData(newData);
                }}
            />
        </div>
    );
}

IndexEshopTagsPage.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
