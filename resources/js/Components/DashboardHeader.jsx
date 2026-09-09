import { Avatar, Badge, Button, Dropdown, Flex, Space, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link } from "@inertiajs/react";
import axios from "axios";

const { Text } = Typography;

export default function DashboardHeader({ user }) {
    const handleLogout = async () => {
        await axios.post("/logout");
        window.location.href = "/login";
    };

    const items = [
        {
            key: "profile",
            label: <Link href="/profile">Edit Profile</Link>,
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            label: "Logout",
            onClick: handleLogout,
        },
    ];

    return (
        <Flex justify={"flex-end"} align={"center"}>
            <Dropdown menu={{ items }} trigger={["click"]}>
                <Space>
                    <Avatar src={user?.avatar} size="small">
                        {user?.name?.[0]}
                    </Avatar>
                    <Flex vertical>
                        <Text strong>{user?.name}</Text>
                        <Text>{user?.role?.name}</Text>
                    </Flex>
                    <DownOutlined />
                </Space>
            </Dropdown>
        </Flex>
    );
}
