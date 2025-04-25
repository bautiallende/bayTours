import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';

const EditOptionalModal = ({ show, onHide, clientId, groupId, currentOptionalData, optionalClientData, onOptionalUpdated }) => {
  // initialData contendrá los datos del opcional a editar
  const [price, setPrice] = useState(currentOptionalData?.price || 0);
  const [discount, setDiscount] = useState(currentOptionalData?.discount || 0);
  const [total, setTotal] = useState(0);
  const [placeOfPurchase, setPlaceOfPurchase] = useState(currentOptionalData?.place_of_purchase || 'before_trip');
  const [paymentMethod, setPaymentMethod] = useState(currentOptionalData?.payment_method || 'credit_card');

  useEffect(() => {
    setPrice(currentOptionalData?.price || 0);
    setDiscount(currentOptionalData?.discount || 0);
    setPlaceOfPurchase(currentOptionalData?.place_of_purchase || 'before_trip');
    setPaymentMethod(currentOptionalData?.payment_method || 'credit_card');
  }, [currentOptionalData]);

  useEffect(() => {
    const computedTotal = price - (price * (discount / 100));
    setTotal(computedTotal);
  }, [price, discount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('currentOptionalData:', currentOptionalData);
    console.log('optionalClientData:', optionalClientData);
    console.log('clientId:', clientId);
    const payload = {
      id_group: groupId,
      client_id: (clientId).toString(),
      id_activity: (currentOptionalData.id_activity),
      id_optionals: currentOptionalData.id_optionals.toString(),
      price: parseFloat(price),
      discount: discount.toString(),
      place_of_purchase: placeOfPurchase,
      source: 'admin',
      payment_method: paymentMethod
    };
    console.log('Datos enviados:', JSON.stringify(payload));

    fetch(`${process.env.REACT_APP_API_URL}/optionals_purchase`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          onOptionalUpdated(data);
          onHide();
        } else {
          alert('Error al actualizar el opcional: ' + (data.message || 'Error desconocido'));
        }
      })
      .catch(error => {
        console.error('Error al actualizar el opcional:', error);
        alert('Error al actualizar el opcional.');
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Opcional</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="editPrice">
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
              <Form.Group controlId="editDiscount">
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
            <Col>
              <Form.Group controlId="editTotal">
                <Form.Label>Total</Form.Label>
                <Form.Control type="text" value={`${total.toFixed(2)} €`} readOnly />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="editPlace">
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
              <Form.Group controlId="editPayment">
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button variant="primary" type="submit">Guardar Cambios</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditOptionalModal;