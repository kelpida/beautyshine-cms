import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import SelectField from "@/Components/Form/SelectField";
import SwitchField from "@/Components/Form/SwitchField";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import { IntegrationPositionsOptions } from "@/enum/IntegrationPositions.enum";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { useForm } from "@inertiajs/react";
import { Button, Card, Col, Form, Row } from "antd";
import React from "react";

export default function IntegrationFormPage({
    integration,
}: {
    integration?: any;
}) {
    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm<any>({
        name: integration?.data?.name || "",
        provider: integration?.data?.provider || "",
        position: integration?.data?.position || "",
        script: integration?.data?.script || "",
        enabled: integration?.data?.is_enabled ?? false,
    });

    const handleSubmit = () => {
        if (integration?.data?.id) {
            put(route("integrations.update", integration?.data?.id));
        } else {
            submitPost(route("integrations.store"));
        }
    };
    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={integration ? "Edit Integration" : "Create Integration"}
                backAction={RouteList.integrations()}
                backName={"Back Integrations"}
            />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={data}
            >
                <Card className="mb-4">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <InputField
                                name="provider"
                                label="Provider"
                                required
                                value={data.provider}
                                onChange={(value) =>
                                    setData("provider", value.target.value)
                                }
                            />
                        </Col>
                        <Col span={12}>
                            <InputField
                                name="name"
                                label="Name"
                                required
                                value={data.name}
                                onChange={(value) =>
                                    setData("name", value.target.value)
                                }
                            />
                        </Col>
                        <Col span={24}>
                            <RichTextArea
                                name="script"
                                label="Script"
                                value={data.script}
                                required
                                onChange={(value) => setData("script", value)}
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                name="position"
                                label="Position"
                                value={data.position}
                                required
                                options={IntegrationPositionsOptions}
                                onChange={(value) =>
                                    setData("position", value.target.value)
                                }
                            />
                        </Col>
                        <Col span={12} className="flex items-center">
                            <SwitchField
                                name="enabled"
                                label="Enabled"
                                onChange={(value) => setData("enabled", value)}
                                checked={data.enabled}
                            />
                        </Col>
                    </Row>
                </Card>
                <Button type="primary" htmlType="submit" loading={processing}>
                    Save
                </Button>
            </Form>
        </div>
    );
}

IntegrationFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
