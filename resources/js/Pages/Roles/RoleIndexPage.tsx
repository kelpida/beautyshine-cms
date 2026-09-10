import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Button, Flex } from "antd";
import React, { useEffect, useState } from "react";

export default function IndexRolesPage({ roles }: { roles?: any }) {
    const [data, setData] = useState(roles?.roles || roles?.data || roles || []);
    const handleEdit = (e: any) => {
        const url = RouteList.editRole(e.id); // Adjust this name
        router.visit(url);
    };

    const handleDelete = (record: any) => {
        router.delete(route("roles.destroy", record.id), {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ["roles"] });
            },
        });
    };

    useEffect(() => {
        setData(roles?.roles || roles?.data || roles || []);
    }, [roles]);
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
                title="Roles"
                addAction={RouteList.createRole()}
                addName={"Add Roles"}
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
IndexRolesPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
