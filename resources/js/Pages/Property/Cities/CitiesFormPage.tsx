import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import React, { useEffect, useState } from "react";
import NotificationMessage from "@/Components/NotificationMessage";
import { Button, Form } from "antd";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import InputField from "@/Components/Form/InputField";
import { useForm } from "@inertiajs/react";
import SelectField from "@/Components/Form/SelectField";
import TagsSelectField from "@/Components/Form/TagsSelectField";

export default function CitiesFormPage({
    city,
    countries = [],
    languages = [],
}: {
    city?: any;
    countries?: any;
    languages?: any;
}) {
    const [showMessage, setShowMessage] = useState(false);
    const [cityData, setCityData] = useState<any>(city?.data ?? {});
    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm<any>({
        key: cityData?.key || "",
        name: cityData?.name || "",
        country_id: cityData?.country?.key ? [cityData.country.key] : [],
        translates: cityData
            ? {
                  ...cityData.translates,
                  en: {
                      locale: "en",
                      name: cityData.name || "",
                  },
              }
            : {},
    });
    useEffect(() => {
        if (city?.data) {
            setCityData(city?.data);
        }
    }, [city]);

    useEffect(() => {
        if (countries.length === 0 && !data.country_id) {
            setShowMessage(true);
        } else {
            setShowMessage(false);
        }
    }, [countries]);

    const handleSubmit = () => {
        if (cityData.id) {
            put(
                route("cities.update", {
                    city: cityData.id,
                }),
            );
        } else {
            submitPost(route("cities.store"));
        }
    };

    return (
        <div>
            <NotificationMessage
                showMessage={showMessage}
                message="Countries not found."
                description="Please visit the country page for create your first country or from here."
                type="info"
                duration={0}
                onClose={() => setShowMessage(false)}
            />
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={city ? "Update City" : "Create City"}
                backAction={RouteList.cities()}
                backName={"View Cities"}
            />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    name: data?.translates?.en?.name,
                    key: data?.key,
                    translates: data?.translates,
                }}
            >
                <MultiLanguageFields
                    languages={languages}
                    value={data?.translates}
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
                                label="City Name"
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
                                placeholder="City name"
                            />
                            {isDefaultLanguage && (
                                <TagsSelectField
                                    label="Country"
                                    required
                                    options={countries.map((country) => ({
                                        value: country.key,
                                        label: country.name,
                                    }))}
                                    value={data.country_id}
                                    onChange={(value) =>
                                        setData("country_id", value)
                                    }
                                    error={errors.country_id}
                                />
                            )}
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

CitiesFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
