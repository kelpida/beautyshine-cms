import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";

import { Button, Form, Row, Col, Divider, Card } from "antd";
import { useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import InputField from "@/Components/Form/InputField";
import MediaSelector from "@/Components/MediaSelector";
import { RouteList } from "@/routes/RouteList";
import PopupFormMessage from "@/Components/PopupFormMessage";

export default function PageForm({ page = null, imagesData }) {
    const [images, setImages] = useState([]);
    const { users = [] } = usePage().props;
    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm({
        title: page?.data?.title || "",
        page_name: page?.data?.page_name || "",
        path: page?.data?.path || "",
        meta_image_id: page?.data?.seo_meta?.image?.id || null,
        meta_title: page?.data?.seo_meta?.title || "",
        meta_description: page?.data?.seo_meta?.description || "",
    });

    useEffect(() => {
        if (page && page.data?.seo_meta?.image) {
            setImages([page.data.seo_meta.image]);
        }
    }, [page]);

    const handleSubmit = () => {
        if (page) {
            put(route("pages.update", page.id));
        } else {
            submitPost(route("pages.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={page ? "Update Page" : "Create Page"}
                backAction={RouteList.posts()}
                backName={"View Pages"}
            />

            <Card>
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        title: data?.title,
                        page_name: data?.page_name,
                        path: data?.path,
                        meta_image_id: data?.meta_image_id,
                        meta_title: data?.meta_title,
                        meta_description: data?.meta_description,
                    }}
                >
                    <Divider>Page content</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            {/* Title Input */}
                            <InputField
                                label="Title"
                                name="title"
                                required
                                value={data.title}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    const path = title
                                        .toLowerCase()
                                        .trim()
                                        .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with "-"
                                        .replace(/^-+|-+$/g, "-"); // remove leading/trailing dashes

                                    setData("title", title);
                                    setData("path", path);
                                }}
                                error={errors.title}
                                placeholder="Post title"
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            {/* Title Input */}
                            <InputField
                                label="Path Name"
                                name="path"
                                required
                                value={data.path}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    const path = title
                                        .toLowerCase()
                                        .trim()
                                        .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with "-"
                                        .replace(/^-+|-+$/g, "-"); // remove leading/trailing dashes

                                    setData("path", path);
                                }}
                                error={errors.path}
                                placeholder="Path Name"
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <InputField
                                label="Page Component Name"
                                name="page_name"
                                required
                                value={data.page_name}
                                onChange={(e) => {
                                    setData("page_name", e.target.value);
                                }}
                                error={errors.title}
                                placeholder="Page Component Name"
                            />
                        </Col>
                    </Row>

                    <Divider>Post SEO</Divider>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            {/* Title Input */}
                            <InputField
                                label="Meta Title"
                                name="meta_title"
                                required
                                value={data.meta_title}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    setData("meta_title", title);
                                }}
                                error={errors.meta_title}
                                placeholder="Enter a meta title"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            {/* Title Input */}
                            <InputField
                                label="Meta Description"
                                name="meta_description"
                                required
                                value={data.meta_description}
                                onChange={(e) =>
                                    setData("meta_description", e.target.value)
                                }
                                error={errors.meta_description}
                                placeholder="Enter a meta description"
                            />
                        </Col>
                    </Row>
                    <MediaSelector
                        existingImages={imagesData?.data}
                        setImages={(newImages) => {
                            setImages(newImages);
                            setData("meta_image_id", newImages[0]?.id ?? null);
                        }}
                        images={images ?? []}
                    />

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                        >
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

PageForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
