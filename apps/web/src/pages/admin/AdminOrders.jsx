import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const STATUS_BADGE = { CONFIRMED:'badge-primary',IN_PROGRESS:'badge-warning',COMPLETED:'badge-success',CANCELLED:'badge-danger' }

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/orders').then(r => setOrders(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>All Orders ({orders.length})</h1>
          <Link to="/admin" className="btn btn-secondary btn-sm">← Dashboard</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order #</th><th>Customer</th><th>Vendors</th><th>Total</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><strong style={{ color:'var(--primary)' }}>#{o.orderNumber}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{o.customerId?.name || o.customerName}</div>
                    <div style={{ fontSize: 12, color:'var(--gray-400)' }}>{o.customerId?.email}</div>
                  </td>
                  <td style={{ fontSize: 13, color:'var(--gray-500)' }}>{o.vendorOrders?.map(v => v.vendorName).join(', ')}</td>
                  <td><strong>₹{o.grandTotal}</strong></td>
                  <td style={{ color:'var(--success)', fontWeight:600 }}>₹{o.platformCommission?.toFixed(2)}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.overallStatus] || 'badge-gray'}`}>{o.overallStatus?.replace('_',' ')}</span></td>
                  <td style={{ fontSize:13, color:'var(--gray-500)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
