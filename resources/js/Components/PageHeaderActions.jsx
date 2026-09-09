import React from "react";
import { Button, Space, Typography } from "antd";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { usePermissions } from "@/hooks/usePermissions";

const { Title } = Typography;

export default function PageHeaderActions({
    title = "",
    backAction,
    backName,
    addAction,
    addName,
    children,
    pagePermissions,
}) {
    const can = usePermissions();
    const filteredChildren = React.Children.toArray(children).filter(
        (child) => {
            const permission = child.props.permission;
            return permission ? can(permission) : true;
        }
    );

    const handleBack = () => {
        if (backAction) {
            router.visit(backAction, {
                preserveScroll: true,
                preserveState: true,
            });
        } else {
            window.history.back();
        }
    };

    return (
        <>
            <Head title={title} />
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "2rem",
                    flexWrap: "wrap",
                    gap: "1rem",
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    {title}
                </Title>

                <Space>
                    {backAction && (
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            type="default"
                            onClick={handleBack}
                        >
                            {backName}
                        </Button>
                    )}
                    {usePermissions(pagePermissions?.add) && addAction && (
                        <Link href={addAction}>
                            <Button icon={<PlusOutlined />} type="primary">
                                {addName}
                            </Button>
                        </Link>
                    )}
                    {filteredChildren}
                </Space>
            </div>
        </>
    );
}
