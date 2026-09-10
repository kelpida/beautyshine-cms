import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import React from "react";
import DraggableTable from "@/Components/DraggableTable";
import { RouteList } from "@/routes/RouteList";
import { useState, useEffect } from "react";
import { Button, Flex } from "antd";
import { router } from "@inertiajs/react";
import TableButtonAction from "@/Components/TableButtonAction";

export default function TypesIndexPage({
    propertyTypes,
}: {
    propertyTypes?: any;
}) {
    const [data, setData] = useState(
        propertyTypes?.data || propertyTypes || [],
    );
    useEffect(() => {
        setData(propertyTypes?.data || propertyTypes || []);
    }, [propertyTypes]);

    const handleEdit = (e: any) => {
        router.visit(RouteList.editPropertyType(e.id));
    };
    const handleDelete = (record: any) => {
        router.delete(RouteList.deletePropertyType(record.id));
    };

    const pagePermissions = {
        edit: "edit-type",
        delete: "delete-type",
        add: "create-type",
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
                title="Types"
                addAction={RouteList.createPropertyType()}
                addName={"Add Type"}
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

TypesIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
