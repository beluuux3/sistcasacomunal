"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import {
  listarControlesFacilitadorRequest,
  registrarActividadFacilitadorRequest,
  listarActividadesFacilitadorRequest,
  editarActividadFacilitadorRequest,
  eliminarActividadFacilitadorRequest,
  listGestionesRequest,
} from "@/lib/auth";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Constantes ──────────────────────────────────────────────────────────────
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const TIPOS_ACTIVIDAD_UI = [
  "Asistencia Actividades",
  "Elaboración de material",
  "Asistencia a la casa comunal",
];

const MAP_TO_BACKEND = {
  "Asistencia Actividades": "Taller",
  "Elaboración de material": "Elaboracion de Material",
  "Asistencia a la casa comunal": "Otro"
};

const MAP_TO_UI = {
  "Taller": "Asistencia Actividades",
  "Elaboracion de Material": "Elaboración de material",
  "Otro": "Asistencia a la casa comunal",
  "Reunion": "Reunión",
  "Planificacion": "Planificación"
};

const ITEMS_PER_PAGE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getTodayBolivia = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/La_Paz" }).format(new Date());

function formatFecha(fechaStr) {
  if (!fechaStr) return "-";
  const [y, m, d] = fechaStr.split("-");
  return `${d}/${m}/${y}`;
}

function getDia(fechaStr) {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString("es-ES", { weekday: "long" });
}

function formatHora(timeStr) {
  if (!timeStr) return "-";
  const raw = String(timeStr).trim();
  const timeOnly = raw.includes("T") ? raw.split("T")[1] : raw;
  const match = timeOnly.match(/^(\d{2}):(\d{2}):([\d.]+)(Z|[+-]\d{2}:\d{2})?$/);
  if (match) {
    const [, hh, mm, ss] = match;
    if (ss === "00") return `${hh}:${mm}`;
    const tz = match[4] || "Z";
    const parsed = new Date(`1970-01-01T${hh}:${mm}:${ss}${tz}`);
    if (!isNaN(parsed)) {
      return new Intl.DateTimeFormat("es-BO", {
        timeZone: "America/La_Paz", hour: "2-digit", minute: "2-digit", hour12: false,
      }).format(parsed);
    }
  }
  return raw.slice(0, 5) || "-";
}

// ─── EMPTY FORM ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  fecha: getTodayBolivia(),
  hora_inicio: "",
  hora_fin: "",
  tipo_actividad: "Asistencia a actividades",
  descripcion: "",
  casa_comunal_id: "",
};

