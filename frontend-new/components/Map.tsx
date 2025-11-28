"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map({ lat, lng }: { lat: number; lng: number }) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!mapRef.current) {
            // Initialize map only once
            mapRef.current = L.map("map", {
                center: [lat, lng],
                zoom: 13,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
            }).addTo(mapRef.current);
        }

        // Remove previous marker if exists
        if (markerRef.current) {
            markerRef.current.remove();
        }

        // Add new marker
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);

        // Update map view
        mapRef.current.setView([lat, lng], 13);

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            markerRef.current = null;
        };
    }, [lat, lng]);

    return (
        <div id="map" className="rounded-lg h-96 border-2 border-[#02476D]" />
    );
}