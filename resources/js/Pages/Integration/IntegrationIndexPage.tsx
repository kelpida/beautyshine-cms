import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import React from "react";
import { RouteList } from "@/routes/RouteList";
import DraggableTable from "@/Components/DraggableTable";
import TableButtonAction from "@/Components/TableButtonAction";
import { router } from "@inertiajs/react";
import { ActiveLabel } from "@/enum/ActiveLabel.enum";

export default function IntegrationIndexPage({ integrations }) {
    const [data, setData] = React.useState(integrations.data);

    const handleEdit = (record) => {
        router.visit(RouteList.editIntegration(record.id));
    };

    const handleDelete = (id) => {
        router.delete(route("integrations.destroy", id), {
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
        },
        {
            title: "Active",
            key: "is_enabled",
            render: (text, render) => ActiveLabel(render.is_enabled),
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
                title="Integrations"
                addAction={RouteList.createIntegration()}
                addName={"Add Integration"}
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

IntegrationIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
