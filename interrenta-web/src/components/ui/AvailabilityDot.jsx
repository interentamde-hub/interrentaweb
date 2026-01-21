const colors = {
  disponible: 'bg-emerald-500',
  reservado: 'bg-amber-500',
  no_disponible: 'bg-red-500',
}

const animations = {
  disponible: 'animate-pulse',
  reservado: '',
  no_disponible: '',
}

export default function AvailabilityDot({ status }) {
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full inline-block ${colors[status]} ${animations[status]}`}
      title={status}
    />
  )
}