import React from "react";
import { Form, Input } from "antd";

export interface InputFieldProps {
    label?: React.ReactNode;
    name?: string;
    value?: any;
    onChange?: (e: any) => void;
    onBlur?: (e: any) => void;
    required?: boolean;
    error?: any;
    role?: string;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
    className?: string;
    [key: string]: any;
}

export default function InputField({
    label,
    name,
    value,
    onChange,
    onBlur,
    required = false,
    error,
    role = "textbox",
    placeholder,
    disabled = false,
    type = "text",
    className = "",
}: InputFieldProps) {
    const InputComponent = type === "password" ? Input.Password : Input;
    return (
        <Form.Item
            label={label}
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
            htmlFor={name}
            className={className}
        >
            <InputComponent
                id={name}
                name={name}
                role={role}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                aria-invalid={!!error}
                disabled={disabled}
                type={type}
            />
        </Form.Item>
    );
}
