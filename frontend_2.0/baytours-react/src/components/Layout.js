import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div>
      <Header />
      {/* Usamos la clase main-container en un contenedor que incluya el sidebar y el contenido */}
      <div className="d-flex main-container">
        <Sidebar />
        <div className="main-content flex-grow-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;