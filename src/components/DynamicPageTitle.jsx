"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const pageNameMap = {
  "/inicio": "INICIO",
  "/usuarios": "USUARIOS",
  "/casas": "CASAS",
  "/talleres": "TALLERES",
  "/control-llegada-salida": "CONTROL LLEGADA/SALIDA",
  "/participantes": "PARTICIPANTES",
  "/horarios": "HORARIOS",
  "/asistencia": "ASISTENCIA",
  "/evaluaciones": "EVALUACIONES",
  "/gestiones": "GESTIONES",
  "/actividades": "ACTIVIDADES",
  "/control-facilitadores": "CONTROL FACILITADORES",
  "/reportes": "REPORTES",
  "/certificados": "CERTIFICADOS",
  "/seleccionar-casa": "SELECCIONAR CASA",
};

export function DynamicPageTitle() {
  const pathname = usePathname();

  useEffect(() => {
    // Extraer la ruta limpia (sin /inicio/sublevel)
    const pathParts = pathname.split("/").filter(Boolean);
    // Para rutas como /inicio, /usuarios, etc.
    let currentRoute = `/${pathParts[pathParts.length - 1]}`;

    // Si no encontramos una ruta exacta en el map, usar la última parte del path
    let pageName =
      pageNameMap[currentRoute] ||
      pathParts[pathParts.length - 1]?.toUpperCase() ||
      "INICIO";

    document.title = `CASA COMUNAL - ${pageName}`;
  }, [pathname]);

  return null;
}
