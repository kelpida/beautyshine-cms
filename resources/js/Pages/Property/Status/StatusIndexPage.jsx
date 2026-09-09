import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import React from "react";
import DraggableTable from "@/Components/DraggableTable";
import { RouteList } from "@/routes/RouteList";
import { useState, useEffect } from "react";
import { Button, Flex } from "antd";
import { router } from "@inertiajs/react";
import TableButtonAction from "@/Components/TableButtonAction";

export default function StatusIndexPage({ propertyStatuses = [] }) {
    const [data, setData] = useState(propertyStatuses.data);
    useEffect(() => {
        setData(propertyStatuses.data);
    }, [propertyStatuses]);

    const handleEdit = (e) => {
        const url = RouteList.editPropertyStatus(e.id); // Adjust this name
        router.visit(url);
    };
    const handleDelete = (record) => {
        router.delete(route("status.destroy", { property_status: record.id }));
    };
    const pagePermissions = {
        edit: "edit-status",
        delete: "delete-status",
        add: "create-status",
    };
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Title", dataIndex: "name", key: "name" },
        { title: "Key", dataIndex: "key", key: "key" },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <TableButtonAction
                    editAction={() => handleEdit(record)}
                    deleteAction={() => handleDelete(record)}
                    pagePermissions={pagePermissions}
                />
            ),
        },
    ];
    return (
        <div>
            <PageHeaderActions
                title="Statuses"
                addAction={RouteList.createPropertyStatus()}
                addName={"Add Status"}
                permissions={pagePermissions}
            />
            <DraggableTable
                dataSource={data}
                setDataSource={setData}
                columns={columns}
                rowKey="id"
                onOrderChange={(newData) => console.log(newData)}
            />
        </div>
    );
}

StatusIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
