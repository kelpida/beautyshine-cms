import { Form, Select } from "antd";
import { useState } from "react";

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
}) {
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
                        ? (input, option) =>
                              option.children
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
