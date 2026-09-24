import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import TableButtonAction from "@/Components/TableButtonAction";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router, usePage } from "@inertiajs/react";
import { Button, Flex, Space, Tag } from "antd";
import React, { useEffect, useState } from "react";

const sampleData = {
    title: "Sample Template",
    component_name: "sample_all_blocks",
    page_id: 1,
    content: [
        {
            id: `block-heading-${Date.now()}`,
            type: "heading",
            label: "Heading",
            content: {
                en: { text: "Heading Text" },
            },
        },
        {
            id: `block-text-${Date.now()}`,
            type: "text",
            label: "Text",
            content: {
                en: {
                    content: "<p>Text content</p>",
                },
            },
        },
        {
            id: `block-button-${Date.now()}`,
            type: "button",
            label: "Button",
            content: {
                en: {
                    text: "Click Here",
                    link: "/",
                    target: "_self",
                    style: "primary",
                },
            },
        },
        {
            id: `block-media-${Date.now()}`,
            type: "media",
            label: "Media",
            content: {
                en: {
                    caption: "Sample image",
                    image_id: null,
                },
            },
        },
        {
            id: `block-carousel-${Date.now()}`,
            type: "carousel",
            label: "Carousel",
            content: {
                en: {
                    slides: [
                        {
                            caption: "Slide 1",
                            description: "Desc",
                            image_id: null,
                        },
                    ],
                },
            },
        },
        {
            id: `block-list-${Date.now()}`,
            type: "list",
            label: "List",
            content: {
                en: {
                    items: ["Item 1", "Item 2"],
                },
            },
        },
        {
            id: `block-feature-${Date.now()}`,
            type: "feature",
            label: "Feature",
            content: {
                en: {
                    heading: "Title",
                    subheading: "Subtitle",
                    text: "Details",
                    button_text: "Action",
                    button_link: "#",
                    image_id: null,
                },
            },
        },
    ],
};

export default function BlockContentIndexPage({
    blockContents,
}: {
    blockContents?: any;
}) {
    const [data, setData] = useState(blockContents?.data || []);
    const { auth } = usePage().props as any;

    const handleEdit = (record: any) => {
        router.visit(route("block-contents.edit", record.id));
    };

    useEffect(() => {
        setData(blockContents.data || []);
    }, [blockContents]);

    const handleDelete = (record: any) => {
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
                <TableButtonAction
                    pagePermissions={{
                        edit: "block-content.edit",
                        delete: "block-content.destroy",
                    }}
                    editAction={() => handleEdit(record)}
                    deleteAction={() => handleDelete(record)}
                />
            ),
        },
    ];

    return (
        <div>
            <PageHeaderActions
                title="Block Contents"
                addAction={route("block-contents.create")}
                addName={"Add Block Content"}
                children={
                    <Space>
                        {auth?.user?.role?.id == 1 && (
                            <Button
                                onClick={() => {
                                    const blob = new Blob(
                                        [JSON.stringify(sampleData, null, 2)],
                                        { type: "application/json" },
                                    );
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = "sample-all-blocks.json";
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                Export Sample JSON
                            </Button>
                        )}
                    </Space>
                }
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
