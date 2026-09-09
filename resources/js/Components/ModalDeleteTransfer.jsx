import { Modal } from "antd";
import React, { useState } from "react";
import SelectField from "./Form/SelectField";

export default function ModalDeleteTransfer({
    title = "Select where you want to transfer",
    open = false,
    router,
    deleteRoute,
    setOpen,
    data,
}) {
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        if (!selectedId || !deleteRoute) return;

        setLoading(true);

        router.delete(deleteRoute, {
            data: {
                reassign_to: selectedId, // ✅ MATCHES BACKEND
            },
            onFinish: () => {
                setLoading(false);
                setOpen(false);
                setSelectedId(null);
            },
        });
    };

    return (
        <Modal
            centered
            title={title}
            open={open}
            onCancel={handleCancel}
            onOk={handleOk}
            confirmLoading={loading}
            okText="Deleted"
        >
            <SelectField
                label=""
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value)}
                options={data.map((d) => ({
                    value: d.id,
                    label: d.name,
                }))}
                placeholder="Select destination"
            />
        </Modal>
    );
}