// Distancia haversine en km
function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (v) => (Number(v) * Math.PI) / 180;
  const dLat = toRad(lat2) - toRad(lat1);
  const dLon = toRad(lon2) - toRad(lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function controlEsDeCasa(control, casa) {
  if (!casa?.latitud || !casa?.longitud) return true;
  if (!control.latitud_entrada || !control.longitud_entrada) return true;
  return distanciaKm(
    control.latitud_entrada, control.longitud_entrada,
    casa.latitud, casa.longitud
  ) <= 2;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function ControlHorasPage() {
  const { usuario } = useAuth();
  const { casaSeleccionada, casasDelFacilitador } = useCasaSeleccionada();
  const tieneMultiplesCasas = casasDelFacilitador.length > 1;

  const now = new Date(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/La_Paz" }).format(new Date())
  );
  const anioActual = now.getFullYear();
  const [anios, setAnios] = useState([anioActual]);

  const [controles, setControles] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filtros
  const [filterMes, setFilterMes] = useState(now.getMonth() + 1);
  const [filterAnio, setFilterAnio] = useState(anioActual);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Modal actividad
  const [showActModal, setShowActModal] = useState(false);
  const [actModalMode, setActModalMode] = useState("create");
  const [actForm, setActForm] = useState(EMPTY_FORM);
  const [editingActId, setEditingActId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Modal eliminar
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Carga ─────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true); setError("");
    try {
      const [ctrl, acts, gestiones] = await Promise.all([
        listarControlesFacilitadorRequest(),
        listarActividadesFacilitadorRequest(),
        listGestionesRequest().catch(() => []),
      ]);
      setControles(Array.isArray(ctrl) ? ctrl : []);
      setActividades(Array.isArray(acts) ? acts : []);

      if (Array.isArray(gestiones) && gestiones.length > 0) {
        const aniosUnicos = Array.from(new Set(gestiones.map((g) => g.anio))).sort((a, b) => b - a);
        if (aniosUnicos.length > 0) {
          setAnios(aniosUnicos);
          setFilterAnio((prev) => (aniosUnicos.includes(prev) ? prev : aniosUnicos[0]));
        }
      }
    } catch {
      setError("Error al cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setCurrentPage(1); }, [filterMes, filterAnio]);

  // ── Combinar y ordenar registros ──────────────────────────────────────────
  const casaNombre = casaSeleccionada?.nombre || "la casa comunal";

  const registrosCombinados = (() => {
    const inMes = (fecha) => {
      if (!fecha) return false;
      const [y, m] = fecha.split("-");
      return Number(m) === filterMes && Number(y) === filterAnio;
    };

    // Controles → solo los de la casa seleccionada
    const filasCtrl = controles
      .filter((c) => inMes(c.fecha) && controlEsDeCasa(c, casaSeleccionada))
      .map((c) => ({
        id: `ctrl-${c.id}`,
        sourceId: c.id,
        source: "control",
        fecha: c.fecha,
        tipo: "Asistencia a la casa",
        descripcion: `Asistencia a casa "${casaNombre}"`,
        horaInicio: formatHora(c.hora_entrada),
        horaFin: formatHora(c.hora_salida),
      }));

    // Actividades
    const filasAct = actividades
      .filter((a) => inMes(a.fecha))
      .map((a) => ({
        id: `act-${a.id}`,
        sourceId: a.id,
        source: "actividad",
        fecha: a.fecha,
        tipo: MAP_TO_UI[a.tipo_actividad] || a.tipo_actividad,
        descripcion: a.descripcion,
        horaInicio: formatHora(a.hora_inicio),
        horaFin: formatHora(a.hora_fin),
      }));

    return [...filasCtrl, ...filasAct].sort((a, b) =>
      a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0
    );
  })();

  const totalPages = Math.max(1, Math.ceil(registrosCombinados.length / ITEMS_PER_PAGE));
  const paginated = registrosCombinados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Actividad CRUD ────────────────────────────────────────────────────────
  const openCreate = () => {
    setActModalMode("create");
    setActForm({
      ...EMPTY_FORM,
      casa_comunal_id: casaSeleccionada?.id ? String(casaSeleccionada.id) : "",
    });
    setFormError(""); setShowActModal(true);
  };

  const openEdit = (fila) => {
    const orig = actividades.find((a) => a.id === fila.sourceId);
    if (!orig) return;
    setActModalMode("edit"); setEditingActId(orig.id);
    setActForm({
      fecha: orig.fecha || getTodayBolivia(),
      hora_inicio: orig.hora_inicio ? String(orig.hora_inicio).slice(0, 5) : "",
      hora_fin: orig.hora_fin ? String(orig.hora_fin).slice(0, 5) : "",
      tipo_actividad: MAP_TO_UI[orig.tipo_actividad] || "Asistencia a actividades",
      descripcion: orig.descripcion || "",
      casa_comunal_id: orig.casa_comunal_id ? String(orig.casa_comunal_id) : "",
    });
    setFormError(""); setShowActModal(true);
  };

  const handleSave = async () => {
    if (!actForm.fecha || !actForm.hora_inicio || !actForm.tipo_actividad || !actForm.descripcion.trim()) {
      setFormError("Fecha, hora inicio, tipo y descripción son obligatorios."); return;
    }
    // Si tiene múltiples casas, necesita elegir una (o 'TODAS')
    if (tieneMultiplesCasas && !actForm.casa_comunal_id) {
      setFormError("Debes seleccionar una casa comunal o elegir Todas."); return;
    }
    setIsSaving(true); setFormError("");
    try {
      const buildPayload = (casaId) => ({
        fecha: actForm.fecha,
        hora_inicio: actForm.hora_inicio.length === 5 ? `${actForm.hora_inicio}:00` : actForm.hora_inicio,
        hora_fin: actForm.hora_fin ? (actForm.hora_fin.length === 5 ? `${actForm.hora_fin}:00` : actForm.hora_fin) : null,
        tipo_actividad: MAP_TO_BACKEND[actForm.tipo_actividad] || actForm.tipo_actividad,
        descripcion: actForm.descripcion,
        casa_comunal_id: casaId && casaId !== "TODAS" ? Number(casaId) : null,
      });

      if (actModalMode === "edit") {
        const casaId = actForm.casa_comunal_id || casaSeleccionada?.id || null;
        await editarActividadFacilitadorRequest(editingActId, buildPayload(casaId));
        setSuccessMsg("Actividad actualizada.");
      } else if (actForm.casa_comunal_id === "TODAS" && casasDelFacilitador.length > 1) {
        // Registrar para TODAS las casas asignadas
        await Promise.all(
          casasDelFacilitador.map((c) => registrarActividadFacilitadorRequest(buildPayload(c.id)))
        );
        setSuccessMsg(`Actividad registrada para ${casasDelFacilitador.length} casas.`);
      } else {
        const casaId = actForm.casa_comunal_id || casaSeleccionada?.id || null;
        await registrarActividadFacilitadorRequest(buildPayload(casaId));
        setSuccessMsg("Actividad registrada.");
      }
      setShowActModal(false); loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      const serverMsg = e?.response?.data?.detail || e?.response?.data?.message;
      const displayMsg = Array.isArray(serverMsg)
        ? serverMsg.map(err => `${err.loc?.join && err.loc.join('.')}: ${err.msg}`).join(', ')
        : (serverMsg || e?.message || "Error al guardar.");
      setFormError(typeof displayMsg === "string" ? displayMsg : JSON.stringify(displayMsg));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await eliminarActividadFacilitadorRequest(confirmDeleteId);
      setSuccessMsg("Actividad eliminada."); setConfirmDeleteId(null); loadData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Error al eliminar.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Badge color por tipo ──────────────────────────────────────────────────
  const badgeColor = (tipo) => {
    if (tipo === "Asistencia a la casa") return "bg-green-100 text-green-700";
    if (tipo === "Elaboración de material") return "bg-purple-100 text-purple-700";
    return "bg-blue-100 text-blue-700";
  };

  // ── Cálculo de horas del mes ───────────────────────────────────────────────
  const totalMinutos = registrosCombinados.reduce((acc, reg) => {
    if (!reg.horaInicio || !reg.horaFin || reg.horaInicio === "-" || reg.horaFin === "-") return acc;
    const [hIni, mIni] = reg.horaInicio.split(":").map(Number);
    const [hFin, mFin] = reg.horaFin.split(":").map(Number);
    if (isNaN(hIni) || isNaN(mIni) || isNaN(hFin) || isNaN(mFin)) return acc;
    
    let diff = (hFin * 60 + mFin) - (hIni * 60 + mIni);
    if (diff < 0) diff += 24 * 60; // Por si cruza medianoche
    return acc + diff;
  }, 0);

  const horasTotal = Math.floor(totalMinutos / 60);
  const minutosTotal = totalMinutos % 60;
  const textoTotalHoras = `${horasTotal}h ${minutosTotal > 0 ? minutosTotal + "m" : ""}`.trim();

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ClipboardList size={28} className="text-blue-600" />
            Control Horas
          </h1>
          {casaSeleccionada?.nombre && (
            <p className="text-sm text-blue-600 font-medium mt-1">{casaSeleccionada.nombre}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="primary" onClick={openCreate} className="gap-2">
            <Plus size={16} /> Nueva Actividad
          </Button>
        </div>
      </div>

      {error && <Alert type="error" title="Error" message={error} />}
      {successMsg && <Alert type="success" title="Éxito" message={successMsg} />}

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">Mostrar:</span>
          <Select value={filterMes} onChange={(e) => setFilterMes(Number(e.target.value))} className="w-36">
            {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </Select>
          <Select value={filterAnio} onChange={(e) => setFilterAnio(Number(e.target.value))} className="w-28">
            {anios.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
          <span className="text-sm text-gray-500 ml-auto">
            {registrosCombinados.length} registros
          </span>
        </div>
      </Card>

      {/* Tabla unificada */}
      <Card className="overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-slate-800">
            {MESES[filterMes - 1]} {filterAnio} — Asistencia y Actividades
          </h2>
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-blue-100 flex items-center gap-2">
            <span>Total horas en el mes:</span>
            <span className="text-blue-800 text-base">{textoTotalHoras}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : registrosCombinados.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <AlertCircle size={36} className="mx-auto mb-2" />
            <p className="text-sm">Sin registros para este mes</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Día</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Descripción</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">H. Inicio</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">H. Fin</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((fila) => (
                  <tr key={fila.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {formatFecha(fila.fecha)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize whitespace-nowrap">
                      {getDia(fila.fecha)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor(fila.tipo)}`}>
                        {fila.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs">{fila.descripcion}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fila.horaInicio}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fila.horaFin}</td>
                    <td className="px-4 py-3 text-center">
                      {fila.source === "actividad" && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(fila)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(fila.sourceId)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                      acc.push(p); return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span key={`e-${idx}`} className="px-2 py-1 text-sm text-gray-400">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`px-3 py-1 text-sm rounded border transition-colors ${currentPage === item
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ── MODAL: Nueva / Editar Actividad ─────────────────────────────── */}
      <Modal
        isOpen={showActModal}
        onClose={() => setShowActModal(false)}
        title={actModalMode === "edit" ? "Editar Actividad" : "Nueva Actividad"}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {formError && <Alert type="error" title="Error" message={formError} />}
          <Input label="Fecha" type="date" value={actForm.fecha}
            onChange={(e) => setActForm({ ...actForm, fecha: e.target.value })} required />
          <Select label="Tipo de Actividad" value={actForm.tipo_actividad}
            onChange={(e) => setActForm({ ...actForm, tipo_actividad: e.target.value })} required>
            {TIPOS_ACTIVIDAD_UI.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>

          {/* Selector de casa — visible si tiene múltiples */}
          {tieneMultiplesCasas && (
            <Select
              label="Casa Comunal"
              value={actForm.casa_comunal_id}
              onChange={(e) => setActForm({ ...actForm, casa_comunal_id: e.target.value })}
              required
            >
              <option value="">-- Selecciona una casa --</option>
              {actForm.tipo_actividad !== "Asistencia a actividades" && <option value="TODAS">Todas mis casas asignadas</option>}
              {casasDelFacilitador.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </Select>
          )}

          {/* Info cuando se selecciona TODAS */}
          {tieneMultiplesCasas && actForm.casa_comunal_id === "TODAS" && (
            <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              ℹ️ Esta actividad se registrará automáticamente para todas tus casas asignadas ({casasDelFacilitador.map(c => c.nombre).join(", ")}).
            </div>
          )}

          {/* Selector de casa — facilitador con 1 sola casa (informativo) */}
          {!tieneMultiplesCasas && casaSeleccionada && (
            <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              Casa: <span className="font-medium text-gray-700">{casaSeleccionada.nombre}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora inicio" type="time" value={actForm.hora_inicio}
              onChange={(e) => setActForm({ ...actForm, hora_inicio: e.target.value })} required />
            <Input label="Hora fin" type="time" value={actForm.hora_fin}
              onChange={(e) => setActForm({ ...actForm, hora_fin: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Describe qué hiciste en esta actividad..."
              value={actForm.descripcion}
              onChange={(e) => setActForm({ ...actForm, descripcion: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowActModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : actModalMode === "edit" ? "Actualizar" : "Registrar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Confirmar Eliminar ────────────────────────────────────── */}
      <Modal isOpen={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}
        title="Confirmar eliminación" maxWidth="max-w-sm">
        <p className="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
