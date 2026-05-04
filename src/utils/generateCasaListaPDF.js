import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Función para cargar el logo y convertirlo a Base64
async function getLogoAsBase64() {
  try {
    const response = await fetch("/LOGOCASACOMUNAL.jpeg");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // El resultado es una URL de datos que contiene la imagen en Base64
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading logo for PDF:", error);
    return null; // Retorna null si no se puede cargar el logo
  }
}

export const generateCasaListaPDF = async (casa, tallerInfo, participantes) => {
  const logoBase64 = await getLogoAsBase64();
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // 🎨 HEADER similar a generateCasaComunalPDF
  if (logoBase64) {
    doc.addImage(logoBase64, "JPEG", margin, yPosition - 2, 25, 20);
  }

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 140, 180);
  doc.text("CASA COMUNAL", margin + 30, yPosition + 5);

  doc.setFontSize(14);
  doc.setFont(undefined, "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Lista de Participantes", margin + 30, yPosition + 12);

  yPosition += 20;

  // Línea separadora
  doc.setDrawColor(0, 140, 180);
  doc.setLineWidth(1.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;


  // Información de la Casa y Taller
  doc.setFontSize(11);
  doc.setTextColor(52, 73, 94); // Un color de texto grisáceo
  doc.setFont("helvetica", "normal");
  doc.text(`Casa Comunal: ${casa?.nombre || "No especificada"}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Taller: ${tallerInfo?.tallerNombre || "No asignado"}`, margin, yPosition);
  yPosition += 7;
  doc.text(
    `Facilitador: ${tallerInfo?.facilitadorNombre || "No asignado"}`,
    margin,
    yPosition,
  );
  yPosition += 7;
  doc.text(`Horario: ${tallerInfo?.horario || "No definido"}`, margin, yPosition);
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
      fillColor: [23, 43, 77], // Azul oscuro para la cabecera de la tabla
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 10 }, // Nro
      4: { cellWidth: 25 }, // CI
      5: { cellWidth: 25 }, // Celular
    },
  });

  // Pie de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  // Guardar el PDF
  doc.save(`Lista_Participantes_${casa?.nombre.replace(/ /g, "_")}.pdf`);
};
