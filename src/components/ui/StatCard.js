// src/components/ui/StatCard.js
export default function StatCard({ title, value, description }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  )
}