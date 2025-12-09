import { useAuth } from "../auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthAction = async () => {
    if (user) {
      await logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <div className="brand" onClick={() => navigate('/')}>YallaEat</div>
        <nav className="nav-links">
          <a href="#menu">Menu</a>
          <a href="#offers">Offers</a>
          <a href="#track">Track Order</a>
          <a href="#cart">Cart</a>
        </nav>
        <button className="cta" onClick={handleAuthAction}>
          {user ? 'Logout' : 'Login'}
        </button>
      </header>

      <main className="hero">
        <div className="hero-text">
          <p className="eyebrow">YallaEat!</p>
          <h1>Fresh, delicious food that will yenasik el homom </h1>
          <p className="sub">han4oof momken n3mel hena eyh</p>
        </div>
      </main>
    </div>
  );
}

