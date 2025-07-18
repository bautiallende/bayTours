import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';

/**
 * CreateTransportModal
 * Modal para crear un nuevo método de transporte
 * Props:
 *  - show: boolean
 *  - onHide: función para cerrar
 *  - onCreate: función que recibe payload para POST
 *  - creationDate: 'YYYY-MM-DD' fecha seleccionada en el calendario
 */
const CreateTransportModal = ({ show, onHide, onCreate, creationDate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Formulario
  const [formData, setFormData] = useState({
    mode: 'bus',
    operator_name: '',
    reference_code: '',
    departure_time: `${creationDate || ''}T00:00`,
    notes: ''
  });

  // Si cambia la fecha, resetear departure_time
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      departure_time: creationDate ? `${creationDate}T00:00` : prev.departure_time
    }));
  }, [creationDate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setError(null);
    if (!formData.mode || !formData.departure_time) {
      setError('Modo y hora de salida son obligatorios.');
      return;
    }
    // Preparar payload
    const payload = {
      mode: formData.mode,
      operator_name: formData.operator_name || undefined,
      reference_code: formData.reference_code || undefined,
      departure_time: formData.departure_time,
      notes: formData.notes || undefined,
      updated_by: 'frontend-dev'
    };
    setLoading(true);
    onCreate(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Transporte</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <Spinner animation="border" className="mb-2" />}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Modo de Transporte</Form.Label>
              <Form.Select name="mode" value={formData.mode} onChange={handleChange}>
                <option value="bus">Bus</option>
                <option value="ferry">Ferry</option>
                <option value="train">Tren</option>
                <option value="flight">Vuelo</option>
                <option value="boat">Barco</option>
                <option value="walk">Caminata</option>
                <option value="gondola">Góndola</option>
                <option value="other">Otro</option>
              </Form.Select>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Operador</Form.Label>
              <Form.Control
                type="text"
                name="operator_name"
                value={formData.operator_name}
                onChange={handleChange}
                placeholder="Nombre del operador"
              />
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Código de Referencia</Form.Label>
              <Form.Control
                type="text"
                name="reference_code"
                value={formData.reference_code}
                onChange={handleChange}
                placeholder="Código o referencia"
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Hora de Salida</Form.Label>
              <Form.Control
                type="datetime-local"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12} className="mb-3">
              <Form.Label>Notas</Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notas adicionales"
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>Crear Transporte</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTransportModal;
