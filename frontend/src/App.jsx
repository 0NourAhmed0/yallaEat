import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import './App.css'
import { AuthProvider } from "./auth/AuthContext";
import Layout from './components/layout';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
