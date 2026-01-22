import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

const SECRET_CODE = import.meta.env.VITE_ADMIN_SECRET_CODE

export default function AdminLogin() {
  const [step, setStep] = useState('code') // 'code' o 'login'
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    if (code === SECRET_CODE) {
      setStep('login')
      setError(null)
    } else {
      setError('Código incorrecto')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log('Login successful:', data.user.email)
      
      setTimeout(() => {
        navigate('/admin-ir8x7k2m9z')
      }, 500)
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Panel Administrativo
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          InterRenta
        </p>

        {step === 'code' ? (
          // PASO 1: Código secreto
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de acceso
              </label>
              <input
                type="password"
                placeholder="Ingresa el código secreto"
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
            >
              Continuar
            </button>
          </form>
        ) : (
          // PASO 2: Login normal
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Correo"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Contraseña"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('code')
                setEmail('')
                setPassword('')
                setError(null)
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← Volver
            </button>
          </form>
        )}
      </div>
    </div>
  )
}