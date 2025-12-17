import { Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./auth/AuthContext";
import Layout from "./components/layout";

import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";

import RegisterForm from "./components/RegisterForm.jsx";
import CreateOrder from "./pages/CreateOrder.jsx";
import GetOrders from "./pages/GetOrders.jsx";
import CustomerProfile from "./pages/CustomerProfile.jsx";

import RequireAuth from "./auth/RequireAuth.jsx";
import Layout from './components/layout';
import Menu from './pages/Menu.jsx';
import CreateOrder from './pages/CreateOrder.jsx';
import GetOrders from './pages/GetOrders.jsx';
import CustomerProfile from './pages/CustomerProfile.jsx';
import StaffMenuItemPage from './pages/StaffMenuItemPage.jsx';
import Reservations from './pages/Reservations.jsx';
import AdminReservations from './pages/AdminReservations.jsx';
import ProtectedRoute from "./auth/ProtectedRoutes.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* guest allowed */}
        <Route path="/" element={<Layout />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* protected */}
        <Route
          path="/createOrder"
          element={
            <RequireAuth>
              <CreateOrder />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <GetOrders />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <CustomerProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
        <Route path="/menu" element={<Menu />} />
        <Route path="/createOrder" element={<CreateOrder />} />
        <Route path="/orders" element={<GetOrders />} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/admin/menu" element={<StaffMenuItemPage />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route
          path="/admin/reservations"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <AdminReservations />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
