import React from "react";
import { Button, Row, Col, Space, Divider, Card } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import InputField from "@/Components/Form/InputField";
import SelectField from "./Form/SelectField";

export default function PackageCapacityComponent({
    value = [],
    onChange,
    setData,
    stores = [],
}) {
    const data = Array.isArray(value) ? value : [];

    const updateAt = (index, newObj) => {
        const clone = [...data];
        clone[index] = { ...clone[index], ...newObj };
        onChange?.(clone);
    };

    const addNew = () => {
        if (stores.length > data.length) {
            onChange?.([...(data || []), { store_id: "", max_bookings: "" }]);
        }
    };

    const removeAt = (index) => {
        const clone = [...data];
        clone.splice(index, 1);
        onChange?.(clone);
    };

    return (
        <>
            <Divider>Capacity Per Store</Divider>
            <Card>
                {(data || []).map((fp, idx) => (
                    <div key={idx} className="mb-3 p-3 border rounded bg-white">
                        <Row gutter={16} align="middle">
                            <Col xs={24} md={12}>
                                <SelectField
                                    label={"Store"}
                                    name={`capacities[${idx}].store_id`}
                                    options={stores.map((store) => ({
                                        label: store.name,
                                        value: store.id,
                                    }))}
                                    value={fp.store_id}
                                    onChange={(e) => {
                                        setData(
                                            `capacities.${idx}.store_id`,
                                            e.target.value,
                                        );
                                        updateAt(idx, {
                                            store_id: e.target.value,
                                        });
                                    }}
                                />
                            </Col>
                            <Col xs={24} md={6}>
                                <InputField
                                    label={"Max concrurrent bookings"}
                                    name={`capacities[${idx}].max_bookings`}
                                    type="number"
                                    value={fp.max_bookings}
                                    onChange={(e) => {
                                        setData(
                                            `capacities[${idx}].max_bookings`,
                                            e.target.value,
                                        );
                                        updateAt(idx, {
                                            max_bookings: e.target.value,
                                        });
                                    }}
                                />
                            </Col>

                            <Col xs={24} md={6}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeAt(idx)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>
                ))}

                <Button
                    type="dashed"
                    onClick={addNew}
                    icon={<PlusOutlined />}
                    block
                >
                    Add Capacity
                </Button>
            </Card>
        </>
    );
}
