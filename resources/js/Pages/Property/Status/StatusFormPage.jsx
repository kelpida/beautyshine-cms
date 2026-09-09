import React, { useEffect, useState } from "react";
import PopupFormMessage from "@/Components/PopupFormMessage";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { RouteList } from "@/routes/RouteList";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm } from "@inertiajs/react";
import { Button, Form } from "antd";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import InputField from "@/Components/Form/InputField";

export default function StatusFormPage({
    propertyStatus = null,
    languages = [],
}) {
    const [statusData, setStatusData] = useState(propertyStatus?.data ?? null);

    useEffect(() => {
        setStatusData(propertyStatus?.data);
    }, [propertyStatus]);

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm({
        key: statusData?.key || "",
        translates: statusData
            ? {
                  ...statusData.translates,
                  en: {
                      locale: "en",
                      name: statusData.name || "",
                  },
              }
            : {},
    });

    const handleSubmit = () => {
        if (statusData) {
            put(
                route("statuses.update", {
                    status: statusData.id,
                })
            );
        } else {
            submitPost(route("statuses.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={statusData ? "Update Status" : "Create Status"}
                backAction={RouteList.propertyStatuses()}
                backName={"View Statuses"}
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

StatusFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
