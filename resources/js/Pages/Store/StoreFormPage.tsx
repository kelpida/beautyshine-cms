import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Form,
    Row,
    Col,
    Divider,
    Card,
    Tabs,
    Space,
    Typography,
    Alert,
} from "antd";
import { useForm } from "@inertiajs/react";
import React, { useMemo } from "react";
import InputField from "@/Components/Form/InputField";
import { RouteList } from "@/routes/RouteList";
import PopupFormMessage from "@/Components/PopupFormMessage";
import SelectField from "@/Components/Form/SelectField";
import {
    CloseCircleOutlined,
    PlusOutlined,
    ShopOutlined,
    ClockCircleOutlined,
    SaveOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { slugifyFields } from "@/lib/InputHelper";
import RichTextArea from "@/Components/Form/RichTextArea";
import SwitchField from "@/Components/Form/SwitchField";
import { DateOptions } from "@/enum/DateLabel.enum";
import TimePickerField from "@/Components/Form/TimePickerField";
import MultiLanguageFields from "@/Components/MultiLanguageFields";

const { Text } = Typography;

interface StoreFormPageProps {
    store?: any;
    workHours?: any[];
    translations?: any[];
    languages?: any[];
}

export default function StoreFormPage({
    store = null,
    workHours = [],
    translations = [],
    languages = [],
}: StoreFormPageProps) {
    const isEditing = Boolean(store && store.id);

    const initialTranslations = useMemo(() => {
        const list: any[] = [
            {
                locale: "en",
                name: store?.name || "",
                address: store?.address || "",
            },
        ];

        if (Array.isArray(translations)) {
            translations.forEach((t: any) => {
                if (t.locale !== "en") {
                    list.push({
                        locale: t.locale,
                        name: t.name || "",
                        address: t.address || "",
                    });
                }
            });
        }
        return list;
    }, [store, translations]);

    const initialWorkingHours = useMemo(() => {
        if (Array.isArray(workHours) && workHours.length > 0) {
            return workHours.map((wh: any) => ({
                day_of_week: wh.day_of_week?.value || wh.day_of_week || "",
                start_time: wh.start_time
                    ? typeof wh.start_time === "string"
                        ? wh.start_time.substring(0, 5)
                        : dayjs(wh.start_time).format("HH:mm")
                    : "",
                end_time: wh.end_time
                    ? typeof wh.end_time === "string"
                        ? wh.end_time.substring(0, 5)
                        : dayjs(wh.end_time).format("HH:mm")
                    : "",
                is_closed: Boolean(wh.is_closed),
            }));
        }

        return [
            { day_of_week: "monday", start_time: "09:00", end_time: "18:00", is_closed: false },
            { day_of_week: "tuesday", start_time: "09:00", end_time: "18:00", is_closed: false },
            { day_of_week: "wednesday", start_time: "09:00", end_time: "18:00", is_closed: false },
            { day_of_week: "thursday", start_time: "09:00", end_time: "18:00", is_closed: false },
            { day_of_week: "friday", start_time: "09:00", end_time: "18:00", is_closed: false },
            { day_of_week: "saturday", start_time: "09:00", end_time: "18:00", is_closed: false },
            { day_of_week: "sunday", start_time: "", end_time: "", is_closed: true },
        ];
    }, [workHours]);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
    } = useForm<any>({
        name: store?.name || "",
        address: store?.address || "",
        description: store?.description || "",
        slug: store?.slug || "",
        is_active: store?.is_active ?? true,
        fax: store?.fax || "",
        phone: store?.phone || "",
        phone_code: store?.phone_code || "",
        email: store?.email || "",
        map_url: store?.map_url || "",
        working_hours: initialWorkingHours,
        translations: initialTranslations,
    });

    const addWorkingHours = () => {
        setData("working_hours", [
            ...data.working_hours,
            { day_of_week: "", start_time: "09:00", end_time: "18:00", is_closed: false },
        ]);
    };

    const removeWorkingHour = (index: number) => {
        const hours = [...data.working_hours];
        hours.splice(index, 1);
        setData("working_hours", hours);
    };

    const updateWorkingHour = (index: number, key: string, value: any) => {
        const hours = [...data.working_hours];
        hours[index] = {
            ...hours[index],
            [key]: value,
        };
        setData("working_hours", hours);
    };

    const fillStandardSchedule = () => {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const standard = days.map((day) => ({
            day_of_week: day,
            start_time: "09:00",
            end_time: "18:00",
            is_closed: false,
        }));
        standard.push({
            day_of_week: "sunday",
            start_time: "",
            end_time: "",
            is_closed: true,
        });
        setData("working_hours", standard);
    };

    const handleSubmit = () => {
        if (store) {
            put(route("stores.update", store.id));
        } else {
            post(route("stores.store"));
        }
    };

    const tabItems = [
        {
            key: "general",
            label: (
                <span className="flex items-center gap-2">
                    <ShopOutlined /> General Information
                </span>
            ),
            children: (
                <div className="space-y-6">
                    {/* Multilingual Name & Address Card */}
                    <Card
                        title="Store Content & Translations"
                        className="shadow-sm"
                        extra={
                            <span className="text-xs text-gray-500">
                                Enter store details in all supported languages
                            </span>
                        }
                    >
                        <MultiLanguageFields
                            languages={languages}
                            value={data.translations}
                            onChange={(newTranslations: any[]) => {
                                setData("translations", newTranslations);

                                const enTrans = newTranslations.find(
                                    (t: any) => t.locale === "en",
                                );
                                if (enTrans) {
                                    if (enTrans.name !== undefined) {
                                        setData("name", enTrans.name);
                                    }
                                    if (enTrans.address !== undefined) {
                                        setData("address", enTrans.address);
                                    }
                                }
                            }}
                        >
                            {(
                                locale: string,
                                isDefaultLanguage: boolean,
                                currentTranslation: any,
                                updateField: (field: string, val: any) => void,
                            ) => (
                                <Row gutter={16}>
                                    <Col xs={24} md={isDefaultLanguage ? 12 : 24}>
                                        <InputField
                                            label={`Store Name (${locale.toUpperCase()})`}
                                            name={`translations[${locale}][name]`}
                                            required={isDefaultLanguage}
                                            value={currentTranslation?.name ?? ""}
                                            onChange={(e: any) => {
                                                const val = e.target.value;
                                                updateField("name", val);
                                                if (isDefaultLanguage && !isEditing) {
                                                    setData("slug", slugifyFields(val));
                                                }
                                            }}
                                            error={
                                                errors[`translations.${locale}.name`] ||
                                                (isDefaultLanguage ? errors.name : undefined)
                                            }
                                            placeholder="e.g., BeautyShine Central"
                                        />
                                    </Col>

                                    {isDefaultLanguage && (
                                        <Col xs={24} md={12}>
                                            <InputField
                                                label="URL Slug"
                                                name="slug"
                                                required
                                                value={data.slug}
                                                onChange={(e: any) =>
                                                    setData("slug", slugifyFields(e.target.value))
                                                }
                                                error={errors.slug}
                                                placeholder="e.g., alice-blooms-central"
                                            />
                                        </Col>
                                    )}

                                    <Col xs={24}>
                                        <InputField
                                            label={`Store Address (${locale.toUpperCase()})`}
                                            name={`translations[${locale}][address]`}
                                            value={currentTranslation?.address ?? ""}
                                            onChange={(e: any) => {
                                                const val = e.target.value;
                                                updateField("address", val);
                                            }}
                                            error={
                                                errors[`translations.${locale}.address`] ||
                                                (isDefaultLanguage ? errors.address : undefined)
                                            }
                                            placeholder="e.g., 14 Kennedy Avenue, 1087 Nicosia"
                                        />
                                    </Col>
                                </Row>
                            )}
                        </MultiLanguageFields>
                    </Card>

                    {/* Location & Visibility Settings */}
                    <Card title="Store Settings & Overview" className="shadow-sm">
                        <Row gutter={16}>
                            <Col xs={24} md={18}>
                                <InputField
                                    label="Google Maps URL"
                                    name="map_url"
                                    value={data.map_url}
                                    onChange={(e: any) => setData("map_url", e.target.value)}
                                    error={errors.map_url}
                                    placeholder="e.g., https://maps.app.goo.gl/..."
                                />
                            </Col>
                            <Col xs={24} md={6} className="flex items-center pt-2">
                                <SwitchField
                                    label="Active Store"
                                    name="is_active"
                                    checked={Boolean(data.is_active)}
                                    onChange={(val: boolean) => setData("is_active", val)}
                                />
                            </Col>
                            <Col xs={24}>
                                <RichTextArea
                                    name="description"
                                    label="Store Description / About"
                                    value={data.description}
                                    onChange={(val: string) => setData("description", val)}
                                />
                            </Col>
                        </Row>
                    </Card>

                    {/* Contacts Card */}
                    <Card title="Contact Information" className="shadow-sm">
                        <Row gutter={16}>
                            <Col xs={24} md={4}>
                                <InputField
                                    label="Phone Code"
                                    name="phone_code"
                                    value={data.phone_code}
                                    onChange={(e: any) => setData("phone_code", e.target.value)}
                                    error={errors.phone_code}
                                    placeholder="e.g., +357"
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <InputField
                                    label="Phone Number"
                                    name="phone"
                                    value={data.phone}
                                    onChange={(e: any) => setData("phone", e.target.value)}
                                    error={errors.phone}
                                    placeholder="e.g., 22 123456"
                                />
                            </Col>
                            <Col xs={24} md={6}>
                                <InputField
                                    label="Fax"
                                    name="fax"
                                    value={data.fax}
                                    onChange={(e: any) => setData("fax", e.target.value)}
                                    error={errors.fax}
                                    placeholder="e.g., 22 123457"
                                />
                            </Col>
                            <Col xs={24} md={6}>
                                <InputField
                                    label="Email Address"
                                    name="email"
                                    value={data.email}
                                    onChange={(e: any) => setData("email", e.target.value)}
                                    error={errors.email}
                                    placeholder="e.g., info@aliceblooms.com"
                                />
                            </Col>
                        </Row>
                    </Card>
                </div>
            ),
        },
        {
            key: "working-hours",
            label: (
                <span className="flex items-center gap-2">
                    <ClockCircleOutlined /> Working Hours
                    {data.working_hours?.length > 0 && (
                        <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                            {data.working_hours.length}
                        </span>
                    )}
                </span>
            ),
            children: (
                <Card
                    title={
                        <div className="flex justify-between items-center flex-wrap gap-2 py-1">
                            <div>
                                <div className="font-semibold text-base">Store Operating & Pickup Hours</div>
                                <div className="text-xs text-gray-500 font-normal mt-0.5">
                                    Configure hours for each day. These are used for pickup slot generation and customer order appointments.
                                </div>
                            </div>
                            <Space>
                                <Button size="small" onClick={fillStandardSchedule}>
                                    Reset to Default Week
                                </Button>
                            </Space>
                        </div>
                    }
                    className="shadow-sm"
                >
                    {(!data.working_hours || data.working_hours.length === 0) ? (
                        <Alert
                            message="No working hours configured"
                            description="Click below to add daily working hours or click 'Reset to Default Week' above."
                            type="info"
                            showIcon
                            className="mb-4"
                        />
                    ) : (
                        <div className="space-y-3">
                            {data.working_hours.map((scope: any, index: number) => (
                                <Card
                                    key={index}
                                    size="small"
                                    className={`transition-colors border ${scope.is_closed
                                            ? "bg-gray-50 border-gray-200"
                                            : "bg-white border-blue-100 hover:border-blue-300"
                                        }`}
                                >
                                    <Row gutter={16} align="middle">
                                        <Col xs={24} sm={7} md={6}>
                                            <SelectField
                                                label="Day of Week"
                                                value={scope.day_of_week}
                                                required
                                                onChange={(e: any) =>
                                                    updateWorkingHour(
                                                        index,
                                                        "day_of_week",
                                                        e.target.value,
                                                    )
                                                }
                                                options={DateOptions}
                                                error={
                                                    errors[`working_hours.${index}.day_of_week`] ||
                                                    (errors as any)?.date?.[index]?.day_of_week
                                                }
                                            />
                                        </Col>

                                        <Col xs={12} sm={6} md={5}>
                                            <TimePickerField
                                                label="Open Time"
                                                name={`start_time_${index}`}
                                                format="HH:mm"
                                                disabled={scope.is_closed}
                                                onChange={(time: any) =>
                                                    updateWorkingHour(
                                                        index,
                                                        "start_time",
                                                        time ? time.format("HH:mm") : "",
                                                    )
                                                }
                                                value={
                                                    scope.start_time
                                                        ? dayjs(scope.start_time, "HH:mm")
                                                        : null
                                                }
                                                error={errors[`working_hours.${index}.start_time`]}
                                                placeholder="09:00"
                                            />
                                        </Col>

                                        <Col xs={12} sm={6} md={5}>
                                            <TimePickerField
                                                label="Close Time"
                                                name={`end_time_${index}`}
                                                format="HH:mm"
                                                disabled={scope.is_closed}
                                                onChange={(time: any) =>
                                                    updateWorkingHour(
                                                        index,
                                                        "end_time",
                                                        time ? time.format("HH:mm") : "",
                                                    )
                                                }
                                                value={
                                                    scope.end_time
                                                        ? dayjs(scope.end_time, "HH:mm")
                                                        : null
                                                }
                                                error={errors[`working_hours.${index}.end_time`]}
                                                placeholder="18:00"
                                            />
                                        </Col>

                                        <Col
                                            xs={12}
                                            sm={3}
                                            md={4}
                                            className="flex items-center pt-2"
                                        >
                                            <SwitchField
                                                label={scope.is_closed ? "Closed" : "Open"}
                                                name={["working_hours", index, "is_closed"]}
                                                checked={scope.is_closed}
                                                onChange={(checked: boolean) => {
                                                    updateWorkingHour(index, "is_closed", checked);
                                                    if (checked) {
                                                        updateWorkingHour(index, "start_time", "");
                                                        updateWorkingHour(index, "end_time", "");
                                                    }
                                                }}
                                            />
                                        </Col>

                                        <Col
                                            xs={12}
                                            sm={2}
                                            md={4}
                                            className="flex justify-end items-center pt-2"
                                        >
                                            <Button
                                                icon={<CloseCircleOutlined />}
                                                danger
                                                onClick={() => removeWorkingHour(index)}
                                            >
                                                Remove
                                            </Button>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}
                        </div>
                    )}

                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addWorkingHours}
                        block
                        size="large"
                        className="mt-4"
                    >
                        Add Day / Working Hours
                    </Button>
                </Card>
            ),
        },
    ];

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={store ? `Update Store: ${store.name || ""}` : "Create New Store"}
                backAction={RouteList.stores()}
                backName={"View Stores"}
            />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Tabs
                    defaultActiveKey="general"
                    type="card"
                    items={tabItems}
                    className="mb-4"
                />

                <Form.Item className="mt-4">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={processing}
                        icon={<SaveOutlined />}
                        size="large"
                    >
                        {store ? "Update Store" : "Create Store"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

StoreFormPage.layout = (page: any) => <AdminLayout>{page}</AdminLayout>;
