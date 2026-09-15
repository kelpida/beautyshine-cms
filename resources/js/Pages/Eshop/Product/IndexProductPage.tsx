import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { ActiveLabel } from "@/enum/ActiveLabel.enum";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Avatar, Button, Flex, Input, Modal, Select, Space, Tag, message } from "antd";
import React, { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined, ShoppingOutlined, PlusOutlined } from "@ant-design/icons";

interface ProductTranslateItem {
    id: number;
    locale: string;
    name: string;
}

interface ProductItem {
    id: number;
    name: string;
    slug: string;
    product_type: "simple" | "configurable";
    status?: "draft" | "public" | "archived" | "inactive";
    base_price?: number | string;
    sale_price?: number | string;
    is_active?: boolean;
    sort_order?: number;
    main_image_id?: number | null;
    main_image?: { id: number; path: string; name?: string } | null;
    image?: { id: number; path: string; name?: string } | null;
    categories?: Array<{ id: number; name: string }>;
    tags?: Array<{ id: number; name: string }>;
    translates?: ProductTranslateItem[];
    created_at?: string;
}

interface IndexProductPageProps {
    products?:
        | {
              data: ProductItem[];
              current_page?: number;
              per_page?: number;
              total?: number;
          }
        | ProductItem[];
    filters?: {
        q?: string;
        status?: string;
        product_type?: string;
    };
    languages?: Array<{ id: number; code: string; name: string }>;
}

