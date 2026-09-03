import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import ClassicalCiphers from './pages/ClassicalCiphers'
import PerfectSecrecy from './pages/PerfectSecrecy'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/classical-ciphers" element={<ClassicalCiphers />} />
      <Route path="/perfect-secrecy" element={<PerfectSecrecy />} />
    </Routes>
  )
}
