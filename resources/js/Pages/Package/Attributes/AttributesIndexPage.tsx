import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import DraggableTable from "@/Components/DraggableTable";
import { RouteList } from "@/routes/RouteList";
import { useState, useEffect } from "react";
import TableButtonAction from "@/Components/TableButtonAction";
import { router } from "@inertiajs/react";
import { InputTypeName } from "@/enum/InputType.enum";

export default function AttributesIndexPage({
    attributes,
}: {
    attributes?: any;
}) {
    const [data, setData] = useState(attributes?.data || attributes || []);

    const pagePermissions = {
        edit: "edit-package-attribute",
        delete: "delete-package-attribute",
    };

    const handleEdit = (record: any) => {
        router.visit(RouteList.editPackageAttribute(record.id));
    };
    const handleDelete = (record: any) => {
        router.delete(RouteList.deletePackageAttribute(record.id));
    };

    useEffect(() => {
        setData(attributes?.data || attributes || []);
    }, [attributes]);

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Title", dataIndex: "name", key: "name" },
        {
            title: "Category",
            render: (text, record) => record.attribute_category.name,
            key: "attribute_category",
        },
        {
            title: "Type",
            render: (text, record) => InputTypeName[record.type],
            key: "type",
        },
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
                title="Tests"
                addAction={RouteList.createPackageAttribute()}
                addName={"Add Test"}
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

AttributesIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
