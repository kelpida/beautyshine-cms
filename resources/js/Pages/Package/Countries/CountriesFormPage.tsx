import React, { useEffect, useState } from "react";
import PopupFormMessage from "@/Components/PopupFormMessage";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { RouteList } from "@/routes/RouteList";
import { useForm } from "@inertiajs/react";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import { Button, Form } from "antd";
import InputField from "@/Components/Form/InputField";
import AdminLayout from "@/Layouts/AdminLayout";

export default function CountriesFormPage({
    country,
    languages = [],
}: {
    country?: any;
    languages?: any;
}) {
    const [countryData, setCountryData] = useState(country?.data ?? null);

    useEffect(() => {
        setCountryData(country?.data);
    }, [country]);

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm<any>({
        key: countryData?.key || "",
        name: countryData?.name || "",
        translates: countryData
            ? {
                  ...countryData.translates,
                  en: {
                      locale: "en",
                      name: countryData.name || "",
                  },
              }
            : {},
    });

    const handleSubmit = () => {
        if (countryData) {
            put(
                route("countries.update", {
                    country: countryData.id,
                })
            );
        } else {
            submitPost(route("countries.store"));
        }
    };
    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={countryData ? "Update Country" : "Create Country"}
                backAction={RouteList.countries()}
                backName={"View Countries"}
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
                                label="Country Name"
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

CountriesFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
