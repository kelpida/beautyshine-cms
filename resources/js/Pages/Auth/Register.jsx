import React from "react";
import { Form, Input, Button, Typography } from "antd";
import { Head, useForm, Link } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

const { Text } = Typography;

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = () => {
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />
            <div
                style={{
                    maxWidth: 400,
                    margin: "2rem auto",
                    padding: 24,
                    border: "1px solid #d9d9d9",
                    borderRadius: 6,
                    background: "#fff",
                }}
            >
                <Form
                    layout="vertical"
                    onFinish={submit}
                    initialValues={data}
                    onValuesChange={(changedValues) => {
                        for (const [key, value] of Object.entries(
                            changedValues
                        )) {
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
                            {
                                required: true,
                                message: "Please enter your name.",
                            },
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
                            {
                                required: true,
                                message: "Please enter your email.",
                            },
                            {
                                type: "email",
                                message: "Please enter a valid email.",
                            },
                        ]}
                    >
                        <Input type="email" autoComplete="username" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        validateStatus={errors.password ? "error" : ""}
                        help={errors.password}
                        rules={[
                            {
                                required: true,
                                message: "Please enter your password.",
                            },
                        ]}
                    >
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="password_confirmation"
                        validateStatus={
                            errors.password_confirmation ? "error" : ""
                        }
                        help={errors.password_confirmation}
                        rules={[
                            {
                                required: true,
                                message: "Please confirm your password.",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        getFieldValue("password") === value
                                    ) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error(
                                            "The two passwords do not match!"
                                        )
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>

                    <Form.Item>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Link
                                href={route("login")}
                                style={{
                                    fontSize: 14,
                                    color: "#1890ff",
                                    textDecoration: "underline",
                                }}
                            >
                                Already registered?
                            </Link>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={processing}
                            >
                                Register
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </GuestLayout>
    );
}
