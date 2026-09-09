import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";

import { Button, Form, message, Row, Col, Divider, Card, Tabs } from "antd";
import { useForm } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import InputField from "@/Components/Form/InputField";
import { RouteList } from "@/routes/RouteList";
import CheckboxField from "@/Components/Form/CheckboxField";
import PopupFormMessage from "@/Components/PopupFormMessage";
import SelectField from "@/Components/Form/SelectField";
import { ScopeTypeOptions } from "@/enum/ScopeType.enum";
import { CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGeneratePath } from "@/hooks/useGeneratePath";
import RichTextArea from "@/Components/Form/RichTextArea";
import SwitchField from "@/Components/Form/SwitchField";
import { DateOptions } from "@/enum/DateLabel.enum";
import TimePickerField from "@/Components/Form/TimePickerField";

export default function RolesFormPage({ store = null, workHours = [], translations = [] }) {
    const ADDRESS_LOCALES = [
        { code: "en", label: "English" },
        { code: "el", label: "Greek" },
        { code: "ru", label: "Russian" },
        { code: "de", label: "German" },
    ];

    const initialTranslations = ADDRESS_LOCALES.map((locale) => {
        const existing = (translations || []).find(
            (t) => t.locale === locale.code,
        );
        return {
            locale: locale.code,
            name: existing?.name || "",
            address: existing?.address || "",
        };
    });

    const {
        data,
        setData,
        post: submitRole,
        put,
        processing,
        errors,
    } = useForm({
        name: store?.name || "",
        address: store?.address || "",
        description: store?.description || "",
        slug: store?.slug || "",
        is_active: store?.is_active || true,
        fax: store?.fax || "",
        phone: store?.phone || "",
        phone_code: store?.phone_code || "",
        email: store?.email || "",
        map_url: store?.map_url || "",
        working_hours: workHours || [],
        translations: initialTranslations,
    });

    const updateTranslation = (locale, field, value) => {
        setData(
            "translations",
            data.translations.map((t) =>
                t.locale === locale ? { ...t, [field]: value } : t,
            ),
        );
    };

    const addWorkingHours = () => {
        setData("working_hours", [
            ...data.working_hours,
            { day_of_week: "", start_time: "", end_time: "", is_closed: false },
        ]);
    };

    const removeWorkingHour = (index) => {
        const scopes = [...data.working_hours];
        scopes.splice(index, 1);
        setData("working_hours", scopes);
    };

    const updateWorkingHour = (index, key, value) => {
        const scopes = [...data.working_hours];
        scopes[index][key] = value;
        setData("working_hours", scopes);
    };

    const handleSubmit = () => {
        // const cleanedScope = data.working_hours.filter(
        //     (s) => s.resource_type && s.resource_id,
        // );

        if (store) {
            put(route("stores.update", store.id), {
                ...data,
            });
        } else {
            submitRole(route("stores.store"), {
                ...data,
            });
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={store ? "Update Store" : "Create Store"}
                backAction={RouteList.stores()}
                backName={"View Stores"}
            />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={data}
            >
                <Card>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            {/* Title Input */}
                            <InputField
                                label="Name"
                                name="name"
                                required
                                onChange={(e) => {
                                    setData("name", e.target.value);
                                    setData(
                                        "slug",
                                        useGeneratePath(e.target.value),
                                    );
                                }}
                                value={data.name}
                                error={errors.name}
                                placeholder="e.g., Store name"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            {/* Title Input */}
                            <InputField
                                label="Slug"
                                name="slug"
                                required
                                onChange={(e) =>
                                    setData("slug", e.target.value)
                                }
                                value={data.slug}
                                error={errors.slug}
                                placeholder="e.g., store-name"
                            />
                        </Col>
                        <Col xs={24} md={10}>
                            {/* Title Input */}
                            <InputField
                                label="Address"
                                name="address"
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                                value={data.address}
                                error={errors.address}
                                placeholder="e.g., Address Street 12"
                            />
                        </Col>
                        <Col xs={24} md={10}>
                            {/* Title Input */}
                            <InputField
                                label="Map url"
                                name="map_url"
                                onChange={(e) =>
                                    setData("map_url", e.target.value)
                                }
                                value={data.map_url}
                                error={errors.map_url}
                                placeholder="e.g., https://maps.app.goo.gl/asfAdasfhteqwe"
                            />
                        </Col>
                        <Col
                            xs={24}
                            md={4}
                            className="d-flex justify-content-end align-items-center"
                        >
                            <SwitchField
                                label={"Active Store"}
                                name="is_active"
                                checked={data.is_active || true}
                                onChange={(e) => setData("is_active", e)}
                            />
                        </Col>
                        <Col xs={24} md={24}>
                            {/* Title Input */}
                            <RichTextArea
                                name={"description"}
                                label={"Description"}
                                value={data.description}
                                onChange={(value) =>
                                    setData("description", value)
                                }
                            />
                        </Col>
                    </Row>
                    <Divider>Name & Address Translations</Divider>
                    <Row gutter={16}>
                        {data.translations.map((translation) => {
                            const locale = ADDRESS_LOCALES.find(
                                (l) => l.code === translation.locale,
                            );
                            return (
                                <Col xs={24} md={12} key={translation.locale}>
                                    <InputField
                                        label={`Name (${locale?.label || translation.locale})`}
                                        name={`name_${translation.locale}`}
                                        onChange={(e) =>
                                            updateTranslation(
                                                translation.locale,
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        value={translation.name}
                                        placeholder="e.g., Central Laboratory"
                                    />
                                    <InputField
                                        label={`Address (${locale?.label || translation.locale})`}
                                        name={`address_${translation.locale}`}
                                        onChange={(e) =>
                                            updateTranslation(
                                                translation.locale,
                                                "address",
                                                e.target.value,
                                            )
                                        }
                                        value={translation.address}
                                        placeholder="e.g., Address Street 12"
                                    />
                                </Col>
                            );
                        })}
                    </Row>
                    <Divider>Contacts</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={8} className="d-flex gap-2 w-100">
                            {/* Title Input */}
                            <InputField
                                label="Phone/ Fax Code"
                                name="phone_code"
                                className="w-25"
                                onChange={(e) => {
                                    setData("phone_code", e.target.value);
                                }}
                                value={data.phone_code}
                                error={errors.phone_code}
                                placeholder="e.g., +357"
                            />
                            <InputField
                                label="Phone"
                                name="phone"
                                className="w-75"
                                onChange={(e) => {
                                    setData("phone", e.target.value);
                                }}
                                value={data.phone}
                                error={errors.phone}
                                placeholder="e.g., 25 123 123"
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            {/* Title Input */}
                            <InputField
                                label="Fax"
                                name="fax"
                                onChange={(e) => setData("fax", e.target.value)}
                                value={data.fax}
                                error={errors.fax}
                                placeholder="e.g., store-name"
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            {/* Title Input */}
                            <InputField
                                label="Email"
                                name="email"
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                value={data.email}
                                error={errors.email}
                                placeholder="e.g., Address Street 12"
                            />
                        </Col>
                    </Row>
                    <Divider>Working Hours</Divider>
                    {data?.working_hours?.map((scope, index) => (
                        <Row gutter={16} key={index}>
                            <Col xs={24} md={8}>
                                <SelectField
                                    label="Day"
                                    value={scope.day_of_week}
                                    required
                                    onChange={(e) =>
                                        updateWorkingHour(
                                            index,
                                            "day_of_week",
                                            e.target.value,
                                        )
                                    }
                                    options={DateOptions}
                                    error={errors?.date?.[index]?.day_of_week}
                                />
                            </Col>

                            <Col xs={24} md={4}>
                                <TimePickerField
                                    label="Start Time"
                                    name="start_time"
                                    format="HH:mm"
                                    onChange={(time) =>
                                        updateWorkingHour(
                                            index,
                                            "start_time",
                                            time ? time.format("HH:mm") : null,
                                        )
                                    }
                                    value={
                                        scope.start_time
                                            ? dayjs(scope.start_time, "HH:mm")
                                            : null
                                    }
                                    error={errors?.date?.[index]?.start_time}
                                    placeholder="e.g., 08:00"
                                />
                            </Col>
                            <Col xs={24} md={4}>
                                <TimePickerField
                                    label="End Time"
                                    name="end_time"
                                    format="HH:mm"
                                    onChange={(time) =>
                                        updateWorkingHour(
                                            index,
                                            "end_time",
                                            time ? time.format("HH:mm") : null,
                                        )
                                    }
                                    value={
                                        scope.end_time
                                            ? dayjs(scope.end_time, "HH:mm")
                                            : null
                                    }
                                    error={errors?.date?.[index]?.end_time}
                                    placeholder="e.g., 16:00"
                                />
                            </Col>
                            <Col
                                xs={24}
                                md={4}
                                className="d-flex justify-content-center align-items-center"
                            >
                                <SwitchField
                                    label={"Close"}
                                    name={["working_hours", index, "is_closed"]}
                                    checked={scope.is_closed}
                                    onChange={(e) =>
                                        updateWorkingHour(index, "is_closed", e)
                                    }
                                />
                            </Col>

                            <Col
                                xs={24}
                                md={4}
                                className="d-flex justify-content-end align-items-center"
                            >
                                <Button
                                    icon={<CloseCircleOutlined />}
                                    variant="solid"
                                    danger
                                    onClick={() => removeWorkingHour(index)}
                                >
                                    Remove
                                </Button>
                            </Col>
                        </Row>
                    ))}
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addWorkingHours}
                        block
                    >
                        Add Date
                    </Button>

                    {/* Content Rich Text */}
                </Card>
                <Form.Item className="mt-4">
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

RolesFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
