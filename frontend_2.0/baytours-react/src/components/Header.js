import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navbar,
  Container,
  Nav,
  NavDropdown,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  // Alterna la visibilidad del formulario de búsqueda
  const handleSearchToggle = (e) => {
    e.preventDefault();
    setShowSearch(!showSearch);
  };

  // Función asíncrona para verificar si el grupo existe
  const checkGroupExists = async (groupId) => {
    try {
      // Se asume que el endpoint /groups/tabla_groups acepta un parámetro id_grupo
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/groups/tabla_groups?id_grupo=${encodeURIComponent(groupId)}`
      );
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      // Si data es un array y tiene elementos, consideramos que el grupo existe
      return data && Array.isArray(data) && data.length > 0;
    } catch (error) {
      console.error("Error al verificar grupo:", error);
      return false;
    }
  };

  // Maneja el envío del formulario de búsqueda
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) {
      alert("Por favor, ingrese un ID de grupo válido.");
      return;
    }
    // Verificar si el grupo existe
    const exists = await checkGroupExists(trimmedValue);
    if (exists) {
      navigate(`/grupo/${encodeURIComponent(trimmedValue)}`);
    } else {
      alert("Grupo no encontrado. Por favor, verifique el ID.");
      setSearchValue("");
    }
  };

  return (
    <Navbar id="encabezado" expand="lg" fixed="top">
      <Container fluid>
        <Navbar.Brand href="/">
          <img
            src="/assets/Images/LogoBeyTours.png"
            height="60"
            alt="Logo BayTours"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="ms-auto align-items-center">
            {/* Botón de búsqueda */}
            <Nav.Link href="#" id="searchToggle" onClick={handleSearchToggle}>
              <i className="fas fa-search"></i>
            </Nav.Link>
            {/* Formulario de búsqueda, se muestra u oculta según el estado */}
            {showSearch && (
              <Form
                id="searchForm"
                className="ms-2 d-flex"
                onSubmit={handleSearchSubmit}
              >
                <FormControl
                  type="search"
                  placeholder="ID de Grupo"
                  aria-label="Buscar"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <Button type="submit" variant="outline-light">
                  Buscar
                </Button>
              </Form>
            )}
            {/* Dropdown de notificaciones */}
            <NavDropdown
              title={<i className="fas fa-bell"></i>}
              id="basic-nav-dropdown"
              align="end"
            >
              <NavDropdown.Header>Notificaciones</NavDropdown.Header>
              <NavDropdown.Item href="#">Notificación 1</NavDropdown.Item>
              <NavDropdown.Item href="#">Notificación 2</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#">Ver todas</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;