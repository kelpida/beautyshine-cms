import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import React from "react";
import { RouteList } from "@/routes/RouteList";
import DraggableTable from "@/Components/DraggableTable";
import TableButtonAction from "@/Components/TableButtonAction";
import { router } from "@inertiajs/react";
import { ActiveLabel } from "@/enum/ActiveLabel.enum";
import TableFilter from "@/Components/TableFilter";

export default function DevelopersIndexPage({ developers, filters }) {
    const [data, setData] = React.useState(developers.data);
    const { getColumnSearchProps } = TableFilter({
        router,
        routeName: "developers.index",
        extraParams: {},
    });

    const handleEdit = (record) => {
        router.visit(RouteList.editDeveloper(record.id));
    };

    const handleDelete = (id) => {
        router.delete(route("developers.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                // re-fetch only the categories prop from the controller
                router.reload({ only: ["integrations"] });
            },
        });
    };

    const pagePermissions = {
        edit: "edit-integration",
        delete: "delete-integration",
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            ...getColumnSearchProps("name"),
        },
        {
            title: "Surname",
            dataIndex: "surname",
            render: (text) => text ?? "N/A",
            key: "surname",
            ...getColumnSearchProps("surname"),
        },
        {
            title: "Company",
            dataIndex: "company",
            render: (text) => text ?? "N/A",
            key: "company",
            ...getColumnSearchProps("company"),
        },
        {
            title: "Email",
            dataIndex: "email",
            render: (text) => text ?? "N/A",
            key: "email",
            ...getColumnSearchProps("email"),
        },
        {
            title: "Phone",
            dataIndex: "phone",
            render: (text) => text ?? "N/A",
            key: "phone",
            ...getColumnSearchProps("phone"),
        },
        {
            title: "Actions",
            dataIndex: "actions",
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
                title="Developers"
                addAction={RouteList.createDeveloper()}
                addName={"Add Developer"}
            />
            <DraggableTable
                dataSource={data}
                setDataSource={setData}
                columns={columns}
                rowKey="id"
                onOrderChange={(newData) => console.log(newData)}
                paginationMeta={developers.meta}
                paginationRoute={route("developers.index")}
                paginationParams={filters}
            />
        </div>
    );
}

DevelopersIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
