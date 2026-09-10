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
import { Button, Card, Col, Divider, Form, Row, Checkbox, Flex } from "antd";
import React, { useEffect, useState } from "react";
import PropertyAttributesRender from "@/Components/PropertyAttributesRender";
import PropertyMap from "@/Components/PropertyMap";
import FloorPlanEditor from "@/Components/FloorPlanEditor";
import SwitchField from "@/Components/Form/SwitchField";
import { PublicStatus, PublicStatusOptions } from "@/enum/PublicStatus.enum";
import { useGeneratePath } from "@/hooks/useGeneratePath";
import AuditLogs from "@/Components/AuditLogs";
import axios from "axios";

export default function PropertiesFormPage({
    property = null,
    languages = [],
    propertyTypes = [],
    propertyStatuses = [],
    categoriesAttributes = [],
    countries = [],
    images = [],
    files = [],
    agents = [],
    communities = [],
    developers = [],
    auditLogs = [],
}: {
    property?: any;
    languages?: any;
    propertyTypes?: any;
    propertyStatuses?: any;
    categoriesAttributes?: any;
    countries?: any;
    images?: any;
    files?: any;
    agents?: any;
    communities?: any;
    developers?: any;
    auditLogs?: any;
}) {
    // If property is passed as an empty array (Laravel default for null sometimes), treat as null
    const propertyData =
        Array.isArray(property?.data) && property.data.length === 0
            ? null
            : property?.data;

    const [image, setImage] = useState(
        propertyData ? [propertyData?.main_image] : [],
    );
    const [selectedCountry, setSelectedCountry] = useState(
        propertyData?.country?.id,
    );
    const [availableCities, setAvailableCities] = useState([]);

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
        transform,
    } = useForm<any>({
        ref_number: propertyData?.ref_number || "",
        price: propertyData?.price || "",
        address: propertyData?.address || "",
        path: propertyData?.path || "",
        discount_price: propertyData?.discount_price || "",
        property_type_id: propertyData?.property_type?.id || "",
        property_status_id: propertyData?.property_status?.id || "",
        country_id: propertyData?.country?.id || "",
        city_id: propertyData?.city?.id || "",
        map: propertyData?.map || "",
        video_url: propertyData?.video_url || "",
        hidden_address: propertyData?.hidden_address || "",
        main_image_id: propertyData?.main_image?.id || "",
        gallery: propertyData?.gallery || "",
        floor_plan: (() => {
            if (!propertyData?.floor_plan) return [];
            const items = Object.values(
                (propertyData.floor_plan || []).reduce((acc: any, fb: any) => {
                    acc[fb.id] = fb;
                    return acc;
                }, {} as any),
            );

            return items.map((fp: any) => {
                const translates =
                    fp.translate || fp.translates || fp.translations || [];
                const hasEn = translates.some((t) => t.locale === "en");
                const normalized = [...translates];
                if (!hasEn) {
                    normalized.unshift({ locale: "en", name: fp.name || "" });
                }
                return {
                    ...fp,
                    translates: normalized,
                };
            });
        })(),
        public_status: propertyData?.public_status || PublicStatus.PUBLIC,
        is_featured: propertyData?.is_featured || false,
        exclusive: propertyData?.exclusive || false,
        agent_id: propertyData?.agent?.id || "",
        developer_id: propertyData?.developer?.id || "",
        attributes:
            propertyData?.attributes?.reduce((acc, attr) => {
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
        translates: propertyData?.translates
            ? Object.values(
                  (propertyData?.translates || []).reduce(
                      (acc, t) => {
                          acc[t.locale] = t;
                          return acc;
                      },
                      {
                          en: {
                              locale: "en",
                              name: propertyData?.name || "",
                              description: propertyData?.description || "",
                              address: propertyData?.address || "",
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
                                  description: "",
                                  address: "",
                              };
                          }
                          return acc;
                      },
                      {
                          en: {
                              locale: "en",
                              name: propertyData?.name || "",
                              description: propertyData?.description || "",
                              address: propertyData?.address || "",
                          },
                      },
                  ),
              ),
    });

    const normalizeFileId = (f: any) => {
        if (!f) return "";
        if (Array.isArray(f)) {
            const first = f[0];
            return (first && (first.id ?? first)) ?? "";
        }
        if (typeof f === "object") return f.id ?? "";
        return f;
    };

    transform((data: any) => ({
        ...data,
        gallery: data.gallery ? data.gallery.map((img: any) => img.id) : [],
        attributes: Object.entries(data.attributes || {}).reduce(
            (acc: any, [key, value]) => {
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
        floor_plan: data.floor_plan
            ? data.floor_plan.map((fp: any) => ({
                  id: fp?.id ?? null,
                  files: normalizeFileId(fp?.files) || null,
                  name: fp?.name || "",
                  translate:
                      fp?.translate || fp?.translates || fp?.translations || [],
              }))
            : [],
        translates: Object.values(data.translates || {}),
    }));

    const handleBlurTranslate = async (text: any, fieldName: any) => {
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
                    setData((prev: any) => ({
                        ...prev,
                        translates: (prev.translates || []).map((t: any) => {
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

    useEffect(() => {
        if (selectedCountry) {
            const country = countries.data.find(
                (c) => c.id === selectedCountry,
            );
            setAvailableCities(country?.cities || []);
        } else {
            setAvailableCities([]);
        }
    }, [selectedCountry, countries]);

    const handleSubmit = () => {
        if (propertyData) {
            put(route("properties.update", propertyData.id));
        } else {
            submitPost(route("properties.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={propertyData ? "Update Package" : "Create Package"}
                backAction={RouteList.properties()}
                backName={"View Properties"}
            />
            <Card>
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={data}
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
                            updateField,
                        ) => (
                            <>
                                <Divider>Package Details</Divider>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <InputField
                                            label="Name"
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
                                        {isDefaultLanguage && (
                                            <SelectField
                                                label="Address"
                                                name={`address`}
                                                options={communities?.data?.map(
                                                    (c) => ({
                                                        value: c.key,
                                                        label: c.name,
                                                    }),
                                                )}
                                                value={data.address || ""}
                                                onChange={(e) =>
                                                    setData(
                                                        "address",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors[`address`]}
                                                placeholder="Package Address"
                                            />
                                        )}
                                    </Col>
                                    <Col xs={24} md={12}>
                                        {isDefaultLanguage && (
                                            <InputField
                                                label={
                                                    <span>
                                                        Path{" "}
                                                        <span className="text-gray-500 italic">
                                                            (Autofill)
                                                        </span>
                                                    </span>
                                                }
                                                name="path"
                                                value={data.path || ""}
                                                placeholder="Package Path"
                                                disabled
                                            />
                                        )}
                                    </Col>
                                    <Col
                                        xs={24}
                                        md={12}
                                        className="flex items-center justify-between"
                                    >
                                        {isDefaultLanguage && (
                                            <>
                                                <SelectField
                                                    className="w-1/2"
                                                    label="Public Status"
                                                    name="public_status"
                                                    value={
                                                        data.public_status ||
                                                        PublicStatus.PUBLIC
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "public_status",
                                                            e.target.value,
                                                        )
                                                    }
                                                    options={
                                                        PublicStatusOptions
                                                    }
                                                />
                                                <SwitchField
                                                    label={"Featured Package"}
                                                    name="is_featured"
                                                    value={
                                                        data.is_featured ||
                                                        false
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "is_featured",
                                                            e,
                                                        )
                                                    }
                                                />
                                                <SwitchField
                                                    label={"Exclusive Package"}
                                                    name="exclusive"
                                                    value={
                                                        data.exclusive || false
                                                    }
                                                    onChange={(e) =>
                                                        setData("exclusive", e)
                                                    }
                                                />
                                            </>
                                        )}
                                    </Col>
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

                                {isDefaultLanguage && (
                                    <>
                                        <Divider>General Information</Divider>
                                        <Row gutter={16}>
                                            <Col xs={24} md={8}>
                                                <InputField
                                                    label="Price"
                                                    name="price"
                                                    type="number"
                                                    value={data.price}
                                                    onChange={(e) =>
                                                        setData(
                                                            "price",
                                                            e.target.value,
                                                        )
                                                    }
                                                    error={errors.price}
                                                    placeholder="0.00"
                                                />
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <InputField
                                                    label="Discount Price"
                                                    name="discount_price"
                                                    type="number"
                                                    value={data.discount_price}
                                                    onChange={(e) =>
                                                        setData(
                                                            "discount_price",
                                                            e.target.value,
                                                        )
                                                    }
                                                    error={
                                                        errors.discount_price
                                                    }
                                                    placeholder="0.00"
                                                />
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <SelectField
                                                    label="Package Type"
                                                    name="property_type_id"
                                                    value={
                                                        data.property_type_id
                                                    }
                                                    onChange={(val) =>
                                                        setData(
                                                            "property_type_id",
                                                            val.target.value,
                                                        )
                                                    }
                                                    options={propertyTypes.map(
                                                        (t) => ({
                                                            label: t.name,
                                                            value: t.id,
                                                        }),
                                                    )}
                                                    error={
                                                        errors.property_type_id
                                                    }
                                                />
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <SelectField
                                                    label="Package Status"
                                                    name="property_status_id"
                                                    value={
                                                        data.property_status_id
                                                    }
                                                    onChange={(val) =>
                                                        setData(
                                                            "property_status_id",
                                                            val.target.value,
                                                        )
                                                    }
                                                    options={propertyStatuses.map(
                                                        (s) => ({
                                                            label: s.name,
                                                            value: s.id,
                                                        }),
                                                    )}
                                                    error={
                                                        errors.property_status_id
                                                    }
                                                />
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <SelectField
                                                    label="Agent"
                                                    name="agent_id"
                                                    value={data.agent_id}
                                                    showSearch
                                                    onChange={(val) =>
                                                        setData(
                                                            "agent_id",
                                                            val.target.value,
                                                        )
                                                    }
                                                    options={agents?.map(
                                                        (s) => ({
                                                            label: s.name,
                                                            value: s.id,
                                                        }),
                                                    )}
                                                    error={errors.agent_id}
                                                />
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <SelectField
                                                    label="Developer"
                                                    name="developer_id"
                                                    value={data.developer_id}
                                                    showSearch
                                                    onChange={(val) =>
                                                        setData(
                                                            "developer_id",
                                                            val.target.value,
                                                        )
                                                    }
                                                    options={developers?.data?.map(
                                                        (s) => ({
                                                            label: `${s.name} - ${s.company}`,
                                                            value: s.id,
                                                        }),
                                                    )}
                                                    error={errors.developer_id}
                                                />
                                            </Col>
                                        </Row>

                                        <Divider>Location</Divider>
                                        <Row gutter={16}>
                                            <Col xs={24} md={8}>
                                                <SelectField
                                                    label="Country"
                                                    name="country_id"
                                                    value={data.country_id}
                                                    onChange={(val) => {
                                                        setData(
                                                            "country_id",
                                                            val.target.value,
                                                        );
                                                        setSelectedCountry(
                                                            val.target.value,
                                                        );
                                                        setData("city_id", ""); // Reset city
                                                    }}
                                                    options={countries.data.map(
                                                        (c) => ({
                                                            label: c.name,
                                                            value: c.id,
                                                        }),
                                                    )}
                                                    error={errors.country_id}
                                                />
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <SelectField
                                                    label="City"
                                                    name="city_id"
                                                    value={data.city_id}
                                                    onChange={(val) =>
                                                        setData(
                                                            "city_id",
                                                            val.target.value,
                                                        )
                                                    }
                                                    options={availableCities.map(
                                                        (c) => ({
                                                            label: c.name,
                                                            value: c.id,
                                                        }),
                                                    )}
                                                    disabled={!selectedCountry}
                                                    error={errors.city_id}
                                                />
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <InputField
                                                    label={
                                                        <span>
                                                            Hidden Address{" "}
                                                            <span className="text-gray-500 italic">
                                                                (for agents)
                                                            </span>
                                                        </span>
                                                    }
                                                    name="hidden_address"
                                                    value={data.hidden_address}
                                                    onChange={(e) =>
                                                        setData(
                                                            "hidden_address",
                                                            e.target.value,
                                                        )
                                                    }
                                                    error={
                                                        errors.hidden_address
                                                    }
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col xs={24}>
                                                {data?.translates.length >
                                                    0 && (
                                                    <PropertyMap
                                                        positionLocation={
                                                            data.map
                                                        }
                                                        address={
                                                            data.address || ""
                                                        }
                                                        city={
                                                            availableCities.find(
                                                                (c) =>
                                                                    c.id ===
                                                                    data.city_id,
                                                            )?.name || ""
                                                        }
                                                        country={
                                                            countries.data.find(
                                                                (c) =>
                                                                    c.id ===
                                                                    data.country_id,
                                                            )?.name || ""
                                                        }
                                                        onLocationSelect={({
                                                            lat,
                                                            lng,
                                                         }) => {
                                                            setData((prev) => ({
                                                                ...prev,
                                                                map: `[${lat}, ${lng}]`,
                                                            }));
                                                        }}
                                                    />
                                                )}
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col xs={24}>
                                                <InputField
                                                    label={
                                                        <span>
                                                            Map{" "}
                                                            <span className="text-gray-500 italic">
                                                                (Autofill)
                                                            </span>
                                                        </span>
                                                    }
                                                    name="map"
                                                    disabled
                                                    value={data.map}
                                                    onChange={(e) =>
                                                        setData(
                                                            "map",
                                                            e.target.value,
                                                        )
                                                    }
                                                    error={errors.map}
                                                    placeholder='<iframe src="..."></iframe> or [lat, lng]'
                                                />
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col xs={24}>
                                                <InputField
                                                    label="Video URL"
                                                    name="video_url"
                                                    value={data.video_url}
                                                    onChange={(e) =>
                                                        setData(
                                                            "video_url",
                                                            e.target.value,
                                                        )
                                                    }
                                                    error={errors.video_url}
                                                    placeholder="https://youtube.com/..."
                                                />
                                            </Col>
                                        </Row>

                                        <Divider>Media</Divider>
                                        <MediaSelector
                                            label="Main Image"
                                            placeholder="No main image selected"
                                            existingImages={images?.data}
                                            setImages={(newImages) => {
                                                setImage(newImages);
                                                setData(
                                                    "main_image_id",
                                                    newImages[0]?.id ?? "",
                                                );
                                            }}
                                            images={image}
                                            maxCount={1}
                                        />
                                        <MediaSelector
                                            label="Gallery"
                                            placeholder="No images selected"
                                            existingImages={images?.data}
                                            setImages={(newImages) => {
                                                setData(
                                                    "gallery",
                                                    newImages ?? "",
                                                );
                                            }}
                                            images={data?.gallery}
                                            maxCount={6}
                                        />
                                        <FloorPlanEditor
                                            existingFiles={[
                                                ...files?.data,
                                                ...images?.data,
                                            ]}
                                            languages={languages}
                                            value={data.floor_plan}
                                            setData={setData}
                                            onChange={(val) =>
                                                setData("floor_plan", val)
                                            }
                                            accept="application/pdf,image/*"
                                        />

                                        <Divider>Attributes</Divider>
                                        <PropertyAttributesRender
                                            categoriesAttributes={
                                                categoriesAttributes?.data
                                            }
                                            files={{
                                                files: files?.data,
                                                images: images?.data,
                                            }}
                                            values={data.attributes}
                                            onChange={(id, value) =>
                                                setData("attributes", {
                                                    ...data.attributes,
                                                    [id]: value,
                                                })
                                            }
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </MultiLanguageFields>

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

PropertiesFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
