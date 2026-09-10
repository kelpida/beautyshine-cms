import React, { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import PageHeaderActions from "@/Components/PageHeaderActions";
import DraggableTable from "@/Components/DraggableTable";
import TableButtonAction, { Action } from "@/Components/TableButtonAction";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { CopyOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import ImportFileModal from "@/Components/ImportFileModal";
import TableFilter from "@/Components/TableFilter";
import { ActiveLabel } from "@/enum/ActiveLabel.enum";

function PackagesIndexPage({ packages }: { packages?: any }) {
    const [data, setData] = useState(packages?.data || []);
    const [open, setOpen] = useState(false);
    const { filters = {} } = usePage().props;

    const { getColumnSearchProps } = TableFilter({
        router,
        routeName: "packages.index",
        extraParams: {},
    });
    useEffect(() => {
        setData(packages?.data || []);
    }, [packages]);

    const handleEdit = (e: any) => {
        const url = RouteList.editPackage(e.id);
        router.visit(url);
    };

    const handleDelete = (id: any) => {
        router.delete(route("packages.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                // re-fetch only the categories prop from the controller
                router.reload({ only: ["packages"] });
            },
        });
    };

    const handleImportPackages = () => {
        setOpen(true);
    };

    const handleDuplicate = (id: any) => {
        router.post(
            route("packages.duplicate", id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ["packages"] });
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
            title: "Ref. Number",
            dataIndex: "number",
            key: "number",
            width: 150,
            ...getColumnSearchProps("number"),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            width: 300,
            ...getColumnSearchProps("name"),
        },
        {
            title: "Test Categories",
            dataIndex: "test_categories",
            key: "test_categories",
            width: 250,
        },
        {
            title: "Package Categories",
            dataIndex: "package_categories",
            key: "package_categories",
            width: 250,
        },
        {
            title: "Package Status",
            dataIndex: "package_status",
            key: "package_status",
            width: 150,
        },
        {
            title: "Age Group",
            dataIndex: "age_group",
            key: "age_group",
            width: 150,
            ...getColumnSearchProps("age_group"),
        },
        {
            title: "Price",
            key: "price",
            width: 150,
            render: (_, record) => `€${record.price}`,
        },
        {
            title: "Featured",
            render: (text, record) => ActiveLabel(record.is_featured),
            key: "is_featured",
            width: 150,
        },
        {
            title: "Created At",
            render: (text, record) =>
                new Date(record.created_at).toLocaleDateString("en-GB"),
            key: "created_at",
            width: 200,
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
                        <Action permission={pagePermissions.add}>
                            <Tooltip title="Duplicate">
                                <Button
                                    variant="solid"
                                    color="purple"
                                    onClick={() => handleDuplicate(record.id)}
                                    icon={<CopyOutlined />}
                                />
                            </Tooltip>
                        </Action>
                    }
                />
            ),
        },
    ];
    return (
        <>
            <ImportFileModal open={open} setOpen={setOpen} />
            <div>
                <PageHeaderActions
                    title="Packages"
                    addAction={RouteList.createPackage()}
                    addName={"Add Package"}
                    permissions={pagePermissions}
                    children={
                        <Button
                            type="primary"
                            onClick={() => handleImportPackages()}
                            icon={<UploadOutlined />}
                        >
                            Import Packages
                        </Button>
                    }
                />
                <DraggableTable
                    dataSource={data}
                    setDataSource={setData}
                    columns={columns}
                    rowKey="id"
                    onOrderChange={(newData) => console.log(newData)}
                    paginationMeta={packages.meta}
                    paginationRoute={route("packages.index")}
                    paginationParams={filters}
                />
            </div>
        </>
    );
}

export default PackagesIndexPage;

PackagesIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
