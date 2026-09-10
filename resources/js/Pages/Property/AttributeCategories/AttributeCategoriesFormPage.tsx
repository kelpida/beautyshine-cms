import React, { useEffect, useState } from "react";
import PopupFormMessage from "@/Components/PopupFormMessage";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { RouteList } from "@/routes/RouteList";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button, Form } from "antd";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import InputField from "@/Components/Form/InputField";
import { useForm } from "@inertiajs/react";

export default function AttributeCategoriesFormPage({
    attributeCategory,
    languages = [],
}: {
    attributeCategory?: any;
    languages?: any;
}) {
    console.log(
        "🚀 ~ AttributeCategoriesFormPage ~ attributeCategory:",
        attributeCategory
    );
    const [attributeCategoryData, setAttributeCategoryData] = useState(
        attributeCategory?.data ?? null
    );

    useEffect(() => {
        setAttributeCategoryData(attributeCategory?.data);
    }, [attributeCategory]);

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm<any>({
        key: attributeCategoryData?.key || "",
        name: attributeCategoryData?.name || "",
        translates: attributeCategoryData
            ? {
                  ...attributeCategoryData.translates,
                  en: {
                      locale: "en",
                      name: attributeCategoryData.name || "",
                  },
              }
            : {},
    });

    const handleSubmit = () => {
        if (attributeCategoryData) {
            put(
                route("attribute-categories.update", {
                    attribute_category: attributeCategoryData.id,
                })
            );
        } else {
            submitPost(route("attribute-categories.store"));
        }
    };
    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={
                    attributeCategoryData
                        ? "Update Attribute Category"
                        : "Create Attribute Category"
                }
                backAction={RouteList.propertyAttributeCategories()}
                backName={"View Attribute Categories"}
            />
            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    name: data.translates?.en?.name,
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
                                label="Attribute Category Name"
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

AttributeCategoriesFormPage.layout = (page) => (
    <AdminLayout>{page}</AdminLayout>
);
