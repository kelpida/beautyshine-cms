import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import DraggableTable from "@/Components/DraggableTable";
import { RouteList } from "@/routes/RouteList";
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import TableButtonAction from "@/Components/TableButtonAction";

export default function AttributeCategoriesIndexPage({
    attributeCategories = [],
}) {
    const [data, setData] = useState(
        Array.isArray(attributeCategories)
            ? attributeCategories
            : (attributeCategories.data ?? []),
    );

    useEffect(() => {
        const categories = Array.isArray(attributeCategories)
            ? attributeCategories
            : (attributeCategories.data ?? []);
        setData(categories);
    }, [attributeCategories]);

    const handleEdit = (record) => {
        router.visit(RouteList.editPackageAttributeCategory(record.id));
    };
    const handleDelete = (record) => {
        router.delete(
            route("attribute-categories.destroy", {
                attribute_category: record.id,
            }),
        );
    };

    const pagePermissions = {
        edit: "edit-attribute-category",
        delete: "destroy-attribute-category",
        add: "create-attribute-category",
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
                title="Test Categories"
                addAction={RouteList.createPackageAttributeCategory()}
                addName={"Add Test Category"}
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

AttributeCategoriesIndexPage.layout = (page) => (
    <AdminLayout>{page}</AdminLayout>
);
