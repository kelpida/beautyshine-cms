import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import SelectField from "@/Components/Form/SelectField";
import SwitchField from "@/Components/Form/SwitchField";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
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
    return (
        <div>
            <MultiLanguageFields
                languages={languages}
                value={data.translations}
                onChange={(translations: any[]) => {
                    setData("translations", translations);
                    const en = translations?.find((t: any) => t.locale === "en");
                    if (en) {
                        if (en.name !== undefined) setData("name", en.name);
                        if (en.description !== undefined) setData("description", en.description);
                        if (en.short_description !== undefined) setData("short_description", en.short_description);
                        if (en.allergens_text !== undefined) setData("allergens_text", en.allergens_text);
                        if (en.delivery_info !== undefined) setData("delivery_info", en.delivery_info);
                        if (en.product_care !== undefined) setData("product_care", en.product_care);
                    }
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
                                            : currentTranslation?.short_description || ""
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
                                            : currentTranslation?.description || ""
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
                                <InputField
                                    label={`Allergens Info (${locale.toUpperCase()})`}
                                    name={`translations[${locale}][allergens_text]`}
                                    value={
                                        isDefaultLanguage
                                            ? data.allergens_text || ""
                                            : currentTranslation?.allergens_text || ""
                                    }
                                    onChange={(e: any) => {
                                        const val = e.target.value;
                                        updateField("allergens_text", val);
                                        if (isDefaultLanguage) {
                                            setData("allergens_text", val);
                                        }
                                    }}
                                    placeholder="e.g. Contains gluten, eggs, dairy"
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <InputField
                                    label={`Delivery Info (${locale.toUpperCase()})`}
                                    name={`translations[${locale}][delivery_info]`}
                                    value={
                                        isDefaultLanguage
                                            ? data.delivery_info || ""
                                            : currentTranslation?.delivery_info || ""
                                    }
                                    onChange={(e: any) => {
                                        const val = e.target.value;
                                        updateField("delivery_info", val);
                                        if (isDefaultLanguage) {
                                            setData("delivery_info", val);
                                        }
                                    }}
                                    placeholder="e.g. 24 hours advance notice required"
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <InputField
                                    label={`Product Care (${locale.toUpperCase()})`}
                                    name={`translations[${locale}][product_care]`}
                                    value={
                                        isDefaultLanguage
                                            ? data.product_care || ""
                                            : currentTranslation?.product_care || ""
                                    }
                                    onChange={(e: any) => {
                                        const val = e.target.value;
                                        updateField("product_care", val);
                                        if (isDefaultLanguage) {
                                            setData("product_care", val);
                                        }
                                    }}
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
                        onChange={(val: string) => setData("product_type", val)}
                        error={errors.product_type}
                        options={[
                            { value: "simple", label: "Simple Product" },
                            {
                                value: "configurable",
                                label: "Configurable (With Variations)",
                            },
                        ]}
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
                        onChange={(val: string) => setData("status", val)}
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
