"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useActividades } from "@/hooks/useActividades";
import { useGestion } from "@/context/GestionContext";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ActividadesPage() {
  const {
    actividades,
    isLoading,
    error,
    loadActividades,
    createActividad,
    registrarAsistencia,
    loadReporteActividad,
  } = useActividades();
  const { gestionActiva, gestiones } = useGestion();

  const [searchText, setSearchText] = useState("");
  const [filterTipo, setFilterTipo] = useState("todas");
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAsistenciaModal, setShowAsistenciaModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [casas, setCasas] = useState([]);

  const [formData, setFormData] = useState({
    nombre: "",
    fecha: "",
    descripcion: "",
    es_global: true,
    casa_ids: [],
    facilitador_responsable_id: "",
  });

  // Cargar actividades al montar el componente
  useEffect(() => {
    if (gestionActiva?.id) {
      loadActividades(null, gestionActiva.id);
    }
  }, [gestionActiva?.id]);

  // Cargar casas (simulado - en real vendría del API)
  useEffect(() => {
    // Simulado: casas disponibles
    setCasas([
      { id: 1, nombre: "Casa Central" },
      { id: 2, nombre: "Casa Sur" },
      { id: 3, nombre: "Casa Este" },
      { id: 4, nombre: "Casa Oeste" },
    ]);
  }, []);

  // Filtrar actividades
  const filteredActividades = actividades.filter((act) => {
    const matchText =
      act.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      (act.descripcion &&
        act.descripcion.toLowerCase().includes(searchText.toLowerCase()));
    const matchTipo =
      filterTipo === "todas" ||
      (filterTipo === "global" ? act.es_global : !act.es_global);
    return matchText && matchTipo;
  });

  const handleCreateActividad = async () => {
    if (!formData.nombre || !formData.fecha) {
      alert("Por favor llena los campos requeridos");
      return;
    }

    setIsSaving(true);
    try {
      await createActividad({
        ...formData,
        gestion_id: gestionActiva?.id,
      });

      setSuccessMessage("Actividad creada exitosamente");
      setShowCreateModal(false);
      setFormData({
        nombre: "",
        fecha: "",
        descripcion: "",
        es_global: true,
        casa_ids: [],
        facilitador_responsable_id: "",
      });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Error al crear actividad");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegistrarAsistencia = async (participanteIds) => {
    if (!selectedActividad || participanteIds.length === 0) {
      alert("Selecciona al menos un participante");
      return;
    }

    setIsSaving(true);
    try {
      await registrarAsistencia(
        selectedActividad.id,
        participanteIds,
        new Date().toISOString().split("T")[0],
      );
      setSuccessMessage("Asistencia registrada");
      setShowAsistenciaModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Error al registrar asistencia");
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Actividades Extracurriculares
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Gestiona las actividades para todas las casas
          </p>
          {gestionActiva && (
            <p className="text-sm text-gray-500 mt-2">
              Viendo:{" "}
              <strong>
                {gestionActiva.anio} - Trimestre {gestionActiva.trimestre}
              </strong>
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Nueva Actividad
        </button>
      </div>

      {/* Success message */}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}

      {/* Error */}
      {error && <Alert type="error" title="Error" message={error} />}

      {/* Filtros */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <Input
              placeholder="Buscar por nombre..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            label="Tipo"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="todas">Todas las actividades</option>
            <option value="global">Globales (todas las casas)</option>
            <option value="especifica">Específicas (por casa)</option>
          </Select>
        </div>
      </Card>

      {/* Grid de actividades */}
      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </Card>
      ) : filteredActividades.length === 0 ? (
        <Card className="text-center py-8">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-600">No hay actividades para mostrar</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActividades.map((actividad) => (
            <Card
              key={actividad.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* Tipo badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 flex-1 group-hover:text-green-600 transition-colors">
                    {actividad.nombre}
                  </h3>
                  {actividad.es_global ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded whitespace-nowrap">
                      Global
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded whitespace-nowrap">
                      Específica
                    </span>
                  )}
                </div>

                {/* Descripción truncada */}
                {actividad.descripcion && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {actividad.descripcion}
                  </p>
                )}

                {/* Meta info */}
                <div className="space-y-2 text-xs text-gray-600">
                  {actividad.fecha && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{formatDate(actividad.fecha)}</span>
                    </div>
                  )}

                  {actividad.facilitador_nombre && (
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>{actividad.facilitador_nombre}</span>
                    </div>
                  )}

                  {!actividad.es_global && actividad.casa_nombre && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{actividad.casa_nombre}</span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="pt-2 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedActividad(actividad);
                      setShowAsistenciaModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    Asistencia
                  </button>

                  <button
                    onClick={() => {
                      setSelectedActividad(actividad);
                      loadReporteActividad(actividad.id);
                    }}
                    className="flex-1 text-green-600 hover:text-green-700 text-sm font-medium py-2 rounded border border-green-200 hover:bg-green-50 transition-colors"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal crear actividad */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Actividad"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <Input
              placeholder="Nombre de la actividad"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <Input
              type="date"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              placeholder="Descripción opcional"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows="3"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="esGlobal"
              checked={formData.es_global}
              onChange={(e) =>
                setFormData({ ...formData, es_global: e.target.checked })
              }
              className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <label
              htmlFor="esGlobal"
              className="text-sm font-medium text-gray-700"
            >
              Esta actividad es global (para todas las casas)
            </label>
          </div>

          {!formData.es_global && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Casas participantes
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {casas.map((casa) => (
                  <label
                    key={casa.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.casa_ids.includes(casa.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            casa_ids: [...formData.casa_ids, casa.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            casa_ids: formData.casa_ids.filter(
                              (id) => id !== casa.id,
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{casa.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateActividad}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Crear Actividad"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal registrar asistencia */}
      {selectedActividad && (
        <Modal
          isOpen={showAsistenciaModal}
          onClose={() => setShowAsistenciaModal(false)}
          title={`Asistencia: ${selectedActividad.nombre}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Selecciona los participantes presentes el{" "}
                {formatDate(selectedActividad.fecha)}
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {/* Simulado: participants - en real vendría del API */}
              {[1, 2, 3, 4].map((participante) => (
                <label
                  key={participante}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Participante {participante}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setShowAsistenciaModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleRegistrarAsistencia([1, 2])}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Registrar Asistencia"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
