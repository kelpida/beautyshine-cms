import React from "react";
import { Form, Select } from "antd";

export interface SelectChangeEvent<T = any> {
    target: {
        name?: string;
        value: T;
    };
}

export interface BaseSelectFieldProps {
    label?: React.ReactNode;
    name?: string;
    options?: Array<{ label: React.ReactNode; value: any }>;
    error?: any;
    required?: boolean;
    showSearch?: boolean;
    className?: string;
    placeholder?: string;
    [key: string]: any;
}

export interface SingleSelectFieldProps extends BaseSelectFieldProps {
    mode?: undefined;
    value?: any;
    onChange?: (e: SelectChangeEvent<any>) => void;
}

export interface MultiSelectFieldProps extends BaseSelectFieldProps {
    mode: "multiple" | "tags";
    value?: any[];
    onChange?: (e: SelectChangeEvent<any[]>) => void;
}

export type SelectFieldProps = SingleSelectFieldProps | MultiSelectFieldProps;

export default function SelectField({
    label,
    name = "",
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
    const isMulti = mode === "multiple" || mode === "tags";
    // Set default value based on mode
    const defaultValue = isMulti ? [] : "";
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
                    onChange?.({
                        target: {
                            name,
                            value: val,
                        },
                    } as any)
                }
                mode={mode}
                placeholder={isMulti ? placeholder : undefined}
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
                {!isMulti && (
                    <Select.Option value="">{placeholder}</Select.Option>
                )}
                {options.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>
    );
}
