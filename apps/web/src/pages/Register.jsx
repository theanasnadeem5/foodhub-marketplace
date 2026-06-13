import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChefHat } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const { register }          = useAuth()
  const { show }              = useToast()
  const navigate              = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
      show('Account created! Welcome to FoodHub 🎉', 'success')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg, #FFF0EB 0%, #F9FAFB 100%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ChefHat size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Create account</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 6 }}>Start ordering your favourite food</p>
        </div>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              {[
                { key: 'name',     label: 'Full name',    type: 'text',     placeholder: 'Aarav Shah' },
                { key: 'email',    label: 'Email address',type: 'email',    placeholder: 'you@example.com' },
                { key: 'phone',    label: 'Phone number', type: 'tel',      placeholder: '9876543210' },
                { key: 'password', label: 'Password',     type: 'password', placeholder: 'Min 6 characters' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    required={f.key !== 'phone'} />
                </div>
              ))}
              <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--gray-500)', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
