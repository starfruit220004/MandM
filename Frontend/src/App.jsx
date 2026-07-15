import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { ToastProvider } from './lib/ToastContext';
import { seedIfNeeded } from './lib/seed';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import CoconutMark from './components/CoconutMark';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Deliveries from './pages/Deliveries';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

export default function App() {
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    seedIfNeeded();
    setSeeded(true);
  }, []);

  if (!seeded) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream-100">
        <CoconutMark size={44} spin />
      </div>
    );
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/deliveries" element={<Deliveries />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/customers" element={<Customers />} />
              <Route
                path="/employees"
                element={
                  <ProtectedRoute adminOnly>
                    <Employees />
                  </ProtectedRoute>
                }
              />
              <Route path="/reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
