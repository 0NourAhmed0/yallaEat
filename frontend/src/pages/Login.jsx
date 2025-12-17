import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";
  const menuItem = location.state?.menuItem; // if passed from Menu

  const handleLogin = () => {
    // demo login (replace later with real API)
    localStorage.setItem("token", "demo_token");

    // if user came from menu order click, continue to create order
    if (menuItem) {
      navigate("/createOrder", { state: { menuItem } });
      return;
    }

    // otherwise return to previous page
    navigate(from, { replace: true });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login (Demo)</button>
    </div>
  );
}
