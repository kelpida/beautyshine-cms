import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import TableButtonAction from "@/Components/TableButtonAction";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import { Button, Flex } from "antd";
import { useEffect, useState } from "react";

export default function CitiesIndexPage({ cities = [] }) {
    const [data, setData] = useState(cities.data);
    const handleEdit = (record) => {
        router.visit(RouteList.editCity(record.id));
    };

    const handleDelete = (record) => {
        router.delete(route("cities.destroy", { city: record.id }));
    };

    useEffect(() => {
        setData(cities.data);
    }, [cities]);

    const pagePermissions = {
        edit: "edit-property-city",
        delete: "delete-property-city",
    };
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Title", dataIndex: "name", key: "name" },
        {
            title: "Country",
            dataIndex: "country",
            render: (text, record) => record.country?.name || "N/A",
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
                title="Cities"
                addAction={RouteList.createCity()}
                addName={"Add City"}
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

CitiesIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
