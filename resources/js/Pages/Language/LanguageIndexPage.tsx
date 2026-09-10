import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { ActiveLabel } from "@/enum/ActiveLabel.enum";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Button, Flex } from "antd";
import React, { useEffect, useState } from "react";

export default function LanguagesIndexPage({ languages }: { languages?: any }) {
    const [data, setData] = useState(languages?.data || []);

    const handleEdit = (e: any) => {
        const url = RouteList.editLanguage(e.id); // Adjust this name
        router.visit(url);
    };

    useEffect(() => {
        setData(languages?.data || []);
    }, [languages]);

    const handleDelete = (id: any) => {
        router.delete(route("languages.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                // re-fetch only the categories prop from the controller
                router.reload({ only: ["languages"] });
            },
        });
    };
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Code", dataIndex: "code", key: "code" },
        { title: "Name", dataIndex: "name", key: "name" },
        {
            title: "Is Active",
            dataIndex: "is_active",
            render: (text) => ActiveLabel(text),
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
                title="Languages"
                addAction={RouteList.createLanguage()}
                addName={"Add Language"}
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
LanguagesIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
