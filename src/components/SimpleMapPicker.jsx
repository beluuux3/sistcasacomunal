"use client";

import { useEffect, useRef, useState } from "react";

const MACRODISTRITO_COORDS = {
  Cotahuma: { lat: -16.5093, lng: -68.1389 },
  "Max Paredes": { lat: -16.5237, lng: -68.1481 },
  Periférica: { lat: -16.5387, lng: -68.1192 },
  "San Antonio": { lat: -16.5004, lng: -68.1299 },
  Sur: { lat: -16.55, lng: -68.13 },
  Mallasa: { lat: -16.5625, lng: -68.145 },
  Centro: { lat: -16.502, lng: -68.1437 },
  Andino: { lat: -16.49, lng: -68.135 },
  Hampaturi: { lat: -16.3889, lng: -68.0778 },
  Zongo: { lat: -16.2333, lng: -67.7833 },
  "Ciudad de La Paz": { lat: -16.5, lng: -68.15 },
};

export function SimpleMapPicker({
  macrodistrito,
  latitud,
  longitud,
  onLocationSelect,
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const coords =
    MACRODISTRITO_COORDS[macrodistrito] || MACRODISTRITO_COORDS["Centro"];
  const lat = latitud || coords.lat;
  const lng = longitud || coords.lng;

  // URL para Google Maps embebido
  const mapsUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3823.8169732908347!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2m1!1s&parent=true`;

  if (!isClient) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
          Cargando mapa...
        </div>
        <div
          style={{ height: "300px", width: "100%" }}
          className="bg-gray-200 rounded border border-gray-300"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
        <p>
          📍 <strong>Macrodistrito seleccionado:</strong>{" "}
          {macrodistrito || "Centro"}
        </p>
        <p>
          Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      </div>
      <iframe
        width="100%"
        height="300"
        style={{ border: "1px solid #ccc", borderRadius: "0.5rem" }}
        loading="lazy"
        allowFullScreen=""
        src={`https://www.google.com/maps?q=${lat},${lng}&z=13&output=embed`}
      ></iframe>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-700">Latitud</label>
          <input
            type="text"
            readOnly
            value={lat.toFixed(6)}
            className="w-full px-2 py-1 border rounded bg-gray-50 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700">Longitud</label>
          <input
            type="text"
            readOnly
            value={lng.toFixed(6)}
            className="w-full px-2 py-1 border rounded bg-gray-50 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
