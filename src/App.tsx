// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Container from './components/layout/Container';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/:blobId" element={<Verify />} />
        </Routes>
      </Container>
    </div>
  );
}