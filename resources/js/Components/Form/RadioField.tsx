import React from "react";
import { Form, Radio } from "antd";

export interface RadioFieldProps {
    label?: React.ReactNode;
    name?: string;
    value?: any;
    onChange?: (e: any) => void;
    options?: Array<{ label: React.ReactNode; value: any }>;
    required?: boolean;
    error?: any;
    disabled?: boolean;
    [key: string]: any;
}

export default function RadioField({
    label,
    name,
    value,
    onChange,
    options = [],
    required = false,
    error,
    disabled = false,
}: RadioFieldProps) {
    return (
        <Form.Item
            label={label}
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
        >
            <Radio.Group
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
            >
                {options.map((opt) => (
                    <Radio key={opt.value} value={opt.value}>
                        {opt.label}
                    </Radio>
                ))}
            </Radio.Group>
        </Form.Item>
    );
}
