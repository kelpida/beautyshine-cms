import React, { useEffect, useState } from "react";
import PopupFormMessage from "@/Components/PopupFormMessage";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { RouteList } from "@/routes/RouteList";
import { useForm } from "@inertiajs/react";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import { Button, Form } from "antd";
import InputField from "@/Components/Form/InputField";
import AdminLayout from "@/Layouts/AdminLayout";
import TagsSelectField from "@/Components/Form/TagsSelectField";
import SelectField from "@/Components/Form/SelectField";
import cyprusGeo from "@/assets/geo/cyprus-community.json";
import greeceGeo from "@/assets/geo/greece-community.json";

export default function CommunityFormPage({
    countries = {},
    cities = {},
    community = {},
    languages = [],
}) {
    const [communityData, setCommunityData] = useState(community?.data ?? null);

    const [geo, setGeo] = useState([]);

    useEffect(() => {
        setCommunityData(community?.data);
    }, [community]);

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm({
        key: communityData?.key || "",
        name: communityData?.name || "",
        country_id: communityData?.country?.id || "",
        city_id: communityData?.city?.id || "",
        shape_id: communityData?.shape_id || "",
        order_id: communityData?.order_id || "",
        translates: communityData
            ? {
                  ...communityData.translates,
                  en: {
                      locale: "en",
                      name: communityData.name || "",
                  },
              }
            : {},
    });

    useEffect(() => {
        if (!communityData) return;
        handleCountryChange(communityData.country?.id);
    }, [communityData]);

    const handleCountryChange = (countryId) => {
        const country = countries.find((country) => country.id === countryId);
        if (country.key == "cyprus") {
            setGeo(cyprusGeo.features);
        } else if (country.key == "greece") {
            setGeo(greeceGeo.features);
        }
    };

    const handleShapeChange = (shapeName) => {
        const shape = geo.find((shape) => {
            return shape.properties.shapeName === shapeName;
        });
        setData("shape_id", shape.properties.shapeID);
    };

    const handleSubmit = () => {
        if (communityData) {
            put(
                route("communities.update", {
                    community: communityData.id,
                })
            );
        } else {
            submitPost(route("communities.store"));
        }
    };
    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={communityData ? "Update Community" : "Create Community"}
                backAction={RouteList.communities()}
                backName={"View Communities"}
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
                            {isDefaultLanguage && (
                                <>
                                    <SelectField
                                        name="country_id"
                                        label="Country"
                                        options={countries.map((country) => ({
                                            value: country.id,
                                            label: country.name,
                                        }))}
                                        value={data.country_id}
                                        onChange={(value) => {
                                            setData(
                                                "country_id",
                                                value.target.value
                                            );
                                            handleCountryChange(
                                                value.target.value
                                            );
                                        }}
                                    />
                                    <SelectField
                                        name="city_id"
                                        label="City"
                                        options={cities.map((city) => ({
                                            value: city.id,
                                            label: city.name,
                                        }))}
                                        value={data.city_id}
                                        onChange={(value) => {
                                            setData(
                                                "city_id",
                                                value.target.value
                                            );
                                        }}
                                    />
                                    {geo?.length > 0 && (
                                        <SelectField
                                            name={`translates[${locale}][name]`}
                                            label="Community Name"
                                            showSearch
                                            value={translationData.name || ""}
                                            options={geo?.map((feature) => ({
                                                value: feature.properties
                                                    .shapeName,
                                                label: feature.properties
                                                    .shapeName,
                                            }))}
                                            onChange={(name) => {
                                                updateField(
                                                    "name",
                                                    name.target.value
                                                );

                                                const key = name.target.value
                                                    .toLowerCase()
                                                    .trim()
                                                    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with "-"
                                                    .replace(/^-+|-+$/g, "-"); // remove leading/trailing dashes
                                                setData("key", key);
                                                handleShapeChange(
                                                    name.target.value
                                                );
                                            }}
                                        />
                                    )}
                                </>
                            )}
                            {!isDefaultLanguage && (
                                <InputField
                                    name={`translates[${locale}][name]`}
                                    label="Community Name"
                                    value={translationData.name || ""}
                                    onChange={(e) => {
                                        const name = e.target.value;

                                        // Update the name field
                                        updateField("name", name);

                                        // Auto-generate key only for default language
                                    }}
                                    error={errors[`translates.${locale}.name`]}
                                    placeholder="Community name"
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

CommunityFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
