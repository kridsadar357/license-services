import { useState, useEffect } from 'react'
import { licensesApi, productsApi } from '../api'

interface License {
  id: number
  licenseKey: string
  productId: string
  status: 'available' | 'activated' | 'expired' | 'revoked'
  enabled: boolean
  notes?: string
  createdAt: string
  product?: { name: string; productId: string }
  activations?: any[]
}

interface Product {
  id: number
  productId: string
  name: string
}

function Licenses() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterProductId, setFilterProductId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingLicense, setEditingLicense] = useState<License | null>(null)
  const [formData, setFormData] = useState({ licenseKey: '', productId: '', notes: '' })

  useEffect(() => {
    loadProducts()
    loadLicenses()
  }, [search, filterProductId, filterStatus])

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAll()
      setProducts(response.data.data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadLicenses = async () => {
    try {
      setLoading(true)
      const response = await licensesApi.getAll({
        search: search || undefined,
        productId: filterProductId || undefined,
        status: filterStatus || undefined,
      })
      setLicenses(response.data.data || [])
    } catch (error) {
      console.error('Error loading licenses:', error)
      alert('Failed to load licenses')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingLicense(null)
    setFormData({ licenseKey: '', productId: '', notes: '' })
    setShowModal(true)
  }

  const handleEdit = (license: License) => {
    setEditingLicense(license)
    setFormData({
      licenseKey: license.licenseKey,
      productId: license.productId,
      notes: license.notes || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingLicense) {
        await licensesApi.update(editingLicense.id, {
          notes: formData.notes,
        })
      } else {
        await licensesApi.create(formData)
      }
      setShowModal(false)
      loadLicenses()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save license')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this license?')) return
    try {
      await licensesApi.delete(id)
      loadLicenses()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete license')
    }
  }

  const handleToggleEnabled = async (license: License) => {
    try {
      await licensesApi.toggleEnabled(license.id, !license.enabled)
      loadLicenses()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update license')
    }
  }

  const handleStatusChange = async (license: License, status: string) => {
    try {
      await licensesApi.update(license.id, { status: status as any })
      loadLicenses()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      available: 'badge-success',
      activated: 'badge-info',
      expired: 'badge-warning',
      revoked: 'badge-danger',
    }
    return badges[status] || 'badge-secondary'
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>License Management</h1>
          <button className="btn btn-primary" onClick={handleCreate}>+ Add License</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search licenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filterProductId} onChange={(e) => setFilterProductId(e.target.value)}>
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.productId}>{p.name}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="activated">Activated</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>License Key</th>
                <th>Product</th>
                <th>Status</th>
                <th>Enabled</th>
                <th>Activations</th>
                <th>Notes</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((license) => (
                <tr key={license.id}>
                  <td>{license.id}</td>
                  <td><code>{license.licenseKey}</code></td>
                  <td>{license.product?.name || license.productId}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(license.status)}`}>
                      {license.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${license.enabled ? 'badge-success' : 'badge-danger'}`}>
                      {license.enabled ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{license.activations?.length || 0}</td>
                  <td>{license.notes || '-'}</td>
                  <td>{new Date(license.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleEdit(license)}>Edit</button>
                    <button
                      className={`btn ${license.enabled ? 'btn-secondary' : 'btn-success'}`}
                      onClick={() => handleToggleEnabled(license)}
                    >
                      {license.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <select
                      value={license.status}
                      onChange={(e) => handleStatusChange(license, e.target.value)}
                      style={{ width: 'auto', marginRight: '8px' }}
                    >
                      <option value="available">Available</option>
                      <option value="activated">Activated</option>
                      <option value="expired">Expired</option>
                      <option value="revoked">Revoked</option>
                    </select>
                    <button className="btn btn-danger" onClick={() => handleDelete(license.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingLicense ? 'Edit License' : 'Create License'}</h2>
            <label>License Key</label>
            <input
              type="text"
              value={formData.licenseKey}
              onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value })}
              disabled={!!editingLicense}
            />
            <label>Product</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              disabled={!!editingLicense}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.productId}>{p.name}</option>
              ))}
            </select>
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Licenses

