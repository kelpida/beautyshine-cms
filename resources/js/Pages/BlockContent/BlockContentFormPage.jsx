import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button, Form, Row, Col, Divider, Card } from "antd";
import { useForm } from "@inertiajs/react";
import React from "react";
import InputField from "@/Components/Form/InputField";
import SelectField from "@/Components/Form/SelectField";
import PopupFormMessage from "@/Components/PopupFormMessage";
import FlexibleContentBuilder from "@/Components/FlexibleContentBuilder";

export default function BlockContentFormPage({
    blockContent = null,
    pages = [],
    languages = [],
    imagesData,
}) {
    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm({
        title: blockContent?.data?.title || "",
        component_name: blockContent?.data?.component_name || "",
        page_id: blockContent?.data?.page_id || "",
        content: blockContent?.data?.content || [],
    });

    const handleSubmit = () => {
        if (blockContent) {
            put(route("block-contents.update", blockContent.data.id));
        } else {
            submitPost(route("block-contents.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={
                    blockContent
                        ? "Update Block Content"
                        : "Create Block Content"
                }
                backAction={route("block-contents.index")}
                backName={"View Block Contents"}
            />

            <Form layout="vertical" onFinish={handleSubmit}>
                {/* Block Settings */}
                <Card style={{ marginBottom: 24 }}>
                    <Divider>Block Settings</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <InputField
                                label="Title"
                                name="title"
                                required
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                error={errors.title}
                                placeholder="Hero Section"
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <InputField
                                label="Component Name"
                                name="component_name"
                                required
                                value={data.component_name}
                                onChange={(e) =>
                                    setData("component_name", e.target.value)
                                }
                                error={errors.component_name}
                                placeholder="HeroBlock"
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <SelectField
                                label="Page"
                                name="page_id"
                                required
                                value={data.page_id}
                                onChange={(e) =>
                                    setData("page_id", e?.target?.value)
                                }
                                options={pages.map((page) => ({
                                    label: page.page_name,
                                    value: page.id,
                                }))}
                                error={errors.page_id}
                                placeholder="Select a page"
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Flexible Content Builder */}
                <Card style={{ marginBottom: 24 }}>
                    <Divider>Block Content</Divider>
                    <FlexibleContentBuilder
                        blocks={data.content}
                        onChange={(newBlocks) => setData("content", newBlocks)}
                        languages={languages}
                        availableImages={imagesData?.data || []}
                    />
                </Card>

                <div style={{ textAlign: "right" }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={processing}
                        size="large"
                    >
                        Save Block Content
                    </Button>
                </div>
            </Form>
        </div>
    );
}

BlockContentFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
