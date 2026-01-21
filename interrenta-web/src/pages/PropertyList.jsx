import { useEffect, useState } from "react"
import { getProperties } from "../../services/property.service"
import PropertyCard from "../../components/property/PropertyCard"

export default function PropertiesList() {
  const [properties, setProperties] = useState([])

  useEffect(() => {
    getProperties().then(setProperties)
  }, [])

  return (
    <div>
      <h1>Propiedades</h1>

      <div className="grid">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  )
}
