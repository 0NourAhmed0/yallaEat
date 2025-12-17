import { useAuth } from "../auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const linkSets = {
  guest: [
    { label: "Home", path: "/" },
    { label: "Menu", path: "/menu" }
  ],
  customer: [
    { label: "Home", path: "/" },
    { label: "Menu", path: "/menu" },
    { label: "Cart", path: "/cart" },
    { label: "Orders", path: "/orders" },
    { label: "Reservations", path: "/reservations" },
    { label: "Feedback", path: "/feedback" },
    { label: "Profile", path: "/profile" },
  ],
  staff: [
    { label: "Orders", path: "/admin/orders" },
    { label: "Reservations", path: "/admin/reservations" },
    { label: "Menu", path: "/admin/menu" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin" },
    { label: "Orders", path: "/admin/orders" },
    { label: "Reservations", path: "/admin/reservations" },
    { label: "Menu", path: "/admin/menu" },
    { label: "Users", path: "/admin/users" },
    { label: "Feedback", path: "/admin/feedback" },
    { label: "Staff", path: "/admin/staff" },
  ],
};

export default function Layout() {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role;
  const navLinks =
    role === "admin"
      ? linkSets.admin
      : role === "staff"
      ? linkSets.staff
      : role === "customer"
      ? linkSets.customer
      : linkSets.guest;

  const handleAuthAction = async () => {
    if (user && logout) {
      await logout();
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="brand" onClick={() => navigate("/")}>YallaEat</div>
        <nav className="nav-links">
          {navLinks.map((link) => (
            <button
              key={link.path}
              className={location.pathname === link.path ? "nav-link active" : "nav-link"}
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <button className="cta" onClick={handleAuthAction}>
          {user ? "Logout" : "Login"}
        </button>
      </header>
    </>
  );
}

