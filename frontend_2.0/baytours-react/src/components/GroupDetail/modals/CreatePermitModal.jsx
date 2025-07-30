import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';

/**
 * CreatePermitModal
 * Modal para crear un nuevo permiso de ciudad para un grupo
 * Props:
 *  - show: boolean
 *  - onHide: función para cerrar
 *  - onCreate: función que recibe payload para POST
 *  - groupId: id del grupo al que pertenece el permiso
 *  - creationDate: 'YYYY-MM-DD' fecha seleccionada en el calendario
 */
const CreatePermitModal = ({ show, onHide, onCreate, groupId, creationDate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    id_permit:'',
    id_city: '',
    id_transport: '',
    valid_from: creationDate || '',
    valid_to: creationDate || '',
    status: 'pending',
    permit_number: '',
    managed_by: '',
    provider: '',
    price: '',
    payed_with: '',
    payment_date: '',
    comments: ''
  });

  // Obtener id_city a partir del día
  useEffect(() => {
    if (!creationDate) return;
    fetch(`${process.env.REACT_APP_API_URL}/days/get_days_by_group_and_date?id_group=${groupId}&date=${creationDate}`)
      .then(res => { if (!res.ok) throw new Error('Network error fetching day'); return res.json(); })
      .then(data => {
        // data podría ser lista o único objeto
        const day = Array.isArray(data) ? data[0] : data;
        if (day?.id_city) {
          setFormData(prev => ({ ...prev, id_city: day.id_city }));
        }
      })
      .catch(err => console.error('Error fetching day info', err));
  }, [groupId, creationDate]);

  // Obtener id_transport desde grupo
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/groups/get_group_by_id?id_group=${groupId}`)
      .then(res => { if (!res.ok) throw new Error('Network error fetching group'); return res.json(); })
      .then(group => {
        if (group?.id_transport) {
          setFormData(prev => ({ ...prev, id_transport: group.id_transport }));
        }
      })
      .catch(err => console.error('Error fetching group info', err));
  }, [groupId]);

  // Sincronizar fechas al cambiar creationDate
  useEffect(() => {
    if (creationDate) {
      setFormData(prev => ({ ...prev, valid_from: creationDate, valid_to: creationDate }));
    }
  }, [creationDate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setError(null);
    // Validación básica
    if (!formData.id_city || !formData.id_transport || !formData.valid_from || !formData.valid_to) {
      setError('Error interno: falta id_city o id_transport o fechas.');
      console.error('Validation error: missing required fields', formData);
      return;
    }
    const payload = {
      id_permit:'',
      id_group: groupId,
      id_city: formData.id_city,
      id_transport: formData.id_transport,
      valid_from: formData.valid_from,
      valid_to: formData.valid_to,
      status: formData.status,
      permit_number: formData.permit_number || undefined,
      managed_by: formData.managed_by || undefined,
      provider: formData.provider || undefined,
      price: formData.price ? Number(formData.price) : undefined,
      payed_with: formData.payed_with || undefined,
      payment_date: formData.payment_date || undefined,
      comments: formData.comments || undefined,
      updated_by: 'frontend-dev'
    };
    setLoading(true);
    onCreate(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Permiso</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <Spinner animation="border" className="mb-2" />}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Control type="hidden" name="id_city" value={formData.id_city} />
          <Form.Control type="hidden" name="id_transport" value={formData.id_transport} />
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Fecha desde</Form.Label>
              <Form.Control
                type="date"
                name="valid_from"
                value={formData.valid_from}
                onChange={handleChange}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Fecha hasta</Form.Label>
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
                placeholder="Número de permiso"
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
                placeholder="Proveedor"
              />
            </Col>
            <Col md={3} className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Precio"
              />
            </Col>
            <Col md={3} className="mb-3">
              <Form.Label>Pagado con</Form.Label>
              <Form.Control
                type="text"
                name="payed_with"
                value={formData.payed_with}
                onChange={handleChange}
                placeholder="Método de pago"
              />
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Fecha de pago</Form.Label>
              <Form.Control
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Comentarios</Form.Label>
              <Form.Control
                as="textarea"
                name="comments"
                rows={3}
                value={formData.comments}
                onChange={handleChange}
                placeholder="Notas adicionales"
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>Crear Permiso</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePermitModal;
