import DatePickerField from "@/Components/Form/DatePickerField";
import SelectField from "@/Components/Form/SelectField";
import { Alert, Button, Col, Divider, Flex, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import InputLabel from "@/Components/InputLabel";
import {
    LoadingOutlined,
    ClockCircleOutlined,
    ShopOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
} from "@ant-design/icons";
import axios from "axios";

export default function AppointmentSection({
    onBack,
    stores,
    setAppointment,
    appointment,
    onNext,
}: {
    onBack?: any;
    stores?: any;
    setAppointment?: any;
    appointment?: any;
    onNext?: any;
}) {
    const [availableSlot, setAvailableSlot] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (
            appointment.appointments?.date &&
            appointment.appointments?.store_id
        ) {
            getAvailableSlots({
                date: appointment.appointments.date,
                store_id: appointment.appointments.store_id,
            });
        }
    }, [appointment.appointments?.date, appointment.appointments?.store_id]);

    const getAvailableSlots = async ({ date, store_id }) => {
        try {
            setLoading(true);

            const response = await axios.post(
                route("appointments.available-slots"),
                {
                    store_id,
                    date: date,
                    step: 15,
                },
            );

            setAvailableSlot(response.data);
        } catch (error: any) {
            console.log(error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    // Extract available times from API response (supports time_options and legacy slots)
    const availableTimes: string[] =
        availableSlot?.time_options ||
        availableSlot?.slots?.map((s: any) => s.start_time || s.time) ||
        [];

    const isClosed =
        availableSlot?.is_closed || availableSlot?.can_pickup === false;

    return (
        <>
            <Divider>Pickup Details</Divider>
            <Row gutter={16}>
                <Col span={24}>
                    <SelectField
                        label="Pickup Store"
                        name="store_id"
                        value={appointment.appointments?.store_id}
                        options={stores?.map((store: any) => ({
                            label: store.name,
                            value: store.id,
                        }))}
                        onChange={(value) =>
                            setAppointment(
                                "appointments.store_id",
                                value.target.value,
                            )
                        }
                    />
                </Col>
                <Col span={24}>
                    <DatePickerField
                        label="Pickup Date"
                        name="date"
                        format="DD-MM-YYYY"
                        value={
                            appointment.appointments?.date
                                ? dayjs(
                                      appointment.appointments.date,
                                      "DD-MM-YYYY",
                                  )
                                : null
                        }
                        onChange={(value) => {
                            const formattedDate = value
                                ? value.format("DD-MM-YYYY")
                                : "";
                            setAppointment("appointments.date", formattedDate);

                            if (
                                formattedDate &&
                                appointment.appointments?.store_id
                            ) {
                                getAvailableSlots({
                                    date: formattedDate,
                                    store_id:
                                        appointment.appointments?.store_id,
                                });
                            }
                        }}
                    />
                </Col>
                <Col span={24}>
                    <InputLabel>Pickup Time</InputLabel>

                    {isClosed && (
                        <Alert
                            type="warning"
                            showIcon
                            message={
                                availableSlot?.message ||
                                "Store is closed for pickup on this date. Please select another date."
                            }
                            className="mt-2 mb-3"
                        />
                    )}

                    <Flex
                        gap={8}
                        wrap="wrap"
                        justify="flex-start"
                        className="mt-2"
                    >
                        {loading ? (
                            <LoadingOutlined
                                style={{ fontSize: 24, margin: "16px auto" }}
                            />
                        ) : availableTimes.length > 0 ? (
                            availableTimes.map((timeStr: string) => {
                                const isSelected =
                                    appointment.appointments?.start_time ===
                                    timeStr;
                                return (
                                    <Button
                                        key={timeStr}
                                        type={
                                            isSelected ? "primary" : "default"
                                        }
                                        icon={<ClockCircleOutlined />}
                                        onClick={() => {
                                            setAppointment((prev: any) => ({
                                                ...prev,
                                                appointments: {
                                                    ...prev?.appointments,
                                                    start_time: timeStr,
                                                    end_time: timeStr,
                                                },
                                            }));
                                        }}
                                    >
                                        {timeStr}
                                    </Button>
                                );
                            })
                        ) : (
                            !loading &&
                            appointment.appointments?.date && (
                                <Typography.Text type="secondary">
                                    No pickup times available for this
                                    selection.
                                </Typography.Text>
                            )
                        )}
                    </Flex>
                </Col>
            </Row>
            <Flex justify="space-between" align="center" className="mt-[40px]!">
                <Button
                    onClick={() => onBack()}
                    type="default"
                    icon={<ArrowLeftOutlined />}
                >
                    Back Step
                </Button>

                <Button
                    onClick={() => onNext()}
                    type="primary"
                    iconPlacement="end"
                    icon={<ArrowRightOutlined />}
                >
                    Next Step
                </Button>
            </Flex>
        </>
    );
}
