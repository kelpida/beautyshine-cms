import React from "react";
import { Form, DatePicker } from "antd";
import dayjs from "dayjs";

export interface DatePickerFieldProps {
    label?: React.ReactNode;
    name?: string;
    value?: any;
    onChange?: (date: any, dateString: any) => void;
    required?: boolean;
    error?: any;
    disabled?: boolean;
    placeholder?: string;
    format?: string;
    minDate?: any;
    maxDate?: any;
    [key: string]: any;
}

export default function DatePickerField({
    label,
    name,
    value,
    onChange,
    required = false,
    error,
    disabled = false,
    placeholder,
    format = "YYYY-MM-DD",
    minDate,
    maxDate,
}: DatePickerFieldProps) {
    return (
        <Form.Item
            label={label}
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
        >
            <DatePicker
                name={name}
                value={value ? dayjs(value) : null}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                format={format}
                style={{ width: "100%" }}
                disabledDate={(current) => {
                    if (minDate && current.isBefore(dayjs(minDate))) {
                        return true;
                    }
                    if (maxDate && current.isAfter(dayjs(maxDate))) {
                        return true;
                    }
                    return false;
                }}
            />
        </Form.Item>
    );
}
