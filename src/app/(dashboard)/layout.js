"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { ProtectedRoute } from "@/lib/hooks";
import { FacilitadorCasaProtector } from "@/components/FacilitadorCasaProtector";
import { GestionProvider } from "@/context/GestionContext";
import { CasaSeleccionadaProvider } from "@/context/CasaSeleccionadaContext";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import GestionSelector from "@/components/GestionSelector";

function DashboardContent({
  children,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile unless open, collapsible on desktop */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } lg:block transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 lg:hidden flex-shrink-0"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex text-gray-600 hover:text-gray-900 flex-shrink-0"
            aria-label={
              sidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight size={24} />
            ) : (
              <ChevronLeft size={24} />
            )}
          </button>

          <div className="flex-1"></div>

          {/* Gestion Selector */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <GestionSelector />
          </div>
        </header>

        {/* Content Area - scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <GestionProvider>
        <CasaSeleccionadaProvider>
          <FacilitadorCasaProtector>
            <DashboardContent
              children={children}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
            />
          </FacilitadorCasaProtector>
        </CasaSeleccionadaProvider>
      </GestionProvider>
    </ProtectedRoute>
  );
}
