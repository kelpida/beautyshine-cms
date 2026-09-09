import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import AdminLayout from "@/Layouts/AdminLayout";

import {
    Button,
    Input,
    Form,
    Space,
    message,
    Row,
    Col,
    Divider,
    Card,
} from "antd";
import { useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import RichTextArea from "@/Components/Form/RichTextArea";
import InputField from "@/Components/Form/InputField";
import useMessage from "antd/es/message/useMessage";
import MultiFileUpload from "@/Components/Form/MultiFileUpload";
import SelectField from "@/Components/Form/SelectField";
import MediaSelector from "@/Components/MediaSelector";
import { RouteList } from "@/routes/RouteList";
import MultiSelectField from "@/Components/Form/MultiSelectField";

export default function PostForm({
    post = null,
    images: imagesData = [],
    categories = [],
}) {
    const [images, setImages] = useState([]);
    const [files, setFiles] = useState(post?.files || []);
    const { users = [] } = usePage().props;
    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm({
        title: post?.data.title || "",
        path: post?.data.path || "",
        content: post?.data.content || "",
        category_id: post?.data.categories[0].id || "",
        author_id: post?.data.author_id || "",
        image_id: post?.data.image_id || null,
        meta_title: post?.data.seo_meta.meta_title || "",
        meta_description: post?.data.seo_meta.meta_description || "",
    });

    useEffect(() => {
        if (post) {
            setImages([post.data.image]);
        }
    }, [post]);

    const handleSubmit = () => {
        if (post) {
            put(route("posts.update", post.id));
        } else {
            submitPost(route("posts.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={post ? "Update Post" : "Create Post"}
                backAction={RouteList.posts()}
                backName={"View Posts"}
            />

            <Card>
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        title: data?.title,
                        content: data?.content,
                        path: data?.path,
                        author_id: data?.author_id,
                        category_id: data?.category_id,
                        image_id: data?.files,
                        meta_title: data?.meta_title,
                        meta_description: data?.meta_description,
                    }}
                >
                    <Divider>Post content</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
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
                        <Col xs={24} md={12}>
                            {/* Title Input */}
                            <InputField
                                label="Url Path"
                                name="path"
                                required
                                value={data.path}
                                onChange={(e) =>
                                    setData("path", e.target.value)
                                }
                                error={errors.path}
                                placeholder="Enter the url"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <SelectField
                                label="Author"
                                name="author_id"
                                value={data.author_id}
                                onChange={(e) =>
                                    setData("author_id", e.target.value)
                                }
                                options={users.map((user) => ({
                                    label: user.name,
                                    value: user.id,
                                }))}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            {categories && (
                                <SelectField
                                    label="Category"
                                    name="category_id"
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData("category_id", e.target.value)
                                    }
                                    options={categories.map((cat) => ({
                                        label: cat.name,
                                        value: cat.id,
                                    }))}
                                />
                            )}
                        </Col>
                    </Row>

                    {/* Content Rich Text */}

                    <RichTextArea
                        label="Description"
                        name="content"
                        value={data.content}
                        onChange={(val) => setData("content", val)}
                        required
                        error={errors.content}
                    />

                    <MediaSelector
                        existingImages={imagesData?.data}
                        setImages={(newImages) => {
                            setImages(newImages);
                            setData("image_id", newImages[0]?.id ?? null);
                        }}
                        images={images ?? []}
                    />
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

PostForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
