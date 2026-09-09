import DraggableTable from "@/Components/DraggableTable";
import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { router, usePage } from "@inertiajs/react";
import { Button, Flex } from "antd";
import React, { useEffect, useState } from "react";

export default function PageIndexPage({ pages = [] }) {
    const [data, setData] = useState(pages?.data || []);
    const { auth } = usePage().props;

    const handleEdit = (e) => {
        const url = RouteList.editPage(e.id); // Adjust this name
        router.visit(url);
    };

    useEffect(() => {
        setData(pages.data || []);
    }, [pages]);

    const handleDelete = (id) => {
        router.delete(route("pages.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                // re-fetch only the categories prop from the controller
                router.reload({ only: ["pages"] });
            },
        });
    };
    const columns =
        auth?.user?.role?.id == 1
            ? [
                  { title: "ID", dataIndex: "id", key: "id" },
                  { title: "Title", dataIndex: "title", key: "title" },
                  {
                      title: "Page Name",
                      dataIndex: "page_name",
                      key: "page_name",
                  },
                  {
                      title: "Actions",
                      key: "actions",
                      render: (text, record) => (
                          <Flex gap={3}>
                              <Button
                                  color="primary"
                                  variant="solid"
                                  onClick={() => handleEdit(record)}
                              >
                                  Edit
                              </Button>
                              <Button
                                  color="danger"
                                  variant="solid"
                                  onClick={() => handleDelete(record)}
                              >
                                  Delete
                              </Button>
                          </Flex>
                      ),
                  },
              ]
            : [
                  { title: "ID", dataIndex: "id", key: "id" },
                  { title: "Title", dataIndex: "title", key: "title" },
                  {
                      title: "Actions",
                      key: "actions",
                      render: (text, record) => (
                          <Flex gap={3}>
                              <Button
                                  color="primary"
                                  variant="solid"
                                  onClick={() => handleEdit(record)}
                              >
                                  Edit
                              </Button>
                          </Flex>
                      ),
                  },
              ];
    return (
        <div>
            <PageHeaderActions
                title="Website Pages"
                addAction={RouteList.createPage()}
                addName={"Add Page"}
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
PageIndexPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
