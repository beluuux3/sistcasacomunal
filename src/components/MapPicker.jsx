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
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapLoaded) return;

    const loadMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

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
        leafletMapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        if (latitud && longitud) {
          const marker = L.marker([parseFloat(latitud), parseFloat(longitud)], {
            draggable: true,
          }).addTo(map);
          markerRef.current = marker;

          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onLocationSelectRef.current(pos.lat, pos.lng);
          });
        }

        map.on("click", (e) => {
          if (markerRef.current) {
            markerRef.current.setLatLng(e.latlng);
          } else {
            import("leaflet").then(({ default: Lf }) => {
              const marker = Lf.marker(e.latlng, { draggable: true }).addTo(map);
              markerRef.current = marker;
              marker.on("dragend", () => {
                const pos = marker.getLatLng();
                onLocationSelectRef.current(pos.lat, pos.lng);
              });
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

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setLocating(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        onLocationSelectRef.current(lat, lng);

        if (leafletMapRef.current) {
          const L = (await import("leaflet")).default;
          leafletMapRef.current.flyTo([lat, lng], 17, { duration: 1.5 });

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            const marker = L.marker([lat, lng], { draggable: true }).addTo(
              leafletMapRef.current
            );
            markerRef.current = marker;
            marker.on("dragend", () => {
              const pos = marker.getLatLng();
              onLocationSelectRef.current(pos.lat, pos.lng);
            });
          }
        }

        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Permiso de ubicación denegado. Actívalo en tu navegador.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError("No se pudo obtener la ubicación. Intenta de nuevo.");
        } else {
          setGeoError("Error al obtener la ubicación.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-gray-600">
          Haz clic en el mapa para colocar un pin. Arrastra el pin para ajustar
          la ubicación.
        </p>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {locating ? (
            <>
              <svg
                className="animate-spin h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Obteniendo ubicación...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Usar mi ubicación actual
            </>
          )}
        </button>
      </div>

      {geoError && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded border border-red-200">
          {geoError}
        </p>
      )}

      <div
        ref={mapRef}
        style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
        className="border border-gray-300 bg-gray-100"
      />
    </div>
  );
}
