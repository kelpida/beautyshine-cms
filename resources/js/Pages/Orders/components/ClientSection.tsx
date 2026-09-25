import InputField from "@/Components/Form/InputField";
import SelectField from "@/Components/Form/SelectField";
import {
    CheckOutlined,
    PlusOutlined,
    SearchOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Divider, Flex, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";

const { Text } = Typography;

export default function ClientSection({
    clients,
    selectedClient = {} as any,
    setSelectClient,
    resetSelectedClient,
    onNext,
    onBack,
}: {
    clients?: any;
    selectedClient?: any;
    setSelectClient?: any;
    resetSelectedClient?: any;
    onNext?: any;
    onBack?: any;
}) {
    const [createNewUser, setCreateNewUser] = useState(false);

    useEffect(() => {
        if (!selectedClient.client_id) {
            setCreateNewUser(true);
        }
    }, [selectedClient.client_id]);
    return (
        <>
            <Divider>Client Information</Divider>
            <Row gutter={16} className="mt-5">
                {!createNewUser ? (
                    <Col xs={24} md={24}>
                        <SelectField
                            name="client_id"
                            showSearch
                            value={selectedClient.client_id}
                            label={"Select a Client"}
                            options={clients?.map((client) => ({
                                value: client.id,
                                label: `${client.name} ${client.surname}`,
                            }))}
                            onChange={(value) =>
                                setSelectClient((prev) => ({
                                    ...prev,
                                    client_id: value.target.value,
                                }))
                            }
                        />
                    </Col>
                ) : (
                    <>
                        {/* 'name',
        'surname',
        'email',
        'password',
        'phone',
        'phone_code',
        'address', */}
                        <Col xs={24} md={12}>
                            <InputField
                                name={"name"}
                                value={selectedClient?.name}
                                label={"First Name"}
                                onChange={(e) =>
                                    setSelectClient((prev) => ({
                                        ...prev,
                                        client: {
                                            ...prev.client,
                                            name: e.target.value,
                                        },
                                    }))
                                }
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <InputField
                                name={"surname"}
                                value={selectedClient?.surname}
                                label={"Last Name"}
                                onChange={(value) =>
                                    setSelectClient((prev) => ({
                                        ...prev,
                                        client: {
                                            ...prev.client,
                                            surname: value.target.value,
                                        },
                                    }))
                                }
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <InputField
                                type="password"
                                name={"password"}
                                value={selectedClient?.password}
                                label={"Password"}
                                onChange={(value) =>
                                    setSelectClient((prev) => ({
                                        ...prev,
                                        client: {
                                            ...prev.client,
                                            password: value.target.value,
                                        },
                                    }))
                                }
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <InputField
                                type="password"
                                name={"password_confirmation"}
                                value={selectedClient?.password_confirmation}
                                label={"Conf. Password"}
                                onChange={(value) =>
                                    setSelectClient((prev) => ({
                                        ...prev,
                                        client: {
                                            ...prev.client,
                                            password_confirmation:
                                                value.target.value,
                                        },
                                    }))
                                }
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <Flex gap={4} className="w-full">
                                <InputField
                                    name={"phone_code"}
                                    label={"Phone Code"}
                                    value={selectedClient?.phone_code}
                                    className="w-1/4"
                                    onChange={(value) =>
                                        setSelectClient((prev) => ({
                                            ...prev,
                                            client: {
                                                ...prev.client,
                                                phone_code: value.target.value,
                                            },
                                        }))
                                    }
                                />
                                <InputField
                                    name={"phone"}
                                    className="w-3/4"
                                    label={"Phone"}
                                    value={selectedClient?.phone}
                                    onChange={(value) =>
                                        setSelectClient((prev) => ({
                                            ...prev,
                                            client: {
                                                ...prev.client,
                                                phone: value.target.value,
                                            },
                                        }))
                                    }
                                />
                            </Flex>
                        </Col>
                        <Col xs={24} md={12}>
                            <InputField
                                name={"email"}
                                label={"Email"}
                                value={selectedClient?.email}
                                onChange={(value) =>
                                    setSelectClient((prev) => ({
                                        ...prev,
                                        client: {
                                            ...prev.client,
                                            email: value.target.value,
                                        },
                                    }))
                                }
                            />
                        </Col>
                        <Col xs={24} md={24}>
                            <InputField
                                name={"address"}
                                label={"Address"}
                                value={selectedClient?.address}
                                onChange={(value) =>
                                    setSelectClient((prev) => ({
                                        ...prev,
                                        client: {
                                            ...prev.client,
                                            address: value.target.value,
                                        },
                                    }))
                                }
                            />
                        </Col>
                    </>
                )}
            </Row>
            <Flex justify="center" className="mt-4">
                <Button
                    icon={
                        createNewUser ? <SearchOutlined /> : <UserAddOutlined />
                    }
                    onClick={() => {
                        setCreateNewUser(!createNewUser);
                        resetSelectedClient();
                    }}
                >
                    {createNewUser ? "Find client" : "New client"}
                </Button>
            </Flex>
            <Flex justify="space-between" align="center" className="mt-5">
                <Button onClick={() => onBack()} type="primary">
                    Back Step
                </Button>

                <Button onClick={() => onNext()} type="primary">
                    Next Step
                </Button>
            </Flex>
        </>
    );
}
