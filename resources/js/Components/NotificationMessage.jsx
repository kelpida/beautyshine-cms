import { notification } from "antd";
import { useEffect, useRef } from "react";

export default function NotificationMessage({
    message,
    description,
    type,
    duration,
    onClose,
    showMessage,
}) {
    const [api, contextHolder] = notification.useNotification();
    const hasShownMessage = useRef(false);

    useEffect(() => {
        if (!showMessage || hasShownMessage.current) return;

        const config = { message, description, duration, onClose };

        switch (type) {
            case "success":
                api.success(config);
                break;
            case "error":
                api.error(config);
                break;
            case "warning":
                api.warning(config);
                break;
            case "info":
                api.info(config);
                break;
            default:
                break;
        }
    }, [showMessage, type, message, description, duration, onClose]);

    return contextHolder;
}
