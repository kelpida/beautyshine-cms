import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import SelectField from "@/Components/Form/SelectField";
import SwitchField from "@/Components/Form/SwitchField";
import TimePickerField from "@/Components/Form/TimePickerField";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import { DateOptions } from "@/enum/DateLabel.enum";
import { IntegrationPositionsOptions } from "@/enum/IntegrationPositions.enum";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { useForm } from "@inertiajs/react";
import { Button, Card, Col, Form, Row } from "antd";
import React from "react";
import dayjs from "dayjs";
import DatePickerField from "@/Components/Form/DatePickerField";

export default function HolidayFormPage({ holiday, stores }) {
    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm({
        store_id: holiday?.store?.id || "",
        name: holiday?.name || "",
        start_date: holiday?.start_date || "",
        end_date: holiday?.end_date || "",
        is_closed: holiday?.is_closed || false,
        open_time: holiday?.open_time || "",
        close_time: holiday?.close_time || "",
    });

    const handleSubmit = () => {
        if (holiday?.data?.id) {
            put(route("holidays.update", holiday?.data?.id), data);
        } else {
            submitPost(route("holidays.store"), data);
        }
    };
    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={`${holiday ? "Edit" : "Create"} Holiday`}
                backAction={RouteList.holidays()}
                backName={"Back to Holidays"}
            />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={data}
            >
                <Card className="mb-4">
                    <Row gutter={[16, 16]}>
                        <Col span={7}>
                            <SelectField
                                name="store_id"
                                label="Store"
                                required
                                options={stores?.map((store) => ({
                                    label: store.name,
                                    value: store.id,
                                }))}
                                value={data.store_id}
                                onChange={(value) => {
                                    const selectValue = value.target.value;
                                    setData("store_id", selectValue);
                                }}
                            />
                        </Col>
                        <Col span={7}>
                            <InputField
                                name="name"
                                label="Name"
                                required
                                value={data.name}
                                onChange={(value) =>
                                    setData("name", value.target.value)
                                }
                            />
                        </Col>
                        <Col span={5}>
                            <DatePickerField
                                required
                                name="start_date"
                                label="Start Date"
                                value={data.start_date}
                                minDate={dayjs()}
                                format="DD/MM/YYYY"
                                onChange={(value) => {
                                    setData("start_date", value);
                                }}
                            />
                        </Col>
                        <Col span={5}>
                            <DatePickerField
                                required
                                name="end_date"
                                label="End Date"
                                value={data.end_date}
                                minDate={data.start_date ?? dayjs()}
                                format="DD/MM/YYYY"
                                onChange={(value) => {
                                    setData("end_date", value);
                                }}
                            />
                        </Col>
                        <Col
                            span={4}
                            className="d-flex justify-content-start align-items-center"
                        >
                            <SwitchField
                                label={"Is Closed"}
                                name={"is_closed"}
                                checked={data.is_closed}
                                onChange={(e) => {
                                    setData("is_closed", e);
                                    {
                                        e && setData("close_time", "");
                                        setData("open_time", "");
                                    }
                                }}
                            />
                        </Col>
                        {!data.is_closed && (
                            <>
                                <Col span={10}>
                                    <TimePickerField
                                        label="Open Time"
                                        name="open_time"
                                        format="HH:mm"
                                        onChange={(value) => {
                                            const selectValue = value
                                                ? value.format("HH:mm")
                                                : "";

                                            setData("open_time", selectValue);
                                        }}
                                        value={
                                            data.open_time
                                                ? dayjs(data.open_time, "HH:mm")
                                                : null
                                        }
                                        error={errors?.open_time}
                                        placeholder="e.g., 10:00"
                                    />
                                </Col>
                                <Col span={10}>
                                    <TimePickerField
                                        label="Close Time"
                                        name="close_time"
                                        format="HH:mm"
                                        onChange={(value) => {
                                            const selectValue = value
                                                ? value.format("HH:mm")
                                                : "";
                                            setData("close_time", selectValue);
                                        }}
                                        value={
                                            data.close_time
                                                ? dayjs(
                                                      data.close_time,
                                                      "HH:mm",
                                                  )
                                                : null
                                        }
                                        error={errors?.close_time}
                                        placeholder="e.g., 16:00"
                                    />
                                </Col>
                            </>
                        )}
                    </Row>
                </Card>
                <Button type="primary" htmlType="submit" loading={processing}>
                    Save
                </Button>
            </Form>
        </div>
    );
}

HolidayFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
