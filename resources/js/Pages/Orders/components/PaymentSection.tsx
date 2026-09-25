import SelectField from "@/Components/Form/SelectField";
import { OrderSourceOptions } from "@/enum/OrderSource.enum";
import { PaymentMethodsOptions } from "@/enum/PaymentMethods.enum";
import { Button, Col, Flex, Row } from "antd";
import React from "react";

export default function PaymentSection({
    selectedPayment,
    setSelectedPayment,
    onBack,
    processing,
}) {
    return (
        <div>
            <SelectField
                name={"source"}
                label={"Order Source"}
                options={OrderSourceOptions}
                value={selectedPayment.source}
                onChange={(e) => setSelectedPayment("source", e.target.value)}
            />
            <SelectField
                name={"payment_method"}
                label={"Payment Method"}
                options={PaymentMethodsOptions}
                value={selectedPayment.payment_method}
                onChange={(e) =>
                    setSelectedPayment("payment_method", e.target.value)
                }
            />
            <Flex justify="space-between" align="center" className="mt-5">
                <Button onClick={() => onBack()} type="primary">
                    Back Step
                </Button>
                <Button type="primary" htmlType="submit" loading={processing}>
                    Complete
                </Button>
            </Flex>
        </div>
    );
}
