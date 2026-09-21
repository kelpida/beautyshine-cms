import React from "react";
import { Link } from "@inertiajs/react";
import { Layout, Row, Col, Card } from "antd";
import ApplicationLogo from "@/Components/ApplicationLogo";

const { Content } = Layout;

interface GuestLayoutProps {
    children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Content>
                <Row
                    justify="center"
                    align="middle"
                    style={{ minHeight: "100vh" }}
                >
                    <Col xs={22} sm={16} md={12} lg={8}>
                        <div className="flex justify-center mb-4">
                            <ApplicationLogo
                                isImage
                                image={{
                                    url: "/images/chameleon-text-logo.png",
                                    alt: "Logo",
                                }}
                                width={"300px"}
                            />
                        </div>

                        {children}
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}
