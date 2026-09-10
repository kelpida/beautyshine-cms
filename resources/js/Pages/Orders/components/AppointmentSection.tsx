import DatePickerField from "@/Components/Form/DatePickerField";
import SelectField from "@/Components/Form/SelectField";
import { Button, Card, Col, Divider, Flex, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import InputLabel from "@/Components/InputLabel";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";

const { Paragraph } = Typography;

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
        console.log("🚀 ~ getAvailableSlots ~ date:", date);
        try {
            setLoading(true);

            const response = await axios.post(
                route("appointments.available-slots"),
                {
                    store_id,
                    packages: appointment.items.map((item) => ({
                        id: item.item_id,
                        quantity: item.quantity,
                    })),
                    date: date,
                    step: 5,
                },
            );

            setAvailableSlot(response.data);
        } catch (error) {
            console.log(error.response?.data);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <Divider>Appointment</Divider>
            <Row gutter={16}>
                <Col span={24}>
                    <SelectField
                        label="Store"
                        name="store_id"
                        value={appointment.appointments?.store_id}
                        options={stores?.map((store) => ({
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
                        label="Date"
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
                            setAppointment(
                                "appointments.date",
                                value ? value.format("DD-MM-YYYY") : "",
                            );

                            getAvailableSlots({
                                date: value.format("DD-MM-YYYY"),
                                store_id: appointment.appointments?.store_id,
                            });
                        }}
                    />
                </Col>
                <Col span={24}>
                    <InputLabel>Time slots</InputLabel>
                    <Flex gap={8} wrap="wrap" justify="center" className="mt-2">
                        {loading ? (
                            <LoadingOutlined />
                        ) : (
                            availableSlot?.slots?.map((slot: any) => (
                                <Button
                                    key={slot.start_time}
                                    type={
                                        appointment.appointments?.start_time ===
                                        slot.start_time
                                            ? "primary"
                                            : "default"
                                    }
                                    disabled={!slot.available}
                                    onClick={() => {
                                        setAppointment((prev: any) => ({
                                            ...prev,
                                            appointments: {
                                                ...prev?.appointments,
                                                start_time: slot.start_time,
                                                end_time: slot.end_time,
                                                duration:
                                                    availableSlot?.duration,
                                            },
                                        }));
                                    }}
                                >
                                    {slot.start_time} - {slot.end_time}
                                    {!slot.available &&
                                        ` (${slot.remaining_capacity} left)`}
                                </Button>
                            ))
                        )}
                    </Flex>
                </Col>
            </Row>
            <Row className="mt-5">
                <Col span={12} className="justify-start flex">
                    <Button onClick={() => onBack()} type="primary">
                        Back Step
                    </Button>
                </Col>
                <Col span={12} className="justify-end flex">
                    <Button onClick={() => onNext()} type="primary">
                        Next Step
                    </Button>
                </Col>
            </Row>
        </>
    );
}
