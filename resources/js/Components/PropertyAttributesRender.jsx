import { Tabs, Form, Checkbox } from "antd";
import React from "react";
import InputField from "@/Components/Form/InputField";
import SelectField from "@/Components/Form/SelectField";
import CheckboxField from "@/Components/Form/CheckboxField";
import RadioField from "@/Components/Form/RadioField";
import DatePickerField from "@/Components/Form/DatePickerField";
import TimePickerField from "@/Components/Form/TimePickerField";
import ColorPickerField from "@/Components/Form/ColorPickerField";
import { InputType } from "@/enum/InputType.enum";
import SwitchField from "./Form/SwitchField";
import MediaSelector from "./MediaSelector";

export default function PropertyAttributesRender({
    categoriesAttributes,
    values = {},
    onChange,
    files,
}) {
    const renderAttributeInput = (attribute) => {
        const value = values[attribute.id];

        const handleChange = (val) => {
            if (onChange) {
                onChange(attribute.id, val);
            }
        };

        switch (attribute.type) {
            case InputType.TEXT:
                return (
                    <InputField
                        label={attribute.name}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                    />
                );
            case InputType.NUMBER:
                return (
                    <InputField
                        type="number"
                        label={attribute.name}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                    />
                );
            case InputType.SELECT:
                return (
                    <SelectField
                        label={attribute.name}
                        options={attribute.options}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                    />
                );
            case InputType.CHECKBOX:
                return (
                    <SwitchField
                        label={attribute.name}
                        checked={value}
                        onChange={(e) => handleChange(e)}
                    />
                );
            case InputType.RADIO:
                return (
                    <RadioField
                        label={attribute.name}
                        value={value}
                        options={attribute.options}
                        onChange={(e) => handleChange(e.target.value)}
                    />
                );
            case InputType.DATE:
                return (
                    <DatePickerField
                        label={attribute.name}
                        value={value}
                        onChange={(date, dateString) =>
                            handleChange(dateString)
                        }
                    />
                );
            case InputType.TIME:
                return (
                    <TimePickerField
                        label={attribute.name}
                        value={value}
                        onChange={(time, timeString) =>
                            handleChange(timeString)
                        }
                    />
                );
            case InputType.COLOR:
                return (
                    <ColorPickerField
                        label={attribute.name}
                        value={value}
                        onChange={(color) =>
                            handleChange(
                                typeof color === "string"
                                    ? color
                                    : color.toHexString(),
                            )
                        }
                    />
                );
            case InputType.UPLOAD:
                return (
                    <MediaSelector
                        label={attribute.name}
                        placeholder={`Upload ${attribute.name}`}
                        buttonText={`Select or Upload ${attribute.name}`}
                        existingImages={
                            attribute.format == "image"
                                ? files?.images
                                : files?.files
                        }
                        accept={
                            attribute.format == "image"
                                ? "application/image"
                                : "application/pdf"
                        }
                        setImages={(file) => {
                            handleChange(file[0] ?? "");
                        }}
                        images={value ? [value] : []}
                        maxCount={1}
                    />
                );
            default:
                return (
                    <InputField
                        label={attribute.name}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                    />
                );
        }
    };

    return (
        <div>
            <Tabs
                items={categoriesAttributes?.map((category) => {
                    return {
                        label: category.name,
                        key: category.id,
                        children: (
                            <div className="flex flex-col gap-4">
                                {category.attributes?.map((attribute) => (
                                    <div key={attribute.id}>
                                        {renderAttributeInput(attribute)}
                                    </div>
                                ))}
                            </div>
                        ),
                    };
                })}
                mode="card"
                tabPosition="left"
            />
        </div>
    );
}
