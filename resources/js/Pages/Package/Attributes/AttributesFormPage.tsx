import React, { useEffect, useState } from "react";
import PopupFormMessage from "@/Components/PopupFormMessage";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { RouteList } from "@/routes/RouteList";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button, Form, Card, Space, Divider, Grid, Row, Col, Flex } from "antd";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import InputField from "@/Components/Form/InputField";
import { useForm } from "@inertiajs/react";
import {
    FormatTypeArray,
    InputType,
    InputTypeArray,
} from "@/enum/InputType.enum";
import {
    PlusOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import SelectField from "@/Components/Form/SelectField";
import IconPickerModal from "@/Components/IconPickerModal";
import * as FaIcons from "react-icons/fa";
import SwitchField from "@/Components/Form/SwitchField";

export default function AttributesFormPage({
    attribute,
    languages = [],
    attributeCategories = [],
}: {
    attribute?: any;
    languages?: any;
    attributeCategories?: any;
}) {
    const [attributeData, setAttributeData] = useState(attribute?.data ?? null);
    const [showOptions, setShowOptions] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [showFormat, setShowFormat] = useState({ show: false, format: [] });

    useEffect(() => {
        const data = attribute?.data;
        setAttributeData(data);
        if (data?.type === InputType.SELECT || data?.type === InputType.RADIO) {
            setShowOptions(true);
        }
        if (data?.type === InputType.UPLOAD || data?.type === InputType.RANGE) {
            setShowFormat({ show: true, format: FormatTypeArray[data.type] });
        }
    }, [attribute]);

    // Helper to transform backend options to form structure
    const getInitialOptions = (data: any) => {
        if (!data?.options) return [];
        return data.options.map((opt: any) => {
            const translations: any = {};
            (languages || []).forEach((lang: any) => {
                const trans = (opt.translates || []).find(
                    (t: any) => t.locale === lang.code
                );
                translations[lang.code] = {
                    locale: lang.code,
                    name: trans ? trans.name : "",
                };
            });
            return {
                id: opt.id,
                translates: translations,
            };
        });
    };

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm<any>({
        key: attributeData?.key || "",
        type: attributeData?.type || InputType.TEXT,
        format: attributeData?.format || "",
        icon: attributeData?.icon || "",
        is_featured: attributeData?.is_featured || false,
        is_required: attributeData?.is_required || false,
        attribute_category_id: attributeData?.attribute_category?.id || null,
        translates: attributeData
            ? {
                  ...attributeData.translates,
                  en: {
                      locale: "en",
                      name: attributeData.name || "",
                  },
              }
            : {},
        options: getInitialOptions(attributeData),
    });
    const handleSubmit = () => {
        if (attributeData) {
            put(
                route("attributes.update", {
                    attribute: attributeData.id,
                })
            );
        } else {
            submitPost(route("attributes.store"));
        }
    };

    const handleTypeChange = (value) => {
        setData("type", value.target.value);
        setShowOptions(
            value.target.value === InputType.SELECT ||
                value.target.value === InputType.RADIO
        );

        setShowFormat({
            show:
                value.target.value === InputType.UPLOAD ||
                value.target.value === InputType.RANGE,
            format: FormatTypeArray[value.target.value],
        });
        setData("format", "");
        if (value.target.value === InputType.CHECKBOX) {
            setData("format", "boolean");
        }
    };

    const addOption = () => {
        const newOption = {
            id: null, // New option
            translates: {},
        };
        // Initialize empty translates for all languages
        languages.forEach((lang) => {
            newOption.translates[lang.code] = {
                locale: lang.code,
                value: "",
                label: "",
            };
        });
        setData("options", [...(data.options || []), newOption]);
    };

    const removeOption = (index) => {
        const newOptions = [...data.options];
        newOptions.splice(index, 1);
        setData("options", newOptions);
    };

    const generateLabelFromValue = (value) => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const updateOptionField = (index, locale, field, value) => {
        const newOptions = [...data.options];
        if (!newOptions[index].translates[locale]) {
            newOptions[index].translates[locale] = { locale };
        }
        newOptions[index].translates[locale][field] = value;

        // Auto-generate label from value when in default language
        if (field === "label" && locale === "en") {
            newOptions[index].translates[locale]["value"] =
                generateLabelFromValue(value);
        }

        setData("options", newOptions);
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <IconPickerModal
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                onSelect={(iconName) => setData("icon", iconName)}
                currentIcon={data.icon}
            />
            <PageHeaderActions
                title={attributeData ? "Update Test" : "Create Test"}
                backAction={RouteList.packageAttributes()}
                backName={"View Tests"}
            />
            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    type: data.type,
                    icon: data.icon,
                    is_featured: data.is_featured,
                    is_required: data.is_required,
                    key: data.key,
                    attribute_category_id: data.attribute_category_id,
                }}
            >
                <Card title="General Information" className="mb-4">
                    <SelectField
                        name="attribute_category_id"
                        value={data.attribute_category_id}
                        label="Attribute Category"
                        onChange={(val) =>
                            setData("attribute_category_id", val.target.value)
                        }
                        placeholder="Select Category"
                        options={attributeCategories.data.map((cat) => ({
                            label: cat.name,
                            value: cat.id,
                        }))}
                    />
                    <SelectField
                        name="type"
                        label="Type"
                        value={data.type}
                        onChange={(e) => handleTypeChange(e)}
                        options={InputTypeArray}
                        placeholder="Select Type"
                    />
                    {showFormat.show && (
                        <SelectField
                            name="format"
                            label="Format"
                            value={data.format}
                            onChange={(e) => setData("format", e.target.value)}
                            options={showFormat.format}
                            placeholder="Select Format"
                        />
                    )}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Flex align="center" style={{ gap: "10px" }}>
                                <InputField
                                    label={"Icon"}
                                    name="icon"
                                    value={data.icon}
                                    onChange={(e) =>
                                        setData("icon", e.target.value)
                                    }
                                    placeholder="Select an icon..."
                                    disabled
                                />
                                <Button
                                    icon={<SearchOutlined />}
                                    className="mt-2"
                                    onClick={() => setIsIconPickerOpen(true)}
                                >
                                    Select
                                </Button>
                                {data.icon && FaIcons[data.icon] && (
                                    <div
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                        }}
                                    >
                                        {React.createElement(
                                            FaIcons[data.icon],
                                            { size: 20 }
                                        )}
                                    </div>
                                )}
                            </Flex>
                        </Col>
                        <Col
                            span={12}
                            className="flex justify-center items-center gap-5"
                        >
                            <SwitchField
                                name="is_featured"
                                label="Featured"
                                value={data.is_featured}
                                onChange={(e) => setData("is_featured", e)}
                            />
                            <SwitchField
                                name="is_required"
                                label="Required"
                                value={data.is_required}
                                onChange={(e) => setData("is_required", e)}
                            />
                        </Col>
                    </Row>

                    <InputField
                        name="key"
                        disabled
                        label="Key (Unique Identifier)"
                        value={data.key}
                        error={errors.key}
                        placeholder="Auto-generated from English name"
                    />
                </Card>

                <MultiLanguageFields
                    languages={languages}
                    value={data.translates}
                    onChange={(translates) => setData("translates", translates)}
                >
                    {(
                        locale,
                        isDefaultLanguage,
                        translationData,
                        updateField
                    ) => (
                        <>
                            <Card
                                title={`Translation (${locale.toUpperCase()})`}
                                className="mb-4"
                            >
                                <InputField
                                    name={`translates[${locale}][name]`}
                                    label="Attribute Name"
                                    value={translationData.name || ""}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        updateField("name", name);
                                        if (isDefaultLanguage) {
                                            const key = name
                                                .toLowerCase()
                                                .trim()
                                                .replace(/[^a-z0-9]+/g, "-")
                                                .replace(/^-+|-+$/g, "-");
                                            setData((prev) => ({
                                                ...prev,
                                                key: key,
                                                translates: {
                                                    ...prev.translates,
                                                    [locale]: {
                                                        ...prev.translates[
                                                            locale
                                                        ],
                                                        name: name,
                                                    },
                                                },
                                            }));
                                        }
                                    }}
                                    error={errors[`translates.${locale}.name`]}
                                    placeholder="Attribute Name"
                                />

                                {showOptions && (
                                    <div className="mt-4">
                                        <Divider orientation={"left" as any}>
                                            Options
                                        </Divider>
                                        {(data.options || []).map(
                                            (option, index) => (
                                                <div
                                                    key={index}
                                                    className="flex gap-4 items-start mb-2 border p-2 rounded bg-gray-50"
                                                >
                                                    <div className="flex-1">
                                                        <InputField
                                                            label={`Option Label (${locale})`}
                                                            value={
                                                                option
                                                                    .translates?.[
                                                                    locale
                                                                ]?.label || ""
                                                            }
                                                            onChange={(e) =>
                                                                updateOptionField(
                                                                    index,
                                                                    locale,
                                                                    "label",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Option Value"
                                                            error={
                                                                errors[
                                                                    `options.${index}.translates.${locale}.label`
                                                                ]
                                                            }
                                                        />
                                                    </div>
                                                    {isDefaultLanguage && (
                                                        <Button
                                                            danger
                                                            icon={
                                                                <DeleteOutlined />
                                                            }
                                                            onClick={() =>
                                                                removeOption(
                                                                    index
                                                                )
                                                            }
                                                            className="mt-8"
                                                        />
                                                    )}
                                                </div>
                                            )
                                        )}
                                        {isDefaultLanguage && (
                                            <Button
                                                type="dashed"
                                                onClick={addOption}
                                                icon={<PlusOutlined />}
                                                block
                                                className="mt-2"
                                            >
                                                Add Option
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </>
                    )}
                </MultiLanguageFields>

                <Form.Item className="mt-4">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={processing}
                        size="large"
                    >
                        Save Attribute
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

AttributesFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
