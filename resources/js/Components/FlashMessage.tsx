import useMessage from "antd/es/message/useMessage";
import React, { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

export default function FlashMessage() {
    const [messageApi, contextHolder] = useMessage();
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash?.success) {
            messageApi.success(flash?.success);
        }
        if (flash?.error) {
            messageApi.error(flash?.error);
        }
    }, [flash]);

    return contextHolder;
}
