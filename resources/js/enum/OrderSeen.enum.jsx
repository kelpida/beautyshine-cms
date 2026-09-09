import { EyeFilled, EyeInvisibleFilled } from "@ant-design/icons";
import { Tooltip } from "antd";

export const getSeenIcon = (seen) => {
    return (
        <Tooltip title={seen ? "Seen" : "Not seen"}>
            {seen ? (
                <EyeFilled style={{ color: "green", fontSize: 20 }} />
            ) : (
                <EyeInvisibleFilled style={{ color: "red", fontSize: 20 }} />
            )}
        </Tooltip>
    );
};
