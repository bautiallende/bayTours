import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Row, Col, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';

// Static lists
const dayTypeOptions = [
  { value: '', label: 'Todos' },
  { value: 'any', label: 'Any' },
  { value: 'weekday', label: 'Weekday' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'holiday', label: 'Holiday' }
];
const paymentOptions = [
  { value: '', label: 'Todos' },
  { value: 'office', label: 'Desde la oficina' },
  { value: 'tour_leader', label: 'Tour Leader' }
];

export default function LocalGuidesFilterModal({ show, onHide, onApply, initialFilters, currentCity }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [filters, setFilters] = useState(initialFilters || {});
  const [optionals, setOptionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCurrencies] = useState(['EUR','USD','CHF','GBP','ARS','JPY','CNY','INR','BRL','CAD']);

  // Reset filters when city changes or modal reopened
  useEffect(() => {
    setFilters({}); // Clear filters on city change
    if (!currentCity) return;
    setLoading(true);
    fetch(`${API_URL}/optionals/get_optionals/${currentCity}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setOptionals(data.filter(o => o.name)))
      .catch(() => setOptionals([]))
      .finally(() => setLoading(false));
  }, [currentCity, API_URL]);

  const handleFieldChange = (name, value) => {
    setFilters(f => ({ ...f, [name]: value !== '' && value != null ? value : undefined }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = { ...filters };
    ['pax_min','pax_max','price_min','price_max'].forEach(key => {
      if (payload[key] != null) payload[key] = Number(payload[key]);
    });
    onApply(payload);
    onHide();
  };

  const handleReset = () => setFilters({});

  // Tag input handlers
  const addOptional = id => {
    const list = filters.id_optionals || [];
    if (!list.includes(id)) {
      setFilters(f => ({ ...f, id_optionals: [...list, id] }));
    }
  };
  const removeOptional = id => {
    const list = (filters.id_optionals || []).filter(i => i !== id);
    setFilters(f => ({ ...f, id_optionals: list.length ? list : undefined }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Filtros de Guías Locales</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Apellido & Pago */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Apellido empieza por</Form.Label>
                <Form.Control
                  name="surname"
                  value={filters.surname || ''}
                  onChange={e => handleFieldChange('surname', e.target.value)}
                  placeholder="Apellido..."
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Método de Pago</Form.Label>
                <Form.Select
                  name="payment_method"
                  value={filters.payment_method || ''}
                  onChange={e => handleFieldChange('payment_method', e.target.value)}
                >
                  {paymentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {/* Opcionales tags */}
          <Form.Group className="mb-3">
            <Form.Label>Opcionales</Form.Label>
            <div className="mb-2">
              {(filters.id_optionals || []).map(id => {
                const opt = optionals.find(o => o.id_optional === id);
                return (
                  <Badge bg="" key={id} className="me-1" style={{ backgroundColor: '#C0C9EE', color: '#000', borderStyle: "solid", borderColor: '#000', borderWidth: '1px' }}>
                    {opt?.name || id} <span style={{ cursor: 'pointer' }} onClick={() => removeOptional(id)}>×</span>
                  </Badge>
                );
              })}
            </div>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <Form.Select
                onChange={e => { addOptional(Number(e.target.value)); e.target.value = ''; }}
                defaultValue=""
              >
                <option value="" disabled>Seleccione opcional...</option>
                {optionals.map(o => (
                  <option key={o.id_optional} value={o.id_optional}>{o.name}</option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
          {/* Day type & Currency */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tipo de Día</Form.Label>
                <Form.Select
                  name="day_type"
                  value={filters.day_type || ''}
                  onChange={e => handleFieldChange('day_type', e.target.value)}
                >
                  {dayTypeOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Moneda</Form.Label>
                <Form.Select
                  name="currency"
                  value={filters.currency || ''}
                  onChange={e => handleFieldChange('currency', e.target.value)}
                >
                  <option value="">Todas</option>
                  {allCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {/* Pax & Price */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Pax Min</Form.Label>
                <Form.Control
                  type="number"
                  name="pax_min"
                  value={filters.pax_min || ''}
                  onChange={e => handleFieldChange('pax_min', e.target.value)}
                  min={1}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Pax Max</Form.Label>
                <Form.Control
                  type="number"
                  name="pax_max"
                  value={filters.pax_max || ''}
                  onChange={e => handleFieldChange('pax_max', e.target.value)}
                  min={1}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Precio Min</Form.Label>
                <Form.Control
                  type="number"
                  name="price_min"
                  value={filters.price_min || ''}
                  onChange={e => handleFieldChange('price_min', e.target.value)}
                  step="0.01"
                  min={0}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Precio Max</Form.Label>
                <Form.Control
                  type="number"
                  name="price_max"
                  value={filters.price_max || ''}
                  onChange={e => handleFieldChange('price_max', e.target.value)}
                  step="0.01"
                  min={0}
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Active */}
          <Row className="mb-3">
            <Col>
              <Form.Check
                type="checkbox"
                name="active"
                label="Activo"
                checked={filters.active || false}
                onChange={e => handleFieldChange('active', e.target.checked)}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleReset}>Limpiar</Button>
          <Button variant="primary" type="submit">Aplicar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

LocalGuidesFilterModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  initialFilters: PropTypes.object,
  currentCity: PropTypes.number.isRequired
};
