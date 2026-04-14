import { jsPDF } from "jspdf";

// 🔥 MULTILINE TEXT (CLAVE)
function drawMultilineText(doc, text, x, y, maxWidth, lineHeight = 3.5) {
  const lines = doc.splitTextToSize(text || "-", maxWidth);
  lines.forEach((line, i) => {
    doc.text(line, x, y + i * lineHeight);
  });
  return lines.length * lineHeight;
}

/**
 * 📄 GENERADOR PDF SEMANAL PRO
 */
export function generateHorarioSemanalPDF(horarios, gestion) {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const diasNumeros = [1, 2, 3, 4, 5];

  // Agrupar horarios
  const horariosPorDia = {};
  diasNumeros.forEach((diaNum) => {
    const list = horarios
      .filter(
        (h) => h.dia_semana === diaNum || h.dia_semana === dias[diaNum - 1],
      )
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

    horariosPorDia[diaNum] = list;
  });

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // 🧠 DIMENSIONES
  const pageWidth = 297;
  const columnWidth = 50;
  const tableWidth = columnWidth * 5;
  const tableX = (pageWidth - tableWidth) / 2;
  const tableY = 28;

  const headerHeight = 12;
  const cellHeight = 30;

  let cellY = tableY;

  // 🟦 HEADER PRINCIPAL
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Horario Semanal de Casas Comunales", 148, 15, {
    align: "center",
  });

  if (gestion) {
    doc.setFontSize(12);
    doc.setTextColor(90, 90, 90);
    doc.text(`Año ${gestion.anio} - Trimestre ${gestion.trimestre}`, 148, 22, {
      align: "center",
    });
  }

  // 🔷 HEADER DE DÍAS
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");

  dias.forEach((dia, i) => {
    const x = tableX + i * columnWidth;

    doc.setFillColor(37, 99, 235);
    doc.rect(x, cellY, columnWidth, headerHeight, "F");

    doc.setTextColor(255, 255, 255);
    doc.text(dia.toUpperCase(), x + columnWidth / 2, cellY + 7, {
      align: "center",
      baseline: "middle",
    });
  });

  cellY += headerHeight;

  // 🔢 MAX FILAS
  let maxFilas = Math.max(...diasNumeros.map((d) => horariosPorDia[d].length));

  // 🔲 FILAS
  for (let i = 0; i < maxFilas; i++) {
    if (cellY + cellHeight > 200) {
      doc.addPage();
      cellY = 15;
    }

    diasNumeros.forEach((diaNum, colIdx) => {
      const x = tableX + colIdx * columnWidth;
      const lista = horariosPorDia[diaNum];

      // 🎨 FONDO
      if (i < lista.length) {
        const h = lista[i];

        doc.setFillColor(255, 255, 255);
        doc.rect(x, cellY, columnWidth, cellHeight, "F");

        // ✏️ CONTENIDO
        let yOffset = cellY + 4;
        const pad = 3;
        const usable = columnWidth - pad * 2;

        // CASA
        doc.setFontSize(9.5);
        doc.setFont(undefined, "bold");
        doc.setTextColor(20, 30, 80);

        yOffset += drawMultilineText(
          doc,
          h.casa_nombre,
          x + pad,
          yOffset,
          usable,
        );

        // MACRO
        if (h.macrodistrito) {
          doc.setFontSize(8.5);
          doc.setTextColor(120, 70, 30);

          yOffset += drawMultilineText(
            doc,
            h.macrodistrito,
            x + pad,
            yOffset + 1,
            usable,
          );
        }

        // HORARIO
        doc.setFontSize(8.5);
        doc.setTextColor(37, 99, 235);

        yOffset += drawMultilineText(
          doc,
          `${h.hora_inicio} - ${h.hora_fin}`,
          x + pad,
          yOffset + 1,
          usable,
        );

        // TALLER
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);

        yOffset += drawMultilineText(
          doc,
          h.taller_nombre,
          x + pad,
          yOffset + 1,
          usable,
        );

        // FACILITADOR
        if (h.facilitador_nombre) {
          doc.setFontSize(7.5);
          doc.setTextColor(80, 80, 80);

          drawMultilineText(
            doc,
            h.facilitador_nombre,
            x + pad,
            yOffset + 1,
            usable,
          );
        }
      } else {
        doc.setFillColor(245, 245, 245);
        doc.rect(x, cellY, columnWidth, cellHeight, "F");
      }

      // 🧱 BORDE
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(x, cellY, columnWidth, cellHeight);
    });

    cellY += cellHeight;
  }

  return doc;
}

