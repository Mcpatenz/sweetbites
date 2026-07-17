"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Crosshair, AlertCircle } from "lucide-react";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (mapRef.current.classList.contains("leaflet-container")) return;
    if ((mapRef.current as any)._leaflet_id) return;

    let cancelled = false;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Inject Leaflet CSS manually
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const center: [number, number] = latitude && longitude
        ? [latitude, longitude]
        : [14.5995, 120.9842]; // Manila default

      if (!mapRef.current) return;
      const map = L.map(mapRef.current, {
        center,
        zoom: latitude && longitude ? 15 : 11,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:#ec4899;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (latitude && longitude) {
        markerRef.current = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
      }

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        }
        onLocationChange(Math.round(lat * 1000000) / 1000000, Math.round(lng * 1000000) / 1000000);
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const roundedLat = Math.round(lat * 1000000) / 1000000;
        const roundedLng = Math.round(lng * 1000000) / 1000000;

        if (mapInstanceRef.current) {
          const L = (require("leaflet")).default;
          mapInstanceRef.current.setView([roundedLat, roundedLng], 16);

          const customIcon = L.divIcon({
            className: "custom-marker",
            html: `<div style="background:#ec4899;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          if (markerRef.current) {
            markerRef.current.setLatLng([roundedLat, roundedLng]);
          } else {
            markerRef.current = L.marker([roundedLat, roundedLng], { icon: customIcon }).addTo(mapInstanceRef.current);
          }
        }

        onLocationChange(roundedLat, roundedLng);
        setLocating(false);
      },
      () => {
        setError("Unable to retrieve your location. Please tap on the map instead.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {latitude && longitude
            ? "Location pinned. Drag the map to adjust."
            : "Tap the map or use your current location to pin your delivery spot."}
        </p>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-xs font-semibold hover:bg-pink-200 transition-colors disabled:opacity-50 shrink-0"
        >
          <Crosshair size={14} className={locating ? "animate-spin" : ""} />
          {locating ? "Locating..." : "Use My Location"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-64 rounded-lg border-2 border-gray-200 overflow-hidden"
      />

      {latitude && longitude && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
          <MapPin size={14} className="text-green-600 shrink-0" />
          <span className="text-xs text-green-700 font-medium">
            Location pinned: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </span>
        </div>
      )}
    </div>
  );
}
