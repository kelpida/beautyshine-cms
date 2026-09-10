import React from "react";
import { Button, Row, Col, Space, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import MediaSelector from "@/Components/MediaSelector";
import MultiLanguageFields from "@/Components/MultiLanguageFields";
import InputField from "@/Components/Form/InputField";

export default function FloorPlanEditor({
    value = [],
    onChange,
    existingFiles = [],
    languages = [] as any,
    setData,
    accept = "image/*,application/pdf",
}: any) {
    const floorPlans = Array.isArray(value) ? value : [];

    const updateAt = (index, newObj) => {
        const clone = [...floorPlans];
        clone[index] = { ...clone[index], ...newObj };
        onChange?.(clone);
    };

    const addNew = () => {
        const locales = [
            { locale: "en", name: "" },
            ...(languages?.data || languages || []).map((l) => ({
                locale: l.code || l,
                name: "",
            })),
        ];

        onChange?.([
            ...(floorPlans || []),
            { files: "", name: "", translate: locales },
        ]);
    };

    const removeAt = (index) => {
        const clone = [...floorPlans];
        clone.splice(index, 1);
        onChange?.(clone);
    };

    const handleBlurTranslate = async (text, fieldName) => {
        if (!text) return;

        const langs = languages?.data || languages || [];

        const indexMatch = fieldName.match(/\[(\d+)\]/);
        if (!indexMatch) return;

        const index = Number(indexMatch[1]);

        const clone = [...floorPlans];
        const translates = [...(clone[index]?.translate || [])];

        try {
            for (const language of langs) {
                if (["en", "el"].includes(language.code)) continue;

                const response = await axios.post("/google-translate", {
                    text,
                    locale: language.code,
                });

                const translatedText =
                    response?.data?.data?.translations?.[0]?.translatedText;

                if (!translatedText) continue;

                const tIndex = translates.findIndex(
                    (t) => t.locale === language.code
                );

                if (tIndex !== -1) {
                    translates[tIndex] = {
                        ...translates[tIndex],
                        name: translatedText,
                    };
                } else {
                    translates.push({
                        locale: language.code,
                        name: translatedText,
                    });
                }
            }

            clone[index] = {
                ...clone[index],
                translate: translates,
            };

            onChange?.(clone);
        } catch (error) {
            console.error("Translation error:", error);
        }
    };

    return (
        <div>
            <Divider>Floor Plans</Divider>
            {(floorPlans || []).map((fp, idx) => (
                <div key={idx} className="mb-3 p-3 border rounded bg-white">
                    <Row gutter={16} align="middle">
                        <Col xs={24} md={6}>
                            <MediaSelector
                                label={`Floor Plan #${idx + 1}`}
                                existingImages={existingFiles}
                                images={fp?.files ? [fp.files] : []}
                                placeholder="No selected floor plan."
                                maxCount={1}
                                accept={accept}
                                setImages={(selected) => {
                                    const sel = selected?.[0] || null;
                                    updateAt(idx, { files: sel });
                                }}
                            />
                        </Col>

                        <Col xs={24} md={12}>
                            <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                            >
                                <MultiLanguageFields
                                    languages={languages}
                                    value={
                                        fp?.translate || fp?.translates || []
                                    }
                                    onChange={(trans) =>
                                        updateAt(idx, { translate: trans })
                                    }
                                >
                                    {(
                                        locale,
                                        isDefaultLanguage,
                                        translationData,
                                        updateField
                                    ) => (
                                        <InputField
                                            label={`Name`}
                                            name={`floor_plan[${idx}].translate[${locale}].name`}
                                            placeholder={`Name (${locale})`}
                                            value={translationData?.name || ""}
                                            onBlur={(e) =>
                                                isDefaultLanguage &&
                                                handleBlurTranslate(
                                                    e.target.value,
                                                    `floor_plan[${idx}].translate[${locale}].name`
                                                )
                                            }
                                            onChange={(e) => {
                                                updateField(
                                                    "name",
                                                    e.target.value
                                                );
                                                isDefaultLanguage &&
                                                    setData(
                                                        `floor_plan[${idx}].name`,
                                                        e.target.value
                                                    );
                                            }}
                                        />
                                    )}
                                </MultiLanguageFields>
                            </Space>
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
                Add Floor Plan
            </Button>
        </div>
    );
}
