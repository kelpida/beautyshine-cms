import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { slugifyFields } from "@/lib/InputHelper";
import { useForm, router } from "@inertiajs/react";
import { Button, Card, Divider, Flex, Form, Space, Steps, message } from "antd";
import React, { useState } from "react";
import {
    InfoCircleOutlined,
    PictureOutlined,
    TagsOutlined,
    AppstoreOutlined,
    BranchesOutlined,
    GiftOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    SaveOutlined,
} from "@ant-design/icons";

import GeneralStep from "./Component/GeneralStep";
import MediaStep from "./Component/MediaStep";
import TaxonomySeoStep from "./Component/TaxonomySeoStep";
import AttributesStep from "./Component/AttributesStep";
import VariationsStep from "./Component/VariationsStep";
import AddonsFieldsStep from "./Component/AddonsFieldsStep";
import ReviewPublishStep from "./Component/ReviewPublishStep";

interface FormProductPageProps {
    product?: any;
    languages?: any[];
    categories?: any[];
    tags?: any[];
    availableAttributes?: any[];
    availableImages?: any[];
    nextSortOrder?: number;
}

export default function FormProductPage({
    product = null,
    languages = [],
    categories = [],
    tags = [],
    availableAttributes = [],
    availableImages = [],
    nextSortOrder = 1,
}: FormProductPageProps) {
    const isEditing = Boolean(product && product.id);
    const [currentStep, setCurrentStep] = useState(0);

    // Initial image resolution
    const initialMainImages = product?.main_image
        ? [product.main_image]
        : product?.image
          ? [product.image]
          : product?.main_image_id
            ? [{ id: product.main_image_id }]
            : [];
    const [mainImages, setMainImages] = useState<any[]>(initialMainImages);

    const initialGalleryImages = product?.gallery_images
        ? product.gallery_images
        : product?.product_images
          ? product.product_images.map(
                (pi: any) => pi.image || { id: pi.upload_file_id },
            )
          : [];
    const [galleryImages, setGalleryImages] =
        useState<any[]>(initialGalleryImages);

    // Initial translation list
    const prepareInitialTranslations = () => {
        const translations: any[] = [
            {
                locale: "en",
                name: product?.name || "",
                description: product?.description || "",
                short_description: product?.short_description || "",
                allergens_text: product?.allergens_text || "",
                delivery_info: product?.delivery_info || "",
                product_care: product?.product_care || "",
            },
        ];

        if (Array.isArray(product?.translates)) {
            product.translates.forEach((trans: any) => {
                if (trans.locale !== "en") {
                    translations.push({
                        locale: trans.locale,
                        name: trans.name || "",
                        description: trans.description || "",
                        short_description: trans.short_description || "",
                        allergens_text: trans.allergens_text || "",
                        delivery_info: trans.delivery_info || "",
                        product_care: trans.product_care || "",
                    });
                }
            });
        }

        return translations;
    };

    // Initial Attributes
    const prepareInitialAttributes = () => {
        if (!product?.product_attributes) return [];
        return product.product_attributes.map((pa: any) => ({
            attribute_id: pa.attribute_id,
            name: pa.attribute?.name || `Attribute #${pa.attribute_id}`,
            format_type: pa.attribute?.format_type || "select",
            is_required: Boolean(pa.is_required),
            sort_order: pa.sort_order,
            options: (pa.options || []).map((opt: any) => ({
                id: opt.id,
                name: opt.name,
                extra_price: opt.extra_price || 0,
                is_available: opt.is_available ?? true,
                sort_order: opt.sort_order,
            })),
        }));
    };

    // Initial Variations
    const prepareInitialVariations = () => {
        if (!product?.variations) return [];
        return product.variations.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            name: v.name,
            short_description: v.short_description ?? v.sort_description ?? "",
            price: v.price,
            sale_price: v.sale_price,
            quantity: v.quantity,
            is_available: Boolean(v.is_available),
            attribute_option_ids: (v.attribute_options || []).map(
                (ao: any) => ao.id,
            ),
            attribute_tags: (v.attribute_options || []).map(
                (ao: any) => ao.name,
            ),
        }));
    };

    // Initial Add-ons
    const prepareInitialAddons = () => {
        if (!product?.addons) return [];
        return product.addons.map((a: any) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            price: a.price,
            sale_price: a.sale_price,
            is_available: Boolean(a.is_available),
            sort_order: a.sort_order,
        }));
    };

    // Initial Custom Fields
    const prepareInitialCustomFields = () => {
        if (!product?.custom_fields) return [];
        return product.custom_fields.map((cf: any) => ({
            id: cf.id,
            name: cf.name,
            key: cf.key,
            field_type: cf.field_type,
            is_required: Boolean(cf.is_required),
            max_length: cf.max_length,
            sort_order: cf.sort_order,
            is_active: Boolean(cf.is_active),
        }));
    };

    const {
        data,
        setData,
        post: submitPost,
        put,
        transform,
        processing,
        errors,
    } = useForm({
        name: product?.name || "",
        slug: product?.slug || "",
        description: product?.description || "",
        short_description: product?.short_description || "",
        main_image_id: product?.main_image_id || null,
        gallery_images: initialGalleryImages
            .map((img: any) => img.id)
            .filter(Boolean),
        product_type: product?.product_type || "simple",
        base_price: product?.base_price ?? "",
        sale_price: product?.sale_price ?? "",
        is_customizable: product?.is_customizable ?? false,
        status: product?.status || "draft",
        sort_order: product?.sort_order ?? nextSortOrder ?? 1,
        allergens_text: product?.allergens_text || "",
        delivery_info: product?.delivery_info || "",
        product_care: product?.product_care || "",
        is_active: product ? Boolean(product.is_active) : true,
        category_ids: product?.categories
            ? product.categories.map((c: any) => c.id)
            : [],
        tag_ids: product?.tags ? product.tags.map((t: any) => t.id) : [],
        meta_title: product?.seo?.meta_title || "",
        meta_description: product?.seo?.meta_description || "",
        meta_keywords: "",
        video_url: "",
        translations: prepareInitialTranslations(),
        attributes: prepareInitialAttributes(),
        variations: prepareInitialVariations(),
        addons: prepareInitialAddons(),
        custom_fields: prepareInitialCustomFields(),
    });

    const stepsList = [
        { title: "General", icon: <InfoCircleOutlined /> },
        { title: "Media", icon: <PictureOutlined /> },
        { title: "Categories & SEO", icon: <TagsOutlined /> },
        { title: "Attributes", icon: <AppstoreOutlined /> },
        { title: "Variations", icon: <BranchesOutlined /> },
        { title: "Add-ons & Fields", icon: <GiftOutlined /> },
        { title: "Review & Publish", icon: <CheckCircleOutlined /> },
    ];

    const handleSubmit = (finalStatus?: string) => {
        const englishTranslation = (data.translations as any[])?.find(
            (t) => t.locale === "en",
        );

        const statusToSubmit = finalStatus || data.status || "public";
        const nameToSubmit =
            data.name?.trim() || englishTranslation?.name?.trim() || "";
        const slugToSubmit =
            data.slug?.trim() ||
            (nameToSubmit ? slugifyFields(nameToSubmit) : "");

        transform((currentData: any) => ({
            ...currentData,
            name: nameToSubmit,
            slug: slugToSubmit,
            status: statusToSubmit,
            // Exclude 'en' from translations payload so it's stored on the root entity
            translations: (currentData.translations || []).filter(
                (t: any) => t.locale !== "en" && Boolean(t.name?.trim()),
            ),
        }));

        const options = {
            preserveScroll: true,
            onError: (err: any) => {
                console.error("Product submission errors:", err);
                const firstErr = Object.values(err)[0] as string;
                if (firstErr) {
                    message.error(firstErr);
                } else {
                    message.error(
                        "Validation failed. Please check the required fields.",
                    );
                }
            },
            onSuccess: () => {
                message.success(
                    isEditing
                        ? "Product updated successfully!"
                        : "Product created successfully!",
                );
            },
        };

        if (isEditing) {
            put(
                RouteList.updateEshopProduct?.(product!.id) ||
                    `/eshop-products/${product!.id}`,
                options,
            );
        } else {
            submitPost(
                RouteList.eshopProducts?.() || "/eshop-products",
                options,
            );
        }
    };

    const handleNext = () => {
        if (currentStep < stepsList.length - 1) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />

            <PageHeaderActions
                title={
                    isEditing
                        ? `Edit Product: ${product?.name || ""}`
                        : "Add New Product"
                }
                backName="Back to Products"
                backAction={RouteList.eshopProducts()}
                children={
                    <Button
                        icon={<SaveOutlined />}
                        type="primary"
                        htmlType="button"
                        loading={processing}
                        onClick={() => handleSubmit("draft")}
                    >
                        Save Draft
                    </Button>
                }
            />

            <Form
                layout="vertical"
                initialValues={data}
            >
                <Card
                    style={{
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        marginBottom: 24,
                    }}
                >
                    {/* Top Stepper Navigation */}
                    <Steps
                        current={currentStep}
                        onChange={(step) => setCurrentStep(step)}
                        items={stepsList}
                        style={{ marginBottom: 28, padding: "8px 0" }}
                    />

                    <Divider style={{ margin: "16px 0 24px 0" }} />

                    {/* Step Content */}
                    <div style={{ minHeight: 420 }}>
                        {currentStep === 0 && (
                            <GeneralStep
                                data={data}
                                setData={setData}
                                errors={errors}
                                languages={languages}
                                isEditing={isEditing}
                                updateField={setData}
                            />
                        )}

                        {currentStep === 1 && (
                            <MediaStep
                                data={data}
                                setData={setData}
                                errors={errors}
                                mainImages={mainImages}
                                setMainImages={setMainImages}
                                galleryImages={galleryImages}
                                setGalleryImages={setGalleryImages}
                                availableImages={availableImages}
                            />
                        )}

                        {currentStep === 2 && (
                            <TaxonomySeoStep
                                data={data}
                                setData={setData}
                                errors={errors}
                                categories={categories}
                                tags={tags}
                                languages={languages}
                            />
                        )}

                        {currentStep === 3 && (
                            <AttributesStep
                                data={data}
                                setData={setData}
                                availableAttributes={availableAttributes}
                            />
                        )}

                        {currentStep === 4 && (
                            <VariationsStep
                                data={data}
                                setData={setData}
                                errors={errors}
                            />
                        )}

                        {currentStep === 5 && (
                            <AddonsFieldsStep data={data} setData={setData} />
                        )}

                        {currentStep === 6 && (
                            <ReviewPublishStep
                                data={data}
                                languages={languages}
                                categories={categories}
                                tags={tags}
                            />
                        )}
                    </div>

                    <Divider style={{ margin: "28px 0 20px 0" }} />

                    {/* Bottom Action Wizard Bar */}
                    <Flex
                        justify="space-between"
                        align="center"
                        wrap="wrap"
                        gap={12}
                    >
                        <Button
                            key="btn-back"
                            htmlType="button"
                            icon={<ArrowLeftOutlined />}
                            disabled={currentStep === 0}
                            onClick={handleBack}
                        >
                            Back
                        </Button>

                        {currentStep < stepsList.length - 1 ? (
                            <Button
                                key="btn-next"
                                type="primary"
                                htmlType="button"
                                onClick={handleNext}
                            >
                                <span>Save & Continue</span>
                                <ArrowRightOutlined />
                            </Button>
                        ) : (
                            <Button
                                key="btn-publish"
                                type="primary"
                                htmlType="button"
                                size="large"
                                loading={processing}
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleSubmit("public")}
                                style={{
                                    backgroundColor: "#f73859",
                                    borderColor: "#f73859",
                                    padding: "0 28px",
                                }}
                            >
                                {isEditing
                                    ? "Update & Publish Product"
                                    : "Publish Product"}
                            </Button>
                        )}
                    </Flex>
                </Card>
            </Form>
        </div>
    );
}

FormProductPage.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);
