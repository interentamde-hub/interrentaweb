import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('User error:', userError)
        setLoading(false)
        return
      }

      if (!user) {
        console.log('No user found')
        setLoading(false)
        return
      }

      console.log('User authenticated:', user.email)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        setLoading(false)
        return
      }

      console.log('Profile:', profile)

      if (profile?.role === 'admin') {
        console.log('Access granted - Admin role confirmed')
        setAllowed(true)
      } else {
        console.log('Access denied - Not admin')
      }
    } catch (err) {
      console.error('Auth check error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!allowed) {
    // CAMBIO AQUÍ: usar la ruta correcta
    return <Navigate to="/panel-ir8x7k2m9z" replace />
  }

  return children
}