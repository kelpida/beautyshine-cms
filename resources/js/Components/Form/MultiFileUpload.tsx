import React, { useState, useEffect } from "react";
import { Upload, Modal, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { router, usePage } from "@inertiajs/react";

export interface MultiFileUploadProps {
    fileList?: any[];
    onChange?: (files: any) => void;
    accept?: string;
    multiple?: boolean;
    maxCount?: number;
    setFileList?: (files: any) => void;
    [key: string]: any;
}

export default function MultiFileUpload({
    fileList = [],
    onChange,
    accept = "image/*",
    multiple = true,
    maxCount,
    setFileList,
}: MultiFileUploadProps) {
    const [uploadedImages, setUploadedImages] = useState();
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
    // Sync props with local state
    useEffect(() => {
        setFileList(fileList);
    }, [fileList]);

    // Convert file to base64 (for preview)
    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(
            file.name || file.url?.substring(file.url.lastIndexOf("/") + 1)
        );
    };

    const handleChange = ({ fileList: newFileList }) => {
        // Ensure files have a proper `url` for preview after upload
        const normalizedList = newFileList.map((file) => {
            if (file.response && file.response.url) {
                return {
                    ...file,
                    url: file.response.url,
                };
            }
            return file;
        });

        const uploaded = newFileList
            .filter(
                (file) =>
                    file.status === "done" &&
                    file.response &&
                    file.response.data
            )
            .map((file) => file.response.data);
        setUploadedImages(normalizedList);
        setFileList(uploaded);
        onChange?.(normalizedList);
    };

    const isVideo = (url) => {
        if (!url) return false;
        const extension = url.split(".").pop().toLowerCase();
        return (
            ["mp4", "webm", "ogg", "mov"].includes(extension) ||
            url.startsWith("data:video")
        );
    };

    const isPdf = (url) => {
        if (!url) return false;
        const extension = url.split(".").pop().toLowerCase();
        return extension === "pdf" || url.startsWith("data:application/pdf");
    };

    return (
        <div className="flex justify-center">
            <Upload
                action={route("uploads.store")} // Laravel route name
                method="POST"
                name="file"
                headers={{
                    "X-CSRF-TOKEN": csrfToken,
                }}
                accept={accept}
                multiple={multiple}
                maxCount={maxCount}
                listType="picture-card"
                fileList={uploadedImages}
                onPreview={handlePreview}
                onChange={handleChange}
                beforeUpload={(file) => {
                    const isLt10M = file.size / 1024 / 1024 < 10;
                    if (!isLt10M) {
                        message.error("File must be smaller than 10MB!");
                    }
                    return isLt10M;
                }}
            >
                {(!maxCount || fileList.length < maxCount) && (
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                )}
            </Upload>

            <Modal
                open={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width={800}
            >
                {isVideo(previewImage) ? (
                    <video
                        style={{ width: "100%" }}
                        controls
                        src={previewImage}
                    />
                ) : isPdf(previewImage) ? (
                    <iframe
                        src={previewImage}
                        style={{ width: "100%", height: "500px" }}
                        frameBorder="0"
                    ></iframe>
                ) : (
                    <img
                        alt="preview"
                        style={{ width: "100%" }}
                        src={previewImage}
                    />
                )}
            </Modal>
        </div>
    );
}
