import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import SelectField from "@/Components/Form/SelectField";
import SwitchField from "@/Components/Form/SwitchField";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import { EmailOption } from "@/enum/EmailLabel.enum";
import { IntegrationPositionsOptions } from "@/enum/IntegrationPositions.enum";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { useForm } from "@inertiajs/react";
import { Button, Card, Col, Form, Row } from "antd";
import React from "react";

export default function EmailFormPage({ email }) {
    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm({
        email: email?.data?.email || "",
        type: email?.data?.type || "",
        is_active: email?.data?.is_active ?? false,
    });

    const handleSubmit = () => {
        if (email?.data?.id) {
            put(route("emails.update", email?.data?.id), data);
        } else {
            submitPost(route("emails.store"), data);
        }
    };
    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={email?.data ? "Edit Email" : "Create Email"}
                backAction={RouteList.emails()}
                backName={"Back Emails"}
            />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={data}
            >
                <Card className="mb-4">
                    <Row gutter={[16, 16]}>
                        <Col span={10}>
                            <InputField
                                label="Email"
                                name="email"
                                required
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                value={data.email}
                                error={errors.email}
                                placeholder="Email"
                            />
                        </Col>
                        <Col span={10}>
                            <SelectField
                                label={"Type"}
                                name={"type"}
                                value={data.type || email?.data?.type || ""}
                                onChange={(e) =>
                                    setData("type", e.target.value)
                                }
                                options={EmailOption}
                            />
                        </Col>

                        <Col
                            span={4}
                            className="d-flex align-items-center justify-content-center"
                        >
                            <SwitchField
                                name="is_active"
                                label="Active"
                                onChange={(value) =>
                                    setData("is_active", value)
                                }
                                checked={data.is_active}
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

EmailFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
