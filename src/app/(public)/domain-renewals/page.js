// src/app/(public)/domain-renewals/page.js
import { createClient } from '@/lib/supabase/server'
import RenewalsTable from '@/components/domain-renewals/RenewalsTable'
import StatCard from '@/components/ui/StatCard'

export const dynamic = 'force-dynamic'

export default async function DomainRenewalsPage() {
  const supabase = createClient()
  const { data: renewals, error } = await supabase
    .from('domain_renewals')
    .select('*')
    .order('renewal_date', { ascending: true })

  if (error) {
    return <p className="text-red-500 p-8">Error al cargar los datos: {error.message}</p>
  }

  // Cálculos de totales en el servidor
  const totalDomains = renewals?.length || 0;
  const totalAnnualCost = renewals?.reduce((acc, renewal) => acc + (renewal.cost || 0), 0) || 0;
  const formattedTotalCost = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAnnualCost);

  return (
    <section className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Renovación de Dominios</h1>
      
      {/* Contenedor responsivo para las estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total de Dominios" value={totalDomains} />
        <StatCard title="Costo Anual Total" value={formattedTotalCost} />
      </div>

      <RenewalsTable initialRenewals={renewals} />
    </section>
  );
}