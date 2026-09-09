import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Button, Flex, message, Modal } from "antd";
import React, { useEffect, useState } from "react";

export default function SubscriptionsIndexPage({ subscriptions = [] }) {
    const [data, setData] = useState(subscriptions);

    useEffect(() => {
        setData(subscriptions);
    }, [subscriptions]);

    const handleDelete = (record) => {
        Modal.confirm({
            title: "Are you sure you want to delete this subscription?",
            content: `Email: ${record.email}`,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                router.delete(RouteList.deleteSubscription(record.id), {
                    onSuccess: () => {
                        message.success("Subscription deleted successfully");
                    },
                    onError: () => {
                        message.error("Failed to delete subscription");
                    },
                });
            },
        });
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Email", dataIndex: "email", key: "email" },
        { 
            title: "Subscribed At", 
            dataIndex: "created_at", 
            key: "created_at",
            render: (text) => new Date(text).toLocaleString()
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Flex gap={3}>
                    <Button
                        color="danger"
                        variant="solid"
                        onClick={() => handleDelete(record)}
                    >
                        Delete
                    </Button>
                </Flex>
            ),
        },
    ];

    const exportUrl = RouteList.subscriptionExport();

    return (
        <div>
            <PageHeaderActions
                title="Subscribed Users"
                // No "Add" button needed for subscriptions typically
            />
             <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button href={exportUrl} target="_blank">Export CSV</Button>
            </div>
            <DraggableTable
                dataSource={data}
                setDataSource={setData}
                columns={columns}
                rowKey="id"
                // Disable drag since order is typically time-based
                onOrderChange={() => {}} 
            />
        </div>
    );
}

SubscriptionsIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
