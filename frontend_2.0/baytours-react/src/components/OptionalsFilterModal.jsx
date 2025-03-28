import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

const OptionalsFilterModal = ({ show, onHide, idGroup, current_table, onFiltersApplied }) => {
  const navigate = useNavigate();

  // Estados para los filtros
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [filterMinAge, setFilterMinAge] = useState('');
  const [filterMaxAge, setFilterMaxAge] = useState('');
  const [filterSex, setFilterSex] = useState('');
  const [filterPlaceOfPurchase, setFilterPlaceOfPurchase] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');

  // Opciones para cada desplegable (se cargan desde la API)
  const [passengersOptions, setPassengersOptions] = useState([]);
  const [citiesOptions, setCitiesOptions] = useState([]);
  const [activitiesOptions, setActivitiesOptions] = useState([]);

  useEffect(() => {
    // Cargar pasajeros
    fetch(`${process.env.REACT_APP_API_URL}/clients/clents_group?id_group=${encodeURIComponent(idGroup)}`)
      .then(r => r.json())
      .then(data => {
        const options = data.map(p => ({
          value: p.id_clients,
          label: [p.first_name, p.second_name, p.paternal_surname, p.mother_surname].filter(Boolean).join(' ')
        }));
        setPassengersOptions(options);
      })
      .catch(err => console.error('Error al cargar pasajeros:', err));

    // Cargar ciudades
    fetch(`${process.env.REACT_APP_API_URL}/days/get_days_for_filter?id_group=${encodeURIComponent(idGroup)}`)
      .then(r => r.json())
      .then(data => {
        // Suponemos que data es un array de nombres de ciudad
        const options = data.map(cityName => ({
          value: cityName,
          label: cityName
        }));
        setCitiesOptions(options);
      })
      .catch(err => console.error('Error al cargar ciudades:', err));

    // Cargar actividades
    fetch(`${process.env.REACT_APP_API_URL}/activity/activity_by_id_group?id_group=${encodeURIComponent(idGroup)}`)
      .then(r => r.json())
      .then(data => {
        // Suponemos que cada objeto tiene Activity.id_optional y name
        const options = data.map(activity => ({
          value: activity.Activity.id_optional,
          label: activity.name
        }));
        setActivitiesOptions(options);
      })
      .catch(err => console.error('Error al cargar actividades:', err));
  }, [idGroup]);

  const handleApplyFilter = () => {
    let filters = {
      passengers: selectedPassengers.length > 0 ? selectedPassengers.map(o => o.value) : undefined,
      min_age: filterMinAge || undefined,
      max_age: filterMaxAge || undefined,
      sex: filterSex || undefined,
      city: selectedCities.length > 0 ? selectedCities.map(o => o.value) : undefined,
      activity_id: selectedActivities.length > 0 ? selectedActivities.map(o => o.value) : undefined,
      place_of_purchase: filterPlaceOfPurchase || undefined,
      payment_method: filterPaymentMethod || undefined,
    };

    // Eliminar campos undefined
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    // Si se proporciona onFiltersApplied, lo llamamos; de lo contrario, navegamos
    if (onFiltersApplied) {
      onFiltersApplied(filters);
    } else {
      const filtersParam = encodeURIComponent(JSON.stringify(filters));
      navigate(`/grupo/${idGroup}?table=${current_table}&filters=${filtersParam}`);
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Filtrar Opcionales</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Pasajeros</Form.Label>
              <Select
                isMulti
                options={passengersOptions}
                value={selectedPassengers}
                onChange={setSelectedPassengers}
                placeholder="Seleccionar pasajeros"
              />
              <Form.Text className="text-muted">
                Seleccione uno o varios pasajeros.
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="filterSex">
              <Form.Label>Sexo</Form.Label>
              <Form.Select value={filterSex} onChange={(e) => setFilterSex(e.target.value)}>
                <option value="">Todos</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="filterMinAge">
              <Form.Label>Edad Mínima</Form.Label>
              <Form.Control type="number" min="0" value={filterMinAge} onChange={(e) => setFilterMinAge(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="filterMaxAge">
              <Form.Label>Edad Máxima</Form.Label>
              <Form.Control type="number" min="0" value={filterMaxAge} onChange={(e) => setFilterMaxAge(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Ciudades</Form.Label>
              <Select
                isMulti
                options={citiesOptions}
                value={selectedCities}
                onChange={setSelectedCities}
                placeholder="Seleccionar ciudades"
              />
              <Form.Text className="text-muted">
                Seleccione una o varias ciudades.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Actividades</Form.Label>
              <Select
                isMulti
                options={activitiesOptions}
                value={selectedActivities}
                onChange={setSelectedActivities}
                placeholder="Seleccionar actividades"
              />
              <Form.Text className="text-muted">
                Seleccione una o varias actividades.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="filterPlaceOfPurchase">
              <Form.Label>Lugar de compra</Form.Label>
              <Form.Select
                value={filterPlaceOfPurchase}
                onChange={(e) => setFilterPlaceOfPurchase(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="before_trip">Antes del viaje</option>
                <option value="during_trip">Durante el viaje</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="filterPaymentMethod">
              <Form.Label>Método de pago</Form.Label>
              <Form.Select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="credit_card">Tarjeta de crédito</option>
                <option value="debit_card">Tarjeta de débito</option>
                <option value="cash">Efectivo</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleApplyFilter}>Aplicar Filtro</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OptionalsFilterModal;