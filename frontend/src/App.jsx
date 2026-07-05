import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AssetDetail from './pages/AssetDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/asset/:type/:id" element={<AssetDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App