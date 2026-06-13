import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Store, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react'
import api from '../../services/api'

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  const cards = [
    { label:'Total Users',         value: stats?.totalUsers   || 0, color:'#EFF6FF', text:'#1D4ED8', icon:<Users size={24} color="#1D4ED8" />,     link:'/admin/users' },
    { label:'Total Vendors',       value: stats?.totalVendors || 0, color:'#F0FDF4', text:'#15803D', icon:<Store size={24} color="#15803D" />,     link:'/admin/vendors' },
    { label:'Total Orders',        value: stats?.totalOrders  || 0, color:'#FFF7ED', text:'#C2410C', icon:<ShoppingBag size={24} color="#C2410C" />,link:'/admin/orders' },
    { label:'Platform Commission', value:`₹${(stats?.platformRevenue||0).toFixed(0)}`, color:'#FDF4FF', text:'#7C3AED', icon:<TrendingUp size={24} color="#7C3AED" />, link:null },
  ]

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Platform overview — FoodHub Marketplace</p>
        </div>

        <div className="grid grid-4" style={{ marginBottom: 36 }}>
          {cards.map(c => (
            <div key={c.label} className="card stat-card" style={{ background: c.color }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div className="stat-value" style={{ color: c.text }}>{c.value}</div>
                  <div className="stat-label">{c.label}</div>
                </div>
                {c.icon}
              </div>
              {c.link && (
                <Link to={c.link} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, fontSize: 13, color: c.text, fontWeight: 600 }}>
                  View all <ArrowRight size={13} />
                </Link>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { to:'/admin/vendors', label:'Manage Vendors',  icon:<Store size={16} /> },
            { to:'/admin/orders',  label:'All Orders',      icon:<ShoppingBag size={16} /> },
            { to:'/admin/users',   label:'Manage Users',    icon:<Users size={16} /> },
          ].map(b => (
            <Link key={b.to} to={b.to} className="btn btn-secondary" style={{ fontSize: 15, padding: '12px 24px' }}>
              {b.icon} {b.label}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 28, padding: '20px 24px', background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--primary)' }}>
          <strong style={{ color: 'var(--primary)' }}>Total GMV (Gross Merchandise Value):</strong>
          <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginLeft: 12 }}>₹{(stats?.gmv||0).toFixed(0)}</span>
        </div>
      </div>
    </div>
  )
}
