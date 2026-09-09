import React from "react";
import { Button, Flex } from "antd";
import { usePermissions } from "@/hooks/usePermissions";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

export default function TableButtonAction({
    editAction,
    deleteAction,
    pagePermissions,
    children,
}) {
    const can = usePermissions();

    const handleEdit = () => editAction();
    const handleDelete = () => deleteAction();

    const filteredChildren = React.Children.toArray(children).filter(
        (child) => {
            const permission = child.props.permission;
            return permission ? can(permission) : true;
        },
    );

    return (
        <Flex gap={3}>
            {can(pagePermissions.edit) && editAction && (
                <Button
                    color="primary"
                    variant="solid"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                >
                    Edit
                </Button>
            )}
            {filteredChildren}
            {can(pagePermissions.delete) && deleteAction && (
                <Button
                    color="danger"
                    variant="solid"
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                >
                    Delete
                </Button>
            )}
        </Flex>
    );
}

export function Action({ permission, children }) {
    return React.cloneElement(children, { __permission: permission });
}
