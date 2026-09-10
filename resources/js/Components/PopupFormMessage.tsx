import useMessage from "antd/es/message/useMessage";
import React, { useEffect } from "react";

export default function PopupFormMessage({ errors = {} }: { errors?: any }) {
    const [messageApi, contextHolder] = useMessage();

    useEffect(() => {
        if (errors) {
            Object.values(errors).forEach((msg) => {
                messageApi.error({
                    content: msg as React.ReactNode,
                    duration: 3,
                    className: "ant-error-message",
                });
            });
        }
    }, [errors]);

    return contextHolder; // not { contextHolder }
}
