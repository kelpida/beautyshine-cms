import { Column } from "@ant-design/charts";
import React from "react";

export default function DashboardChart({ data }) {
    const config = {
        data: data,

        // REQUIRED fields
        xField: "id", // visits
        yField: "value", // property name (ONE BAR PER PROPERTY)

        height: 400,
        width: 600,

        colorField: "label",

        // Visit count inside each bar
        label: {
            position: "middle",
            style: {
                fill: "#fff",
                fontWeight: 600,
            },
        },

        // Tooltip shows full property name
        tooltip: {
            formatter: (datum) => ({
                name: datum.label,
                value: `${datum.value} visits`,
            }),
        },

        // Disable stacking & legend
        isStack: false,
        legend: false,

        barWidthRatio: 0.2,
        interactions: [{ type: "element-active" }],
    };
    return <Column {...config} />;
}
