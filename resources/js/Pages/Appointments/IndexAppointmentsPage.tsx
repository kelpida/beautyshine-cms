import React from "react";
import { Badge, Button, Calendar, Card, Space } from "antd";
import dayjs from "dayjs";
import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { Link, router } from "@inertiajs/react";
import { RouteList } from "@/routes/RouteList";
import { PlusOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Action } from "@/Components/TableButtonAction";
import { PermissionList } from "@/routes/PermissionList";

export default function IndexAppointmentsPage({
    pickupOrders = [],
    deliveryOrders = [],
}) {
    console.log("🚀 ~ IndexAppointmentsPage ~ deliveryOrders:", deliveryOrders);
    console.log("🚀 ~ IndexAppointmentsPage ~ pickupOrders:", pickupOrders);
    const getAppointmentsForDate = (value) => {
        const date = value.format("YYYY-MM-DD");

        return [...pickupOrders, ...deliveryOrders].filter((appointment) => {
            return appointment.date === date;
        });
    };

    const pagePermissions = {};

    const getStatus = (status) => {
        switch (status) {
            case "confirmed":
                return "success";
            case "pending":
                return "warning";
            case "cancelled":
                return "error";
            case "completed":
                return "processing";
            default:
                return "default";
        }
    };

    const dateCellRender = (value) => {
        const dayAppointments = getAppointmentsForDate(value);

        return (
            <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                {dayAppointments.map((appointment) => (
                    <li key={appointment.id}>
                        <Card
                            styles={{
                                root: { padding: "3px 7px" },
                                body: { padding: "0" },
                            }}
                        >
                            <Link
                                href={route(
                                    "orders.show",
                                    appointment.order_id,
                                )}
                            >
                                <Badge
                                    status={getStatus(appointment.status)}
                                    text={
                                        <span
                                            className={
                                                appointment.status ===
                                                "completed"
                                                    ? "text-decoration-line-through"
                                                    : "text-decoration-none"
                                            }
                                        >{`${appointment.start_time} ${appointment.customer_name ?? ""}`}</span>
                                    }
                                />
                            </Link>
                        </Card>
                    </li>
                ))}
            </ul>
        );
    };

    const cellRender = (current, info) => {
        if (info.type === "date") {
            return dateCellRender(current);
        }

        return info.originNode;
    };

    return (
        <>
            <PageHeaderActions
                title="Orders Calendar"
                children={
                    <Space>
                        <Action permission={PermissionList.orders.create}>
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() =>
                                    router.visit(RouteList.createOrder(), {
                                        preserveScroll: true,
                                        preserveState: true,
                                    })
                                }
                            >
                                Create Order
                            </Button>
                        </Action>
                        <Action permission={PermissionList.orders.index}>
                            <Button
                                icon={<UnorderedListOutlined />}
                                type="default"
                                onClick={() =>
                                    router.visit(RouteList.orders(), {
                                        preserveScroll: true,
                                        preserveState: true,
                                    })
                                }
                            >
                                View Orders List
                            </Button>
                        </Action>
                    </Space>
                }
            />
            <Calendar
                cellRender={cellRender}
                classNames={{ root: "p-[20px]!" }}
            />
        </>
    );
}

IndexAppointmentsPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
