import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, ButtonGroup } from 'react-bootstrap';
import OptionalCardsList from './OptionalCardsList';

const AddOptionalModal = ({ 
  show, 
  onHide, 
  clientId, 
  groupId, 
  city, 
  cityDays, 
  clientName, 
  onOptionalAdded,
  clientAge // para determinar el precio según la edad
}) => {
  const [selectedDayId, setSelectedDayId] = useState('');
  const [availableOptionals, setAvailableOptionals] = useState([]);
  const [selectedOptional, setSelectedOptional] = useState(null);
  
  // Estados para el formulario
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [placeOfPurchase, setPlaceOfPurchase] = useState('before_trip');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [total, setTotal] = useState(0);

  // Al mostrar el modal, seleccionar el primer día disponible
  useEffect(() => {
    if (show && cityDays && cityDays.length > 0) {
      setSelectedDayId(cityDays[0].id);
    }
  }, [show, cityDays]);

  // Cuando cambia el día seleccionado, se carga la lista de opcionales disponibles y se filtran los ya asignados
  useEffect(() => {
    if (selectedDayId && clientId) {
      // Primero, obtener todas las actividades opcionales disponibles para el día
      fetch(`${process.env.REACT_APP_API_URL}/optionals_purchase?id_group=${groupId}&id_days=${selectedDayId}`)
        .then(res => res.json())
        .then(data => {
          const allOptionals = (data.optionals || []).filter(opt => opt.id_optional && opt.name);
          // Luego, obtener las actividades ya asignadas para este cliente y día
          fetch(`${process.env.REACT_APP_API_URL}/optionals_purchase/clients_optionals?client_id=${encodeURIComponent(clientId)}&id_days=${encodeURIComponent(selectedDayId)}&group_id=${groupId}`)
            .then(res2 => res2.json())
            .then(data2 => {
              const assignedOptionals = (data2.status === 'success' && data2.optionals && data2.optionals.length > 0)
                ? data2.optionals.map(o => o.id_optionals.toString().trim())
                : [];
              // Filtrar las actividades que ya están asignadas
              const validOptionals = allOptionals.filter(o => {
                return !assignedOptionals.includes(o.id_optional.toString().trim());
              });
              setAvailableOptionals(validOptionals);
              if (validOptionals.length > 0) {
                setSelectedOptional(validOptionals[0]);
                const prePrice = clientAge && clientAge < 12 ? validOptionals[0].minor_price : validOptionals[0].adult_price;
                setPrice(prePrice || 0);
              } else {
                setSelectedOptional(null);
                setPrice(0);
              }
            })
            .catch(error2 => {
              console.error('Error al cargar opcionales asignados:', error2);
              setAvailableOptionals(allOptionals);
            });
        })
        .catch(error => {
          console.error('Error al cargar opcionales:', error);
          setAvailableOptionals([]);
        });
    }
  }, [selectedDayId, groupId, clientId, clientAge]);

  // Actualiza el total cuando cambian precio o descuento
  useEffect(() => {
    const computedTotal = price - (price * (discount / 100));
    setTotal(computedTotal);
  }, [price, discount]);

  // Callback para actualizar la selección en las tarjetas
  const handleSelectOptional = (optional) => {
    setSelectedOptional(optional);
    const newPrice = clientAge && clientAge < 12 ? optional.minor_price : optional.adult_price;
    setPrice(newPrice || 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOptional) {
      alert('No hay actividad opcional seleccionada.');
      return;
    }
    const payload = {
      id_group: groupId,
      client_id: clientId,
      id_activity: selectedOptional.id_activity,
      id_optionals: parseInt(selectedOptional.id_optional, 10).toString(),
      price: parseFloat(price),
      discount: discount.toString(),
      place_of_purchase: placeOfPurchase,
      source: 'admin',
      payment_method: paymentMethod
    };
    fetch(`${process.env.REACT_APP_API_URL}/optionals_purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          onOptionalAdded(data);
          onHide();
        } else {
          alert('Error al agregar opcional: ' + (data.message || 'Error desconocido'));
        }
      })
      .catch(error => {
        console.error('Error al agregar opcional:', error);
        alert('Error al agregar opcional.');
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            Agregar opcionales para: <span style={{ textDecoration: 'underline' }}>{city}</span>, Cliente: <span style={{ textDecoration: 'underline' }}>{clientName}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Selección de día */}
          <Row className="mb-3">
            <Col>
              <ButtonGroup aria-label="Días disponibles">
                {cityDays.map((day) => (
                  <Button
                    key={day.id}
                    variant={day.id === selectedDayId ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedDayId(day.id)}
                  >
                    {day.date}
                  </Button>
                ))}
              </ButtonGroup>
            </Col>
          </Row>
          {/* Mostrar tarjetas de opcionales solo si hay disponibles */}
          {availableOptionals && availableOptionals.length > 0 ? (
            <OptionalCardsList 
              optionals={availableOptionals} 
              clientAge={clientAge} 
              onSelectOptional={handleSelectOptional} 
            />
          ) : (
            <p className="text-danger">No hay otro opcional disponible para este día.</p>
          )}
          {/* Solo mostrar los campos del formulario si hay opcionales disponibles */}
          {availableOptionals && availableOptionals.length > 0 && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="priceInput">
                    <Form.Label>Precio</Form.Label>
                    <Form.Control
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="discountInput">
                    <Form.Label>Descuento (%)</Form.Label>
                    <Form.Range
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                    <div>{discount}%</div>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="placeOfPurchase">
                    <Form.Label>Lugar de compra</Form.Label>
                    <Form.Select
                      value={placeOfPurchase}
                      onChange={(e) => setPlaceOfPurchase(e.target.value)}
                      required
                    >
                      <option value="before_trip">Antes del viaje</option>
                      <option value="during_trip">Durante el viaje</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="paymentMethod">
                    <Form.Label>Método de pago</Form.Label>
                    <Form.Select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    >
                      <option value="credit_card">Tarjeta de crédito</option>
                      <option value="debit_card">Tarjeta de débito</option>
                      <option value="cash">Efectivo</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="totalDisplay">
                    <Form.Label>Total</Form.Label>
                    <Form.Control type="text" value={`${total.toFixed(2)} €`} readOnly />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={availableOptionals.length === 0}>
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddOptionalModal;