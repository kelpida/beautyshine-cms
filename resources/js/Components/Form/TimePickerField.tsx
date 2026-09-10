import React from "react";
import { Form, TimePicker } from "antd";
import dayjs from "dayjs";

export interface TimePickerFieldProps {
    label?: React.ReactNode;
    name?: string;
    value?: any;
    onChange?: (time: any, timeString: any) => void;
    required?: boolean;
    error?: any;
    disabled?: boolean;
    placeholder?: string;
    format?: string;
    [key: string]: any;
}

export default function TimePickerField({
    label,
    name,
    value,
    onChange,
    required = false,
    error,
    disabled = false,
    placeholder,
    format = "HH:mm:ss",
}: TimePickerFieldProps) {
    return (
        <Form.Item
            label={label}
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
        >
            <TimePicker
                name={name}
                value={value ? dayjs(value, format) : null}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                format={format}
                style={{ width: "100%" }}
            />
        </Form.Item>
    );
}
