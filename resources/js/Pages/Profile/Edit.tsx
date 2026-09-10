import React from "react";
import { Head } from "@inertiajs/react";
import { Layout, Space, Card } from "antd";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdateProfileInformation from "./Partials/UpdateProfileInformation";
import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";

const { Content } = Layout;

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <>
            <PageHeaderActions title="Profile" />

            <Content
                style={{
                    padding: "48px 24px",
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "start",
                }}
            >
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%", maxWidth: 800 }}
                >
                    <Card style={{ width: "100%" }}>
                        <UpdateProfileInformation
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </Card>

                    <Card style={{ width: "100%" }}>
                        <UpdatePasswordForm />
                    </Card>

                    <Card style={{ width: "100%" }}>
                        <DeleteUserForm />
                    </Card>
                </Space>
            </Content>
        </>
    );
}

Edit.layout = (page) => <AdminLayout>{page}</AdminLayout>;
