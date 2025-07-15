import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

/**
 * PermitEditModal
 * Modal para editar un permiso enlazado a calendario
 * Props:
 *  - show: boolean para mostrar/ocultar
 *  - onHide: función para cerrar
 *  - onSave: función que recibe datos para el PATCH
 *  - event: objeto FullCalendar Event
 */
const PermitEditModal = ({ show, onHide, onSave, event }) => {
  // Ref para conservar comentario inicial
  const initialNotesRef = useRef('');

  // Funciones para extraer props (inglés o castellano)
  const getProp = (eng, esp) => event.extendedProps[eng] ?? event.extendedProps[esp] ?? '';

  const subtractOneDay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  };

  // Estado del formulario
  const [formData, setFormData] = useState({
    valid_from: event.startStr,
    valid_to: subtractOneDay(event.endStr),
    status: getProp('status', 'Estado'),
    permit_number: getProp('permitNumber', 'Numero de permiso'),
    provider: getProp('provider', 'Proveedor'),
    price: getProp('price', 'Precio') ?? '',
    payed_with: getProp('payedWith', 'Pagado con'),
    payment_date: getProp('paymentDate', 'Fecha de pago'),
    comments: '' // textarea vacío para nuevo comentario
  });

  // Al montar o cambiar event: guardar comentario previo y limpiar textarea
  useEffect(() => {
    const initial = getProp('comments', 'Comentarios');
    initialNotesRef.current = initial;
    setFormData(prev => ({ ...prev, comments: '' }));
  }, [event]);

  // Manejar cambios de inputs
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Al guardar: concatenar comentario antiguo + nuevo
  const handleSubmit = () => {
    if (formData.valid_from && formData.valid_to && formData.valid_from > formData.valid_to) {
      alert('La fecha inicio debe ser anterior o igual a fecha fin.');
      return;
    }
    // Construir string de comentarios
    const combinedComments = 
      (initialNotesRef.current ? initialNotesRef.current + '\n' : '') +
      (formData.comments ? `- ${formData.comments}\n` : '');

    onSave({
      valid_from: formData.valid_from,
      valid_to: formData.valid_to,
      status: formData.status,
      permit_number: formData.permit_number,
      provider: formData.provider,
      price: formData.price,
      payed_with: formData.payed_with,
      payment_date: formData.payment_date,
      comments: combinedComments,
      updated_by: 'frontend-dev' // Asignar usuario que actualiza
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Permiso</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Fecha inicio</Form.Label>
              <Form.Control
                type="date"
                name="valid_from"
                value={formData.valid_from}
                onChange={handleChange}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Fecha fin</Form.Label>
              <Form.Control
                type="date"
                name="valid_to"
                value={formData.valid_to}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pendiente</option>
                <option value="submitted">Enviado</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </Form.Select>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Número de permiso</Form.Label>
              <Form.Control
                type="text"
                name="permit_number"
                value={formData.permit_number}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Proveedor</Form.Label>
              <Form.Control
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Tarjeta usada</Form.Label>
              <Form.Control
                type="text"
                name="payed_with"
                value={formData.payed_with}
                onChange={handleChange}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Fecha de pago</Form.Label>
              <Form.Control
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12} className="mb-3">
              <Form.Label>Agregar comentario</Form.Label>
              <Form.Control
                as="textarea"
                name="comments"
                rows={3}
                placeholder="Escribe un nuevo comentario..."
                value={formData.comments}
                onChange={handleChange}
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>Guardar cambios</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PermitEditModal;
