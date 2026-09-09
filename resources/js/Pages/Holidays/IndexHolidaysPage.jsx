import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import TableButtonAction from "@/Components/TableButtonAction";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { PlusOutlined } from "@ant-design/icons";
import { router } from "@inertiajs/react";
import { Button, Flex } from "antd";
import React, { useEffect, useState } from "react";

export default function IndexHolidaysPage(holidays = []) {
    const [data, setData] = useState(holidays.holidays);

    const handleEdit = (e) => {
        const url = RouteList.editStore(e.id); // Adjust this name
        router.visit(url);
    };

    useEffect(() => {
        setData(holidays.holidays);
    }, [holidays]);

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Open Time", dataIndex: "open_time", key: "open_time" },
        { title: "Close Time", dataIndex: "close_time", key: "close_time" },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <TableButtonAction editAction={() => handleEdit(record.id)} />
            ),
        },
    ];
    return (
        <div>
            <PageHeaderActions
                title="Holidays"
                addName={"Create Holiday"}
                addAction={RouteList.createHolidays()}
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
IndexHolidaysPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
