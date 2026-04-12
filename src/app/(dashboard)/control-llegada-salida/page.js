"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import {
  MapPin,
  Camera,
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  Wifi,
} from "lucide-react";

export default function ControlLlegadaSalidaPage() {
  const { usuario } = useAuth();
  const { casaSeleccionada } = useCasaSeleccionada();

  const [horaLlegada, setHoraLlegada] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [ubicacion, setUbicacion] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const cameraRef = useRef(null);

  // Obtener ubicación GPS cuando cargue la página
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingGPS(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacion({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          console.log("GPS location obtained:", position.coords);
          setIsLoadingGPS(false);
        },
        (err) => {
          console.error("Error obteniendo ubicación:", err);
          setGpsError(
            "No se pudo obtener la ubicación. Habilita el GPS en tu dispositivo.",
          );
          setIsLoadingGPS(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, []);

  // Manejar captura de foto
  const handleCapturarFoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const video = cameraRef.current;
      if (video) {
        video.srcObject = stream;
        video.style.display = "block";
      }
    } catch (err) {
      setError("No se puede acceder a la cámara");
      console.error(err);
    }
  };

  const handleTomarFoto = () => {
    if (cameraRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = cameraRef.current.videoWidth;
      canvas.height = cameraRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(cameraRef.current, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setFoto(imageData);
      setFotoPreview(imageData);

      // Detener stream
      const stream = cameraRef.current.srcObject;
      stream?.getTracks().forEach((track) => track.stop());
      cameraRef.current.style.display = "none";
    }
  };

  const handleRegistrarLlegada = () => {
    if (!horaLlegada) {
      setError("Ingresa la hora de llegada");
      return;
    }
    if (!ubicacion) {
      setError("Ubicación no disponible. Intenta de nuevo con GPS habilitado.");
      return;
    }
    if (!foto) {
      setError("Debes tomar una foto como comprobante");
      return;
    }

    // Aquí iría el guardar a la API
    console.log("Registrando llegada:", {
      horaLlegada,
      ubicacion,
      foto,
      casa: casaSeleccionada?.nombre,
      facilitador: usuario?.nombre_completo,
    });

    setSuccessMessage(
      `Llegada registrada a las ${horaLlegada} en ${casaSeleccionada?.nombre}`,
    );
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleRegistrarSalida = () => {
    if (!horaSalida) {
      setError("Ingresa la hora de salida");
      return;
    }

    // Aquí iría el guardar a la API
    console.log("Registrando salida:", {
      horaSalida,
      ubicacion,
      casa: casaSeleccionada?.nombre,
      facilitador: usuario?.nombre_completo,
    });

    setSuccessMessage(
      `Salida registrada a las ${horaSalida} en ${casaSeleccionada?.nombre}`,
    );
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Control Llegada/Salida
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Registra tu ingreso y salida de la casa comunal
        </p>
      </div>

      {/* Messages */}
      {error && <Alert type="error" title="Error" message={error} />}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}

      {/* Casa Info */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <MapPin size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Casa Asignada:</p>
            <p className="font-bold text-lg text-slate-900">
              {casaSeleccionada?.nombre}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Macrodistrito: {casaSeleccionada?.macrodistrito}
            </p>
          </div>
        </div>
      </Card>

      {/* Ubicación GPS */}
      <Card className="bg-green-50 border-2 border-green-200 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi size={18} className="text-gray-700" />
              <p className="text-sm font-semibold text-gray-700">
                Estado del GPS
              </p>
            </div>
            {isLoadingGPS && (
              <span className="text-xs text-gray-600"> Cargando...</span>
            )}
          </div>

          {ubicacion ? (
            <div className="bg-white p-3 rounded-lg text-sm space-y-1">
              <p className="text-green-700 font-medium flex items-center gap-2">
                <CheckCircle size={18} className="text-green-700" />
                Ubicación detectada
              </p>
            </div>
          ) : gpsError ? (
            <p className="text-red-600 text-sm">{gpsError}</p>
          ) : (
            <p className="text-yellow-600 text-sm">
              {isLoadingGPS
                ? "Solicitando acceso al GPS..."
                : "Esperando ubicación..."}
            </p>
          )}
        </div>
      </Card>

      {/* SECCIÓN LLEGADA */}
      <Card className="border-l-4 border-l-green-500">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <LogIn size={24} className="text-green-600" />
          Registrar Llegada
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={18} className="text-gray-700" />
              Hora de Llegada
            </label>
            <input
              type="time"
              value={horaLlegada}
              onChange={(e) => setHoraLlegada(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Camera size={18} className="text-gray-700" />
              Foto de Comprobante
            </label>
            <div className="space-y-2">
              {!foto ? (
                <>
                  <video
                    ref={cameraRef}
                    style={{ display: "none", width: "100%" }}
                    autoPlay
                    playsInline
                  />
                  {fotoPreview && (
                    <img
                      src={fotoPreview}
                      alt="Foto capturada"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  {!fotoPreview && (
                    <Button
                      variant="secondary"
                      onClick={handleCapturarFoto}
                      className="w-full"
                    >
                      <Camera size={20} className="mr-2" />
                      Acceder a Cámara
                    </Button>
                  )}
                  {cameraRef.current?.srcObject && (
                    <Button
                      variant="primary"
                      onClick={handleTomarFoto}
                      className="w-full"
                    >
                      <Camera size={20} className="mr-2" />
                      Tomar Foto
                    </Button>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <img
                    src={fotoPreview}
                    alt="Foto capturada"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFoto(null);
                      setFotoPreview(null);
                    }}
                    className="w-full"
                  >
                    Tomar otra foto
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleRegistrarLlegada}
            className="w-full"
            disabled={!horaLlegada || !foto || !ubicacion}
          >
            Registrar Llegada
          </Button>
        </div>
      </Card>

      {/* SECCIÓN SALIDA */}
      <Card className="border-l-4 border-l-red-500">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <LogOut size={24} className="text-red-600" />
          Registrar Salida
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={18} className="text-gray-700" />
              Hora de Salida
            </label>
            <input
              type="time"
              value={horaSalida}
              onChange={(e) => setHoraSalida(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <Button
            variant="primary"
            onClick={handleRegistrarSalida}
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={!horaSalida}
          >
            Registrar Salida
          </Button>
        </div>
      </Card>
    </div>
  );
}
