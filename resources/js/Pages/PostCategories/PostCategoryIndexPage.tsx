import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Button, Flex } from "antd";
import React, { useEffect, useState } from "react";

export default function PostCategoriesPage({
    categories,
}: {
    categories?: any;
}) {
    const [categoriesData, setCategoriesData] = useState(
        categories?.data || categories || [],
    );

    const handleEdit = (e: any) => {
        const url = RouteList.editPostCategory(e.id); // Adjust this name
        router.visit(url);
    };

    useEffect(() => {
        setCategoriesData(categories?.data || categories || []);
    }, [categories]);

    const handleDelete = (id: any) => {
        router.delete(route("post-categories.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                // re-fetch only the categories prop from the controller
                router.reload({ only: ["categories"] });
            },
        });
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Parent Category", dataIndex: "parent_id", key: "parent_id" },
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
                title="Post Categories"
                addAction={RouteList.createPostCategory()}
                addName={"Add Category"}
            />

            <DraggableTable
                dataSource={categoriesData}
                setDataSource={setCategoriesData}
                columns={columns}
                rowKey="id"
                onOrderChange={(newData) => console.log(newData)}
            />
        </div>
    );
}
PostCategoriesPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
