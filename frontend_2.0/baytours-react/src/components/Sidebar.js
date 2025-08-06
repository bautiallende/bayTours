import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Ítems principales del menú (sin Guías)
const sidebarItems = [
  { label: "Inicio", icon: "fas fa-home", to: "/home" },
  { label: "Grupos", icon: "fas fa-users", to: "/grupos" },
  { label: "Clientes", icon: "fas fa-user-friends", to: "/clientes" },
  { label: "Itinerario", icon: "fas fa-route", to: "/itinerario" },
  { label: "Hoteles", icon: "fas fa-hotel", to: "/hoteles" },
];

const Sidebar = () => {
  const location = useLocation();
  const [guidesOpen, setGuidesOpen] = useState(
    location.pathname.startsWith("/guias")
  );

  const toggleGuides = () => setGuidesOpen(prev => !prev);

  return (
    <nav id="sidebarMenu" className="sidebar" aria-label="Menú lateral">
      <ul className="nav flex-column">
        {/* Ítems principales */}
        {sidebarItems.map((item, idx) => (
          <li className="nav-item" key={idx}>
            <Link
              to={item.to}
              className={`nav-link${location.pathname === item.to ? " active" : ""}`}
            >
              <i className={item.icon + " me-2"}></i>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}

        {/* Ítem Guías */}
        <li className="nav-item">
          <a
            href="#!"
            className={`nav-link${location.pathname.startsWith("/guias") ? " active" : ""}`}
            onClick={toggleGuides}
          >
            <i className="fas fa-user-tie me-2"></i>
            <span>Guías</span>
          </a>
        </li>

        {/* Sub-ítems Guías si está expandido */}
        {guidesOpen && (
          <>
            <li className="nav-item">
              <Link
                to="/guias/locales"
                className={`nav-link${location.pathname.startsWith("/guias/locales") ? " active" : ""}`}
              >
                <i className="fas fa-address-book me-2"></i>
                <span>Locales</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/guias/tour-leaders"
                className={`nav-link${location.pathname.startsWith("/guias/tour-leaders") ? " active" : ""}`}
              >
                <i className="fas fa-address-card me-2"></i>
                <span>Tour Leads</span>
              </Link>
            </li>
          </>
        )}

        {/* Separador automático al final */}
        <li className="nav-item mt-auto">
          <hr className="sidebar-divider" />
        </li>

        {/* Log Out */}
        <li className="nav-item">
          <Link to="/logout" className="nav-link">
            <i className="fas fa-sign-out-alt me-2"></i>
            <span>Log Out</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