export default function IndexProductPage({
    products,
    filters = {},
    languages = [],
}: IndexProductPageProps) {
    const rawData = Array.isArray(products)
        ? products
        : products?.data || [];

    const [productsData, setProductsData] = useState<ProductItem[]>(rawData);
    const [searchTerm, setSearchTerm] = useState(filters?.q || "");
    const [selectedType, setSelectedType] = useState<string | undefined>(filters?.product_type);
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(filters?.status);

    useEffect(() => {
        const updated = Array.isArray(products)
            ? products
            : products?.data || [];
        setProductsData(updated);
    }, [products]);

    const applyFilters = (params: { q?: string; status?: string; product_type?: string }) => {
        router.get(
            RouteList.eshopProducts(),
            {
                q: params.q !== undefined ? params.q || undefined : (searchTerm || undefined),
                status: params.status !== undefined ? params.status || undefined : selectedStatus,
                product_type: params.product_type !== undefined ? params.product_type || undefined : selectedType,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleEdit = (product: ProductItem) => {
        router.visit(RouteList.editEshopProduct(product.id));
    };

    const handleDelete = (product: ProductItem) => {
        Modal.confirm({
            title: "Delete Product",
            content: `Are you sure you want to delete product "${product.name}"?`,
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                router.delete(RouteList.deleteEshopProduct(product.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success("Product deleted successfully");
                    },
                    onError: () => {
                        message.error("Failed to delete product");
                    },
                });
            },
        });
    };

    const getImageUrl = (item: ProductItem): string | undefined => {
        const img = item.main_image || item.image;
        if (!img?.path) return undefined;
        return img.path.startsWith("http") || img.path.startsWith("/")
            ? img.path
            : `/storage/${img.path}`;
    };

    const formatPrice = (price?: number | string) => {
        if (price === undefined || price === null || price === "") return "—";
        const num = Number(price);
        return isNaN(num) ? String(price) : `€${num.toFixed(2)}`;
    };

    const columns = [
        {
            title: "Image",
            key: "image",
            width: 70,
            render: (_: any, record: ProductItem) => {
                const src = getImageUrl(record);
                return (
                    <Avatar
                        shape="square"
                        size={48}
                        src={src}
                        icon={<ShoppingOutlined />}
                        style={{ backgroundColor: "#f5f5f5", color: "#8c8c8c" }}
                    />
                );
            },
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (name: string, record: ProductItem) => (
                <div>
                    <a
                        onClick={() => handleEdit(record)}
                        style={{
                            fontWeight: 600,
                            color: "#1677ff",
                            cursor: "pointer",
                            fontSize: 14,
                        }}
                    >
                        {name}
                    </a>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                        slug: {record.slug}
                    </div>
                </div>
            ),
        },
        {
            title: "Type",
            dataIndex: "product_type",
            key: "product_type",
            width: 120,
            render: (type: string) => (
                <Tag color={type === "configurable" ? "purple" : "blue"}>
                    {type === "configurable" ? "Configurable" : "Simple"}
                </Tag>
            ),
        },
        {
            title: "Price",
            key: "price",
            width: 110,
            render: (_: any, record: ProductItem) => (
                <div>
                    <span style={{ fontWeight: 600 }}>{formatPrice(record.base_price)}</span>
                    {record.sale_price && (
                        <div style={{ fontSize: 11, color: "#f5222d", textDecoration: "line-through" }}>
                            {formatPrice(record.sale_price)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            width: 100,
            render: (isActive: boolean | number, record: ProductItem) => {
                if (record.status === "draft") {
                    return <Tag color="warning">Draft</Tag>;
                }
                return ActiveLabel(Boolean(isActive));
            },
        },
        {
            title: "Translations",
            key: "translations",
            width: 140,
            render: (_: any, record: ProductItem) => {
                const systemLocales = languages.length > 0 ? languages.map((l) => l.code) : ["en", "el"];
                const translatedLocales = new Set(
                    (record.translates || []).map((t) => t.locale.toLowerCase()),
                );
                // English is default
                translatedLocales.add("en");

                return (
                    <Space size={4}>
                        {systemLocales.map((code) => {
                            const isTranslated = translatedLocales.has(code.toLowerCase());
                            return (
                                <Tag
                                    key={code}
                                    color={isTranslated ? "green" : "default"}
                                    style={{
                                        marginRight: 0,
                                        fontSize: 11,
                                        padding: "0 5px",
                                        fontWeight: 600,
                                        opacity: isTranslated ? 1 : 0.5,
                                    }}
                                >
                                    {code.toUpperCase()}
                                </Tag>
                            );
                        })}
                    </Space>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            width: 160,
            render: (_: any, record: ProductItem) => (
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
        !Array.isArray(products) && products
            ? {
                  current: products.current_page || 1,
                  pageSize: products.per_page || 15,
                  total: products.total || 0,
                  showSizeChanger: false,
                  onChange: (page: number) => {
                      router.get(
                          RouteList.eshopProducts(),
                          {
                              page,
                              q: searchTerm || undefined,
                              status: selectedStatus || undefined,
                              product_type: selectedType || undefined,
                          },
                          { preserveState: true, replace: true },
                      );
                  },
              }
            : false;

    return (
        <div>
            <PageHeaderActions
                title="Products"
                buttonText="Add Product"
                href={RouteList.createEshopProduct()}
            />

            <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: 16 }}
                wrap="wrap"
                gap={12}
            >
                <Space wrap>
                    <Input.Search
                        placeholder="Search products by name or slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onSearch={(val) => applyFilters({ q: val })}
                        allowClear
                        style={{ width: 280 }}
                    />

                    <Select
                        placeholder="Filter by Type"
                        allowClear
                        value={selectedType}
                        onChange={(val) => {
                            setSelectedType(val);
                            applyFilters({ product_type: val });
                        }}
                        style={{ width: 150 }}
                        options={[
                            { value: "simple", label: "Simple" },
                            { value: "configurable", label: "Configurable" },
                        ]}
                    />

                    <Select
                        placeholder="Filter by Status"
                        allowClear
                        value={selectedStatus}
                        onChange={(val) => {
                            setSelectedStatus(val);
                            applyFilters({ status: val });
                        }}
                        style={{ width: 140 }}
                        options={[
                            { value: "public", label: "Public" },
                            { value: "draft", label: "Draft" },
                            { value: "inactive", label: "Inactive" },
                            { value: "archived", label: "Archived" },
                        ]}
                    />
                </Space>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => router.visit(RouteList.createEshopProduct())}
                >
                    Add Product
                </Button>
            </Flex>

            <DraggableTable
                rowKey="id"
                dataSource={productsData}
                columns={columns}
                pagination={paginationMeta}
            />
        </div>
    );
}

IndexProductPage.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);
