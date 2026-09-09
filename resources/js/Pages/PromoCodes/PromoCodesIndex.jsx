import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import TableButtonAction from "@/Components/TableButtonAction";
import TableFilter from "@/Components/TableFilter";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

export default function PromoCodesIndex({ promoCodes = [], filters }) {
    const [data, setData] = useState(promoCodes?.data || []);

    const { getColumnSearchProps } = TableFilter({
        router,
        routeName: "promo-codes.index",
        extraParams: {},
    });

    useEffect(() => {
        setData(promoCodes?.data || []);
    }, [promoCodes]);

    const handleEdit = (e) => {
        router.visit(RouteList.editPromoCodes(e));
    };
    const handleDelete = (e) => {
        router.delete(RouteList.deletePromoCodes(e), {
            preserveScroll: true,
            onSuccess: () => {
                // re-fetch only the categories prop from the controller
                router.reload({ only: ["promoCodes"] });
            },
        });
    };

    const pagePermissions = {
        edit: "edit-promo-code",
        delete: "delete-promo-code",
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        {
            title: "Promo Code",
            dataIndex: "code",
            key: "code",
            ...getColumnSearchProps("code"),
        },
        { title: "Used Count", dataIndex: "used_count", key: "used_count" },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <TableButtonAction
                    editAction={() => handleEdit(record.id)}
                    deleteAction={() => handleDelete(record.id)}
                    pagePermissions={pagePermissions}
                />
            ),
        },
    ];
    return (
        <div>
            <PageHeaderActions
                title="Promo Codes"
                addAction={RouteList.createPromoCodes()}
                addName={"Add code"}
            />
            <DraggableTable
                dataSource={data}
                setDataSource={setData}
                columns={columns}
                rowKey="id"
                onOrderChange={(newData) => console.log(newData)}
                paginationMeta={promoCodes.meta}
                paginationRoute={route("promo-codes.index")}
                paginationParams={filters}
            />
        </div>
    );
}
PromoCodesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
