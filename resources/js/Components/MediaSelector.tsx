import React, { useState } from "react";
import MediaSelectorModal from "./MediaSelectorModal";
import { Button, Image } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

export interface MediaSelectorProps {
    existingImages?: any[];
    maxCount?: number;
    setImages?: (files: any) => void;
    accept?: string;
    images?: any[];
    label?: string;
    placeholder?: string;
    buttonText?: string;
    [key: string]: any;
}

export default function MediaSelector({
    existingImages = [],
    maxCount,
    setImages,
    accept = "image/*",
    images = [],
    label = "Images",
    placeholder = "No images selected",
    buttonText,
}: MediaSelectorProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelect = (selectedImages) => {
        // Ensure limit: allow only `maxCount` images total
        const limited = selectedImages.slice(0, maxCount);
        setImages(limited);
    };

    const renderFileType = (img, idx) => {
        const type = img?.type || "image";
        const src = img?.url ?? img?.path;

        if (type === "image") {
            return (
                <Image
                    key={idx}
                    src={src}
                    alt={img?.name || `Image ${idx + 1}`}
                    style={{
                        width: "100%",
                        height: "140px",
                        objectFit: "cover",
                    }}
                    preview={true}
                />
            );
        }

        if (type === "video") {
            return (
                <video
                    key={idx}
                    src={src}
                    controls
                    style={{
                        width: "100%",
                        height: "140px",
                        objectFit: "cover",
                        backgroundColor: "#000",
                    }}
                />
            );
        }

        // Fallback for other files (e.g. PDF)
        return (
            <div
                key={idx}
                style={{
                    width: "100%",
                    height: "140px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #d9d9d9",
                    flexDirection: "column",
                    cursor: "pointer",
                }}
                onClick={() => window.open(src, "_blank")}
                title="Click to open file"
            >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📄</div>
                <div
                    style={{
                        fontSize: "12px",
                        padding: "0 8px",
                        textAlign: "center",
                        wordBreak: "break-all",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {img?.name || "File"}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="mb-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <label>{label}</label>
                    <Button
                        type="primary"
                        icon={
                            images?.length ? <EditOutlined /> : <PlusOutlined />
                        }
                        onClick={() => setModalVisible(true)}
                    >
                        {images?.length ? "Change" : "Select"} or Upload {label}
                    </Button>
                </div>

                {/* Image Grid Preview */}
                <div className="bg-white p-3 rounded shadow-sm border">
                    {images?.length ? (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fill, minmax(150px, 1fr))",
                                gap: "16px",
                            }}
                        >
                            <Image.PreviewGroup
                                preview={{
                                    toolbarRender: () => null,
                                } as any}
                            >
                                {images.map((img, idx) =>
                                    renderFileType(img, idx)
                                )}
                            </Image.PreviewGroup>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            {placeholder}
                        </div>
                    )}
                </div>
            </div>
            <MediaSelectorModal
                accept={accept}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={handleSelect}
                maxCount={maxCount}
                existingImages={existingImages}
                selectedImages={images}
                title={label}
            />
        </>
    );
}
