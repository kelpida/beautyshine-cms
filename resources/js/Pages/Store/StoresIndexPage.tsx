import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { PlusOutlined } from "@ant-design/icons";
import { router } from "@inertiajs/react";
import { Button, Flex } from "antd";
import React, { useEffect, useState } from "react";
import StoreCreateModal from "./components/StoreCreateModal";

export default function StoresIndexPage({ stores }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState(stores?.data || stores || []);
    const handleEdit = (e: any) => {
        const url = RouteList.editStore(e.id);
        router.visit(url);
    };

    const handleDelete = (record: any) => {
        if (window.confirm("Are you sure you want to delete this store?")) {
            router.delete(RouteList.deleteStore(record.id));
        }
    };

    useEffect(() => {
        setData(stores?.data || stores || []);
    }, [stores]);
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Store Name", dataIndex: "name", key: "name" },
        { title: "Address", dataIndex: "address", key: "address" },
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
            <StoreCreateModal isOpen={isOpen} setIsOpen={setIsOpen} />
            <PageHeaderActions title="Stores">
                <Button
                    {...({ permission: "store-store" } as any)}
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={() => setIsOpen(true)}
                >
                    Add Store
                </Button>
            </PageHeaderActions>
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
StoresIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
