import React from "react";
import { Form, ColorPicker } from "antd";

export interface ColorPickerFieldProps {
    label?: React.ReactNode;
    name?: string;
    value?: any;
    onChange?: (color: any) => void;
    required?: boolean;
    error?: any;
    disabled?: boolean;
    showText?: boolean;
    [key: string]: any;
}

export default function ColorPickerField({
    label,
    name,
    value,
    onChange,
    required = false,
    error,
    disabled = false,
    showText = true,
}: ColorPickerFieldProps) {
    return (
        <Form.Item
            label={label}
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
        >
            <ColorPicker
                value={value}
                onChange={onChange}
                disabled={disabled}
                showText={showText}
            />
        </Form.Item>
    );
}
