import { Input, Space, Button, Select } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import Text from "antd/lib/typography/Text";
import { useRef } from "react";

export default function TableFilter({ router, routeName, extraParams = {} }) {
    const searchInput = useRef(null);

    const submit = (value, field, confirm) => {
        confirm();

        router.get(
            route(routeName),
            {
                ...extraParams,
                [field]: value || null,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const reset = (confirm) => {
        confirm();

        router.get(
            route(routeName),
            {}, // 👈 NO params = clean URL
            {
                preserveState: false,
                replace: true,
            },
        );
    };

    const getColumnSearchProps = (field) => {
        return {
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        ref={searchInput}
                        placeholder={`Search ${field}`}
                        value={selectedKeys[0]}
                        onChange={(e) =>
                            setSelectedKeys(
                                e.target.value ? [e.target.value] : [],
                            )
                        }
                        onPressEnter={() =>
                            submit(selectedKeys[0], field, confirm)
                        }
                        style={{ marginBottom: 8, display: "block" }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<SearchOutlined />}
                            onClick={() =>
                                submit(selectedKeys[0], field, confirm)
                            }
                        >
                            Search
                        </Button>
                        <Button size="small" onClick={() => reset(confirm)}>
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered) => (
                <SearchOutlined
                    style={{ color: filtered ? "#1677ff" : undefined }}
                />
            ),
            filterDropdownProps: {
                onOpenChange(open) {
                    if (open) {
                        setTimeout(() => searchInput.current?.select(), 100);
                    }
                },
            },
            render: (text) => (text ? <Text>{text}</Text> : ""),
        };
    };

    const getColumnSelectProps = (field, options) => {
        return {
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <div
                    style={{
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    <Select
                        placeholder={`Filter ${field}`}
                        value={selectedKeys[0]}
                        onChange={(val) => setSelectedKeys(val ? [val] : [])}
                        options={options}
                        style={{ width: 200, display: "block" }}
                        allowClear
                    />
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<FilterOutlined />}
                            onClick={() =>
                                submit(selectedKeys[0], field, confirm)
                            }
                        >
                            Filter
                        </Button>
                        <Button size="small" onClick={() => reset(confirm)}>
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered) => (
                <FilterOutlined
                    style={{ color: filtered ? "#1677ff" : undefined }}
                />
            ),
        };
    };

    return { getColumnSearchProps, getColumnSelectProps };
}
