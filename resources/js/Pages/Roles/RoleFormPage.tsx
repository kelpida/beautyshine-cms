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
import { PermissionLabel } from "@/enum/PermissionLabel.enum";

export default function RolesFormPage({
    role = null,
    permissions,
    countries = [],
    cities = [],
    types = [],
}: {
    role?: any;
    permissions?: any;
    countries?: any;
    cities?: any;
    types?: any;
}) {
    console.log("🚀 ~ RolesFormPage ~ role:", role);
    const [permissionsGroup, setPermissionsGroup] = useState<any>([]);
    const [selectPermissions, setSelectPermissions] = useState(
        role?.data?.permissions.length > 0
            ? role.data.permissions.map(({ id }: any) => ({ id }))
            : [],
    );
    const [scopeSpecificOptions, setScopeSpecificOptions] = useState<any[]>([]);

    const {
        data,
        setData,
        post: submitRole,
        put,
        processing,
        errors,
        transform,
    } = useForm<any>({
        name: role?.data?.name || "",
        permissions:
            role?.data?.permissions.length > 0
                ? role.data.permissions.map(({ id }) => ({ id }))
                : [],
        scope:
            role?.data?.scope?.length > 0
                ? role.data.scope
                : [
                      {
                          resource_type: "",
                          resource_id: "",
                          mode: "allow",
                      },
                  ],
    });
    console.log("🚀 ~ RolesFormPage ~ data:", data);
    const allowedActions = ["index", "view", "store", "edit", "destroy"];

    useEffect(() => {
        if (permissions?.data?.length > 0) {
            const grouped = permissions.data
                .filter((perm) => {
                    const action = perm.name.split("-")[0];
                    return allowedActions.includes(action);
                })
                .reduce((acc, perm) => {
                    const parts = perm.name.split("-");
                    const action = parts.shift(); // index, view, etc
                    const resource = parts.join("-"); // post-category, property-type

                    acc[resource] = acc[resource] || [];
                    acc[resource].push({
                        ...perm,
                        action,
                    });

                    return acc;
                }, {});

            setPermissionsGroup(grouped);
        }
    }, [permissions, role]);

    const handlePermissionChange = (e, id) => {
        let updated;

        if (e.target.checked) {
            updated = [...data.permissions.map((p) => p.id), id];
        } else {
            updated = data.permissions.map((p) => p.id).filter((p) => p !== id);
        }

        setData(
            "permissions",
            updated.map((id) => ({ id })),
        );
    };

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
        transform((data: any) => ({
            ...data,
            scope: (data.scope || []).filter(
                (s: any) => s.resource_type && s.resource_id,
            ),
        }));

        if (role?.data?.id) {
            put(route("roles.update", role.data.id));
        } else {
            submitRole(route("roles.store"));
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={role ? "Update Role" : "Create Role"}
                backAction={RouteList.roles()}
                backName={"View Roles"}
            />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={data}
            >
                <Card>
                    <Row gutter={16}>
                        <Col xs={24} md={24}>
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
                    </Row>
                    <Divider>Select Role Permissions</Divider>
                    {Object.keys(permissionsGroup).length > 0 ? (
                        <Tabs
                            type="card"
                            items={Object.entries(permissionsGroup).map(
                                ([groupKey, permissions]: [string, any]) => ({
                                    key: groupKey,
                                    label: groupKey
                                        .replace(/-/g, " ")
                                        .toUpperCase(),
                                    children: (
                                        <div>
                                            {(permissions as any[]).map((perm: any) => (
                                                <CheckboxField
                                                    key={perm.id}
                                                    label={
                                                        PermissionLabel[
                                                            perm.name
                                                                .replace(
                                                                    `-${groupKey}`,
                                                                    "",
                                                                )
                                                                .replace(
                                                                    /-/g,
                                                                    " ",
                                                                )
                                                        ]
                                                    }
                                                    name={perm.name}
                                                    checked={data.permissions.some(
                                                        (p) => p.id === perm.id,
                                                    )}
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            e,
                                                            perm.id,
                                                        )
                                                    }
                                                    role="checkbox"
                                                    style={{
                                                        marginBottom: "0.5rem",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    ),
                                }),
                            )}
                        />
                    ) : (
                        <p>No permissions found.</p>
                    )}

                    <Divider>Scopes</Divider>
                    {data.scope.map((scope, index) => (
                        <Row gutter={16} key={index}>
                            <Col xs={24} md={11}>
                                <SelectField
                                    label="Scope Type"
                                    value={scope.resource_type}
                                    required
                                    onChange={(e) => {
                                        updateScope(
                                            index,
                                            "resource_type",
                                            e.target.value,
                                        );
                                        handleSetScopeSpecific(
                                            e.target.value,
                                            index,
                                        );
                                    }}
                                    options={ScopeTypeOptions}
                                    error={(errors as any)?.scope?.[index]?.resource_type}
                                />
                            </Col>

                            <Col xs={24} md={11}>
                                <SelectField
                                    label="Specific Scope"
                                    value={scope.resource_id}
                                    required
                                    onChange={(e) =>
                                        updateScope(
                                            index,
                                            "resource_id",
                                            e.target.value,
                                        )
                                    }
                                    options={
                                        scopeSpecificOptions[index]?.map(
                                            (specific: any) => ({
                                                label: specific.name,
                                                value: specific.id,
                                            }),
                                        ) ?? []
                                    }
                                    error={(errors as any)?.scope?.[index]?.resource_id}
                                />
                            </Col>
                            {data.scope.length > 1 && (
                                <Col
                                    xs={24}
                                    md={2}
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
