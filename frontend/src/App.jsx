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
import StaffMenuItemPage from './pages/StaffMenuItemPage.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/createOrder" element={<CreateOrder />} />
        <Route path="/orders" element={<GetOrders />} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/admin/menu" element={<StaffMenuItemPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
