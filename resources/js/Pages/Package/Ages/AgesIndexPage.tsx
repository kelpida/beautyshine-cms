import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import React from "react";
import DraggableTable from "@/Components/DraggableTable";
import { RouteList } from "@/routes/RouteList";
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import TableButtonAction from "@/Components/TableButtonAction";

export default function AgesIndexPage({ packageAges }: { packageAges?: any }) {
    const [data, setData] = useState(packageAges?.data || packageAges || []);
    useEffect(() => {
        setData(packageAges?.data || packageAges || []);
    }, [packageAges]);

    const handleEdit = (e: any) => {
        const url = RouteList.editPackageAge(e.id);
        router.visit(url);
    };
    const handleDelete = (record: any) => {
        router.delete(route("package-ages.destroy", { age: record.id }));
    };
    const pagePermissions = {
        edit: "edit-package-age",
        delete: "destroy-package-age",
        add: "create-package-age",
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
                title="Package Ages"
                addAction={RouteList.createPackageAge()}
                addName={"Add Age"}
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

AgesIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
