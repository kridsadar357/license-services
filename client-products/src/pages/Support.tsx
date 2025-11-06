import { useState, useEffect } from 'react'
import { supportApi } from '../api'

function Support() {
  const [searchType, setSearchType] = useState('licenseKey')
  const [searchValue, setSearchValue] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await supportApi.getStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      alert('Please enter a search value')
      return
    }

    try {
      setLoading(true)
      const response = await supportApi.search(searchType, searchValue)
      setResults(response.data.data)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Search failed')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const renderResults = () => {
    if (!results) return null

    if (searchType === 'licenseKey' && results) {
      return (
        <div className="card">
          <h3>License Information</h3>
          <table>
            <tbody>
              <tr><td><strong>License Key</strong></td><td><code>{results.licenseKey}</code></td></tr>
              <tr><td><strong>Product</strong></td><td>{results.product?.name || results.productId}</td></tr>
              <tr><td><strong>Status</strong></td><td>{results.status}</td></tr>
              <tr><td><strong>Enabled</strong></td><td>{results.enabled ? 'Yes' : 'No'}</td></tr>
              <tr><td><strong>Activations</strong></td><td>{results.activations?.length || 0}</td></tr>
              <tr><td><strong>Created</strong></td><td>{new Date(results.createdAt).toLocaleString()}</td></tr>
            </tbody>
          </table>
          {results.activations && results.activations.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4>Activation Details</h4>
              {results.activations.map((act: any, idx: number) => (
                <div key={idx} className="card" style={{ marginTop: '10px' }}>
                  <p><strong>Token:</strong> <code>{act.activationToken}</code></p>
                  <p><strong>Customer:</strong> {act.customerName || 'N/A'}</p>
                  <p><strong>Email:</strong> {act.customerEmail || 'N/A'}</p>
                  <p><strong>Activated:</strong> {new Date(act.activatedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (searchType === 'activationToken' && results) {
      return (
        <div className="card">
          <h3>Activation Information</h3>
          <table>
            <tbody>
              <tr><td><strong>Activation Token</strong></td><td><code>{results.activationToken}</code></td></tr>
              <tr><td><strong>License Key</strong></td><td><code>{results.license?.licenseKey}</code></td></tr>
              <tr><td><strong>Product</strong></td><td>{results.license?.product?.name || results.license?.productId}</td></tr>
              <tr><td><strong>Status</strong></td><td>{results.license?.status}</td></tr>
              <tr><td><strong>Customer</strong></td><td>{results.customerName || 'N/A'}</td></tr>
              <tr><td><strong>Email</strong></td><td>{results.customerEmail || 'N/A'}</td></tr>
              <tr><td><strong>Activated</strong></td><td>{new Date(results.activatedAt).toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>
      )
    }

    if ((searchType === 'customerEmail' || searchType === 'customerName') && Array.isArray(results)) {
      return (
        <div className="card">
          <h3>Customer Licenses ({results.length})</h3>
          {results.map((act: any, idx: number) => (
            <div key={idx} className="card" style={{ marginTop: '10px' }}>
              <p><strong>License:</strong> <code>{act.license?.licenseKey}</code></p>
              <p><strong>Product:</strong> {act.license?.product?.name || act.license?.productId}</p>
              <p><strong>Status:</strong> {act.license?.status}</p>
              <p><strong>Activated:</strong> {new Date(act.activatedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )
    }

    if (searchType === 'productId' && results) {
      return (
        <div className="card">
          <h3>Product Information</h3>
          <table>
            <tbody>
              <tr><td><strong>Product Name</strong></td><td>{results.name}</td></tr>
              <tr><td><strong>Product ID</strong></td><td><code>{results.productId}</code></td></tr>
              <tr><td><strong>Total Licenses</strong></td><td>{results.licenses?.length || 0}</td></tr>
            </tbody>
          </table>
          {results.licenses && results.licenses.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4>Licenses</h4>
              <table>
                <thead>
                  <tr>
                    <th>License Key</th>
                    <th>Status</th>
                    <th>Activations</th>
                  </tr>
                </thead>
                <tbody>
                  {results.licenses.map((license: any) => (
                    <tr key={license.id}>
                      <td><code>{license.licenseKey}</code></td>
                      <td>{license.status}</td>
                      <td>{license.activations?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )
    }

    return <div className="card"><p>No results found</p></div>
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Support Center</h1>
        <p>Search for license information by various criteria</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', marginBottom: '20px' }}>
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="licenseKey">License Key</option>
            <option value="activationToken">Activation Token</option>
            <option value="customerEmail">Customer Email</option>
            <option value="customerName">Customer Name</option>
            <option value="productId">Product ID</option>
          </select>
          <input
            type="text"
            placeholder={`Enter ${searchType.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {stats && (
        <div className="card">
          <h2>Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <h3>{stats.total}</h3>
              <p>Total Licenses</p>
            </div>
            <div>
              <h3>{stats.available}</h3>
              <p>Available</p>
            </div>
            <div>
              <h3>{stats.activated}</h3>
              <p>Activated</p>
            </div>
            <div>
              <h3>{stats.expired}</h3>
              <p>Expired</p>
            </div>
            <div>
              <h3>{stats.revoked}</h3>
              <p>Revoked</p>
            </div>
            <div>
              <h3>{stats.totalActivations}</h3>
              <p>Total Activations</p>
            </div>
          </div>
        </div>
      )}

      {results && renderResults()}
    </div>
  )
}

export default Support

