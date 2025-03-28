import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const HotelFilterModal = ({ show, onHide, onApplyFilters, idGroup }) => {
  // Estados para almacenar las opciones dinámicas obtenidas desde el backend
  const [cityOptions, setCityOptions] = useState([]);
  const [hotelOptions, setHotelOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [checkInOptions, setCheckInOptions] = useState([]);
  const [checkOutOptions, setCheckOutOptions] = useState([]);

  // Estados para cada filtro seleccionado
  const [city, setCity] = useState('Todos');
  const [hotel, setHotel] = useState('Todos');
  const [currency, setCurrency] = useState('Todos');
  const [date, setDate] = useState('Todos');

  // Para check_in y check_out se usan inputs tipo date
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const [pax, setPax] = useState('');
  // Para los booleanos, usaremos switches con etiqueta interactiva (Sí/No)
  const [roomingList, setRoomingList] = useState(false);
  const [proForma, setProForma] = useState(false);
  const [factura, setFactura] = useState(false);
  const [iga, setIga] = useState(false);
  const [payedBy, setPayedBy] = useState('');

  // Para "Fecha de Pago" y "Fecha de Pago Realizado" se incluye operador y fecha
  const [paymentDateOp, setPaymentDateOp] = useState('>');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentDoneDateOp, setPaymentDoneDateOp] = useState('>');
  const [paymentDoneDate, setPaymentDoneDate] = useState('');

  // Al abrir el modal, obtenemos las opciones vía fetch
  useEffect(() => {
    if (show && idGroup) {
      fetch(`${process.env.REACT_APP_API_URL}/hotels_reservation/get_hotel_reservation?id_group=${idGroup}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success' && data.hotel_assignments) {
            const assignments = data.hotel_assignments;
            const cities = Array.from(new Set(assignments.map(a => a.city).filter(Boolean)));
            const hotels = Array.from(new Set(assignments.map(a => a.hotel_name).filter(Boolean)));
            const currencies = Array.from(new Set(assignments.map(a => a.currency).filter(Boolean)));
            const dates = Array.from(new Set(assignments.map(a => a.date).filter(Boolean)));
            const checkIns = Array.from(new Set(assignments.map(a => a.check_in).filter(val => val && val.trim() !== '')));
            const checkOuts = Array.from(new Set(assignments.map(a => a.check_out).filter(val => val && val.trim() !== '')));
            setCityOptions(['Todos', ...cities]);
            setHotelOptions(['Todos', ...hotels]);
            setCurrencyOptions(['Todos', ...currencies]);
            setDateOptions(['Todos', ...dates]);
            setCheckInOptions(['Todos', ...checkIns]);
            setCheckOutOptions(['Todos', ...checkOuts]);
            // Preconfiguramos check_in y check_out: usamos el primer y último valor de "dates" (si hay)
            if (dates.length > 0) {
              const sortedDates = dates
                .map(d => {
                  // Suponiendo formato "DD/MM/YYYY", lo convertimos a ISO:
                  const [day, month, year] = d.split('/');
                  return new Date(`${year}-${month}-${day}`);
                })
                .sort((a, b) => a - b);
              const first = sortedDates[0];
              const last = sortedDates[sortedDates.length - 1];
              setCheckIn(first ? first.toISOString().split('T')[0] : '');
              setCheckOut(last ? last.toISOString().split('T')[0] : '');
              setPaymentDate(first ? first.toISOString().split('T')[0] : '');
              setPaymentDoneDate(first ? first.toISOString().split('T')[0] : '');
            }
          }
        })
        .catch((err) => console.error('Error al obtener opciones de filtro:', err));
    }
  }, [show, idGroup]);

  // Función para limpiar filtros y cerrar el modal, realizando un GET sin filtros
  const handleClear = () => {
    setCity('Todos');
    setHotel('Todos');
    setCurrency('Todos');
    setDate('Todos');
    setCheckIn('');
    setCheckOut('');
    setPax('');
    setRoomingList(false);
    setProForma(false);
    setFactura(false);
    setIga(false);
    setPayedBy('');
    setPaymentDateOp('>');
    setPaymentDate('');
    setPaymentDoneDateOp('>');
    setPaymentDoneDate('');
    onApplyFilters({});
    onHide();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Se arma el objeto de filtros
    const filters = {};
    if (city !== 'Todos') filters.city = city;
    if (hotel !== 'Todos') filters.hotel = hotel;
    if (currency !== 'Todos') filters.currency = currency;
    if (date !== 'Todos') filters.date = date;
    if (checkIn) filters.check_in = checkIn;
    if (checkOut) filters.check_out = checkOut;
    if (pax) filters.pax = pax;
    if (roomingList) filters.rooming_list = true;
    if (proForma) filters.pro_forma = true;
    if (factura) filters.factura = true;
    if (iga) filters.iga = true;
    if (payedBy) filters.payed_by = payedBy;
    // Para las fechas de pago, usamos un objeto con operador y valor
    if (paymentDate) filters.payment_date = { op: paymentDateOp, value: paymentDate };
    if (paymentDoneDate) filters.payment_done_date = { op: paymentDoneDateOp, value: paymentDoneDate };

    onApplyFilters(filters);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Filtrar Asignaciones de Hoteles</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={4}>
              <Form.Group controlId="filterCity" className="mb-3">
                <Form.Label>Ciudad</Form.Label>
                <Form.Select value={city} onChange={(e) => setCity(e.target.value)}>
                  {cityOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filterHotel" className="mb-3">
                <Form.Label>Hotel</Form.Label>
                <Form.Select value={hotel} onChange={(e) => setHotel(e.target.value)}>
                  {hotelOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filterCurrency" className="mb-3">
                <Form.Label>Divisa</Form.Label>
                <Form.Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {currencyOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group controlId="filterDate" className="mb-3">
                <Form.Label>Fecha</Form.Label>
                <Form.Select value={date} onChange={(e) => setDate(e.target.value)}>
                  {dateOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filterCheckIn" className="mb-3">
                <Form.Label>Check-in</Form.Label>
                <Form.Control
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filterCheckOut" className="mb-3">
                <Form.Label>Check-out</Form.Label>
                <Form.Control
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group controlId="filterPax" className="mb-3">
                <Form.Label>PAX</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Cantidad"
                  value={pax}
                  onChange={(e) => setPax(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filterRoomingList" className="mb-3">
                <Form.Label>Rooming List</Form.Label>
                <Form.Check
                  type="switch"
                  label={roomingList ? "Sí" : "No"}
                  checked={roomingList}
                  onChange={(e) => setRoomingList(e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filterProForma" className="mb-3">
                <Form.Label>Pro Forma</Form.Label>
                <Form.Check
                  type="switch"
                  label={proForma ? "Sí" : "No"}
                  checked={proForma}
                  onChange={(e) => setProForma(e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group controlId="filterFactura" className="mb-3">
                <Form.Label>Factura Emitida</Form.Label>
                <Form.Check
                  type="switch"
                  label={factura ? "Sí" : "No"}
                  checked={factura}
                  onChange={(e) => setFactura(e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filterIga" className="mb-3">
                <Form.Label>IGA Gestionado</Form.Label>
                <Form.Check
                  type="switch"
                  label={iga ? "Sí" : "No"}
                  checked={iga}
                  onChange={(e) => setIga(e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filterPayedBy" className="mb-3">
                <Form.Label>Pagado por</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre"
                  value={payedBy}
                  onChange={(e) => setPayedBy(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="filterPaymentDate" className="mb-3">
                <Form.Label>Fecha de Pago</Form.Label>
                <Row>
                  <Col xs={4}>
                    <Form.Select value={paymentDateOp} onChange={(e) => setPaymentDateOp(e.target.value)}>
                      <option value=">">Mayor que</option>
                      <option value="Igual">Igual</option>
                      <option value="<">Menor que</option>
                    </Form.Select>
                  </Col>
                  <Col xs={8}>
                    <Form.Control
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </Col>
                </Row>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="filterPaymentDoneDate" className="mb-3">
                <Form.Label>Fecha de Pago Realizado</Form.Label>
                <Row>
                  <Col xs={4}>
                    <Form.Select value={paymentDoneDateOp} onChange={(e) => setPaymentDoneDateOp(e.target.value)}>
                      <option value=">">Mayor que</option>
                      <option value="Igual">Igual</option>
                      <option value="<">Menor que</option>
                    </Form.Select>
                  </Col>
                  <Col xs={8}>
                    <Form.Control
                      type="date"
                      value={paymentDoneDate}
                      onChange={(e) => setPaymentDoneDate(e.target.value)}
                    />
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={handleClear}>
            Limpiar Filtros
          </Button>
          <Button variant="primary" type="submit">
            Aplicar Filtros
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

HotelFilterModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onApplyFilters: PropTypes.func.isRequired,
  idGroup: PropTypes.string.isRequired,
};

export default HotelFilterModal;