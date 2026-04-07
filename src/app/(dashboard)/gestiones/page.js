"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useGestiones } from "@/hooks/useGestiones";
import { useCasas } from "@/hooks/useCasas";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/lib/hooks";
import { Plus, Edit2, CheckCircle, Calendar } from "lucide-react";

const TRIMESTRES = {
  1: "Ene–Mar",
  2: "Abr–Jun",
  3: "Jul–Sep",
  4: "Oct–Dic",
};

export default function GestionesPage() {
  const { usuario } = useAuth();
  const isAdmin = useIsAdmin();
  const {
    gestiones,
    gestionActiva,
    casasGestion,
    isLoading,
    error,
    loadGestiones,
    createGestion,
    activarGestion,
    loadCasasGestion,
    agregarCasaGestion,
    removerCasaGestion,
  } = useGestiones();

  const { casas, loadCasas } = useCasas();

  const [showFormModal, setShowFormModal] = useState(false);
  const [showCasasModal, setShowCasasModal] = useState(false);
  const [showAgregarCasaModal, setShowAgregarCasaModal] = useState(false);
  const [selectedGestion, setSelectedGestion] = useState(null);
  const [selectedCasaToAdd, setSelectedCasaToAdd] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingCasa, setIsAddingCasa] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    anio: new Date().getFullYear(),
    trimestre: 1,
    fechaInicio: "",
    fechaFin: "",
  });

  useEffect(() => {
    loadGestiones();
  }, [loadGestiones]);

  // Crear gestión handler
  const handleCreateGestion = async () => {
    if (!formData.trimestre) {
      alert("Debes seleccionar un trimestre");
      return;
    }

    setIsSaving(true);
    try {
      await createGestion(
        formData.anio,
        formData.trimestre,
        formData.fechaInicio || null,
        formData.fechaFin || null,
      );
      setSuccessMessage("Gestión creada exitosamente");
      setTimeout(() => {
        setShowFormModal(false);
        setFormData({
          anio: new Date().getFullYear(),
          trimestre: 1,
          fechaInicio: "",
          fechaFin: "",
        });
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      alert("Error: " + (err.message || "No se pudo crear la gestión"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivarGestion = async (gestionId) => {
    if (
      !window.confirm(
        "¿Activar esta gestión? La gestión anterior se desactivará.",
      )
    ) {
      return;
    }

    try {
      await activarGestion(gestionId);
      setSuccessMessage("Gestión activada exitosamente");
      setTimeout(() => setSuccessMessage(""), 1500);
    } catch (err) {
      alert("Error: " + (err.message || "No se pudo activar la gestión"));
    }
  };

  const handleShowCasas = (gestion) => {
    console.log("Click en Casas para gestión:", gestion);
    setSelectedGestion(gestion);
    setShowCasasModal(true);
    console.log("Modal debería abrirse ahora");

    // Cargar casas de la gestión y todas las casas disponibles
    setTimeout(async () => {
      try {
        console.log("Cargando casas...");
        await loadCasasGestion(gestion.id);
        await loadCasas();
        console.log("Casas cargadas");
      } catch (err) {
        console.error("Error al cargar casas:", err);
      }
    }, 100);
  };

  const handleAgregarCasa = async () => {
    if (!selectedCasaToAdd) {
      alert("Debes seleccionar una casa");
      return;
    }

    setIsAddingCasa(true);
    try {
      await agregarCasaGestion(selectedGestion.id, selectedCasaToAdd);
      await loadCasasGestion(selectedGestion.id);
      setSelectedCasaToAdd(null);
      setSuccessMessage("Casa agregada exitosamente");
      setTimeout(() => setSuccessMessage(""), 1500);
    } catch (err) {
      alert("Error: " + (err.message || "No se pudo agregar la casa"));
    } finally {
      setIsAddingCasa(false);
    }
  };

  const handleAgregarTodasLasCasas = async () => {
    const casasNoAsociadas = casas.filter(
      (casa) => !casasGestion.some((cg) => cg.id === casa.id),
    );

    if (casasNoAsociadas.length === 0) {
      alert("Todas las casas ya están asociadas a esta gestión");
      return;
    }

    if (
      !window.confirm(
        `¿Agregar ${casasNoAsociadas.length} casas a esta gestión?`,
      )
    ) {
      return;
    }

    setIsAddingCasa(true);
    try {
      for (const casa of casasNoAsociadas) {
        await agregarCasaGestion(selectedGestion.id, casa.id);
      }
      await loadCasasGestion(selectedGestion.id);
      setSelectedCasaToAdd(null);
      setSuccessMessage(
        `${casasNoAsociadas.length} casas agregadas exitosamente`,
      );
      setTimeout(() => setSuccessMessage(""), 1500);
    } catch (err) {
      alert("Error: " + (err.message || "No se pudo agregar las casas"));
    } finally {
      setIsAddingCasa(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Alert
          type="error"
          title="No autorizado"
          message="Solo administradores pueden acceder a este módulo"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Gestiones Trimestrales
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Administra los trimestres y las casas comunales asociadas
          </p>
        </div>
        <Button
          onClick={() => setShowFormModal(true)}
          className="flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Nueva Gestión
        </Button>
      </div>

      {/* Mensajes */}
      {error && <Alert type="error" title="Error" message={error} />}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}

      {/* Gestión activa (Info) */}
      {gestionActiva && (
        <Card className="border-l-4 border-green-600 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Gestión Activa: {gestionActiva.nombre}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Trimestre {TRIMESTRES[gestionActiva.trimestre]} de{" "}
                {gestionActiva.anio}
              </p>
              {gestionActiva.fecha_inicio && gestionActiva.fecha_fin && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(
                    gestionActiva.fecha_inicio,
                  ).toLocaleDateString()} -{" "}
                  {new Date(gestionActiva.fecha_fin).toLocaleDateString()}
                </p>
              )}
            </div>
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </Card>
      )}

      {/* Tabla de gestiones */}
      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      ) : (
        <Card>
          {(() => {
            const totalPages = Math.ceil(gestiones.length / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = gestiones.slice(
              startIndex,
              startIndex + itemsPerPage,
            );
            return (
              <div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full px-4 sm:px-0">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                            Gestión
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left hidden sm:table-cell">
                            Año
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                            Trimestre
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left hidden md:table-cell">
                            Fechas
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                            Estado
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-center">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {gestiones.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No hay gestiones. Crea la primera.
                            </td>
                          </tr>
                        ) : (
                          paginatedData.map((gestion) => (
                            <tr
                              key={gestion.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 font-bold">
                                {gestion.nombre}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 hidden sm:table-cell">
                                {gestion.anio}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900">
                                {TRIMESTRES[gestion.trimestre]} (T
                                {gestion.trimestre})
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-xs hidden md:table-cell">
                                {gestion.fecha_inicio && gestion.fecha_fin ? (
                                  <>
                                    {new Date(
                                      gestion.fecha_inicio,
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(
                                      gestion.fecha_fin,
                                    ).toLocaleDateString()}
                                  </>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {gestion.activo ? (
                                  <span className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold">
                                    ● ACTIVA
                                  </span>
                                ) : (
                                  <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-bold">
                                    Inactiva
                                  </span>
                                )}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                                <div className="flex gap-2 justify-center flex-wrap">
                                  {!gestion.activo && (
                                    <button
                                      onClick={() =>
                                        handleActivarGestion(gestion.id)
                                      }
                                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                                    >
                                      Activar
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleShowCasas(gestion)}
                                    className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded transition-colors"
                                  >
                                    Casas
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {gestiones.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={gestiones.length}
                  />
                )}
              </div>
            );
          })()}
        </Card>
      )}

      {/* Modal: Crear Gestión */}
      {showFormModal && (
        <Modal
          title="Nueva Gestión"
          onClose={() => setShowFormModal(false)}
          size="md"
        >
          <div className="space-y-4">
            {successMessage && (
              <Alert type="success" title="Éxito" message={successMessage} />
            )}

            <Input
              label="Año"
              type="number"
              value={formData.anio}
              onChange={(e) =>
                setFormData({ ...formData, anio: parseInt(e.target.value) })
              }
              min="2020"
              max="2030"
            />

            <Select
              label="Trimestre"
              value={formData.trimestre}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  trimestre: parseInt(e.target.value),
                })
              }
            >
              <option value="1">T1 - Ene–Mar</option>
              <option value="2">T2 - Abr–Jun</option>
              <option value="3">T3 - Jul–Sep</option>
              <option value="4">T4 - Oct–Dic</option>
            </Select>

            <Input
              label="Fecha Inicio (Opcional)"
              type="date"
              value={formData.fechaInicio}
              onChange={(e) =>
                setFormData({ ...formData, fechaInicio: e.target.value })
              }
            />

            <Input
              label="Fecha Fin (Opcional)"
              type="date"
              value={formData.fechaFin}
              onChange={(e) =>
                setFormData({ ...formData, fechaFin: e.target.value })
              }
            />

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowFormModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateGestion}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? "Guardando..." : "Crear Gestión"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Casas de la Gestión - TEST */}
      {showCasasModal && selectedGestion && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-700">
                Casas - {selectedGestion.nombre}
              </h2>
              <button
                onClick={() => setShowCasasModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Casas comunales asociadas a este trimestre
              </p>

              {casasGestion.length === 0 ? (
                <div className="bg-gray-50 p-4 text-center text-gray-500 rounded">
                  No hay casas asociadas. Agrega una.
                </div>
              ) : (
                <div className="space-y-2">
                  {casasGestion.map((casa) => (
                    <div
                      key={casa.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {casa.nombre}
                        </p>
                        <p className="text-xs text-gray-600">
                          {casa.macrodistrito}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          removerCasaGestion(selectedGestion.id, casa.id)
                        }
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors whitespace-nowrap"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6 space-y-3 flex-shrink-0">
              <p className="text-sm font-semibold text-gray-700">
                Agregar Casa
              </p>
              <div className="flex gap-2">
                <Select
                  value={selectedCasaToAdd || ""}
                  onChange={(e) =>
                    setSelectedCasaToAdd(
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  className="flex-1"
                >
                  <option value="">Selecciona una casa...</option>
                  {casas
                    .filter(
                      (casa) => !casasGestion.some((cg) => cg.id === casa.id),
                    )
                    .map((casa) => (
                      <option key={casa.id} value={casa.id}>
                        {casa.nombre}
                      </option>
                    ))}
                </Select>
                <Button
                  onClick={handleAgregarCasa}
                  disabled={!selectedCasaToAdd || isAddingCasa}
                >
                  {isAddingCasa ? "Agregando..." : "Agregar"}
                </Button>
              </div>
              <Button
                onClick={handleAgregarTodasLasCasas}
                disabled={isAddingCasa}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Agregar Todas las Casas
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
