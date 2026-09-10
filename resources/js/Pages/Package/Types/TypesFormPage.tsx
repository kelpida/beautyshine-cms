import React, { useEffect, useState } from "react";
import PopupFormMessage from "@/Components/PopupFormMessage";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { RouteList } from "@/routes/RouteList";
import AdminLayout from "@/Layouts/AdminLayout";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import { useForm } from "@inertiajs/react";
import { Button, Divider, Form } from "antd";
import InputField from "@/Components/Form/InputField";

export default function TypesFormPage({
    propertyType = null,
    languages = [],
}: {
    propertyType?: any;
    languages?: any;
}) {
    const [propertyTypeData, setPropertyTypeData] = useState(
        propertyType?.data ?? null
    );

    useEffect(() => {
        setPropertyTypeData(propertyType?.data);
    }, [propertyType]);

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm<any>({
        key: propertyTypeData?.key || "",
        translates: propertyTypeData
            ? {
                  ...propertyTypeData.translates,
                  en: {
                      locale: "en",
                      name: propertyTypeData.name || "",
                  },
              }
            : {},
    });

    const handleSubmit = () => {
        if (propertyType) {
            put(route("types.update", propertyTypeData.id));
        } else {
            submitPost(route("types.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={propertyType?.data ? "Update Type" : "Create Type"}
                backAction={RouteList.propertyTypes()}
                backName={"View Types"}
            />
            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    name: data.name,
                    key: data.key,
                    translates: data.translates,
                }}
            >
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
                            <InputField
                                name={`translates[${locale}][name]`}
                                label="Name"
                                value={translationData.name || ""}
                                onChange={(e) => {
                                    const name = e.target.value;

                                    // Update the name field
                                    updateField("name", name);

                                    // Auto-generate key only for default language
                                    if (isDefaultLanguage) {
                                        const key = name
                                            .toLowerCase()
                                            .trim()
                                            .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with "-"
                                            .replace(/^-+|-+$/g, "-"); // remove leading/trailing dashes
                                        setData("key", key);
                                    }
                                }}
                                error={errors[`translates.${locale}.name`]}
                                placeholder="Type name"
                            />
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
        </div>
    );
}

TypesFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
