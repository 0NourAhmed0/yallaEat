import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import './App.css'
import { AuthProvider } from "./auth/AuthContext";
import Layout from './components/layout';
import Menu from './pages/Menu.jsx';
import CreateOrder from './pages/CreateOrder.jsx';
import GetOrders from './pages/GetOrders.jsx';
import CustomerProfile from './pages/CustomerProfile.jsx';
import ProtectedRoute from "./auth/ProtectedRoutes.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";

import Cart from "./pages/Cart.jsx";
import Reservations from "./pages/Reservations.jsx";
import Feedback from "./pages/Feedback.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminReservations from "./pages/admin/AdminReservations.jsx";
import AdminMenu from "./pages/admin/AdminMenu.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminStaff from "./pages/admin/AdminStaff.jsx";
import AdminFeedback from "./pages/admin/AdminFeedback.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/menu" element={<Menu/>} />
        <Route path="/createOrder" element={<CreateOrder/>} />
        <Route path="/orders" element={<GetOrders/>} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Customer routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Feedback />
            </ProtectedRoute>
          }
        />

        {/* Staff/Admin shared routes */}
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <AdminReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <AdminMenu />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminFeedback />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
