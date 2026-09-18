import React, { useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
    Card,
    Button,
    Space,
    Tabs,
    Input,
    Typography,
    Divider,
    Badge,
    Tooltip,
} from "antd";
import {
    DeleteOutlined,
    DragOutlined,
    PictureOutlined,
    FileTextOutlined,
    UnorderedListOutlined,
    FontSizeOutlined,
    LinkOutlined,
    DashOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    EditOutlined,
    LayoutOutlined,
} from "@ant-design/icons";
import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import MediaSelector from "@/Components/MediaSelector";

const { Title, Text } = Typography;

// Block type definitions with enhanced styling
const BLOCK_TYPES = [
    {
        id: "heading",
        label: "Heading",
        icon: <FontSizeOutlined />,
        color: "#1890ff",
        description: "Title or heading",
    },
    {
        id: "text",
        label: "Text",
        icon: <FileTextOutlined />,
        color: "#52c41a",
        description: "Rich text content",
    },
    {
        id: "button",
        label: "Button",
        icon: <LinkOutlined />,
        color: "#fa8c16",
        description: "Call-to-action button",
    },
    {
        id: "media",
        label: "Media",
        icon: <PictureOutlined />,
        color: "#eb2f96",
        description: "Image or video",
    },
    {
        id: "carousel",
        label: "Carousel",
        icon: <DashOutlined />,
        color: "#722ed1",
        description: "Image slider",
    },
    {
        id: "list",
        label: "List",
        icon: <UnorderedListOutlined />,
        color: "#13c2c2",
        description: "Bullet or numbered list",
    },
    {
        id: "feature",
        label: "Feature (Hero / Intro)",
        icon: <LayoutOutlined />,
        color: "#fa541c",
        description: "Composite block for Hero/Feature sections",
    },
];

