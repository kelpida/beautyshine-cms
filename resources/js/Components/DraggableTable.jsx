import React, { useContext, useMemo, createContext } from "react";
import { HolderOutlined } from "@ant-design/icons";
import { DndContext } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Table } from "antd";
import { router } from "@inertiajs/react";

// Context for drag handle
const RowContext = createContext({});

const DragHandle = () => {
    const { setActivatorNodeRef, listeners } = useContext(RowContext);
    return (
        <Button
            type="text"
            size="small"
            icon={<HolderOutlined />}
            style={{ cursor: "move" }}
            ref={setActivatorNodeRef}
            {...listeners}
        />
    );
};

const Row = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props["data-row-key"] });

    const style = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
    };

    const contextValue = useMemo(
        () => ({ setActivatorNodeRef, listeners }),
        [setActivatorNodeRef, listeners],
    );

    return (
        <RowContext.Provider value={contextValue}>
            <tr {...props} ref={setNodeRef} style={style} {...attributes} />
        </RowContext.Provider>
    );
};

const DraggableTable = ({
    dataSource = [],
    setDataSource,
    columns,
    rowKey,
    onOrderChange,
    paginationMeta,
    paginationRoute,
    paginationParams = {},
    rowSelection,
}) => {
    const wrappedColumns = [
        {
            key: "sort",
            align: "center",
            width: 50,
            fixed: "left",
            render: () => <DragHandle />,
        },
        ...columns,
    ];

    const pagination = paginationMeta
        ? {
              current: paginationMeta.current_page,
              pageSize: paginationMeta.per_page,
              total: paginationMeta.total,
              showSizeChanger: false,
              onChange: (page) => {
                  router.get(
                      paginationRoute,
                      { ...paginationParams, page },
                      {
                          preserveState: true,
                          preserveScroll: true,
                          replace: true,
                      },
                  );
              },
          }
        : true;

    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            setDataSource((prev) => {
                const oldIndex = prev.findIndex(
                    (item) => item[rowKey] === active.id,
                );
                const newIndex = prev.findIndex(
                    (item) => item[rowKey] === over?.id,
                );
                const newData = arrayMove(prev, oldIndex, newIndex);
                if (onOrderChange) onOrderChange(newData);
                return newData;
            });
        }
    };

    return (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext
                items={dataSource?.map((item) => item[rowKey])}
                strategy={verticalListSortingStrategy}
            >
                <Table
                    rowKey={rowKey}
                    components={{ body: { row: Row } }}
                    columns={wrappedColumns}
                    dataSource={dataSource}
                    pagination={pagination}
                    scroll={{ x: "max-content" }}
                    rowSelection={rowSelection}
                />
            </SortableContext>
        </DndContext>
    );
};

export default DraggableTable;
