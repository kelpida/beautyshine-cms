import { Form, Select } from "antd";

export default function MultiSelectField({
    label,
    options = [],
    value = [],
    onChange,
    error,
    name,
}) {
    return (
        <Form.Item
            label={label}
            name={name}
            validateStatus={error ? "error" : ""}
            help={error}
        >
            <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Please select"
                value={value}
                onChange={(val) => onChange({ target: { name, value: val } })}
                options={options}
            />
        </Form.Item>
    );
}
