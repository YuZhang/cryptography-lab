import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import PerfectSecrecy from './pages/PerfectSecrecy'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/perfect-secrecy" element={<PerfectSecrecy />} />
    </Routes>
  )
}
