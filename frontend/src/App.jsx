import { NavLink, Routes, Route } from 'react-router-dom'
import Analyzer from './pages/Analyzer.jsx'
import History from './pages/History.jsx'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-brand">AI Image Analyzer</span>
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Analyzer
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>
            History
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Analyzer />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  )
}
