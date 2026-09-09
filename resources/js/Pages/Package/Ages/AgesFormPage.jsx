import React, { useEffect, useState } from "react";
import PopupFormMessage from "@/Components/PopupFormMessage";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { RouteList } from "@/routes/RouteList";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm } from "@inertiajs/react";
import { Button, Form } from "antd";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import InputField from "@/Components/Form/InputField";

export default function AgesFormPage({ packageAge = null, languages = [] }) {
    const [ageData, setAgeData] = useState(packageAge?.data ?? null);

    useEffect(() => {
        setAgeData(packageAge?.data);
    }, [packageAge]);

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm({
        key: ageData?.key || "",
        translates: ageData
            ? {
                  ...ageData.translates,
                  en: {
                      locale: "en",
                      name: ageData.name || "",
                  },
              }
            : {},
    });

    const handleSubmit = () => {
        if (ageData) {
            put(
                route("package-ages.update", {
                    age: ageData.id,
                }),
            );
        } else {
            submitPost(route("package-ages.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={ageData ? "Update Package Age" : "Create Package Age"}
                backAction={RouteList.packageAges()}
                backName={"View Ages"}
            />
            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
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
                        updateField,
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
                                            .replace(/[^a-z0-9]+/g, "-")
                                            .replace(/^-+|-+$/g, "-");
                                        setData("key", key);
                                    }
                                }}
                                error={errors[`translates.${locale}.name`]}
                                placeholder="Type name"
                            />
                        </>
                    )}
                </MultiLanguageFields>
                <InputField
                    label="Key (Auto-generated)"
                    name="key"
                    value={data.key}
                    disabled
                    placeholder="Auto-generated from name"
                />
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

AgesFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
