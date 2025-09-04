// src/app/(public)/domain-renewals/actions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { unstable_noStore as noStore } from 'next/cache' // <-- 1. Importar noStore

export async function updateRenewalStatus(domainId, newStatus) {
  noStore(); // <-- 2. Añadir esta línea al inicio de la función

  const supabase = createClient()
  // ... el resto de la función se mantiene igual
  const { error } = await supabase
    .from('domain_renewals')
    .update({ is_renewal_approved: newStatus })
    .eq('id', domainId)
  
  if (error) {
    console.error('Error updating renewal status:', error)
    return { success: false, message: 'Error al actualizar el estado.' }
  }

  revalidatePath('/domain-renewals')
  return { success: true, message: 'Estado actualizado correctamente.' }
}