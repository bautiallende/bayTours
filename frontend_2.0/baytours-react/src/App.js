import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importa tus componentes y páginas de forma correcta
import Login from "./pages/Login";          // <-- Importación por defecto
import Home from "./pages/Home";            // <-- Asegúrate que Home.js tenga export default Home;
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Layout from "./components/Layout";   // <-- Asegúrate que Layout.js tenga export default Layout;

      

// (Si tienes otros componentes, verifica también su exportación/importación)

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/" element={ isAuthenticated ? <Layout /> : <Navigate to="/login" replace /> }>
          <Route index element={<Home />} />
          <Route path="grupos" element={<Groups />} />
          <Route path="grupo/:id" element={<GroupDetail />} />
          {/* Otras rutas */}
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

