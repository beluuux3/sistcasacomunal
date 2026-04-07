"use client";

import { useEffect, useRef, useState } from "react";

const MACRODISTRITO_COORDS = {
  Cotahuma: [-16.5093, -68.1389],
  "Max Paredes": [-16.5237, -68.1481],
  Periférica: [-16.5387, -68.1192],
  "San Antonio": [-16.5004, -68.1299],
  Sur: [-16.55, -68.13],
  Mallasa: [-16.5625, -68.145],
  Centro: [-16.502, -68.1437],
  Andino: [-16.49, -68.135],
  Hampaturi: [-16.3889, -68.0778],
  Zongo: [-16.2333, -67.7833],
  "Ciudad de La Paz": [-16.5, -68.15],
};

export function MapPicker({
  macrodistrito,
  latitud,
  longitud,
  onLocationSelect,
}) {
  const mapRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const onLocationSelectRef = useRef(onLocationSelect);

  // Mantener referencia actualizada sin remontar el mapa
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Asegurar que solo se renderiza en cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapLoaded) return;

    // Cargar Leaflet dinámicamente
    const loadMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        // Fix de iconos
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        const defaultCoords = MACRODISTRITO_COORDS[macrodistrito] || [
          -16.5, -68.15,
        ];

        const map = L.map(mapRef.current).setView(defaultCoords, 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        let marker = null;

        if (latitud && longitud) {
          marker = L.marker([parseFloat(latitud), parseFloat(longitud)], {
            draggable: true,
          }).addTo(map);

          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onLocationSelectRef.current(pos.lat, pos.lng);
          });
        }

        map.on("click", (e) => {
          if (marker) {
            marker.setLatLng(e.latlng);
          } else {
            marker = L.marker(e.latlng, { draggable: true }).addTo(map);
            marker.on("dragend", () => {
              const pos = marker.getLatLng();
              onLocationSelectRef.current(pos.lat, pos.lng);
            });
          }
          onLocationSelectRef.current(e.latlng.lat, e.latlng.lng);
        });

        setMapLoaded(true);
      } catch (err) {
        console.error("Error cargando mapa:", err);
      }
    };

    loadMap();
  }, [isClient, mapLoaded, macrodistrito]);

  if (!isClient) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
          Haz clic en el mapa para colocar un pin. Arrastra el pin para ajustar
          la ubicación.
        </div>
        <div
          style={{ height: "300px", width: "100%" }}
          className="bg-gray-200 rounded border border-gray-300 flex items-center justify-center"
        >
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
        Haz clic en el mapa para colocar un pin. Arrastra el pin para ajustar la
        ubicación.
      </div>
      <div
        ref={mapRef}
        style={{
          height: "300px",
          width: "100%",
          borderRadius: "0.5rem",
        }}
        className="border border-gray-300 bg-gray-100"
      />
    </div>
  );
}
