import { Form, Checkbox } from "antd";

export default function CheckboxField({
    label,
    name,
    checked,
    onChange,
    required = false,
    error,
    role = "checkbox",
    value,
}) {
    return (
        <Form.Item
            label=""
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
            htmlFor={name}
            role={role}
            valuePropName="checked"
        >
            <Checkbox
                id={name}
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                aria-invalid={!!error}
            >
                {label}
            </Checkbox>
        </Form.Item>
    );
}
