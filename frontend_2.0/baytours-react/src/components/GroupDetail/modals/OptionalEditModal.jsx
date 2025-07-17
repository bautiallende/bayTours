import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';

/**
 * OptionalEditModal
 * Modal para editar una actividad opcional existente
 * Props:
 *  - show: boolean
 *  - onHide: función
 *  - onSave: función que recibe payload para PATCH
 *  - event: objeto FullCalendar Event
 */
const OptionalEditModal = ({ show, onHide, onSave, event }) => {
  const initialCommentRef = useRef('');
  const [localGuides, setLocalGuides] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [guidesError, setGuidesError] = useState(null);

  // Helper para extraer props en inglés o español
  const getProp = (eng, esp) => event.extendedProps[eng] ?? event.extendedProps[esp] ?? '';

  // Calcular duración en minutos
  const computeDuration = () => {
    if (event.start && event.end) {
      const start = new Date(event.start);
      const end = new Date(event.end);
      return Math.max(0, Math.round((end - start) / 60000));
    }
    return '';
  };

  // Estado del formulario
  const [formData, setFormData] = useState({
    time: event.startStr?.slice(11, 16) || '',
    duration: computeDuration(),
    reservation_n: getProp('reservation_n', 'reservationNumber') || '',
    status_optional: getProp('status_optional', 'EstadoOpcional') || '',
    id_local_guide: getProp('guide', 'id_local_guide') || '',
    comment: ''
  });

  // Cargar guías locales según ciudad
  useEffect(() => {
    const city = getProp('city', 'City') || getProp('Ciudad', 'Ciudad');
    if (!city) return;
    setLoadingGuides(true);
    fetch(`${process.env.REACT_APP_API_URL}/local_guides/local_guides?city=${encodeURIComponent(city)}`)
      .then(res => { if (!res.ok) throw new Error('Network error'); return res.json(); })
      .then(data => { setLocalGuides(data); setGuidesError(null); })
      .catch(err => { console.error('Error loading guides', err); setGuidesError('No se pudieron cargar los guías'); })
      .finally(() => setLoadingGuides(false));
  }, [event]);

  // Al montar o cambiar evento: guardar comentario previo y limpiar textarea
  useEffect(() => {
    const initial = getProp('Comentarios', 'Comentario') || '';
    initialCommentRef.current = initial;
    setFormData(prev => ({
      ...prev,
      time: event.startStr?.slice(11, 16) || '',
      duration: computeDuration(),
      status_optional: getProp('Estado', 'EstadoOpcional') || '',
      reservation_n: getProp('Numero de reserva', 'reservationNumber') || '',
      id_local_guide: getProp('guide', 'id_local_guide') || '',
      comment: ''
    }));
  }, [event]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.time) {
      alert('La hora es obligatoria.');
      return;
    }
    // Concatenar comentarios previos y nuevos
    const allComments =
      (initialCommentRef.current ? initialCommentRef.current + '\n' : '') +
      (formData.comment ? `- ${formData.comment}\n` : '');

    const payload = {
      id_days: event.extendedProps.id_days,
      id_optional: event.extendedProps.id_optional,
      PAX: event.extendedProps.Pax,
      time: formData.time,
      duration: Number(formData.duration)/60 || undefined,
      reservation_n: formData.reservation_n || undefined,
      status_optional: formData.status_optional || undefined,
      id_local_guide: Number(formData.id_local_guide) || undefined,
      comment: allComments,
      updated_by: 'frontend-dev'
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Actividad Opcional</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Carga de guías */}
        {loadingGuides && <Spinner animation="border" />}
        {guidesError && <Alert variant="danger">{guidesError}</Alert>}

        <Form>
          {/* Fila 1: hora, duración, reserva */}
          <Row>
            <Col md={4} className="mb-3">
              <Form.Label>Hora</Form.Label>
              <Form.Control type="time" name="time" value={formData.time} onChange={handleChange} />
            </Col>
            <Col md={4} className="mb-3">
              <Form.Label>Duración (min)</Form.Label>
              <Form.Control type="number" name="duration" value={formData.duration} onChange={handleChange} />
            </Col>
            <Col md={4} className="mb-3">
              <Form.Label>N° Reserva</Form.Label>
              <Form.Control type="text" name="reservation_n" value={formData.reservation_n} onChange={handleChange} placeholder="Código de reserva" />
            </Col>
          </Row>

          {/* Fila 2: estado, guía local */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select name="status_optional" value={formData.status_optional} onChange={handleChange}>
                <option value="">Selecciona estado</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Aprobado</option>
                <option value="cancelled">Cancelado</option>
              </Form.Select>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Guía Local</Form.Label>
              <Form.Select name="id_local_guide" value={formData.id_local_guide} onChange={handleChange}>
                <option value="">Selecciona un guía</option>
                {localGuides.map(g => (
                  <option key={g.id_local_guide} value={g.id_local_guide}>{g.name} {g.surname}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Fila 3: comentario */}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Label>Agregar Comentario</Form.Label>
              <Form.Control as="textarea" name="comment" rows={3} value={formData.comment} onChange={handleChange} placeholder="Escribe un nuevo comentario..." />
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

export default OptionalEditModal;
