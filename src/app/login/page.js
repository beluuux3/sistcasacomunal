"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [localError, setLocalError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const router = useRouter();
  const { login, isLoading, usuario } = useAuth();

  // Redirigir a inicio si ya está logeado
  useEffect(() => {
    if (usuario) {
      router.push("/inicio");
    }
  }, [usuario, router]);

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = "El usuario es requerido";
    }
    if (!contraseña) {
      errors.contraseña = "La contraseña es requerida";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      await login(username, contraseña);
      // El useEffect va a redirigir a inicio
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 to-slate-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Casas Comunales</h1>
          <p className="text-gray-600 mt-2">Gestión de la Alcaldía de La Paz</p>
        </div>

        {localError && (
          <Alert
            type="error"
            title="Error al iniciar sesión"
            message={localError}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuario"
            type="text"
            placeholder="Ingrese su usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={validationErrors.username}
            required
            disabled={isLoading}
          />

          <Input
            label="Contraseña"
            type={mostrarContraseña ? "text" : "password"}
            placeholder="Ingrese su contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            error={validationErrors.contraseña}
            required
            disabled={isLoading}
            rightElement={
              <button
                type="button"
                onClick={() => setMostrarContraseña((v) => !v)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
                aria-label={mostrarContraseña ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarContraseña ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
          />

          <Button
            variant="primary"
            className="w-full py-2 text-base"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Sistema de gestión para casas comunales del municipio de La Paz</p>
        </div>
      </Card>
    </div>
  );
}