export default function FlexibleContentBuilder({
    blocks = [],
    onChange,
    languages = [],
    availableImages = [],
}) {
    const [expandedBlock, setExpandedBlock] = useState(null);

    const allLanguages = [
        { code: "en", name: "English" },
        ...languages.map((lang) => ({ code: lang.code, name: lang.name })),
    ];

    const handleBlurTranslate = async (
        text,
        blockId,
        fieldName,
        extraIndex = null
    ) => {
        if (!text) return;

        try {
            // ✅ Start from latest blocks
            let updatedBlocks = [...blocks];

            for (const language of allLanguages) {
                if (language.code === "en" || language.code === "el") continue;

                const response = await axios.post("/google-translate", {
                    text,
                    locale: language.code,
                });

                const translated =
                    response?.data?.data?.translations?.[0]?.translatedText;

                if (!translated) continue;

                updatedBlocks = updatedBlocks.map((block) => {
                    if (block.id !== blockId) return block;

                    const langContent = { ...block.content[language.code] };

                    // ✅ Simple fields
                    if (extraIndex === null) {
                        langContent[fieldName] = translated;
                    }

                    // ✅ Carousel slides
                    if (
                        Array.isArray(langContent.slides) &&
                        extraIndex !== null
                    ) {
                        langContent.slides = langContent.slides.map(
                            (slide, i) =>
                                i === extraIndex
                                    ? { ...slide, [fieldName]: translated }
                                    : slide
                        );
                    }

                    // ✅ List items
                    if (
                        Array.isArray(langContent.items) &&
                        extraIndex !== null
                    ) {
                        langContent.items = langContent.items.map((item, i) =>
                            i === extraIndex ? translated : item
                        );
                    }

                    return {
                        ...block,
                        content: {
                            ...block.content,
                            [language.code]: langContent,
                        },
                    };
                });
            }

            // ✅ Update state ONCE
            onChange(updatedBlocks);
        } catch (error) {
            console.error("Translation error:", error);
        }
    };

    const createBlock = (type) => {
        const newBlock = {
            id: `block-${Date.now()}`,
            type: type.id,
            label: "", // Custom label for this block instance
            content: {},
        };

        allLanguages.forEach((lang) => {
            newBlock.content[lang.code] = getBlockTemplate(type.id);
        });

        return newBlock;
    };

    const getBlockTemplate = (type) => {
        switch (type) {
            case "feature":
                return { heading: "", subheading: "", text: "", button_text: "", button_link: "", image_id: null };
            case "heading":
                return { text: "" };
            case "text":
                return { content: "" };
            case "button":
                return {
                    text: "",
                    link: "",
                    target: "_self",
                    action: "",
                    style: "primary",
                };
            case "media":
                return { caption: "", image_id: null };
            case "carousel":
                return {
                    slides: [{ caption: "", description: "", image_id: null }],
                };
            case "list":
                return { items: [""] };
            default:
                return {};
        }
    };

    const addBlock = (blockType) => {
        const newBlock = createBlock(blockType);
        onChange([...blocks, newBlock]);
        setExpandedBlock(newBlock.id);
    };

    const deleteBlock = (blockId) => {
        onChange(blocks.filter((b) => b.id !== blockId));
        if (expandedBlock === blockId) setExpandedBlock(null);
    };

    const updateBlockLabel = (blockId, label) => {
        const updated = blocks.map((block) => {
            if (block.id === blockId) {
                return { ...block, label };
            }
            return block;
        });
        onChange(updated);
    };

    const updateBlockContent = (blockId, langCode, field, value) => {
        const updated = blocks.map((block) => {
            if (block.id === blockId) {
                return {
                    ...block,
                    content: {
                        ...block.content,
                        [langCode]: {
                            ...block.content[langCode],
                            [field]: value,
                        },
                    },
                };
            }
            return block;
        });
        onChange(updated);
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(blocks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onChange(items);
    };

    // Render functions for each block type
    const renderHeadingBlock = (block, langCode) => {
        const content = block.content[langCode] || {};
        return (
            <InputField
                label="Heading Text"
                value={content.text || ""}
                onChange={(e) =>
                    updateBlockContent(
                        block.id,
                        langCode,
                        "text",
                        e.target.value
                    )
                }
                onBlur={(e) =>
                    langCode === "en" &&
                    handleBlurTranslate(e.target.value, block.id, "text")
                }
                placeholder="Enter heading text"
            />
        );
    };

    const renderTextBlock = (block, langCode) => {
        const content = block.content[langCode] || {};
        return (
            <RichTextArea
                label="Content"
                value={content.content || ""}
                onChange={(val) =>
                    updateBlockContent(block.id, langCode, "content", val)
                }
                onBlur={(html) =>
                    langCode === "en" &&
                    handleBlurTranslate(html, block.id, "content")
                }
            />
        );
    };

    const renderButtonBlock = (block, langCode) => {
        const content = block.content[langCode] || {};
        return (
            <Space direction="vertical" style={{ width: "100%" }}>
                <InputField
                    label="Button Text"
                    value={content.text || ""}
                    onChange={(e) =>
                        updateBlockContent(
                            block.id,
                            langCode,
                            "text",
                            e.target.value
                        )
                    }
                    onBlur={(e) =>
                        langCode === "en" &&
                        handleBlurTranslate(e.target.value, block.id, "text")
                    }
                    placeholder="Click here"
                />
                <InputField
                    label="Link URL"
                    value={content.link || ""}
                    onChange={(e) =>
                        updateBlockContent(
                            block.id,
                            langCode,
                            "link",
                            e.target.value
                        )
                    }
                    placeholder="/about"
                />
                <div>
                    <label
                        style={{
                            display: "block",
                            marginBottom: 8,
                            fontWeight: 500,
                        }}
                    >
                        Target
                    </label>
                    <select
                        value={content.target || "_self"}
                        onChange={(e) =>
                            updateBlockContent(
                                block.id,
                                langCode,
                                "target",
                                e.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #d9d9d9",
                            fontSize: 14,
                        }}
                    >
                        <option value="_self">Same Tab (_self)</option>
                        <option value="_blank">New Tab (_blank)</option>
                        <option value="_parent">Parent Frame (_parent)</option>
                        <option value="_top">Full Window (_top)</option>
                    </select>
                </div>
                <div>
                    <label
                        style={{
                            display: "block",
                            marginBottom: 8,
                            fontWeight: 500,
                        }}
                    >
                        JavaScript Action (Optional)
                    </label>
                    <select
                        value={content.action || ""}
                        onChange={(e) =>
                            updateBlockContent(
                                block.id,
                                langCode,
                                "action",
                                e.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #d9d9d9",
                            fontSize: 14,
                        }}
                    >
                        <option value="">None</option>
                        <option value="onclick">On Click</option>
                        <option value="onmouseover">On Mouse Over</option>
                        <option value="onmouseout">On Mouse Out</option>
                        <option value="onfocus">On Focus</option>
                        <option value="onblur">On Blur</option>
                    </select>
                </div>
            </Space>
        );
    };

    const renderMediaBlock = (block, langCode) => {
        const content = block.content[langCode] || {};
        const isEnglish = langCode === "en";

        return (
            <>
                <InputField
                    label="Caption"
                    value={content.caption || ""}
                    onChange={(e) =>
                        updateBlockContent(
                            block.id,
                            langCode,
                            "caption",
                            e.target.value
                        )
                    }
                    onBlur={(e) =>
                        langCode === "en" &&
                        handleBlurTranslate(e.target.value, block.id, "caption")
                    }
                    placeholder="Image caption"
                />
                {isEnglish && (
                    <MediaSelector
                        existingImages={availableImages}
                        setImages={(imgs) =>
                            updateBlockContent(
                                block.id,
                                langCode,
                                "image_id",
                                imgs[0]?.id || null
                            )
                        }
                        images={
                            content.image_id
                                ? availableImages.filter(
                                      (img) => img.id === content.image_id
                                  )
                                : []
                        }
                    />
                )}
            </>
        );
    };

    const renderCarouselBlock = (block, langCode) => {
        const content = block.content[langCode] || {};
        const slides = content.slides || [
            { caption: "", description: "", image_id: null },
        ];
        const isEnglish = langCode === "en";

        const updateSlide = (index, field, value) => {
            const newSlides = [...slides];
            newSlides[index] = { ...newSlides[index], [field]: value };
            updateBlockContent(block.id, langCode, "slides", newSlides);
        };

        const addSlide = () => {
            const newSlide = { caption: "", description: "", image_id: null };

            // Add slide to ALL languages
            const updated = blocks.map((b) => {
                if (b.id === block.id) {
                    const newContent = {};
                    allLanguages.forEach((lang) => {
                        const currentSlides =
                            b.content[lang.code]?.slides || [];
                        newContent[lang.code] = {
                            ...b.content[lang.code],
                            slides: [...currentSlides, newSlide],
                        };
                    });
                    return { ...b, content: newContent };
                }
                return b;
            });
            onChange(updated);
        };

        const removeSlide = (index) => {
            // Remove from ALL languages
            const updated = blocks.map((b) => {
                if (b.id === block.id) {
                    const newContent = {};
                    allLanguages.forEach((lang) => {
                        const currentSlides =
                            b.content[lang.code]?.slides || [];
                        newContent[lang.code] = {
                            ...b.content[lang.code],
                            slides: currentSlides.filter((_, i) => i !== index),
                        };
                    });
                    return { ...b, content: newContent };
                }
                return b;
            });
            onChange(updated);
        };

        const moveSlide = (index, direction) => {
            const newIndex = direction === "up" ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= slides.length) return;

            // Move in ALL languages
            const updated = blocks.map((b) => {
                if (b.id === block.id) {
                    const newContent = {};
                    allLanguages.forEach((lang) => {
                        const currentSlides = [
                            ...(b.content[lang.code]?.slides || []),
                        ];
                        [currentSlides[index], currentSlides[newIndex]] = [
                            currentSlides[newIndex],
                            currentSlides[index],
                        ];
                        newContent[lang.code] = {
                            ...b.content[lang.code],
                            slides: currentSlides,
                        };
                    });
                    return { ...b, content: newContent };
                }
                return b;
            });
            onChange(updated);
        };

        return (
            <>
                {slides.map((slide, idx) => (
                    <Card
                        key={`${block.id}-slide-${idx}`}
                        size="small"
                        style={{ marginBottom: 12 }}
                        title={`Slide ${idx + 1}`}
                        extra={
                            <Space size="small">
                                <Button
                                    size="small"
                                    type="text"
                                    icon={<ArrowUpOutlined />}
                                    onClick={() => moveSlide(idx, "up")}
                                    disabled={idx === 0}
                                    title="Move up"
                                />
                                <Button
                                    size="small"
                                    type="text"
                                    icon={<ArrowDownOutlined />}
                                    onClick={() => moveSlide(idx, "down")}
                                    disabled={idx === slides.length - 1}
                                    title="Move down"
                                />
                                {slides.length > 1 && (
                                    <Button
                                        danger
                                        size="small"
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeSlide(idx)}
                                        title="Delete slide"
                                    />
                                )}
                            </Space>
                        }
                    >
                        <InputField
                            label="Caption"
                            value={slide.caption || ""}
                            onChange={(e) =>
                                updateSlide(idx, "caption", e.target.value)
                            }
                            onBlur={(e) =>
                                langCode === "en" &&
                                handleBlurTranslate(
                                    e.target.value,
                                    block.id,
                                    "caption",
                                    idx
                                )
                            }
                            placeholder="Slide caption"
                        />
                        <RichTextArea
                            key={`${block.id}-${langCode}-slide-${idx}-desc`}
                            label="Description"
                            value={slide.description || ""}
                            onChange={(val) =>
                                updateSlide(idx, "description", val)
                            }
                            onBlur={(html) =>
                                langCode === "en" &&
                                handleBlurTranslate(html, block.id, "content")
                            }
                        />

                        {isEnglish && (
                            <MediaSelector
                                existingImages={availableImages}
                                setImages={(imgs) =>
                                    updateSlide(
                                        idx,
                                        "image_id",
                                        imgs[0]?.id || null
                                    )
                                }
                                images={
                                    slide.image_id
                                        ? availableImages.filter(
                                              (img) => img.id === slide.image_id
                                          )
                                        : []
                                }
                            />
                        )}
                    </Card>
                ))}
                <Button type="dashed" onClick={addSlide} block size="small">
                    + Add Slide
                </Button>
            </>
        );
    };

    const renderListBlock = (block, langCode) => {
        const content = block.content[langCode] || {};
        const items = content.items || [""];

        const updateItem = (index, value) => {
            const newItems = [...items];
            newItems[index] = value;
            updateBlockContent(block.id, langCode, "items", newItems);
        };

        const addItem = () => {
            updateBlockContent(block.id, langCode, "items", [...items, ""]);
        };

        const removeItem = (index) => {
            updateBlockContent(
                block.id,
                langCode,
                "items",
                items.filter((_, i) => i !== index)
            );
        };

        const moveItem = (index, direction) => {
            const newIndex = direction === "up" ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= items.length) return;

            const newItems = [...items];
            [newItems[index], newItems[newIndex]] = [
                newItems[newIndex],
                newItems[index],
            ];
            updateBlockContent(block.id, langCode, "items", newItems);
        };

        return (
            <div>
                {items.map((item, idx) => (
                    <Space
                        key={idx}
                        style={{
                            display: "flex",
                            marginBottom: 8,
                            width: "100%",
                        }}
                    >
                        <Input
                            value={item}
                            onChange={(e) => updateItem(idx, e.target.value)}
                            placeholder={`Item ${idx + 1}`}
                            style={{ flex: 1 }}
                        />
                        <Button
                            size="small"
                            type="text"
                            icon={<ArrowUpOutlined />}
                            onClick={() => moveItem(idx, "up")}
                            disabled={idx === 0}
                            title="Move up"
                        />
                        <Button
                            size="small"
                            type="text"
                            icon={<ArrowDownOutlined />}
                            onClick={() => moveItem(idx, "down")}
                            disabled={idx === items.length - 1}
                            title="Move down"
                        />
                        {items.length > 1 && (
                            <Button
                                danger
                                size="small"
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => removeItem(idx)}
                            />
                        )}
                    </Space>
                ))}
                <Button type="dashed" onClick={addItem} block size="small">
                    + Add Item
                </Button>
            </div>
        );
    };

    const renderFeatureBlock = (block, langCode) => {
        const content = block.content[langCode] || {};
        const isEnglish = langCode === "en";

        return (
            <Space direction="vertical" style={{ width: "100%" }}>
                <InputField
                    label="Heading"
                    value={content.heading || ""}
                    onChange={(e) => updateBlockContent(block.id, langCode, "heading", e.target.value)}
                    onBlur={(e) => langCode === "en" && handleBlurTranslate(e.target.value, block.id, "heading")}
                />
                <InputField
                    label="Subheading"
                    value={content.subheading || ""}
                    onChange={(e) => updateBlockContent(block.id, langCode, "subheading", e.target.value)}
                    onBlur={(e) => langCode === "en" && handleBlurTranslate(e.target.value, block.id, "subheading")}
                />
                <RichTextArea
                    label="Text Content"
                    value={content.text || ""}
                    onChange={(val) => updateBlockContent(block.id, langCode, "text", val)}
                    onBlur={(html) => langCode === "en" && handleBlurTranslate(html, block.id, "text")}
                />
                <InputField
                    label="Button Text"
                    value={content.button_text || ""}
                    onChange={(e) => updateBlockContent(block.id, langCode, "button_text", e.target.value)}
                    onBlur={(e) => langCode === "en" && handleBlurTranslate(e.target.value, block.id, "button_text")}
                />
                <InputField
                    label="Button Link"
                    value={content.button_link || ""}
                    onChange={(e) => updateBlockContent(block.id, langCode, "button_link", e.target.value)}
                />
                {isEnglish && (
                    <MediaSelector
                        existingImages={availableImages}
                        setImages={(imgs) => updateBlockContent(block.id, langCode, "image_id", imgs[0]?.id || null)}
                        images={content.image_id ? availableImages.filter((img) => img.id === content.image_id) : []}
                    />
                )}
            </Space>
        );
    };

    const renderBlockContent = (block, langCode) => {
        switch (block.type) {
            case "heading":
                return renderHeadingBlock(block, langCode);
            case "text":
                return renderTextBlock(block, langCode);
            case "button":
                return renderButtonBlock(block, langCode);
            case "media":
                return renderMediaBlock(block, langCode);
            case "carousel":
                return renderCarouselBlock(block, langCode);
            case "list":
                return renderListBlock(block, langCode);
            case "feature":
                return renderFeatureBlock(block, langCode);
            default:
                return null;
        }
    };

    const renderLanguageTabs = (block) => {
        const tabItems = allLanguages.map((lang) => ({
            key: lang.code,
            label: lang.name,
            children: (
                <div style={{ padding: "12px 0" }}>
                    {renderBlockContent(block, lang.code)}
                </div>
            ),
        }));

        return <Tabs items={tabItems} size="small" />;
    };

    const getBlockTypeInfo = (typeId) => {
        return BLOCK_TYPES.find((t) => t.id === typeId);
    };

    return (
        <div style={{ display: "flex", gap: 24 }}>
            {/* Left Sidebar - Block Palette */}
            <div style={{ width: 180, flexShrink: 0 }}>
                <div
                    style={{
                        position: "sticky",
                        top: 24,
                        backgroundColor: "#fafafa",
                        borderRadius: 8,
                        padding: 16,
                    }}
                >
                    <Text strong style={{ display: "block", marginBottom: 12 }}>
                        Content Blocks
                    </Text>
                    <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size={8}
                    >
                        {BLOCK_TYPES.map((blockType) => (
                            <Tooltip
                                key={blockType.id}
                                title={blockType.description}
                                placement="right"
                            >
                                <Button
                                    block
                                    onClick={() => addBlock(blockType)}
                                    style={{
                                        height: 48,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        gap: 8,
                                        borderColor: blockType.color,
                                        color: blockType.color,
                                    }}
                                    icon={
                                        <span style={{ fontSize: 18 }}>
                                            {blockType.icon}
                                        </span>
                                    }
                                >
                                    <span style={{ fontSize: 13 }}>
                                        {blockType.label}
                                    </span>
                                </Button>
                            </Tooltip>
                        ))}
                    </Space>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="blocks">
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{
                                    minHeight: 400,
                                    backgroundColor: snapshot.isDraggingOver
                                        ? "#f0f5ff"
                                        : "transparent",
                                    padding: snapshot.isDraggingOver ? 16 : 0,
                                    borderRadius: 8,
                                    transition: "all 0.2s",
                                }}
                            >
                                {blocks.length === 0 && (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: 60,
                                            backgroundColor: "#fafafa",
                                            borderRadius: 8,
                                            border: "2px dashed #d9d9d9",
                                        }}
                                    >
                                        <Text type="secondary">
                                            Click a block type on the left to
                                            add content
                                        </Text>
                                    </div>
                                )}

                                {blocks.map((block, index) => {
                                    const blockInfo = getBlockTypeInfo(
                                        block.type
                                    );
                                    const isExpanded =
                                        expandedBlock === block.id;

                                    return (
                                        <Draggable
                                            key={block.id}
                                            draggableId={block.id}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    style={{
                                                        marginBottom: 12,
                                                        ...provided
                                                            .draggableProps
                                                            .style,
                                                    }}
                                                >
                                                    <Card
                                                        size="small"
                                                        style={{
                                                            borderLeft: `4px solid ${blockInfo?.color}`,
                                                            boxShadow:
                                                                snapshot.isDragging
                                                                    ? "0 4px 12px rgba(0,0,0,0.15)"
                                                                    : "0 1px 2px rgba(0,0,0,0.06)",
                                                            transition:
                                                                "all 0.2s",
                                                        }}
                                                        title={
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 8,
                                                                }}
                                                            >
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    style={{
                                                                        cursor: "grab",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    <DragOutlined
                                                                        style={{
                                                                            fontSize: 14,
                                                                            color: "#999",
                                                                        }}
                                                                    />
                                                                </div>
                                                                <Badge
                                                                    color={
                                                                        blockInfo?.color
                                                                    }
                                                                    text={
                                                                        <span
                                                                            style={{
                                                                                fontWeight: 500,
                                                                            }}
                                                                        >
                                                                            {
                                                                                blockInfo?.label
                                                                            }
                                                                        </span>
                                                                    }
                                                                />
                                                                {block.label && (
                                                                    <Text
                                                                        type="secondary"
                                                                        style={{
                                                                            fontSize: 12,
                                                                        }}
                                                                    >
                                                                        -{" "}
                                                                        {
                                                                            block.label
                                                                        }
                                                                    </Text>
                                                                )}
                                                            </div>
                                                        }
                                                        extra={
                                                            <Space>
                                                                <Input
                                                                    size="small"
                                                                    placeholder="Label (e.g. Title)"
                                                                    value={
                                                                        block.label ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateBlockLabel(
                                                                            block.id,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width: 150,
                                                                    }}
                                                                    prefix={
                                                                        <EditOutlined />
                                                                    }
                                                                />
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    onClick={() =>
                                                                        setExpandedBlock(
                                                                            isExpanded
                                                                                ? null
                                                                                : block.id
                                                                        )
                                                                    }
                                                                >
                                                                    {isExpanded
                                                                        ? "Collapse"
                                                                        : "Expand"}
                                                                </Button>
                                                                <Button
                                                                    danger
                                                                    type="text"
                                                                    size="small"
                                                                    icon={
                                                                        <DeleteOutlined />
                                                                    }
                                                                    onClick={() =>
                                                                        deleteBlock(
                                                                            block.id
                                                                        )
                                                                    }
                                                                />
                                                            </Space>
                                                        }
                                                    >
                                                        {isExpanded &&
                                                            renderLanguageTabs(
                                                                block
                                                            )}
                                                    </Card>
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
}
