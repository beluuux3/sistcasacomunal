/**
 * @typedef {Object} Usuario
 * @property {number} id
 * @property {string} nombre_completo
 * @property {string} email
 * @property {'Administrador' | 'Facilitador'} rol
 * @property {string} ci
 * @property {boolean} activo
 * @property {number} [casa_comunal_id]
 * @property {string} [telefono]
 * @property {string} created_at
 */

/**
 * @typedef {Object} CasaComunal
 * @property {number} id
 * @property {string} nombre
 * @property {string} direccion
 * @property {string} macrodistrito
 * @property {string} [representante_nombre]
 * @property {string} [representante_ci]
 * @property {string} [contacto_telefono]
 * @property {string} [latitud]
 * @property {string} [longitud]
 */

/**
 * @typedef {Object} Gestion
 * @property {number} id
 * @property {number} anio
 * @property {number} trimestre - 1, 2, 3 o 4
 * @property {string} nombre - "2026 - T1" generado por backend
 * @property {boolean} activo
 * @property {string} [fecha_inicio] - ISO date
 * @property {string} [fecha_fin] - ISO date
 */

/**
 * @typedef {Object} GestionCasa
 * @property {number} id
 * @property {string} nombre
 * @property {string} direccion
 * @property {string} macrodistrito
 */

/**
 * @typedef {Object} Taller
 * @property {number} id
 * @property {string} nombre
 * @property {string} [descripcion]
 * @property {number} [casa_comunal_id]
 * @property {number} [facilitador_id]
 * @property {number} [gestion_id]
 * @property {number} [gestion_anio]
 * @property {boolean} activo
 */

/**
 * @typedef {Object} Participante
 * @property {number} id
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string} ci
 * @property {string} [fecha_nacimiento]
 * @property {string} [genero]
 * @property {string} [telefono]
 * @property {string} [contacto_emergencia]
 * @property {string} [documento_ci_url]
 * @property {number} [casa_comunal_id]
 * @property {string} created_at
 */

/**
 * @typedef {Object} HorarioGrilla
 * @property {number} id
 * @property {number} dia_semana
 * @property {string} dia_nombre
 * @property {string} hora_inicio
 * @property {string} hora_fin
 * @property {number} [casa_id]
 * @property {string} [casa_nombre]
 * @property {string} [macrodistrito]
 * @property {number} [facilitador_id]
 * @property {string} [facilitador_nombre]
 * @property {number} [gestion_id]
 */

/**
 * @typedef {Object} Actividad
 * @property {number} id
 * @property {string} nombre
 * @property {string} [descripcion]
 * @property {string} fecha - ISO date
 * @property {boolean} es_global
 * @property {number} [facilitador_responsable_id]
 * @property {number} [gestion_id]
 */

/**
 * @typedef {Object} ControlFacilitador
 * @property {number} id
 * @property {number} facilitador_id
 * @property {string} [fecha]
 * @property {string} [hora_entrada]
 * @property {string} [hora_salida]
 * @property {string} [latitud_entrada]
 * @property {string} [longitud_entrada]
 * @property {string} [foto_entrada_url]
 * @property {string} [foto_salida_url]
 * @property {boolean} validado
 * @property {string} [observaciones]
 */

/**
 * @typedef {Object} Documento
 * @property {number} id
 * @property {number} facilitador_id
 * @property {string} [tipo_documento]
 * @property {string} url_archivo
 * @property {string} estado - "Pendiente" | "Aprobado" | "Observado"
 * @property {string} [observaciones]
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} username
 * @property {string} contraseña
 */

/**
 * @typedef {Object} Token
 * @property {string} access_token
 * @property {string} token_type
 */

/**
 * @typedef {Object} AuthContextType
 * @property {Usuario | null} usuario
 * @property {string | null} token
 * @property {boolean} isLoading
 * @property {string | null} error
 * @property {(username: string, password: string) => Promise<void>} login
 * @property {() => void} logout
 */

/**
 * @typedef {Object} GestionContextType
 * @property {Gestion | null} gestionActiva
 * @property {Gestion[]} gestiones
 * @property {(id: number) => void} cambiarGestion
 * @property {(id: number) => Promise<void>} activarGestion
 * @property {boolean} isLoading
 * @property {string | null} error
 */

export {};
