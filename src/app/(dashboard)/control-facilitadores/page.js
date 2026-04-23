/* eslint-disable @next/next/no-img-element */

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
  listUsersRequest,
  listCasasRequest,
  getGrillaHorariosRequest,
} from "@/lib/auth";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Camera,
  Eye,
  Plus,
  Pencil,
} from "lucide-react";

const EMPTY_CONTROL_FORM = {
  facilitador_id: "",
  casa_comunal_id: "",
  fecha: "",
  hora_entrada: "",
  hora_salida: "",
  latitud_entrada: "",
  longitud_entrada: "",
};

const getTodayBolivia = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/La_Paz" }).format(
    new Date(),
  );

const toTimeInputValue = (value) => {
  if (!value) return "";
  const raw = String(value);
  if (raw.includes("T")) {
    return raw.split("T")[1].slice(0, 5);
  }
  return raw.replace("Z", "").slice(0, 5);
};

const formatTimeDisplay = (value) => {
  if (!value) return "-";
  const raw = String(value).trim();

  // Extraer solo HH:mm de cualquier formato
  // Funciona con: "14:30:00", "18:35:37.462761", "18:35:37.462761Z", "14:30:00Z", etc.
  // Maneja formatos: HH:mm:ss, HH:mm:ss.SSSSSS, con o sin Z/offset.
  const timeOnly = raw.includes("T") ? raw.split("T")[1] : raw;
  const match = timeOnly.match(
    /^(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
  );

  if (match) {
    const [, hh, mm, ss, fraction = "", tz = ""] = match;
    const isAdminManualTime = ss === "00" && !fraction;

    // Admin crea desde input HH:mm -> guardar/mostrar sin conversión.
    if (isAdminManualTime) {
      return `${hh}:${mm}`;
    }

    // Facilitador (segundos reales y/o fracción) -> convertir UTC a hora Bolivia.
    const normalizedTz = tz || "Z";
    const parsed = new Date(
      `1970-01-01T${hh}:${mm}:${ss}${fraction}${normalizedTz}`,
    );
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("es-BO", {
        timeZone: "America/La_Paz",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(parsed);
    }

    return `${hh}:${mm}`;
  }

  return raw.replace("Z", "").slice(0, 5) || "-";
};

const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export default function ControlFacilitadoresPage() {
  const {
    controles,
    isLoading,
    error,
    loadControles,
    validarControl,
    crearControlAdmin,
    actualizarControlAdmin,
  } = useControlFacilitadores();

  const { usuario } = useAuth();
  const [facilitadores, setFacilitadores] = useState([]);
  const [casas, setCasas] = useState([]);
  const [casasByFacilitador, setCasasByFacilitador] = useState({});
  const [loadingFacilitadores, setLoadingFacilitadores] = useState(true);
  const [selectedFacilitador, setSelectedFacilitador] = useState("");
  const [selectedFecha, setSelectedFecha] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [selectedControl, setSelectedControl] = useState(null);
  const [showValidacionModal, setShowValidacionModal] = useState(false);
  const [showFotosModal, setShowFotosModal] = useState(false);
  const [showControlModal, setShowControlModal] = useState(false);
  const [controlModalMode, setControlModalMode] = useState("create");
  const [controlForm, setControlForm] = useState(EMPTY_CONTROL_FORM);
  const [controlFormError, setControlFormError] = useState("");
  const [fotoEntrada, setFotoEntrada] = useState(null);
  const [fotoSalida, setFotoSalida] = useState(null);
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
    loadControles();
    Promise.all([
      listUsersRequest(),
      listCasasRequest(),
      getGrillaHorariosRequest(),
    ])
      .then(([users, casasData, horariosData]) => {
        const allUsers = Array.isArray(users) ? users : [];
        const facilitadoresData = allUsers.filter((u) =>
          String(u?.rol || "")
            .toLowerCase()
            .includes("facilitador"),
        );
        const casasDataSafe = Array.isArray(casasData) ? casasData : [];
        const horariosDataSafe = Array.isArray(horariosData)
          ? horariosData
          : [];

        setFacilitadores(facilitadoresData);
        setCasas(casasDataSafe);

        const casasById = new Map(
          casasDataSafe.map((casa) => [Number(casa.id), casa]),
        );
        const mapByFacilitador = {};

        horariosDataSafe.forEach((horario) => {
          const facilitadorId = Number(horario?.facilitador_id);
          const casaId = Number(horario?.casa_id);

          if (!facilitadorId || !casaId) {
            return;
          }

          if (!mapByFacilitador[facilitadorId]) {
            mapByFacilitador[facilitadorId] = new Map();
          }

          const casaCompleta = casasById.get(casaId);

          mapByFacilitador[facilitadorId].set(casaId, {
            id: casaId,
            nombre:
              horario?.casa_nombre || casaCompleta?.nombre || `Casa ${casaId}`,
            latitud: casaCompleta?.latitud ?? null,
            longitud: casaCompleta?.longitud ?? null,
          });
        });

        const mapPlain = {};
        Object.entries(mapByFacilitador).forEach(
          ([facilitadorId, casasMap]) => {
            mapPlain[facilitadorId] = Array.from(casasMap.values());
          },
        );

        setCasasByFacilitador(mapPlain);
      })
      .catch(() => {})
      .finally(() => setLoadingFacilitadores(false));
  }, [loadControles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFacilitador, selectedFecha, filterEstado]);

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredControles.length / itemsPerPage),
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredControles.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    return formatTimeDisplay(timeStr);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    // Parsear como fecha local para evitar el desfase UTC
    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getNombreFacilitador = (facilitador_id) => {
    if (loadingFacilitadores) return "...";
    const fac = facilitadores.find((f) => f.id === facilitador_id);
    return fac?.nombre_completo || fac?.nombre || "Desconocido";
  };

  const getCasasByFacilitador = (facilitadorId) => {
    if (!facilitadorId) return [];

    const casasDesdeHorario = casasByFacilitador[String(facilitadorId)] || [];
    if (casasDesdeHorario.length > 0) {
      return casasDesdeHorario;
    }

    const facilitador = facilitadores.find(
      (f) => f.id === Number(facilitadorId),
    );

    if (!facilitador?.casa_comunal_id) {
      return [];
    }

    return casas.filter(
      (casa) => casa.id === Number(facilitador.casa_comunal_id),
    );
  };

  const syncLocationByCasa = (nextForm, casaId) => {
    const casaSeleccionada = casas.find((casa) => casa.id === Number(casaId));

    return {
      ...nextForm,
      casa_comunal_id: casaId,
      latitud_entrada:
        casaSeleccionada?.latitud !== undefined &&
        casaSeleccionada?.latitud !== null
          ? String(casaSeleccionada.latitud)
          : "",
      longitud_entrada:
        casaSeleccionada?.longitud !== undefined &&
        casaSeleccionada?.longitud !== null
          ? String(casaSeleccionada.longitud)
          : "",
    };
  };

  const casasDelFacilitador = getCasasByFacilitador(controlForm.facilitador_id);

  const openCreateControlModal = () => {
    setControlModalMode("create");
    const facilitatorId = selectedFacilitador || "";
    const casasAsignadas = getCasasByFacilitador(facilitatorId);
    const casaId = casasAsignadas[0]?.id ? String(casasAsignadas[0].id) : "";

    setControlForm({
      ...EMPTY_CONTROL_FORM,
      facilitador_id: facilitatorId,
      casa_comunal_id: casaId,
      fecha: selectedFecha || getTodayBolivia(),
      latitud_entrada:
        casasAsignadas[0]?.latitud !== undefined &&
        casasAsignadas[0]?.latitud !== null
          ? String(casasAsignadas[0].latitud)
          : "",
      longitud_entrada:
        casasAsignadas[0]?.longitud !== undefined &&
        casasAsignadas[0]?.longitud !== null
          ? String(casasAsignadas[0].longitud)
          : "",
    });
    setFotoEntrada(null);
    setFotoSalida(null);
    setControlFormError("");
    setShowControlModal(true);
  };

  const openEditControlModal = (control) => {
    setControlModalMode("edit");
    setControlForm({
      facilitador_id: control.facilitador_id?.toString() || "",
      fecha: control.fecha || "",
      hora_entrada: toTimeInputValue(control.hora_entrada),
      hora_salida: toTimeInputValue(control.hora_salida),
      latitud_entrada:
        control.latitud_entrada === null ||
        control.latitud_entrada === undefined
          ? ""
          : String(control.latitud_entrada),
      longitud_entrada:
        control.longitud_entrada === null ||
        control.longitud_entrada === undefined
          ? ""
          : String(control.longitud_entrada),
    });
    setSelectedControl(control);
    setControlFormError("");
    setShowControlModal(true);
  };

  const closeControlModal = () => {
    setShowControlModal(false);
    setControlFormError("");
    setControlForm(EMPTY_CONTROL_FORM);
    setFotoEntrada(null);
    setFotoSalida(null);
    setControlModalMode("create");
  };

  const handleControlFormSubmit = async () => {
    if (!controlForm.facilitador_id || !controlForm.fecha) {
      setControlFormError("Facilitador y fecha son obligatorios");
      return;
    }

    if (controlModalMode === "create") {
      if (!controlForm.casa_comunal_id) {
        setControlFormError("Debes seleccionar una casa comunal");
        return;
      }

      if (!controlForm.hora_entrada || !controlForm.hora_salida) {
        setControlFormError("Debes registrar hora de llegada y salida");
        return;
      }
    }

    setIsSaving(true);
    setControlFormError("");

    // Enviar horas en formato simple HH:mm:ss como espera el backend
    const payload = {
      facilitador_id: Number(controlForm.facilitador_id),
      fecha: controlForm.fecha,
      hora_entrada: controlForm.hora_entrada
        ? `${controlForm.hora_entrada}:00`
        : null,
      hora_salida: controlForm.hora_salida
        ? `${controlForm.hora_salida}:00`
        : null,
      latitud_entrada: toNumberOrNull(controlForm.latitud_entrada),
      longitud_entrada: toNumberOrNull(controlForm.longitud_entrada),
    };

    try {
      if (controlModalMode === "edit" && selectedControl) {
        await actualizarControlAdmin(selectedControl.id, {
          fecha: payload.fecha,
          hora_entrada: payload.hora_entrada,
          hora_salida: payload.hora_salida,
        });
        setSuccessMessage("Control actualizado exitosamente");
      } else {
        await crearControlAdmin(payload);
        setSuccessMessage("Control creado exitosamente");
      }

      closeControlModal();
      loadControles();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      // Extraer mensaje de error correctamente (puede ser string o objeto)
      let errorMsg = "Error al guardar el control";

      if (typeof err === "object" && err !== null) {
        if (err.message) {
          errorMsg =
            typeof err.message === "string"
              ? err.message
              : JSON.stringify(err.message);
        } else if (err.msg) {
          errorMsg = err.msg;
        } else if (err.detail) {
          errorMsg = err.detail;
        }
      } else if (typeof err === "string") {
        errorMsg = err;
      }

      setControlFormError(errorMsg);
    } finally {
      setIsSaving(false);
    }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Control de Facilitadores
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Panel administrativo de Llegadas y Salidas.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateControlModal}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Crear control
        </Button>
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
                {fac.nombre_completo || fac.nombre}
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
                    LLegada
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Salida
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
                      {getNombreFacilitador(control.facilitador_id)}
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
                      {control.latitud_entrada && control.longitud_entrada ? (
                        <a
                          href={`https://maps.google.com/?q=${control.latitud_entrada},${control.longitud_entrada}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <MapPin size={14} />
                          <span className="text-xs">Ver mapa</span>
                        </a>
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
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => openEditControlModal(control)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-medium transition-colors"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
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
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal crear/editar control */}
      <Modal
        isOpen={showControlModal}
        onClose={closeControlModal}
        title={
          controlModalMode === "edit"
            ? "Editar control de facilitador"
            : "Crear control de facilitador"
        }
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {controlFormError && (
            <Alert type="error" title="Error" message={controlFormError} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Facilitador"
              placeholder="Seleccionar facilitador"
              value={controlForm.facilitador_id}
              onChange={(e) => {
                const facilitadorId = e.target.value;
                const casasAsignadas = getCasasByFacilitador(facilitadorId);
                const casaId = casasAsignadas[0]?.id
                  ? String(casasAsignadas[0].id)
                  : "";

                setControlForm(
                  syncLocationByCasa(
                    {
                      ...controlForm,
                      facilitador_id: facilitadorId,
                    },
                    casaId,
                  ),
                );
              }}
              required
            >
              {facilitadores.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.nombre_completo || fac.nombre}
                </option>
              ))}
            </Select>

            <Select
              label="Casa Comunal"
              placeholder={
                controlForm.facilitador_id
                  ? "Seleccionar casa comunal"
                  : "Selecciona primero un facilitador"
              }
              value={controlForm.casa_comunal_id}
              onChange={(e) =>
                setControlForm(syncLocationByCasa(controlForm, e.target.value))
              }
              required
              disabled={
                !controlForm.facilitador_id || controlModalMode === "edit"
              }
            >
              {casasDelFacilitador.map((casa) => (
                <option key={casa.id} value={casa.id}>
                  {casa.nombre}
                </option>
              ))}
            </Select>

            <Input
              label="Fecha"
              type="date"
              value={controlForm.fecha}
              onChange={(e) =>
                setControlForm({ ...controlForm, fecha: e.target.value })
              }
              required
            />

            <Input
              label="Hora de entrada"
              type="time"
              value={controlForm.hora_entrada}
              onChange={(e) =>
                setControlForm({ ...controlForm, hora_entrada: e.target.value })
              }
              required={controlModalMode === "create"}
            />

            <Input
              label="Hora de salida"
              type="time"
              value={controlForm.hora_salida}
              onChange={(e) =>
                setControlForm({ ...controlForm, hora_salida: e.target.value })
              }
              required={controlModalMode === "create"}
            />

            <Input
              label="Latitud entrada"
              type="number"
              step="any"
              value={controlForm.latitud_entrada}
              onChange={(e) =>
                setControlForm({
                  ...controlForm,
                  latitud_entrada: e.target.value,
                })
              }
              disabled
            />

            <Input
              label="Longitud entrada"
              type="number"
              step="any"
              value={controlForm.longitud_entrada}
              onChange={(e) =>
                setControlForm({
                  ...controlForm,
                  longitud_entrada: e.target.value,
                })
              }
              disabled
            />

            {controlModalMode === "create" && (
              <Input
                label="Foto de llegada (referencial)"
                type="file"
                accept="image/*"
                onChange={(e) => setFotoEntrada(e.target.files?.[0] || null)}
              />
            )}

            {controlModalMode === "create" && (
              <Input
                label="Foto de salida (referencial)"
                type="file"
                accept="image/*"
                onChange={(e) => setFotoSalida(e.target.files?.[0] || null)}
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={closeControlModal}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleControlFormSubmit}
              disabled={isSaving}
            >
              {isSaving
                ? "Guardando..."
                : controlModalMode === "edit"
                  ? "Guardar cambios"
                  : "Crear control"}
            </Button>
          </div>
        </div>
      </Modal>

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
                  {getNombreFacilitador(selectedControl.facilitador_id)}
                </strong>{" "}
                - {formatDate(selectedControl.fecha)}
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
          title={`Fotos - ${getNombreFacilitador(selectedControl.facilitador_id)}`}
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
