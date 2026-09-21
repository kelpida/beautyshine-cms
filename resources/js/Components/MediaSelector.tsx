import React, { useState } from "react";
import MediaSelectorModal from "./MediaSelectorModal";
import { Button, Image } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface MediaSelectorProps {
    existingImages?: any[];
    maxCount?: number;
    setImages?: (files: any) => void;
    accept?: string;
    images?: any[];
    label?: string;
    placeholder?: string;
    buttonText?: string;
    [key: string]: any;
}

const SortableItem = ({
    id,
    children,
}: {
    id: string | number;
    children: React.ReactNode;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
        position: "relative",
        opacity: isDragging ? 0.8 : 1,
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
        display: "flex",
        width: "100%",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

export default function MediaSelector({
    existingImages = [],
    maxCount,
    setImages,
    accept = "image/*",
    images: rawImages,
    label = "Images",
    placeholder = "No images selected",
    buttonText,
}: MediaSelectorProps) {
    const images = Array.isArray(rawImages)
        ? rawImages
        : Array.isArray(existingImages) && rawImages === undefined
          ? existingImages
          : [];
    const [modalVisible, setModalVisible] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            const oldIndex = images.findIndex(
                (item: any) => (item.id || item.url || item.path) === active.id,
            );
            const newIndex = images.findIndex(
                (item: any) => (item.id || item.url || item.path) === over.id,
            );

            if (oldIndex !== -1 && newIndex !== -1) {
                const newItems = arrayMove(images, oldIndex, newIndex);
                setImages?.(newItems);
            }
        }
    };

    const handleSelect = (selectedImages: any[]) => {
        // Ensure limit: allow only `maxCount` images total
        const limited = maxCount
            ? selectedImages.slice(0, maxCount)
            : selectedImages;
        setImages?.(limited);
    };

    const handleRemove = (id: string | number) => {
        const updated = images.filter(
            (img: any) => (img.id || img.url || img.path) !== id,
        );
        setImages?.(updated);
    };

    const getMediaSrc = (img: any) => {
        const src = img?.url || img?.path || "";
        if (!src) return "";
        if (
            src.startsWith("http://") ||
            src.startsWith("https://") ||
            src.startsWith("/") ||
            src.startsWith("blob:") ||
            src.startsWith("data:")
        ) {
            return src;
        }
        return `/storage/${src}`;
    };

    const renderFileType = (img: any, idx: number) => {
        const type = img?.type || "image";
        const src = getMediaSrc(img);

        if (type === "image") {
            return (
                <Image
                    key={idx}
                    draggable={false}
                    src={src}
                    alt={img?.name || `Image ${idx + 1}`}
                    style={{
                        width: "100%",
                        height: "140px",
                        objectFit: "cover",
                    }}
                    preview={true}
                />
            );
        }

        if (type === "video") {
            return (
                <video
                    key={idx}
                    draggable={false}
                    src={src}
                    controls
                    style={{
                        width: "100%",
                        height: "140px",
                        objectFit: "cover",
                        backgroundColor: "#000",
                    }}
                />
            );
        }

        // Fallback for other files (e.g. PDF)
        return (
            <div
                key={idx}
                style={{
                    width: "100%",
                    height: "140px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #d9d9d9",
                    flexDirection: "column",
                    cursor: "pointer",
                }}
                onClick={() => window.open(src, "_blank")}
                title="Click to open file"
            >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📄</div>
                <div
                    style={{
                        fontSize: "12px",
                        padding: "0 8px",
                        textAlign: "center",
                        wordBreak: "break-all",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {img?.name || "File"}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="mb-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <label>{label}</label>
                    <Button
                        type="primary"
                        icon={
                            images?.length ? <EditOutlined /> : <PlusOutlined />
                        }
                        onClick={() => setModalVisible(true)}
                    >
                        {buttonText ||
                            `${images?.length ? "Change" : "Select"} or Upload ${label}`}
                    </Button>
                </div>

                {/* Image Grid Preview */}
                <div className="bg-white p-3 rounded shadow-sm border">
                    {images?.length ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fill, minmax(150px, 1fr))",
                                    gap: "16px",
                                }}
                            >
                                <SortableContext
                                    items={images.map(
                                        (img: any) =>
                                            img.id || img.url || img.path,
                                    )}
                                    strategy={rectSortingStrategy}
                                >
                                    <Image.PreviewGroup
                                        preview={
                                            {
                                                toolbarRender: () => null,
                                            } as any
                                        }
                                    >
                                        {images.map((img: any, idx: number) => {
                                            const uniqueId =
                                                img.id || img.url || img.path;

                                            return (
                                                <SortableItem
                                                    key={uniqueId}
                                                    id={uniqueId}
                                                >
                                                    <div
                                                        style={{
                                                            position: "relative",
                                                            width: "100%",
                                                            borderRadius: "6px",
                                                            overflow: "hidden",
                                                            border: "1px solid #e5e7eb",
                                                        }}
                                                        className="image-item group"
                                                    >
                                                        {renderFileType(
                                                            img,
                                                            idx,
                                                        )}

                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                top: "6px",
                                                                right: "6px",
                                                                zIndex: 10,
                                                            }}
                                                            className="image-actions"
                                                        >
                                                            <Button
                                                                danger
                                                                size="small"
                                                                shape="circle"
                                                                icon={
                                                                    <DeleteOutlined />
                                                                }
                                                                onPointerDown={(
                                                                    e,
                                                                ) =>
                                                                    e.stopPropagation()
                                                                }
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleRemove(
                                                                        uniqueId,
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </SortableItem>
                                            );
                                        })}
                                    </Image.PreviewGroup>
                                </SortableContext>
                            </div>
                        </DndContext>
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            {placeholder}
                        </div>
                    )}
                </div>
            </div>
            <MediaSelectorModal
                accept={accept}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={handleSelect}
                maxCount={maxCount}
                existingImages={existingImages}
                selectedImages={images}
                selectedImagesData={images}
                title={label}
            />
        </>
    );
}
