import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import api from '../../services/api'

const STATUSES = ['PENDING','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED']
const NEXT = { PENDING:'CONFIRMED', CONFIRMED:'PREPARING', PREPARING:'READY', READY:'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY:'DELIVERED' }
const BADGE = { PENDING:'badge-gray',CONFIRMED:'badge-primary',PREPARING:'badge-warning',READY:'badge-success',OUT_FOR_DELIVERY:'badge-primary',DELIVERED:'badge-success',CANCELLED:'badge-danger' }

export default function VendorOrders() {
  const { user }       = useAuth()
  const { show }       = useToast()
  const vendorId       = user?.vendorId
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('PENDING')
  const [updating, setUpdating] = useState(null)

  const fetchOrders = () => {
    if (!vendorId) return
    api.get(`/vendors/${vendorId}/dashboard`).then(r => {
      setOrders(r.data.data.recentOrders || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [vendorId])

  const updateStatus = async (orderId, vendorOrderId, newStatus) => {
    setUpdating(vendorOrderId)
    try {
      await api.patch(`/orders/${orderId}/vendor/${vendorOrderId}/status`, { status: newStatus })
      show(`Order marked as ${newStatus} ✅`, 'success')
      fetchOrders()
    } catch { show('Failed to update', 'error') }
    finally { setUpdating(null) }
  }

  const filtered = orders.filter(o => {
    const vo = o.vendorOrders?.find(v => v.vendorId?.toString() === vendorId?.toString())
    return vo?.status === filter
  })

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Orders</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchOrders}><RefreshCw size={14} /> Refresh</button>
            <Link to="/vendor" className="btn btn-secondary btn-sm">← Dashboard</Link>
          </div>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24 }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="btn btn-sm"
              style={{
                borderRadius: 100, whiteSpace: 'nowrap',
                background: filter === s ? 'var(--primary)' : 'var(--white)',
                color:      filter === s ? 'white' : 'var(--gray-600)',
                border:     '1.5px solid var(--gray-200)'
              }}>{s.replace('_',' ')}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><h3>No {filter.toLowerCase()} orders</h3></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(o => {
              const vo = o.vendorOrders?.find(v => v.vendorId?.toString() === vendorId?.toString())
              if (!vo) return null
              return (
                <div key={o._id} className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: 'var(--primary)' }}>#{o.orderNumber}</strong>
                      <span style={{ color: 'var(--gray-400)', fontSize: 13, marginLeft: 12 }}>
                        {new Date(o.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className={`badge ${BADGE[vo.status]}`}>{vo.status.replace('_',' ')}</span>
                  </div>
                  <div className="card-body">
                    <div style={{ marginBottom: 14 }}>
                      {vo.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '5px 0', borderBottom: i < vo.items.length-1 ? '1px solid var(--gray-100)' : 'none' }}>
                          <span>{item.name} × {item.quantity}</span>
                          <strong>₹{item.subtotal}</strong>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Customer: </span>
                        <strong style={{ fontSize: 14 }}>{o.customerName}</strong>
                        <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
                          {o.deliveryAddress?.street}, {o.deliveryAddress?.city}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>₹{vo.vendorTotal}</div>
                        {NEXT[vo.status] && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: 8 }}
                            disabled={updating === vo._id}
                            onClick={() => updateStatus(o._id, vo._id, NEXT[vo.status])}>
                            {updating === vo._id ? 'Updating…' : `Mark ${NEXT[vo.status].replace('_',' ')}`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
