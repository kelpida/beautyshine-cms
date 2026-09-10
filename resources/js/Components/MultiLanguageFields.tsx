import React, { useState, useEffect } from "react";
import { Tabs, Alert, Card } from "antd";
import { GlobalOutlined, WarningOutlined } from "@ant-design/icons";

/**
 * MultiLanguageFields Component
 *
 * Container component that provides language tabs and context.
 * Allows conditional rendering based on current language.
 *
 * Usage:
 * <MultiLanguageFields
 *   languages={languages}
 *   value={data.translates}
 *   onChange={(translates) => setData('translates', translates)}
 * >
 *   {(locale, isDefaultLanguage) => (
 *     <>
 *       <InputField ... />
 *       {isDefaultLanguage && <MediaSelector ... />}
 *     </>
 *   )}
 * </MultiLanguageFields>
 */
export default function MultiLanguageFields({
    languages = [] as any,
    value = [],
    onChange,
    children,
}: any) {
    const [activeTab, setActiveTab] = useState("en");
    const [translationsMap, setTranslationsMap] = useState<any>({});

    // All languages including default English
    const allLanguages = [
        { code: "en", name: "English" },
        ...((languages as any)?.data || languages || []),
    ];

    // Initialize active tab
    useEffect(() => {
        if (allLanguages.length > 0) {
            setActiveTab(allLanguages[0].code);
        }
    }, []);

    // Convert array to map for easier manipulation
    useEffect(() => {
        const map = {};

        // Initialize all languages
        allLanguages.forEach((lang) => {
            map[lang.code] = {
                locale: lang.code,
            };
        });

        // Populate with existing translations
        if (value) {
            if (Array.isArray(value)) {
                value.forEach((trans) => {
                    if (map[trans.locale]) {
                        map[trans.locale] = { ...map[trans.locale], ...trans };
                    }
                });
            } else if (typeof value === "object") {
                Object.entries(value).forEach(([locale, trans]) => {
                    if (map[locale]) {
                        map[locale] = {
                            ...map[locale],
                            ...(trans as any),
                            locale: locale,
                        };
                    }
                });
            }
        }

        setTranslationsMap(map);
    }, [languages, value]);

    // Update a specific field for a specific language
    const updateField = (locale, fieldName, fieldValue) => {
        const updated = {
            ...translationsMap,
            [locale]: {
                ...translationsMap[locale],
                locale: locale,
                [fieldName]: fieldValue,
            },
        };

        setTranslationsMap(updated);

        // Convert map back to array, including all translations
        const translatesArray = Object.values(updated);

        onChange?.(translatesArray);
    };

    // No languages available
    if (!allLanguages || allLanguages.length === 0) {
        return (
            <Card>
                <Alert
                    message="No Active Languages"
                    description="Please activate at least one language in the Language settings to enable translations."
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                />
            </Card>
        );
    }

    // Create tab items for each language
    const tabItems = allLanguages.map((language) => {
        const translationData = translationsMap[language.code] || {
            locale: language.code,
        };

        const isDefaultLanguage = language.code === "en";

        return {
            key: language.code,
            label: (
                <span>
                    <GlobalOutlined style={{ marginRight: 8 }} />
                    {language.name}
                </span>
            ),
            children: (
                <div style={{ padding: "16px 0" }}>
                    {typeof children === "function"
                        ? children(
                              language.code,
                              isDefaultLanguage,
                              translationData,
                              (fieldName, fieldValue) =>
                                  updateField(
                                      language.code,
                                      fieldName,
                                      fieldValue
                                  )
                          )
                        : children}
                </div>
            ),
        };
    });

    return (
        <Card style={{ marginBottom: 24 }}>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                type="card"
                size="large"
            />
        </Card>
    );
}
