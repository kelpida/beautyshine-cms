import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import SelectField from "@/Components/Form/SelectField";
import MediaSelector from "@/Components/MediaSelector";
import MediaSelectorModal from "@/Components/MediaSelectorModal";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { useForm } from "@inertiajs/react";
import { Button, Card, Col, Divider, Form, message, Row } from "antd";
import useMessage from "antd/es/message/useMessage";
import React, { useEffect, useState } from "react";

export default function PostCategoryForm({
    category = null,
    parents = [],
    images = [],
    languages = [],
}: {
    category?: any;
    parents?: any;
    images?: any;
    languages?: any;
}) {
    const [image, setImage] = useState(
        category ? [category?.data?.seo_meta?.meta_image] : []
    );
    const [categoryData, setCategoryData] = useState(category?.data);

    useEffect(() => {
        if (category) {
            setCategoryData(category?.data);
            setImage([category?.data?.seo_meta?.meta_image]);
        }
    }, [category]);

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm<any>({
        name: categoryData?.name || "",
        path: categoryData?.path || "",
        description: categoryData?.description || "",
        parent_id: categoryData?.parent?.id || "",
        meta_title: categoryData?.seo_meta?.meta_title || "",
        meta_description: categoryData?.seo_meta?.meta_description || "",
        image_id: categoryData?.seo_meta?.image_id || "",
        translates: categoryData
            ? {
                  ...categoryData.translates,
                  en: {
                      locale: "en",
                      name: categoryData.name || "",
                      description: categoryData.description || "",
                  },
              }
            : [],
    });

    const handleSubmit = () => {
        if (category) {
            put(
                route("post-categories.update", {
                    post_category: category.data.id,
                })
            );
        } else {
            submitPost(route("post-categories.store"));
        }
    };
    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={category ? "Update Category" : "Create Category"}
                backAction={RouteList.postCategories()}
                backName={"View Post Categories"}
            />
            <Card>
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        title: data?.name,
                        path: data?.path,
                        author_id: data?.author_id,
                        meta_title: data?.meta_title,
                        meta_description: data?.meta_description,
                        image_id: data?.image_id,
                        parent_id: data?.parent_id,
                        translates: data?.translates,
                    }}
                >
                    <MultiLanguageFields
                        languages={languages}
                        value={data.translates}
                        onChange={(translates) =>
                            setData("translates", translates)
                        }
                    >
                        {(
                            locale,
                            isDefaultLanguage,
                            translationData,
                            updateField
                        ) => (
                            <>
                                <Divider>Post content</Divider>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <InputField
                                            label="Name"
                                            name={`translates[${locale}][name]`}
                                            required
                                            value={translationData.name || ""}
                                            onChange={(e) => {
                                                const name = e.target.value;

                                                // Update the name field
                                                updateField("name", name);

                                                // Auto-generate path only for English
                                                if (isDefaultLanguage) {
                                                    const path = name
                                                        .toLowerCase()
                                                        .trim()
                                                        .replace(
                                                            /[^a-z0-9]+/g,
                                                            "-"
                                                        )
                                                        .replace(
                                                            /^-+|-+$/g,
                                                            "-"
                                                        );
                                                    setData("path", path);
                                                }
                                            }}
                                            error={
                                                errors[
                                                    `translates.${locale}.name`
                                                ]
                                            }
                                            placeholder="Category name"
                                        />
                                    </Col>
                                    {isDefaultLanguage && (
                                        <>
                                            <Col xs={24} md={12}>
                                                <InputField
                                                    label="Url Path"
                                                    name="path"
                                                    required
                                                    value={data.path}
                                                    onChange={(e) =>
                                                        setData(
                                                            "path",
                                                            e.target.value
                                                        )
                                                    }
                                                    error={errors.path}
                                                    placeholder="Enter the url path"
                                                />
                                            </Col>

                                            <Col xs={24}>
                                                <SelectField
                                                    label="Parent Category"
                                                    name="parent_id"
                                                    value={data.parent_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            "parent_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    options={parents?.data?.map(
                                                        (category) => ({
                                                            label: category.name,
                                                            value: category.id,
                                                        })
                                                    )}
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>

                                <RichTextArea
                                    label="Description"
                                    name={`translates[${locale}][description]`}
                                    value={translationData.description || ""}
                                    onChange={(val) =>
                                        updateField("description", val)
                                    }
                                    required
                                    error={
                                        errors[
                                            `translates.${locale}.description`
                                        ]
                                    }
                                />
                                {isDefaultLanguage && (
                                    <>
                                        <Divider>Post SEO</Divider>

                                        <Row gutter={16}>
                                            <Col xs={24} md={12}>
                                                <InputField
                                                    label="Meta Title"
                                                    name="meta_title"
                                                    required
                                                    value={
                                                        data.meta_title || ""
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "meta_title",
                                                            e.target.value
                                                        )
                                                    }
                                                    error={errors.meta_title}
                                                    placeholder="Enter a meta title"
                                                />
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <InputField
                                                    label="Meta Description"
                                                    name="meta_description"
                                                    required
                                                    value={
                                                        data.meta_description ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "meta_description",
                                                            e.target.value
                                                        )
                                                    }
                                                    error={
                                                        errors.meta_description
                                                    }
                                                    placeholder="Enter a meta description"
                                                />
                                            </Col>
                                        </Row>

                                        <MediaSelector
                                            existingImages={images?.data}
                                            setImages={(newImages) => {
                                                setImage(newImages);
                                                setData(
                                                    "image_id",
                                                    newImages[0]?.id ?? ""
                                                );
                                            }}
                                            images={image}
                                            maxCount={1}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </MultiLanguageFields>

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
PostCategoryForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
