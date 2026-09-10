import React from "react";
import { Menu, Layout, Flex } from "antd";
import { usePage } from "@inertiajs/react";
import ApplicationLogo from "./ApplicationLogo";
import { SideBarMenuList } from "@/routes/SideBarMenuList";
import { usePermissions } from "@/hooks/usePermissions";

const { Sider } = Layout;

export default function SidebarNav({ collapsed = false, setCollapsed = (_val?: any) => {} }) {
    const hasPermission = usePermissions();
    const { url } = usePage();

    // Find which submenu should be open by default
    const defaultOpenKeys = SideBarMenuList.filter((item) =>
        item.children?.some((child) => child.key === url)
    ).map((item) => item.key);

    // Recursively filter menus by permission
    const filterMenu = (menu) =>
        menu
            .filter(
                (item) => !item.permission || hasPermission(item.permission)
            )
            .map((item) => {
                if (item.children) {
                    const filteredChildren = filterMenu(item.children);
                    return filteredChildren.length
                        ? { ...item, children: filteredChildren }
                        : null;
                }
                return item;
            })
            .filter(Boolean);

    const menuItems = filterMenu(SideBarMenuList);

    return (
        <>
            {/* <Head title={""} /> */}

            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
            >
                <Flex className="mt-5" justify="center">
                    <ApplicationLogo
                        isImage
                        image={{
                            url: collapsed
                                ? "/images/chameleon-main-icon.svg"
                                : "/images/chameleon-main-logo-white.svg",
                            alt: "Logo",
                        }}
                        width={collapsed ? "50px" : "140px"}
                    />
                </Flex>
                <div className="demo-logo-vertical mb-4" />
                <Menu
                    mode="inline"
                    theme="dark"
                    style={{ width: "100%" }}
                    selectedKeys={[url]} // ✅ use selectedKeys (controlled)
                    defaultOpenKeys={defaultOpenKeys}
                    items={menuItems}
                />
            </Sider>
        </>
    );
}
