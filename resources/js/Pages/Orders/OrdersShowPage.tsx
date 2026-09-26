import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Card,
    Descriptions,
    Tag,
    Table,
    Select,
    Button,
    Typography,
    Divider,
    message,
    Flex,
} from "antd";
import PageHeaderActions from "@/Components/PageHeaderActions";
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/Layouts/AdminLayout";
import SelectField from "@/Components/Form/SelectField";
import { OrderStatusOptions } from "@/enum/OrderStatus.enum";
import { RouteList } from "@/routes/RouteList";
import { PaymentMethodsLabel } from "@/enum/PaymentMethods.enum";
import { OrderSourceLabel } from "@/enum/OrderSource.enum";

const { Title, Text } = Typography;

export default function OrderShowPage({ order }: { order?: any }) {
    // Unpack data if wrapped in Resource
    const orderData = order?.data || order;

    const [status, setStatus] = useState(orderData?.order_status);
    const [loading, setLoading] = useState(false);

    const saveStatus = () => {
        console.log(status);
        router.patch(
            route("orders.update", orderData.id),
            { status },
            {
                onStart: () => setLoading(true),
                onSuccess: () => {
                    message.success("Order status updated successfully");
                },
                onError: () => {
                    message.error("Failed to update order status");
                },
                onFinish: () => setLoading(false),
                preserveScroll: true,
            },
        );
    };

    const statusColors = {
        pending: "orange",
        processing: "blue",
        completed: "green",
        cancelled: "red",
    };

    const itemColumns = [
        {
            title: "Product",
            dataIndex: "product_name",
            key: "product_name",
        },
        {
            title: "Options",
            dataIndex: "variation_name",
            key: "variation_name",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (val) => `€${Number(val).toFixed(2)}`,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Total Price",
            dataIndex: "total_price",
            key: "total_price",
            render: (val) => `€${Number(val).toFixed(2)}`,
        },
    ];

    if (!orderData) return null;

    return (
        <>
            <Head title={`Order #${orderData.id}`} />

            <PageHeaderActions
                title={`Order Details #${orderData.id}`}
                backAction={RouteList.orders()}
                backName={"Orders"}
                children={
                    <>
                        <Button
                            color="orange"
                            type="default"
                            variant="solid"
                            icon={<CalendarOutlined />}
                            onClick={() =>
                                router.visit(RouteList.orderCalendar(), {
                                    preserveScroll: true,
                                    preserveState: true,
                                })
                            }
                        >
                            Orders Calendar
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={saveStatus}
                            loading={loading}
                            disabled={status === orderData.order_status}
                        >
                            Save Status
                        </Button>
                    </>
                }
            />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
                <Card
                    title="Order Information"
                    extra={
                        <Tag
                            color={
                                statusColors[orderData.order_status] ||
                                "default"
                            }
                            style={{ fontSize: "14px", padding: "4px 12px" }}
                        >
                            {orderData.order_status?.toUpperCase()}
                        </Tag>
                    }
                    variant="outlined"
                    className="shadow-sm rounded-lg mb-2"
                >
                    <Descriptions
                        bordered
                        column={{ xxl: 4, xl: 4, lg: 4, md: 1, sm: 1, xs: 1 }}
                        className="mb-6"
                    >
                        <Descriptions.Item label="Order ID" span={2}>
                            #{orderData.id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Client Name" span={2}>
                            {orderData.client_name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Client Email" span={2}>
                            {orderData.client_email || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created At" span={2}>
                            {new Date(orderData.created_at).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Transaction ID" span={4}>
                            {orderData.transaction_id || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment Status" span={1}>
                            <Tag
                                color={
                                    orderData.payment_status === "paid"
                                        ? "green"
                                        : "orange"
                                }
                            >
                                {orderData.payment_status?.toUpperCase() ||
                                    "N/A"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment Method" span={1}>
                            {orderData?.payment_method
                                ? PaymentMethodsLabel[orderData?.payment_method]
                                : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Order Source" span={2}>
                            {orderData?.source
                                ? OrderSourceLabel[orderData?.source]
                                : "N/A"}
                        </Descriptions.Item>

                        {orderData.promo_code && (
                            <Descriptions.Item label="Promo Code">
                                <Tag color="purple">
                                    {orderData.promo_code?.code ||
                                        orderData.promo_code}
                                </Tag>
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    <Flex
                        align="center"
                        justify="center"
                        vertical
                        gap="middle"
                        style={{ marginTop: "2rem" }}
                    >
                        <div className="w-25">
                            <SelectField
                                label="Order Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-48"
                                options={OrderStatusOptions}
                            />
                        </div>
                    </Flex>
                </Card>
                <Card
                    title="Appointment"
                    bordered={false}
                    className="shadow-sm rounded-lg mb-2"
                >
                    <Descriptions
                        bordered
                        column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                        className="mb-6"
                    >
                        <Descriptions.Item label="Store ID">
                            #{orderData?.appointment?.store?.id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Store Name">
                            {orderData?.appointment?.store?.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Date">
                            {orderData?.appointment?.date}
                        </Descriptions.Item>
                        <Descriptions.Item label="Time">
                            {`${orderData?.appointment?.start_time} -
                            ${orderData?.appointment?.end_time}`}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="Packages" className="shadow-sm rounded-lg mb-2">
                    <Table
                        dataSource={orderData.items}
                        columns={itemColumns}
                        rowKey="id"
                        pagination={false}
                        summary={() => {
                            return (
                                <>
                                    <Table.Summary.Row
                                        style={{ backgroundColor: "#fafafa" }}
                                    >
                                        <Table.Summary.Cell
                                            index={0}
                                            colSpan={4}
                                        >
                                            <Text
                                                strong
                                                className="float-right text-md"
                                            >
                                                Subtotal:
                                            </Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <Text className="text-md text-gray-800">
                                                €
                                                {Number(
                                                    orderData.amount || 0,
                                                ).toFixed(2)}
                                            </Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>

                                    {Number(orderData.discount_amount) > 0 && (
                                        <Table.Summary.Row
                                            style={{
                                                backgroundColor: "#fafafa",
                                            }}
                                        >
                                            <Table.Summary.Cell
                                                index={0}
                                                colSpan={3}
                                            >
                                                <Text
                                                    strong
                                                    className="float-right text-md text-red-500"
                                                >
                                                    Discount
                                                    {orderData.promo_code
                                                        ? ` (${orderData.promo_code.code})`
                                                        : ""}
                                                    :
                                                </Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={1}>
                                                <Text className="text-md text-red-500">
                                                    -€
                                                    {Number(
                                                        orderData.discount_amount,
                                                    ).toFixed(2)}
                                                </Text>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    )}

                                    <Table.Summary.Row
                                        style={{ backgroundColor: "#fafafa" }}
                                    >
                                        <Table.Summary.Cell
                                            index={0}
                                            colSpan={4}
                                        >
                                            <Text
                                                strong
                                                className="float-right text-lg"
                                            >
                                                Total Amount:
                                            </Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <Text
                                                strong
                                                className="text-lg text-blue-600"
                                            >
                                                €
                                                {Number(
                                                    orderData.total_amount || 0,
                                                ).toFixed(2)}
                                            </Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                            );
                        }}
                    />
                </Card>
            </div>
        </>
    );
}

OrderShowPage.layout = (page) => <AdminLayout children={page} />;
