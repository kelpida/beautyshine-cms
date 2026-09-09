import React from "react";
import { Form, Input, Button, Typography, Alert } from "antd";
import { Link, useForm, usePage } from "@inertiajs/react";

const { Title, Text } = Typography;

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = () => {
        patch(route("profile.update"));
    };

    return (
        <div className={className} style={{ marginBottom: 40, width: "100%" }}>
            <Title level={4} style={{ marginBottom: 8 }}>
                Profile Information
            </Title>
            <Text
                type="secondary"
                style={{ marginBottom: 24, display: "block" }}
            >
                Update your account's profile information and email address.
            </Text>

            <Form
                layout="vertical"
                onFinish={submit}
                initialValues={data}
                onValuesChange={(changedValues) => {
                    for (const [key, value] of Object.entries(changedValues)) {
                        setData(key, value);
                    }
                }}
            >
                <Form.Item
                    label="Name"
                    name="name"
                    validateStatus={errors.name ? "error" : ""}
                    help={errors.name}
                    rules={[
                        { required: true, message: "Please enter your name." },
                    ]}
                >
                    <Input autoComplete="name" autoFocus />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    validateStatus={errors.email ? "error" : ""}
                    help={errors.email}
                    rules={[
                        { required: true, message: "Please enter your email." },
                        {
                            type: "email",
                            message: "Please enter a valid email.",
                        },
                    ]}
                >
                    <Input autoComplete="username" />
                </Form.Item>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div style={{ marginBottom: 24 }}>
                        <Text type="warning">
                            Your email address is unverified.&nbsp;
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                style={{
                                    textDecoration: "underline",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                }}
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </Text>

                        {status === "verification-link-sent" && (
                            <Alert
                                message="A new verification link has been sent to your email address."
                                type="success"
                                showIcon
                                style={{ marginTop: 12 }}
                            />
                        )}
                    </div>
                )}

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={processing}
                    >
                        Save
                    </Button>
                    {recentlySuccessful && (
                        <Text type="success" style={{ marginLeft: 16 }}>
                            Saved.
                        </Text>
                    )}
                </Form.Item>
            </Form>
        </div>
    );
}
