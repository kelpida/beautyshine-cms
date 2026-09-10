import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";

import { Button, Form, message, Row, Col, Divider, Card } from "antd";
import { useForm } from "@inertiajs/react";
import React, { use, useEffect, useState } from "react";
import InputField from "@/Components/Form/InputField";
import useMessage from "antd/es/message/useMessage";
import { RouteList } from "@/routes/RouteList";
import CheckboxField from "@/Components/Form/CheckboxField";
import PopupFormMessage from "@/Components/PopupFormMessage";
import SelectField from "@/Components/Form/SelectField";
import Password from "antd/lib/input/Password";
import { ScopeModeOptions, ScopeTypeOptions } from "@/enum/ScopeType.enum";
import { CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";

export default function UsersFormPage({
    roles = null,
    user = null as any,
    cities = [],
    countries = [],
    types = [],
    status = [],
}: any) {
    const [scopeSpecificOptions, setScopeSpecificOptions] = useState<any[]>([]);
    const {
        data,
        setData,
        post: submitRole,
        put,
        processing,
        errors,
    } = useForm<any>({
        name: user?.data?.name || "",
        email: user?.data?.email || "",
        password: user?.data?.password || "",
        role_id: user?.data?.role?.id || "",
        scope: user?.data?.scope
            ? user?.data.scope
            : [
                  {
                      resource_type: "",
                      resource_id: "",
                      mode: "allow",
                  },
              ],
    });
    useEffect(() => {
        if (user?.data?.scope) {
            user.data.scope.forEach((scope, index) => {
                handleSetScopeSpecific(scope.resource_type, index);
            });
        }
    }, [user]);
    const handleSetScopeSpecific = (scopeType, index) => {
        let options = [];

        switch (scopeType) {
            case "city":
                options = cities;
                break;
            case "country":
                options = countries;
                break;
            case "type":
                options = types;
                break;
            case "status":
                options = status;
                break;
            default:
                options = [];
        }

        setScopeSpecificOptions((prev) => {
            const updated = [...prev];
            updated[index] = options;
            return updated;
        });
    };

    const addScope = () => {
        setData("scope", [
            ...data.scope,
            { resource_type: "", resource_id: "", mode: "allow" },
        ]);
    };

    const removeScope = (index) => {
        const scopes = [...data.scope];
        scopes.splice(index, 1);
        setData("scope", scopes);
    };

    const updateScope = (index, key, value) => {
        const scopes = [...data.scope];
        scopes[index][key] = value;
        setData("scope", scopes);
    };

    const handleSubmit = () => {
        if (user) {
            put(route("users.update", user.data.id));
        } else {
            submitRole(route("users.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={user?.data ? "Update User" : "Create User"}
                backAction={RouteList.users()}
                backName={"View Users"}
            />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={data}
            >
                <Card>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            {/* Title Input */}
                            <InputField
                                label="Name"
                                name="name"
                                required
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                value={data.name}
                                error={errors.name}
                                placeholder="Name"
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            {/* Title Input */}
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
                        <Col xs={24} md={8}>
                            {/* Title Input */}
                            <Form.Item
                                label={!user ? "Password" : "Reset Password"}
                                name="password"
                                validateStatus={errors.password ? "error" : ""}
                                help={errors.password}
                            >
                                <Password
                                    name="password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    value={data.password}
                                    placeholder="Password"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24}>
                            {roles && (
                                <SelectField
                                    label="Role"
                                    name="role_id"
                                    value={data.role_id}
                                    required
                                    onChange={(e) =>
                                        setData("role_id", e.target.value)
                                    }
                                    options={roles.map((role) => ({
                                        label: role.name,
                                        value: role.id,
                                    }))}
                                />
                            )}
                        </Col>
                    </Row>
                    <Divider>Scopes</Divider>
                    {data.scope.map((scope, index) => (
                        <Row gutter={16} key={index}>
                            <Col xs={24} md={7}>
                                <SelectField
                                    label="Scope Type"
                                    value={scope.resource_type}
                                    required
                                    onChange={(e) => {
                                        updateScope(
                                            index,
                                            "resource_type",
                                            e.target.value
                                        );
                                        handleSetScopeSpecific(
                                            e.target.value,
                                            index
                                        );
                                    }}
                                    options={ScopeTypeOptions}
                                    error={
                                        (errors as any)?.scope?.[index]?.resource_type
                                    }
                                />
                            </Col>

                            <Col xs={24} md={7}>
                                <SelectField
                                    label="Specific Scope"
                                    value={scope.resource_id}
                                    required
                                    onChange={(e) =>
                                        updateScope(
                                            index,
                                            "resource_id",
                                            e.target.value
                                        )
                                    }
                                    options={
                                        scopeSpecificOptions[index]?.map(
                                            (specific: any) => ({
                                                label: specific.name,
                                                value: specific.id,
                                            })
                                        ) ?? []
                                    }
                                    error={(errors as any)?.scope?.[index]?.resource_id}
                                />
                            </Col>

                            <Col xs={24} md={7}>
                                <SelectField
                                    label="Modifier"
                                    value={scope.mode}
                                    required
                                    onChange={(e) =>
                                        updateScope(
                                            index,
                                            "mode",
                                            e.target.value
                                        )
                                    }
                                    options={ScopeModeOptions}
                                    error={(errors as any)?.scope?.[index]?.mode}
                                />
                            </Col>
                            {data.scope.length > 1 && (
                                <Col
                                    xs={24}
                                    md={3}
                                    className="flex justify-center items-center"
                                >
                                    <Button
                                        icon={<CloseCircleOutlined />}
                                        danger
                                        onClick={() => removeScope(index)}
                                    >
                                        Remove
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    ))}
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addScope}
                        block
                    >
                        Add Scope
                    </Button>
                </Card>
                {/* Content Rich Text */}
                <Form.Item className="mt-4">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={processing}
                        block
                    >
                        Save
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

UsersFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
