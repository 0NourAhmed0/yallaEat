import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import './App.css';
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

// ✅ feedback pages
import FeedbackForm from "./pages/FeedbackForm.jsx";
import MyFeedback from "./pages/MyFeedback.jsx";
import AdminFeedback from "./pages/AdminFeedback.jsx"; // optional (admin/staff)

function App() {
  return (
    <AuthProvider>
      <Layout />

      <Routes>
        {/* guest allowed */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* protected: profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin', 'staff']}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />

        {/* protected: customer orders */}
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

        {/* ✅ feedback (customer only) */}
        <Route
          path="/feedback"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <FeedbackForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-feedback"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MyFeedback />
            </ProtectedRoute>
          }
        />

        {/* protected: reservations */}
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

        {/* protected: admin/staff menu management */}
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <StaffMenuItemPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ admin/staff feedback view (optional) */}
        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <AdminFeedback />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

// Temporary Home component
function Home() {
  return (
    <div className="page">
      <main className="hero">
        <div className="hero-text">
          <p className="eyebrow">YallaEat!</p>
          <h1>Fresh, delicious food that will yenasik el homom</h1>
          <p className="sub">han4oof momken n3mel hena eyh</p>
        </div>
      </main>
    </div>
  );
}

export default App;
