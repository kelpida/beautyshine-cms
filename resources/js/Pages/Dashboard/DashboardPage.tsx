import DashboardChart from "@/Components/DashboardChart";
import AdminLayout from "@/Layouts/AdminLayout";
import { Bar, Column } from "@ant-design/charts";
import { Head, router } from "@inertiajs/react";
import { Card, Col, DatePicker, Flex, Row, Typography } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function DashboardPage({
    visitsChart = [],
    wishlistChart = [],
    shareChart = [],
    filters = {},
}: any) {
    const fromDate = filters?.from ? dayjs(filters.from) : dayjs().subtract(30, "day");
    const toDate = filters?.to ? dayjs(filters.to) : dayjs();

    return (
        <>
            <Head title="Dashboard" />

            <Flex justify="space-between" align="center">
                <Text style={{ fontSize: "1.25rem" }}>
                    Welcome in Alice Blooms CMS!
                </Text>

                <RangePicker
                    value={[fromDate, toDate]}
                    onChange={(dates) => {
                        if (!dates || !dates[0] || !dates[1]) return;
                        router.get(
                            route("dashboard"),
                            {
                                ...filters,
                                from: dates[0].format("YYYY-MM-DD"),
                                to: dates[1].format("YYYY-MM-DD"),
                            },
                            { preserveState: true, replace: true },
                        );
                    }}
                />
            </Flex>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Card title="Visits per Package">
                        <DashboardChart data={visitsChart} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Wishlist per Package">
                        <DashboardChart data={wishlistChart} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Share per Package">
                        <DashboardChart data={shareChart} />
                    </Card>
                </Col>
            </Row>
        </>
    );
}

DashboardPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
