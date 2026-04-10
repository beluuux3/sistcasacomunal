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
  const [localError, setLocalError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const router = useRouter();
  const { login, isLoading, usuario } = useAuth();

  // Redirigir después del login exitoso
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
            type="password"
            placeholder="Ingrese su contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            error={validationErrors.contraseña}
            required
            disabled={isLoading}
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
