# 🏛️ Casas Comunales - Sistema de Gestión

## 🚀 Estado: COMPLETAMENTE INTEGRADO

Sistema frontend completo para la gestión de Casas Comunales de la Alcaldía de La Paz integrado con API backend en tiempo real.

---

## 📦 Stack Tecnológico

- **Framework:** Next.js 16.2.2 (App Router)
- **Runtime:** React 19.2.4
- **Estilos:** Tailwind CSS 4
- **HTTP Client:** Axios 1.6.0 (con interceptores JWT)
- **Iconos:** Lucide React 0.356.0
- **API Backend:** https://casas-comunales.onrender.com

---

## 🎯 Módulos Implementados

### ✅ Completos (7/7)

1. **Casas Comunales** - CRUD completo, búsqueda, filtrado
2. **Usuarios** - Gestión de usuarios, roles (admin/facilitador)
3. **Talleres** - Gestión de talleres, inscripción de participantes
4. **Participantes** - CRUD con subida de documentos CI
5. **Horarios** - Grilla semanal de horarios
6. **Asistencia** - Registro y historial de asistencia
7. **Evaluaciones** - Cargas de notas, observaciones

### 📊 Dashboard

- **Inicio:** Estadísticas en tiempo real (Casas, Talleres, Participantes, Facilitadores)
- **Responsive:** Optimizado para móvil, tablet y desktop
- **Colapsable:** Sidebar colapsable en desktop

---

## 🔐 Autenticación

### Flujo de Login:

1. Usuario ingresa `username` + `contraseña`
2. Backend valida y devuelve `access_token` (JWT)
3. Token se almacena en `localStorage`
4. Token se inyecta en todas las solicitudes (header: `Authorization: Bearer {token}`)
5. Si token expira (401/403), redirección automática a login

### Credenciales de Prueba:

```
Administrador:
  Usuario: admin
  Contraseña: password123

Facilitador:
  Usuario: facilitador
  Contraseña: password123
```

---

## 📱 Responsividad

### Breakpoints Implementados:

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md/lg)
- **Desktop:** > 1024px

### Características:

✅ Sidebar oculto en móvil (hamburger menu)  
✅ Sidebar colapsable en desktop (icons only)  
✅ Tablas que ocultan columnas secundarias en móvil  
✅ Modales responsive  
✅ Padding y tipografía escalable  
✅ Tooltips en sidebar colapsado

---

## 📂 Estructura de Carpetas

```
src/
├── app/
│   ├── login/
│   │   └── page.js                 # Login page
│   ├── (dashboard)/                # Layout protegido
│   │   ├── layout.js               # Dashboard layout
│   │   ├── inicio/                 # Dashboard
│   │   ├── casas/
│   │   ├── usuarios/
│   │   ├── talleres/
│   │   ├── participantes/
│   │   ├── horarios/
│   │   ├── asistencia/
│   │   └── evaluaciones/
│   ├── globals.css
│   └── layout.js                   # Root layout con AuthProvider
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Alert.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Badge.jsx
│   │   ├── Select.jsx
│   │   ├── Textarea.jsx
│   │   ├── SearchInput.jsx
│   │   └── Pagination.jsx
│   └── layout/
│       └── Sidebar.jsx             # Navegación colapsable
├── context/
│   └── AuthContext.jsx             # Estado global de autenticación
├── hooks/
│   ├── useCasas.js
│   ├── useUsuarios.js
│   ├── useTalleres.js
│   ├── useParticipantes.js
│   ├── useHorarios.js
│   ├── useAsistencia.js
│   ├── useEvaluaciones.js
│   └── useDashboardStats.js        # Dashboard en tiempo real
└── lib/
    ├── api.js                      # Axios instance con interceptores
    ├── auth.js                     # 50+ funciones API
    ├── types.js                    # JSDoc type definitions
    └── hooks.js                    # ProtectedRoute, useAuth, etc
```

---

## 🔥 Funcionalidades Clave

### Autenticación

- ✅ Login con JWT
- ✅ Persistencia de sesión (localStorage)
- ✅ Auto-logout en token expirado
- ✅ Rutas protegidas

### Control de Acceso

