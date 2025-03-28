import React from "react";
import { Link } from "react-router-dom";

// Array de configuración para los ítems del menú
const sidebarItems = [
  { label: "Inicio", icon: "fas fa-home", to: "/home" },
  { label: "Grupos", icon: "fas fa-users", to: "/grupos" },
  { label: "Clientes", icon: "fas fa-user-friends", to: "/clientes" },
  { label: "Itinerario", icon: "fas fa-route", to: "/itinerario" },
  { label: "Guías", icon: "fas fa-user-tie", to: "/guias" },
  { label: "Hoteles", icon: "fas fa-hotel", to: "/hoteles" },
];

const Sidebar = () => {
  return (
    // Elemento <nav> para la navegación lateral con un aria-label para accesibilidad
    <nav id="sidebarMenu" className="sidebar" aria-label="Menú lateral">
      <ul className="nav flex-column d-flex">
        {sidebarItems.map((item, index) => (
          <li className="nav-item" key={index}>
            <Link className="nav-link" to={item.to}>
              <i className={item.icon}></i> <span>{item.label}</span>
            </Link>
          </li>
        ))}
        {/* Separador para separar el contenido principal del botón de Log Out */}
        <li className="nav-item mt-auto">
          <hr className="sidebar-divider" />
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/logout">
            <i className="fas fa-sign-out-alt"></i> <span>Log Out</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;