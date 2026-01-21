import AvailabilityDot from '../ui/AvailabilityDot'

const statusLabels = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  no_disponible: 'No disponible'
}

export default function PropertyCard({ property }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer">
      {/* Image */}
      <div className="relative h-72 bg-gray-100 overflow-hidden">
        {property.cover_url ? (
          <img
            src={property.cover_url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <AvailabilityDot status={property.status} />
            <span className="text-xs font-medium text-gray-900">
              {statusLabels[property.status]}
            </span>
          </div>
        </div>

        {/* Contract Type Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-xs font-medium text-white uppercase tracking-wide">
              {property.contract_type}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-xl text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
            {property.title}
          </h3>
          
          <p className="text-sm text-gray-500 capitalize">
            {property.property_type}
            {property.sector && ` · ${property.sector}`}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-gray-900">
            ${property.price?.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">
            {property.contract_type === 'arriendo' ? '/mes' : ''}
          </span>
        </div>

        {/* Features */}
        {(property.bedrooms || property.bathrooms || property.area) && (
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{property.bedrooms} hab</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{property.bathrooms} baños</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>{property.area} m²</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button className="w-full mt-4 px-6 py-3 bg-gray-50 text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors group-hover:bg-black group-hover:text-white">
          Ver detalles
        </button>
      </div>
    </div>
  )
}