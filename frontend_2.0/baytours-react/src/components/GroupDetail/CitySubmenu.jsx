import React from 'react';
import PropTypes from 'prop-types';
import { Nav } from 'react-bootstrap';

/**
 * CitySubMenu es un componente que muestra un submenú de ciudades para filtrar
 * la sección de cuartos. Cada ciudad se muestra como una pestaña.
 *
 * Props:
 * - cities: Array de strings con los nombres de las ciudades disponibles.
 * - selectedCity: String que indica la ciudad actualmente seleccionada.
 * - onSelectCity: Función callback que se invoca cuando el usuario selecciona una ciudad.
 */
const CitySubMenu = ({ cities, selectedCity, onSelectCity }) => {
  return (
    <Nav variant="tabs" activeKey={selectedCity} onSelect={(city) => onSelectCity(city)}>
      {cities.map((city) => (
        <Nav.Item key={city}>
          <Nav.Link eventKey={city}>{city}</Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
};

CitySubMenu.propTypes = {
  cities: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCity: PropTypes.string.isRequired,
  onSelectCity: PropTypes.func.isRequired,
};

export default CitySubMenu;