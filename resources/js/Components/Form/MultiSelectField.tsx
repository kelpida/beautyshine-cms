import React from "react";
import { Form, Select } from "antd";

export interface MultiSelectFieldProps {
    label?: React.ReactNode;
    options?: Array<{ label: React.ReactNode; value: any }>;
    value?: any;
    onChange?: (e: any) => void;
    error?: any;
    name?: string;
    [key: string]: any;
}

export default function MultiSelectField({
    label,
    options = [],
    value = [],
    onChange,
    error,
    name,
}: MultiSelectFieldProps) {
    return (
        <Form.Item
            label={label}
            name={name}
            validateStatus={error ? "error" : ""}
            help={error}
        >
            <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Please select"
                value={value}
                onChange={(val) => onChange({ target: { name, value: val } })}
                options={options}
            />
        </Form.Item>
    );
}
