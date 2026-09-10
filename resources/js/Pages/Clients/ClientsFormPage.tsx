import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import SelectField from "@/Components/Form/SelectField";
import MediaSelector from "@/Components/MediaSelector";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { useForm, router } from "@inertiajs/react";
import { Button, Card, Col, Divider, Flex, Form, Row, Table } from "antd";
import React, { useState } from "react";
import PropertyAttributesRender from "@/Components/PropertyAttributesRender";
import SwitchField from "@/Components/Form/SwitchField";
import { useGeneratePath } from "@/hooks/useGeneratePath";
import AuditLogs from "@/Components/AuditLogs";
import { OrderStatusLabel } from "@/enum/OrderStatus.enum";
import { PaymentStatusLabel } from "@/enum/PaymentStatus.enum";
import { getSeenIcon } from "@/enum/OrderSeen.enum";
import { EyeFilled } from "@ant-design/icons";

export default function ClientsFormPage({ client, orders }) {
    // If package is passed as an empty array, treat as null
    const clientData =
        Array.isArray(client?.data) && client.data.length === 0
            ? null
            : client?.data;

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
        transform,
    } = useForm({
        name: clientData?.name || "",
        surname: clientData?.surname || "",
        email: clientData?.email || "",
        password: clientData?.password || "",
        phone: clientData?.phone || "",
        phone_code: clientData?.phone_code || "",
        address: clientData?.address || [],
    });

    const handleSubmit = () => {
        if (clientData) {
            put(route("clients.update", clientData.id));
        } else {
            submitPost(route("clients.store"));
        }
    };

    const orderColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Transaction",
            dataIndex: "transaction_id",
            key: "transaction_id",
        },
        {
            title: "Order Status",
            dataIndex: "order_status",
            key: "order_status",
            render: (_, record) => OrderStatusLabel[record.order_status],
        },
        {
            title: "Payment Status",
            dataIndex: "payment_status",
            key: "payment_status",
            render: (_, record) => PaymentStatusLabel[record.payment_status],
        },
        {
            title: "Total Amount",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (val) => `€${Number(val || 0).toFixed(2)}`,
        },
        {
            title: "Seen",
            dataIndex: "is_seen",
            key: "is_seen",
            render: (_, record) => getSeenIcon(record.is_seen),
        },
        {
            title: "Created At",
            render: (text, record) =>
                new Date(record.created_at).toLocaleDateString("en-GB"),
            key: "created_at",
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <Button
                    type="primary"
                    icon={<EyeFilled />}
                    onClick={() =>
                        router.visit(route("orders.show", record.id))
                    }
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={clientData ? "Update Client" : "Create Client"}
                backAction={RouteList.clients()}
                backName={"View Clients"}
            />
            <Card>
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={data}
                >
                    {/* Non-Translatable Fields - Only render once */}
                    <Divider>Client Information</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <InputField
                                label="Name"
                                name="name"
                                value={data.name || ""}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                error={errors.name}
                                placeholder="John"
                                required
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <InputField
                                label="Surname"
                                name="surname"
                                value={data.surname || ""}
                                onChange={(e) =>
                                    setData("surname", e.target.value)
                                }
                                error={errors.surname}
                                placeholder="David"
                                required
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <InputField
                                label="Email"
                                name="email"
                                value={data.email || ""}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                error={errors.email}
                                placeholder="johndavid@mail.com"
                                required
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <Flex gap={3}>
                                <div className="w-25">
                                    <InputField
                                        label="Phone Code"
                                        name="phone_code"
                                        value={data.phone_code}
                                        onChange={(e) =>
                                            setData(
                                                "phone_code",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.phone_code}
                                        placeholder="+357"
                                        required
                                    />
                                </div>
                                <div className="w-75">
                                    <InputField
                                        label="Phone"
                                        name="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                        error={errors.phone}
                                        placeholder={"99123123"}
                                        required
                                    />
                                </div>
                            </Flex>
                        </Col>
                        <Col xs={24} md={8}>
                            <InputField
                                label="Address"
                                name="address"
                                value={data.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                                error={errors.address}
                                placeholder={"Limassol, Cyprus"}
                                required
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <InputField
                                label={
                                    clientData ? "Reset Password" : "Password"
                                }
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                error={errors.password}
                            />
                        </Col>
                    </Row>
                    <Form.Item className="mt-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                        >
                            Save Client
                        </Button>
                    </Form.Item>
                </Form>
                {clientData &&
                    orders &&
                    orders?.data &&
                    orders.data.length > 0 && (
                        <div className="mt-6">
                            <Divider>Client Orders</Divider>
                            <Table
                                dataSource={orders.data}
                                columns={orderColumns}
                                rowKey="id"
                            />
                        </div>
                    )}
            </Card>
        </div>
    );
}

ClientsFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
