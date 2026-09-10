// resources/js/Layouts/AdminLayout.jsx
import { Layout, Button, Drawer, Grid, Menu, Alert } from "antd";
import {
    DesktopOutlined,
    FileOutlined,
    LogoutOutlined,
    MenuOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import SidebarNav from "@/Components/SidebarNav";
import DashboardHeader from "@/Components/DashboardHeader";
import { router, usePage } from "@inertiajs/react";
import FlashMessage from "@/Components/FlashMessage";

import { PageProps } from "@/types";

const { Header, Content, Footer } = Layout;

interface AdminLayoutProps {
    children: React.ReactNode;
    user?: any;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const toggleDrawer = () => {
        setDrawerVisible(!drawerVisible);
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <FlashMessage />
            <SidebarNav setCollapsed={setCollapsed} collapsed={collapsed} />
            <Layout>
                {auth?.impersonator_id && (
                    <Alert
                        message="You are impersonating this user"
                        type="warning"
                        banner
                        action={
                            <Button
                                type="primary"
                                danger
                                size="small"
                                icon={<LogoutOutlined />}
                                onClick={() =>
                                    router.post(
                                        "/leave-impersonation",
                                        {},
                                        {
                                            onSuccess: () =>
                                                window.location.reload(),
                                        },
                                    )
                                }
                            >
                                Leave
                            </Button>
                        }
                        style={{ marginBottom: 0 }}
                    />
                )}
                {/* Custom Header */}
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #f0f0f0",
                    }}
                >
                    <Button
                        icon={<MenuOutlined />}
                        type="text"
                        onClick={() => setCollapsed(!collapsed)}
                    />
                    <DashboardHeader user={user} />
                </Header>

                <Content style={{ margin: "0 16px" }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                        }}
                    >
                        {children}
                    </div>
                </Content>

                <Footer style={{ textAlign: "center" }}>
                    ©{new Date().getFullYear()} Created by Chameleon Creative
                    Studio
                </Footer>
            </Layout>
        </Layout>
    );
}
