import { jsPDF } from "jspdf";

/**
 * Cargar logo como base64
 */
async function getLogoAsBase64() {
  try {
    const response = await fetch("/LOGOCASACOMUNAL.jpeg");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error cargando logo:", error);
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

  // 🎨 HEADER con Logo
  const logoBase64 = await getLogoAsBase64();

  if (logoBase64) {
    // Agregar logo a la izquierda
    doc.addImage(logoBase64, "JPEG", margin, yPosition - 2, 25, 20);
  }

  // Texto "Casa Comunal {nombre}"
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 140, 180);
  doc.text("CASA COMUNAL", margin + 30, yPosition + 5);

  doc.setFontSize(14);
  doc.setFont(undefined, "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(casa.nombre || "", margin + 30, yPosition + 12);

  yPosition += 20;

  // Línea separadora (azul turquesa, más gruesa)
  doc.setDrawColor(0, 140, 180);
  doc.setLineWidth(1.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // 📋 INFORMACIÓN EN DOS COLUMNAS
  const colWidth = (contentWidth - 5) / 2; // Espacio entre columnas
  const col1X = margin;
  const col2X = margin + colWidth + 5;

  let col1Y = yPosition;
  let col2Y = yPosition;

  // Secciones para columna izquierda
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

  // Secciones para columna derecha
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
    doc.setFont(undefined, "bold");
    doc.setTextColor(70, 120, 190);
    doc.text(section.title, col1X, col1Y);
    col1Y += 7;

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(50, 50, 50);

    section.data.forEach((item) => {
      doc.setFont(undefined, "bold");
      doc.text(item.label + ":", col1X + 2, col1Y);

      doc.setFont(undefined, "normal");
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
    doc.setFont(undefined, "bold");
    doc.setTextColor(70, 120, 190);
    doc.text(section.title, col2X, col2Y);
    col2Y += 7;

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(50, 50, 50);

    section.data.forEach((item) => {
      doc.setFont(undefined, "bold");
      doc.text(item.label + ":", col2X + 2, col2Y);

      doc.setFont(undefined, "normal");
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

  // Obtener la posición Y más grande
  yPosition = Math.max(col1Y, col2Y) + 8;

  // Verificar si necesitamos nueva página para la tabla
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = margin;
  }

  // 📋 TABLA FINAL
  doc.setFont(undefined, "bold");

  const tableStartX = margin;
  const tableStartY = yPosition;
  const tableWidth = 110; // Ancho de la tabla (deja espacio para la firma a la derecha)
  const acreditadaWidth = tableWidth / 2;
  const vigenteWidth = tableWidth / 2;
  const headerHeight = 8;
  const contentHeight = 12;

  // FILA 1: HEADERS - ACREDITADA | VIGENTE
  // Celda ACREDITADA
  doc.setFillColor(100, 180, 220);
  doc.setTextColor(255, 255, 255);
  doc.rect(tableStartX, tableStartY, acreditadaWidth, headerHeight, "F");
  doc.setFontSize(10);
  doc.text("ACREDITADA", tableStartX + 3, tableStartY + 6);

  // FILA 2: ESPACIOS EN BLANCO (debajo de ACREDITADA y VIGENTE)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.setTextColor(0, 0, 0);

  // Espacio debajo ACREDITADA
  doc.rect(
    tableStartX,
    tableStartY + headerHeight,
    acreditadaWidth,
    contentHeight,
  );

  // 📝 FIRMA DE ENCARGADO (a la derecha de la tabla)
  const firmaX = tableStartX + tableWidth + 8; // Espacio a la derecha de la tabla
  const firmaWidth = contentWidth - tableWidth - 8;

  // Línea para firma
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(
    firmaX,
    tableStartY + headerHeight + 8,
    firmaX + firmaWidth,
    tableStartY + headerHeight + 8,
  );

  doc.setFontSize(7);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Firma de Encargado de Casa comunales", firmaX, tableStartY + 3);

  return doc;
}

/**
 * Descargar PDF de casa comunal
 */
export async function downloadCasaComunalPDF(casa) {
  const doc = await generateCasaComunalPDF(casa);
  doc.save(`Casa-Comunal-${casa.nombre.replace(/\s+/g, "-")}.pdf`);
}
