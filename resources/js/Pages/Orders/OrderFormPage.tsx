import PageHeaderActions from "@/Components/PageHeaderActions";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { router, useForm } from "@inertiajs/react";
import { Button, Card, Form, message, Steps } from "antd";
import React, { useState } from "react";
import PackageSection from "./components/PackageSection";
import ClientSection from "./components/ClientSection";
import AppointmentSection from "./components/AppointmentSection";
import PaymentSection from "./components/PaymentSection";
import dayjs from "dayjs";

export default function OrderFormPage({
    packages,
    clients,
    stores,
}: {
    packages?: any;
    clients?: any;
    stores?: any;
}) {
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [selectedClient, setSelectedClient] = useState({});

    const [stepsSetting, setStepsSetting] = useState({
        currentStep: 0,
        completedStep: [] as number[],
    });

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
        transform,
    } = useForm<any>({
        items: [],
        client_id: undefined,
        source: undefined,
        payment_method: undefined,
        client: {
            name: "",
            surname: "",
            password: "",
            email: "",
            password_confirmation: "",
            phone_code: "",
            phone: "",
            address: "",
        },
        appointments: {
            store_id: undefined,
            date: "",
            start_time: "",
            end_time: "",
            duration: "",
        },
    });
    console.log("🚀 ~ OrderFormPage ~ data:", data);

    const handleNextStep = () => {
        if (stepsSetting.currentStep == 0) {
            if (data.items.length == 0) {
                message.error("Please select packages first");
                return;
            }
        }
        if (stepsSetting.currentStep === 1) {
            const hasExistingClient = !!data.client_id;

            const hasNewClient =
                data.client.name &&
                data.client.surname &&
                data.client.password &&
                data.client.password_confirmation &&
                data.client.phone_code &&
                data.client.phone &&
                data.client.email &&
                data.client.address;

            if (!hasExistingClient && !hasNewClient) {
                message.error("Please select or create a client first");
                return;
            }
        }
        setStepsSetting((prev) => ({
            ...prev,
            currentStep: prev.currentStep + 1,
            completedStep: [
                ...new Set([...prev.completedStep, prev.currentStep]),
            ],
        }));
    };
    const handleBackStep = () => {
        setStepsSetting((prev) => ({
            ...prev,
            currentStep: prev.currentStep - 1,
        }));
    };

    const onChange = (value: any) => {
        if (value < stepsSetting.currentStep) {
            setStepsSetting((prev) => ({ ...prev, currentStep: value }));
        } else {
            message.error("Please complete the current step");
        }
    };

    const renderStatus = (step: any) => {
        if (step == stepsSetting.currentStep) return "process";
        if (stepsSetting.completedStep.includes(step)) return "finish";
        return "wait";
    };

    const handleSubmit = () => {
        transform((data: any) => ({
            ...data,
            appointments: {
                ...data.appointments,
                date: dayjs(data.appointments.date, "DD-MM-YYYY").format(
                    "YYYY-MM-DD",
                ),
            },
        }));

        submitPost(route("orders.store"));
    };

    const renderStepContent = () => {
        switch (stepsSetting.currentStep) {
            case 0:
                return (
                    <PackageSection
                        packages={packages}
                        setSelectedPackages={(packages: any) =>
                            setData("items", packages)
                        }
                        selectedPackages={data.items}
                        onNext={() => handleNextStep()}
                    />
                );

            case 1:
                return (
                    <ClientSection
                        clients={clients}
                        selectedClient={{
                            client_id: data.client_id,
                            name: data?.client?.name,
                            surname: data?.client?.surname,
                            password: data?.client?.password,
                            password_confirmation:
                                data?.client?.password_confirmation,
                            phone_code: data?.client?.phone_code,
                            phone: data?.client?.phone,
                            email: data?.client?.email,
                            address: data?.client?.address,
                        }}
                        setSelectClient={setData}
                        resetSelectedClient={() =>
                            setData({
                                ...data,
                                client_id: undefined,
                                client: {
                                    name: "",
                                    surname: "",
                                    password: "",
                                    email: "",
                                    password_confirmation: "",
                                    phone_code: "",
                                    phone: "",
                                    address: "",
                                },
                            })
                        }
                        onNext={() => handleNextStep()}
                        onBack={() => handleBackStep()}
                    />
                );

            case 2:
                return (
                    <AppointmentSection
                        onBack={() => handleBackStep()}
                        onNext={() => handleNextStep()}
                        stores={stores}
                        setAppointment={setData}
                        appointment={data}
                    />
                );
            case 3:
                return (
                    <PaymentSection
                        onBack={() => handleBackStep()}
                        setSelectedPayment={setData}
                        selectedPayment={data}
                        processing={processing}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div>
            <PageHeaderActions
                title={"Create Appointment"}
                backAction={RouteList.orders()}
                backName={"View Orders"}
                children={
                    <Button
                        color="orange"
                        type="default"
                        variant="solid"
                        icon={<CalendarOutlined />}
                        onClick={() =>
                            router.visit(RouteList.orderCalendar(), {
                                preserveScroll: true,
                                preserveState: true,
                            })
                        }
                    >
                        View Appointment Calendar
                    </Button>
                }
            />
            <Card
                className="p-4"
                title={
                    <Steps
                        className="mb-4"
                        titlePlacement="vertical"
                        current={stepsSetting.currentStep}
                        items={[
                            {
                                title: "Step 1",
                                icon: <ShoppingCartOutlined />,
                                status: renderStatus(0),
                                content: "Packages",
                            },
                            {
                                title: "Step 2",
                                icon: <UserOutlined />,
                                status: renderStatus(1),
                                content: "Client Information",
                            },
                            {
                                title: "Step 3",
                                icon: <CalendarOutlined />,
                                status: renderStatus(2),
                                content: "Appointment Information",
                            },
                            {
                                title: "Step 4",
                                icon: <ShopOutlined />,
                                status: renderStatus(3),
                                content: "Payment Information",
                            },
                        ]}
                    />
                }
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={data}
                >
                    {renderStepContent()}
                </Form>
            </Card>
        </div>
    );
}

OrderFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
