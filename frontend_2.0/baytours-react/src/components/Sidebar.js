import React from "react";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    // Cambiamos el contenedor a <nav> con id y clases para replicar el HTML original
    <nav id="sidebarMenu" className="sidebar" aria-label="Menú lateral">
      <ul className="nav flex-column d-flex">
        <li className="nav-item">
          <Link className="nav-link" to="/home">
            <i className="fas fa-home"></i> <span>Inicio</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/grupos">
            <i className="fas fa-users"></i> <span>Grupos</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/clientes">
            <i className="fas fa-user-friends"></i> <span>Clientes</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/itinerario">
            <i className="fas fa-route"></i> <span>Itinerario</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/guias">
            <i className="fas fa-user-tie"></i> <span>Guías</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/hoteles">
            <i className="fas fa-hotel"></i> <span>Hoteles</span>
          </Link>
        </li>
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