import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, Row, Col, Table } from 'react-bootstrap';
import PropTypes from 'prop-types';

const dayTypeOptions = [
  { value: 'any', label: 'Any' },
  { value: 'weekday', label: 'Weekday' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'holiday', label: 'Holiday' },
];

export default function LocalGuideModal({ show, onHide, onSave, initialData, currentCity, currentCityName }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const defaultForm = { name: '', surname: '', phone: '', mail: '', active: true, comments: '', payment_method: 'office' };
  const [form, setForm] = useState(defaultForm);
  const [optionals, setOptionals] = useState([]);
  const [loadingOptionals, setLoadingOptionals] = useState(false);
  const [tariffs, setTariffs] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validated, setValidated] = useState(false);
  const [allCurrencies, setAllCurrencies] = useState([]);
  const favoriteCurrencies = ['EUR', 'USD', 'CHF', 'GBP'];

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setForm(defaultForm);
      setTariffs([]);
      setError(null);
      setValidated(false);
    }
  }, [show]);

  // Load static currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      const currencies = ['EUR','USD','CHF','GBP','ARS','JPY','CNY','INR','BRL','CAD'];
      setAllCurrencies(currencies);
    };
    fetchCurrencies();
  }, []);

  // Load initial data for edit
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        surname: initialData.surname,
        phone: initialData.phone,
        mail: initialData.mail,
        active: initialData.active,
        comments: initialData.comments,
        payment_method: initialData.payment_method || 'office'
      });
      setTariffs(initialData.tariffs || []);
    }
  }, [initialData]);

  // Load optionals for currentCity
  useEffect(() => {
    if (!currentCity) return;
    setLoadingOptionals(true);
    fetch(`${API_URL}/optionals/get_optionals/${currentCity}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setOptionals(data.filter(o => o.name)))
      .catch(err => setError('Error loading optionals'))
      .finally(() => setLoadingOptionals(false));
  }, [currentCity]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddTariff = () => {
    setTariffs(t => [...t, { id_optional:'', pax_min:'', pax_max:'', day_type:'any', price:'', currency:'', valid_from:'', valid_to:'', notes:'' }]);
  };
  const handleTariffChange = (i, f, v) => setTariffs(t => t.map((r, idx) => idx===i?{...r,[f]:v}:r));
  const handleRemoveTariff = i => setTariffs(t => t.filter((_,idx)=>idx!==i));

  const handleSubmit = async e => {
    e.preventDefault();
    const fr = e.currentTarget;
    if (!fr.checkValidity()) { setValidated(true); return; }
    setSaving(true);
    const payload = {
      name: form.name,
      surname: form.surname,
      phone: form.phone,
      mail: form.mail,
      id_city: currentCity,
      active: form.active,
      comments: form.comments,
      payment_method: form.payment_method,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: '',
      tariffs: tariffs.map(tr => ({
        id_optional: tr.id_optional?+tr.id_optional:null,
        pax_min: tr.pax_min?+tr.pax_min:1,
        pax_max: tr.pax_max?+tr.pax_max:null,
        day_type: tr.day_type||null,
        price: +tr.price,
        currency: tr.currency,
        valid_from: tr.valid_from||null,
        valid_to: tr.valid_to||null,
        notes: tr.notes||null
      }))
    };
    try {
      const method = initialData?'PUT':'POST';
      const url = `${API_URL}/local_guides/local_guide${initialData?`/${initialData.id_local_guide}`:''}`;
      const res = await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!res.ok) throw new Error('Error saving guide');
      onSave(await res.json());
      onHide();
    } catch(err) { setError(err.message); }
    finally{ setSaving(false); }
  };

  return (
    <Modal show={show} onHide={onHide} fullscreen backdrop="static">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{initialData?'Editar Guía Local':'Nuevo Guía Local'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error&&<Alert variant="danger">{error}</Alert>}
          <Row className="mb-3">
            <Col md={6}><Form.Group><Form.Label>Nombre</Form.Label><Form.Control name="name" value={form.name} onChange={handleChange} required/><Form.Control.Feedback type="invalid">Required</Form.Control.Feedback></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Apellido</Form.Label><Form.Control name="surname" value={form.surname} onChange={handleChange} required/><Form.Control.Feedback type="invalid">Required</Form.Control.Feedback></Form.Group></Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}><Form.Group><Form.Label>Teléfono</Form.Label><Form.Control type="tel" name="phone" value={form.phone} onChange={handleChange} pattern="\d+" required/><Form.Control.Feedback type="invalid">Only numbers</Form.Control.Feedback></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" name="mail" value={form.mail} onChange={handleChange} required/><Form.Control.Feedback type="invalid">Invalid</Form.Control.Feedback></Form.Group></Col>
          </Row>
          <Row className="mb-3 align-items-center">
            <Col md={6}><Form.Group><Form.Label>Ciudad</Form.Label><Form.Control plaintext readOnly defaultValue={currentCityName}/></Form.Group></Col>
            <Col md={6}><Form.Group className="d-flex align-items-center"><Form.Check type="checkbox" name="active" label="Activo" checked={form.active} onChange={handleChange}/></Form.Group></Col>
          </Row>
          <Row className="mb-3"><Col md={6}><Form.Group><Form.Label>Método de Pago</Form.Label><Form.Select name="payment_method" value={form.payment_method} onChange={handleChange} required><option value="office">Desde la oficina</option><option value="tour_leader">Tour Leader</option></Form.Select><Form.Control.Feedback type="invalid">Select</Form.Control.Feedback></Form.Group></Col></Row>
          <h5>Tarifas opcionales</h5>
          {loadingOptionals?<Spinner className="mb-2"/>:(<Button variant="outline-primary" size="sm" onClick={handleAddTariff} className="mb-2">+ Agregar Tarifa</Button>)}
          <Table size="sm" bordered>
            <thead><tr><th>Actividad</th><th>Pax Min</th><th>Pax Max</th><th>Tipo Día</th><th>Precio</th><th>Moneda</th><th>Desde</th><th>Hasta</th><th>Notas</th><th/></tr></thead>
            <tbody>{tariffs.map((tr,i)=>(<tr key={i}><td><Form.Select value={tr.id_optional} onChange={e=>handleTariffChange(i,'id_optional',e.target.value)}><option value="">Seleccione...</option>{optionals.map(o=><option key={o.id_optional} value={o.id_optional}>{o.name}</option>)}</Form.Select></td><td><Form.Control type="number" min="1" value={tr.pax_min} onChange={e=>handleTariffChange(i,'pax_min',e.target.value)}/></td><td><Form.Control type="number" min={tr.pax_min||1} value={tr.pax_max} onChange={e=>handleTariffChange(i,'pax_max',e.target.value)}/></td><td><Form.Select value={tr.day_type} onChange={e=>handleTariffChange(i,'day_type',e.target.value)}>{dayTypeOptions.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}</Form.Select></td><td><Form.Control type="number" step="0.01" min="0" value={tr.price} onChange={e=>handleTariffChange(i,'price',e.target.value)} required/></td><td><Form.Select value={tr.currency} onChange={e=>handleTariffChange(i,'currency',e.target.value)} required><option value="">Moneda...</option>{favoriteCurrencies.map(c=><option key={c} value={c}>{c}</option>)}{allCurrencies.filter(c=>!favoriteCurrencies.includes(c)).map(c=><option key={c} value={c}>{c}</option>)}</Form.Select></td><td><Form.Control type="date" value={tr.valid_from} onChange={e=>handleTariffChange(i,'valid_from',e.target.value)}/></td><td><Form.Control type="date" min={tr.valid_from} value={tr.valid_to} onChange={e=>handleTariffChange(i,'valid_to',e.target.value)}/></td><td><Form.Control type="text" value={tr.notes} onChange={e=>handleTariffChange(i,'notes',e.target.value)}/></td><td><Button variant="outline-danger" size="sm" onClick={()=>handleRemoveTariff(i)}>X</Button></td></tr>))}</tbody>
          </Table>
          <Form.Group className="mb-3"><Form.Label>Comentarios</Form.Label><Form.Control as="textarea" rows={3} name="comments" value={form.comments} onChange={handleChange}/></Form.Group>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={onHide} disabled={saving}>Cancelar</Button><Button type="submit" variant="primary" disabled={saving}>{saving?'Guardando...':'Guardar'}</Button></Modal.Footer>
      </Form>
    </Modal>
  );
}

LocalGuideModal.propTypes = { show: PropTypes.bool.isRequired, onHide: PropTypes.func.isRequired, onSave: PropTypes.func.isRequired, initialData: PropTypes.object, currentCity: PropTypes.number.isRequired, currentCityName: PropTypes.string.isRequired };
