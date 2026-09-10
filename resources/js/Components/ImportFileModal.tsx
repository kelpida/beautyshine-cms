import React, { useState } from "react";
import { Flex, Modal, Upload, message, Checkbox } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { router } from "@inertiajs/react";
import SelectField from "@/Components/Form/SelectField";
import {
    ImportType,
    ImportTypeArray,
    ImportTypeDescription,
    ImportTypeDescriptionList,
} from "@/enum/ImportType.enum";
import InputField from "./Form/InputField";

export default function ImportFileModal({ open, setOpen }) {
    const [fileList, setFileList] = useState([]);
    const [importTypeValue, setImportTypeValue] = useState(ImportType.API);
    const [apiUrl, setApiUrl] = useState("");
    const [updateExisting, setUpdateExisting] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setOpen(false);
        setApiUrl("");
        setFileList([]);
        setUpdateExisting(false);
    };

    const handleOk = () => {
        if (importTypeValue === ImportType.API) {
            if (!apiUrl) {
                message.error("Please enter an API URL");
                return;
            }

            setLoading(true);
            router.post(
                route("packages.import"),
                {
                    type: importTypeValue,
                    file: fileList,
                    update_existing: updateExisting ? 1 : 0,
                    api_url: apiUrl,
                },
                {
                    onSuccess: () => {
                        message.success("Import started successfully");
                        handleCancel();
                    },
                    onError: () => {
                        message.error("Import failed");
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                }
            );
        } else {
            // For FILE type, the upload component handles the submission
            setOpen(false);
        }
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
        setFileList(uploaded);
    };

    return (
        <Modal
            centered
            title="Import Packages"
            open={open}
            onCancel={handleCancel}
            onOk={handleOk}
            confirmLoading={loading}
            okText="Import"
        >
            <SelectField
                name="import_type"
                label="Import Type"
                options={ImportTypeArray}
                value={importTypeValue}
                onChange={(value) => setImportTypeValue(value.target.value)}
                className="mb-0"
            />
            <p className="small">{ImportTypeDescription[importTypeValue]}</p>
            <Flex
                justify="center"
                vertical
                align="center"
                gap={16}
                style={{ width: "100%" }}
            >
                {importTypeValue === ImportType.FILE && (
                    <>
                        <Upload
                            action={route("packages.import")} // Laravel route name
                            method="POST"
                            name="file"
                            accept=".xlsx, .xls, .csv, .json"
                            multiple={true}
                            maxCount={1}
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleChange}
                            beforeUpload={(file) => {
                                const isLt10M = file.size / 1024 / 1024 < 10;
                                if (!isLt10M) {
                                    message.error(
                                        "File must be smaller than 10MB!"
                                    );
                                }
                                return isLt10M;
                            }}
                        >
                            {(!1 || fileList.length < 1) && (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </>
                )}

                {importTypeValue === ImportType.API && (
                    <InputField
                        name="api_url"
                        label="API URL"
                        type="url"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="https://api.example.com/packages"
                    />
                )}

                <Checkbox
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                >
                    Update existing packages (matches by number or slug)
                </Checkbox>
            </Flex>
        </Modal>
    );
}
