import { Form, Input } from "antd";

export default function InputField({
    label,
    name,
    value,
    onChange,
    onBlur,
    required = false,
    error,
    role = "textbox",
    placeholder,
    disabled = false,
    type = "text",
    className = "",
}) {
    const InputComponent = type === "password" ? Input.Password : Input;
    return (
        <Form.Item
            label={label}
            validateStatus={error ? "error" : ""}
            help={error}
            required={required}
            htmlFor={name}
            role={role}
            className={className}
        >
            <InputComponent
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                aria-invalid={!!error}
                disabled={disabled}
                type={type}
            />
        </Form.Item>
    );
}
