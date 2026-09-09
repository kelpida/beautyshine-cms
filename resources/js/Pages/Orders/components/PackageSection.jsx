import {
    CheckOutlined,
    PlusOutlined,
    UserAddOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Divider,
    Flex,
    InputNumber,
    Row,
    Typography,
} from "antd";
import React from "react";

const { Text } = Typography;

export default function PackageSection({
    packages,
    selectedPackages = [],
    setSelectedPackages,
    onNext,
}) {
    const handleSelectPackage = (pkg) => {
        const exists = selectedPackages.some((p) => p.item_id === pkg.id);

        if (exists) {
            setSelectedPackages(
                selectedPackages.filter((p) => p.item_id !== pkg.id),
            );
        } else {
            setSelectedPackages([
                ...selectedPackages,
                {
                    item_id: pkg.id,
                    quantity: 1,
                },
            ]);
        }
    };

    const handleQuantityChange = (pkgId, quantity) => {
        setSelectedPackages(
            selectedPackages.map((pkg) =>
                pkg.item_id === pkgId
                    ? { ...pkg, quantity: quantity ?? 1 }
                    : pkg,
            ),
        );
    };

    return (
        <>
            <Divider>Select Package</Divider>

            <Row gutter={[16, 16]} className="mt-5">
                {packages?.data?.map((pkg) => {
                    const selectedPackage = selectedPackages.find(
                        (p) => p.item_id === pkg.id,
                    );

                    const isSelected = !!selectedPackage;

                    return (
                        <Col key={pkg.id} xs={24} md={6}>
                            <Card
                                size="small"
                                title={pkg.name}
                                className="h-100"
                                styles={{ body: { minHeight: "300px" } }}
                                actions={[
                                    <Button
                                        type={
                                            isSelected ? "primary" : "default"
                                        }
                                        icon={
                                            isSelected ? (
                                                <CheckOutlined />
                                            ) : (
                                                <PlusOutlined />
                                            )
                                        }
                                        onClick={() => handleSelectPackage(pkg)}
                                    >
                                        {isSelected ? "Cancel" : "Add"}
                                    </Button>,

                                    <InputNumber
                                        mode="spinner"
                                        min={1}
                                        disabled={!isSelected}
                                        defaultValue={1}
                                        style={{ width: "120px" }}
                                        onChange={(e) =>
                                            handleQuantityChange(pkg.id, e)
                                        }
                                    />,
                                ]}
                            >
                                <Text type="secondary">
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: pkg.description,
                                        }}
                                    />
                                </Text>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
            <Flex justify="end" className="mt-5">
                <Button onClick={() => onNext()} type="primary">
                    Next Step
                </Button>
            </Flex>
        </>
    );
}
