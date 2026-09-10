import React, { useEffect } from "react";
import { Button, Tooltip, Dropdown, Space, Form } from "antd";
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    StrikethroughOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    UndoOutlined,
    RedoOutlined,
    LinkOutlined,
    PictureOutlined,
    TableOutlined,
    ColumnWidthOutlined,
    ColumnHeightOutlined,
    DeleteOutlined,
    FontSizeOutlined,
} from "@ant-design/icons";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Heading from "@tiptap/extension-heading";

export interface RichTextAreaProps {
    value?: string;
    label?: React.ReactNode;
    name?: string;
    error?: any;
    onChange?: (val: any) => void;
    onBlur?: (val: any) => void;
    required?: boolean;
    [key: string]: any;
}

export default function RichTextArea({
    value = "",
    label,
    name,
    error,
    onChange,
    onBlur,
    required = false,
}: RichTextAreaProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link,
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Heading.configure({ levels: [1, 2, 3, 4, 5] }),
        ],
        content: value || "",
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(html);
        },
        onBlur: ({ editor }) => {
            onBlur?.(editor.getHTML());
        },
    });

    // Update editor content when value prop changes externally
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    const tableItems = [
        {
            key: "insert-3x3",
            label: "Insert 3x3 Table",
        },
        {
            key: "add-row",
            label: "Add Row",
        },
        {
            key: "remove-row",
            label: "Remove Row",
        },
        {
            key: "add-column",
            label: "Add Column",
        },
        {
            key: "remove-column",
            label: "Remove Column",
        },
        {
            key: "toggle-header",
            label: "Toggle Header Row",
        },
    ];

    const onMenuClick = ({ key }) => {
        const chain = editor?.chain().focus();
        if (!chain) return;

        switch (key) {
            case "insert-3x3":
                chain
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run();
                break;
            case "add-row":
                chain.addRowAfter().run();
                break;
            case "remove-row":
                chain.deleteRow().run();
                break;
            case "add-column":
                chain.addColumnAfter().run();
                break;
            case "remove-column":
                chain.deleteColumn().run();
                break;
            case "toggle-header":
                chain.toggleHeaderRow().run();
                break;
        }
    };

    if (!editor) return null;

    return (
        <Form.Item
            label={label}
            name={name}
            required={required}
            validateStatus={error ? "error" : ""}
            help={error}
        >
            <div
                style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                    padding: 10,
                    backgroundColor: "#fff",
                }}
            >
                <Space wrap size="small" style={{ marginBottom: 8 }}>
                    {/* Header Buttons */}
                    <Tooltip title="Paragraph">
                        <Button
                            icon={<FontSizeOutlined />}
                            type={
                                editor.isActive("paragraph")
                                    ? "primary"
                                    : "default"
                            }
                            onClick={() =>
                                editor.chain().focus().setParagraph().run()
                            }
                        />
                    </Tooltip>

                    {[1, 2, 3, 4, 5].map((level) => (
                        <Tooltip key={`h${level}`} title={`Heading ${level}`}>
                            <Button
                                type={
                                    editor.isActive("heading", { level })
                                        ? "primary"
                                        : "default"
                                }
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHeading({ level: level as any })
                                        .run()
                                }
                            >
                                H{level}
                            </Button>
                        </Tooltip>
                    ))}

                    {/* Text Style Buttons */}
                    <Tooltip title="Bold">
                        <Button
                            icon={<BoldOutlined />}
                            type={
                                editor.isActive("bold") ? "primary" : "default"
                            }
                            onClick={() =>
                                editor.chain().focus().toggleBold().run()
                            }
                        />
                    </Tooltip>

                    <Tooltip title="Italic">
                        <Button
                            icon={<ItalicOutlined />}
                            type={
                                editor.isActive("italic")
                                    ? "primary"
                                    : "default"
                            }
                            onClick={() =>
                                editor.chain().focus().toggleItalic().run()
                            }
                        />
                    </Tooltip>

                    <Tooltip title="Underline">
                        <Button
                            icon={<UnderlineOutlined />}
                            type={
                                editor.isActive("underline")
                                    ? "primary"
                                    : "default"
                            }
                            onClick={() =>
                                editor.chain().focus().toggleUnderline().run()
                            }
                        />
                    </Tooltip>

                    <Tooltip title="Strikethrough">
                        <Button
                            icon={<StrikethroughOutlined />}
                            type={
                                editor.isActive("strike")
                                    ? "primary"
                                    : "default"
                            }
                            onClick={() =>
                                editor.chain().focus().toggleStrike().run()
                            }
                        />
                    </Tooltip>

                    {/* List Buttons */}
                    <Tooltip title="Ordered List">
                        <Button
                            icon={<OrderedListOutlined />}
                            type={
                                editor.isActive("orderedList")
                                    ? "primary"
                                    : "default"
                            }
                            onClick={() =>
                                editor.chain().focus().toggleOrderedList().run()
                            }
                        />
                    </Tooltip>

                    <Tooltip title="Bullet List">
                        <Button
                            icon={<UnorderedListOutlined />}
                            type={
                                editor.isActive("bulletList")
                                    ? "primary"
                                    : "default"
                            }
                            onClick={() =>
                                editor.chain().focus().toggleBulletList().run()
                            }
                        />
                    </Tooltip>

                    {/* Media */}
                    <Tooltip title="Add Link">
                        <Button
                            icon={<LinkOutlined />}
                            onClick={() => {
                                const url = window.prompt("Enter URL");
                                if (url) {
                                    editor
                                        .chain()
                                        .focus()
                                        .extendMarkRange("link")
                                        .setLink({ href: url })
                                        .run();
                                }
                            }}
                        />
                    </Tooltip>

                    <Tooltip title="Add Image">
                        <Button
                            icon={<PictureOutlined />}
                            onClick={() => {
                                const url = window.prompt("Enter image URL");
                                if (url) {
                                    editor
                                        .chain()
                                        .focus()
                                        .setImage({ src: url })
                                        .run();
                                }
                            }}
                        />
                    </Tooltip>

                    {/* Undo/Redo */}
                    <Tooltip title="Undo">
                        <Button
                            icon={<UndoOutlined />}
                            disabled={!editor.can().undo()}
                            onClick={() => editor.chain().focus().undo().run()}
                        />
                    </Tooltip>

                    <Tooltip title="Redo">
                        <Button
                            icon={<RedoOutlined />}
                            disabled={!editor.can().redo()}
                            onClick={() => editor.chain().focus().redo().run()}
                        />
                    </Tooltip>

                    {/* Table Actions */}
                    <Dropdown
                        menu={{ items: tableItems, onClick: onMenuClick }}
                        trigger={["click"]}
                    >
                        <Button icon={<TableOutlined />}>Table</Button>
                    </Dropdown>

                    <Tooltip title="Delete Table">
                        <Button
                            icon={<DeleteOutlined />}
                            // disabled={!editor.isActive("table")}
                            onClick={() => {
                                const { state, view } = editor;
                                const { doc, tr, selection } = state;

                                let tableFound = false;

                                doc.descendants((node, pos) => {
                                    if (
                                        node.type.name === "table" &&
                                        selection.from >= pos &&
                                        selection.to <= pos + node.nodeSize
                                    ) {
                                        // Found a table at the current selection range
                                        tr.delete(pos, pos + node.nodeSize);
                                        view.dispatch(tr);
                                        tableFound = true;
                                        return false; // stop traversal
                                    }
                                    return true;
                                });

                                if (!tableFound) {
                                    // Optional: fallback or notify
                                    console.warn(
                                        "No table found at the current selection."
                                    );
                                }
                            }}
                        >
                            Delete Table
                        </Button>
                    </Tooltip>
                </Space>

                <div
                    style={{
                        minHeight: 150,
                        border: "1px solid #f0f0f0",
                        borderRadius: 4,
                        padding: 8,
                        overflowX: "auto",
                    }}
                >
                    <EditorContent className="editor" editor={editor} />
                </div>
            </div>
        </Form.Item>
    );
}
