import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const RoomFilterModal = ({ show, onHide, onApplyFilters, availableHotels, availableCities, availableRoomTypes }) => {
    console.log('availableHotels', availableHotels);
    console.log('availableCities', availableCities);
    console.log('availableRoomTypes', availableRoomTypes);

    // Estados para cada filtro
  const [passengers, setPassengers] = useState([]); // Si se requiere multiselección
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [sex, setSex] = useState('');
  const [date, setDate] = useState('');
  const [hotel, setHotel] = useState('');
  const [city, setCity] = useState('');
  const [roomType, setRoomType] = useState('');
  const [roomPrice, setRoomPrice] = useState('');
  const [complement, setComplement] = useState('');
  const [status, setStatus] = useState('');
  
  // Opciones fijas
  const sexOptions = ['Todos', 'Masculino', 'Femenino'];
  const statusOptions = ['Todos', 'Nuevo', 'En revisión', 'Confirmado', 'Provisorio'];

  // Reiniciar filtros cuando se abre el modal
  useEffect(() => {
    if (show) {
      setPassengers([]);
      setMinAge('');
      setMaxAge('');
      setSex('');
      setDate('');
      setHotel('');
      setCity('');
      setRoomType('');
      setRoomPrice('');
      setComplement('');
      setStatus('');
    }
  }, [show]);

  const handleApply = () => {
    // Crear objeto de filtros solo con las claves con valor
    const filters = {};
    if (passengers.length) filters.passengers = passengers;
    if (minAge) filters.min_age = minAge;
    if (maxAge) filters.max_age = maxAge;
    if (sex && sex !== 'Todos') filters.sex = sex;
    if (date) filters.date = date;
    if (hotel && hotel !== 'Todos') filters.hotel = hotel;
    if (city && city !== 'Todos') filters.city = city;
    if (roomType && roomType !== 'Todos') filters.room_type = roomType;
    if (roomPrice) filters.room_price = roomPrice;
    if (complement) filters.complement = complement;
    if (status && status !== 'Todos') filters.status = status;

    onApplyFilters(filters);
    onHide();
  };

  const handleClear = () => {
    // Limpiar filtros y cerrar el modal
    setPassengers([]);
    setMinAge('');
    setMaxAge('');
    setSex('');
    setDate('');
    setHotel('');
    setCity('');
    setRoomType('');
    setRoomPrice('');
    setComplement('');
    setStatus('');
    onApplyFilters({}); // Enviar un objeto vacío
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Filtrar Habitaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Fila 1: Edad y Sexo */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="filterMinAge">
                <Form.Label>Edad Mínima</Form.Label>
                <Form.Control
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  placeholder="Mínima"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filterMaxAge">
                <Form.Label>Edad Máxima</Form.Label>
                <Form.Control
                  type="number"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  placeholder="Máxima"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filterSex">
                <Form.Label>Sexo</Form.Label>
                <Form.Select value={sex} onChange={(e) => setSex(e.target.value)}>
                  {sexOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {/* Fila 2: Fecha y Hotel */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="filterDate">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="filterHotel">
                <Form.Label>Hotel</Form.Label>
                <Form.Select value={hotel} onChange={(e) => setHotel(e.target.value)}>
                  <option value="">Todos</option>
                  {availableHotels.map((h) => (
                    <option key={h.id_hotel} value={h.hotel_name}>
                      {h.hotel_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {/* Fila 3: Ciudad y Tipo de Habitación */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="filterCity">
                <Form.Label>Ciudad</Form.Label>
                <Form.Select value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">Todos</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="filterRoomType">
                <Form.Label>Tipo de Habitación</Form.Label>
                <Form.Select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                  <option value="">Todos</option>
                  {availableRoomTypes.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {/* Fila 4: Precio y Complemento */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="filterRoomPrice">
                <Form.Label>Precio Máximo</Form.Label>
                <Form.Control
                  type="number"
                  value={roomPrice}
                  onChange={(e) => setRoomPrice(e.target.value)}
                  placeholder="Precio máximo"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="filterComplement">
                <Form.Label>Complemento Máximo</Form.Label>
                <Form.Control
                  type="number"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Complemento máximo"
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Fila 5: Status */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="filterStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Todos</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClear}>
          Limpiar Filtros
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Aplicar Filtros
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

RoomFilterModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onApplyFilters: PropTypes.func.isRequired,
  availableHotels: PropTypes.array.isRequired,
  availableCities: PropTypes.array.isRequired,
  availableRoomTypes: PropTypes.array.isRequired,
};

export default RoomFilterModal;