import { supabase } from '../services/supabase'

export default function Login() {
  const login = async () => {
    await supabase.auth.signInWithPassword({
      email: 'interentamde@gmail.com',
      password: 'Ivan2025$$$.'
    })
  }

  return (
    <button onClick={login}>
      Entrar al panel
    </button>
  )
}
