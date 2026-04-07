import axios from "axios";

// Usar proxy en desarrollo, URL real en producción
const API_BASE_URL = 
  process.env.NODE_ENV === "development"
    ? "/api"
    : "https://casas-comunales.onrender.com";

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token a las solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      console.error(`API Error ${error.response.status}:`, error.response.data);

      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } else if (error.request) {
      // La petición se envió pero no se recibió respuesta (servidor dormido, timeout, sin red)
      console.error("Network Error (sin respuesta del servidor):", error.message);
    } else {
      // Error al configurar la petición
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
