import React, { useEffect, useState } from "react";
import {
    Modal,
    Button,
    Image,
    Checkbox,
    Row,
    Col,
    Divider,
    Masonry,
    Pagination,
    Input,
} from "antd";
import MultiFileUpload from "./Form/MultiFileUpload";

export default function MediaSelectorModal({
    visible,
    onClose,
    onSelect,
    existingImages = [], // Optional: preload from server
    maxCount = 1,
    title = "Images",
    accept = "image/*",
}) {
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const pageSize = 12;

    const filteredImages = existingImages.filter((image) =>
        image.name.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedImages = filteredImages.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    useEffect(() => {
        if (visible) {
            setPage(1);
        }
    }, [visible]);

    const handleImageToggle = (image) => {
        const isSelected = selectedImages.find((img) => img.id === image.id);
        if (isSelected) {
            setSelectedImages((prev) =>
                prev.filter((img) => img.id !== image.id)
            );
        } else {
            const totalCount = selectedImages.length + uploadedImages.length;
            if (!maxCount || totalCount < maxCount) {
                setSelectedImages((prev) => [...prev, image]);
            }
        }
    };

    const handleConfirm = () => {
        const all = [...selectedImages, ...fileList]; // ✅ pass image objects
        onSelect(all);
        onClose();
    };

    const renderPreview = (image) => {
        const type = image.type || "image";
        switch (type) {
            case "image":
                return (
                    <Image
                        src={image?.url}
                        width="100%"
                        height={100}
                        style={{ objectFit: "cover" }}
                        preview={false}
                    />
                );
            case "video":
                return (
                    <video
                        src={image?.url}
                        style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                            backgroundColor: "#000",
                        }}
                    />
                );
            case "file":
            default:
                return (
                    <div
                        style={{
                            width: "100%",
                            height: "100px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f5f5f5",
                            flexDirection: "column",
                        }}
                    >
                        <div style={{ fontSize: "24px" }}>📄</div>
                        <div
                            style={{
                                fontSize: "10px",
                                textAlign: "center",
                                width: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                padding: "0 4px",
                            }}
                        >
                            {image.name}
                        </div>
                    </div>
                );
        }
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            onOk={handleConfirm}
            title={`Select or Upload ${title}`}
            width={800}
        >
            <Input.Search
                placeholder="Search images by name"
                allowClear
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); // reset pagination on search
                }}
                style={{ marginBottom: 16 }}
            />
            <Masonry
                columns={4}
                gutter={12}
                items={paginatedImages.map((image) => ({
                    key: image.id,
                    data: image,
                }))}
                itemRender={({ data: image }) => {
                    const isSelected = selectedImages.some(
                        (img) => img.id === image.id
                    );

                    return (
                        <div
                            style={{
                                border: isSelected
                                    ? "2px solid #1890ff"
                                    : "1px solid #eee",
                                padding: 4,
                                borderRadius: 6,
                                cursor: "pointer",
                                position: "relative",
                            }}
                            onClick={() => handleImageToggle(image)}
                        >
                            {renderPreview(image)}
                            <div style={{ marginTop: 4 }}>
                                <Checkbox checked={isSelected}>Select</Checkbox>
                            </div>
                        </div>
                    );
                }}
            />
            <div className="d-flex justify-content-center mt-3">
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={filteredImages.length}
                    onChange={(p) => setPage(p)}
                    style={{ marginTop: 16, textAlign: "center" }}
                />
            </div>

            {selectedImages.length < maxCount && (
                <>
                    <Divider>Or Upload New</Divider>
                    <MultiFileUpload
                        fileList={fileList}
                        setFileList={setFileList}
                        onChange={setUploadedImages}
                        accept={accept}
                        maxCount={
                            maxCount
                                ? Math.max(0, maxCount - selectedImages.length)
                                : undefined
                        }
                    />
                </>
            )}
        </Modal>
    );
}
