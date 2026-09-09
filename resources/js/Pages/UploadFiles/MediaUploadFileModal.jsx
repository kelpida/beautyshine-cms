import MultiFileUpload from "@/Components/Form/MultiFileUpload";
import { Modal } from "antd";
import React, { useState } from "react";

export default function MediaUploadFileModal({ show, onClose }) {
    const [fileList, setFileList] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);

    return (
        <Modal
            title="Upload Files"
            open={show} // ✅ correct
            onCancel={onClose} // ✅ correct
            footer={null}
            destroyOnClose
        >
            <MultiFileUpload
                fileList={fileList}
                setFileList={setFileList}
                onChange={setUploadedImages}
                accept="image/*, .pdf, .docx, .xlsx"
            />
        </Modal>
    );
}
