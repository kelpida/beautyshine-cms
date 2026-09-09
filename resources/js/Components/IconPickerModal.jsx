import React, { useState, useMemo } from "react";
import { Modal, Input, Empty, List, Card, theme, Typography } from "antd";
import * as FaIcons from "react-icons/fa";
import { SearchOutlined } from "@ant-design/icons";

// Curated list of Real Estate related icons
const REAL_ESTATE_ICONS = [
    // Package Types
    "FaHome",
    "FaBuilding",
    "FaCity",
    "FaHotel",
    "FaWarehouse",
    "FaStore",
    "FaStoreAlt",
    "FaIgloo",
    "FaCampground",
    "FaIndustry",
    "FaLandmark",
    "FaArchway",
    "FaToriiGate",
    "FaDungeon",
    "FaChurch",
    "FaMosque",
    "FaSynagogue",
    "FaVihara",

    // Access & Security
    "FaKey",
    "FaDoorOpen",
    "FaDoorClosed",
    "FaLock",
    "FaUnlock",
    "FaShieldAlt",
    "FaVideo",

    // Interior & Amenities
    "FaBed",
    "FaBath",
    "FaToilet",
    "FaShower",
    "FaHotTub",
    "FaSwimmingPool",
    "FaCouch",
    "FaChair",
    "FaTv",
    "FaFan",
    "FaSnowflake",
    "FaFire",
    "FaWifi",
    "FaUtensils",
    "FaCoffee",
    "FaGlassMartini",
    "FaSmoking",
    "FaSmokingBan",
    "FaDumbbell",
    "FaSpa",

    // Exterior & Location
    "FaTree",
    "FaLeaf",
    "FaSeedling",
    "FaUmbrellaBeach",
    "FaMountain",
    "FaWater",
    "FaParking",
    "FaCar",
    "FaBicycle",
    "FaBus",
    "FaSubway",
    "FaTrain",
    "FaPlane",
    "FaShip",
    "FaMapMarker",
    "FaMapMarkerAlt",
    "FaMap",
    "FaMapSigns",
    "FaCompass",
    "FaLocationArrow",
    "FaRoad",
    "FaTrafficLight",

    // Measurements & Specs
    "FaRuler",
    "FaRulerCombined",
    "FaRulerHorizontal",
    "FaRulerVertical",
    "FaSolarPanel",
    "FaLightbulb",
    "FaBolt",
    "FaBurn",
    "FaTint",
    "FaTools",
    "FaHammer",
    "FaPaintRoller",
    "FaBroom",
    "FaTrash",

    // Financial & Legal
    "FaMoneyBill",
    "FaMoneyBillWave",
    "FaHandHoldingUsd",
    "FaTag",
    "FaTags",
    "FaPercent",
    "FaCalculator",
    "FaFileContract",
    "FaSignature",
    "FaBriefcase",

    // General
    "FaInfoCircle",
    "FaCheckCircle",
    "FaExclamationCircle",
    "FaStar",
    "FaHeart",
];

export default function IconPickerModal({
    isOpen,
    onClose,
    onSelect,
    currentIcon,
}) {
    const { token } = theme.useToken();
    const [searchTerm, setSearchTerm] = useState("");

    // Memoize the icon list to prevent re-calculating on every render
    const iconList = useMemo(() => {
        // Filter from the curated list instead of all icons
        return REAL_ESTATE_ICONS.filter((iconName) => {
            // Check if icon exists in FaIcons (safety check)
            if (!FaIcons[iconName]) return false;

            // Search filter
            return iconName.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [searchTerm]);

    const handleIconSelect = (iconName) => {
        onSelect(iconName);
        onClose();
    };

    return (
        <Modal
            title="Select Real Estate Icon"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
            destroyOnClose
        >
            <div className="mb-4">
                <Input
                    placeholder="Search icons (e.g. bed, pool, home)..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                    size="large"
                />
            </div>

            <div
                style={{
                    maxHeight: "60vh",
                    overflowY: "auto",
                    padding: "4px",
                }}
            >
                {iconList.length > 0 ? (
                    <List
                        grid={{ gutter: 16, xs: 4, sm: 5, md: 6, lg: 8 }}
                        dataSource={iconList}
                        renderItem={(iconName) => {
                            const IconComponent = FaIcons[iconName];
                            const isSelected = currentIcon === iconName;
                            return (
                                <List.Item>
                                    <Card
                                        hoverable
                                        onClick={() =>
                                            handleIconSelect(iconName)
                                        }
                                        bodyStyle={{
                                            padding: "12px",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                        style={{
                                            borderColor: isSelected
                                                ? token.colorPrimary
                                                : undefined,
                                            backgroundColor: isSelected
                                                ? token.colorPrimaryBg
                                                : undefined,
                                        }}
                                    >
                                        <IconComponent
                                            size={24}
                                            style={{ marginBottom: 8 }}
                                        />
                                        <Typography.Text
                                            type="secondary"
                                            style={{
                                                fontSize: "12px",
                                                width: "100%",
                                                textAlign: "center",
                                            }}
                                            ellipsis
                                        >
                                            {iconName.replace(/^Fa/, "")}
                                        </Typography.Text>
                                    </Card>
                                </List.Item>
                            );
                        }}
                    />
                ) : (
                    <Empty description="No icons found" />
                )}
            </div>
            <div style={{ marginTop: 16, textAlign: "right" }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Showing {iconList.length} Real Estate icons
                </Typography.Text>
            </div>
        </Modal>
    );
}
