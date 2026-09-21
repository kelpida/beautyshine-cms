import {
    Alert,
    Badge,
    Card,
    Col,
    Descriptions,
    Flex,
    Row,
    Space,
    Table,
    Tabs,
    Tag,
    Typography,
} from "antd";
import React from "react";
import {
    CheckCircleFilled,
    ExclamationCircleFilled,
    GlobalOutlined,
    ShoppingOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface ReviewPublishStepProps {
    data: any;
    languages: any[];
    categories: any[];
    tags: any[];
}

export default function ReviewPublishStep({
    data,
    languages = [],
    categories = [],
    tags = [],
}: ReviewPublishStepProps) {
    const activeLanguages =
        languages.length > 0 ? languages : [{ code: "en", name: "English" }];

    const getTranslationFor = (locale: string) => {
        if (locale === "en") {
            return {
                name: data.name,
                description: data.description,
            };
        }
        if (Array.isArray(data.translations)) {
            return (
                data.translations.find(
                    (t: any) =>
                        t.locale?.toLowerCase() === locale.toLowerCase(),
                ) || {}
            );
        }
        return {};
    };

    const getReadinessData = (locale: string) => {
        const trans = getTranslationFor(locale);
        const isDefault = locale === "en";

        const hasName = Boolean(trans.name && trans.name.trim().length > 0);
        const hasDesc = Boolean(
            trans.description && trans.description.trim().length > 0,
        );
        const hasSeo = Boolean(data.meta_title || data.meta_description);
        const hasMedia = Boolean(
            data.main_image_id ||
            (data.gallery_images && data.gallery_images.length > 0),
        );
        const hasCategories = Boolean(
            data.category_ids && data.category_ids.length > 0,
        );
        const hasVariations =
            data.product_type === "configurable"
                ? Boolean(data.variations && data.variations.length > 0)
                : true;

        return [
            {
                key: "name",
                field: "Product Name",
                isReady: hasName,
                note: hasName ? `"${trans.name}"` : "Missing product name",
            },
            {
                key: "desc",
                field: "Description",
                isReady: hasDesc,
                note: hasDesc ? "Description provided" : "Optional description",
            },
            {
                key: "seo",
                field: "SEO Metadata",
                isReady: hasSeo,
                note: hasSeo
                    ? data.meta_title || "Metadata configured"
                    : "No SEO meta set",
            },
            {
                key: "media",
                field: "Media & Images",
                isReady: hasMedia,
                note: hasMedia
                    ? `${data.main_image_id ? "Main image set" : ""} ${data.gallery_images?.length ? `(${data.gallery_images.length} gallery images)` : ""}`
                    : "No images attached",
            },
            {
                key: "taxonomy",
                field: "Categories & Tags",
                isReady: hasCategories,
                note: `${data.category_ids?.length || 0} categories, ${data.tag_ids?.length || 0} tags`,
            },
            {
                key: "variations",
                field:
                    data.product_type === "configurable"
                        ? "Product Variations"
                        : "Pricing & Stock",
                isReady: hasVariations,
                note:
                    data.product_type === "configurable"
                        ? `${data.variations?.length || 0} variations configured`
                        : `Base Price: €${Number(data.base_price || 0).toFixed(2)}`,
            },
        ];
    };

    const columns = [
        {
            title: "Section",
            dataIndex: "field",
            key: "field",
            render: (text: string) => (
                <span style={{ fontWeight: 600 }}>{text}</span>
            ),
        },
        {
            title: "Status",
            dataIndex: "isReady",
            key: "isReady",
            width: 140,
            render: (ready: boolean) =>
                ready ? (
                    <Tag
                        icon={
                            <CheckCircleFilled style={{ color: "#52c41a" }} />
                        }
                        color="success"
                    >
                        Ready
                    </Tag>
                ) : (
                    <Tag
                        icon={
                            <ExclamationCircleFilled
                                style={{ color: "#faad14" }}
                            />
                        }
                        color="warning"
                    >
                        Incomplete
                    </Tag>
                ),
        },
        {
            title: "Details",
            dataIndex: "note",
            key: "note",
            render: (note: string) => (
                <span style={{ color: "#595959" }}>{note}</span>
            ),
        },
    ];

    return (
        <div>
            <Alert
                message="Review & Ready to Publish"
                description="Check the translation and content readiness for each supported language before saving or publishing."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            {/* Overview Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small" bordered>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            PRODUCT NAME
                        </Text>
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: 16,
                                marginTop: 4,
                            }}
                        >
                            {data.name || "Untitled Product"}
                        </div>
                        <Tag color="purple" style={{ marginTop: 6 }}>
                            {data.product_type === "configurable"
                                ? "Configurable"
                                : "Simple"}
                        </Tag>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card size="small" bordered>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            PRICE
                        </Text>
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: 18,
                                color: "#f73859",
                                marginTop: 4,
                            }}
                        >
                            €{Number(data.base_price || 0).toFixed(2)}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Status:{" "}
                            <Tag color="blue">
                                {(data.status || "draft").toUpperCase()}
                            </Tag>
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card size="small" bordered>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            CONFIGURED VARIATIONS
                        </Text>
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: 18,
                                marginTop: 4,
                            }}
                        >
                            {data.product_type === "configurable"
                                ? (data.variations || []).length
                                : "N/A (Simple)"}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {(data.attributes || []).length} attributes applied
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card size="small" bordered>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            ADD-ONS & CUSTOM FIELDS
                        </Text>
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: 18,
                                marginTop: 4,
                            }}
                        >
                            {(data.addons || []).length} Add-ons
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {(data.custom_fields || []).length} Custom Fields
                        </Text>
                    </Card>
                </Col>
            </Row>

            {/* Language Readiness Tabs */}
            <Tabs
                defaultActiveKey={activeLanguages[0]?.code || "en"}
                items={activeLanguages.map((lang: any) => ({
                    key: lang.code,
                    label: (
                        <Space>
                            <GlobalOutlined />
                            <span>
                                {lang.name} ({lang.code.toUpperCase()})
                            </span>
                        </Space>
                    ),
                    children: (
                        <Table
                            rowKey="key"
                            dataSource={getReadinessData(lang.code)}
                            columns={columns}
                            pagination={false}
                            bordered
                            size="small"
                        />
                    ),
                }))}
            />
        </div>
    );
}
