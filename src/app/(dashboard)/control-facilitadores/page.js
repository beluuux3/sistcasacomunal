"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useControlFacilitadores } from "@/hooks/useControlFacilitadores";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Camera,
  Eye,
} from "lucide-react";

export default function ControlFacilitadoresPage() {
  const {
    controles,
    isLoading,
    error,
    loadControles,
    validarControl,
    checkIn,
    checkOut,
    loadDocumentos,
  } = useControlFacilitadores();

  const { usuario } = useAuth();
  const [facilitadores, setFacilitadores] = useState([]);
  const [selectedFacilitador, setSelectedFacilitador] = useState("");
  const [selectedFecha, setSelectedFecha] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [selectedControl, setSelectedControl] = useState(null);
  const [showValidacionModal, setShowValidacionModal] = useState(false);
  const [showFotosModal, setShowFotosModal] = useState(false);
  const [validationData, setValidationData] = useState({
    validado: true,
    observaciones: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cargar data inicial
  useEffect(() => {
    loadControles(); // Cargar todos los controles
    // Cargar lista de facilitadores (simulada)
    setFacilitadores([
      { id: 1, nombre: "Juan Pérez" },
      { id: 2, nombre: "María García" },
      { id: 3, nombre: "Carlos López" },
      { id: 4, nombre: "Ana Martínez" },
    ]);
  }, []);

  // Filtrar controles
  const filteredControles = controles.filter((control) => {
    const matchFacilitador =
      !selectedFacilitador ||
      control.facilitador_id === parseInt(selectedFacilitador);
    const matchFecha = !selectedFecha || control.fecha === selectedFecha;
    const matchEstado =
      filterEstado === "todos" ||
      (filterEstado === "validados" && control.validado) ||
      (filterEstado === "pendientes" && !control.validado);
    return matchFacilitador && matchFecha && matchEstado;
  });

  const handleValidar = async () => {
    if (!selectedControl) return;

    setIsSaving(true);
    try {
      await validarControl(
        selectedControl.id,
        validationData.validado,
        validationData.observaciones,
      );
      setSuccessMessage(
        validationData.validado
          ? "Control validado exitosamente"
          : "Control rechazado",
      );
      setShowValidacionModal(false);
      setValidationData({ validado: true, observaciones: "" });
      loadControles(); // Recargar lista
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Error al validar control");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Solo admin puede ver este panel
  if (usuario?.rol !== "Administrador") {
    return (
      <div className="space-y-6">
        <Alert
          type="error"
          title="Acceso denegado"
          message="Solo los administradores pueden acceder a este panel"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Control de Facilitadores
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Panel administrativo de check-in y check-out
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}

      {/* Error */}
      {error && <Alert type="error" title="Error" message={error} />}

      {/* Filtros */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Facilitador"
            value={selectedFacilitador}
            onChange={(e) => setSelectedFacilitador(e.target.value)}
          >
            <option value="">Todos los facilitadores</option>
            {facilitadores.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.nombre}
              </option>
            ))}
          </Select>

          <Input
            label="Fecha"
            type="date"
            value={selectedFecha}
            onChange={(e) => setSelectedFecha(e.target.value)}
          />

          <Select
            label="Estado"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="validados">Validados</option>
            <option value="pendientes">Pendientes de validar</option>
          </Select>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedFacilitador("");
                setSelectedFecha("");
                setFilterEstado("todos");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabla de controles */}
      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      ) : filteredControles.length === 0 ? (
        <Card className="text-center py-8">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-600">
            No hay registros de control para mostrar
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          {(() => {
            const totalPages = Math.ceil(
              filteredControles.length / itemsPerPage,
            );
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = filteredControles.slice(
              startIndex,
              startIndex + itemsPerPage,
            );
            return (
              <div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Facilitador
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Check-in
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Check-out
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Ubicación
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Fotos
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.map((control) => (
                      <tr
                        key={control.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {facilitadores.find(
                            (f) => f.id === control.facilitador_id,
                          )?.nombre || "Desconocido"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(control.fecha)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock size={14} className="text-blue-600" />
                            {formatTime(control.hora_entrada)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            {control.hora_salida ? (
                              <>
                                <Clock size={14} className="text-green-600" />
                                {formatTime(control.hora_salida)}
                              </>
                            ) : (
                              <span className="text-yellow-600 text-xs font-medium">
                                En proceso
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {control.latitud && control.longitud ? (
                            <div className="flex items-center gap-1 text-blue-600 cursor-pointer hover:text-blue-700">
                              <MapPin size={14} />
                              <span className="text-xs">Ver mapa</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedControl(control);
                              setShowFotosModal(true);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors text-xs font-medium"
                          >
                            <Eye size={14} />
                            Ver fotos
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {control.validado ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              <CheckCircle2 size={12} />
                              Validado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                              <AlertCircle size={12} />
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {!control.validado ? (
                            <button
                              onClick={() => {
                                setSelectedControl(control);
                                setValidationData({
                                  validado: true,
                                  observaciones: "",
                                });
                                setShowValidacionModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition-colors"
                            >
                              Validar
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </Card>
      )}

      {/* Modal validar control */}
      {selectedControl && (
        <Modal
          isOpen={showValidacionModal}
          onClose={() => setShowValidacionModal(false)}
          title="Validar Control"
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>
                  {
                    facilitadores.find(
                      (f) => f.id === selectedControl.facilitador_id,
                    )?.nombre
                  }
                </strong>{" "}
                -{formatDate(selectedControl.fecha)}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  ¿Validar este control?
                </p>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 p-2 border border-green-200 rounded cursor-pointer hover:bg-green-50">
                    <input
                      type="radio"
                      name="validacion"
                      checked={validationData.validado}
                      onChange={() =>
                        setValidationData({ ...validationData, validado: true })
                      }
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-gray-700">Aceptar</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 border border-red-200 rounded cursor-pointer hover:bg-red-50">
                    <input
                      type="radio"
                      name="validacion"
                      checked={!validationData.validado}
                      onChange={() =>
                        setValidationData({
                          ...validationData,
                          validado: false,
                        })
                      }
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm text-gray-700">Rechazar</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones (opcional)
                </label>
                <textarea
                  placeholder="Agregar notas..."
                  value={validationData.observaciones}
                  onChange={(e) =>
                    setValidationData({
                      ...validationData,
                      observaciones: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setShowValidacionModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleValidar}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar validación"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal ver fotos */}
      {selectedControl && (
        <Modal
          isOpen={showFotosModal}
          onClose={() => setShowFotosModal(false)}
          title={`Fotos - ${facilitadores.find((f) => f.id === selectedControl.facilitador_id)?.nombre}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Camera size={14} /> Entrada
                </p>
                {selectedControl.foto_entrada_url ? (
                  <img
                    src={selectedControl.foto_entrada_url}
                    alt="Foto entrada"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No hay foto</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Camera size={14} /> Salida
                </p>
                {selectedControl.foto_salida_url ? (
                  <img
                    src={selectedControl.foto_salida_url}
                    alt="Foto salida"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No hay foto</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setShowFotosModal(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
