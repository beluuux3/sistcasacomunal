"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import { useControlFacilitadores } from "@/hooks/useControlFacilitadores";
import {
  MapPin,
  Camera,
  LogIn,
  LogOut,
  CheckCircle,
  Wifi,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

function formatHora(timeStr, fechaStr) {
  if (!timeStr) return "-";
  try {
    // Combinar fecha + hora para crear un timestamp UTC completo
    const fecha = fechaStr ?? new Date().toISOString().split("T")[0];
    const iso = `${fecha}T${timeStr.includes("Z") ? timeStr : timeStr + "Z"}`;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return timeStr.substring(0, 5);
    return new Intl.DateTimeFormat("es-BO", {
      timeZone: "America/La_Paz",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return timeStr.substring(0, 5);
  }
}

function formatFecha(fechaStr) {
  if (!fechaStr) return "-";
  const [year, month, day] = fechaStr.split("-");
  return `${day}/${month}/${year}`;
}

export default function ControlLlegadaSalidaPage() {
  const { casaSeleccionada } = useCasaSeleccionada();
  const {
    controles,
    isLoading: isLoadingHistorial,
    loadControles,
    checkIn,
    checkOut,
  } = useControlFacilitadores();

  useEffect(() => {
    loadControles();
  }, []);

  // Fecha de hoy en hora Bolivia (UTC-4) para que coincida con lo que guarda el backend
  const todayBolivia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
  }).format(new Date());
  const controlDeHoy = controles.find(
    (c) => c.fecha === todayBolivia && !c.hora_salida,
  );

  const [ubicacion, setUbicacion] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoSalida, setFotoSalida] = useState(null);
  const [fotoSalidaPreview, setFotoSalidaPreview] = useState(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraActivaSalida, setCameraActivaSalida] = useState(false);
  const cameraRef = useRef(null);
  const cameraSalidaRef = useRef(null);

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
          setIsLoadingGPS(false);
        },
        (err) => {
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
      setCameraActive(true);
    } catch (err) {
      setError("No se puede acceder a la cámara");
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
      setCameraActive(false);
    }
  };

  // Cámara para salida
  const handleCapturarFotoSalida = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const video = cameraSalidaRef.current;
      if (video) {
        video.srcObject = stream;
        video.style.display = "block";
      }
      setCameraActivaSalida(true);
    } catch (err) {
      setError("No se puede acceder a la cámara");
    }
  };

  const handleTomarFotoSalida = () => {
    if (cameraSalidaRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = cameraSalidaRef.current.videoWidth;
      canvas.height = cameraSalidaRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(cameraSalidaRef.current, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setFotoSalida(imageData);
      setFotoSalidaPreview(imageData);
      const stream = cameraSalidaRef.current.srcObject;
      stream?.getTracks().forEach((track) => track.stop());
      cameraSalidaRef.current.style.display = "none";
      setCameraActivaSalida(false);
    }
  };

  const handleRegistrarLlegada = async () => {
    setError("");
    if (!casaSeleccionada?.id) {
      setError("No tienes una casa comunal seleccionada");
      return;
    }
    if (!foto) {
      setError("Debes tomar una foto como comprobante");
      return;
    }
    setIsSaving(true);
    try {
      const fotoBlob = await fetch(foto).then((r) => r.blob());
      const fotoFile = new File([fotoBlob], "foto_entrada.jpg", {
        type: "image/jpeg",
      });
      await checkIn(
        ubicacion?.lat ?? 0,
        ubicacion?.lng ?? 0,
        fotoFile,
        casaSeleccionada.id,
      );
      setSuccessMessage("Llegada registrada correctamente");
      setFoto(null);
      setFotoPreview(null);
      loadControles();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Error al registrar la llegada");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegistrarSalida = async () => {
    setError("");
    if (!controlDeHoy) {
      setError(
        "No hay un check-in activo para hoy. Registra tu llegada primero.",
      );
      return;
    }
    if (!fotoSalida) {
      setError("Debes tomar una foto como comprobante de salida");
      return;
    }
    setIsSaving(true);
    try {
      const fotoBlob = await fetch(fotoSalida).then((r) => r.blob());
      const fotoFile = new File([fotoBlob], "foto_salida.jpg", {
        type: "image/jpeg",
      });
      await checkOut(controlDeHoy.id, fotoFile);
      setSuccessMessage("Salida registrada correctamente");
      setFotoSalida(null);
      setFotoSalidaPreview(null);
      loadControles();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Error al registrar la salida");
    } finally {
      setIsSaving(false);
    }
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                  {cameraActive && (
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
            disabled={!foto || isSaving}
          >
            {isSaving ? "Guardando..." : "Registrar Llegada"}
          </Button>
        </div>
      </Card>

      {/* SECCIÓN SALIDA */}
      <Card className="border-l-4 border-l-red-500">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <LogOut size={24} className="text-red-600" />
          Registrar Salida
        </h2>

        {!controlDeHoy ? (
          <p className="text-sm text-amber-600">
            Registra tu llegada primero para poder registrar la salida.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Camera size={18} className="text-gray-700" />
                Foto de Comprobante
              </label>
              <div className="space-y-2">
                {!fotoSalida ? (
                  <>
                    <video
                      ref={cameraSalidaRef}
                      style={{ display: "none", width: "100%" }}
                      autoPlay
                      playsInline
                    />
                    {!fotoSalidaPreview && (
                      <Button
                        variant="secondary"
                        onClick={handleCapturarFotoSalida}
                        className="w-full"
                      >
                        <Camera size={20} className="mr-2" />
                        Acceder a Cámara
                      </Button>
                    )}
                    {cameraActivaSalida && (
                      <Button
                        variant="primary"
                        onClick={handleTomarFotoSalida}
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
                      src={fotoSalidaPreview}
                      alt="Foto salida"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setFotoSalida(null);
                        setFotoSalidaPreview(null);
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
              onClick={handleRegistrarSalida}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={!fotoSalida || isSaving}
            >
              {isSaving ? "Guardando..." : "Registrar Salida"}
            </Button>
          </div>
        )}
      </Card>

      {/* HISTORIAL */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <History size={22} className="text-slate-600" />
          <h2 className="text-xl font-bold text-slate-900">
            Historial de registros
          </h2>
        </div>

        {isLoadingHistorial ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : controles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay registros aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {controles.map((registro) => (
              <div
                key={registro.id}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                {/* Fecha + badge validación */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-sm">
                    {formatFecha(registro.fecha)}
                  </span>
                  {registro.validado === true ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} />
                      Validado
                    </span>
                  ) : registro.validado === false ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      <XCircle size={12} />
                      Rechazado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <AlertCircle size={12} />
                      Pendiente
                    </span>
                  )}
                </div>

                {/* Horas */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-md">
                      <LogIn size={14} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Entrada</p>
                      <p className="font-medium text-slate-800">
                        {formatHora(registro.hora_entrada, registro.fecha)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-100 rounded-md">
                      <LogOut size={14} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Salida</p>
                      <p className="font-medium text-slate-800">
                        {formatHora(registro.hora_salida, registro.fecha)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fotos */}
                {(registro.foto_entrada_url || registro.foto_salida_url) && (
                  <div className="flex gap-2 pt-1">
                    {registro.foto_entrada_url && (
                      <img
                        src={registro.foto_entrada_url}
                        alt="Foto entrada"
                        className="h-14 w-14 object-cover rounded-md border border-gray-200"
                      />
                    )}
                    {registro.foto_salida_url && (
                      <img
                        src={registro.foto_salida_url}
                        alt="Foto salida"
                        className="h-14 w-14 object-cover rounded-md border border-gray-200"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
