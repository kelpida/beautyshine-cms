import InputField from "@/Components/Form/InputField";
import MediaSelector from "@/Components/MediaSelector";
import { Card, Col, Divider, Empty, Row, Space, Typography } from "antd";
import React from "react";
import { PictureOutlined, VideoCameraOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface MediaStepProps {
    data: any;
    setData: any;
    errors: any;
    mainImages: any[];
    setMainImages: (imgs: any[]) => void;
    galleryImages: any[];
    setGalleryImages: (imgs: any[]) => void;
}

export default function MediaStep({
    data,
    setData,
    errors,
    mainImages,
    setMainImages,
    galleryImages,
    setGalleryImages,
}: MediaStepProps) {
    const handleMainImageChange = (images: any[]) => {
        setMainImages(images);
        if (images && images.length > 0) {
            setData("main_image_id", images[0]?.id || null);
        } else {
            setData("main_image_id", null);
        }
    };

    const handleGalleryImagesChange = (images: any[]) => {
        setGalleryImages(images);
        if (images && images.length > 0) {
            const ids = images.map((img) => img.id).filter(Boolean);
            setData("gallery_images", ids);
        } else {
            setData("gallery_images", []);
        }
    };

    return (
        <div>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={10}>
                    <Card
                        title={
                            <Space>
                                <PictureOutlined />
                                <span>Main Product Image</span>
                            </Space>
                        }
                        size="small"
                        bordered
                    >
                        <div style={{ marginBottom: 16 }}>
                            <Text type="secondary">
                                This is the primary image displayed in product cards and listings.
                            </Text>
                        </div>
                        <MediaSelector
                            label="Select Main Image"
                            maxCount={1}
                            existingImages={mainImages}
                            setImages={handleMainImageChange}
                            buttonText="Choose Main Image"
                        />
                        {errors.main_image_id && (
                            <div style={{ color: "#ff4d4f", marginTop: 8, fontSize: 12 }}>
                                {errors.main_image_id}
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <Card
                        title={
                            <Space>
                                <PictureOutlined />
                                <span>Product Gallery (Multiple)</span>
                            </Space>
                        }
                        size="small"
                        bordered
                    >
                        <div style={{ marginBottom: 16 }}>
                            <Text type="secondary">
                                Additional photos shown in the product gallery carousel (up to 10 images).
                            </Text>
                        </div>
                        <MediaSelector
                            label="Select Gallery Photos"
                            maxCount={10}
                            existingImages={galleryImages}
                            setImages={handleGalleryImagesChange}
                            buttonText="Add Gallery Images"
                        />
                        {errors.gallery_images && (
                            <div style={{ color: "#ff4d4f", marginTop: 8, fontSize: 12 }}>
                                {errors.gallery_images}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Divider style={{ margin: "24px 0" }}>Video Presentation (Optional)</Divider>

            <Row gutter={16}>
                <Col xs={24} md={16}>
                    <InputField
                        label="Product Video URL (YouTube, Vimeo, or MP4)"
                        name="video_url"
                        value={data.video_url || ""}
                        onChange={(e: any) => setData("video_url", e.target.value)}
                        error={errors.video_url}
                        placeholder="https://www.youtube.com/watch?v=..."
                    />
                </Col>
            </Row>
        </div>
    );
}
