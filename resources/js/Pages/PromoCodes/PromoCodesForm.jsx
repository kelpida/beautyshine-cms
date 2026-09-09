import DatePickerField from "@/Components/Form/DatePickerField";
import InputField from "@/Components/Form/InputField";
import SelectField from "@/Components/Form/SelectField";
import SwitchField from "@/Components/Form/SwitchField";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import { DiscountTypeArray } from "@/enum/DiscountType.enum";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { useForm } from "@inertiajs/react";
import { Card, Divider, Flex, Form, Row, Col, Button } from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function PromoCodesForm({ promoCode = {} }) {
    const [promoData, setPromoData] = useState(promoCode?.data ?? {});

    useEffect(() => {
        setPromoData(promoCode?.data ?? {});
    }, [promoCode]);

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm({
        code: promoData?.code || "",
        discount_type: promoData?.discount_type || "",
        discount_value: promoData?.discount_value || "",
        is_active: promoData?.is_active || false,
        has_limitation: promoData?.has_limitation || false,
        max_discount_amount: promoData?.max_discount_amount || null,
        min_order_amount: promoData?.min_order_amount || "",
        usage_limit: promoData?.usage_limit || "",
        special_user: promoData?.special_user || "",
        start_date: promoData?.start_date || "",
        end_date: promoData?.end_date || "",
    });

    const handleSubmit = () => {
        if (promoData.id) {
            put(route("promo-codes.update", promoData.id), data);
        } else {
            submitPost(route("promo-codes.store"), data);
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={promoCode ? "Update Promo Code" : "Create Promo Code"}
                backAction={RouteList.promoCodes()}
                backName={"View Promo Codes"}
            />
            <Card>
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={data}
                >
                    <Divider>Promo Details</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            {/* Title Input */}
                            <InputField
                                label="Code"
                                name="code"
                                required
                                value={data.code}
                                onChange={(e) => {
                                    setData("code", e.target.value);
                                }}
                                error={errors.code}
                                placeholder="Enter promo code"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <SelectField
                                label="Discount Type"
                                name="discount_type"
                                value={data.discount_type}
                                onChange={(e) =>
                                    setData("discount_type", e.target.value)
                                }
                                options={DiscountTypeArray}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <InputField
                                label="Discount Value"
                                name="discount_value"
                                required
                                value={data.discount_value}
                                onChange={(e) => {
                                    setData("discount_value", e.target.value);
                                }}
                                type="number"
                                error={errors.discount_value}
                                placeholder="Enter discount value"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <Flex
                                gap={16}
                                align="center"
                                style={{ height: "100%" }}
                                justify="end"
                            >
                                <SwitchField
                                    label="Has Limitation"
                                    name="has_limitation"
                                    checked={data.has_limitation}
                                    onChange={(checked) =>
                                        setData("has_limitation", checked)
                                    }
                                />
                                <SwitchField
                                    label="Is Active"
                                    name="is_active"
                                    checked={data.is_active}
                                    onChange={(checked) =>
                                        setData("is_active", checked)
                                    }
                                />
                            </Flex>
                        </Col>
                    </Row>

                    {data.has_limitation && (
                        <>
                            <Divider>Promo Limitations</Divider>
                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <InputField
                                        label="Maximum Discount Amount"
                                        name="max_discount_amount"
                                        value={data.max_discount_amount}
                                        onChange={(e) => {
                                            setData(
                                                "max_discount_amount",
                                                e.target.value,
                                            );
                                        }}
                                        type="number"
                                        error={errors.max_discount_amount}
                                        placeholder="Enter a Maximum discount amount"
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <InputField
                                        label="Minimum Order Amount"
                                        name="min_order_amount"
                                        value={data.min_order_amount}
                                        onChange={(e) =>
                                            setData(
                                                "min_order_amount",
                                                e.target.value,
                                            )
                                        }
                                        type="number"
                                        error={errors.min_order_amount}
                                        placeholder="Enter a minimum order amount"
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <InputField
                                        label="Usage Limit"
                                        name="usage_limit"
                                        value={data.usage_limit}
                                        onChange={(e) =>
                                            setData(
                                                "usage_limit",
                                                e.target.value,
                                            )
                                        }
                                        type="number"
                                        error={errors.usage_limit}
                                        placeholder="Enter usage limit"
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <InputField
                                        label="Special User"
                                        name="special_user"
                                        value={data.special_user}
                                        onChange={(e) =>
                                            setData(
                                                "special_user",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.special_user}
                                        placeholder="Enter a email"
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <DatePickerField
                                        name={"start_date"}
                                        label={"Start Date"}
                                        value={data.start_date}
                                        onChange={(date) =>
                                            setData(
                                                "start_date",
                                                date
                                                    ? date.format("YYYY-MM-DD")
                                                    : null,
                                            )
                                        }
                                        error={errors.start_date}
                                        format="DD-MM-YYYY"
                                        minDate={dayjs()}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <DatePickerField
                                        name={"end_date"}
                                        label={"End Date"}
                                        value={data.end_date}
                                        onChange={(date) =>
                                            setData(
                                                "end_date",
                                                date
                                                    ? date.format("YYYY-MM-DD")
                                                    : null,
                                            )
                                        }
                                        error={errors.end_date}
                                        format="DD-MM-YYYY"
                                        minDate={data.start_date}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                        >
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

PromoCodesForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
