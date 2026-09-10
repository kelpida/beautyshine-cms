import React, { useEffect, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { Button, Flex } from "antd";
import { router } from "@inertiajs/react";
import PageHeaderActions from "@/Components/PageHeaderActions";
import DraggableTable from "@/Components/DraggableTable";
import TableButtonAction from "@/Components/TableButtonAction";

export default function CountriesIndexPage({ countries }) {
    const [data, setData] = useState(countries.data);
    useEffect(() => {
        setData(countries.data);
    }, [countries]);

    const handleEdit = (e) => {
        const url = RouteList.editCountry(e.id); // Adjust this name
        router.visit(url);
    };
    const handleDelete = (record) => {
        router.delete(route("countries.destroy", { country: record.id }));
    };
    const pagePermissions = {
        edit: "edit-property-country",
        delete: "delete-property-country",
    };
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Title", dataIndex: "name", key: "name" },
        {
            title: "Cities",
            key: "cities",
            render: (text, record) =>
                record.cities.map((city) => city.name).join(", "),
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
                title="Countries"
                addAction={RouteList.createCountry()}
                addName={"Add Country"}
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

CountriesIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
