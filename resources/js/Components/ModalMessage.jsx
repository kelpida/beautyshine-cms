import useMessage from "antd/es/message/useMessage";
import React, { useEffect } from "react";

export default function ModalMessage({ message = "", type = "" }) {
    const [messageApi, contextHolder] = useMessage();

    useEffect(() => {
        if (message || type) {
            messageApi.open({
                type: { type },
                content: message,
            });
        }
    }, [type, message]);

    return <>{contextHolder}</>;
}
