import React from "react";
import { Switch, Form, Flex } from "antd";

export interface SwitchFieldProps {
    onChange?: (checked: boolean) => void;
    checked?: boolean;
    name?: any;
    label?: React.ReactNode;
    error?: any;
    required?: boolean;
    role?: string;
    valueA?: React.ReactNode;
    valueB?: React.ReactNode;
    [key: string]: any;
}

export default function SwitchField({
    onChange,
    checked = false,
    name,
    label,
    error,
    required,
    role,
    valueA,
    valueB,
}: SwitchFieldProps) {
    return (
        <Form.Item
            className="mb-0"
            label={label}
            name={name}
            valuePropName="checked"
            help={error}
            rules={[{ required: required, message: `${label} is required` }]}
        >
            <Flex align="center" gap={16}>
                <p className="mb-0">{valueB}</p>
                <Switch onChange={onChange} checked={!!checked} />
                <p className="mb-0">{valueA}</p>
            </Flex>
        </Form.Item>
    );
}
