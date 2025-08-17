import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AgentDesk from './pages/AgentDesk.jsx'
import AdminTenants from './pages/AdminTenants.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agent-desk" element={<AgentDesk />} />
        <Route path="/admin/tenants" element={<AdminTenants />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
