import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import ClassicalCiphers from './pages/ClassicalCiphers'
import PerfectSecrecy from './pages/PerfectSecrecy'
import ComputationalSecurity from './pages/ComputationalSecurity'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/classical-ciphers" element={<ClassicalCiphers />} />
      <Route path="/perfect-secrecy" element={<PerfectSecrecy />} />
      <Route path="/computational-security" element={<ComputationalSecurity />} />
    </Routes>
  )
}
