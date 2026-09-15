import InputField from "@/Components/Form/InputField";
import SelectField from "@/Components/Form/SelectField";
import SwitchField from "@/Components/Form/SwitchField";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import AdminLayout from "@/Layouts/AdminLayout";
import { slugifyFields } from "@/lib/InputHelper";
import { RouteList } from "@/routes/RouteList";
import { useForm, router } from "@inertiajs/react";
import { Button, Card, Col, Divider, Form, Row, Space } from "antd";
import React from "react";

interface EshopAttributeTranslation {
    id?: number;
    locale: string;
    name: string;
}

interface EshopAttributeData {
    id: number;
    name: string;
    slug: string;
    format_type?: string;
    sort_order?: number;
    is_active?: boolean;
    translates?: EshopAttributeTranslation[];
    [key: string]: any;
}

interface FormAttributePageProps {
    languages?: any;
    eshopAttribute?: EshopAttributeData | null;
    nextSortOrder?: number;
}

export default function FormAttributePage({
    languages = [],
    eshopAttribute = null,
    nextSortOrder = 1,
}: FormAttributePageProps) {
    const isEditing = Boolean(eshopAttribute && eshopAttribute.id);

    const prepareInitialTranslations = () => {
        if (!eshopAttribute) {
            return [];
        }

        const translations: EshopAttributeTranslation[] = [
            {
                locale: "en",
                name: eshopAttribute.name || "",
            },
        ];

        if (Array.isArray(eshopAttribute.translates)) {
            eshopAttribute.translates.forEach((trans) => {
                if (trans.locale !== "en") {
                    translations.push({
                        locale: trans.locale,
                        name: trans.name || "",
                    });
                }
            });
        }

        return translations;
    };

    const { data, setData, post, put, processing, errors } = useForm({
        name: eshopAttribute?.name || "",
        slug: eshopAttribute?.slug || "",
        format_type: eshopAttribute?.format_type || "select",
        sort_order: eshopAttribute?.sort_order ?? nextSortOrder ?? 1,
        is_active: eshopAttribute ? Boolean(eshopAttribute.is_active) : true,
        default_locale: "en",
        translations: prepareInitialTranslations(),
    });

    const handleSubmit = () => {
        const englishTranslation = (
            data.translations as EshopAttributeTranslation[]
        )?.find((t) => t.locale === "en");

        const payload = {
            ...data,
            name: englishTranslation?.name || data.name,
            slug:
                data.slug ||
                slugifyFields(englishTranslation?.name || data.name),
        };

        const targetUrl = isEditing
            ? RouteList.editEshopAttribute?.(eshopAttribute!.id) ||
              `/eshop-attributes/${eshopAttribute!.id}`
            : RouteList.eshopAttributes?.() || "/eshop-attributes";

        if (isEditing) {
            put(targetUrl);
        } else {
            post(targetUrl);
        }
    };

    const formatTypeOptions = [
        { label: "Dropdown (Select)", value: "select" },
        { label: "Radio Buttons", value: "radio" },
        { label: "Color Swatch", value: "color" },
        { label: "Checkbox", value: "checkbox" },
        { label: "Text", value: "text" },
        { label: "Number", value: "number" },
        { label: "Textarea", value: "textarea" },
        { label: "Date", value: "date" },
        { label: "Image", value: "image" },
        { label: "Multi-Select Dropdown", value: "select_multiple" },
        { label: "Multi-Select Checkboxes", value: "checkbox_multiple" },
    ];

    return (
        <div>
            <PopupFormMessage errors={errors} />

            <PageHeaderActions
                title={
                    isEditing
                        ? `Edit Attribute: ${eshopAttribute?.name || ""}`
                        : "Create Eshop Attribute"
                }
                backAction={RouteList.eshopAttributes()}
                backName="View Attributes"
            />

            <Form layout="vertical" onFinish={handleSubmit}>
                <Card>
                    <Divider>Attribute Content & Translations</Divider>

                    <MultiLanguageFields
                        languages={languages}
                        value={data.translations}
                        onChange={(
                            translations: EshopAttributeTranslation[],
                        ) => {
                            setData("translations", translations);

                            const enTrans = translations.find(
                                (t) => t.locale === "en",
                            );
                            if (enTrans) {
                                if (enTrans.name) {
                                    setData("name", enTrans.name);
                                }
                            }
                        }}
                    >
                        {(
                            locale: string,
                            isDefaultLanguage: boolean,
                            translationData: EshopAttributeTranslation,
                            updateField: (field: string, val: any) => void,
                        ) => (
                            <Row gutter={16}>
                                <Col xs={24} md={isDefaultLanguage ? 12 : 24}>
                                    <InputField
                                        label={`Attribute Name (${locale.toUpperCase()})`}
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
                                        placeholder="e.g. Size, Color, Flower Type"
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
                                                setData("slug", e.target.value)
                                            }
                                            error={errors.slug}
                                            placeholder="e.g. size"
                                        />
                                    </Col>
                                )}
                            </Row>
                        )}
                    </MultiLanguageFields>

                    <Divider>Attribute Settings</Divider>

                    <Row gutter={16} align="middle">
                        <Col xs={24} md={18}>
                            <SelectField
                                label="Format Type"
                                name="format_type"
                                value={data.format_type}
                                onChange={(e: any) =>
                                    setData("format_type", e.target.value)
                                }
                                options={formatTypeOptions}
                                error={errors.format_type}
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
                                label="Attribute Visibility"
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
                        style={{ width: "100%", marginTop: 16 }}
                        size="middle"
                    >
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={processing}
                            block
                        >
                            {isEditing ? "Update Attribute" : "Save Attribute"}
                        </Button>
                    </Space>
                </Card>
            </Form>
        </div>
    );
}

FormAttributePage.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);
