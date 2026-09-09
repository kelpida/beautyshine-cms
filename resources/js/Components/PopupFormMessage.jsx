import useMessage from "antd/es/message/useMessage";
import React, { useEffect } from "react";

export default function PopupFormMessage({ errors = [] }) {
    const [messageApi, contextHolder] = useMessage();

    useEffect(() => {
        if (errors) {
            Object.values(errors).forEach((msg) => {
                messageApi.error({
                    content: msg,
                    duration: 3,
                    className: "ant-error-message",
                });
            });
        }
    }, [errors]);

    return contextHolder; // not { contextHolder }
}
