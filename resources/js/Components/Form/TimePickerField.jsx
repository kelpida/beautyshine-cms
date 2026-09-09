import { Form, TimePicker } from "antd";
import dayjs from "dayjs";

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
}) {
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
