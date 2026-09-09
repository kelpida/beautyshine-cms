import DraggableTable from "@/Components/DraggableTable";
import ModalDeleteTransfer from "@/Components/ModalDeleteTransfer";
import PageHeaderActions from "@/Components/PageHeaderActions";
import TableButtonAction from "@/Components/TableButtonAction";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { SwapOutlined } from "@ant-design/icons";
import { router, usePage } from "@inertiajs/react";
import { Button, Flex, theme } from "antd";
import React, { useEffect, useState } from "react";

export default function UsersIndexPage({ users = [] }) {
    console.log("🚀 ~ UsersIndexPage ~ users:", users);
    const { auth, filters = {} } = usePage().props;
    const roleID = auth?.user?.role?.id;
    const { token } = theme.useToken();
    const [data, setData] = useState(users);
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const handleImpersonate = (user) => {
        router.post(`/users/${user.id}/impersonate`);
    };
    const handleEdit = (e) => {
        const url = RouteList.editUser(e.id); // Adjust this name
        router.visit(url, { user: e });
    };

    const pagePermissions = {
        edit: "edit-user",
        delete: "destroy-user",
        add: "store-user",
    };

    useEffect(() => {
        setData(users);
    }, [users]);

    const handleDelete = (user) => {
        setSelectedUser(user);
        setOpen(true);
    };
    const columns = [
        { title: "ID", dataIndex: "id", key: "id", width: "10%" },
        { title: "Name", dataIndex: "name", key: "name", width: "25%" },
        { title: "Email", dataIndex: "email", key: "email", width: "25%" },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (_, record) => record?.role?.name,
            width: "20%",
        },
        {
            title: "Actions",
            key: "actions",
            width: "20%",
            render: (text, record) => (
                <TableButtonAction
                    editAction={() => handleEdit(record)}
                    deleteAction={() => handleDelete(record)}
                    pagePermissions={pagePermissions}
                >
                    {(auth?.user?.role?.name === "super-admin" ||
                        roleID === 1) &&
                        auth?.user?.id !== record.id && (
                            <Button
                                type="default"
                                icon={<SwapOutlined />}
                                style={{
                                    color: "#ffffff",
                                    backgroundColor: token.colorWarning,
                                    borderColor: token.colorWarning,
                                }}
                                onClick={() => handleImpersonate(record)}
                            >
                                Switch
                            </Button>
                        )}
                </TableButtonAction>
            ),
        },
    ];
    return (
        <div>
            <ModalDeleteTransfer
                open={open}
                setOpen={setOpen}
                router={router}
                deleteRoute={
                    selectedUser
                        ? route("users.destroy", selectedUser.id)
                        : null
                }
                data={
                    selectedUser
                        ? data.filter((u) => u.id !== selectedUser.id)
                        : []
                }
            />
            <PageHeaderActions
                title="Users"
                addAction={RouteList.createUser()}
                addName={"Add User"}
                pagePermissions={{ add: "store-user" }}
            />
            <DraggableTable
                dataSource={data.data}
                setDataSource={setData}
                columns={columns}
                rowKey="id"
                onOrderChange={(newData) => console.log(newData)}
                paginationMeta={data.meta}
                paginationRoute={route("users.index")}
                paginationParams={filters}
            />
        </div>
    );
}
UsersIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
