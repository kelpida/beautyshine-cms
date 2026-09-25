import React, { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import PageHeaderActions from "@/Components/PageHeaderActions";
import DraggableTable from "@/Components/DraggableTable";
import TableButtonAction, { Action } from "@/Components/TableButtonAction";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import TableFilter from "@/Components/TableFilter";
import { getSeenIcon } from "@/enum/OrderSeen.enum";
import { OrderStatusLabel, OrderStatusOptions } from "@/enum/OrderStatus.enum";
import {
    PaymentStatusLabel,
    PaymentStatusOptions,
} from "@/enum/PaymentStatus.enum";
import { Button, Tooltip } from "antd";
import {
    CalendarFilled,
    CalendarOutlined,
    EditOutlined,
    EyeFilled,
} from "@ant-design/icons";
import { PermissionList } from "@/routes/PermissionList";

function OrdersIndexPage({ orders }) {
    const [data, setData] = useState(orders.data);
    const { filters = {} } = usePage().props;

    const { getColumnSearchProps, getColumnSelectProps } = TableFilter({
        router,
        routeName: "orders.index",
        extraParams: {},
    });
    useEffect(() => {
        setData(orders.data);
    }, [orders]);

    const handleView = (id) => {
        router.visit(route("orders.show", id));
    };

    const handleDelete = (id) => {
        router.delete(route("orders.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ["orders"] });
            },
        });
    };

    const pagePermissions = {
        edit: "view-order",
        delete: "destroy-order",
        add: "store-order",
        view: "view-order",
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            fixed: "left",
            width: 50,
            ...getColumnSearchProps("order_id"),
        },
        {
            title: "Client Name",
            dataIndex: "client_name",
            key: "client_name",
            width: 150,
            ...getColumnSearchProps("client_name"),
        },
        {
            title: "Email",
            dataIndex: "client_email",
            key: "client_email",
            width: 400,
            ...getColumnSearchProps("client_email"),
        },
        {
            title: "Transaction",
            dataIndex: "transaction_id",
            key: "transaction_id",
            width: 400,
            ...getColumnSearchProps("transaction_id"),
        },
        {
            title: "Order Status",
            dataIndex: "order_status",
            key: "order_status",
            render: (_, record) => OrderStatusLabel[record.order_status],
            width: 200,
            ...getColumnSelectProps("status", OrderStatusOptions),
        },
        {
            title: "Total Amount",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (_, record) =>
                `€${Number(record.total_amount || 0).toFixed(2)}`,
            width: 200,
        },
        {
            title: "Payment Status",
            dataIndex: "payment_status",
            key: "payment_status",
            render: (_, record) => PaymentStatusLabel[record.payment_status],
            width: 200,
            ...getColumnSelectProps("payment_status", PaymentStatusOptions),
        },
        {
            title: "Seen",
            dataIndex: "is_seen",
            key: "is_seen",
            render: (_, record) => getSeenIcon(record.is_seen),
            width: 150,
        },
        {
            title: "Created At",
            render: (text, record) =>
                new Date(record.created_at).toLocaleDateString("en-GB"),
            key: "created_at",
            width: 200,
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 120,
            render: (text, record) => (
                <TableButtonAction
                    deleteAction={() => handleDelete(record.id)}
                    pagePermissions={pagePermissions}
                    children={
                        <Action permission={pagePermissions.view}>
                            <Button
                                color="primary"
                                variant="solid"
                                icon={<EyeFilled />}
                                onClick={() => handleView(record.id)}
                            >
                                View
                            </Button>
                        </Action>
                    }
                />
            ),
        },
    ];
    return (
        <>
            <div>
                <PageHeaderActions
                    title="Orders"
                    permissions={pagePermissions}
                    addAction={RouteList.createOrder()}
                    addName={"Create Order"}
                    children={
                        <Action permission={PermissionList.appointments.index}>
                            <Button
                                icon={<CalendarOutlined />}
                                color="orange"
                                type="default"
                                variant="solid"
                                onClick={() =>
                                    router.visit(RouteList.orderCalendar(), {
                                        preserveScroll: true,
                                        preserveState: true,
                                    })
                                }
                            >
                                View Orders Calendar
                            </Button>
                        </Action>
                    }
                />
                <DraggableTable
                    dataSource={data}
                    setDataSource={setData}
                    columns={columns}
                    rowKey="id"
                    onOrderChange={(newData) => console.log(newData)}
                    paginationMeta={orders.meta}
                    paginationRoute={route("orders.index")}
                    paginationParams={filters}
                />
            </div>
        </>
    );
}

export default OrdersIndexPage;

OrdersIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
