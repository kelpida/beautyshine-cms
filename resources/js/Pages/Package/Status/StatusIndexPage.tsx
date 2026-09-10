import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import React from "react";
import DraggableTable from "@/Components/DraggableTable";
import { RouteList } from "@/routes/RouteList";
import { useState, useEffect } from "react";
import { Button, Flex } from "antd";
import { router } from "@inertiajs/react";
import TableButtonAction from "@/Components/TableButtonAction";

export default function StatusIndexPage({
    packageStatuses,
}: {
    packageStatuses?: any;
}) {
    const [data, setData] = useState(
        packageStatuses?.data || packageStatuses || [],
    );
    useEffect(() => {
        setData(packageStatuses?.data || packageStatuses || []);
    }, [packageStatuses]);

    const handleEdit = (e: any) => {
        const url = RouteList.editPackageStatus(e.id);
        router.visit(url);
    };
    const handleDelete = (record: any) => {
        router.delete(route("package-statuses.destroy", { status: record.id }));
    };
    const pagePermissions = {
        edit: "edit-package-status",
        delete: "destroy-package-status",
        add: "create-package-status",
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
                title="Package Statuses"
                addAction={RouteList.createPackageStatus()}
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
