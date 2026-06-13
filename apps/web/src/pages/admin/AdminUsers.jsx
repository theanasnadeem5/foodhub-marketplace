import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../components/Toast'
import api from '../../services/api'

const ROLE_BADGE = { CUSTOMER:'badge-gray', VENDOR_MANAGER:'badge-primary', SUPER_ADMIN:'badge-warning' }

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const { show }             = useToast()

  const fetchUsers = () => api.get('/admin/users').then(r => setUsers(r.data.data)).finally(() => setLoading(false))
  useEffect(() => { fetchUsers() }, [])

  const changeRole = async (id, role) => {
    await api.patch(`/admin/users/${id}/role`, { role })
    show('Role updated ✅', 'success')
    fetchUsers()
  }

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Users ({users.length})</h1>
          <Link to="/admin" className="btn btn-secondary btn-sm">← Dashboard</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Change Role</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontSize: 13, color:'var(--gray-500)' }}>{u.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                  <td style={{ fontSize:13, color:'var(--gray-400)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <select className="form-input" style={{ padding:'5px 10px', fontSize:13, width:'auto' }}
                      value={u.role} onChange={e => changeRole(u._id, e.target.value)}>
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="VENDOR_MANAGER">VENDOR_MANAGER</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
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
