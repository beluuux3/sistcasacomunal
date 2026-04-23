import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = {
  teal: [23, 162, 184],
  darkTeal: [18, 125, 145],
  lightTeal: [232, 244, 248],
  line: [210, 210, 210],
  text: [20, 20, 20],
  muted: [95, 95, 95],
};

function toText(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || "-";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function formatDate(value, localeOptions) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return toText(value);

  return date.toLocaleDateString("es-ES", localeOptions);
}

function getEdad(participante) {
  if (!participante?.fecha_nacimiento) return "-";

  const birthDate = new Date(participante.fecha_nacimiento);
  if (Number.isNaN(birthDate.getTime())) return "-";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return String(age);
}

function getGenero(participante) {
  if (participante?.genero === "M") return "Masculino";
  if (participante?.genero === "F") return "Femenino";
  return toText(participante?.genero);
}

async function getLogoAsBase64() {
  try {
    const response = await fetch("/LOGOCASACOMUNAL.jpeg");
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading logo:", error);
    return null;
  }
}

function drawHeader(
  doc,
  logoBase64,
  pageWidth,
  margin,
  numeroRegistro,
  casaNombre,
) {
  const titleX = margin + 34;
  const headerTop = margin;

  if (logoBase64) {
    doc.addImage(logoBase64, "JPEG", margin, headerTop - 1, 24, 19);
  }

  doc.setTextColor(...COLORS.teal);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CASAS COMUNALES", titleX, headerTop + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text("Ficha de Inscripcion de Participante", titleX, headerTop + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.teal);
  doc.text(`Reg. #${numeroRegistro}`, pageWidth - margin, headerTop + 5, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `Fecha: ${new Date().toLocaleDateString("es-ES")}`,
    pageWidth - margin,
    headerTop + 11,
    { align: "right" },
  );

  doc.setDrawColor(...COLORS.teal);
  doc.setLineWidth(1.2);
  doc.line(margin, headerTop + 20, pageWidth - margin, headerTop + 20);

  const casaTop = headerTop + 24;
  doc.setFillColor(...COLORS.lightTeal);
  doc.setDrawColor(...COLORS.teal);
  doc.roundedRect(margin, casaTop, pageWidth - margin * 2, 16, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.teal);
  doc.text("Casa Comunal Asignada", margin + 3, casaTop + 5);

  doc.setFontSize(13);
  doc.text(toText(casaNombre), margin + 3, casaTop + 11.5);

  return casaTop + 21;
}

function drawSectionTitle(doc, x, y, width, title) {
  doc.setFillColor(...COLORS.teal);
  doc.setDrawColor(...COLORS.teal);
  doc.roundedRect(x, y, width, 8, 1.2, 1.2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(title.toUpperCase(), x + 3, y + 5.5);

  return y + 10;
}

function measureFieldHeight(doc, width, value) {
  const valueText = toText(value);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const valueLines = doc.splitTextToSize(valueText, width);
  const valueLineCount = Array.isArray(valueLines) ? valueLines.length : 1;
  const valueHeight = Math.max(5, valueLineCount * 4.5);

  return 6 + valueHeight + 2;
}

function drawField(doc, x, y, width, label, value, rowHeight) {
  const labelText = toText(label);
  const valueText = toText(value);
  const effectiveRowHeight = rowHeight || measureFieldHeight(doc, width, value);
  const valueLines = doc.splitTextToSize(valueText, width);
  const lineBottom = y + effectiveRowHeight - 1;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.teal);
  doc.text(labelText, x, y + 3.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.text);
  doc.text(valueLines, x, y + 8);

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(x, lineBottom, x + width, lineBottom);

  return lineBottom - y + 2;
}

function drawFieldRow(doc, x, y, width, fields, gap = 4) {
  const spans = fields.map((field) => field.span || 1);
  const totalSpan = spans.reduce((sum, span) => sum + span, 0);
  const usableWidth = width - gap * (fields.length - 1);

  const measuredHeights = fields.map((field, index) => {
    const fieldWidth = (usableWidth * spans[index]) / totalSpan;
    return measureFieldHeight(doc, fieldWidth, field.value);
  });

  const rowHeight = Math.max(...measuredHeights);
  let currentX = x;

  fields.forEach((field, index) => {
    const fieldWidth = (usableWidth * spans[index]) / totalSpan;
    drawField(
      doc,
      currentX,
      y,
      fieldWidth,
      field.label,
      field.value,
      rowHeight,
    );
    currentX += fieldWidth + gap;
  });

  return y + rowHeight + 1;
}

