// RUTA: src/app/page.js
// MODIFICADO

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  // NOTE: Usamos el cliente de Supabase para el servidor
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // NOTE: Lógica de redirección basada en la sesión
  if (user) {
    // FIX: Si el usuario está autenticado, lo enviamos al dashboard
    redirect("/dashboard");
  } else {
    // FIX: Si el usuario NO está autenticado, lo enviamos al login
    redirect("/login");
  }

  // NOTE: No es necesario retornar JSX ya que siempre redirigimos
  return null;
}