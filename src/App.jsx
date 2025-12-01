import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; 
import ProtectedRoute from './components/ProtectedRoute';


import Login from './pages/Login';


import Home from './pages/Home';     
import Boleta from './pages/Boleta'; 


import Dashboard from './pages/admin/Dashboard'; 
import Inventory from './pages/admin/Inventory'; 
import AdminUsers from './pages/admin/AdminUsers';
import Categories from './pages/admin/Categories'; 
import AdminSalesHistory from './pages/admin/AdminSalesHistory'; 


function App() {
  return (
    <AuthProvider> 
      <CartProvider>
        <Routes>
          
          <Route path="/" element={<Navigate to="/login" />} />
          
         
          <Route path="/login" element={<Login />} />
      

         
          <Route 
            path="/home" 
            element={<ProtectedRoute><Home /></ProtectedRoute>} 
          />
          <Route path="/boleta" element={<ProtectedRoute><Boleta /></ProtectedRoute>} />
          
          
          <Route 
            path="/admin/dashboard" 
            element={<ProtectedRoute requireAdmin={true}><Dashboard /></ProtectedRoute>} 
          />
         
          <Route 
            path="/admin/inventory" 
            element={<ProtectedRoute requireAdmin={true}><Inventory /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/categories" 
            element={<ProtectedRoute requireAdmin={true}><Categories /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/users" 
            element={<ProtectedRoute requireAdmin={true}><AdminUsers /></ProtectedRoute>} 
          />
         
          <Route 
            path="/admin/sales-history" 
            element={<ProtectedRoute requireAdmin={true}><AdminSalesHistory /></ProtectedRoute>} 
          />

          {/* Si la ruta no existe, manda al Login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;