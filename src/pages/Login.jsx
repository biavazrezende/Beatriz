import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'

export default function Login() {
  const { signIn, session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (!authLoading && session) navigate('/admin', { replace: true })
  }, [session, authLoading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      const msg = err?.message?.toLowerCase() ?? ''
      if (msg.includes('invalid login') || msg.includes('credentials')) {
        setError('E-mail ou senha incorretos.')
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Falha de conexão. Verifique sua internet.')
      } else {
        setError('Não foi possível entrar. Tente novamente.')
      }
      setShake(true)
      setTimeout(() => setShake(false), 600)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-azul-escuro flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-apatita border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-azul-escuro flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-apatita/10" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-apatita/8" />
        <div className="absolute top-1/3 right-0 w-40 h-40 rounded-full bg-vermelho/5" />

        <div className="relative z-10 max-w-xs text-center">
          <div className="w-20 h-20 rounded-3xl bg-apatita mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-apatita/30">
            <span className="text-white font-black text-4xl tracking-tight">A</span>
          </div>
          <h1 className="text-white font-black text-4xl leading-tight mb-3">
            AmorSaúde
          </h1>
          <p className="text-apatita/70 text-lg font-light">
            Organograma 2026
          </p>
          <div className="mt-10 pt-10 border-t border-white/10">
            <p className="text-white/40 text-sm leading-relaxed">
              Gerencie colaboradores, times e a estrutura hierárquica da empresa.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-apatita mx-auto mb-4 flex items-center justify-center shadow-lg shadow-apatita/30">
              <span className="text-white font-black text-2xl">A</span>
            </div>
            <h1 className="text-azul-escuro font-black text-2xl">AmorSaúde</h1>
            <p className="text-gray-500 text-sm">Painel Administrativo</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="font-bold text-azul-escuro text-xl mb-1">Bem-vindo</h2>
            <p className="text-gray-500 text-sm mb-6">Entre com seu e-mail e senha de administrador.</p>

            {error && (
              <div className={`mb-5 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-vermelho ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="admin@amorsaude.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 focus:border-apatita transition-colors bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 focus:border-apatita transition-colors bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-azul-escuro text-white py-3 rounded-xl font-semibold text-sm hover:bg-azul-escuro/90 active:scale-[0.98] disabled:opacity-60 transition-all mt-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-5">
            <a href="/" className="text-sm text-gray-400 hover:text-apatita transition-colors">
              ← Ver organograma público
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
