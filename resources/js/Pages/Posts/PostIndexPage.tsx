import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Button, Flex } from "antd";
import React, { useEffect, useState } from "react";

export default function IndexPosts({ posts = [] }) {
    const [data, setData] = useState(posts);

    const handleEdit = (e) => {
        const url = RouteList.editPost(e.id); // Adjust this name
        router.visit(url);
    };

    useEffect(() => {
        setData(posts);
    }, [posts]);

    const handleDelete = (id) => {
        router.delete(route("posts.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                // re-fetch only the categories prop from the controller
                router.reload({ only: ["posts"] });
            },
        });
    };
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Title", dataIndex: "title", key: "title" },
        // {
        //     title: "Categories",
        //     dataIndex: "categories",
        //     key: "categories",
        //     render: (categories) => categories.map((c) => c.name).join(", "),
        // },
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
                title="Posts"
                addAction={"/posts/create"}
                addName={"Add Post"}
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
IndexPosts.layout = (page) => <AdminLayout>{page}</AdminLayout>;
