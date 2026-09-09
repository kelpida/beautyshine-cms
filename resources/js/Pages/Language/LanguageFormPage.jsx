import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button, Card, Col, Form, Row } from "antd";
import { useForm } from "@inertiajs/react";
import React, { useEffect, useMemo } from "react";
import InputField from "@/Components/Form/InputField";
import SelectField from "@/Components/Form/SelectField";
import { RouteList } from "@/routes/RouteList";
import PopupFormMessage from "@/Components/PopupFormMessage";
import ISO6391 from "iso-639-1";
import CheckboxField from "@/Components/Form/CheckboxField";

export default function LanguageFormPage({ language = null }) {
    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm({
        name: language?.data?.name || "",
        code: language?.data?.code || "",
        is_active: language?.data?.is_active ?? true,
    });

    const languageOptions = useMemo(() => {
        return ISO6391.getAllCodes().map((code) => ({
            value: code,
            label: `${ISO6391.getName(
                code
            )} (${code}) - ${ISO6391.getNativeName(code)}`,
        }));
    }, []);

    const handleSubmit = () => {
        if (language?.data?.id) {
            put(route("languages.update", language?.data?.id));
        } else {
            submitPost(route("languages.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={language ? "Update Language" : "Create Language"}
                backAction={RouteList.languages()}
                backName={"View Languages"}
            />

            <Card>
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        name: data?.name,
                        code: data?.code,
                        is_active: data?.is_active,
                    }}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <SelectField
                                label="Select Language"
                                name="code"
                                required
                                value={data.code}
                                onChange={(value) => {
                                    setData(
                                        "name",
                                        ISO6391.getName(value.target.value)
                                    );
                                    setData("code", value.target.value);
                                }}
                                options={languageOptions}
                                error={errors.code}
                                placeholder="Select a language"
                                showSearch
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <InputField
                                label="Name"
                                name="name"
                                required
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                error={errors.name}
                                placeholder="Language Name"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <CheckboxField
                                label={"Is Active"}
                                name="is_active"
                                required
                                checked={data.is_active}
                                onChange={(e) => {
                                    setData("is_active", e.target.checked);
                                }}
                                error={errors.is_active}
                            />
                        </Col>
                    </Row>

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
            </Card>
        </div>
    );
}

LanguageFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
