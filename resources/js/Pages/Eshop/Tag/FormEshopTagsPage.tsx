import InputField from "@/Components/Form/InputField";
import SwitchField from "@/Components/Form/SwitchField";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import AdminLayout from "@/Layouts/AdminLayout";
import { slugifyFields } from "@/lib/InputHelper";
import { RouteList } from "@/routes/RouteList";
import { useForm, router } from "@inertiajs/react";
import { Button, Card, Col, Divider, Form, Row, Space } from "antd";
import React from "react";

interface EshopTagTranslation {
    id?: number;
    locale: string;
    name: string;
}

interface EshopTagData {
    id: number;
    name?: string;
    slug: string;
    sort_order?: number;
    is_active?: boolean;
    translates?: EshopTagTranslation[];
    [key: string]: any;
}

interface FormEshopTagsPageProps {
    languages?: any;
    eshopTag?: EshopTagData | null;
    nextSortOrder?: number;
}

export default function FormEshopTagsPage({
    languages = [],
    eshopTag = null,
    nextSortOrder = 1,
}: FormEshopTagsPageProps) {
    const isEditing = Boolean(eshopTag && eshopTag.id);

    const prepareInitialTranslations = () => {
        if (!eshopTag) {
            return [];
        }

        const translations: EshopTagTranslation[] = [
            {
                locale: "en",
                name: eshopTag.name || "",
            },
        ];

        if (Array.isArray(eshopTag.translates)) {
            eshopTag.translates.forEach((trans) => {
                if (trans.locale !== "en") {
                    translations.push({
                        locale: trans.locale,
                        name: trans.name || "",
                    });
                }
            });
        }

        return translations;
    };

    const { data, setData, post, put, processing, errors } = useForm({
        name: eshopTag?.name || "",
        slug: eshopTag?.slug || "",
        sort_order: eshopTag?.sort_order ?? nextSortOrder ?? 1,
        is_active: eshopTag ? Boolean(eshopTag.is_active) : true,
        default_locale: "en",
        translations: prepareInitialTranslations(),
    });

    const handleSubmit = () => {
        const englishTranslation = (
            data.translations as EshopTagTranslation[]
        )?.find((t) => t.locale === "en");

        const payload = {
            ...data,
            name: englishTranslation?.name || data.name,
            slug:
                data.slug ||
                slugifyFields(englishTranslation?.name || data.name),
        };

        const targetUrl = isEditing
            ? RouteList.editEshopTag?.(eshopTag!.id) ||
              `/eshop-tags/${eshopTag!.id}`
            : RouteList.eshopTags?.() || "/eshop-tags";

        if (isEditing) {
            put(targetUrl);
        } else {
            post(targetUrl);
        }
    };

    return (
        <div>
            <PopupFormMessage errors={errors} />

            <PageHeaderActions
                title={
                    isEditing
                        ? `Edit Tag: ${eshopTag?.name || eshopTag?.slug || ""}`
                        : "Create Eshop Tag"
                }
                backAction={RouteList.eshopTags()}
                backName="View Tags"
            />

            <Form layout="vertical" onFinish={handleSubmit}>
                <Card>
                    <Divider>Tag Details & Translations</Divider>

                    <MultiLanguageFields
                        languages={languages}
                        value={data.translations}
                        onChange={(translations: EshopTagTranslation[]) => {
                            setData("translations", translations);

                            const enTrans = translations.find(
                                (t) => t.locale === "en",
                            );
                            if (enTrans) {
                                if (enTrans.name) {
                                    setData("name", enTrans.name);
                                }
                            }
                        }}
                    >
                        {(
                            locale: string,
                            isDefaultLanguage: boolean,
                            translationData: EshopTagTranslation,
                            updateField: (field: string, val: any) => void,
                        ) => (
                            <Row gutter={16}>
                                <Col xs={24} md={isDefaultLanguage ? 18 : 24}>
                                    <InputField
                                        label={`Tag Name (${locale.toUpperCase()})`}
                                        name={`translations[${locale}][name]`}
                                        required
                                        value={translationData.name || ""}
                                        onChange={(e: any) => {
                                            const val = e.target.value;
                                            updateField("name", val);

                                            if (
                                                isDefaultLanguage &&
                                                !isEditing
                                            ) {
                                                setData(
                                                    "slug",
                                                    slugifyFields(val),
                                                );
                                            }
                                        }}
                                        error={
                                            errors[
                                                `translations.${locale}.name`
                                            ] ||
                                            (isDefaultLanguage
                                                ? errors.name
                                                : undefined)
                                        }
                                        placeholder="e.g. Best Seller, Summer, Wedding"
                                    />
                                </Col>

                                {isDefaultLanguage && (
                                    <>
                                        <Col
                                            xs={24}
                                            md={6}
                                            lg={6}
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <SwitchField
                                                label="Tag Status"
                                                name="is_active"
                                                checked={data.is_active}
                                                onChange={(checked: boolean) =>
                                                    setData(
                                                        "is_active",
                                                        checked,
                                                    )
                                                }
                                                valueA="Active"
                                                valueB="Inactive"
                                                error={errors.is_active}
                                            />
                                        </Col>
                                        <Col xs={24} md={18}>
                                            <InputField
                                                label="URL Slug"
                                                name="slug"
                                                required
                                                disabled={isEditing}
                                                value={data.slug}
                                                onChange={(e: any) =>
                                                    setData(
                                                        "slug",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors.slug}
                                                placeholder="e.g. best-seller"
                                            />
                                        </Col>
                                    </>
                                )}
                            </Row>
                        )}
                    </MultiLanguageFields>

                    <Space style={{ width: "100%" }} size="middle">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={processing}
                            block
                        >
                            {isEditing ? "Update Tag" : "Save Tag"}
                        </Button>
                    </Space>
                </Card>
            </Form>
        </div>
    );
}

FormEshopTagsPage.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);
