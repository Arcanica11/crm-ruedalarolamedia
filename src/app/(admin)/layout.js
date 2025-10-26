// RUTA: src/app/(admin)/layout.js
// CORREGIDO

// FIX: Se cambian ambas importaciones a rutas relativas
import { createClient } from "../../lib/supabase/server"; 
import { logout } from "../(public)/login/actions"; 

import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm md:px-8">
        <h1 className="text-xl font-semibold text-gray-900">
          Arknica Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-600 sm:block">
            {user.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </header>
      
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}