import React, { useEffect, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import InputField from "@/Components/Form/InputField";
import SelectField from "@/Components/Form/SelectField";
import SwitchField from "@/Components/Form/SwitchField";
import MediaSelector from "@/Components/MediaSelector";
import { RouteList } from "@/routes/RouteList";
import { useForm } from "@inertiajs/react";
import { Alert, Button, Card, Col, Divider, Form, Row } from "antd";

import {
    PaymentProviderCode,
    PaymentProviderCodeLabels,
    PaymentProviderCodeOptions,
    PaymentProviderStatus,
    PaymentProviderStatusOptions,
} from "@/enum/PaymentProvider.enum";

interface FormPaymentProviderPageProps {
    paymentProvider?: any;
    images?: any;
}

export default function FormPaymentProviderPage({
    paymentProvider = null,
    images = [],
}: FormPaymentProviderPageProps) {
    const rawProvider = paymentProvider?.data || paymentProvider;
    const isEdit = Boolean(rawProvider && rawProvider.id);

    const initialLogo = rawProvider?.logo
        ? [rawProvider.logo]
        : rawProvider?.logo_id
          ? [{ id: rawProvider.logo_id }]
          : [];

    const [selectedLogo, setSelectedLogo] = useState<any[]>(initialLogo);

    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm<any>({
        code: rawProvider?.code || PaymentProviderCode.VIVA,
        name: rawProvider?.name || PaymentProviderCodeLabels[PaymentProviderCode.VIVA],
        description: rawProvider?.description || "",
        status: rawProvider?.status || PaymentProviderStatus.ACTIVE,
        is_production: Boolean(rawProvider?.is_production ?? false),
        logo_id: rawProvider?.logo_id ?? null,
        // Viva Wallet
        merchant_id:
            rawProvider?.merchant_id ||
            rawProvider?.credentials?.merchant_id ||
            "",
        api_key:
            rawProvider?.api_key || rawProvider?.credentials?.api_key || "",
        client_id:
            rawProvider?.client_id ||
            rawProvider?.credentials?.client_id ||
            "",
        client_secret:
            rawProvider?.client_secret ||
            rawProvider?.credentials?.client_secret ||
            "",
        source_code:
            rawProvider?.source_code ||
            rawProvider?.credentials?.source_code ||
            "",
        // Stripe / Revolut
        public_key:
            rawProvider?.public_key ||
            rawProvider?.credentials?.public_key ||
            "",
        secret_key:
            rawProvider?.secret_key ||
            rawProvider?.credentials?.secret_key ||
            "",
        webhook_secret:
            rawProvider?.webhook_secret ||
            rawProvider?.credentials?.webhook_secret ||
            "",
        // JCC
        acquirer_id:
            rawProvider?.acquirer_id ||
            rawProvider?.credentials?.acquirer_id ||
            "",
        signature_key:
            rawProvider?.signature_key ||
            rawProvider?.credentials?.signature_key ||
            "",
    });

    useEffect(() => {
        if (rawProvider?.logo) {
            setSelectedLogo([rawProvider.logo]);
        } else if (rawProvider?.logo_id) {
            setSelectedLogo([{ id: rawProvider.logo_id }]);
        }
    }, [paymentProvider]);

    const handleCodeChange = (e: any) => {
        const newCode = e?.target?.value || e;

        setData((prev: any) => ({
            ...prev,
            code: newCode,
            name:
                !prev.name ||
                Object.values(PaymentProviderCodeLabels).includes(prev.name)
                    ? PaymentProviderCodeLabels[newCode as PaymentProviderCode] || newCode
                    : prev.name,
        }));
    };

    const handleSubmit = () => {
        if (rawProvider?.id) {
            put(route("payment-providers.update", rawProvider.id));
        } else {
            submitPost(route("payment-providers.store"));
        }
    };

    const currentProviderLabel =
        PaymentProviderCodeLabels[data.code as PaymentProviderCode] || data.code;

    return (
        <div>
            <PopupFormMessage errors={errors} />

            <PageHeaderActions
                title={
                    isEdit
                        ? `Edit Payment Provider: ${rawProvider?.name || ""}`
                        : "Create Payment Provider"
                }
                backAction={RouteList.paymentProviders()}
                backName="Back to Payment Providers"
            />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={data}
            >
                <Card className="mb-4">
                    <Divider>General Details</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <SelectField
                                name="code"
                                label="Provider Type"
                                required
                                value={data.code}
                                options={PaymentProviderCodeOptions}
                                error={errors.code}
                                onChange={handleCodeChange}
                                disabled={isEdit}
                            />
                        </Col>

                        <Col xs={24} md={12}>
                            <InputField
                                name="name"
                                label="Display Name"
                                required
                                value={data.name}
                                error={errors.name}
                                placeholder="e.g. Viva Wallet"
                                onChange={(e: any) =>
                                    setData("name", e.target.value)
                                }
                            />
                        </Col>

                        <Col xs={24} md={12}>
                            <SelectField
                                name="status"
                                label="Status"
                                required
                                value={data.status}
                                options={PaymentProviderStatusOptions}
                                error={errors.status}
                                onChange={(e: any) =>
                                    setData("status", e.target.value)
                                }
                            />
                        </Col>

                        <Col xs={24} md={12} className="flex items-center">
                            <SwitchField
                                name="is_production"
                                label="Environment Mode"
                                valueB="Sandbox / Test"
                                valueA="Live / Production"
                                checked={data.is_production}
                                error={errors.is_production}
                                onChange={(checked: boolean) =>
                                    setData("is_production", checked)
                                }
                            />
                        </Col>

                        <Col xs={24}>
                            <InputField
                                name="description"
                                label="Description (Optional)"
                                value={data.description}
                                error={errors.description}
                                placeholder="Payment instructions or checkout notes"
                                onChange={(e: any) =>
                                    setData("description", e.target.value)
                                }
                            />
                        </Col>
                    </Row>

                    <Divider>Provider Logo</Divider>
                    <MediaSelector
                        label="Provider Logo (Optional)"
                        maxCount={1}
                        existingImages={images?.data || images || []}
                        images={selectedLogo}
                        setImages={(newImages: any) => {
                            setSelectedLogo(newImages);
                            setData("logo_id", newImages[0]?.id ?? null);
                        }}
                        buttonText="Select Logo"
                    />

                    <Divider>API Credentials ({currentProviderLabel})</Divider>

                    {data.is_production ? (
                        <Alert
                            type="warning"
                            showIcon
                            className="mb-4"
                            message="Live / Production Mode"
                            description="You are configuring LIVE credentials. Real transactions and monetary charges will be processed."
                        />
                    ) : (
                        <Alert
                            type="info"
                            showIcon
                            className="mb-4"
                            message="Sandbox / Testing Mode"
                            description="Use test or sandbox credentials to verify payment integrations safely without real charges."
                        />
                    )}

                    {/* VIVA WALLET */}
                    {data.code === "viva" && (
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="merchant_id"
                                    label="Merchant ID"
                                    value={data.merchant_id}
                                    error={errors.merchant_id}
                                    placeholder="e.g. 12345678-abcd-1234-abcd-1234567890ab"
                                    onChange={(e: any) =>
                                        setData("merchant_id", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="source_code"
                                    label="Source Code"
                                    value={data.source_code}
                                    error={errors.source_code}
                                    placeholder="e.g. Default or 1234"
                                    onChange={(e: any) =>
                                        setData("source_code", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="client_id"
                                    label="Smart Checkout Client ID"
                                    value={data.client_id}
                                    error={errors.client_id}
                                    placeholder="OAuth Client ID"
                                    onChange={(e: any) =>
                                        setData("client_id", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="client_secret"
                                    label="Smart Checkout Client Secret"
                                    type="password"
                                    value={data.client_secret}
                                    error={errors.client_secret}
                                    placeholder="OAuth Client Secret"
                                    onChange={(e: any) =>
                                        setData("client_secret", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24}>
                                <InputField
                                    name="api_key"
                                    label="API Key"
                                    type="password"
                                    value={data.api_key}
                                    error={errors.api_key}
                                    placeholder="API Key"
                                    onChange={(e: any) =>
                                        setData("api_key", e.target.value)
                                    }
                                />
                            </Col>
                        </Row>
                    )}

                    {/* STRIPE */}
                    {data.code === "stripe" && (
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="public_key"
                                    label="Publishable Key"
                                    value={data.public_key}
                                    error={errors.public_key}
                                    placeholder="pk_live_... or pk_test_..."
                                    onChange={(e: any) =>
                                        setData("public_key", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="secret_key"
                                    label="Secret Key"
                                    type="password"
                                    value={data.secret_key}
                                    error={errors.secret_key}
                                    placeholder="sk_live_... or sk_test_..."
                                    onChange={(e: any) =>
                                        setData("secret_key", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24}>
                                <InputField
                                    name="webhook_secret"
                                    label="Webhook Secret (Optional)"
                                    type="password"
                                    value={data.webhook_secret}
                                    error={errors.webhook_secret}
                                    placeholder="whsec_..."
                                    onChange={(e: any) =>
                                        setData("webhook_secret", e.target.value)
                                    }
                                />
                            </Col>
                        </Row>
                    )}

                    {/* JCC PAYMENT SYSTEMS */}
                    {data.code === "jcc" && (
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="merchant_id"
                                    label="Merchant ID"
                                    value={data.merchant_id}
                                    error={errors.merchant_id}
                                    placeholder="JCC Merchant ID"
                                    onChange={(e: any) =>
                                        setData("merchant_id", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="acquirer_id"
                                    label="Acquirer ID"
                                    value={data.acquirer_id}
                                    error={errors.acquirer_id}
                                    placeholder="JCC Acquirer ID"
                                    onChange={(e: any) =>
                                        setData("acquirer_id", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="api_key"
                                    label="Merchant Password"
                                    type="password"
                                    value={data.api_key}
                                    error={errors.api_key}
                                    placeholder="Merchant Password"
                                    onChange={(e: any) =>
                                        setData("api_key", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="signature_key"
                                    label="Signature / Secret Key"
                                    type="password"
                                    value={data.signature_key}
                                    error={errors.signature_key}
                                    placeholder="Signature Key"
                                    onChange={(e: any) =>
                                        setData("signature_key", e.target.value)
                                    }
                                />
                            </Col>
                        </Row>
                    )}

                    {/* REVOLUT BUSINESS */}
                    {data.code === "revolut" && (
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="public_key"
                                    label="Client Public Key"
                                    value={data.public_key}
                                    error={errors.public_key}
                                    placeholder="Revolut Public Key for checkout"
                                    onChange={(e: any) =>
                                        setData("public_key", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <InputField
                                    name="secret_key"
                                    label="Secret API Key"
                                    type="password"
                                    value={data.secret_key}
                                    error={errors.secret_key}
                                    placeholder="Revolut Secret API Key"
                                    onChange={(e: any) =>
                                        setData("secret_key", e.target.value)
                                    }
                                />
                            </Col>
                            <Col xs={24}>
                                <InputField
                                    name="webhook_secret"
                                    label="Webhook Secret (Optional)"
                                    type="password"
                                    value={data.webhook_secret}
                                    error={errors.webhook_secret}
                                    placeholder="Revolut Webhook Secret"
                                    onChange={(e: any) =>
                                        setData("webhook_secret", e.target.value)
                                    }
                                />
                            </Col>
                        </Row>
                    )}
                </Card>

                <Form.Item className="mt-4">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={processing}
                    >
                        Save
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

FormPaymentProviderPage.layout = (page: any) => (
    <AdminLayout>{page}</AdminLayout>
);
