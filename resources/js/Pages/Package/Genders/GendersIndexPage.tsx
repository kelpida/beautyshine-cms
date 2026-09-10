import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import React from "react";
import DraggableTable from "@/Components/DraggableTable";
import { RouteList } from "@/routes/RouteList";
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import TableButtonAction from "@/Components/TableButtonAction";

export default function GendersIndexPage({
    packageGenders,
}: {
    packageGenders?: any;
}) {
    const [data, setData] = useState(
        packageGenders?.data || packageGenders || [],
    );
    useEffect(() => {
        setData(packageGenders?.data || packageGenders || []);
    }, [packageGenders]);

    const handleEdit = (e: any) => {
        const url = RouteList.editPackageGender(e.id);
        router.visit(url);
    };
    const handleDelete = (record: any) => {
        router.delete(route("genders.destroy", { gender: record.id }));
    };
    const pagePermissions = {
        edit: "edit-package-gender",
        delete: "destroy-package-gender",
        add: "create-package-gender",
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
                title="Package Genders"
                addAction={RouteList.createPackageGender()}
                addName={"Add Gender"}
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

GendersIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