/**
 * 📄 GENERADOR PDF POR DÍA
 */
export function generateHorarioDiaPDF(horarios, gestion, casas, facilitadores) {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const diasNumeros = [1, 2, 3, 4, 5];

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 12;
  let y = 15;

  const formatHora = (h) => h?.slice(0, 5);

  // 🏛️ HEADER PRINCIPAL
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.setTextColor(33, 37, 41);
  doc.text("HORARIO POR DÍA", pageWidth / 2, y, { align: "center" });

  y += 6;

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100, 100, 100);

  dias.forEach((dia, idx) => {
    const lista = horarios
      .filter((h) => h.dia_semana === diasNumeros[idx] || h.dia_semana === dia)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

    // Nueva página
    if (y > 250 && idx > 0) {
      doc.addPage();
      y = 15;
    }

    // 🔷 BARRA DEL DÍA
    doc.setFillColor(52, 96, 220);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text(dia.toUpperCase(), pageWidth / 2, y + 5.5, {
      align: "center",
    });

    y += 10;

    if (lista.length === 0) {
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(10);
      doc.text("Sin horarios programados", margin, y);
      y += 8;
      return;
    }

    // 🧱 COLUMNAS
    const colWidths = [35, 28, 24, 32, 50, 18];
    const headers = [
      "Casa Comunal",
      "Macrodistrito",
      "Horario",
      "Taller",
      "Facilitador",
      "Cel.",
    ];

    const headerHeight = 9;

    let x = margin;

    // 🟦 HEADERS (AZUL OSCURO CON TEXTO BLANCO)
    doc.setFont(undefined, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255); // Texto blanco

    headers.forEach((h, i) => {
      // Establecer color de fondo para cada celda
      doc.setFillColor(30, 64, 175); // Azul oscuro
      doc.rect(x, y, colWidths[i], headerHeight, "F");

      // Establecer borde
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.3);
      doc.rect(x, y, colWidths[i], headerHeight);

      // Texto blanco
      doc.setTextColor(255, 255, 255);
      doc.text(h, x + colWidths[i] / 2, y + headerHeight / 2 + 0.5, {
        align: "center",
        baseline: "middle",
      });

      x += colWidths[i];
    });

    y += headerHeight;

    // 🔲 FILAS
    const rowHeight = 13;

    lista.forEach((h, rowIndex) => {
      if (y + rowHeight > 270) {
        doc.addPage();
        y = 15;
      }

      const facilitadorInfo = facilitadores?.find(
        (f) => f.id === h.facilitador_id,
      );

      const telefono = facilitadorInfo?.telefono
        ? facilitadorInfo.telefono.replace("+591", "")
        : "-";

      const data = [
        h.casa_nombre,
        h.macrodistrito || "-",
        `${formatHora(h.hora_inicio)} - ${formatHora(h.hora_fin)}`,
        h.taller_nombre,
        h.facilitador_nombre,
        telefono,
      ];

      let x = margin;

      // 🎨 FILAS ALTERNADAS
      const bg = rowIndex % 2 === 0 ? 255 : 248;

      data.forEach((txt, i) => {
        doc.setFillColor(bg, bg, bg);
        doc.rect(x, y, colWidths[i], rowHeight, "F");

        // Estilos
        if (i === 0) {
          doc.setFont(undefined, "bold");
          doc.setTextColor(40, 60, 120);
        } else if (i === 2 || i === 5) {
          doc.setFont(undefined, "bold");
          doc.setTextColor(52, 96, 220);
        } else {
          doc.setFont(undefined, "normal");
          doc.setTextColor(50, 50, 50);
        }

        // Texto multilinea
        const lines = doc.splitTextToSize(txt || "-", colWidths[i] - 2);

        lines.forEach((line, index) => {
          doc.text(line, x + 1.5, y + 4 + index * 3.2);
        });

        // Bordes
        doc.setDrawColor(220, 220, 220);
        doc.rect(x, y, colWidths[i], rowHeight);

        x += colWidths[i];
      });

      y += rowHeight;
    });

    y += 5;
  });

  return doc;
}
