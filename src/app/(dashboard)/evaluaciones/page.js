"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableEmpty,
} from "@/components/ui/Table";
import { useEvaluaciones } from "@/hooks/useEvaluaciones";
import { useTalleres } from "@/hooks/useTalleres";

export default function EvaluacionesPage() {
  const {
    evaluaciones,
    isLoading,
    error,
    viewMode,
    loadEvaluacionesTaller,
    cargarEvaluacion,
  } = useEvaluaciones();

  const { talleres, loadTalleres } = useTalleres();

  const [selectedTallerForEvaluacion, setSelectedTallerForEvaluacion] =
    useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [editingEvaluacion, setEditingEvaluacion] = useState(null);
  const [formData, setFormData] = useState({
    nota_1: "",
    nota_2: "",
    observaciones: "",
  });
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
      setSelectedTallerForEvaluacion("");
      return;
    }
    setSelectedTallerForEvaluacion(tallerId);
    setFormError("");
    await loadEvaluacionesTaller(parseInt(tallerId));
  };

  const handleEditEvaluacion = (evaluacion) => {
    setEditingEvaluacion(evaluacion);
    setFormData({
      nota_1: evaluacion.nota_1 || "",
      nota_2: evaluacion.nota_2 || "",
      observaciones: evaluacion.observaciones || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validación
    const nota1 = parseFloat(formData.nota_1);
    const nota2 = parseFloat(formData.nota_2);

    if (isNaN(nota1) || nota1 < 0 || nota1 > 100) {
      setFormError("Nota 1 debe ser un número entre 0 y 100");
      return;
    }

    if (isNaN(nota2) || nota2 < 0 || nota2 > 100) {
      setFormError("Nota 2 debe ser un número entre 0 y 100");
      return;
    }

    try {
      await cargarEvaluacion(
        editingEvaluacion.participante_id,
        editingEvaluacion.taller_id,
        nota1,
        nota2,
        formData.observaciones,
      );
      setSuccessMessage("Evaluación actualizada correctamente");
      setIsModalOpen(false);
      setFormData({ nota_1: "", nota_2: "", observaciones: "" });
      setEditingEvaluacion(null);
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Evaluaciones
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Gestión de evaluaciones de participantes
        </p>
      </div>

      {/* Messages */}
      {error && <Alert type="error" title="Error" message={error} />}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}
      {formError && <Alert type="error" title="Error" message={formError} />}

      {/* Selector de Taller */}
      <Card>
        <Select
          label="Seleccionar Taller"
          value={selectedTallerForEvaluacion}
          onChange={(e) => handleSelectTaller(e.target.value)}
        >
          <option value="">Seleccionar taller</option>
          {talleres.map((taller) => (
            <option key={taller.id} value={taller.id}>
              {taller.nombre}
            </option>
          ))}
        </Select>
      </Card>

      {/* Tabla de Evaluaciones */}
      {selectedTallerForEvaluacion && (
        <Card>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
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
                          Nota 1
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                          Nota 2
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left hidden sm:table-cell">
                          Final
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        const totalPages = Math.ceil(
                          evaluaciones.length / itemsPerPage,
                        );
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const paginatedData = evaluaciones.slice(
                          startIndex,
                          startIndex + itemsPerPage,
                        );
                        return paginatedData.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No hay evaluaciones registradas
                            </td>
                          </tr>
                        ) : (
                          paginatedData.map((evaluacion) => (
                            <tr
                              key={`${evaluacion.participante_id}-${evaluacion.taller_id}`}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900">
                                {evaluacion.participante_nombre ||
                                  evaluacion.participante_id}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900">
                                {evaluacion.nota_1 || "-"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900">
                                {evaluacion.nota_2 || "-"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 hidden sm:table-cell">
                                {evaluacion.nota_final || "-"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    handleEditEvaluacion(evaluacion)
                                  }
                                  className="p-1 w-full sm:w-auto"
                                >
                                  Editar
                                </Button>
                              </td>
                            </tr>
                          ))
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
              {evaluaciones.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(evaluaciones.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={evaluaciones.length}
                />
              )}
            </div>
          )}
        </Card>
      )}

      {/* Modal Editar Evaluación */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ nota_1: "", nota_2: "", observaciones: "" });
          setEditingEvaluacion(null);
        }}
        title="Editar Evaluación"
        footerActions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ nota_1: "", nota_2: "", observaciones: "" });
                setEditingEvaluacion(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Guardar
            </Button>
          </>
        }
      >
        {formError && <Alert type="error" title="Error" message={formError} />}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nota 1 (0-100)"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.nota_1}
              onChange={(e) =>
                setFormData({ ...formData, nota_1: e.target.value })
              }
            />
            <Input
              label="Nota 2 (0-100)"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.nota_2}
              onChange={(e) =>
                setFormData({ ...formData, nota_2: e.target.value })
              }
            />
          </div>

          <Textarea
            label="Observaciones"
            value={formData.observaciones}
            onChange={(e) =>
              setFormData({ ...formData, observaciones: e.target.value })
            }
            placeholder="Comentarios o observaciones..."
          />
        </div>
      </Modal>
    </div>
  );
}
