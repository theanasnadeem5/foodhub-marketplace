import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChefHat, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const { login } = useAuth()
  const { show }  = useToast()
  const navigate  = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      show('Welcome back! 👋', 'success')
      if (user.role === 'SUPER_ADMIN')     navigate('/admin')
      else if (user.role === 'VENDOR_MANAGER') navigate('/vendor')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const demoLogin = async (email, password) => {
    setForm({ email, password })
    setLoading(true)
    try {
      const user = await login(email, password)
      show('Logged in as demo user!', 'success')
      if (user.role === 'SUPER_ADMIN')     navigate('/admin')
      else if (user.role === 'VENDOR_MANAGER') navigate('/vendor')
      else navigate('/')
    } catch { setError('Demo login failed — make sure the backend is seeded') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg, #FFF0EB 0%, #F9FAFB 100%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ChefHat size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Welcome back</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 6 }}>Sign in to your FoodHub account</p>
        </div>

        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Your password"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </div>
              <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div style={{ margin: '24px 0 16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
              — Demo accounts —
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '👑 Super Admin',  email: 'admin@foodhub.com',       pw: 'Admin@123' },
                { label: '🍕 Pizza Vendor', email: 'raj@pizzapalace.com',     pw: 'Vendor@123' },
                { label: '🍛 Curry Vendor', email: 'priya@spicegarden.com',   pw: 'Vendor@123' },
                { label: '👤 Customer',     email: 'customer@foodhub.com',    pw: 'Customer@123' },
              ].map(d => (
                <button key={d.email} className="btn btn-secondary btn-sm" onClick={() => demoLogin(d.email, d.pw)}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--gray-500)', fontSize: 14 }}>
          No account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}
