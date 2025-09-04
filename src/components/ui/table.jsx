// src/components/domain-renewals/RenewalsTable.js
'use client'

import { useState, useTransition } from 'react'
import { updateRenewalStatus } from '@/app/(public)/domain-renewals/actions'

function SimpleSwitch({ checked, onChange, disabled }) {
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

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="text-left">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Dominio</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Cliente</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Vencimiento</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-right">Costo</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Estado</th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-center">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {renewals?.map((renewal) => {
            const isApproved = renewal.is_renewal_approved === true
            const isCancelled = renewal.is_renewal_approved === false
            const isPendingStatus = renewal.is_renewal_approved === null

            let statusClass = "text-yellow-600"
            let statusText = "Pendiente"
            if (isApproved) {
              statusClass = "text-green-600"
              statusText = "Aprobado"
            } else if (isCancelled) {
              statusClass = "text-red-600"
              statusText = "Cancelado"
            }

            return (
              <tr key={renewal.id}>
                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">{renewal.domain_name}</td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">{renewal.client_name}</td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">{new Date(renewal.renewal_date).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-right">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(renewal.cost || 0)}
                </td>
                <td className={`whitespace-nowrap px-4 py-2 font-medium ${statusClass}`}>{statusText}</td>
                <td className="whitespace-nowrap px-4 py-2 text-center">
                  <SimpleSwitch
                    checked={isApproved}
                    onChange={(isChecked) => handleStatusChange(renewal.id, isChecked)}
                    disabled={isPending}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}