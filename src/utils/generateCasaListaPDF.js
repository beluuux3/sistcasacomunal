import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 🎨 Paleta dorada corporativa unificada
const COLORS = {
  teal: [212, 160, 23], // Dorado principal
  darkTeal: [158, 114, 5], // Dorado oscuro para subtítulos y textos fuertes
  lightTeal: [251, 247, 235], // Fondo crema sutil para la cabecera de la tabla
  line: [218, 213, 201], // Gris dorado para bordes
  text: [30, 30, 30], // Carbón oscuro para lectura limpia
};

// Función para cargar el logo de la casa
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

// Función para cargar el logo de la alcaldía
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

export const generateCasaListaPDF = async (casa, tallerInfo, participantes) => {
  // 🔄 Carga asíncrona y paralela de ambos logos
  const [logoCasa, logoAlcaldia] = await Promise.all([
    getLogoAsBase64(),
    getLogoAlcaldiaBase64(),
  ]);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // 1️⃣ PRIMER LOGO: Escudo de la Alcaldía (Extremo Izquierdo)
  if (logoAlcaldia) {
    doc.addImage(logoAlcaldia, "PNG", margin, yPosition - 2, 25, 20);
  }

  // 2️⃣ SEGUNDO LOGO: Casa Comunal (Al lado de la alcaldía con espacio controlado)
  if (logoCasa) {
    // Posición X: margen + ancho de alcaldía (25) + 4mm de separación = margin + 29
    doc.addImage(logoCasa, "PNG", margin + 29, yPosition - 5, 25, 18);
  }

  // 3️⃣ TEXTOS DEL ENCABEZADO: Desplazados a la derecha para no colisionar con los logos
  const titleX = margin + 58;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.teal);
  doc.text("CASA COMUNAL", titleX, yPosition + 3);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Lista de Participantes", titleX, yPosition + 9);

  yPosition += 18;

  // Línea separadora estilizada en dorado institucional
  doc.setDrawColor(...COLORS.teal);
  doc.setLineWidth(1.2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;

  // Detalles informativos de la Casa y Taller
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.text);

  doc.setFont("helvetica", "bold");
  doc.text("Casa Comunal: ", margin, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(`${casa?.nombre || "No especificada"}`, margin + 28, yPosition);
  yPosition += 6.5;

  doc.setFont("helvetica", "bold");
  doc.text("Taller: ", margin, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${tallerInfo?.tallerNombre || "No asignado"}`,
    margin + 13,
    yPosition,
  );
  yPosition += 6.5;

  doc.setFont("helvetica", "bold");
  doc.text("Facilitador: ", margin, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${tallerInfo?.facilitadorNombre || "No asignado"}`,
    margin + 21,
    yPosition,
  );
  yPosition += 6.5;

  doc.setFont("helvetica", "bold");
  doc.text("Horario: ", margin, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(`${tallerInfo?.horario || "No definido"}`, margin + 16, yPosition);
  yPosition += 10;

  // Tabla de Participantes
  const tableColumn = [
    "Nro",
    "Ap. Paterno",
    "Ap. Materno",
    "Nombres",
    "CI",
    "Celular",
  ];
  const tableRows = [];

  // Ordenar participantes alfabéticamente por apellidos y luego por nombres
  const sortedParticipantes = [...participantes].sort((a, b) => {
    const nameA = `${a.apellidos || ""} ${a.nombres || ""}`
      .trim()
      .toLowerCase();
    const nameB = `${b.apellidos || ""} ${b.nombres || ""}`
      .trim()
      .toLowerCase();
    return nameA.localeCompare(nameB);
  });

  sortedParticipantes.forEach((p, index) => {
    const apellidos = (p.apellidos || "").split(" ");
    const paterno = apellidos[0] || "";
    const materno = apellidos.slice(1).join(" ") || "";

    const participanteData = [
      index + 1,
      paterno,
      materno,
      p.nombres || "",
      p.ci || "",
      p.telefono || "",
    ];
    tableRows.push(participanteData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: yPosition,
    theme: "grid",
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: COLORS.lightTeal, // Fondo crema institucional elegante
      textColor: COLORS.darkTeal, // Texto dorado oscuro para alta legibilidad
      fontStyle: "bold",
      lineColor: COLORS.line,
      lineWidth: 0.3,
    },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2,
      textColor: COLORS.text,
      lineColor: COLORS.line,
      lineWidth: 0.25,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" }, // Nro centrado
      4: { cellWidth: 25 }, // CI
      5: { cellWidth: 25 }, // Celular
    },
    alternateRowStyles: {
      fillColor: [253, 251, 245], // Alternancia sutil basada en el tono crema
    },
  });

  // Pie de página
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

  // Guardar el PDF
  doc.save(`Lista_Participantes_${casa?.nombre.replace(/ /g, "_")}.pdf`);
};
