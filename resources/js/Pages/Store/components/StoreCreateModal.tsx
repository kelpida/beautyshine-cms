import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import PageHeaderActions from "@/Components/PageHeaderActions";
import { useGeneratePath } from "@/hooks/useGeneratePath";
import { useForm } from "@inertiajs/react";
import { Button, Card, Col, Form, Modal, Row } from "antd";
import React from "react";

export default function StoreCreateModal({ isOpen, setIsOpen }) {
    const {
        data,
        setData,
        post: submitRole,
        put,
        processing,
        errors,
    } = useForm<any>({
        name: "",
        slug: "",
        address: "",
        description: "",
    });

    const handleSubmit = (data) => {
        submitRole(route("stores.store"), {
            ...data,
        });
    };
    return (
        <Modal
            open={isOpen}
            onCancel={() => setIsOpen(false)}
            footer={null}
            width={"50vw"}
        >
            <PageHeaderActions title="Create Store" />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={data}
            >
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        {/* Title Input */}
                        <InputField
                            label="Name"
                            name="name"
                            required
                            onChange={(e) => {
                                setData("name", e.target.value);
                                setData(
                                    "slug",
                                    useGeneratePath(e.target.value),
                                );
                            }}
                            value={data.name}
                            error={errors.name}
                            placeholder="e.g., Store name"
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        {/* Title Input */}
                        <InputField
                            label="Slug"
                            name="slug"
                            required
                            onChange={(e) => setData("slug", e.target.value)}
                            value={data.slug}
                            error={errors.slug}
                            placeholder="e.g., store-name"
                        />
                    </Col>
                    <Col xs={24} md={24}>
                        {/* Title Input */}
                        <InputField
                            label="Address"
                            name="address"
                            onChange={(e) => setData("address", e.target.value)}
                            value={data.address}
                            error={errors.address}
                            placeholder="e.g., Address Street 12"
                        />
                    </Col>
                    <Col xs={24} md={24}>
                        {/* Title Input */}
                        <RichTextArea
                            name={"description"}
                            label={"Description"}
                            value={data.description}
                            onChange={(value) => setData("description", value)}
                        />
                    </Col>
                </Row>

                <Form.Item className="mt-4">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={processing}
                    >
                        Continue
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
