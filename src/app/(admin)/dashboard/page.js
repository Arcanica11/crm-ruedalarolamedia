// RUTA: src/app/(admin)/dashboard/page.js
// CORREGIDO

// FIX: Se cambia a ruta relativa
import { createClient } from "../../../lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, company_name, email")
    .order("company_name", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error.message);
    return (
      <p className="text-red-600">
        Error al cargar los clientes: {error.message}
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h2 className="mb-6 text-3xl font-bold text-gray-900">Clientes Actuales</h2>
      
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <ul role="list" className="divide-y divide-gray-200">
          {clients && clients.length > 0 ? (
            clients.map((client) => (
              <li key={client.id} className="px-6 py-4">
                <p className="font-medium text-indigo-600">
                  {client.company_name}
                </p>
                <p className="text-sm text-gray-600">
                  {client.email || "Sin email registrado"}
                </p>
              </li>
            ))
          ) : (
            <li className="px-6 py-4">
              <p className="text-center text-gray-500">No se encontraron clientes.</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}