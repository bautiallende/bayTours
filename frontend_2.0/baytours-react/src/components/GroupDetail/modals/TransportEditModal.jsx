import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

/**
 * TransportEditModal
 * Modal para editar un método de transporte existente
 * Props:
 *  - show: boolean para mostrar/ocultar
 *  - onHide: función para cerrar
 *  - onSave: función que recibe el payload a enviar en el PATCH
 *  - event: objeto FullCalendar Event
 */
const TransportEditModal = ({ show, onHide, onSave, event }) => {
  // Formato para datetime-local (YYYY-MM-DDTHH:MM)
  const formatDateTime = iso => iso ? iso.replace('Z','').slice(0,16) : '';
  
  // Obtener propiedad de extendedProps (inglés o español)
  const getProp = (eng, esp) => {
    // Valores en Español: 'Metodo de transporte', 'Proveedores', 'Codigo de referencia', 'Horario de partida', 'Comentarios'
    return event.extendedProps[eng] ?? event.extendedProps[esp] ?? '';
  };

  // Estado para formulario de notas separado
type FormData = {
  // ... otros campos
  notes: string;
};

const initialNotesRef = useRef('');
const [formData, setFormData] = useState({
  // ... otros campos inicializados
  notes: '' // textarea vacío para nuevos comentarios
});

// Al montar, guardamos comentario inicial en ref y limpiamos textarea
useEffect(() => {
  const initial = event.extendedProps.Comentarios || event.extendedProps.comments || '';
  initialNotesRef.current = initial;
  setFormData(prev => ({ ...prev, notes: '' }));
}, [event]);

  // Sincronizar si cambia el evento
  useEffect(() => {
    setFormData({
      mode: getProp('mode', 'Metodo de transporte'),
      operator_name: getProp('operator_name', 'Proveedores'),
      reference_code: getProp('reference_code', 'Codigo de referencia'),
      departure_time: formatDateTime(getProp('departure_time', 'Horario de partida')),
      notes: getProp('notes', 'Comentarios'),
    });
  }, [event]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
  if (!formData.departure_time) {
    alert('La hora de salida es obligatoria.');
    return;
  }
  // Concatenar comentarios: inicial + nuevo
  const allComments = `${initialNotesRef.current ? initialNotesRef.current + '' : ''}- ${formData.notes}
`;
  onSave({
    ...formData,
    notes: allComments
  });
};

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Transporte</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
              <Form.Label>Código de referencia</Form.Label>
              <Form.Control
                type="text"
                name="reference_code"
                value={formData.reference_code}
                onChange={handleChange}
                placeholder="Código o referencia"
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Horario de partida</Form.Label>
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
              <Form.Label>Comentarios</Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                rows={3}
                onChange={handleChange}
                placeholder="Notas adicionales"
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransportEditModal;