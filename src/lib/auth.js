import api from "./api";

/**
 * Realizar login
 * @param {string} username
 * @param {string} contraseña
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export const loginRequest = async (username, contraseña) => {
  const response = await api.post("/auth/login", {
    username,
    contraseña,
  });
  return response.data;
};

/**
 * Obtener usuario actual
 * @returns {Promise<import('./types').Usuario>}
 */
export const getMeRequest = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

/**
 * Listar usuarios
 * @returns {Promise<import('./types').Usuario[]>}
 */
export const listUsersRequest = async () => {
  const response = await api.get("/users");
  return response.data;
};

/**
 * Crear usuario
 * @param {Object} data
 * @returns {Promise<import('./types').Usuario>}
 */
export const createUserRequest = async (data) => {
  const response = await api.post("/users", data);
  return response.data;
};

/**
 * Actualizar usuario
 * @param {number} userId
 * @param {Object} data
 * @returns {Promise<import('./types').Usuario>}
 */
export const updateUserRequest = async (userId, data) => {
  const response = await api.put(`/users/${userId}`, data);
  return response.data;
};

/**
 * Desactivar usuario
 * @param {number} userId
 * @returns {Promise<import('./types').Usuario>}
 */
export const deactivateUserRequest = async (userId) => {
  const response = await api.patch(`/users/${userId}/desactivar`);
  return response.data;
};

// ============== CASAS COMUNALES ==============

/**
 * Listar casas comunales
 * @param {string} [macrodistrito] - Filtrar por macrodistrito
 * @returns {Promise<import('./types').CasaComunal[]>}
 */
export const listCasasRequest = async (macrodistrito = null) => {
  const response = await api.get("/casas", {
    params: { macrodistrito },
  });
  return response.data;
};

/**
 * Crear casa comunal
 * @param {Object} data
 * @returns {Promise<import('./types').CasaComunal>}
 */
export const createCasaRequest = async (data) => {
  const response = await api.post("/casas", data);
  return response.data;
};

/**
 * Obtener detalle de casa
 * @param {number} casaId
 * @returns {Promise<import('./types').CasaComunal>}
 */
export const getCasaRequest = async (casaId) => {
  const response = await api.get(`/casas/${casaId}`);
  return response.data;
};

/**
 * Actualizar casa
 * @param {number} casaId
 * @param {Object} data
 * @returns {Promise<import('./types').CasaComunal>}
 */
export const updateCasaRequest = async (casaId, data) => {
  const response = await api.put(`/casas/${casaId}`, data);
  return response.data;
};

/**
 * Obtener horarios de una casa
 * @param {number} casaId
 * @returns {Promise<import('./types').HorarioGrilla[]>}
 */
export const getCasaHorariosRequest = async (casaId) => {
  const response = await api.get(`/casas/${casaId}/horarios`);
  return response.data;
};

// ============== TALLERES ==============

/**
 * Listar talleres
 * @returns {Promise<import('./types').Taller[]>}
 */
export const listTalleresRequest = async () => {
  const response = await api.get("/talleres");
  return response.data;
};

/**
 * Crear taller
 * @param {Object} data
 * @returns {Promise<import('./types').Taller>}
 */
export const createTallerRequest = async (data) => {
  const response = await api.post("/talleres", data);
  return response.data;
};

/**
 * Obtener detalle de taller
 * @param {number} tallerId
 * @returns {Promise<import('./types').Taller>}
 */
export const getTallerRequest = async (tallerId) => {
  const response = await api.get(`/talleres/${tallerId}`);
  return response.data;
};

/**
 * Actualizar taller
 * @param {number} tallerId
 * @param {Object} data
 * @returns {Promise<import('./types').Taller>}
 */
export const updateTallerRequest = async (tallerId, data) => {
  const response = await api.put(`/talleres/${tallerId}`, data);
  return response.data;
};

/**
 * Desactivar taller
 * @param {number} tallerId
 * @returns {Promise<import('./types').Taller>}
 */
export const deactivateTallerRequest = async (tallerId) => {
  const response = await api.patch(`/talleres/${tallerId}/desactivar`);
  return response.data;
};

/**
 * Obtener participantes de un taller
 * @param {number} tallerId
 * @returns {Promise<import('./types').Participante[]>}
 */
export const getTallerParticipantesRequest = async (tallerId) => {
  const response = await api.get(`/talleres/${tallerId}/participantes`);
  return response.data;
};

// ============== PARTICIPANTES ==============

/**
 * Listar participantes
 * @param {number} [skip] - Offset para paginación
 * @param {number} [limit] - Límite de resultados
 * @param {string} [nombre] - Filtrar por nombre
 * @param {number} [casa_id] - Filtrar por casa
 * @returns {Promise<import('./types').Participante[]>}
 */
export const listParticipantesRequest = async (
  skip = 0,
  limit = 20,
  nombre = null,
  casa_id = null,
) => {
  const response = await api.get("/participantes", {
    params: { skip, limit, nombre, casa_id },
  });
  return response.data;
};

/**
 * Crear participante
 * @param {Object} data
 * @returns {Promise<import('./types').Participante>}
 */
export const createParticipanteRequest = async (data) => {
  const response = await api.post("/participantes", data);
  return response.data;
};

/**
 * Obtener participante por CI
 * @param {string} ci
 * @returns {Promise<import('./types').Participante>}
 */
export const getParticipanteByCiRequest = async (ci) => {
  const response = await api.get(`/participantes/ci/${ci}`);
  return response.data;
};

/**
 * Obtener detalle de participante
 * @param {number} participanteId
 * @returns {Promise<import('./types').Participante>}
 */
export const getParticipanteRequest = async (participanteId) => {
  const response = await api.get(`/participantes/${participanteId}`);
  return response.data;
};

/**
 * Actualizar participante
 * @param {number} participanteId
 * @param {Object} data
 * @returns {Promise<import('./types').Participante>}
 */
export const updateParticipanteRequest = async (participanteId, data) => {
  const response = await api.put(`/participantes/${participanteId}`, data);
  return response.data;
};

/**
 * Subir documento CI de participante
 * @param {number} participanteId
 * @param {File} archivo
 * @returns {Promise<import('./types').Participante>}
 */
