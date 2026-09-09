import { Form, ColorPicker } from "antd";

export default function ColorPickerField({
    label,
    name,
    value,
    onChange,
    required = false,
    error,
    disabled = false,
    showText = true,
}) {
    return (
        <Form.Item
            label={label}
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
        >
            <ColorPicker
                value={value}
                onChange={onChange}
                disabled={disabled}
                showText={showText}
            />
        </Form.Item>
    );
}
