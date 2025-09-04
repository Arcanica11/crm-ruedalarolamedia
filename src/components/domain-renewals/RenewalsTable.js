// src/components/domain-renewals/RenewalsTable.js
'use client'

import { useState, useTransition } from 'react'
import { updateRenewalStatus } from '@/app/(public)/domain-renewals/actions'

function SimpleSwitch({ checked, onChange, disabled }) {
  // ... (código del switch se mantiene igual)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        checked ? 'bg-green-600' : 'bg-gray-300'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function RenewalsTable({ initialRenewals }) {
  const [renewals, setRenewals] = useState(initialRenewals)
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (renewalId, isChecked) => {
    startTransition(async () => {
      const result = await updateRenewalStatus(renewalId, isChecked)
      if (result.success) {
        setRenewals((currentRenewals) =>
          currentRenewals.map((r) =>
            r.id === renewalId ? { ...r, is_renewal_approved: isChecked } : r
          )
        )
      }
    })
  }

  const getStatusComponent = (is_renewal_approved) => {
    if (is_renewal_approved === null) return <span className="font-medium text-yellow-600">Pendiente</span>
    if (is_renewal_approved === true) return <span className="font-medium text-green-600">Aprobado</span>
    return <span className="font-medium text-red-600">Cancelado</span>
  }

  return (
    <div className={`${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Vista de Tabla para Escritorio (oculto en móvil) */}
      <div className="hidden md:block rounded-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="text-left">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">Dominio</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">Cliente</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">Vencimiento</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 text-right">Costo</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">Estado</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {renewals?.map((renewal) => (
              <tr key={renewal.id}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{renewal.domain_name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{renewal.client_name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{new Date(renewal.renewal_date).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 text-right">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(renewal.cost || 0)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{getStatusComponent(renewal.is_renewal_approved)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-center">
                  <SimpleSwitch
                    checked={renewal.is_renewal_approved === true}
                    onChange={(isChecked) => handleStatusChange(renewal.id, isChecked)}
                    disabled={isPending}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas para Móvil (oculto en escritorio) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {renewals?.map((renewal) => (
          <div key={renewal.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-gray-900">{renewal.domain_name}</p>
              {getStatusComponent(renewal.is_renewal_approved)}
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p><strong>Cliente:</strong> {renewal.client_name}</p>
              <p><strong>Vencimiento:</strong> {new Date(renewal.renewal_date).toLocaleDateString()}</p>
              <p><strong>Costo:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(renewal.cost || 0)}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900"> {renewal.is_renewal_approved === true ? "Cacelar" :"Aprobar"} Renovación</p>
              <SimpleSwitch
                checked={renewal.is_renewal_approved === true}
                onChange={(isChecked) => handleStatusChange(renewal.id, isChecked)}
                disabled={isPending}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}