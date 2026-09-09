import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router, usePage } from "@inertiajs/react";
import { Button, Flex, Tag } from "antd";
import React, { useEffect, useState } from "react";

export default function BlockContentIndexPage({ blockContents = [] }) {
    const [data, setData] = useState(blockContents?.data || []);
    const { auth } = usePage().props;

    const handleEdit = (record) => {
        router.visit(route("block-contents.edit", record.id));
    };

    useEffect(() => {
        setData(blockContents.data || []);
    }, [blockContents]);

    const handleDelete = (record) => {
        router.delete(route("block-contents.destroy", record.id), {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ["blockContents"] });
            },
        });
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id", width: 80 },
        { title: "Title", dataIndex: "title", key: "title" },
        {
            title: "Component",
            dataIndex: "component_name",
            key: "component_name",
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: "Page",
            key: "page",
            render: (_, record) => (
                <span>{record.page?.page_name || "N/A"}</span>
            ),
        },
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
                    {auth?.user?.role?.id == 1 && (
                        <Button
                            color="danger"
                            variant="solid"
                            onClick={() => handleDelete(record)}
                        >
                            Delete
                        </Button>
                    )}
                </Flex>
            ),
        },
    ];

    return (
        <div>
            <PageHeaderActions
                title="Block Contents"
                addAction={route("block-contents.create")}
                addName={"Add Block Content"}
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

BlockContentIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
