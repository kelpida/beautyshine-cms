import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { Form, Input, Button, Checkbox, Alert, Typography, Space } from "antd";
import GuestLayout from "@/Layouts/GuestLayout";

const { Title, Text } = Typography;

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <div
                style={{
                    maxWidth: 400,
                    margin: "auto",
                    padding: "2rem",
                    marginTop: "2rem",
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                    backgroundColor: "#fff",
                }}
            >
                <Title
                    level={2}
                    style={{ textAlign: "center", marginBottom: "1.5rem" }}
                >
                    Log In
                </Title>

                {status && (
                    <Alert
                        type="success"
                        message={status}
                        style={{ marginBottom: "1.5rem" }}
                        showIcon
                    />
                )}

                <Form
                    name="login"
                    layout="vertical"
                    onSubmitCapture={submit}
                    initialValues={data}
                >
                    <Form.Item
                        label="Email"
                        validateStatus={errors.email ? "error" : ""}
                        help={errors.email}
                    >
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            autoFocus
                            autoComplete="email"
                            placeholder="Enter your email"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        validateStatus={errors.password ? "error" : ""}
                        help={errors.password}
                    >
                        <Input.Password
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            autoComplete="current-password"
                            placeholder="Enter your password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Checkbox
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                        >
                            Remember me
                        </Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Space
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            {canResetPassword && (
                                <Link
                                    href={route("password.request")}
                                    style={{
                                        fontSize: 14,
                                        textDecoration: "underline",
                                    }}
                                >
                                    Forgot your password?
                                </Link>
                            )}

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={processing}
                            >
                                Log In
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
        </>
    );
}
Login.layout = (page) => <GuestLayout>{page}</GuestLayout>;
