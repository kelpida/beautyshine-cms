import React, { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import PageHeaderActions from "@/Components/PageHeaderActions";
import DraggableTable from "@/Components/DraggableTable";
import TableButtonAction from "@/Components/TableButtonAction";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { CopyOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import ImportFileModal from "@/Components/ImportFileModal";
import TableFilter from "@/Components/TableFilter";
import { ActiveLabel } from "@/enum/ActiveLabel.enum";
import { PublicStatusLabels } from "@/enum/PublicStatus.enum";

function PropertiesIndexPage({ properties }: { properties?: any }) {
    const [data, setData] = useState(properties.data);
    const [open, setOpen] = useState(false);
    const { filters = {} } = usePage().props;

    const { getColumnSearchProps } = TableFilter({
        router,
        routeName: "properties.index",
        extraParams: {},
    });
    useEffect(() => {
        setData(properties.data);
    }, [properties]);

    const handleEdit = (e) => {
        const url = RouteList.editProperty(e.id); // Adjust this name
        router.visit(url);
    };

    const handleDelete = (id) => {
        router.delete(route("properties.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                // re-fetch only the categories prop from the controller
                router.reload({ only: ["properties"] });
            },
        });
    };

    const handleImportProperties = () => {
        setOpen(true);
    };

    const handleDuplicate = (id: any) => {
        router.post(
            route("properties.duplicate", id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // re-fetch only the categories prop from the controller
                    router.reload({ only: ["properties"] });
                },
            }
        );
    };
    const pagePermissions = {
        edit: "edit-property",
        delete: "delete-property",
        add: "create-property",
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id", fixed: "left", width: 50 },
        {
            title: "Ref Number",
            dataIndex: "ref_number",
            key: "ref_number",
            width: 200,
            ...getColumnSearchProps("ref_number"),
        },
        {
            title: "Title",
            dataIndex: "name",
            key: "name",
            width: 400,
            ...getColumnSearchProps("name"),
        },
        {
            title: "Price",
            key: "price",
            width: 150,
            render: (_, record) =>
                record.discount_price ? (
                    <>
                        <span className="line-through text-red-600">
                            € {record.price}
                        </span>
                        <br />
                        <span>€ {record.discount_price}</span>
                    </>
                ) : (
                    <>€ {record.price}</>
                ),
        },
        {
            title: "Country",
            dataIndex: "country",
            key: "country",
            width: 150,
            ...getColumnSearchProps("country"),
        },
        {
            title: "City",
            dataIndex: "city",
            key: "city",
            width: 150,
            ...getColumnSearchProps("city"),
        },
        {
            title: "Developer",
            dataIndex: "developer",
            key: "developer",
            width: 150,
            ...getColumnSearchProps("developer"),
        },
        {
            title: "Featured",
            render: (text, record) => ActiveLabel(record.is_featured),
            key: "is_featured",
            width: 150,
        },
        {
            title: "Exclusive",
            render: (text, record) => ActiveLabel(record.exclusive),
            key: "exclusive",
            width: 150,
        },
        {
            title: "Public Status",
            render: (text, record) => PublicStatusLabels[record.public_status],
            dataIndex: "public_status",
            key: "public_status",
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
                    deleteAction={() => handleDelete(record)}
                    pagePermissions={pagePermissions}
                    children={
                        <Tooltip title="Duplicate">
                            <Button
                                variant="solid"
                                color="purple"
                                onClick={() => handleDuplicate(record.id)}
                                icon={<CopyOutlined />}
                            />
                        </Tooltip>
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
                    title="Properties"
                    addAction={RouteList.createProperty()}
                    addName={"Add Package"}
                    permissions={pagePermissions}
                    children={
                        <Button
                            type="primary"
                            onClick={() => handleImportProperties()}
                            icon={<UploadOutlined />}
                        >
                            Import Properties
                        </Button>
                    }
                />
                <DraggableTable
                    dataSource={data}
                    setDataSource={setData}
                    columns={columns}
                    rowKey="id"
                    onOrderChange={(newData) => console.log(newData)}
                    paginationMeta={properties.meta}
                    paginationRoute={route("properties.index")}
                    paginationParams={filters}
                />
            </div>
        </>
    );
}

export default PropertiesIndexPage;

PropertiesIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
