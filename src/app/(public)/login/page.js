// RUTA: src/app/(public)/login/page.js
// NUEVO ARCHIVO

"use client";

import { login } from "./actions";
import { useSearchParams } from "next/navigation";

// NOTE: Este es un Client Component porque necesita leer la URL
export default function LoginPage() {
  // NOTE: Usamos useSearchParams para leer los mensajes de error de la URL
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("message");

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50"> 
      {/* NOTE: Restamos la altura del header del layout público (80px) */}
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Arknica CRM
        </h2>
        
        {/* NOTE: El formulario llama directamente a la Server Action 'login' */}
        <form className="space-y-6" action={login}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* NOTE: Muestra el error si existe en la URL */}
          {errorMessage && (
            <p className="text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          )}

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}