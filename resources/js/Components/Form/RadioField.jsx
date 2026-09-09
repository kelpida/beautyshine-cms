import { Form, Radio } from "antd";

export default function RadioField({
    label,
    name,
    value,
    onChange,
    options = [],
    required = false,
    error,
    disabled = false,
}) {
    return (
        <Form.Item
            label={label}
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
        >
            <Radio.Group
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
            >
                {options.map((opt) => (
                    <Radio key={opt.value} value={opt.value}>
                        {opt.label}
                    </Radio>
                ))}
            </Radio.Group>
        </Form.Item>
    );
}
