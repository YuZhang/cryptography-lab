import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import ClassicalCiphers from './pages/ClassicalCiphers'
import PerfectSecrecy from './pages/PerfectSecrecy'
import ComputationalSecurity from './pages/ComputationalSecurity'
import CpaCca from './pages/CpaCca'
import BlockCiphers from './pages/BlockCiphers'
import TheoreticalConstructions from './pages/TheoreticalConstructions'
import MacHash from './pages/MacHash'
import AuthenticatedEncryption from './pages/AuthenticatedEncryption'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/classical-ciphers" element={<ClassicalCiphers />} />
      <Route path="/perfect-secrecy" element={<PerfectSecrecy />} />
      <Route path="/computational-security" element={<ComputationalSecurity />} />
      <Route path="/cpa-cca" element={<CpaCca />} />
      <Route path="/block-ciphers" element={<BlockCiphers />} />
      <Route path="/theoretical-constructions" element={<TheoreticalConstructions />} />
      <Route path="/mac-hash" element={<MacHash />} />
      <Route path="/authenticated-encryption" element={<AuthenticatedEncryption />} />
    </Routes>
  )
}
