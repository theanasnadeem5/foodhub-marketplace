import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Store, CheckCircle, XCircle, Clock } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../components/Toast'

const STATUS_BADGE = { APPROVED:'badge-success', PENDING:'badge-warning', SUSPENDED:'badge-danger' }

export default function AdminVendors() {
  const [vendors,  setVendors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const { show }               = useToast()

  const fetchVendors = () => {
    api.get('/admin/vendors').then(r => setVendors(r.data.data)).finally(() => setLoading(false))
  }
  useEffect(() => { fetchVendors() }, [])

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/vendors/${id}/status`, { status })
    show(`Vendor ${status.toLowerCase()} ✅`, 'success')
    fetchVendors()
  }

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Vendors ({vendors.length})</h1>
          <Link to="/admin" className="btn btn-secondary btn-sm">← Dashboard</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Vendor</th><th>Owner</th><th>Cuisine</th><th>Orders</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{v.address?.city}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{v.ownerId?.name || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{v.ownerId?.email}</div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{v.cuisineTypes?.join(', ')}</td>
                  <td style={{ fontWeight: 600 }}>{v.totalOrders}</td>
                  <td><span className={`badge ${STATUS_BADGE[v.status]}`}>{v.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {v.status !== 'APPROVED'   && <button className="btn btn-sm btn-success"  onClick={() => updateStatus(v._id,'APPROVED')}><CheckCircle size={13} /> Approve</button>}
                      {v.status !== 'SUSPENDED'  && <button className="btn btn-sm btn-danger"   onClick={() => updateStatus(v._id,'SUSPENDED')}><XCircle size={13} /> Suspend</button>}
                      {v.status === 'SUSPENDED'  && <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(v._id,'PENDING')}><Clock size={13} /> Restore</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