- ✅ Admin only: Usuarios, Casas, Talleres, Horarios
- ✅ Facilitador: Participantes, Asistencia
- ✅ Todos: Tahlleres, Evaluaciones, Inicio

### Módulos

- ✅ CRUD completo en todos los módulos
- ✅ Búsqueda y filtrado
- ✅ Paginación lista
- ✅ Validación de formularios
- ✅ Mensajes de éxito/error (auto-cierre 3s)
- ✅ Loading states

### UI/UX

- ✅ Componentes reutilizables
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Accessibility (aria-labels)
- ✅ Dark/Light aware (Tailwind)

---

## 🛠️ Instalación & Ejecución

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start
```

Abre [http://localhost:3000/login](http://localhost:3000/login)

---

## 📡 Endpoints API Implementados (50+)

### Autenticación

- `POST /auth/login`
- `GET /users/me`

### Usuarios

- `GET /users`
- `POST /users`
- `PUT /users/{id}`
- `PATCH /users/{id}/desactivar`

### Casas Comunales

- `GET /casas`
- `POST /casas`
- `PUT /casas/{id}`

### Talleres

- `GET /talleres`
- `POST /talleres`
- `PUT /talleres/{id}`
- `GET /talleres/{id}/participantes`

### Participantes

- `GET /participantes`
- `POST /participantes`
- `PUT /participantes/{id}`
- `POST /participantes/{id}/documento-ci`
- `GET /participantes/ci/{ci}`

### Horarios

- `GET /horarios`
- `POST /casas/{casa_id}/horarios`

### Asistencia

- `POST /control/asistencia`
- `GET /control/asistencia/{tallerId}`

### Evaluaciones

- `PUT /control/evaluaciones`
- `GET /control/evaluaciones/taller/{tallerIdId}`
- `GET /control/evaluaciones/participante/{participanteId}`

### Reportes

- `GET /reportes/estadisticas`
- `GET /reportes/asistencia-participante/{participanteId}`
- `GET /reportes/asistencia-casa/{casaId}`
- `GET /reportes/evaluaciones/{tallerId}`

...y más

---

## 🎨 Componentes UI

### Base Components

- `Button` - 4 variantes (primary, secondary, danger, ghost)
- `Input` - Con validación en tiempo real
- `Select` - With label y error display
- `Textarea` - Resizable text area
- `Card` - Container responsive

### Display Components

- `Alert` - 4 tipos (error, success, warning, info)
- `Badge` - 8 variantes (roles, estados)
- `Table` - Compound component (Head, Body, Row, Cell)
- `SearchInput` - Con ícono de búsqueda
- `Pagination` - Prev/Next navigation

### Layout Components

- `Modal` - Full overlay modal con animations
- `Sidebar` - Collapsible nav con tooltip

---

## 🔄 Custom Hooks

```javascript
// Módulos CRUD
const {
  items,
  isLoading,
  error,
  filtro,
  setFiltro,
  loadItems,
  createItem,
  updateItem,
} = hook();

// Dashboard
const { stats, isLoading, error, loadStats } = useDashboardStats();

// Protect routes
const { usuario, token, login, logout } = useAuth();
```

---

## 🌐 Variables de Entorno

```env
# .env.local o variables de entorno del sistema
NEXT_PUBLIC_API_BASE_URL=https://casas-comunales.onrender.com
```

---

## 📝 Notas Importantes

1. **Token Expiration:** Configurado en el backend. Si expira, redirige automáticamente a login.
2. **CORS:** API está configurada para aceptar requests desde cualquier origen.
3. **LocalStorage:** Token y usuario se guardan localmente para persistencia.
4. **Error Handling:** Automático - extrae mensajes del backend y muestra en UI.
5. **Loading States:** Spinners y estados de carga en todas las operaciones async.

---

## 🚀 Próximas Mejoras (Opcional)

- [ ] PDF export de reportes
- [ ] Notificaciones en tiempo real (WebSocket)
- [ ] Dark mode toggle
- [ ] Multi-idioma
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Audit logs

---

## 📞 Soporte

Para reportar bugs o solicitar features, contacta al equipo de desarrollo.

---

**Última actualización:** Abril 2026  
**Versión:** 1.0.0  
**Estado:** PRODUCCIÓN LISTA ✅
