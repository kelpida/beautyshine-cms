import InputField from "@/Components/Form/InputField";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import { Card, Checkbox, Col, Divider, Row, Select, Space, Tag, Typography } from "antd";
import React from "react";
import { FolderOutlined, TagsOutlined, GlobalOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface TaxonomySeoStepProps {
    data: any;
    setData: any;
    errors: any;
    categories: any[];
    tags: any[];
    languages: any[];
}

export default function TaxonomySeoStep({
    data,
    setData,
    errors,
    categories = [],
    tags = [],
    languages = [],
}: TaxonomySeoStepProps) {
    const handleCategoryToggle = (catId: number, checked: boolean) => {
        const current: number[] = Array.isArray(data.category_ids)
            ? [...data.category_ids]
            : [];
        if (checked) {
            if (!current.includes(catId)) {
                current.push(catId);
            }
        } else {
            const idx = current.indexOf(catId);
            if (idx > -1) {
                current.splice(idx, 1);
            }
        }
        setData("category_ids", current);
    };

    const handleTagsChange = (selectedTagIds: number[]) => {
        setData("tag_ids", selectedTagIds);
    };

    const selectedCategoryIds = new Set(data.category_ids || []);

    return (
        <div>
            <Row gutter={[24, 24]}>
                {/* Categories */}
                <Col xs={24} md={12}>
                    <Card
                        title={
                            <Space>
                                <FolderOutlined />
                                <span>Assign Categories</span>
                            </Space>
                        }
                        size="small"
                        bordered
                    >
                        <div style={{ marginBottom: 12 }}>
                            <Text type="secondary">
                                Select all categories this product belongs to:
                            </Text>
                        </div>
                        <div
                            style={{
                                maxHeight: 260,
                                overflowY: "auto",
                                padding: "8px 12px",
                                border: "1px solid #f0f0f0",
                                borderRadius: 6,
                            }}
                        >
                            {categories.length === 0 ? (
                                <Text type="secondary">No categories found.</Text>
                            ) : (
                                <Row gutter={[8, 8]}>
                                    {categories.map((cat: any) => {
                                        const isChecked = selectedCategoryIds.has(cat.id);
                                        return (
                                            <Col span={24} key={cat.id}>
                                                <Checkbox
                                                    checked={isChecked}
                                                    onChange={(e) =>
                                                        handleCategoryToggle(cat.id, e.target.checked)
                                                    }
                                                >
                                                    <span style={{ fontWeight: isChecked ? 600 : 400 }}>
                                                        {cat.name}
                                                    </span>
                                                    {cat.parent && (
                                                        <span style={{ fontSize: 11, color: "#8c8c8c", marginLeft: 6 }}>
                                                            ({cat.parent.name})
                                                        </span>
                                                    )}
                                                </Checkbox>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            )}
                        </div>
                        {errors.category_ids && (
                            <div style={{ color: "#ff4d4f", marginTop: 8, fontSize: 12 }}>
                                {errors.category_ids}
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Tags */}
                <Col xs={24} md={12}>
                    <Card
                        title={
                            <Space>
                                <TagsOutlined />
                                <span>Assign Tags</span>
                            </Space>
                        }
                        size="small"
                        bordered
                    >
                        <div style={{ marginBottom: 12 }}>
                            <Text type="secondary">
                                Add tags to help customers find products via search and filters:
                            </Text>
                        </div>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: "100%" }}
                            placeholder="Select relevant tags..."
                            value={data.tag_ids || []}
                            onChange={handleTagsChange}
                            options={tags.map((t: any) => ({
                                value: t.id,
                                label: t.name,
                            }))}
                        />

                        <div style={{ marginTop: 16 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Selected Tags:
                            </Text>
                            <div style={{ marginTop: 6 }}>
                                {(data.tag_ids || []).length === 0 ? (
                                    <span style={{ color: "#bfbfbf", fontSize: 12 }}>None selected</span>
                                ) : (
                                    (data.tag_ids || []).map((tid: number) => {
                                        const found = tags.find((t) => t.id === tid);
                                        return (
                                            <Tag key={tid} color="pink" style={{ marginBottom: 4 }}>
                                                {found?.name || `#${tid}`}
                                            </Tag>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {errors.tag_ids && (
                            <div style={{ color: "#ff4d4f", marginTop: 8, fontSize: 12 }}>
                                {errors.tag_ids}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Divider style={{ margin: "24px 0" }}>
                <Space>
                    <GlobalOutlined />
                    <span>Search Engine Optimization (SEO)</span>
                </Space>
            </Divider>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 500 }}>Meta Title</span>
                        <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                            {(data.meta_title || "").length}/60 characters
                        </span>
                    </div>
                    <InputField
                        name="meta_title"
                        value={data.meta_title || ""}
                        onChange={(e: any) => setData("meta_title", e.target.value)}
                        error={errors.meta_title}
                        placeholder="e.g. Vintage Heart Cake | BeautyShine"
                    />
                </Col>

                <Col xs={24} md={12}>
                    <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 500 }}>Meta Keywords</span>
                        <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                            {(data.meta_keywords || "").length}/255 characters
                        </span>
                    </div>
                    <InputField
                        name="meta_keywords"
                        value={data.meta_keywords || ""}
                        onChange={(e: any) => setData("meta_keywords", e.target.value)}
                        error={errors.meta_keywords}
                        placeholder="e.g. vintage cake, heart cake, bakery, online orders"
                    />
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24}>
                    <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 500 }}>Meta Description</span>
                        <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                            {(data.meta_description || "").length}/160 characters
                        </span>
                    </div>
                    <InputField
                        name="meta_description"
                        value={data.meta_description || ""}
                        onChange={(e: any) => setData("meta_description", e.target.value)}
                        error={errors.meta_description}
                        placeholder="A beautiful vintage heart cake for birthdays, weddings and special occasions. Order online."
                    />
                </Col>
            </Row>
        </div>
    );
}
