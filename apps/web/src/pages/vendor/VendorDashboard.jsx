import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ShoppingBag, Star, ToggleLeft, ToggleRight, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import api from '../../services/api'

export default function VendorDashboard() {
  const { user }  = useAuth()
  const { show }  = useToast()
  const vendorId  = user?.vendorId
  const [data,    setData]    = useState(null)
  const [vendor,  setVendor]  = useState(user?.vendor || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!vendorId) return
    Promise.all([
      api.get(`/vendors/${vendorId}/dashboard`),
      api.get(`/vendors/${vendorId}`)
    ]).then(([dash, vend]) => {
      setData(dash.data.data)
      setVendor(vend.data.data.vendor)
    }).finally(() => setLoading(false))
  }, [vendorId])

  const toggleOpen = async () => {
    try {
      const res = await api.patch(`/vendors/${vendorId}/toggle-open`)
      setVendor(p => ({ ...p, isOpen: res.data.data.isOpen }))
      show(res.data.data.isOpen ? 'Restaurant is now OPEN 🟢' : 'Restaurant is now CLOSED 🔴', 'success')
    } catch { show('Failed to update status', 'error') }
  }

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  const STATUS_COLOR = { PENDING:'badge-gray', CONFIRMED:'badge-primary', PREPARING:'badge-warning', READY:'badge-success', OUT_FOR_DELIVERY:'badge-primary', DELIVERED:'badge-success', CANCELLED:'badge-danger' }

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>{vendor?.name || 'Vendor Dashboard'}</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Manage your restaurant</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/vendor/menu"   className="btn btn-secondary"><Menu size={15} /> Menu</Link>
            <Link to="/vendor/orders" className="btn btn-secondary"><ShoppingBag size={15} /> Orders</Link>
            <button className={`btn ${vendor?.isOpen ? 'btn-success' : 'btn-secondary'}`} onClick={toggleOpen}>
              {vendor?.isOpen ? <><ToggleRight size={16} /> Open</> : <><ToggleLeft size={16} /> Closed</>}
            </button>
          </div>
        </div>

        <div className="grid grid-3" style={{ marginBottom: 32 }}>
          {[
            { label: 'Total Orders',    value: data?.totalOrders || 0,                         color: '#EFF6FF', textColor: '#1D4ED8', icon: <ShoppingBag size={22} color="#1D4ED8" /> },
            { label: 'Net Revenue',     value: `₹${(data?.totalRevenue || 0).toFixed(0)}`,     color: '#F0FDF4', textColor: '#15803D', icon: <TrendingUp size={22} color="#15803D" /> },
            { label: 'Rating',          value: `${vendor?.ratingAvg?.toFixed(1) || '0.0'} ★`, color: '#FFFBEB', textColor: '#B45309', icon: <Star size={22} color="#B45309" /> },
          ].map(s => (
            <div key={s.label} className="card stat-card" style={{ background: s.color }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-value" style={{ color: s.textColor }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Recent Orders</strong>
            <Link to="/vendor/orders" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View all →</Link>
          </div>
          {!data?.recentOrders?.length ? (
            <div className="empty-state"><p>No orders yet</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {data.recentOrders.slice(0,8).map(o => {
                    const vo = o.vendorOrders?.find(v => v.vendorId?.toString() === vendorId?.toString())
                    return (
                      <tr key={o._id}>
                        <td><strong style={{ color: 'var(--primary)' }}>#{o.orderNumber}</strong></td>
                        <td>{o.customerName}</td>
                        <td style={{ color: 'var(--gray-500)' }}>{vo?.items?.length || 0} items</td>
                        <td><strong>₹{vo?.vendorTotal?.toFixed(0)}</strong></td>
                        <td><span className={`badge ${STATUS_COLOR[vo?.status] || 'badge-gray'}`}>{vo?.status}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
