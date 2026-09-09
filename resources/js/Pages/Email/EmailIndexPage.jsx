import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import React from "react";
import { RouteList } from "@/routes/RouteList";
import DraggableTable from "@/Components/DraggableTable";
import TableButtonAction from "@/Components/TableButtonAction";
import { router } from "@inertiajs/react";
import { EmailLabel } from "@/enum/EmailLabel.enum";
import { ActiveLabel } from "@/enum/ActiveLabel.enum";

export default function EmailIndexPage({ emails }) {
    const [data, setData] = React.useState(emails.data);

    const handleEdit = (record) => {
        router.visit(RouteList.editEmail(record.id));
    };

    const handleDelete = (id) => {
        router.delete(route("emails.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                // re-fetch only the categories prop from the controller
                router.reload({ only: ["emails"] });
            },
        });
    };

    const pagePermissions = {
        edit: "edit-email",
        delete: "delete-emails",
        add: "store-email",
    };

    const columns = [
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Type",
            key: "type",
            render: (text, record) => EmailLabel[record?.type],
        },
        {
            title: "Active",
            key: "is_active",
            render: (text, record) => ActiveLabel(record?.is_active),
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
                title="Emails"
                addAction={RouteList.createEmail()}
                addName={"Add Email"}
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

EmailIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
