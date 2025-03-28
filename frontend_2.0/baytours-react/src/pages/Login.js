import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert } from "react-bootstrap";

/**
 * Componente Login
 * Permite al usuario autenticarse mediante un formulario.
 * Actualmente, la validación es básica (usuario: "admin", contraseña: "123").
 * En el futuro se integrará la autenticación con Google.
 */
const Login = ({ setIsAuthenticated }) => {
  // Estados para gestionar los valores del formulario y posibles errores.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  
  // Hook para redirigir al usuario tras la autenticación.
  const navigate = useNavigate();

  /**
   * Función que maneja el envío del formulario.
   * Valida las credenciales y, de ser correctas, establece el estado de autenticación.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación de credenciales (este método se actualizará cuando integremos Google OAuth)
    if (username === "admin" && password === "123") {
      setIsAuthenticated(true);
      navigate("/");  // Redirige al usuario a la página principal
    } else {
      // Muestra un mensaje de error en caso de credenciales incorrectas
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <Container>
      {/* Contenedor centrado vertical y horizontalmente */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="col-4">
          <h3 className="text-center mb-4">Iniciar Sesión</h3>
          {/* Muestra alerta de error si existe */}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formUsername" className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingrese la contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Ingresar
            </Button>
          </Form>
        </div>
      </div>
    </Container>
  );
};

export default Login;