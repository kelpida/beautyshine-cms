import React from "react";
import { Badge, Button, Calendar, Card } from "antd";
import dayjs from "dayjs";
import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { Link, router } from "@inertiajs/react";
import { RouteList } from "@/routes/RouteList";
import { PlusOutlined } from "@ant-design/icons";
import { Action } from "@/Components/TableButtonAction";

export default function IndexAppointmentsPage({ appointments = [] }) {
    const getAppointmentsForDate = (value) => {
        const date = value.format("YYYY-MM-DD");

        return appointments.filter((appointment) => {
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
                                        >{`${appointment.start_time} - ${appointment.end_time} ${appointment.customer_name ?? ""}`}</span>
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
                title="Appointments"
                permissions={pagePermissions}
                backAction={RouteList.orders()}
                backName={"View Orders List"}
                children={
                    <Action permission={"store-appointment"}>
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
                            Create Appointment
                        </Button>
                    </Action>
                }
            />
            <Calendar cellRender={cellRender} className="p-5" />
        </>
    );
}

IndexAppointmentsPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
