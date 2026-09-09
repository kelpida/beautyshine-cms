import React from "react";
import { Card, Timeline, Tag, Empty, Typography, Descriptions } from "antd";

const { Text } = Typography;

export default function AuditLogs({ data = [] }) {
    return (
        <Card title="Audit Logs" className="mt-3">
            {data.length === 0 ? (
                <Empty description="No audit logs available" />
            ) : (
                <Timeline>
                    {data.map((log) => (
                        <Timeline.Item key={log.id}>
                            <div className="mb-2">
                                <Text strong>{log.user?.name || "System"}</Text>{" "}
                                <Tag color="blue" className="ml-2">
                                    {log.action}
                                </Tag>
                            </div>

                            <Text type="secondary">
                                {new Date(log.created_at).toLocaleDateString(
                                    "en-GB"
                                )}
                            </Text>

                            {log.changes && (
                                <Descriptions
                                    size="small"
                                    column={1}
                                    bordered
                                    className="mt-2"
                                >
                                    {Object.entries(log.changes).map(
                                        ([field, change]) => (
                                            <Descriptions.Item
                                                key={field}
                                                label={field}
                                            >
                                                <Text delete type="secondary">
                                                    {String(
                                                        change.before ?? "—"
                                                    )}
                                                </Text>
                                                {" → "}
                                                <Text strong>
                                                    {String(
                                                        change.after ?? "—"
                                                    )}
                                                </Text>
                                            </Descriptions.Item>
                                        )
                                    )}
                                </Descriptions>
                            )}
                        </Timeline.Item>
                    ))}
                </Timeline>
            )}
        </Card>
    );
}
