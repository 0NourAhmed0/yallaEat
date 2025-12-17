import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import './App.css'
import { AuthProvider } from "./auth/AuthContext";
import Layout from './components/layout';
import Menu from './pages/Menu.jsx';
import StaffMenuItemPage from './pages/StaffMenuItemPage.jsx';
import ProtectedRoute from './auth/ProtectedRoutes.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import Reservations from './pages/Reservations.jsx';
import AdminReservations from './pages/AdminReservations.jsx';
import Cart from './pages/Cart.jsx';
import CustomerProfile from './pages/CustomerProfile.jsx';
import CreateOrder from './pages/CreateOrder.jsx';
import GetOrders from './pages/GetOrders.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Home from './pages/Home.jsx';

function App() {
  return (
    <AuthProvider>
      <Layout />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/cart" element={<Cart />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin', 'staff']}>
              <CustomerProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <GetOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/createOrder" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CreateOrder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reservations" 
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin', 'staff']}>
              <Reservations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reservations" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <AdminReservations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/menu" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <StaffMenuItemPage />
            </ProtectedRoute>
          } 
        />
          
          <Route 
            path="/admin/staff" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <AdminOrders />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App
