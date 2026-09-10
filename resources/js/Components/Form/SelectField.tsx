import React from "react";
import { Form, Select } from "antd";
import { useState } from "react";

export interface SelectFieldProps {
    label?: React.ReactNode;
    name?: string;
    value?: any;
    onChange?: (val: any) => void;
    options?: Array<{ label: React.ReactNode; value: any }>;
    error?: any;
    required?: boolean;
    showSearch?: boolean;
    className?: string;
    placeholder?: string;
    mode?: "multiple" | "tags";
    [key: string]: any;
}

export default function SelectField({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    required = false,
    showSearch = false,
    className = "",
    placeholder = "Select an option",
    mode,
}: SelectFieldProps) {
    // Set default value based on mode
    const defaultValue = mode === "multiple" ? [] : "";
    const selectValue = value !== undefined ? value : defaultValue;
    return (
        <Form.Item
            label={label}
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
            className={className}
        >
            <Select
                value={selectValue}
                onChange={(val) =>
                    onChange?.(
                        mode === "multiple"
                            ? val
                            : { target: { name, value: val } },
                    )
                }
                mode={mode}
                placeholder={mode === "multiple" ? placeholder : undefined}
                filterOption={
                    showSearch
                        ? (input, option: any) =>
                              String(option?.children ?? "")
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                        : undefined
                }
                showSearch={showSearch}
            >
                {!mode && <Select.Option value="">{placeholder}</Select.Option>}
                {options.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>
    );
}
