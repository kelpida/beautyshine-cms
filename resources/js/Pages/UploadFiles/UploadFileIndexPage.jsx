import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { List, Card, Button, Switch, Masonry, Input, Pagination } from "antd";
import {
    AppstoreOutlined,
    BarsOutlined,
    FileOutlined,
} from "@ant-design/icons";
import PageHeaderActions from "@/Components/PageHeaderActions";
import MediaUploadFileModal from "./MediaUploadFileModal";

export default function UploadFilesPage({ files }) {
    const [viewMode, setViewMode] = useState("grid"); // grid | list
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [openModal, setOpenModal] = useState(false);
    const pageSize = 16;

    const isImage = (file) => file.mime_type?.startsWith("image/");
    const filteredFiles = files.data.filter((file) =>
        file.name.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedFiles = filteredFiles.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    return (
        <div style={{ padding: 20 }}>
            <MediaUploadFileModal
                show={openModal}
                onClose={() => setOpenModal(false)}
            />
            <PageHeaderActions title="Files">
                <Button
                    type="primary"
                    onClick={() => {
                        setOpenModal(true);
                    }}
                >
                    Upload New File
                </Button>
            </PageHeaderActions>

            {/* Toggle */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <Input.Search
                    placeholder="Search files by name"
                    allowClear
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1); // reset page on search
                    }}
                    style={{ maxWidth: 300, marginBottom: 16 }}
                />
                <Switch
                    checkedChildren={<AppstoreOutlined />}
                    unCheckedChildren={<BarsOutlined />}
                    checked={viewMode === "grid"}
                    onChange={(checked) =>
                        setViewMode(checked ? "grid" : "list")
                    }
                />
            </div>

            {/* Grid Mode */}
            {viewMode === "grid" ? (
                <Masonry
                    columns={4}
                    gutter={16}
                    items={paginatedFiles.map((file, index) => ({
                        key: `item-${index}`,
                        data: file,
                    }))}
                    itemRender={({ data }) => (
                        <Card hoverable>
                            {isImage(data) ? (
                                <img
                                    alt={data.name}
                                    src={data.url}
                                    loading="lazy"
                                    style={{
                                        width: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        height: 150,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "#f0f0f0",
                                    }}
                                >
                                    <FileOutlined />{" "}
                                    {data.extension?.toUpperCase()}
                                </div>
                            )}
                        </Card>
                    )}
                />
            ) : (
                // List Mode
                <List
                    itemLayout="horizontal"
                    dataSource={paginatedFiles}
                    renderItem={(file) => (
                        <List.Item
                            actions={[
                                <Button type="link" size="small">
                                    Download
                                </Button>,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    isImage(file) ? (
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                objectFit: "cover",
                                                borderRadius: 4,
                                            }}
                                        />
                                    ) : (
                                        <FileOutlined
                                            style={{ fontSize: 32 }}
                                        />
                                    )
                                }
                                title={file.name}
                                description={`${file.size} KB`}
                            />
                        </List.Item>
                    )}
                />
            )}
            <div
                className="pagination-container d-flex justify-content-center mt-5"
                style={{ marginTop: 24, textAlign: "center" }}
            >
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredFiles.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
}

UploadFilesPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