export const uploadParticipanteDocumentoRequest = async (
  participanteId,
  archivo,
) => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  const response = await api.post(
    `/participantes/${participanteId}/documento-ci`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// ============== INSCRIPCIONES ==============

/**
 * Inscribir participante a taller
 * @param {number} tallerId
 * @param {number} participanteId
 * @returns {Promise<{id: number, taller_id: number, participante_id: number}>}
 */
export const inscribirParticipanteRequest = async (
  tallerId,
  participanteId,
) => {
  const response = await api.post("/talleres/inscribir", {
    taller_id: tallerId,
    participante_id: participanteId,
  });
  return response.data;
};

/**
 * Desinscribir participante de taller
 * @param {number} inscripcionId
 * @returns {Promise<void>}
 */
export const desinscribirParticipanteRequest = async (inscripcionId) => {
  const response = await api.delete(`/talleres/inscribir/${inscripcionId}`);
  return response.data;
};

// ============== HORARIOS ==============

/**
 * Obtener grilla de horarios (vista semanal)
 * @param {number} [dia_semana] - 1=Lunes, 5=Viernes
 * @param {string} [macrodistrito] - Filtrar por macrodistrito
 * @returns {Promise<import('./types').HorarioGrilla[]>}
 */
/**
 * Obtener grilla de horarios con filtros opcionales
 * @param {number|null} dia_semana - 1-7 para días de la semana
 * @param {string|null} macrodistrito - Filtro de zona/macrodistrito
 * @param {number|null} gestion_id - ID de la gestión (trimestre)
 * @returns {Promise<Array>} Lista de horarios
 */
export const getGrillaHorariosRequest = async (
  dia_semana = null,
  macrodistrito = null,
  gestion_id = null,
) => {
  const response = await api.get("/horarios", {
    params: { dia_semana, macrodistrito, gestion_id },
  });
  return response.data;
};

/**
 * Crear horario
 * @param {Object} data
 * @returns {Promise<{id: number}>}
 */
export const createHorarioRequest = async (data) => {
  const { casa_comunal_id, ...horarioData } = data;
  const response = await api.post(
    `/casas/${casa_comunal_id}/horarios`,
    horarioData,
  );
  return response.data;
};

/**
 * Eliminar horario
 * @param {number} horarioId
 * @returns {Promise<void>}
 */
export const deleteHorarioRequest = async (horarioId) => {
  await api.delete(`/horarios/${horarioId}`);
};

// ============== ASISTENCIA ==============

/**
 * Registrar asistencia
 * @param {number} tallerId
 * @param {string} fecha - Formato YYYY-MM-DD
 * @param {Array<{participante_id: number, presente: boolean}>} registros
 * @returns {Promise<void>}
 */
export const registrarAsistenciaRequest = async (
  tallerId,
  fecha,
  registros,
) => {
  const response = await api.post("/control/asistencia", {
    taller_id: tallerId,
    fecha,
    registros,
  });
  return response.data;
};

/**
 * Obtener historial de asistencia de un taller
 * @param {number} tallerId
 * @param {string} [fecha] - Filtrar por fecha específica (YYYY-MM-DD)
 * @returns {Promise<Array>}
 */
export const getHistorialAsistenciaRequest = async (tallerId, fecha = null) => {
  const response = await api.get(`/control/asistencia/${tallerId}`, {
    params: { fecha },
  });
  return response.data;
};

/**
 * Registrar asistencia a actividad
 * @param {number} actividadId
 * @param {number[]} participanteIds
 * @param {string} fecha - Formato YYYY-MM-DD
 * @returns {Promise<void>}
 */
export const registrarAsistenciaActividadRequest = async (
  actividadId,
  participanteIds,
  fecha,
) => {
  const response = await api.post("/actividades/asistencia", {
    actividad_id: actividadId,
    participante_ids: participanteIds,
    fecha,
  });
  return response.data;
};

// ============== EVALUACIONES ==============

/**
 * Cargar evaluación
 * @param {number} participanteId
 * @param {number} tallerId
 * @param {number|string} [nota_1]
 * @param {number|string} [nota_2]
 * @param {string} [observaciones]
 * @returns {Promise<{id: number}>}
 */
export const cargarEvaluacionRequest = async (
  participanteId,
  tallerId,
  nota_1 = null,
  nota_2 = null,
  observaciones = null,
) => {
  const response = await api.put("/control/evaluaciones", {
    participante_id: participanteId,
    taller_id: tallerId,
    nota_1,
    nota_2,
    observaciones,
  });
  return response.data;
};

/**
 * Obtener evaluaciones de un taller
 * @param {number} tallerId
 * @returns {Promise<Array>}
 */
export const getEvaluacionesTallerRequest = async (tallerId) => {
  const response = await api.get(`/control/evaluaciones/taller/${tallerId}`);
  return response.data;
};

/**
 * Obtener evaluaciones de un participante
 * @param {number} participanteId
 * @returns {Promise<Array>}
 */
export const getEvaluacionesParticipanteRequest = async (participanteId) => {
  const response = await api.get(
    `/control/evaluaciones/participante/${participanteId}`,
  );
  return response.data;
};

// ============== ACTIVIDADES ==============

/**
 * Crear actividad
 * @param {Object} data
 * @returns {Promise<{id: number}>}
 */
export const createActividadRequest = async (data) => {
  const response = await api.post("/actividades", data);
  return response.data;
};

// ============== REPORTES ==============

/**
 * Obtener estadísticas del dashboard
 * @returns {Promise<Object>}
 */
export const getEstadisticasRequest = async () => {
  const response = await api.get("/reportes/estadisticas");
  return response.data;
};

/**
 * Obtener reporte de asistencia de participante
 * @param {number} participanteId
 * @param {number} [tallerId] - Filtrar por taller
 * @returns {Promise<Object>}
 */
export const getReporteAsistenciaParticipanteRequest = async (
  participanteId,
  tallerId = null,
) => {
  const response = await api.get(
    `/reportes/asistencia-participante/${participanteId}`,
    {
      params: { taller_id: tallerId },
    },
  );
  return response.data;
};

/**
 * Obtener reporte de asistencia de casa
 * @param {number} casaId
 * @param {number} [tallerId] - Filtrar por taller
 * @returns {Promise<Object>}
 */
export const getReporteAsistenciaCasaRequest = async (
  casaId,
  tallerId = null,
) => {
  const response = await api.get(`/reportes/asistencia-casa/${casaId}`, {
    params: { taller_id: tallerId },
  });
  return response.data;
};

/**
 * Obtener reporte de evaluaciones de taller
 * @param {number} tallerId
 * @returns {Promise<Object>}
 */
export const getReporteEvaluacionesTallerRequest = async (tallerId) => {
  const response = await api.get(`/reportes/evaluaciones/${tallerId}`);
  return response.data;
};

/**
 * Obtener reporte de actividad
 * @param {number} actividadId
 * @returns {Promise<Object>}
 */
export const getReporteActividadRequest = async (actividadId) => {
  const response = await api.get(`/reportes/actividades/${actividadId}`);
  return response.data;
};

/**


// ============== FACILITADORES ==============

/**
 * Check-in de facilitador (con foto y ubicación)
 * @param {number} latitud
 * @param {number} longitud
 * @param {File} foto
 * @returns {Promise<Object>}
 */
export const checkInFacilitadorRequest = async (latitud, longitud, foto) => {
  const formData = new FormData();
  formData.append("latitud", latitud);
  formData.append("longitud", longitud);
  formData.append("foto", foto);
  const response = await api.post("/facilitadores/check-in", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Check-out de facilitador (con foto)
 * @param {number} controlId - ID del registro de check-in
 * @param {File} foto
 * @returns {Promise<Object>}
 */
export const checkOutFacilitadorRequest = async (controlId, foto) => {
  const formData = new FormData();
  formData.append("control_id", controlId);
  formData.append("foto", foto);
  const response = await api.post("/facilitadores/check-out", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Listar registros de control de facilitadores (check-in/check-out)
 * @param {number} [facilitadorId] - Filtrar por facilitador (admin solo)
 * @param {string} [fecha] - Filtrar por fecha (YYYY-MM-DD)
 * @param {boolean} [validado] - Filtrar por estado de validación
 * @returns {Promise<Array>}
 */
export const listarControlesFacilitadorRequest = async (
  facilitadorId = null,
  fecha = null,
  validado = null,
) => {
  const response = await api.get("/facilitadores/control", {
    params: { facilitador_id: facilitadorId, fecha, validado },
  });
  return response.data;
};

/**
 * Validar/rechazar registro de control de facilitador
 * @param {number} controlId
 * @param {boolean} validado
 * @param {string} [observaciones]
 * @returns {Promise<Object>}
 */
export const validarControlFacilitadorRequest = async (
  controlId,
  validado,
  observaciones = null,
) => {
  const response = await api.patch(
    `/facilitadores/control/${controlId}/validar`,
    {
      validado,
      observaciones,
    },
  );
  return response.data;
};

/**
 * Listar documentos de facilitador
 * @param {number} [facilitadorId] - Filtrar por facilitador
 * @returns {Promise<Array>}
 */
export const listarDocumentosFacilitadorRequest = async (
  facilitadorId = null,
) => {
  const response = await api.get("/facilitadores/documentos", {
    params: { facilitador_id: facilitadorId },
  });
  return response.data;
};

/**
 * Subir documento de facilitador
 * @param {string} tipoDocumento - Tipo de documento
 * @param {File} archivo
 * @returns {Promise<Object>}
 */
export const subirDocumentoFacilitadorRequest = async (
  tipoDocumento,
  archivo,
) => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  const response = await api.post("/facilitadores/documentos", formData, {
    params: { tipo_documento: tipoDocumento },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Actualizar estado de documento de facilitador
 * @param {number} docId
 * @param {string} estado - estado del documento
 * @param {string} [observaciones]
 * @returns {Promise<Object>}
 */
export const actualizarEstadoDocumentoRequest = async (
  docId,
  estado,
  observaciones = null,
) => {
  const response = await api.patch(`/facilitadores/documentos/${docId}`, {
    estado,
    observaciones,
  });
  return response.data;
};

// ============== GESTIONES ==============

/**
 * Listar todas las gestiones
 * @returns {Promise<Array>}
 */
export const listGestionesRequest = async () => {
  const response = await api.get("/gestiones");
  return response.data;
};

/**
 * Obtener la gestión activa (del listado completo)
 * @returns {Promise<Object|null>}
 */
export const getGestionActivaRequest = async () => {
  try {
    // Obtener todas las gestiones y filtrar la activa
    const response = await api.get("/gestiones");
    const gestiones = Array.isArray(response.data) ? response.data : [];
    const gestionActiva = gestiones.find((g) => g.activo === true);
    return gestionActiva || null;
  } catch (err) {
    // Si hay error, retorna null
    return null;
  }
};

/**
 * Crear una nueva gestión
 * @param {number} anio
 * @param {number} trimestre - 1, 2, 3 o 4
 * @param {string} [fechaInicio] - YYYY-MM-DD
 * @param {string} [fechaFin] - YYYY-MM-DD
 * @returns {Promise<Object>}
 */
export const createGestionRequest = async (
  anio,
  trimestre,
  fechaInicio = null,
  fechaFin = null,
) => {
  const response = await api.post("/gestiones", {
    anio,
    trimestre,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  });
  return response.data;
};

/**
 * Activar una gestión
 * @param {number} gestionId
 * @returns {Promise<Object>}
 */
export const activarGestionRequest = async (gestionId) => {
  const response = await api.patch(`/gestiones/${gestionId}/activar`);
  return response.data;
};

/**
 * Obtener casas asociadas a una gestión
 * @param {number} gestionId
 * @returns {Promise<Array>}
 */
export const getGestionCasasRequest = async (gestionId) => {
  const response = await api.get(`/gestiones/${gestionId}/casas`);
  return response.data;
};

/**
 * Agregar casa a una gestión
 * @param {number} gestionId
 * @param {number} casaId
 * @returns {Promise<Object>}
 */
export const addCasaToGestionRequest = async (gestionId, casaId) => {
  const response = await api.post(`/gestiones/${gestionId}/casas/${casaId}`);
  return response.data;
};

/**
 * Remover casa de una gestión
 * @param {number} gestionId
 * @param {number} casaId
 * @returns {Promise<void>}
 */
export const removeCasaFromGestionRequest = async (gestionId, casaId) => {
  await api.delete(`/gestiones/${gestionId}/casas/${casaId}`);
};

// ============== ACTIVIDADES ==============

/**
 * Listar actividades (filtrable por es_global y gestion_id)
 * @param {boolean} [esGlobal] - Filtrar por tipo
 * @param {number} [gestionId] - Filtrar por gestión
 * @returns {Promise<Array>}
 */
export const listActividadesRequest = async (
  esGlobal = null,
  gestionId = null,
) => {
  const response = await api.get("/actividades", {
    params: { es_global: esGlobal, gestion_id: gestionId },
  });
  return response.data;
};

/**
 * Crear actividad
 * @param {string} nombre
 * @param {string} fecha - YYYY-MM-DD
 * @param {string} [descripcion]
 * @param {boolean} [esGlobal=false]
 * @param {number} [facilitadorResponsableId]
 * @param {number} [gestionId]
 * @param {number[]} [casaIds] - Si es específica, lista de casas
 * @returns {Promise<Object>}
 */
export const createActividadFullRequest = async (data) => {
  const response = await api.post("/actividades", data);
  return response.data;
};

/**
 * Registrar asistencia a actividad
 * @param {number} actividadId
 * @param {number[]} participanteIds
 * @param {string} fecha - YYYY-MM-DD
 * @returns {Promise<void>}
 */
export const registrarAsistenciaActividadFullRequest = async (
  actividadId,
  participanteIds,
  fecha,
) => {
  const response = await api.post("/actividades/asistencia", {
    actividad_id: actividadId,
    participante_ids: participanteIds,
    fecha,
  });
  return response.data;
};

// ============== REPORTES (Adicionales) ==============

/**
 * Obtener reporte de evaluaciones de taller
 * @param {number} tallerId
 * @returns {Promise<Object>}
 */
export const getReporteEvaluacionesRequest = async (tallerId) => {
  const response = await api.get(`/reportes/evaluaciones/${tallerId}`);
  return response.data;
};

/**
 * Verificar elegibilidad para certificado
 * @param {number} participanteId
 * @param {number} tallerId
 * @returns {Promise<Object>}
 */
export const verificarCertificadoRequest = async (participanteId, tallerId) => {
  const response = await api.get(`/reportes/certificados/${participanteId}`, {
    params: { taller_id: tallerId },
  });
  return response.data;
};
