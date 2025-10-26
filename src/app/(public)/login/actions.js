// RUTA: src/app/(public)/login/actions.js
// CORREGIDO

"use server";

// FIX: Se cambia a ruta relativa para evitar problemas de alias
import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // NOTE: Usamos el cliente de Supabase para servidor
  const supabase = createClient();

  // NOTE: Autenticación usando Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // NOTE: Redirigimos de vuelta a la página de login con un mensaje de error
    console.error("Error de autenticación:", error.message);
    return redirect("/login?message=Credenciales incorrectas. Por favor intente de nuevo.");
  }

  // NOTE: Si el login es exitoso, redirigimos al dashboard.
  return redirect("/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}