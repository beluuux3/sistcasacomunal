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
  listarActividadesFacilitadorRequest,
  registrarActividadFacilitadorRequest,
  editarActividadFacilitadorRequest,
  eliminarActividadFacilitadorRequest,
  listGestionesRequest,
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
  Download,
  Trash2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 🎨 Paleta dorada corporativa unificada para Reportes PDF
const COLORS_PDF = {
  teal: [212, 160, 23], // Dorado principal
  darkTeal: [158, 114, 5], // Dorado oscuro para títulos secundarios
  lightTeal: [251, 247, 235], // Fondo crema sutil para celdas
  line: [218, 213, 201], // Gris dorado para bordes y divisiones
  text: [30, 30, 30], // Carbón oscuro para lectura limpia
};

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const MAP_TO_UI = {
  Taller: "Asistencia Actividades",
  "Elaboracion de Material": "Elaboración de material",
  Otro: "Asistencia a la casa comunal",
  Reunion: "Reunión",
  Planificacion: "Planificación",
};

const MAP_TO_BACKEND = {
  "Asistencia Actividades": "Taller",
  "Elaboración de material": "Elaboracion de Material",
  "Asistencia a la casa comunal": "Otro",
  Reuniones: "Reunion",
};

const TIPOS_ACTIVIDAD_UI = [
  "Asistencia Actividades",
  "Elaboración de material",
  "Asistencia a la casa comunal",
];

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

  const timeOnly = raw.includes("T") ? raw.split("T")[1] : raw;
  const match = timeOnly.match(
    /^(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
  );

  if (match) {
    const [, hh, mm, ss, fraction = "", tz = ""] = match;
    const isAdminManualTime = ss === "00" && !fraction;

    if (isAdminManualTime) {
      return `${hh}:${mm}`;
    }

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

// Función para cargar el logo de la Casa Comunal en Base64
async function getLogoAsBase64() {
  try {
    const response = await fetch("/LogoCasa.png");
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading logo for PDF:", error);
    return null;
  }
}

// Nueva función para cargar el logo de la Alcaldía en Base64
async function getLogoAlcaldiaBase64() {
  try {
    const response = await fetch("/LOGO_ALCALDIA.png");
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading alcaldia logo for PDF:", error);
    return null;
  }
}

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
  const [horarios, setHorarios] = useState([]);
  const now = new Date();
  const anioActual = now.getFullYear();
  const mesActual = now.getMonth() + 1;

  const [selectedFacilitador, setSelectedFacilitador] = useState("");
  const [filterMes, setFilterMes] = useState(mesActual);
  const [filterAnio, setFilterAnio] = useState(anioActual);
  const [anios, setAnios] = useState([anioActual]);
  const [filterCasa, setFilterCasa] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [actividades, setActividades] = useState([]);
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

  // Actividades manuales admin
  const [showActModal, setShowActModal] = useState(false);
  const [actModalMode, setActModalMode] = useState("edit");
  const [actForm, setActForm] = useState({
    id: "",
    facilitador_id: "",
    tipo_actividad: "Elaboración de material",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    descripcion: "",
    casa_comunal_id: "",
  });
  const [isSavingAct, setIsSavingAct] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setHorarios(horariosDataSafe);

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

    listGestionesRequest()
      .then((gestiones) => {
        if (Array.isArray(gestiones) && gestiones.length > 0) {
          const aniosUnicos = Array.from(
            new Set(gestiones.map((g) => g.anio)),
          ).sort((a, b) => b - a);
          if (aniosUnicos.length > 0) {
            setAnios(aniosUnicos);
            setFilterAnio((prev) =>
              aniosUnicos.includes(prev) ? prev : aniosUnicos[0],
            );
          }
        }
      })
      .catch(() => {});

    // Cargar actividades
    listarActividadesFacilitadorRequest()
      .then((data) => {
        setActividades(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, [loadControles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFacilitador, filterMes, filterAnio, filterCasa, filterEstado]);

  // Combinar controles y actividades
  const registrosCombinados = (() => {
    const inMesAnio = (fecha) => {
      if (!fecha) return false;
      const [y, m] = fecha.split("-");
      return Number(m) === filterMes && Number(y) === filterAnio;
    };

    const filtradosControles = controles
      .filter((c) => {
        const matchFacilitador =
          !selectedFacilitador ||
          c.facilitador_id === Number(selectedFacilitador);
        const matchEstado =
          filterEstado === "todos" ||
          (filterEstado === "validados" && c.validado) ||
          (filterEstado === "pendientes" && !c.validado);
        return inMesAnio(c.fecha) && matchFacilitador && matchEstado;
      })
      .map((c) => ({
        id: `ctrl-${c.id}`,
        source: "control",
        fecha: c.fecha,
        facilitador_id: c.facilitador_id,
        tipo: "Asistencia a la casa comunal",
        descripcion: "Actividad realizada en la casa comunal",
        hora_entrada: c.hora_entrada,
        hora_salida: c.hora_salida,
        latitud_entrada: c.latitud_entrada,
        longitud_entrada: c.longitud_entrada,
        validado: c.validado,
        original: c,
      }));

    const filtradasAct = actividades
      .filter((a) => {
        const matchFacilitador =
          !selectedFacilitador ||
          a.facilitador_id === Number(selectedFacilitador);
        const matchCasa =
          !filterCasa || a.casa_comunal_id === Number(filterCasa);
        return inMesAnio(a.fecha) && matchFacilitador && matchCasa;
      })
      .map((a) => ({
        id: `act-${a.id}`,
        source: "actividad",
        fecha: a.fecha,
        facilitador_id: a.facilitador_id,
        tipo: MAP_TO_UI[a.tipo_actividad] || a.tipo_actividad,
        descripcion: a.descripcion,
        hora_entrada: a.hora_inicio,
        hora_salida: a.hora_fin,
        latitud_entrada: null,
        longitud_entrada: null,
        validado: true,
        original: a,
      }));

    return [...filtradosControles, ...filtradasAct].sort((a, b) =>
      a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0,
    );
  })();

  const totalPages = Math.max(
    1,
    Math.ceil(registrosCombinados.length / itemsPerPage),
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = registrosCombinados.slice(
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
      loadControles();
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

  const handleGeneratePDF = async () => {
    if (!selectedFacilitador) {
      alert("Debes seleccionar un facilitador para generar el reporte.");
      return;
    }

    // 🔄 Carga paralela controlada de ambos logotipos
    const [logoCasa, logoAlcaldia] = await Promise.all([
      getLogoAsBase64(),
      getLogoAlcaldiaBase64(),
    ]);

    const doc = new jsPDF({ format: "letter", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    const facilitadorNombre = getNombreFacilitador(Number(selectedFacilitador));
    const mesNombre = MESES[filterMes - 1];

    if (logoAlcaldia) {
      doc.addImage(logoAlcaldia, "PNG", margin, yPosition - 2, 25, 20);
    }

    if (logoCasa) {
      doc.addImage(logoCasa, "JPEG", margin + 29, yPosition - 5, 25, 18);
    }

    const titleX = margin + 58;

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS_PDF.teal);
    doc.text("CASA COMUNAL", titleX, yPosition + 3);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("HORARIO DE VOLUNTARIADO - CASA COMUNAL", titleX, yPosition + 9);

    yPosition += 18;

    // Línea separadora dorada estilizada
    doc.setDrawColor(...COLORS_PDF.teal);
    doc.setLineWidth(1.2);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Buscar la casa y los horarios del facilitador
    let casaComunalTexto = "Varias casas";
    let horarioTexto = "No definido";

    const NOMBRES_DIAS = {
      1: "Lunes",
      2: "Martes",
      3: "Miércoles",
      4: "Jueves",
      5: "Viernes",
      6: "Sábado",
      7: "Domingo",
    };

    if (filterCasa) {
      const casaSelec = casas.find((c) => c.id === Number(filterCasa));
      if (casaSelec) casaComunalTexto = casaSelec.nombre;

      const horarioCasa = horarios.find(
        (h) =>
          h.casa_id === Number(filterCasa) &&
          h.facilitador_id === Number(selectedFacilitador),
      );
      if (horarioCasa) {
        const diaStr = horarioCasa.dia_semana
          ? `${NOMBRES_DIAS[horarioCasa.dia_semana] || ""} `
          : "";
        horarioTexto =
          horarioCasa.hora_inicio && horarioCasa.hora_fin
            ? `${diaStr}${horarioCasa.hora_inicio} - ${horarioCasa.hora_fin}`
            : horarioCasa.horario || horarioCasa.hora || "No definido";
      }
    } else {
      const casasAsig = getCasasByFacilitador(selectedFacilitador);
      if (casasAsig.length > 0) {
        casaComunalTexto = casasAsig.map((c) => c.nombre).join(", ");
      }
      const horarioFac = horarios.find(
        (h) => h.facilitador_id === Number(selectedFacilitador),
      );
      if (horarioFac) {
        const diaStr = horarioFac.dia_semana
          ? `${NOMBRES_DIAS[horarioFac.dia_semana] || ""} `
          : "";
        horarioTexto =
          horarioFac.hora_inicio && horarioFac.hora_fin
            ? `${diaStr}${horarioFac.hora_inicio} - ${horarioFac.hora_fin}`
            : horarioFac.horario || horarioFac.hora || "No definido";
      }
    }

    doc.setFontSize(10.5);
    doc.setTextColor(...COLORS_PDF.text);

    const drawBoldText = (label, value, x, y) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, x, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setFont("helvetica", "normal");
      doc.text(value, x + labelWidth + 2, y);
    };

    drawBoldText("Facilitador:", facilitadorNombre, margin, yPosition);
    yPosition += 6.5;
    drawBoldText("Mes:", `${mesNombre} ${filterAnio}`, margin, yPosition);
    yPosition += 6.5;
    drawBoldText("Casa Comunal:", casaComunalTexto, margin, yPosition);
    yPosition += 6.5;
    drawBoldText("Horario:", horarioTexto, margin, yPosition);
    yPosition += 10;

    // Calcular total de horas en el mes
    const totalMinutos = registrosCombinados.reduce((acc, reg) => {
      if (
        !reg.hora_entrada ||
        !reg.hora_salida ||
        reg.hora_entrada === "-" ||
        reg.hora_salida === "-"
      )
        return acc;
      const [hIni, mIni] = String(reg.hora_entrada).split(":").map(Number);
      const [hFin, mFin] = String(reg.hora_salida).split(":").map(Number);
      if (isNaN(hIni) || isNaN(mIni) || isNaN(hFin) || isNaN(mFin)) return acc;

      let diff = hFin * 60 + mFin - (hIni * 60 + mIni);
      if (diff < 0) diff += 24 * 60;
      return acc + diff;
    }, 0);

    const horasTotal = Math.floor(totalMinutos / 60);
    const minutosTotal = totalMinutos % 60;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS_PDF.darkTeal);
    doc.text(
      `Total Horas Trabajadas: ${horasTotal}h ${minutosTotal}m`,
      margin,
      yPosition,
    );
    yPosition += 6;

    const tableData = registrosCombinados.map((reg) => [
      formatDate(reg.fecha),
      reg.tipo || "Asistencia a la casa comunal",
      formatTime(reg.hora_entrada),
      formatTime(reg.hora_salida),
      reg.descripcion || "-",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [
        ["Fecha", "Tipo de Actividad", "Llegada", "Salida", "Descripción"],
      ],
      body: tableData,
      theme: "grid",
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: COLORS_PDF.lightTeal,
        textColor: COLORS_PDF.darkTeal,
        fontStyle: "bold",
        lineColor: COLORS_PDF.line,
        lineWidth: 0.3,
      },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 2,
        textColor: COLORS_PDF.text,
        lineColor: COLORS_PDF.line,
        lineWidth: 0.25,
      },
      alternateRowStyles: {
        fillColor: [253, 251, 245],
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `Página ${i} de ${pageCount} | Sistema de Gestión de Casas Comunales`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      );
    }

    doc.save(
      `Reporte_${facilitadorNombre.replace(/\s+/g, "_")}_${mesNombre}_${filterAnio}.pdf`,
    );
  };

  // Resto de funciones auxiliares y Handlers del componente...
  const openEditActividad = (reg) => {
    setActModalMode("edit");
    setActForm({
      id: reg.original.id,
      facilitador_id: reg.original.facilitador_id || "",
      tipo_actividad:
        MAP_TO_UI[reg.original.tipo_actividad] ||
        reg.original.tipo_actividad ||
        "Elaboración de material",
      fecha: reg.original.fecha || "",
      hora_inicio: reg.original.hora_inicio
        ? String(reg.original.hora_inicio).slice(0, 5)
        : "",
      hora_fin: reg.original.hora_fin
        ? String(reg.original.hora_fin).slice(0, 5)
        : "",
      descripcion: reg.original.descripcion || "",
      casa_comunal_id: reg.original.casa_comunal_id
        ? String(reg.original.casa_comunal_id)
        : "",
    });
    setControlFormError("");
    setShowActModal(true);
  };

  const openCreateActividad = () => {
    setActModalMode("create");
    const facId = selectedFacilitador ? String(selectedFacilitador) : "";
    const casasAsig = facId ? getCasasByFacilitador(facId) : [];
    const casaId = casasAsig[0]?.id ? String(casasAsig[0].id) : "";
    setActForm({
      id: "",
      facilitador_id: facId,
      tipo_actividad: "Elaboración de material",
      fecha: getTodayBolivia(),
      hora_inicio: "",
      hora_fin: "",
      descripcion: "",
      casa_comunal_id: casaId,
    });
    setControlFormError("");
    setShowActModal(true);
  };

  const handleSaveActividad = async () => {
    if (!actForm.fecha || !actForm.hora_inicio || !actForm.descripcion.trim()) {
      setControlFormError("Fecha, hora inicio y descripción son obligatorios.");
      return;
    }
    if (!actForm.facilitador_id && actModalMode === "create") {
      setControlFormError("Debes seleccionar un facilitador.");
      return;
    }
    setIsSavingAct(true);
    setControlFormError("");
    try {
      const payload = {
        fecha: actForm.fecha,
        hora_inicio:
          actForm.hora_inicio.length === 5
            ? `${actForm.hora_inicio}:00`
            : actForm.hora_inicio,
        hora_fin: actForm.hora_fin
          ? actForm.hora_fin.length === 5
            ? `${actForm.hora_fin}:00`
            : actForm.hora_fin
          : null,
        tipo_actividad:
          MAP_TO_BACKEND[actForm.tipo_actividad] || actForm.tipo_actividad,
        descripcion: actForm.descripcion,
        casa_comunal_id: actForm.casa_comunal_id
          ? Number(actForm.casa_comunal_id)
          : null,
        ...(actForm.facilitador_id
          ? { facilitador_id: Number(actForm.facilitador_id) }
          : {}),
      };

      if (actModalMode === "edit") {
        await editarActividadFacilitadorRequest(actForm.id, payload);
        setSuccessMessage("Actividad actualizada correctamente.");
      } else {
        await registrarActividadFacilitadorRequest(payload);
        setSuccessMessage("Actividad registrada correctamente.");
      }
      setShowActModal(false);

      listarActividadesFacilitadorRequest()
        .then((data) => {
          setActividades(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    } catch (err) {
      const serverMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err.message;
      const displayMsg = Array.isArray(serverMsg)
        ? serverMsg
            .map((e) => `${e.loc?.join && e.loc.join(".")}: ${e.msg}`)
            .join(", ")
        : serverMsg || "Error al guardar actividad";
      setControlFormError(
        typeof displayMsg === "string"
          ? displayMsg
          : JSON.stringify(displayMsg),
      );
    } finally {
      setIsSavingAct(false);
    }
  };

  const handleDeleteActividad = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    setControlFormError("");
    try {
      await eliminarActividadFacilitadorRequest(confirmDeleteId);
      setSuccessMessage("Actividad de control eliminada.");
      setConfirmDeleteId(null);

      listarActividadesFacilitadorRequest()
        .then((data) => {
          setActividades(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    } catch (err) {
      setControlFormError(err.message || "Error al eliminar actividad");
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreateControlModal = () => {
    setControlModalMode("create");
    const facilitatorId = selectedFacilitador || "";
    const casasAsignadas = getCasasByFacilitador(facilitatorId);
    const casaId = casasAsignadas[0]?.id ? String(casasAsignadas[0].id) : "";

    setControlForm({
      ...EMPTY_CONTROL_FORM,
      facilitador_id: facilitatorId,
      casa_comunal_id: casaId,
      fecha: getTodayBolivia(),
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
      let errorMsg = "Error al guardar el control";
      if (typeof err === "object" && err !== null) {
        if (err.message)
          errorMsg =
            typeof err.message === "string"
              ? err.message
              : JSON.stringify(err.message);
        else if (err.msg) errorMsg = err.msg;
        else if (err.detail) errorMsg = err.detail;
      } else if (typeof err === "string") {
        errorMsg = err;
      }
      setControlFormError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

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
      {/* Estructura JSX del Panel de Control del Componente */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Control de Facilitadores
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Panel administrativo de Llegadas y Salidas.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            onClick={handleGeneratePDF}
            disabled={!selectedFacilitador}
            className="gap-2"
          >
            <Download size={18} />
            Exportar Reporte
          </Button>

          <Button
            variant="primary"
            onClick={openCreateControlModal}
            className="gap-2"
          >
            <Plus size={18} />
            Crear control
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}
      {error && <Alert type="error" title="Error" message={error} />}

      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Facilitador"
            value={selectedFacilitador}
            onChange={(e) => {
              setSelectedFacilitador(e.target.value);
              setFilterCasa("");
            }}
          >
            <option value="">Seleccione un facilitador</option>
            {facilitadores.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.nombre_completo || fac.nombre}
              </option>
            ))}
          </Select>

          {selectedFacilitador && (
            <Select
              label="Casa Comunal"
              value={filterCasa}
              onChange={(e) => setFilterCasa(e.target.value)}
            >
              <option value="">Todas las casas</option>
              {getCasasByFacilitador(selectedFacilitador).map((casa) => (
                <option key={casa.id} value={casa.id}>
                  {casa.nombre}
                </option>
              ))}
            </Select>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                label="Mes"
                value={filterMes}
                onChange={(e) => setFilterMes(Number(e.target.value))}
              >
                {MESES.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex-1">
              <Select
                label="Año"
                value={filterAnio}
                onChange={(e) => setFilterAnio(Number(e.target.value))}
              >
                {anios.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Select
            label="Estado (Controles)"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="validados">Validados</option>
            <option value="pendientes">Pendientes de validar</option>
          </Select>
        </div>
      </Card>

      {/* Tabla de controles */}
      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      ) : registrosCombinados.length === 0 ? (
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
                    Tipo / Descripción
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    LLegada
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Salida
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Ubicación / Fotos
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
                {paginatedData.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {getNombreFacilitador(reg.facilitador_id)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(reg.fecha)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-blue-700 text-xs">
                        {reg.tipo}
                      </div>
                      <div
                        className="text-gray-500 text-xs mt-1 truncate max-w-[200px]"
                        title={reg.descripcion}
                      >
                        {reg.descripcion}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-blue-600" />
                        {formatTime(reg.hora_entrada)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        {reg.hora_salida ? (
                          <>
                            <Clock size={14} className="text-green-600" />
                            {formatTime(reg.hora_salida)}
                          </>
                        ) : (
                          <span className="text-yellow-600 text-xs font-medium">
                            En proceso
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {reg.source === "control" ? (
                        <div className="flex items-center gap-3">
                          {reg.latitud_entrada && reg.longitud_entrada ? (
                            <a
                              href={`https://maps.google.com/?q=${reg.latitud_entrada},${reg.longitud_entrada}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                              title="Ver mapa"
                            >
                              <MapPin size={16} />
                            </a>
                          ) : (
                            <span className="text-gray-300">
                              <MapPin size={16} />
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedControl(reg.original);
                              setShowFotosModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                            title="Ver fotos"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {reg.validado ? (
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
                      {reg.source === "control" ? (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() => openEditControlModal(reg.original)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-medium transition-colors"
                          >
                            <Pencil size={14} />
                            Editar
                          </button>
                          {!reg.validado ? (
                            <button
                              onClick={() => {
                                setSelectedControl(reg.original);
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
                      ) : (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() => openEditActividad(reg)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-medium transition-colors"
                          >
                            <Pencil size={14} />
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(reg.original.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded font-medium transition-colors"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </div>
                      )}
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
              {getCasasByFacilitador(controlForm.facilitador_id).map((casa) => (
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

      {/* Modal crear / editar actividad */}
      <Modal
        isOpen={showActModal}
        onClose={() => setShowActModal(false)}
        title={
          actModalMode === "create" ? "Registrar Actividad" : "Editar Actividad"
        }
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {controlFormError && (
            <Alert type="error" title="Error" message={controlFormError} />
          )}

          {/* Facilitador — editable solo en modo crear */}
          <Select
            label="Facilitador"
            value={actForm.facilitador_id}
            onChange={(e) => {
              const facId = e.target.value;
              const casas = getCasasByFacilitador(facId);
              const casaId = casas[0]?.id ? String(casas[0].id) : "";
              setActForm({
                ...actForm,
                facilitador_id: facId,
                casa_comunal_id: casaId,
              });
            }}
            required
            disabled={actModalMode === "edit"}
          >
            {facilitadores.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.nombre_completo || fac.nombre}
              </option>
            ))}
          </Select>

          {/* Casa Comunal */}
          {actForm.facilitador_id && (
            <Select
              label="Casa Comunal"
              value={actForm.casa_comunal_id}
              onChange={(e) =>
                setActForm({ ...actForm, casa_comunal_id: e.target.value })
              }
            >
              {getCasasByFacilitador(actForm.facilitador_id).map((casa) => (
                <option key={casa.id} value={casa.id}>
                  {casa.nombre}
                </option>
              ))}
            </Select>
          )}

          <Input
            label="Fecha"
            type="date"
            value={actForm.fecha}
            onChange={(e) => setActForm({ ...actForm, fecha: e.target.value })}
            required
          />

          <Select
            label="Tipo de Actividad"
            value={actForm.tipo_actividad}
            onChange={(e) =>
              setActForm({ ...actForm, tipo_actividad: e.target.value })
            }
            required
          >
            {TIPOS_ACTIVIDAD_UI.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora inicio"
              type="time"
              value={actForm.hora_inicio}
              onChange={(e) =>
                setActForm({ ...actForm, hora_inicio: e.target.value })
              }
              required
            />
            <Input
              label="Hora fin"
              type="time"
              value={actForm.hora_fin}
              onChange={(e) =>
                setActForm({ ...actForm, hora_fin: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              placeholder="Descripción de la actividad..."
              value={actForm.descripcion}
              onChange={(e) =>
                setActForm({ ...actForm, descripcion: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowActModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveActividad}
              disabled={isSavingAct}
            >
              {isSavingAct
                ? "Guardando..."
                : actModalMode === "create"
                  ? "Registrar"
                  : "Actualizar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmar Eliminar Actividad */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Confirmar eliminación"
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se
          puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 text-white"
            onClick={handleDeleteActividad}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
