import React, { useRef } from "react";
import { Button, Modal, Input, Typography, Form, Space } from "antd";
import { useForm } from "@inertiajs/react";

const { Text, Title } = Typography;

export default function DeleteUserForm({ className = "" }) {
    const [form] = Form.useForm();
    const passwordInputRef = useRef(null);
    const [visible, setVisible] = React.useState(false);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: "",
    });

    const handleOpen = () => {
        clearErrors();
        setVisible(true);
    };

    const handleClose = () => {
        reset();
        clearErrors();
        setVisible(false);
        form.resetFields();
    };

    const deleteUser = () => {
        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => handleClose(),
            onError: () => {
                passwordInputRef.current?.focus();
            },
            onFinish: () => reset(),
        });
    };

    return (
        <div className={className} style={{ marginBottom: 32 }}>
            <Title level={4} style={{ marginBottom: 8 }}>
                Delete Account
            </Title>
            <Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
            >
                Once your account is deleted, all of its resources and data will
                be permanently deleted. Before deleting your account, please
                download any data or information that you wish to retain.
            </Text>

            <Button danger onClick={handleOpen}>
                Delete Account
            </Button>

            <Modal
                title="Are you sure you want to delete your account?"
                visible={visible}
                onCancel={handleClose}
                onOk={() => form.submit()}
                okText="Delete Account"
                okButtonProps={{ danger: true, loading: processing }}
                cancelText="Cancel"
                centered
            >
                <Text
                    type="secondary"
                    style={{ marginBottom: 16, display: "block" }}
                >
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Please enter your password to
                    confirm you would like to permanently delete your account.
                </Text>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={deleteUser}
                    initialValues={{ password: data.password }}
                    onValuesChange={(changedValues) => {
                        if ("password" in changedValues) {
                            setData("password", changedValues.password);
                            if (errors.password) clearErrors();
                        }
                    }}
                >
                    <Form.Item
                        label="Password"
                        name="password"
                        validateStatus={errors.password ? "error" : ""}
                        help={errors.password || ""}
                        rules={[
                            {
                                required: true,
                                message: "Please enter your password.",
                            },
                        ]}
                    >
                        <Input.Password ref={passwordInputRef} autoFocus />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
