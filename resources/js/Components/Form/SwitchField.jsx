import { Switch, Form, Flex } from "antd";

export default function SwitchField({
    onChange,
    checked = false,
    name,
    label,
    error,
    required,
    role,
    valueA,
    valueB,
}) {
    return (
        <Form.Item
            className="mb-0"
            label={label}
            name={name}
            valuePropName="checked"
            help={error}
            rules={[{ required: required, message: `${label} is required` }]}
            role={role}
        >
            <Flex align="center" gap={16}>
                <p className="mb-0">{valueB}</p>
                <Switch onChange={onChange} checked={!!checked} />
                <p className="mb-0">{valueA}</p>
            </Flex>
        </Form.Item>
    );
}
