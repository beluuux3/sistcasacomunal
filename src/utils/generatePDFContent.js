/**
 * Genera el contenido HTML del PDF para inscripción de participantes
 * Formato: Ficha UMAM estilo Casas Comunales
 */
export function getPDFContent(participante, numeroRegistro = 1, casaInfo = {}) {
  const edad = participante.fecha_nacimiento
    ? new Date().getFullYear() -
      new Date(participante.fecha_nacimiento).getFullYear()
    : "-";

  const generoDes =
    participante.genero === "M"
      ? "Masculino"
      : participante.genero === "F"
        ? "Femenino"
        : participante.genero || "-";

  // Extraer datos médicos si vienen como array (desde la API)
  const datosMedicos = participante.datos_medicos?.[0] || {};

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; background: white; }
    .page { width: 21cm; height: 29.7cm; padding: 10mm; margin: 0 auto; background: white; position: relative; }
    
    .header { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      border-bottom: 4px solid #17a2b8;
      padding-bottom: 6px;
      margin-bottom: 6px;
    }
    
    .header-logo { 
      flex: 1; 
      text-align: center; 
    }
    
    .header-logo h1 { 
      font-size: 24px; 
      color: #17a2b8;
      font-weight: bold;
      margin: 0;
      letter-spacing: 1px;
    }
    
    .header-logo p { 
      font-size: 10px; 
      color: #555; 
      margin: 1px 0 0 0;
      font-weight: 500;
    }
    
    .header-info { 
      text-align: right; 
      font-size: 12px; 
    }
    
    .header-info p { 
      margin: 3px 0; 
      color: #333;
      line-height: 1.4;
    }
    
    .registro-num { 
      font-size: 20px; 
      font-weight: bold; 
      color: #17a2b8;
    }

    .casa-section {
      background: linear-gradient(135deg, #e8f4f8 0%, #d4ecf6 100%);
      border-left: 5px solid #17a2b8;
      padding: 5px 8px;
      margin: 4px 0;
      border-radius: 3px;
    }

    .casa-label {
      font-size: 9px;
      font-weight: bold;
      color: #17a2b8;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .casa-value {
      font-size: 14px;
      font-weight: bold;
      color: #17a2b8;
      margin-top: 2px;
    }
    
    .section-header {
      background: linear-gradient(90deg, #17a2b8 0%, #1691a8 100%);
      color: white;
      padding: 4px 8px;
      margin: 3px 0 2px 0;
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 2px;
    }
    
    .section-content {
      padding: 1px 4px;
    }
    
    .row {
      display: flex;
      gap: 8px;
      margin-bottom: 3px;
    }
    
    .col {
      flex: 1;
    }
    
    .col.full {
      flex: 1 0 100%;
    }
    
    .field {
      margin-bottom: 2px;
    }
    
    .field-label {
      font-size: 9px;
      font-weight: bold;
      color: #17a2b8;
      text-transform: uppercase;
      letter-spacing: 0.1px;
    }
    
    .field-value {
      font-size: 13px;
      color: #000;
      margin-top: 1px;
      padding: 2px 0;
      border-bottom: 1px solid #ccc;
      min-height: 15px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 2px;
    }
    
    table th {
      background: #e8f4f8;
      color: #17a2b8;
      padding: 3px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid #17a2b8;
      font-size: 8px;
    }
    
    table td {
      padding: 2px 3px;
      border-bottom: 1px solid #ddd;
      font-size: 10px;
      color: #000;
    }
    
    table tr:nth-child(even) {
      background: #fafafa;
    }
    
    .signature-section {
      display: flex;
      justify-content: space-around;
      margin-top: 50px;
      padding-top: 50px;
    }
    
    .signature-box {
      text-align: center;
      flex: 1;
    }
    
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 8px;
      padding-top: 2px;
      font-size: 9px;
      color: #000;
    }
    
    .footer {
      text-align: center;
      font-size: 7px;
      color: #888;
      margin-top: 4px;
      padding-top: 3px;
      border-top: 1px solid #ddd;
    }
    
    .label-inline {
      display: inline; font-weight: bold; color: #17a2b8;
    }
  </style>
</head>
<body>
<div class="page">
  <!-- HEADER -->
  <div class="header">
    <div style="width: 80px; height: 70px; margin-right: 10px; display: flex; align-items: center; justify-content: center;">
      <img src="/LOGOCASACOMUNAL.jpeg" alt="Logo Casa Comunal" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <div class="header-logo">
      <h1>CASAS COMUNALES</h1>
      <p>Ficha de Inscripción de Participante</p>
    </div>
    <div class="header-info">
      <p class="registro-num">Reg. #${numeroRegistro}</p>
      <p><span class="label-inline">Fecha:</span> ${new Date().toLocaleDateString("es-ES")}</p>
    </div>
  </div>

  <!-- CASA COMUNAL ASIGNADA -->
  <div class="casa-section">
    <div class="casa-label">Casa Comunal Asignada</div>
    <div class="casa-value">${casaInfo.nombre || "No Asignada"}</div>
  </div>

  <!-- DATOS DE REGISTRO -->
  <div class="section-header">Datos de Registro</div>
  <div class="section-content">
    <div class="row">
      <div class="col">
        <div class="field">
          <div class="field-label">Nº de Registro</div>
          <div class="field-value">${numeroRegistro}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Fecha de Inscripción</div>
          <div class="field-value">${participante.created_at ? new Date(participante.created_at).toLocaleDateString("es-ES") : "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">CI</div>
          <div class="field-value">${participante.ci || "-"}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- DATOS PERSONALES -->
  <div class="section-header">Datos Personales</div>
  <div class="section-content">
    <!-- FILA 1: NOMBRE, APELLIDO PATERNO, APELLIDO MATERNO -->
    <div class="row">
      <div class="col">
        <div class="field">
          <div class="field-label">Nombres</div>
          <div class="field-value">${participante.nombres || "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Apellido Paterno</div>
          <div class="field-value">${participante.apellido_paterno || "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Apellido Materno</div>
          <div class="field-value">${participante.apellido_materno || "-"}</div>
        </div>
      </div>
    </div>
    
    <!-- FILA 2: FECHA NACIMIENTO, EDAD, GENERO -->
    <div class="row">
      <div class="col">
        <div class="field">
          <div class="field-label">Fecha de Nacimiento</div>
          <div class="field-value">${participante.fecha_nacimiento || "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Edad</div>
          <div class="field-value">${edad}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Género</div>
          <div class="field-value">${generoDes}</div>
        </div>
      </div>
    </div>
    
    <!-- FILA 3: LUGAR NACIMIENTO, ESTADO CIVIL, TELÉFONO -->
    <div class="row">
      <div class="col">
        <div class="field">
          <div class="field-label">Lugar de Nacimiento</div>
          <div class="field-value">${participante.lugar_nacimiento || "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Estado Civil</div>
          <div class="field-value">${participante.estado_civil || "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Teléfono</div>
          <div class="field-value">${participante.telefono || "-"}</div>
        </div>
      </div>
    </div>
    
    <!-- FILA 4: MACRODISTRITO, DIRECCIÓN -->
    <div class="row">
      <div class="col">
        <div class="field">
          <div class="field-label">Macrodistrito</div>
          <div class="field-value">${participante.macrodistrito || "-"}</div>
        </div>
      </div>
      <div class="col full">
        <div class="field">
          <div class="field-label">Dirección</div>
          <div class="field-value">${participante.direccion || "-"}</div>
        </div>
      </div>
    </div>
    
    <!-- FILA 5: COMO SE ENTERO, CONTACTO EMERGENCIA -->
    <div class="row">
      <div class="col">
        <div class="field">
          <div class="field-label">¿Cómo se Enteró?</div>
          <div class="field-value">${participante.como_se_entero || "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Contacto de Emergencia</div>
          <div class="field-value">${participante.contacto_emergencia || "-"}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- DATOS ACADÉMICOS -->
  <div class="section-header">Datos Académicos</div>
  <div class="section-content">
    <div class="row">
      <div class="col">
        <div class="field">
          <div class="field-label">Grado de Instrucción</div>
          <div class="field-value">${participante.grado_instruccion || "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Último Cargo</div>
          <div class="field-value">${participante.ultimo_cargo || "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Años de Servicio</div>
          <div class="field-value">${participante.anios_servicio || "-"}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- DATOS MÉDICOS -->
  <div class="section-header">Datos Médicos</div>
  <div class="section-content">
    <div class="row">
      <div class="col">
        <div class="field">
          <div class="field-label">Sistema de Salud</div>
          <div class="field-value">${datosMedicos.sistema_salud || participante.sistema_salud || "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Enfermedad de Base</div>
          <div class="field-value">${datosMedicos.enfermedad_base || participante.enfermedad_base || "-"}</div>
        </div>
      </div>
      <div class="col">
        <div class="field">
          <div class="field-label">Tratamiento Específico</div>
          <div class="field-value">${datosMedicos.tratamiento_especifico || participante.tratamiento_especifico || "-"}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- DATOS FAMILIARES -->
  ${
    participante.familia && participante.familia.length > 0
      ? `
  <div class="section-header">Datos Familiares</div>
  <div class="section-content">
    <table>
      <thead>
        <tr>
          <th>Apellidos</th>
          <th>Nombres</th>
          <th>Parentesco</th>
          <th>Teléfono</th>
          <th>Dirección</th>
        </tr>
      </thead>
      <tbody>
        ${participante.familia
          .map(
            (f) => `
          <tr>
            <td>${((f.apellido_paterno || "") + " " + (f.apellido_materno || "")).trim() || "-"}</td>
            <td>${f.nombres || "-"}</td>
            <td>${f.parentesco || "-"}</td>
            <td>${f.telefono || "-"}</td>
            <td>${f.direccion || "-"}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>
  `
      : ""
  }

  <!-- FIRMAS -->
  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line">
        <p style="margin: 0; font-size: 9px; font-weight: 600; color: #000;">Firma del Participante</p>
      </div>
    </div>
    <div class="signature-box">
      <div class="signature-line">
        <p style="margin: 0; font-size: 9px; font-weight: 600; color: #000;">Firma del Responsable</p>
      </div>
    </div>
  
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>Documento generado el ${new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })} | Sistema de Gestión de Casas Comunales</p>
  </div>
</div>
</body>
</html>`;
}
