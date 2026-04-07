"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useAsistencia } from "@/hooks/useAsistencia";
import { useTalleres } from "@/hooks/useTalleres";

export default function AsistenciaPage() {
  const {
    registrarAsistencia,
    loadHistorial,
    historial,
    selectedTaller,
    isLoading,
    error,
  } = useAsistencia();

  const { talleres, loadTalleres } = useTalleres();

  const [view, setView] = useState("registro"); // 'registro' o 'historial'
  const [selectedTallerForAsistencia, setSelectedTallerForAsistencia] =
    useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadTalleres();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSelectTaller = async (tallerId) => {
    if (!tallerId) {
      setParticipantes([]);
      setAsistencias({});
      return;
    }

    setSelectedTallerForAsistencia(tallerId);
    setFormError("");

    // Aquí normalmente cargarías los participantes del taller
    // Por ahora vamos a mostrar un placeholder
    const taller = talleres.find((t) => t.id === parseInt(tallerId));
    if (taller) {
      // En una implementación real, traerías los participantes del taller
      setAsistencias({});
    }
  };

  const handleToggleAsistencia = (participanteId) => {
    setAsistencias((prev) => ({
      ...prev,
      [participanteId]: !prev[participanteId],
    }));
  };

  const handleRegistrarAsistencia = async () => {
    if (!selectedTallerForAsistencia) {
      setFormError("Debe seleccionar un taller");
      return;
    }

    const registros = Object.entries(asistencias).map(([Id, presente]) => ({
      participante_id: parseInt(Id),
      presente,
    }));

    if (registros.length === 0) {
      setFormError("Debe seleccionar al menos un participante");
      return;
    }

    try {
      setFormError("");
      await registrarAsistencia(
        parseInt(selectedTallerForAsistencia),
        fecha,
        registros,
      );
      setSuccessMessage("Asistencia registrada correctamente");
      setAsistencias({});
      setSelectedTallerForAsistencia("");
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleViewHistorial = async (tallerId) => {
    if (tallerId) {
      await loadHistorial(parseInt(tallerId));
      setView("historial");
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Asistencia
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Registro y control de asistencia
        </p>
      </div>

      {/* Messages */}
      {error && <Alert type="error" title="Error" message={error} />}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}
      {formError && <Alert type="error" title="Error" message={formError} />}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={view === "registro" ? "primary" : "secondary"}
          onClick={() => setView("registro")}
        >
          Registrar Asistencia
        </Button>
        <Button
          variant={view === "historial" ? "primary" : "secondary"}
          onClick={() => setView("historial")}
        >
          Ver Historial
        </Button>
      </div>

      {/* Registro View */}
      {view === "registro" && (
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Seleccionar Taller"
                value={selectedTallerForAsistencia}
                onChange={(e) => handleSelectTaller(e.target.value)}
              >
                <option value="">Seleccionar taller</option>
                {talleres.map((taller) => (
                  <option key={taller.id} value={taller.id}>
                    {taller.nombre}
                  </option>
                ))}
              </Select>
              <Input
                label="Fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            {selectedTallerForAsistencia && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Nota: En esta versión se registra la asistencia de los
                    participantes. Selecciona los presentes arriba y guarda.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={handleRegistrarAsistencia}
                  disabled={isLoading}
                >
                  {isLoading ? "Registrando..." : "Registrar Asistencia"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Historial View */}
      {view === "historial" && (
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Historial de Asistencia
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Seleccionar taller para ver historial</option>
                {talleres.map((taller) => (
                  <option key={taller.id} value={taller.id}>
                    {taller.nombre}
                  </option>
                ))}
              </select>
            </div>

            {historial.length > 0 && (
              <div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full px-4 sm:px-0">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                            Participante
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                            Fecha
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(() => {
                          const totalPages = Math.ceil(
                            historial.length / itemsPerPage,
                          );
                          const startIndex = (currentPage - 1) * itemsPerPage;
                          const paginatedData = historial.slice(
                            startIndex,
                            startIndex + itemsPerPage,
                          );
                          return paginatedData.map((registro, idx) => (
                            <tr
                              key={`${registro.taller_id}-${idx}`}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900">
                                {registro.participante_id}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900">
                                {registro.fecha}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900">
                                <span
                                  className={`px-2 py-1 rounded text-white text-xs ${
                                    registro.presente
                                      ? "bg-green-600"
                                      : "bg-red-600"
                                  }`}
                                >
                                  {registro.presente ? "Presente" : "Ausente"}
                                </span>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(historial.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={historial.length}
                />
              </div>
            )}

            {historial.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No hay registros de asistencia
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
