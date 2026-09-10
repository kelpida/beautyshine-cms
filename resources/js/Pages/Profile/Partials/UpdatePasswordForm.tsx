import React, { useRef } from "react";
import { Button, Form, Input, Typography, Alert } from "antd";
import { useForm } from "@inertiajs/react";

const { Title, Text } = Typography;

export default function UpdatePasswordForm({ className = "" }) {
    const passwordInputRef = useRef(null);
    const currentPasswordInputRef = useRef(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const onFinish = () => {
        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset("password", "password_confirmation");
                    passwordInputRef.current?.focus();
                }
                if (errs.current_password) {
                    reset("current_password");
                    currentPasswordInputRef.current?.focus();
                }
            },
        });
    };

    return (
        <div className={className} style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 8 }}>
                Update Password
            </Title>
            <Text
                type="secondary"
                style={{ marginBottom: 24, display: "block" }}
            >
                Ensure your account is using a long, random password to stay
                secure.
            </Text>

            <Form
                layout="vertical"
                onFinish={onFinish}
                initialValues={data}
                onValuesChange={(changedValues) => {
                    for (const [key, value] of Object.entries(changedValues)) {
                        setData(key as any, value);
                    }
                }}
            >
                <Form.Item
                    label="Current Password"
                    name="current_password"
                    validateStatus={errors.current_password ? "error" : ""}
                    help={errors.current_password}
                    rules={[
                        {
                            required: true,
                            message: "Please enter your current password.",
                        },
                    ]}
                >
                    <Input.Password
                        ref={currentPasswordInputRef}
                        autoComplete="current-password"
                    />
                </Form.Item>

                <Form.Item
                    label="New Password"
                    name="password"
                    validateStatus={errors.password ? "error" : ""}
                    help={errors.password}
                    rules={[
                        {
                            required: true,
                            message: "Please enter a new password.",
                        },
                    ]}
                >
                    <Input.Password
                        ref={passwordInputRef}
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item
                    label="Confirm Password"
                    name="password_confirmation"
                    validateStatus={errors.password_confirmation ? "error" : ""}
                    help={errors.password_confirmation}
                    rules={[
                        {
                            required: true,
                            message: "Please confirm your new password.",
                        },
                    ]}
                >
                    <Input.Password autoComplete="new-password" />
                </Form.Item>

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
