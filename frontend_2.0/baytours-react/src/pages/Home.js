import React from "react";
import { Container } from "react-bootstrap";

const Home = () => {
  return (
    <Container fluid>
      <div className="border-bottom pb-2 mb-3">
        <h1 className="h2">Bienvenido al Panel de Control</h1>
      </div>
      <p>Selecciona una opción del menú lateral para comenzar.</p>
    </Container>
  );
};

export default Home;