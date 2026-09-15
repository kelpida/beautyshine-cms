import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import SelectField from "@/Components/Form/SelectField";
import SwitchField from "@/Components/Form/SwitchField";
import MediaSelector from "@/Components/MediaSelector";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import AdminLayout from "@/Layouts/AdminLayout";
import { slugifyFields } from "@/lib/InputHelper";
import { RouteList } from "@/routes/RouteList";
import { useForm, router } from "@inertiajs/react";
import { Button, Card, Col, Divider, Form, Row, Space } from "antd";
import React, { useEffect, useState } from "react";

interface EshopCategoryTranslation {
    id?: number;
    locale: string;
    name: string;
    description?: string;
    slug?: string;
}

interface EshopCategoryData {
    id: number;
    name: string;
    slug: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
    parent_id?: number | null;
    image_id?: number | null;
    image?: any;
    parent?: any;
    translates?: EshopCategoryTranslation[];
    [key: string]: any;
}

interface FormEshopCategoryPageProps {
    languages?: any;
    eshopCategory?: EshopCategoryData | null;
    parentCategories?: EshopCategoryData[] | { data: EshopCategoryData[] };
    images?: any;
    nextSortOrder?: number;
}

export default function FormEshopCategoryPage({
    languages = [],
    eshopCategory = null,
    parentCategories = [],
    images = [],
    nextSortOrder = 1,
}: FormEshopCategoryPageProps) {
    const isEditing = Boolean(eshopCategory && eshopCategory.id);

    // Initial image resolution
    const initialImages = eshopCategory?.image
        ? [eshopCategory.image]
        : eshopCategory?.image_id
          ? [{ id: eshopCategory.image_id }]
          : [];
    const [selectedImages, setSelectedImages] = useState<any[]>(initialImages);

    // Setup initial translation list
    const prepareInitialTranslations = () => {
        if (!eshopCategory) {
            return [];
        }

        const translations: EshopCategoryTranslation[] = [
            {
                locale: "en",
                name: eshopCategory.name || "",
                description: eshopCategory.description || "",
                slug: eshopCategory.slug || "",
            },
        ];

        if (Array.isArray(eshopCategory.translates)) {
            eshopCategory.translates.forEach((trans) => {
                if (trans.locale !== "en") {
                    translations.push({
                        locale: trans.locale,
                        name: trans.name || "",
                        description: trans.description || "",
                    });
                }
            });
        }

        return translations;
    };

    const { data, setData, post, put, processing, errors } = useForm({
        name: eshopCategory?.name || "",
        slug: eshopCategory?.slug || "",
        description: eshopCategory?.description || "",
        sort_order: eshopCategory?.sort_order ?? nextSortOrder ?? 1,
        is_active: eshopCategory ? Boolean(eshopCategory.is_active) : true,
        parent_id: eshopCategory?.parent_id
            ? String(eshopCategory.parent_id)
            : "",
        image_id: eshopCategory?.image_id || null,
        default_locale: "en",
        translations: prepareInitialTranslations(),
    });

    useEffect(() => {
        if (eshopCategory) {
            if (eshopCategory.image) {
                setSelectedImages([eshopCategory.image]);
            }
        }
    }, [eshopCategory]);

    const handleSubmit = () => {
        // Ensure default English values are synchronized into root fields
        const englishTranslation = (
            data.translations as EshopCategoryTranslation[]
        )?.find((t) => t.locale === "en");

        const payload = {
            ...data,
            name: englishTranslation?.name || data.name,
            description: englishTranslation?.description ?? data.description,
            slug:
                data.slug ||
                slugifyFields(englishTranslation?.name || data.name),
        };

        const targetUrl = isEditing
            ? RouteList.editEshopCategory?.(eshopCategory!.id) ||
              `/eshop-categories/${eshopCategory!.id}`
            : RouteList.eshopCategories?.() || "/eshop-categories";

        if (isEditing) {
            put(targetUrl);
        } else {
            post(targetUrl);
        }
    };

    // Prepare options for Parent Category dropdown
    const rawParents = Array.isArray(parentCategories)
        ? parentCategories
        : parentCategories?.data || [];

    const parentOptions = rawParents
        .filter((cat) => (isEditing ? cat.id !== eshopCategory?.id : true))
        .map((cat) => ({
            label: cat.name,
            value: String(cat.id),
        }));

    return (
        <div>
            <PopupFormMessage errors={errors} />

            <PageHeaderActions
                title={
                    isEditing
                        ? `Edit Category: ${eshopCategory?.name || ""}`
                        : "Create Eshop Category"
                }
                backAction={RouteList.eshopCategories()}
                backName="View Categories"
            />

            <Form layout="vertical" onFinish={handleSubmit}>
                <Card>
                    <Divider>Category Content & Translations</Divider>
                    <MultiLanguageFields
                        languages={languages}
                        value={data.translations}
                        onChange={(
                            translations: EshopCategoryTranslation[],
                        ) => {
                            setData("translations", translations);

                            // Automatically keep root name and description updated if English changes
                            const enTrans = translations.find(
                                (t) => t.locale === "en",
                            );
                            if (enTrans) {
                                if (enTrans.name) {
                                    setData("name", enTrans.name);
                                }
                                if (enTrans.description !== undefined) {
                                    setData("description", enTrans.description);
                                }
                            }
                        }}
                    >
                        {(
                            locale: string,
                            isDefaultLanguage: boolean,
                            translationData: EshopCategoryTranslation,
                            updateField: (field: string, val: any) => void,
                        ) => (
                            <>
                                <Row gutter={16}>
                                    <Col
                                        xs={24}
                                        md={isDefaultLanguage ? 12 : 24}
                                    >
                                        <InputField
                                            label={`Category Name (${locale.toUpperCase()})`}
                                            name={`translations[${locale}][name]`}
                                            required
                                            value={translationData.name || ""}
                                            onChange={(e: any) => {
                                                const val = e.target.value;
                                                updateField("name", val);

                                                if (
                                                    isDefaultLanguage &&
                                                    !isEditing
                                                ) {
                                                    setData(
                                                        "slug",
                                                        slugifyFields(val),
                                                    );
                                                }
                                            }}
                                            error={
                                                errors[
                                                    `translations.${locale}.name`
                                                ] ||
                                                (isDefaultLanguage
                                                    ? errors.name
                                                    : undefined)
                                            }
                                            placeholder="e.g. Fresh Flowers, Roses, Bouquets"
                                        />
                                    </Col>

                                    {isDefaultLanguage && (
                                        <Col xs={24} md={12}>
                                            <InputField
                                                label="URL Slug"
                                                name="slug"
                                                required
                                                disabled={isEditing}
                                                value={data.slug}
                                                onChange={(e: any) =>
                                                    setData(
                                                        "slug",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors.slug}
                                                placeholder="e.g. fresh-flowers"
                                            />
                                        </Col>
                                    )}
                                </Row>

                                <Divider style={{ margin: "16px 0" }} />

                                <RichTextArea
                                    label={`Description (${locale.toUpperCase()})`}
                                    name={`translations[${locale}][description]`}
                                    value={translationData.description || ""}
                                    onChange={(val: string) => {
                                        updateField("description", val);
                                        if (isDefaultLanguage) {
                                            setData("description", val);
                                        }
                                    }}
                                    error={
                                        errors[
                                            `translations.${locale}.description`
                                        ] ||
                                        (isDefaultLanguage
                                            ? errors.description
                                            : undefined)
                                    }
                                />
                            </>
                        )}
                    </MultiLanguageFields>
                    <Divider style={{ marginTop: 14, marginBottom: 20 }}>
                        Category Image
                    </Divider>

                    <MediaSelector
                        images={selectedImages}
                        existingImages={images?.data || images || []}
                        maxCount={1}
                        label="Category Image"
                        setImages={(imgs: any[]) => {
                            setSelectedImages(imgs);
                            setData(
                                "image_id",
                                imgs && imgs.length > 0 ? imgs[0]?.id : null,
                            );
                        }}
                    />
                    {errors.image_id && (
                        <div
                            style={{
                                color: "#ff4d4f",
                                fontSize: 13,
                                marginTop: 8,
                            }}
                        >
                            {errors.image_id}
                        </div>
                    )}

                    <Divider>Category Hierarchy & Status</Divider>
                    <Row>
                        <Col xs={24} md={18}>
                            <SelectField
                                label="Parent Category"
                                name="parent_id"
                                value={data.parent_id || ""}
                                onChange={(e: any) =>
                                    setData("parent_id", e.target.value || "")
                                }
                                options={parentOptions}
                                placeholder="None (Top Level Category)"
                                error={errors.parent_id}
                                showSearch
                            />
                        </Col>
                        <Col
                            xs={24}
                            md={6}
                            style={{
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <SwitchField
                                label="Category Visibility"
                                name="is_active"
                                checked={data.is_active}
                                onChange={(checked: boolean) =>
                                    setData("is_active", checked)
                                }
                                valueA="Active"
                                valueB="Inactive"
                                error={errors.is_active}
                            />
                        </Col>
                    </Row>
                    <Space
                        orientation="vertical"
                        style={{ width: "100%" }}
                        size="middle"
                    >
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={processing}
                            block
                        >
                            {isEditing ? "Update Category" : "Save Category"}
                        </Button>
                    </Space>
                </Card>
            </Form>
        </div>
    );
}

FormEshopCategoryPage.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);
