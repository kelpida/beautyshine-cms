import React, { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13);
        }
    }, [center, map]);
    return null;
}

function LocationMarker({ position, setPosition, onLocationSelect }) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);

            // Reverse geocoding
            fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            )
                .then((response) => response.json())
                .then((data) => {
                    if (data && data.address) {
                        const addressParts = [];
                        if (data.address.road)
                            addressParts.push(data.address.road);
                        if (data.address.house_number)
                            addressParts.push(data.address.house_number);

                        const formattedAddress = addressParts.join(" ");
                        if (formattedAddress && onLocationSelect) {
                            onLocationSelect({
                                address: formattedAddress,
                                lat,
                                lng,
                            });
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error reverse geocoding:", error);
                });
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    );
}

const parsePosition = (value) => {
    if (!value) return null;

    // Already array
    if (Array.isArray(value)) {
        return [Number(value[0]), Number(value[1])];
    }

    // JSON string "[lat,lng]"
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);

            if (
                Array.isArray(parsed) &&
                parsed.length === 2 &&
                !isNaN(parsed[0]) &&
                !isNaN(parsed[1])
            ) {
                return [Number(parsed[0]), Number(parsed[1])];
            }
        } catch {
            return null;
        }
    }

    return null;
};

export default function PropertyMap({
    address,
    city,
    country,
    onLocationSelect,
    positionLocation = null,
}) {
    const [position, setPosition] = useState(parsePosition(positionLocation)); // [lat, lng]
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 🚫 Do NOT auto-geocode if position already exists (edit mode)
        if (positionLocation) return;

        const fetchCoordinates = async () => {
            if (!address && !city && !country) return;

            setLoading(true);
            const query = [address, city, country].filter(Boolean).join(", ");

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        query
                    )}`
                );
                const data = await response.json();

                if (data?.length) {
                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);

                    setPosition([lat, lng]);

                    onLocationSelect?.({ address, lat, lng });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        const t = setTimeout(fetchCoordinates, 800);
        return () => clearTimeout(t);
    }, [address, city, country]);

    if (!position && !loading) {
        return (
            <div
                className="w-100 d-flex align-items-center justify-content-center bg-light text-muted border rounded"
                style={{ height: "16rem" }}
            >
                Enter a location to see the map
            </div>
        );
    }

    return (
        <div
            className="w-100 rounded overflow-hidden border shadow-sm mt-4 position-relative"
            style={{ height: "24rem" }}
        >
            {loading && (
                <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        zIndex: 1000,
                    }}
                >
                    Loading map...
                </div>
            )}
            {position && (
                <MapContainer
                    center={position}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        onLocationSelect={onLocationSelect}
                    />
                    <MapController center={position} />
                </MapContainer>
            )}
        </div>
    );
}
