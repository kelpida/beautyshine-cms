import { Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const ActiveLabelEnum = {
    true: (
        <Tag color="success" icon={<CheckOutlined />} variant="filled">
            Active
        </Tag>
    ),
    false: (
        <Tag color="error" icon={<CloseOutlined />} variant="filled">
            Inactive
        </Tag>
    ),
};

export const ActiveLabel = (label) => {
    return ActiveLabelEnum[label];
};
