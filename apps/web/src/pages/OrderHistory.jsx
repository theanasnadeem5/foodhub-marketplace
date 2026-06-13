import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import api from '../services/api'

const STATUS_BADGE = {
  CONFIRMED:'badge-primary', IN_PROGRESS:'badge-warning',
  COMPLETED:'badge-success', CANCELLED:'badge-danger'
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 24 }}>My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Restaurants</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(o => (
              <Link to={`/orders/${o._id}`} key={o._id}>
                <div className="card" style={{ cursor: 'pointer' }}>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, background: 'var(--primary-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShoppingBag size={20} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <strong style={{ fontSize: 15 }}>#{o.orderNumber}</strong>
                        <span className={`badge ${STATUS_BADGE[o.overallStatus] || 'badge-gray'}`}>
                          {o.overallStatus?.replace('_',' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                        {o.vendorOrders.map(v => v.vendorName).join(' + ')} ·{' '}
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>₹{o.grandTotal}</div>
                      <ChevronRight size={16} color="var(--gray-400)" style={{ marginTop: 4 }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
