# Configuración y Correcciones - Agregar Participantes

## Resumen de Problemas Corregidos

### 1. Error 422 - Validación de Datos

**Problema original:**

```
API Error 422: {}
```

**Causa raíz:**

- El formulario enviaba la estructura de datos en formato incorrecto
- Mismatch entre los nombres de campos enviados y esperados por la API
- Datos de familia y médicos no estaban en formato de array

### 2. Error de Renderización React

**Problema original:**

```
Objects are not valid as a React child (found: object with keys {type, loc, msg, input})
```

**Causa:**

- El error retornado por la API era un objeto o array de objetos
- Se pasaba directamente al componente Alert que espera un string

## Cambios Implementados

### Actualización: src/hooks/useParticipantes.js

**Mejora en manejo de errores de validación:**

```javascript
// Ahora maneja arrays de errores de validación
if (err.response?.data?.detail) {
  const detail = err.response.data.detail;
  if (Array.isArray(detail)) {
    errorMsg = detail.map((e) => e.msg || JSON.stringify(e)).join("; ");
  }
}
```

### Actualización: src/app/(dashboard)/participantes/page.js

#### 1. **Corrección de campos**

- ❌ `anos_servicio` → ✅ `anios_servicio`
- ➕ Añadidos: `telefono`, `contacto_emergencia`, `como_se_entero`, `familia_direccion`

#### 2. **Función de transformación de datos**

```javascript
transformFormDataForAPI(data) {
  // Transforma:
  // - apellido_paterno/materno → apellidos (combinado)
  // - familia_* fields → familia array
  // - sistema_salud/enfermedad_base/tratamiento → datos_medicos array
}
```

#### 3. **Integración en handleSubmit**

```javascript
const apiData = transformFormDataForAPI(formData);
await createParticipante(apiData);
```

## Estructura de Datos - Antes vs Después

### Antes (INCORRECTO):

```javascript
{
  apellido_paterno: "García",
  apellido_materno: "López",
  nombres: "Juan",
  ci: "1234567",
  telefono: "76123456",
  contacto_emergencia: "María García",
  como_se_entero: "Referencia",
  grado_instruccion: "Secundaria",
  ultimo_cargo: "Delegado",
  anos_servicio: "5",  // ❌ Typo
  familia_apellido_paterno: "García",
  familia_apellido_materno: "López",
  familia_nombres: "María",
  familia_parentesco: "Esposa",
  familia_telefono: "76654321",
  familia_direccion: "Calle 123",
  sistema_salud: "SUS",
  enfermedad_base: "Diabetes",
  tratamiento_especifico: "Insulina"
}
```

### Después (CORRECTO - Según esquema OpenAPI):

```javascript
{
  nombres: "Juan",
  apellidos: "García López",                    // ✅ Combinado
  apellido_paterno: "García",
  apellido_materno: "López",
  ci: "1234567",
  telefono: "76123456",
  contacto_emergencia: "María García",
  como_se_entero: "Referencia",
  grado_instruccion: "Secundaria",
  ultimo_cargo: "Delegado",
  anios_servicio: 5,                          // ✅ Correcto + entero
  casa_comunal_id: 1,
  familia: [                                   // ✅ Array de objetos
    {
      apellido_paterno: "García",
      apellido_materno: "López",
      nombres: "María",
      parentesco: "Esposa",
      telefono: "76654321",
      direccion: "Calle 123"
    }
  ],
  datos_medicos: [                            // ✅ Array de objetos
    {
      sistema_salud: "SUS",
      enfermedad_base: "Diabetes",
      tratamiento_especifico: "Insulina"
    }
  ]
}
```

## Campos del Formulario

### Datos de Registro

- `casa_comunal_id` \* (requerido para Admin)

### Datos Personales

- `apellido_paterno` \*
- `apellido_materno` \*
- `nombres` \*
- `ci` \*
- `fecha_nacimiento`
- `genero`
- `lugar_nacimiento`
- `macrodistrito`
- `estado_civil`
- `direccion`
- `telefono` ✨ (nuevo)
- `contacto_emergencia` ✨ (nuevo)
- `como_se_entero` ✨ (nuevo)

### Datos Académicos

- `grado_instruccion`
- `ultimo_cargo`
- `anios_servicio` (corregido: era `anos_servicio`)

### Datos Familiares

- `familia_apellido_paterno`
- `familia_apellido_materno`
- `familia_nombres`
- `familia_parentesco`
- `familia_telefono`
- `familia_direccion` ✨ (nuevo)

### Datos Médicos

- `sistema_salud`
- `enfermedad_base`
- `tratamiento_especifico`

## Validación

Todos los campos están validados:

- Campos obligatorios: `apellido_paterno`, `apellido_materno`, `nombres`, `ci`
- Admin debe seleccionar una casa comunal
- Tipos de datos correctos (números, fechas, etc.)

## Testing

Para probar la funcionalidad:

1. Ir a Dashboard → Participantes
2. Hacer clic en "Nuevo Participante"
3. Llenar el formulario con datos válidos
4. Hacer clic en "Crear"

### Datos de Prueba Válidos

```
Apellido Paterno: García
Apellido Materno: López
Nombres: Juan
CI: 5432123
Fecha Nacimiento: 1985-03-15
Género: Masculino
Lugar Nacimiento: La Paz
Macrodistrito: Centro
Estado Civil: Casado/a
Dirección: Calle Principal 123
Teléfono: 76123456
Contacto Emergencia: María García
Cómo se enteró: Referencia
Grado Instrucción: Secundaria
Último Cargo: Delegado
Años de Servicio: 5
Casa Comunal: (seleccionar una)
```

## Resolución de Errores Comunes

### Error 422: Validation Error

- ✅ Ahora se muestra en español los campos específicos que faltan
- Componente Alert ahora renderiza correctamente mensajes de error

### Error 500: Internal Server Error

- Indica problema en el backend
- Frontend ahora captura y muestra errores más claramente

### CORS Errors

- Asegurar que el backend está ejecutándose
- Verificar que la URL base de API está correcta

## Campos Opcionales

Todos los campos excepto los marcados con `*` son opcionales:

- El usuario puede omitir datos de familia o médicos
- Si no completa familia, se enviará array vacío
- Si no completa médicos, se enviará array vacío

## Notas Importantes

1. **Transformación automática**: Los datos se transforman automáticamente antes de enviar
2. **Validación dual**: Validación en el cliente + validación del servidor
3. **Manejo de errores mejorado**: Mensajes de error claros y específicos
4. **Compatibilidad**: Totalmente compatible con el esquema OpenAPI de la API
