import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import SelectField from "@/Components/Form/SelectField";
import SwitchField from "@/Components/Form/SwitchField";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import { PRODUCT_TYPE_OPTIONS } from "@/enum/Product.enum";
import { slugifyFields } from "@/lib/InputHelper";
import { Col, Divider, Row } from "antd";
import React from "react";

interface GeneralStepProps {
    data: any;
    setData: any;
    errors: any;
    languages: any[];
    isEditing: boolean;
    updateField?: (field: string, val: any) => void;
}

export default function GeneralStep({
    data,
    setData,
    errors,
    languages = [],
    isEditing,
}: GeneralStepProps) {
    console.log("🚀 ~ GeneralStep ~ data:", data);
    return (
        <div>
            <MultiLanguageFields
                languages={languages}
                value={data.translations}
                onChange={(translations: any[]) => {
                    const en = translations?.find(
                        (t: any) => t.locale === "en",
                    );
                    setData((prev: any) => ({
                        ...prev,
                        translations,
                        ...(en
                            ? {
                                  name:
                                      en.name !== undefined
                                          ? en.name
                                          : prev.name,
                                  description:
                                      en.description !== undefined
                                          ? en.description
                                          : prev.description,
                                  short_description:
                                      en.short_description !== undefined
                                          ? en.short_description
                                          : prev.short_description,
                                  allergens_text:
                                      en.allergens_text !== undefined
                                          ? en.allergens_text
                                          : prev.allergens_text,
                                  delivery_info:
                                      en.delivery_info !== undefined
                                          ? en.delivery_info
                                          : prev.delivery_info,
                                  product_care:
                                      en.product_care !== undefined
                                          ? en.product_care
                                          : prev.product_care,
                              }
                            : {}),
                    }));
                }}
            >
                {(
                    locale: string,
                    isDefaultLanguage: boolean,
                    currentTranslation: any,
                    updateField: (field: string, val: any) => void,
                ) => (
                    <div>
                        <Row gutter={16}>
                            <Col xs={24} md={isDefaultLanguage ? 12 : 24}>
                                <InputField
                                    label={`Product Name (${locale.toUpperCase()})`}
                                    name={`translations[${locale}][name]`}
                                    value={
                                        isDefaultLanguage
                                            ? data.name
                                            : currentTranslation?.name || ""
                                    }
                                    onChange={(e: any) => {
                                        const val = e.target.value;
                                        updateField("name", val);
                                        if (isDefaultLanguage) {
                                            setData((prev: any) => ({
                                                ...prev,
                                                name: val,
                                                slug: !isEditing
                                                    ? slugifyFields(val)
                                                    : prev.slug,
                                            }));
                                        }
                                    }}
                                    error={
                                        isDefaultLanguage
                                            ? errors.name
                                            : errors[
                                                  `translations.${locale}.name`
                                              ]
                                    }
                                    required={isDefaultLanguage}
                                    placeholder="e.g. Vintage Heart Cake"
                                />
                            </Col>

                            {isDefaultLanguage && (
                                <Col xs={24} md={12}>
                                    <InputField
                                        label="Slug"
                                        name="slug"
                                        disabled={isEditing}
                                        value={data.slug}
                                        onChange={(e: any) =>
                                            setData("slug", e.target.value)
                                        }
                                        error={errors.slug}
                                        placeholder="e.g. vintage-heart-cake"
                                        required
                                    />
                                </Col>
                            )}
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24}>
                                <InputField
                                    label={`Short Description (${locale.toUpperCase()})`}
                                    name={`translations[${locale}][short_description]`}
                                    value={
                                        isDefaultLanguage
                                            ? data.short_description || ""
                                            : currentTranslation?.short_description ||
                                              ""
                                    }
                                    onChange={(e: any) => {
                                        const val = e.target.value;
                                        updateField("short_description", val);
                                        if (isDefaultLanguage) {
                                            setData("short_description", val);
                                        }
                                    }}
                                    error={
                                        isDefaultLanguage
                                            ? errors.short_description
                                            : errors[
                                                  `translations.${locale}.short_description`
                                              ]
                                    }
                                    placeholder="Brief summary shown in listings"
                                />
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24}>
                                <RichTextArea
                                    label={`Full Description (${locale.toUpperCase()})`}
                                    name={`translations[${locale}][description]`}
                                    value={
                                        isDefaultLanguage
                                            ? data.description || ""
                                            : currentTranslation?.description ||
                                              ""
                                    }
                                    onChange={(val: any) => {
                                        updateField("description", val);
                                        if (isDefaultLanguage) {
                                            setData("description", val);
                                        }
                                    }}
                                    error={
                                        isDefaultLanguage
                                            ? errors.description
                                            : errors[
                                                  `translations.${locale}.description`
                                              ]
                                    }
                                    placeholder="Write compelling product description..."
                                />
                            </Col>
                        </Row>

                        <Divider style={{ margin: "16px 0" }}>
                            Additional Product Details ({locale.toUpperCase()})
                        </Divider>

                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <RichTextArea
                                    label={`Allergens Info (${locale.toUpperCase()})`}
                                    name={`translations[${locale}][allergens_text]`}
                                    value={
                                        isDefaultLanguage
                                            ? data.allergens_text || ""
                                            : currentTranslation?.allergens_text ||
                                              ""
                                    }
                                    onChange={(val: any) => {
                                        updateField("allergens_text", val);
                                        if (isDefaultLanguage) {
                                            setData("allergens_text", val);
                                        }
                                    }}
                                    error={
                                        isDefaultLanguage
                                            ? errors.allergens_text
                                            : errors[
                                                  `translations.${locale}.allergens_text`
                                              ]
                                    }
                                    placeholder="e.g. Contains gluten, eggs, dairy"
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <RichTextArea
                                    label={`Delivery Info (${locale.toUpperCase()})`}
                                    name={`translations[${locale}][delivery_info]`}
                                    value={
                                        isDefaultLanguage
                                            ? data.delivery_info || ""
                                            : currentTranslation?.delivery_info ||
                                              ""
                                    }
                                    onChange={(val: any) => {
                                        updateField("delivery_info", val);
                                        if (isDefaultLanguage) {
                                            setData("delivery_info", val);
                                        }
                                    }}
                                    error={
                                        isDefaultLanguage
                                            ? errors.delivery_info
                                            : errors[
                                                  `translations.${locale}.delivery_info`
                                              ]
                                    }
                                    placeholder="e.g. 24 hours advance notice required"
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <RichTextArea
                                    label={`Product Care (${locale.toUpperCase()})`}
                                    name={`translations[${locale}][product_care]`}
                                    value={
                                        isDefaultLanguage
                                            ? data.product_care || ""
                                            : currentTranslation?.product_care ||
                                              ""
                                    }
                                    onChange={(val: any) => {
                                        updateField("product_care", val);
                                        if (isDefaultLanguage) {
                                            setData("product_care", val);
                                        }
                                    }}
                                    error={
                                        isDefaultLanguage
                                            ? errors.product_care
                                            : errors[
                                                  `translations.${locale}.product_care`
                                              ]
                                    }
                                    placeholder="e.g. Keep refrigerated until serving"
                                />
                            </Col>
                        </Row>
                    </div>
                )}
            </MultiLanguageFields>

            <Divider>Pricing & Type Settings</Divider>

            <Row gutter={16} align="middle">
                <Col xs={24} md={6}>
                    <SelectField
                        label="Product Type"
                        name="product_type"
                        value={data.product_type}
                        onChange={(e) =>
                            setData("product_type", e.target.value)
                        }
                        error={errors.product_type}
                        options={PRODUCT_TYPE_OPTIONS}
                    />
                </Col>

                <Col xs={24} md={6}>
                    <InputField
                        label="Base Price (€)"
                        name="base_price"
                        type="number"
                        step="0.01"
                        value={data.base_price}
                        onChange={(e: any) =>
                            setData("base_price", e.target.value)
                        }
                        error={errors.base_price}
                        placeholder="0.00"
                    />
                </Col>

                <Col xs={24} md={6}>
                    <InputField
                        label="Sale Price (€)"
                        name="sale_price"
                        type="number"
                        step="0.01"
                        value={data.sale_price}
                        onChange={(e: any) =>
                            setData("sale_price", e.target.value)
                        }
                        error={errors.sale_price}
                        placeholder="Optional discounted price"
                    />
                </Col>

                <Col xs={24} md={6}>
                    <SelectField
                        label="Publish Status"
                        name="status"
                        value={data.status}
                        onChange={(e) => setData("status", e.target.value)}
                        error={errors.status}
                        options={[
                            { value: "public", label: "Public (Published)" },
                            { value: "draft", label: "Draft" },
                            { value: "inactive", label: "Inactive" },
                            { value: "archived", label: "Archived" },
                        ]}
                    />
                </Col>
            </Row>

            <Row gutter={16} align="middle">
                <Col xs={24} md={12}>
                    <SwitchField
                        label="Is Customisable"
                        name="is_customizable"
                        checked={Boolean(data.is_customizable)}
                        onChange={(checked: boolean) =>
                            setData("is_customizable", checked)
                        }
                        valueA="Customisable"
                        valueB="Standard"
                        error={errors.is_customizable}
                    />
                </Col>

                <Col xs={24} md={12}>
                    <SwitchField
                        label="Product Visibility"
                        name="is_active"
                        checked={Boolean(data.is_active)}
                        onChange={(checked: boolean) =>
                            setData("is_active", checked)
                        }
                        valueA="Active"
                        valueB="Inactive"
                        error={errors.is_active}
                    />
                </Col>
            </Row>
        </div>
    );
}
