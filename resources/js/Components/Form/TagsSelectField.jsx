import React from "react";
import { Form, Select } from "antd";

export default function TagsSelectField({
    name,
    label,
    required,
    options,
    value,
    onChange,
    error,
}) {
    // Helper: Convert new input into slug
    const toSlug = (text) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const handleChange = (values) => {
        const processed = values.map((item) => {
            const found = options?.find((opt) => opt.value === item);
            return found ? item : toSlug(item); // existing option → leave, new tag → slug
        });

        onChange({
            target: { name, value: processed },
        });
    };

    return (
        <Form.Item
            name={name}
            label={label}
            validateStatus={error ? "error" : "success"}
            help={error}
            required={required}
            rules={[
                {
                    required: true,
                    message: `${label} is required`,
                },
            ]}
        >
            <Select
                mode="tags"
                value={value}
                style={{ width: "100%" }}
                placeholder="Select or create a tag"
                options={options}
                onChange={handleChange}
            />
        </Form.Item>
    );
}
