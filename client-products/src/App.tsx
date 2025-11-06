import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Products from './pages/Products'
import Licenses from './pages/Licenses'
import Support from './pages/Support'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="nav">
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Products
            </NavLink>
            <NavLink to="/licenses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Licenses
            </NavLink>
            <NavLink to="/support" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Support Center
            </NavLink>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

