import { jsPDF } from "jspdf";

// 🎨 Paleta dorada corporativa unificada
const COLORS = {
  teal: [212, 160, 23], // Dorado principal
  darkTeal: [158, 114, 5], // Dorado oscuro para títulos secundarios
  lightTeal: [251, 247, 235], // Fondo crema sutil
  line: [218, 213, 201], // Gris dorado para divisiones
  text: [30, 30, 30], // Carbón oscuro para lectura limpia
};

/**
 * Cargar logo Casa Comunal
 */
async function getLogoAsBase64() {
  try {
    const response = await fetch("/LogoCasa.png");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error cargando logo de la casa:", error);
    return null;
  }
}

/**
 * Cargar logo Alcaldía
 */
async function getLogoAlcaldiaBase64() {
  try {
    const response = await fetch("/LOGO_ALCALDIA.png");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error cargando logo de la alcaldía:", error);
    return null;
  }
}

/**
 * Generador PDF Casa Comunal
 */
export async function generateCasaComunalPDF(casa) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Dimensiones
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;

  // 🔄 Carga paralela de ambos logos para evitar desincronizaciones
  const [logoCasa, logoAlcaldia] = await Promise.all([
    getLogoAsBase64(),
    getLogoAlcaldiaBase64(),
  ]);

  // 1️⃣ PRIMER LOGO: Escudo de la Alcaldía (Extremo Izquierdo)
  if (logoAlcaldia) {
    doc.addImage(logoAlcaldia, "PNG", margin, yPosition - 2, 25, 20);
  }

  // 2️⃣ SEGUNDO LOGO: Casa Comunal (Al lado del de la alcaldía con espacio prudente)
  if (logoCasa) {
    // Posicionado dinámicamente: margen + ancho alcaldía (25) + 4mm de separación = margin + 29
    doc.addImage(logoCasa, "PNG", margin + 29, yPosition - 5, 25, 18);
  }

  // 3️⃣ TEXTOS DEL ENCABEZADO: Desplazados a la derecha para dar aire a los logos
  const titleX = margin + 58;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.teal);
  doc.text("CASA COMUNAL", titleX, yPosition + 3);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.darkTeal);
  doc.text(casa.nombre || "", titleX, yPosition + 9);

  yPosition += 18;

  // Línea separadora estilizada en dorado institucional
  doc.setDrawColor(...COLORS.teal);
  doc.setLineWidth(1.2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // 📋 INFORMACIÓN EN DOS COLUMNAS
  const colWidth = (contentWidth - 5) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 5;

  let col1Y = yPosition;
  let col2Y = yPosition;

  const leftSections = [
    {
      title: "Información General",
      data: [
        { label: "Nombre", value: " " + (casa.nombre || "-") },
        { label: "Dirección", value: " " + (casa.direccion || "-") },
        { label: "Macrodistrito", value: "   " + (casa.macrodistrito || "-") },
      ],
    },
    {
      title: "Representante",
      data: [
        { label: "Nombre", value: " " + (casa.representante_nombre || "-") },
        {
          label: "Cédula de Identidad",
          value: "   " + (casa.representante_ci || "-"),
        },
      ],
    },
  ];

  const rightSections = [
    {
      title: "Contacto",
      data: [
        { label: "Teléfono", value: "   " + (casa.contacto_telefono || "-") },
      ],
    },
    {
      title: "Ubicación",
      data: [
        { label: "Latitud", value: "  " + (casa.latitud || "-") },
        { label: "Longitud", value: "  " + (casa.longitud || "-") },
      ],
    },
  ];

  // Renderizar columna izquierda
  leftSections.forEach((section) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.darkTeal);
    doc.text(section.title, col1X, col1Y);
    col1Y += 7;

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);

    section.data.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.text(item.label + ":", col1X + 2, col1Y);

      doc.setFont("helvetica", "normal");
      const labelWidth = doc.getTextWidth(item.label + ": ");
      const maxWidth = colWidth - labelWidth - 4;
      const lines = doc.splitTextToSize(item.value, maxWidth);

      if (lines.length > 1) {
        lines.forEach((line, index) => {
          doc.text(line, col1X + labelWidth + 2, col1Y + index * 4);
        });
        col1Y += lines.length * 4;
      } else {
        doc.text(item.value, col1X + labelWidth + 2, col1Y);
        col1Y += 4;
      }
    });
    col1Y += 2;
  });

  // Renderizar columna derecha
  rightSections.forEach((section) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.darkTeal);
    doc.text(section.title, col2X, col2Y);
    col2Y += 7;

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);

    section.data.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.text(item.label + ":", col2X + 2, col2Y);

      doc.setFont("helvetica", "normal");
      const labelWidth = doc.getTextWidth(item.label + ": ");
      const maxWidth = colWidth - labelWidth - 4;
      const lines = doc.splitTextToSize(item.value, maxWidth);

      if (lines.length > 1) {
        lines.forEach((line, index) => {
          doc.text(line, col2X + labelWidth + 2, col2Y + index * 4);
        });
        col2Y += lines.length * 4;
      } else {
        doc.text(item.value, col2X + labelWidth + 2, col2Y);
        col2Y += 4;
      }
    });
    col2Y += 2;
  });

  yPosition = Math.max(col1Y, col2Y) + 8;

  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = margin;
  }

  // 📋 TABLA Y SECCIÓN DE FIRMA REFORMADA
  doc.setFont("helvetica", "bold");

  const tableStartX = margin;
  const tableStartY = yPosition;
  const tableWidth = 110;
  const acreditadaWidth = tableWidth / 2;
  const headerHeight = 8;
  const contentCellHeight = 12;

  // Cabecera ACREDITADA con fondo institucional claro
  doc.setFillColor(...COLORS.lightTeal);
  doc.rect(tableStartX, tableStartY, acreditadaWidth, headerHeight, "F");

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.rect(tableStartX, tableStartY, acreditadaWidth, headerHeight, "D");

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.darkTeal);
  doc.text("ACREDITADA", tableStartX + 3, tableStartY + 5.5);

  // Espacio vacío para marcar / firmar
  doc.rect(
    tableStartX,
    tableStartY + headerHeight,
    acreditadaWidth,
    contentCellHeight,
    "D",
  );

  // 📝 SECCIÓN FIRMA DE ENCARGADO
  const firmaX = tableStartX + tableWidth + 8;
  const firmaWidth = contentWidth - tableWidth - 8;

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.4);
  doc.line(
    firmaX,
    tableStartY + headerHeight + 8,
    firmaX + firmaWidth,
    tableStartY + headerHeight + 8,
  );

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(
    "Firma de Encargado de Casas Comunales",
    firmaX + firmaWidth / 2,
    tableStartY + headerHeight + 13,
    {
      align: "center",
    },
  );

  return doc;
}

/**
 * Descargar PDF de casa comunal
 */
export async function downloadCasaComunalPDF(casa) {
  const doc = await generateCasaComunalPDF(casa);
  doc.save(`Casa-Comunal-${casa.nombre.replace(/\s+/g, "-")}.pdf`);
}
