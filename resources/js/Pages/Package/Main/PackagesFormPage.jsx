import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import SelectField from "@/Components/Form/SelectField";
import MediaSelector from "@/Components/MediaSelector";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { useForm } from "@inertiajs/react";
import { Button, Card, Col, Divider, Form, Row } from "antd";
import React, { useState } from "react";
import PropertyAttributesRender from "@/Components/PropertyAttributesRender";
import SwitchField from "@/Components/Form/SwitchField";
import { useGeneratePath } from "@/hooks/useGeneratePath";
import AuditLogs from "@/Components/AuditLogs";
import { CurrencyOptions } from "@/enum/CurrencyLabel.enum";
import PackageCapacityComponent from "@/Components/PackageCapacityComponent";
import MultiSelectField from "@/Components/Form/MultiSelectField";

export default function PackagesFormPage({
    package: packageProp = null,
    languages = [],
    packageStatuses = [],
    packageCategories = [],
    packageGenders = [],
    packageAges = [],
    categoriesAttributes = [],
    images = [],
    auditLogs = [],
    stores = [],
}) {
    // If package is passed as an empty array, treat as null
    const packageData =
        Array.isArray(packageProp?.data) && packageProp.data.length === 0
            ? null
            : packageProp?.data;

    const [image, setImage] = useState(
        packageData ? [packageData?.main_image] : [],
    );

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
        transform,
    } = useForm({
        number: packageData?.number || "",
        name: packageData?.name || "",
        subtitle: packageData?.subtitle || "",
        path: packageData?.path || "",
        price: packageData?.price || "",
        currency: packageData?.currency || "EUR",
        purpose: packageData?.purpose || "",
        preparation: packageData?.preparation || [],
        tests: packageData?.tests || [],
        faq: packageData?.faq || [],
        viva_wallet_product_id: packageData?.viva_wallet_product_id || "",
        main_image_id: packageData?.main_image?.id || "",
        order_id: packageData?.order_id || 0,
        is_featured: packageData?.is_featured || false,
        package_status_id: packageData?.package_status?.id || "",
        package_category_ids:
            packageData?.package_categories?.map((cat) => cat.id) || [],
        package_gender_id: packageData?.package_gender?.id || "",
        package_age_id: packageData?.package_age?.id || "",
        duration: packageData?.duration || "",
        capacities: packageData?.packageCapacities || [],
        test_category_ids:
            packageData?.test_categories?.map((tc) => tc.id) || [],
        attributes:
            packageData?.attributes?.reduce((acc, attr) => {
                const val = attr.value || attr.pivot?.value || "";
                acc[attr.id] =
                    attr.type == "checkbox"
                        ? val === "1"
                            ? true
                            : val === "0"
                              ? false
                              : val
                        : val;
                return acc;
            }, {}) || {},
        translates: packageData?.translates
            ? Object.values(
                  (packageData?.translates || []).reduce(
                      (acc, t) => {
                          acc[t.locale] = t;
                          return acc;
                      },
                      {
                          en: {
                              locale: "en",
                              name: packageData?.name || "",
                              subtitle: packageData?.subtitle || "",
                              description: packageData?.description || "",
                              purpose: packageData?.purpose || "",
                          },
                      },
                  ),
              )
            : Object.values(
                  languages.reduce(
                      (acc, l) => {
                          if (l.code !== "en") {
                              acc[l.code] = {
                                  locale: l.code,
                                  name: "",
                                  subtitle: "",
                                  description: "",
                                  purpose: "",
                              };
                          }
                          return acc;
                      },
                      {
                          en: {
                              locale: "en",
                              name: packageData?.name || "",
                              subtitle: packageData?.subtitle || "",
                              description: packageData?.description || "",
                              purpose: packageData?.purpose || "",
                          },
                      },
                  ),
              ),
    });

    transform((data) => ({
        ...data,
        preparation: Array.isArray(data.preparation) ? data.preparation : [],
        tests: Array.isArray(data.tests) ? data.tests : [],
        faq: Array.isArray(data.faq) ? data.faq : [],
        attributes: Object.entries(data.attributes).reduce(
            (acc, [key, value]) => {
                acc[key] =
                    typeof value === "boolean"
                        ? value
                            ? "true"
                            : "false"
                        : value;
                return acc;
            },
            {},
        ),
        translates: Object.values(data.translates || {}),
    }));

    const handleBlurTranslate = async (text, fieldName) => {
        if (!text || !fieldName) return;

        try {
            // Loop over languages
            for (const language of languages) {
                if (language.code === "en" || language.code === "el") continue;

                const response = await axios.post("/google-translate", {
                    text: text,
                    locale: language.code,
                });
                const result = response.data;

                if (result?.data?.translations?.[0]?.translatedText) {
                    setData((prev) => ({
                        ...prev,
                        translates: prev.translates.map((t) => {
                            if (t.locale === language.code) {
                                return {
                                    ...t,
                                    [fieldName]:
                                        result.data.translations[0]
                                            .translatedText,
                                };
                            }
                            return t;
                        }),
                    }));
                }
            }
        } catch (error) {
            console.error("Translation error:", error);
        }
    };

    const handleSubmit = () => {
        if (packageData) {
            put(route("packages.update", packageData.id));
        } else {
            submitPost(route("packages.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={packageData ? "Update Package" : "Create Package"}
                backAction={RouteList.packages()}
                backName={"View Packages"}
            />
            <Card>
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={data}
                >
                    {/* Translatable Fields - Rendered per language */}
                    <Divider>Package Details</Divider>
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
                            updateField,
                        ) => (
                            <>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <InputField
                                            label="Package Name"
                                            name={`translates[${locale}][name]`}
                                            required
                                            onBlur={(e) =>
                                                isDefaultLanguage &&
                                                handleBlurTranslate(
                                                    e.target.value,
                                                    "name",
                                                )
                                            }
                                            value={translationData.name || ""}
                                            onChange={(e) => {
                                                updateField(
                                                    "name",
                                                    e.target.value,
                                                );
                                                setData(
                                                    "path",
                                                    useGeneratePath(
                                                        e.target.value,
                                                    ),
                                                );
                                            }}
                                            error={
                                                errors[
                                                    `translates.${locale}.name`
                                                ]
                                            }
                                            placeholder="Package Name"
                                        />
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <InputField
                                            label="Subtitle"
                                            name={`translates[${locale}][subtitle]`}
                                            onBlur={(e) =>
                                                isDefaultLanguage &&
                                                handleBlurTranslate(
                                                    e.target.value,
                                                    "subtitle",
                                                )
                                            }
                                            value={
                                                translationData.subtitle || ""
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "subtitle",
                                                    e.target.value,
                                                )
                                            }
                                            error={
                                                errors[
                                                    `translates.${locale}.subtitle`
                                                ]
                                            }
                                            placeholder="Package Subtitle"
                                        />
                                    </Col>
                                    {isDefaultLanguage && (
                                        <Col xs={24} md={12}>
                                            <InputField
                                                label={
                                                    <span>
                                                        Path{" "}
                                                        <span className="text-muted fst-italic">
                                                            (Autofill)
                                                        </span>
                                                    </span>
                                                }
                                                name="path"
                                                value={data.path || ""}
                                                placeholder="Package Path"
                                                disabled
                                            />
                                        </Col>
                                    )}
                                </Row>

                                <RichTextArea
                                    label="Description"
                                    name={`translates[${locale}][description]`}
                                    value={translationData.description || ""}
                                    onBlur={(e) =>
                                        isDefaultLanguage &&
                                        handleBlurTranslate(e, "description")
                                    }
                                    onChange={(val) =>
                                        updateField("description", val)
                                    }
                                    error={
                                        errors[
                                            `translates.${locale}.description`
                                        ]
                                    }
                                />

                                <RichTextArea
                                    label="Purpose"
                                    name={`translates[${locale}][purpose]`}
                                    value={translationData.purpose || ""}
                                    onBlur={(e) =>
                                        isDefaultLanguage &&
                                        handleBlurTranslate(e, "purpose")
                                    }
                                    onChange={(val) =>
                                        updateField("purpose", val)
                                    }
                                    error={
                                        errors[`translates.${locale}.purpose`]
                                    }
                                />
                            </>
                        )}
                    </MultiLanguageFields>
                    {/* Non-Translatable Fields - Only render once */}
                    <Divider>Package Information</Divider>
                    <Card>
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <InputField
                                    label="Reference Number"
                                    name="number"
                                    required
                                    value={data.number || ""}
                                    onChange={(e) =>
                                        setData("number", e.target.value)
                                    }
                                    error={errors.number}
                                    placeholder="e.g., 01."
                                />
                            </Col>

                            <Col xs={24} md={3}>
                                <SwitchField
                                    label={"Featured Package"}
                                    name="is_featured"
                                    checked={data.is_featured || false}
                                    onChange={(e) => setData("is_featured", e)}
                                    valueA={"Yes"}
                                    valueB={"No"}
                                />
                            </Col>

                            <Col xs={24} md={5}>
                                <InputField
                                    label="Duration (minutes)"
                                    name="duration"
                                    type="number"
                                    required
                                    value={data.duration || ""}
                                    onChange={(e) =>
                                        setData("duration", e.target.value)
                                    }
                                    error={errors.duration}
                                    placeholder="Time per minutes e.g., 60 = 1 hour"
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <InputField
                                    label="Price (€)"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData("price", e.target.value)
                                    }
                                    error={errors.price}
                                    placeholder="0.00"
                                    required
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <SelectField
                                    label="Currency"
                                    name="currency"
                                    value={data.currency}
                                    onChange={(val) =>
                                        setData("currency", val.target.value)
                                    }
                                    options={CurrencyOptions}
                                    error={errors.currency}
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <InputField
                                    label="Viva Wallet Product ID"
                                    name="viva_wallet_product_id"
                                    value={data.viva_wallet_product_id}
                                    onChange={(e) =>
                                        setData(
                                            "viva_wallet_product_id",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.viva_wallet_product_id}
                                    placeholder="Viva Wallet ID"
                                />
                            </Col>
                            {packageStatuses?.length > 0 && (
                                <Col xs={24} md={8}>
                                    <SelectField
                                        label="Package Status"
                                        name="package_status_id"
                                        value={data.package_status_id}
                                        onChange={(val) =>
                                            setData(
                                                "package_status_id",
                                                val.target.value,
                                            )
                                        }
                                        options={packageStatuses.map((s) => ({
                                            label: s.name,
                                            value: s.id,
                                        }))}
                                        error={errors.package_status_id}
                                    />
                                </Col>
                            )}
                            {packageCategories?.length > 0 && (
                                <Col xs={24} md={8}>
                                    <MultiSelectField
                                        label="Package Categories"
                                        name="package_category_ids"
                                        value={data.package_category_ids}
                                        onChange={(val) =>
                                            setData(
                                                "package_category_ids",
                                                val.target.value,
                                            )
                                        }
                                        options={packageCategories.map((c) => ({
                                            label: c.name,
                                            value: c.id,
                                        }))}
                                        error={errors.package_category_id}
                                    />
                                </Col>
                            )}
                            {packageGenders?.length > 0 && (
                                <Col xs={24} md={8}>
                                    <SelectField
                                        label="Package Gender"
                                        name="package_gender_id"
                                        value={data.package_gender_id}
                                        onChange={(val) =>
                                            setData(
                                                "package_gender_id",
                                                val.target.value,
                                            )
                                        }
                                        options={packageGenders.map((g) => ({
                                            label: g.name,
                                            value: g.id,
                                        }))}
                                        error={errors.package_gender_id}
                                    />
                                </Col>
                            )}
                            {packageAges?.length > 0 && (
                                <Col xs={24} md={8}>
                                    <SelectField
                                        label="Package Age"
                                        name="package_age_id"
                                        value={data.package_age_id}
                                        onChange={(val) =>
                                            setData(
                                                "package_age_id",
                                                val.target.value,
                                            )
                                        }
                                        options={packageAges.map((a) => ({
                                            label: a.name,
                                            value: a.id,
                                        }))}
                                        error={errors.package_age_id}
                                    />
                                </Col>
                            )}
                        </Row>
                    </Card>

                    {/* Test Categories & Media - Render once */}
                    {categoriesAttributes?.data?.length > 0 && (
                        <>
                            <Divider>Test Categories</Divider>
                            <Card>
                                <SelectField
                                    label="Test Categories"
                                    name="test_category_ids"
                                    mode="multiple"
                                    value={data.test_category_ids}
                                    onChange={(val) =>
                                        setData("test_category_ids", val)
                                    }
                                    options={categoriesAttributes?.data?.map(
                                        (cat) => ({
                                            label: cat.name,
                                            value: cat.id,
                                        }),
                                    )}
                                    error={errors.test_category_ids}
                                    placeholder="Select test categories"
                                />
                            </Card>
                        </>
                    )}

                    {stores.length > 0 && (
                        <PackageCapacityComponent
                            setData={setData}
                            value={data?.capacities}
                            stores={stores}
                            onChange={(capacities) =>
                                setData("capacities", capacities)
                            }
                        />
                    )}

                    <Divider>Media</Divider>
                    <MediaSelector
                        label="Main Image"
                        placeholder="No main image selected"
                        existingImages={images?.data}
                        setImages={(newImages) => {
                            setImage(newImages);
                            setData("main_image_id", newImages[0]?.id ?? "");
                        }}
                        images={image}
                        maxCount={1}
                    />

                    <Form.Item className="mt-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                        >
                            Save Package
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <AuditLogs data={auditLogs || []} />
        </div>
    );
}

PackagesFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