function drawSignatureSection(doc, x, y, width) {
  const halfWidth = (width - 14) / 2;
  const lineY = y + 10;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.line(x, lineY, x + halfWidth, lineY);
  doc.line(x + halfWidth + 14, lineY, x + halfWidth + 14 + halfWidth, lineY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("Firma del Participante", x + halfWidth / 2, lineY + 4, {
    align: "center",
  });
  doc.text(
    "Firma del Responsable",
    x + halfWidth + 14 + halfWidth / 2,
    lineY + 4,
    { align: "center" },
  );

  return lineY + 10;
}

export async function generateParticipantePDFBlob(
  participante,
  numeroRegistro = 1,
  casaInfo = {},
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 24;
  const footerDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const logoBase64 = await getLogoAsBase64();
  let y = drawHeader(
    doc,
    logoBase64,
    pageWidth,
    margin,
    numeroRegistro,
    casaInfo?.nombre || "No Asignada",
  );

  const ensureSpace = (requiredHeight) => {
    if (y + requiredHeight <= bottomLimit) {
      return;
    }

    doc.addPage();
    y = drawHeader(
      doc,
      logoBase64,
      pageWidth,
      margin,
      numeroRegistro,
      casaInfo?.nombre || "No Asignada",
    );
  };

  const sections = [
    {
      title: "Datos de Registro",
      rows: [
        [
          { label: "Nro. de Registro", value: numeroRegistro, span: 1 },
          {
            label: "Fecha de Inscripcion",
            value: formatDate(participante?.created_at, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            span: 1,
          },
          { label: "CI", value: participante?.ci, span: 1 },
        ],
      ],
    },
    {
      title: "Datos Personales",
      rows: [
        [
          { label: "Nombres", value: participante?.nombres, span: 1 },
          {
            label: "Apellido Paterno",
            value: participante?.apellido_paterno,
            span: 1,
          },
          {
            label: "Apellido Materno",
            value: participante?.apellido_materno,
            span: 1,
          },
        ],
        [
          {
            label: "Fecha de Nacimiento",
            value: participante?.fecha_nacimiento,
            span: 1,
          },
          { label: "Edad", value: getEdad(participante), span: 1 },
          { label: "Genero", value: getGenero(participante), span: 1 },
        ],
        [
          {
            label: "Lugar de Nacimiento",
            value: participante?.lugar_nacimiento,
            span: 1,
          },
          { label: "Estado Civil", value: participante?.estado_civil, span: 1 },
          { label: "Telefono", value: participante?.telefono, span: 1 },
        ],
        [
          {
            label: "Macrodistrito",
            value: participante?.macrodistrito,
            span: 1,
          },
          { label: "Direccion", value: participante?.direccion, span: 2 },
        ],
        [
          {
            label: "Como se Entoro",
            value: participante?.como_se_entero,
            span: 1,
          },
          {
            label: "Contacto de Emergencia",
            value: participante?.contacto_emergencia,
            span: 1,
          },
        ],
      ],
    },
    {
      title: "Datos Academicos",
      rows: [
        [
          {
            label: "Grado de Instruccion",
            value: participante?.grado_instruccion,
            span: 1,
          },
          { label: "Ultimo Cargo", value: participante?.ultimo_cargo, span: 1 },
          {
            label: "Anos de Servicio",
            value: participante?.anios_servicio,
            span: 1,
          },
        ],
      ],
    },
    {
      title: "Datos Medicos",
      rows: [
        [
          {
            label: "Sistema de Salud",
            value:
              participante?.datos_medicos?.[0]?.sistema_salud ||
              participante?.sistema_salud,
            span: 1,
          },
          {
            label: "Enfermedad de Base",
            value:
              participante?.datos_medicos?.[0]?.enfermedad_base ||
              participante?.enfermedad_base,
            span: 1,
          },
          {
            label: "Tratamiento Especifico",
            value:
              participante?.datos_medicos?.[0]?.tratamiento_especifico ||
              participante?.tratamiento_especifico,
            span: 1,
          },
        ],
      ],
    },
  ];

  sections.forEach((section) => {
    ensureSpace(18);

    y = drawSectionTitle(doc, margin, y, contentWidth, section.title);

    section.rows.forEach((row) => {
      const spans = row.map((field) => field.span || 1);
      const totalSpan = spans.reduce((sum, span) => sum + span, 0);
      const usableWidth = contentWidth - 4 * (row.length - 1);
      const rowHeight = Math.max(
        ...row.map((field, index) => {
          const fieldWidth = (usableWidth * spans[index]) / totalSpan;
          return measureFieldHeight(doc, fieldWidth, field.value);
        }),
      );

      ensureSpace(rowHeight + 1);
      y = drawFieldRow(doc, margin, y, contentWidth, row);
      y += 1;
    });

    y += 2;
  });

  if (Array.isArray(participante?.familia) && participante.familia.length > 0) {
    ensureSpace(20);
    y = drawSectionTitle(doc, margin, y, contentWidth, "Datos Familiares");

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["Apellidos", "Nombres", "Parentesco", "Telefono", "Direccion"]],
      body: participante.familia.map((f) => [
        toText(
          `${f?.apellido_paterno || ""} ${f?.apellido_materno || ""}`.trim(),
        ),
        toText(f?.nombres),
        toText(f?.parentesco),
        toText(f?.telefono),
        toText(f?.direccion),
      ]),
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 1.5,
        textColor: COLORS.text,
        lineColor: COLORS.line,
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: COLORS.lightTeal,
        textColor: COLORS.teal,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      tableWidth: contentWidth,
      pageBreak: "auto",
      showHead: "everyPage",
    });

    y = (doc.lastAutoTable?.finalY || y) + 6;
  }

  ensureSpace(22);
  y = drawSignatureSection(doc, margin, y, contentWidth);

  const totalPages = doc.internal.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `Documento generado el ${footerDate} | Sistema de Gestion de Casas Comunales`,
      margin,
      pageHeight - 8,
    );
    doc.text(
      `Pagina ${page} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      {
        align: "right",
      },
    );
  }

  return doc.output("blob");
}
