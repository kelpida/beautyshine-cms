import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import React from "react";
import DraggableTable from "@/Components/DraggableTable";
import { RouteList } from "@/routes/RouteList";
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import TableButtonAction from "@/Components/TableButtonAction";

export default function CategoriesIndexPage({
    packageCategories,
}: {
    packageCategories?: any;
}) {
    const [data, setData] = useState(
        packageCategories?.data || packageCategories || [],
    );
    useEffect(() => {
        setData(packageCategories?.data || packageCategories || []);
    }, [packageCategories]);

    const handleEdit = (e: any) => {
        const url = RouteList.editPackageCategory(e.id);
        router.visit(url);
    };
    const handleDelete = (record: any) => {
        router.delete(
            route("package-categories.destroy", { category: record.id }),
        );
    };
    const pagePermissions = {
        edit: "edit-package-category",
        delete: "destroy-package-category",
        add: "create-package-category",
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
                title="Package Categories"
                addAction={RouteList.createPackageCategory()}
                addName={"Add Category"}
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

CategoriesIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
