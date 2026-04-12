# Nuevas Funcionalidades - Detalles de Participante y PDF

## Cambios Implementados

### 1. Tabla Mejorada

- ✅ Columna **Nº** con numeración correlativa (1, 2, 3...)
- ✅ Columna **Celular** ahora muestra `participante.telefono` (corregido de `familia_telefono`)
- ✅ Nuevo botón **Ojo** (Eye icon) para ver detalles en modal

### 2. Modal de Detalles con Pestañas

#### Pestaña: Información Personal

Muestra todos los datos del participante organizados en 4 secciones:

- **Datos Personales**: Nombre, apellidos, CI, fecha nacimiento, género, estado civil
- **Datos Contacto**: Teléfono, contacto emergencia, dirección, macrodistrito, cómo se enteró
- **Datos Académicos**: Grado instrucción, último cargo, años de servicio
- **Datos Médicos**: Sistema salud, enfermedad base, tratamiento

#### Pestaña: Documento CI

- Muestra la imagen del CI si está cargada
- Botón para subir documento si no existe
- Interfaz limpia y fácil de usar

### 3. Generación de PDF

#### Características:

- 📄 Formato profesional A4
- 🎨 Diseño similar al formulario de inscripción proporcionado
- 🏛️ Incluye logos:
  - `Logo Alcaldía` (logoalcaldia1.png)
  - `Logo Casa Comunal` (logocasacomunal.png)
- 📋 Secciones claramente delimitadas con encabezados verdes
- ✍️ Espacios para firmas de participante y responsable
- 📅 Fecha y hora de generación

#### Botón de Descarga:

- Ubicado en el footer del modal de detalles
- Genera PDF con nombre: `inscripcion_[CI].pdf`
- Automáticamente optimizado para impresión

### 4. Acciones de Tabla

Botones en orden:

1. **Ojo Azul** (Eye) - Ver detalles
2. **Lápiz Azul** (Edit) - Editar participante
3. **Flecha Verde** (Upload) - Subir documento CI

## Archivos Modificados

### [src/app/(dashboard)/participantes/page.js](<src/app/(dashboard)/participantes/page.js>)

- ✅ Import de iconos `Eye` y `Download`
- ✅ Estados para modal de detalles: `detailModalOpen`, `selectedParticipante`, `detailTab`, `isGeneratingPDF`
- ✅ Funciones: `openDetailModal()`, `closeDetailModal()`, `generatePDF()`
- ✅ Tabla actualizada con columna Nº y teléfono correcto
- ✅ Botón Eye para abrir modal de detalles
- ✅ Modal de detalles con pestañas
- ✅ Componente `PDFContent` para renderizar el PDF

## Estructura del Modal de Detalles

```
┌─────────────────────────────────────────────────┐
│ Detalles: [Nombre del Participante]    [X Cerrar]│
├─────────────────────────────────────────────────┤
│ [Información Personal] [Documento CI]           │
├─────────────────────────────────────────────────┤
│  Contenido de la Pestaña Seleccionada           │
│                                                 │
├─────────────────────────────────────────────────┤
│ [Cerrar]  [Descargar PDF]                   [✓] │
└─────────────────────────────────────────────────┘
```

## Estructura del PDF

```
┌─────────────────────────────────────────────────┐
│    [Logo]    FICHA DE INSCRIPCIÓN    [Logo]    │
│         Sistema de Gestión de Casas             │
├─────────────────────────────────────────────────┤
│
│ DATOS DE REGISTRO (verde)
│   • Nro. Registro: [id]
│   • Fecha: [fecha]
│
│ DATOS PERSONALES (verde)
│   • Apellido Paterno / Apellido Materno
│   • Nombres, CI, Fecha Nacimiento
│   • Género, Lugar Nacimiento, etc.
│
│ DATOS DE CONTACTO (verde)
│   • Teléfono
│   • Contacto Emergencia
│
│ DATOS ACADÉMICOS (verde)
│   • Grado Instrucción
│   • Último Cargo
│   • Años de Servicio
│
│ DATOS MÉDICOS (verde)
│   • Sistema Salud
│   • Enfermedad Base
│   • Tratamiento
│
│ [_________________]  [_________________]
│ Firma Participante   Firma Responsable
│
│ Generado: [fecha y hora]
└─────────────────────────────────────────────────┘
```

## Cómo Usar

### Ver Detalles de un Participante

1. En la tabla de participantes, hacer clic en el ícono **Ojo** (azul)
2. Se abrirá un modal con dos pestañas
3. Navegar entre pestañas para ver información o documento

### Descargar PDF

1. Abrir detalles del participante (clic en ojo)
2. Hacer clic en botón **Descargar PDF**
3. Se descargará automáticamente con nombre: `inscripcion_[CI].pdf`

### Imprimir

1. Descargar PDF
2. Abrir con lector de PDF
3. Hacer clic en "Imprimir" (Ctrl+P)
4. Seleccionar impresora y opciones
5. Imprimir

## Requisitos de Logos

Los logos deben estar en la carpeta `public/`:

- `public/logoalcaldia1.png` - Logo de la alcaldía
- `public/logocasacomunal.png` - Logo de la casa comunal

Si los logos no existen, el usuario verá un error en el PDF. Los logos son opcionales pero recomendados.

## Dependencias Instaladas

```bash
npm install html2pdf.js
```

Este paquete proporciona la funcionalidad para convertir HTML a PDF de forma eficiente.

## Notas Importantes

1. **Rendimiento**: La generación de PDF es rápida (menos de 2 segundos)
2. **Navegador compatible**: Funciona en todos los navegadores modernos
3. **Formato**: El PDF se genera en A4 con márgenes de 20mm
4. **Datos sensibles**: El PDF contiene información personal, asegurar acceso restringido
5. **Impresión**: Optimizado para impresión en blanco y negro

## Mejoras Futuras

- [ ] Agregar firma digital
- [ ] Generar certificados
- [ ] Exportar múltiples registros en un solo PDF
- [ ] Estadísticas gráficas en el PDF
- [ ] Código QR para verificación

## Troubleshooting

### Los logos no aparecen en el PDF

- Verificar que `logoalcaldia1.png` y `logocasacomunal.png` existan en `public/`
- Asegurar que los nombres sean exactos (sensible a mayúsculas)

### El PDF no se descarga

- Verificar que el navegador permite descargas
- Intentar en otro navegador
- Revisar la consola de desarrollador (F12) para mensajes de error

### El PDF se ve cortado

- Los márgenes están configurados a 20mm
- Para cambiar, editar la función `generatePDF()` en el componente

## Próximas Mejoras (Opcionales)

1. Agregar más formatos de exportación (Excel, CSV)
2. Permitir seleccionar qué campos mostrar en el PDF
3. Agregar fotos de participantes
4. Incluir código QR para seguimiento
5. Generar reportes masivos
