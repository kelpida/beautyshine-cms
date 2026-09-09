import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import DraggableTable from "@/Components/DraggableTable";
import { RouteList } from "@/routes/RouteList";
import { useState, useEffect } from "react";
import { Button, Flex } from "antd";
import { router } from "@inertiajs/react";

export default function AttributeCategoriesIndexPage({
    attributeCategories = [],
}) {
    const [data, setData] = useState(attributeCategories.data ?? []);
    useEffect(() => {
        setData(attributeCategories.data ?? []);
    }, [attributeCategories]);

    const handleEdit = (record) => {
        router.visit(RouteList.editPropertyAttributeCategory(record.id));
    };
    const handleDelete = (record) => {
        router.visit(RouteList.deletePropertyAttributeCategory(record.id));
    };
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Title", dataIndex: "name", key: "name" },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <Flex gap={3}>
                    <Button
                        color="primary"
                        variant="solid"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
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
    return (
        <div>
            <PageHeaderActions
                title="Attribute Categories"
                addAction={RouteList.createPropertyAttributeCategory()}
                addName={"Add Attribute Category"}
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
