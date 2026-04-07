"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useHorarios } from "@/hooks/useHorarios";
import { useGestion } from "@/context/GestionContext";
import { useGestiones } from "@/hooks/useGestiones";
import { useAuth } from "@/context/AuthContext";
import {
  Printer,
  Users,
  Clock,
  Edit2,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";

const TRIMESTRE_LABELS = {
  1: "Ene–Mar",
  2: "Abr–Jun",
  3: "Jul–Sep",
  4: "Oct–Dic",
};

export default function HorariosPage() {
  const {
    horarios,
    casas,
    talleres,
    facilitadores,
    isLoading,
    error,
    filtroDia,
    setFiltroDia,
    loadHorarios,
    loadCasasYFacilitadores,
    createHorario,
    updateHorario,
    deleteHorario,
    getDiasDisponibles,
  } = useHorarios();

  const { gestionActiva } = useGestion();
  const { gestiones, createGestion } = useGestiones();
  const { usuario } = useAuth();

  const [viewMode, setViewMode] = useState("week");
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [casaSeleccionada, setCasaSeleccionada] = useState(null);
  const [showNewGestionModal, setShowNewGestionModal] = useState(false);
  const [gestionFormData, setGestionFormData] = useState({
    anio: new Date().getFullYear(),
    trimestre: 1,
    f_inicio: "",
    f_fin: "",
  });
  const [formData, setFormData] = useState({
    casa_comunal_id: "",
    facilitador_id: "",
    dia_semana: "",
    hora_inicio: "",
    hora_fin: "",
    taller_id: "",
    gestion_id: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadHorarios();
    loadCasasYFacilitadores();
  }, [loadHorarios, loadCasasYFacilitadores]);

  const dias = getDiasDisponibles();

  const colorMap = {
    /* Zones */
    "Z. NORTE": "bg-blue-50 border-l-4 border-blue-600",
    "Z. SUR": "bg-orange-50 border-l-4 border-orange-600",
    "Z. CENTRAL": "bg-green-50 border-l-4 border-green-600",
    "Z. ESTE": "bg-purple-50 border-l-4 border-purple-600",
    "Z. OESTE": "bg-red-50 border-l-4 border-red-600",
    /* Macrodistritos */
    COTAHUMA: "bg-indigo-50 border-l-4 border-indigo-600",
    "MAX PAREDES": "bg-cyan-50 border-l-4 border-cyan-600",
    PERIFÉRICA: "bg-teal-50 border-l-4 border-teal-600",
    "SAN ANTONIO": "bg-rose-50 border-l-4 border-rose-600",
    SUR: "bg-amber-50 border-l-4 border-amber-600",
    MALLASA: "bg-lime-50 border-l-4 border-lime-600",
    CENTRO: "bg-green-50 border-l-4 border-green-600",
    ANDINO: "bg-violet-50 border-l-4 border-violet-600",
    HAMPATURI: "bg-sky-50 border-l-4 border-sky-600",
    ZONGO: "bg-fuchsia-50 border-l-4 border-fuchsia-600",
  };

  const getColorClass = (macrodistrito) => {
    const normalized = macrodistrito?.toUpperCase() || "";
    for (const [key, value] of Object.entries(colorMap)) {
      if (normalized.includes(key)) return value;
    }
    return "bg-slate-50 border-l-4 border-slate-400";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateGestion = async () => {
    if (usuario?.rol !== "Administrador") {
      alert("Solo los administradores pueden crear gestiones");
      return;
    }

    try {
      await createGestion(
        gestionFormData.anio,
        gestionFormData.trimestre,
        gestionFormData.f_inicio,
        gestionFormData.f_fin,
      );
      setSuccessMessage("Gestión creada exitosamente");
      setShowNewGestionModal(false);
      setGestionFormData({
        anio: new Date().getFullYear(),
        trimestre: 1,
        f_inicio: "",
        f_fin: "",
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Error al crear gestión");
    }
  };

  return (
    <div className="space-y-6" id="print-content">
      {/* Header con botones */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Horarios
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {viewMode === "week"
              ? "Grilla semanal de horarios"
              : "Vista por día"}
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
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors sm:order-2"
        >
          <Printer size={18} />
          Imprimir
        </button>
      </div>

      {/* Success message */}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}

      {/* Gestiones Section */}
      <Card className="p-4 border-2 border-blue-300 bg-blue-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">
              Gestión Activa:
            </p>
            {gestionActiva ? (
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {gestionActiva.anio} - Trimestre {gestionActiva.trimestre} (
                  {TRIMESTRE_LABELS[gestionActiva.trimestre]})
                </p>
                {gestionActiva.f_inicio && gestionActiva.f_fin && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(gestionActiva.f_inicio).toLocaleDateString(
                      "es-BO",
                    )}{" "}
                    -{" "}
                    {new Date(gestionActiva.f_fin).toLocaleDateString("es-BO")}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-lg font-bold text-red-600">
                No hay gestión activa
              </p>
            )}
          </div>
          {usuario?.rol === "Administrador" && (
            <button
              onClick={() => setShowNewGestionModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              <Plus size={18} />
              Nueva Gestión
            </button>
          )}
        </div>
      </Card>

      {/* Error */}
      {error && <Alert type="error" title="Error" message={error} />}

      {/* Filtros y Vista Toggle */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Filtrar por día"
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
          >
            <option value="">Todos los días</option>
            {dias.map((dia) => (
              <option key={dia.value} value={dia.value}>
                {dia.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Vista Toggle */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Vista Semanal
          </button>
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "day"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Vista por Día
          </button>
        </div>
      </Card>

      {/* Contenido */}
      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      ) : viewMode === "week" ? (
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="px-6 sm:px-0 min-w-full inline-block">
            <div className="grid grid-cols-5 gap-3 lg:gap-4">
              {dias.slice(0, 5).map((dia) => {
                const diaHorarios = horarios.filter(
                  (h) => h.dia_semana === dia.value,
                );

                return (
                  <div key={dia.value} className="min-w-max lg:min-w-0">
                    {/* Encabezado del día */}
                    <div className="bg-blue-600 text-white text-xs sm:text-sm font-bold py-2 px-2 rounded-t-lg text-center">
                      {dia.label}
                    </div>

                    {/* Horarios del día */}
                    <div className="space-y-2 p-2 bg-gray-50 rounded-b-lg min-h-80">
                      {diaHorarios.length === 0 ? (
                        <div
                          onClick={() => {
                            setIsEditing(true);
                            setSelectedHorario(null);
                            setFormData({
                              casa_comunal_id: "",
                              facilitador_id: "",
                              dia_semana: dia.value,
                              hora_inicio: "",
                              hora_fin: "",
                              taller_id: "",
                              gestion_id: gestionActiva?.id,
                            });
                          }}
                          className="border-2 border-dashed border-blue-400 rounded-lg p-4 text-center cursor-pointer hover:bg-blue-100 transition-colors min-h-72 flex items-center justify-center flex-col gap-3"
                        >
                          <Plus size={32} className="text-blue-400" />
                          <p className="text-sm text-gray-600 font-medium">
                            Click para agregar horario
                          </p>
                        </div>
                      ) : (
                        diaHorarios.map((horario, idx) => (
                          <div
                            key={`${horario.id}-${idx}`}
                            onClick={() => {
                              setSelectedHorario(horario);
                              setIsEditing(false);
                            }}
                            className={`p-2 rounded text-xs space-y-1 cursor-pointer hover:shadow-md transition-all transform hover:scale-105 ${getColorClass(
                              horario.macrodistrito,
                            )}`}
                          >
                            {/* Zona */}
                            <div className="font-bold text-gray-700 uppercase">
                              {horario.macrodistrito ||
                                horario.zona_nombre ||
                                "Sin zona"}
                            </div>

                            {/* Horas */}
                            <div className="text-gray-600 font-semibold">
                              {horario.hora_inicio} - {horario.hora_fin}
                            </div>

                            {/* Casa Comunal */}
                            <div className="font-semibold text-gray-900">
                              {horario.casa_nombre || "-"}
                            </div>

                            {/* Taller */}
                            <div className="text-gray-700 text-xs">
                              {horario.taller_nombre || "-"}
                            </div>

                            {/* Facilitador */}
                            <div className="flex items-center gap-1 text-gray-700 pt-1 border-t border-gray-200">
                              <Users size={12} />
                              <span className="text-xs">
                                {horario.facilitador_nombre || "-"}
                              </span>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Botón para agregar más horarios en el día */}
                      {diaHorarios.length > 0 && (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setSelectedHorario(null);
                            setFormData({
                              casa_comunal_id: "",
                              facilitador_id: "",
                              dia_semana: dia.value,
                              hora_inicio: "",
                              hora_fin: "",
                              taller_id: "",
                              gestion_id: gestionActiva?.id,
                            });
                          }}
                          className="flex items-center justify-center w-full p-2 mt-1 text-xs font-medium text-blue-600 border-2 border-dashed border-blue-400 rounded-lg hover:bg-blue-50 transition-colors gap-1"
                        >
                          <Plus size={14} />
                          Agregar otro
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {dias.map((dia) => {
            const diaHorarios = horarios.filter(
              (h) => h.dia_semana === dia.value,
            );

            return (
              <Card key={dia.value}>
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    {dia.label}
                  </h2>
                </div>

                {diaHorarios.length === 0 ? (
                  <p className="text-gray-500">No hay horarios para este día</p>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full px-4 sm:px-0">
                      <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                              Casa Comunal
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                              Horas
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left hidden sm:table-cell">
                              Facilitador
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left hidden sm:table-cell">
                              Zona
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {diaHorarios.map((horario, idx) => (
                            <tr
                              key={`${horario.id}-${idx}`}
                              onClick={() => {
                                setSelectedHorario(horario);
                                setIsEditing(false);
                              }}
                              className={`hover:brightness-95 transition-all cursor-pointer border-l-4 ${getColorClass(
                                horario.macrodistrito,
                              )}`}
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 font-medium">
                                {horario.casa_nombre || "-"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900">
                                {horario.hora_inicio} - {horario.hora_fin}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 hidden sm:table-cell">
                                {horario.facilitador_nombre || "-"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 hidden sm:table-cell">
                                {horario.macrodistrito || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Edición/Creación o Detalles */}
      <Modal
        isOpen={!!(selectedHorario || isEditing)}
        onClose={() => {
          setSelectedHorario(null);
          setIsEditing(false);
        }}
        title={
          isEditing
            ? selectedHorario
              ? `Editar Horario`
              : "Crear Nuevo Horario"
            : `Horario - ${selectedHorario?.casa_nombre || ""}`
        }
        maxWidth="max-w-lg"
      >
        {isEditing ? (
          <div className="space-y-4">
            {successMessage && (
              <Alert type="success" title="Éxito" message={successMessage} />
            )}

            <Select
              label="Casa Comunal"
              value={formData.casa_comunal_id}
              onChange={(e) =>
                setFormData({ ...formData, casa_comunal_id: e.target.value })
              }
            >
              <option value="">Seleccionar Casa Comunal</option>
              {casas.map((casa) => (
                <option key={casa.id} value={casa.id}>
                  {casa.nombre}
                </option>
              ))}
            </Select>

            <Select
              label="Día"
              value={formData.dia_semana}
              onChange={(e) =>
                setFormData({ ...formData, dia_semana: e.target.value })
              }
            >
              <option value="">Seleccionar día</option>
              {dias.map((dia) => (
                <option key={dia.value} value={dia.value}>
                  {dia.label}
                </option>
              ))}
            </Select>

            <Input
              label="Hora Inicio"
              type="time"
              value={formData.hora_inicio}
              onChange={(e) =>
                setFormData({ ...formData, hora_inicio: e.target.value })
              }
            />

            <Input
              label="Hora Fin"
              type="time"
              value={formData.hora_fin}
              onChange={(e) =>
                setFormData({ ...formData, hora_fin: e.target.value })
              }
            />

            <Select
              label="Taller"
              value={formData.taller_id}
              onChange={(e) =>
                setFormData({ ...formData, taller_id: e.target.value })
              }
            >
              <option value="">Seleccionar taller</option>
              {talleres.map((taller) => (
                <option key={taller.id} value={taller.id}>
                  {taller.nombre || taller.nombre_taller || "Sin nombre"}
                </option>
              ))}
            </Select>

            <Select
              label="Facilitador (Opcional)"
              value={formData.facilitador_id}
              onChange={(e) =>
                setFormData({ ...formData, facilitador_id: e.target.value })
              }
            >
              <option value="">Sin asignar</option>
              {facilitadores.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.nombre_completo}
                </option>
              ))}
            </Select>

            <div className="flex gap-2 pt-4 flex-wrap">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedHorario(null);
                  setFormData({
                    casa_comunal_id: "",
                    facilitador_id: "",
                    dia_semana: "",
                    hora_inicio: "",
                    hora_fin: "",
                    taller_id: "",
                    gestion_id: null,
                  });
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>

              {!selectedHorario || !selectedHorario.id ? (
                <>
                  <Button
                    onClick={() => {
                      setFormData({
                        casa_comunal_id: formData.casa_comunal_id,
                        facilitador_id: "",
                        dia_semana: formData.dia_semana,
                        hora_inicio: "",
                        hora_fin: "",
                        taller_id: "",
                        gestion_id: gestionActiva?.id,
                      });
                    }}
                    variant="secondary"
                    className="flex-1 text-sm"
                  >
                    + Agregar otro
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!formData.casa_comunal_id) {
                        alert("Debes seleccionar una casa comunal");
                        return;
                      }
                      if (!formData.dia_semana) {
                        alert("Debes seleccionar un día");
                        return;
                      }
                      if (!formData.hora_inicio || !formData.hora_fin) {
                        alert("Debes especificar las horas");
                        return;
                      }
                      if (!gestionActiva?.id) {
                        alert("Debes seleccionar una gestión activa");
                        return;
                      }

                      setIsSaving(true);
                      try {
                        // Construir payload con campos opcionales
                        const payload = {
                          dia_semana: parseInt(formData.dia_semana),
                          hora_inicio: formData.hora_inicio,
                          hora_fin: formData.hora_fin,
                        };

                        // Agregar facilitador_id solo si está seleccionado
                        if (formData.facilitador_id) {
                          payload.facilitador_id = parseInt(
                            formData.facilitador_id,
                          );
                        }

                        // Agregar taller_id solo si está seleccionado
                        if (formData.taller_id) {
                          payload.taller_id = parseInt(formData.taller_id);
                        }

                        console.log("=== GUARDANDO HORARIO (PAYLOAD) ===");
                        console.log(
                          "Casa ID:",
                          parseInt(formData.casa_comunal_id),
                        );
                        console.log(
                          "Payload:",
                          JSON.stringify(payload, null, 2),
                        );
                        console.log("Gestión Activa:", gestionActiva?.id);
                        console.log(
                          "==========================================",
                        );

                        // Determinar si es creación o actualización
                        if (selectedHorario && selectedHorario.id) {
                          // Actualizar horario existente
                          await updateHorario(
                            selectedHorario.casa_id,
                            selectedHorario.id,
                            payload,
                          );
                          setSuccessMessage("Horario actualizado exitosamente");
                        } else {
                          // Crear nuevo horario
                          await createHorario(
                            parseInt(formData.casa_comunal_id),
                            payload,
                          );
                          setSuccessMessage("Horario creado exitosamente");
                        }

                        // Después de crear, limpiar formulario pero mantener el día para agregar otro
                        if (!selectedHorario || !selectedHorario.id) {
                          // Es un nuevo horario - guardar el día_semana para agregar otro
                          setTimeout(() => {
                            loadHorarios();
                            const diaActual = formData.dia_semana;
                            const casaActual = formData.casa_comunal_id;
                            setFormData({
                              casa_comunal_id: casaActual,
                              facilitador_id: "",
                              dia_semana: diaActual,
                              hora_inicio: "",
                              hora_fin: "",
                              taller_id: "",
                              gestion_id: gestionActiva?.id,
                            });
                            // Mantener el modal abierto para agregar más
                            setSelectedHorario(null);
                          }, 1500);
                        } else {
                          // Es una actualización - cerrar modal
                          setTimeout(() => {
                            loadHorarios();
                            setIsEditing(false);
                            setSelectedHorario(null);
                            setFormData({
                              casa_comunal_id: "",
                              facilitador_id: "",
                              dia_semana: "",
                              hora_inicio: "",
                              hora_fin: "",
                              taller_id: "",
                              gestion_id: null,
                            });
                          }, 1500);
                        }
                      } catch (err) {
                        alert(
                          "Error: " +
                            (err.message || "No se pudo crear el horario"),
                        );
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? "Guardando..." : "Guardar y Agregar otro"}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={async () => {
                    if (!formData.casa_comunal_id) {
                      alert("Debes seleccionar una casa comunal");
                      return;
                    }
                    if (!formData.dia_semana) {
                      alert("Debes seleccionar un día");
                      return;
                    }
                    if (!formData.hora_inicio || !formData.hora_fin) {
                      alert("Debes especificar las horas");
                      return;
                    }
                    if (!gestionActiva?.id) {
                      alert("Debes seleccionar una gestión activa");
                      return;
                    }

                    setIsSaving(true);
                    try {
                      // Construir payload con campos opcionales
                      const payload = {
                        dia_semana: parseInt(formData.dia_semana),
                        hora_inicio: formData.hora_inicio,
                        hora_fin: formData.hora_fin,
                      };

                      // Agregar facilitador_id solo si está seleccionado
                      if (formData.facilitador_id) {
                        payload.facilitador_id = parseInt(
                          formData.facilitador_id,
                        );
                      }

                      // Agregar taller_id solo si está seleccionado
                      if (formData.taller_id) {
                        payload.taller_id = parseInt(formData.taller_id);
                      }

                      console.log("=== GUARDANDO HORARIO (PAYLOAD) ===");
                      console.log(
                        "Casa ID:",
                        parseInt(formData.casa_comunal_id),
                      );
                      console.log("Payload:", JSON.stringify(payload, null, 2));
                      console.log("Gestión Activa:", gestionActiva?.id);
                      console.log("==========================================");

                      // Determinar si es creación o actualización
                      if (selectedHorario && selectedHorario.id) {
                        // Actualizar horario existente
                        await updateHorario(
                          selectedHorario.casa_id,
                          selectedHorario.id,
                          payload,
                        );
                        setSuccessMessage("Horario actualizado exitosamente");
                      } else {
                        // Crear nuevo horario
                        await createHorario(
                          parseInt(formData.casa_comunal_id),
                          payload,
                        );
                        setSuccessMessage("Horario creado exitosamente");
                      }

                      // Después de crear, limpiar formulario pero mantener el día para agregar otro
                      if (!selectedHorario || !selectedHorario.id) {
                        // Es un nuevo horario - guardar el día_semana para agregar otro
                        setTimeout(() => {
                          loadHorarios();
                          const diaActual = formData.dia_semana;
                          const casaActual = formData.casa_comunal_id;
                          setFormData({
                            casa_comunal_id: casaActual,
                            facilitador_id: "",
                            dia_semana: diaActual,
                            hora_inicio: "",
                            hora_fin: "",
                            taller_id: "",
                            gestion_id: gestionActiva?.id,
                          });
                          // Mantener el modal abierto para agregar más
                          setSelectedHorario(null);
                        }, 1500);
                      } else {
                        // Es una actualización - cerrar modal
                        setTimeout(() => {
                          loadHorarios();
                          setIsEditing(false);
                          setSelectedHorario(null);
                          setFormData({
                            casa_comunal_id: "",
                            facilitador_id: "",
                            dia_semana: "",
                            hora_inicio: "",
                            hora_fin: "",
                            taller_id: "",
                            gestion_id: null,
                          });
                        }, 1500);
                      }
                    } catch (err) {
                      alert(
                        "Error: " +
                          (err.message || "No se pudo crear el horario"),
                      );
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? "Guardando..." : "Guardar Horario"}
                </Button>
              )}
            </div>
          </div>
        ) : selectedHorario ? (
          <div className="space-y-6">
            {/* Detalles del Horario Seleccionado */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Detalles del Horario
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">
                    Casa Comunal
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {selectedHorario.casa_nombre || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">
                    Zona
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {selectedHorario.macrodistrito ||
                      selectedHorario.zona_nombre ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">
                    Horario
                  </p>
                  <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Clock size={16} />
                    {selectedHorario.hora_inicio} - {selectedHorario.hora_fin}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">
                    Facilitador
                  </p>
                  <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Users size={16} />
                    {selectedHorario.facilitador_nombre || "-"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-600 font-semibold uppercase">
                    Taller
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {selectedHorario.taller_nombre || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de Edición */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsEditing(true);
                  setFormData({
                    casa_comunal_id: selectedHorario.casa_comunal_id || "",
                    facilitador_id: selectedHorario.facilitador_id || "",
                    taller_id: selectedHorario.taller_id || "",
                    dia_semana: selectedHorario.dia_semana,
                    hora_inicio: selectedHorario.hora_inicio,
                    hora_fin: selectedHorario.hora_fin,
                    gestion_id: gestionActiva?.id,
                  });
                }}
                className="flex items-center justify-center gap-2 flex-1"
              >
                <Edit2 size={18} />
                Editar Horario
              </Button>
              <Button
                onClick={async () => {
                  if (
                    window.confirm(
                      "¿Estás seguro de que deseas eliminar este horario?",
                    )
                  ) {
                    setIsDeleting(true);
                    try {
                      await deleteHorario(
                        selectedHorario.casa_id,
                        selectedHorario.id,
                      );
                      setSuccessMessage("Horario eliminado exitosamente");
                      setSelectedHorario(null);
                      setTimeout(() => setSuccessMessage(""), 3000);
                    } catch (err) {
                      alert(
                        "Error: " +
                          (err.message || "No se pudo eliminar el horario"),
                      );
                    } finally {
                      setIsDeleting(false);
                    }
                  }
                }}
                disabled={isDeleting}
                variant="danger"
                className="flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>

            {/* Horarios de la Semana de esta Casa */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Horarios de la Semana - {selectedHorario.casa_nombre}
              </h3>
              <div className="space-y-2">
                {horarios
                  .filter((h) => h.casa_nombre === selectedHorario.casa_nombre)
                  .sort((a, b) => a.dia_semana - b.dia_semana)
                  .map((h, idx) => {
                    const diaInfo = dias.find((d) => d.value === h.dia_semana);
                    return (
                      <div
                        key={`${h.id}-${idx}`}
                        className={`p-3 rounded-lg border-l-4 transition-colors ${
                          h.id === selectedHorario.id
                            ? "bg-blue-100 border-blue-600 ring-2 ring-blue-400"
                            : `${getColorClass(h.macrodistrito)} border-opacity-50`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {diaInfo?.label || "Día desconocido"}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Clock size={14} />
                              {h.hora_inicio} - {h.hora_fin}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Users size={14} />
                              {h.facilitador_nombre || "Sin asignar"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">
                              {h.zona_nombre || h.macrodistrito || "-"}
                            </p>
                            <p className="text-xs text-gray-700 font-medium mt-1">
                              {h.modulo_nombre ||
                                h.nombre_actividad ||
                                "Sin especificar"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Modal Nueva Gestión */}
      <Modal
        isOpen={showNewGestionModal}
        onClose={() => setShowNewGestionModal(false)}
        title="Crear Nueva Gestión"
        maxWidth="max-w-md"
        footerActions={
          <>
            <Button
              onClick={() => {
                setShowNewGestionModal(false);
                setGestionFormData({
                  anio: new Date().getFullYear(),
                  trimestre: 1,
                  f_inicio: "",
                  f_fin: "",
                });
              }}
              variant="ghost"
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateGestion} variant="primary">
              Crear Gestión
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Año"
            type="number"
            value={gestionFormData.anio}
            onChange={(e) =>
              setGestionFormData({
                ...gestionFormData,
                anio: parseInt(e.target.value),
              })
            }
            min={new Date().getFullYear()}
          />

          <Select
            label="Trimestre"
            value={gestionFormData.trimestre}
            onChange={(e) =>
              setGestionFormData({
                ...gestionFormData,
                trimestre: parseInt(e.target.value),
              })
            }
          >
            <option value={1}>Ene–Mar (1)</option>
            <option value={2}>Abr–Jun (2)</option>
            <option value={3}>Jul–Sep (3)</option>
            <option value={4}>Oct–Dic (4)</option>
          </Select>

          <Input
            label="Fecha Inicio"
            type="date"
            value={gestionFormData.f_inicio}
            onChange={(e) =>
              setGestionFormData({
                ...gestionFormData,
                f_inicio: e.target.value,
              })
            }
          />

          <Input
            label="Fecha Fin"
            type="date"
            value={gestionFormData.f_fin}
            onChange={(e) =>
              setGestionFormData({
                ...gestionFormData,
                f_fin: e.target.value,
              })
            }
          />
        </div>
      </Modal>
    </div>
  );
}
