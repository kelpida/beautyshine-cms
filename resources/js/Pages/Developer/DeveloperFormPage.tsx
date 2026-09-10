import InputField from "@/Components/Form/InputField";
import RichTextArea from "@/Components/Form/RichTextArea";
import SelectField from "@/Components/Form/SelectField";
import SwitchField from "@/Components/Form/SwitchField";
import PageHeaderActions from "@/Components/PageHeaderActions";
import PopupFormMessage from "@/Components/PopupFormMessage";
import { IntegrationPositionsOptions } from "@/enum/IntegrationPositions.enum";
import AdminLayout from "@/Layouts/AdminLayout";
import { RouteList } from "@/routes/RouteList";
import { useForm } from "@inertiajs/react";
import { Button, Card, Col, Form, Row } from "antd";
import React from "react";

export default function DeveloperFormPage({
    developer,
    cities,
    countries,
}: {
    developer?: any;
    cities?: any;
    countries?: any;
}) {
    const [cityList, setCityList] = React.useState(cities || []);
    const {
        data,
        setData,
        post: submitPost,
        put,
        processing,
        errors,
    } = useForm<any>({
        company: developer?.data?.company || "",
        name: developer?.data?.name || "",
        surname: developer?.data?.surname || "",
        email: developer?.data?.email || "",
        phone: developer?.data?.phone || "",
        city_id: developer?.data?.city?.id || "",
        country_id: developer?.data?.country?.id || "",
        notes: developer?.data?.notes || "",
    });

    const handleSubmit = () => {
        if (developer?.data?.id) {
            put(route("developers.update", developer?.data?.id));
        } else {
            submitPost(route("developers.store"));
        }
    };
    return (
        <div>
            <PopupFormMessage errors={errors} />
            <PageHeaderActions
                title={developer ? "Edit Developer" : "Create Developer"}
                backAction={RouteList.developers()}
                backName={"Back Developers List"}
            />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={data}
            >
                <Card className="mb-4">
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <InputField
                                name="company"
                                label="Company Name"
                                required
                                value={data.company}
                                onChange={(value) =>
                                    setData("company", value.target.value)
                                }
                            />
                        </Col>
                        <Col span={6}>
                            <InputField
                                name="name"
                                label="Name"
                                required
                                value={data.name}
                                onChange={(value) =>
                                    setData("name", value.target.value)
                                }
                            />
                        </Col>
                        <Col span={6}>
                            <InputField
                                name="surname"
                                label="Surname"
                                value={data.surname}
                                onChange={(value) =>
                                    setData("surname", value.target.value)
                                }
                            />
                        </Col>

                        <Col span={6}>
                            <InputField
                                name="phone"
                                label="Phone"
                                value={data.phone}
                                onChange={(value) =>
                                    setData("phone", value.target.value)
                                }
                            />
                        </Col>
                        <Col span={6}>
                            <InputField
                                name="email"
                                label="Email"
                                value={data.email}
                                onChange={(value) =>
                                    setData("email", value.target.value)
                                }
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                name="country_id"
                                label="Country"
                                options={countries?.data?.map((country) => ({
                                    label: country.name,
                                    value: country.id,
                                }))}
                                value={data.country_id}
                                onChange={(value) => {
                                    const selectValue = value.target.value;
                                    setData("country_id", selectValue);
                                    setCityList(
                                        countries.data.find(
                                            (c) => c.id === selectValue,
                                        )?.cities || [],
                                    );
                                }}
                            />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                name="city_id"
                                label="City"
                                options={cityList.map((c) => ({
                                    value: c.id,
                                    label: c.name,
                                }))}
                                value={data.city_id}
                                onChange={(value) =>
                                    setData("city_id", value.target.value)
                                }
                            />
                        </Col>
                        <Col span={24}>
                            <RichTextArea
                                name="notes"
                                label="Notes"
                                value={data.notes}
                                required
                                onChange={(value) => setData("notes", value)}
                            />
                        </Col>
                    </Row>
                </Card>
                <Button type="primary" htmlType="submit" loading={processing}>
                    Save
                </Button>
            </Form>
        </div>
    );
}

DeveloperFormPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;
