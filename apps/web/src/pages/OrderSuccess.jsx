import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Clock, ChefHat } from 'lucide-react'
import api from '../services/api'

const STATUS_LABELS = {
  PENDING:'Received',CONFIRMED:'Confirmed',PREPARING:'Preparing',
  READY:'Ready',OUT_FOR_DELIVERY:'On the way',DELIVERED:'Delivered',CANCELLED:'Cancelled'
}
const STATUS_COLORS = {
  PENDING:'var(--gray-400)',CONFIRMED:'var(--primary)',PREPARING:'var(--warning)',
  READY:'var(--success)',OUT_FOR_DELIVERY:'var(--primary)',DELIVERED:'var(--success)',CANCELLED:'var(--danger)'
}

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.data))
    const interval = setInterval(() => {
      api.get(`/orders/${id}`).then(r => setOrder(r.data.data))
    }, 10000)
    return () => clearInterval(interval)
  }, [id])

  if (!order) return <div className="spinner" style={{ marginTop: 80 }} />

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 640 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={36} color="var(--success)" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Order Confirmed! 🎉</h1>
          <p style={{ color: 'var(--gray-500)' }}>Order #{order.orderNumber}</p>
        </div>

        {order.vendorOrders.map(vo => (
          <div key={vo._id} className="card" style={{ marginBottom: 16 }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ChefHat size={16} color="var(--primary)" />
                <strong>{vo.vendorName}</strong>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: STATUS_COLORS[vo.status] }}>
                {STATUS_LABELS[vo.status] || vo.status}
              </span>
            </div>
            <div className="card-body">
              {vo.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0', borderBottom: i < vo.items.length-1 ? '1px solid var(--gray-100)' : 'none' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{item.subtotal}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
                <span>Subtotal</span><span>₹{vo.vendorTotal}</span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', fontSize: 13 }}>
                <Clock size={13} /> Estimated: ~{vo.estimatedMinutes} minutes
              </div>
            </div>
          </div>
        ))}

        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 6 }}>
              <span style={{ color: 'var(--gray-500)' }}>Subtotal</span><span>₹{order.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 6 }}>
              <span style={{ color: 'var(--gray-500)' }}>Delivery</span><span>₹{order.deliveryFeeTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 12 }}>
              <span style={{ color: 'var(--gray-500)' }}>Tax</span><span>₹{order.taxAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>
              <span>Grand Total</span><span>₹{order.grandTotal}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <Link to="/" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Order More</Link>
          <Link to="/orders" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>My Orders</Link>
        </div>
      </div>
    </div>
  )
}
