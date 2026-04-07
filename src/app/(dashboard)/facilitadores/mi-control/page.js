"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useControlFacilitadores } from "@/hooks/useControlFacilitadores";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin,
  Camera,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  LogIn,
} from "lucide-react";

export default function MiControlPage() {
  const {
    controles,
    controlHoy,
    isLoading,
    error,
    checkIn,
    checkOut,
    loadControles,
  } = useControlFacilitadores();
  const { user } = useAuth();

  const [estadoControl, setEstadoControl] = useState(null); // "no-iniciado", "en-proceso", "completado"
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fotosModal, setFotosModal] = useState(false);
  const [cameraMode, setCameraMode] = useState(null); // "entrada" o "salida"
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Geolocation
  const [ubicacion, setUbicacion] = useState(null);
  const [errorGeo, setErrorGeo] = useState("");

  useEffect(() => {
    loadControles(user?.id);
    determineControlState();
  }, [user?.id]);

  // Determinar estado del control
  const determineControlState = () => {
    if (!controlHoy) {
      setEstadoControl("no-iniciado");
    } else if (controlHoy.hora_salida) {
      setEstadoControl("completado");
    } else {
      setEstadoControl("en-proceso");
    }
  };

  // Obtener ubicación
  const handleGetUbicacion = async () => {
    setErrorGeo("");
    if (!navigator.geolocation) {
      setErrorGeo("Geolocalización no soportada en este dispositivo");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUbicacion({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          precision: position.coords.accuracy,
        });
      },
      (error) => {
        setErrorGeo(`Error: ${error.message}`);
      },
      { enableHighAccuracy: true },
    );
  };

  // Abrir cámara
  const openCamera = async (modo) => {
    setCameraMode(modo);
    setFotosModal(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setErrorGeo("Error al acceder a la cámara: " + err.message);
    }
  };

  // Capturar foto
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const photoData = canvasRef.current.toDataURL("image/jpeg");
      setFotoCapturada(photoData);
    }
  };

  // Confirmar check-in
  const handleCheckIn = async () => {
    if (!ubicacion) {
      setErrorGeo("Por favor obtén tu ubicación primero");
      return;
    }

    if (!fotoCapturada) {
      setErrorGeo("Por favor captura una foto");
      return;
    }

    setIsSaving(true);
    try {
      // Convertir Data URL o File a Blob si es necesario
      const fotoBlob = fotoCapturada.startsWith("data:")
        ? await fetch(fotoCapturada).then((r) => r.blob())
        : fotoCapturada;

      const fotoFile = new File([fotoBlob], "foto_entrada.jpg", {
        type: "image/jpeg",
      });

      await checkIn(ubicacion.latitud, ubicacion.longitud, fotoFile);

      setSuccessMessage("✅ Check-in realizado exitosamente");
      setFotosModal(false);
      setFotoCapturada(null);
      setCameraMode(null);
      setEstadoControl("en-proceso");
      loadControles(user?.id);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorGeo(err.message || "Error al registrar check-in");
    } finally {
      setIsSaving(false);
    }
  };

  // Confirmar check-out
  const handleCheckOut = async () => {
    if (!fotoCapturada) {
      setErrorGeo("Por favor captura una foto");
      return;
    }

    setIsSaving(true);
    try {
      const fotoBlob = fotoCapturada.startsWith("data:")
        ? await fetch(fotoCapturada).then((r) => r.blob())
        : fotoCapturada;

      const fotoFile = new File([fotoBlob], "foto_salida.jpg", {
        type: "image/jpeg",
      });

      await checkOut(controlHoy.id, fotoFile);

      setSuccessMessage("✅ Check-out realizado exitosamente");
      setFotosModal(false);
      setFotoCapturada(null);
      setCameraMode(null);
      setEstadoControl("completado");
      loadControles(user?.id);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorGeo(err.message || "Error al registrar check-out");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const [hours, minutes] = timeStr.split(":");
    return `${hours}:${minutes}`;
  };

  // Solo facilitadores pueden acceder
  if (user?.rol !== "facilitador") {
    return (
      <div className="space-y-6">
        <Alert
          type="error"
          title="Acceso denegado"
          message="Solo los facilitadores pueden acceder a este módulo"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Mi Control de Asistencia
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Registra tu entrada y salida con geolocalización y foto
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}

      {/* Error */}
      {error && <Alert type="error" title="Error" message={error} />}
      {errorGeo && <Alert type="error" title="Error" message={errorGeo} />}

      {/* Estado del control */}
      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      ) : estadoControl === "no-iniciado" ? (
        // Estado: No iniciado - mostrar botón check-in
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center py-6 space-y-3">
              <AlertCircle className="mx-auto text-amber-500" size={48} />
              <h2 className="text-xl font-bold text-slate-900">
                Aún no has iniciado tu jornada
              </h2>
              <p className="text-gray-600">
                Click en el botón de abajo para registrar tu check-in
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3">
              <p className="font-medium text-blue-900">Necesitaremos:</p>
              <ul className="text-sm text-blue-800 space-y-1 ml-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  Tu ubicación actual (GPS)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  Una foto tuya
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                handleGetUbicacion();
                setTimeout(() => openCamera("entrada"), 500);
              }}
              className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              <LogIn size={24} />
              Registrar Check-in
            </button>
          </div>
        </Card>
      ) : estadoControl === "en-proceso" ? (
        // Estado: En proceso - mostrar info y botón check-out
        <Card className="p-6">
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-600" size={24} />
                <div>
                  <p className="font-semibold text-green-900">
                    Check-in realizado
                  </p>
                  <p className="text-sm text-green-800">
                    Hora:{" "}
                    <strong>
                      {controlHoy?.hora_entrada
                        ? formatTime(controlHoy.hora_entrada)
                        : "-"}
                    </strong>
                  </p>
                </div>
              </div>

              {ubicacion && (
                <p className="text-sm text-green-700 flex items-center gap-2 ml-8">
                  <MapPin size={14} />
                  Ubicación registrada ({ubicacion?.precision?.toFixed(0)}m)
                </p>
              )}
            </div>

            <div className="text-center py-6 space-y-3">
              <Clock className="mx-auto text-amber-500" size={48} />
              <h2 className="text-xl font-bold text-slate-900">
                Jornada en proceso
              </h2>
              <p className="text-gray-600">
                Cuando termines, registra tu check-out
              </p>
            </div>

            <button
              onClick={() => openCamera("salida")}
              className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              <LogOut size={24} />
              Registrar Check-out
            </button>
          </div>
        </Card>
      ) : (
        // Estado: Completado
        <Card className="p-6">
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-600" size={24} />
                <div>
                  <p className="font-semibold text-green-900">
                    Jornada completada
                  </p>
                  <p className="text-sm text-green-800 space-y-0.5">
                    <div>
                      Entrada:{" "}
                      <strong>
                        {controlHoy?.hora_entrada
                          ? formatTime(controlHoy.hora_entrada)
                          : "-"}
                      </strong>
                    </div>
                    <div>
                      Salida:{" "}
                      <strong>
                        {controlHoy?.hora_salida
                          ? formatTime(controlHoy.hora_salida)
                          : "-"}
                      </strong>
                    </div>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                ⏳ Tu control está pendiente de validación por parte del
                administrador.
              </p>
            </div>

            {controlHoy?.validado !== undefined && (
              <div>
                {controlHoy.validado ? (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-600" />
                    <p className="text-sm text-green-800">
                      Tu control ha sido validado
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-sm text-red-800">
                      × Tu control fue rechazado
                      {controlHoy?.observaciones &&
                        ` - ${controlHoy.observaciones}`}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Gracias por registrar tu asistencia hoy
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Modal cámara */}
      <Modal
        isOpen={fotosModal}
        onClose={() => {
          setFotosModal(false);
          setCameraMode(null);
          setFotoCapturada(null);
        }}
        title={`Capturar foto - ${cameraMode === "entrada" ? "Check-in" : "Check-out"}`}
      >
        <div className="space-y-4">
          {fotoCapturada ? (
            // Mostrar foto capturada
            <div className="space-y-3">
              <img
                src={fotoCapturada}
                alt="Foto capturada"
                className="w-full rounded-lg border border-gray-200"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setFotoCapturada(null)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retomar foto
                </button>

                <button
                  onClick={
                    cameraMode === "entrada" ? handleCheckIn : handleCheckOut
                  }
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {isSaving ? "Guardando..." : "Confirmar"}
                </button>
              </div>
            </div>
          ) : (
            // Mostrar video de cámara
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <button
                onClick={capturePhoto}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <Camera size={18} />
                Capturar foto
              </button>
            </div>
          )}

          {cameraMode === "entrada" && !fotoCapturada && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Ubicación:</strong>{" "}
                {ubicacion
                  ? `${ubicacion.latitud.toFixed(4)}, ${ubicacion.longitud.toFixed(4)}`
                  : "Obteniendo..."}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
