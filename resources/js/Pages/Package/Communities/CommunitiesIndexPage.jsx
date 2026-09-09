import React, { useEffect, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { Button, Flex } from "antd";
import { router } from "@inertiajs/react";
import PageHeaderActions from "@/Components/PageHeaderActions";
import DraggableTable from "@/Components/DraggableTable";
import TableButtonAction from "@/Components/TableButtonAction";

export default function CommunitiesIndexPage({ communities }) {
    const [data, setData] = useState(communities?.data);
    useEffect(() => {
        setData(communities?.data);
    }, [communities]);

    const handleEdit = (e) => {
        const url = RouteList.editCommunity(e.id); // Adjust this name
        router.visit(url);
    };
    const handleDelete = (record) => {
        router.delete(route("communities.destroy", { community: record.id }));
    };
    const pagePermissions = {
        edit: "edit-community",
        delete: "delete-community",
    };
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Title", dataIndex: "name", key: "name" },
        {
            title: "Country",
            dataIndex: "country",
            key: "country",
            render: (text, record) => record.country.name,
        },
        {
            title: "City",
            dataIndex: "city",
            key: "city",
            render: (text, record) => record.city.name,
        },
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
                title="Communities"
                addAction={RouteList.createCommunity()}
                addName={"Add Community"}
                pagePermissions={pagePermissions}
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

CommunitiesIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
