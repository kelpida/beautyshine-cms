import { Form, DatePicker } from "antd";
import dayjs from "dayjs";

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
}) {
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
