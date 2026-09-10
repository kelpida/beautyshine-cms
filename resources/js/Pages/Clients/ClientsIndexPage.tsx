import React, { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import PageHeaderActions from "@/Components/PageHeaderActions";
import DraggableTable from "@/Components/DraggableTable";
import TableButtonAction from "@/Components/TableButtonAction";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import TableFilter from "@/Components/TableFilter";
import { SendOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

function ClientsIndexPage({ clients }: { clients?: any }) {
    const [data, setData] = useState(clients?.data || []);
    const { filters = {} } = usePage().props;

    const { getColumnSearchProps } = TableFilter({
        router,
        routeName: "clients.index",
        extraParams: {},
    });
    useEffect(() => {
        setData(clients?.data || []);
    }, [clients]);

    const handleEdit = (e: any) => {
        const url = RouteList.editClient(e.id);
        router.visit(url);
    };

    const handleDelete = (id: any) => {
        router.delete(route("clients.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ["clients"] });
            },
        });
    };
    const handleResetEmailVerification = (id: any) => {
        router.post(
            route("clients.verification", id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ["clients"] });
                },
                onError: (errors) => {
                    console.error(errors);
                },
            }
        );
    };

    const pagePermissions = {
        edit: "edit-package",
        delete: "destroy-package",
        add: "store-package",
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id", fixed: "left", width: 50 },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            width: 250,
            ...getColumnSearchProps("name"),
        },
        {
            title: "Surname",
            dataIndex: "surname",
            key: "surname",
            width: 250,
            ...getColumnSearchProps("surname"),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 150,
            ...getColumnSearchProps("email"),
        },
        {
            title: "Created At",
            render: (text, record) =>
                new Date(record.created_at).toLocaleDateString("en-GB"),
            key: "created_at",
            width: 150,
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 120,
            render: (text, record) => (
                <TableButtonAction
                    editAction={() => handleEdit(record)}
                    deleteAction={() => handleDelete(record.id)}
                    pagePermissions={pagePermissions}
                    children={
                        <Tooltip title="Resent Verification">
                            <Button
                                color="orange"
                                variant="solid"
                                icon={<SendOutlined />}
                                onClick={() =>
                                    handleResetEmailVerification(record.id)
                                }
                            />
                        </Tooltip>
                    }
                />
            ),
        },
    ];
    return (
        <>
            <div>
                <PageHeaderActions
                    title="Clients"
                    addAction={RouteList.createClients()}
                    addName={"Add Client"}
                    permissions={pagePermissions}
                />
                <DraggableTable
                    dataSource={data}
                    setDataSource={setData}
                    columns={columns}
                    rowKey="id"
                    onOrderChange={(newData) => console.log(newData)}
                    paginationMeta={clients.meta}
                    paginationRoute={route("clients.index")}
                    paginationParams={filters}
                />
            </div>
        </>
    );
}

export default ClientsIndexPage;

ClientsIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
