import React from "react";
import { Form, Checkbox } from "antd";

export interface CheckboxFieldProps {
    label?: React.ReactNode;
    name?: string;
    checked?: boolean;
    onChange?: (e: any) => void;
    required?: boolean;
    error?: any;
    role?: string;
    value?: any;
    [key: string]: any;
}

export default function CheckboxField({
    label,
    name,
    checked,
    onChange,
    required = false,
    error,
    role = "checkbox",
    value,
}: CheckboxFieldProps) {
    return (
        <Form.Item
            label=""
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
            valuePropName="checked"
        >
            <Checkbox
                id={name}
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                aria-invalid={!!error}
            >
                {label}
            </Checkbox>
        </Form.Item>
    );
}
