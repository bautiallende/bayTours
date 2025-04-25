import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import Select from 'react-select';
import countriesLib from 'i18n-iso-countries';

// Inicializar lista de países en inglés y español
countriesLib.registerLocale(require('i18n-iso-countries/langs/en.json'));
countriesLib.registerLocale(require('i18n-iso-countries/langs/es.json'));

// Regex para quitar emojis
const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])/g;

const EditClientModal = ({ show, onHide, clientData, onSave, groupId }) => {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  // Para nacionalidad
  const [countryOptions, setCountryOptions] = useState([]);
  // Para tipos de habitación
  const [roomTypes, setRoomTypes] = useState([]);
  // Para paquetes
  const [packageOptions, setPackageOptions] = useState([]);

  const favoriteCodes = ['US', 'MX', 'CO', 'BR', 'AR'];

  useEffect(() => {
    // Países
    const countryObj = countriesLib.getNames('en', { select: 'official' });
    const opts = Object.entries(countryObj).map(([code,name])=>({ value: code, label: name }));
    const fav = opts.filter(o=>favoriteCodes.includes(o.value));
    const others = opts.filter(o=>!favoriteCodes.includes(o.value));
    setCountryOptions([{ label:'Favoritos', options:fav },{ label:'Otros Países', options:others }]);

    // Tipos de habitación
    fetch(`${process.env.REACT_APP_API_URL}/hotels_room/get_rooms_type`)
      .then(r=>r.json())
      .then(data=>{ if(data.status==='success') setRoomTypes(data.data); })
      .catch(()=>setRoomTypes([]));

    // Paquetes disponibles
    if(groupId) {
      fetch(`${process.env.REACT_APP_API_URL}/groups/get_possible_packages?id_group=${groupId}`)
        .then(r=>r.json())
        .then(data=>{
          if(Array.isArray(data)) setPackageOptions(data);
        })
        .catch(()=>setPackageOptions([]));
    }
  }, [groupId]);

  useEffect(() => {
    if (show && clientData) {
      setForm({
        first_name: clientData.first_name||'',
        second_name: clientData.second_name||'',
        paternal_surname: clientData.paternal_surname||'',
        mother_surname: clientData.mother_surname||'',
        sex: clientData.sex||'',
        birth_date: clientData.birth_date||'',
        phone: clientData.phone||'',
        mail: clientData.mail||'',
        nationality: clientData.nationality||'',
        passport: clientData.passport||'',
        vtc_passport: clientData.vtc_passport||'',
        packages: clientData.packages||'',
        room_type: clientData.room_type||'',
        shown: clientData.shown ?? true
      });
      setErrors({});
      setSubmitError('');
    }
  }, [show, clientData]);

  const handleChange = field => e => {
    let value = e.target.value;
    if(['first_name','second_name','paternal_surname','mother_surname'].includes(field)) {
      value = value.replace(emojiRegex,'');
    }
    setForm(f=>({ ...f, [field]:value }));
  };

  const handleCountryChange = opt => setForm(f=>({ ...f, nationality: opt ? opt.label : '' }));

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = {};
    if(!form.first_name) errs.first_name='Requerido';
    if(!form.paternal_surname) errs.paternal_surname='Requerido';
    setErrors(errs);
    if(Object.keys(errs).length) return;
    try{
      await onSave(form);
      onHide();
    }catch(err){
      setSubmitError(err.message||'Error al guardar');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title>Editar Cliente</Modal.Title></Modal.Header>
        <Modal.Body>
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          <Row className="mb-3">
            <Col md={4}><Form.Group><Form.Label>Nombre</Form.Label><Form.Control type="text" value={form.first_name} onChange={handleChange('first_name')} isInvalid={!!errors.first_name} /><Form.Control.Feedback type="invalid">{errors.first_name}</Form.Control.Feedback></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Segundo Nombre</Form.Label><Form.Control type="text" value={form.second_name} onChange={handleChange('second_name')} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Apellido Paterno</Form.Label><Form.Control type="text" value={form.paternal_surname} onChange={handleChange('paternal_surname')} isInvalid={!!errors.paternal_surname} /><Form.Control.Feedback type="invalid">{errors.paternal_surname}</Form.Control.Feedback></Form.Group></Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Group><Form.Label>Apellido Materno</Form.Label><Form.Control type="text" value={form.mother_surname} onChange={handleChange('mother_surname')} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Sexo</Form.Label><Form.Select value={form.sex} onChange={handleChange('sex')}><option value="">Seleccione</option><option value="M">Masculino</option><option value="F">Femenino</option></Form.Select></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Fecha Nacimiento</Form.Label><Form.Control type="date" value={form.birth_date} onChange={handleChange('birth_date')} /></Form.Group></Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Group><Form.Label>Teléfono</Form.Label><Form.Control type="tel" value={form.phone} onChange={handleChange('phone')} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" value={form.mail} onChange={handleChange('mail')} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Nacionalidad</Form.Label><Select options={countryOptions} onChange={handleCountryChange} placeholder="Buscar país..." defaultValue={countryOptions.flatMap(g=>g.options).find(o=>o.label===form.nationality)} isClearable/></Form.Group></Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Group><Form.Label>Pasaporte</Form.Label><Form.Control type="text" value={form.passport} onChange={handleChange('passport')} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Venc. Pasaporte</Form.Label><Form.Control type="date" value={form.vtc_passport} onChange={handleChange('vtc_passport')} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Paquetes</Form.Label><Form.Select value={form.packages} onChange={handleChange('packages')}><option value="">Seleccione paquete</option>{packageOptions.map(p=><option key={p} value={p}>{`Paquete ${p}`}</option>)}</Form.Select></Form.Group></Col>
          </Row>
          <Row className="mb-3 align-items-center">
            <Col md={6}>
                <Form.Group>
                <Form.Label>Tipo de Habitación</Form.Label>
                <Form.Select value={form.room_type} onChange={handleChange('room_type')}>
                    <option value="">Seleccione tipo</option>
                    {roomTypes.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                </Form.Select>
                </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-center">
                <Form.Check 
                type="switch"
                id="shown"
                label="Se presentó al circuito"
                checked={form.shown}
                onChange={e => setForm(f => ({ ...f, shown: e.target.checked }))}
                />
            </Col>
        </Row>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={onHide}>Cancelar</Button><Button variant="primary" type="submit">Guardar</Button></Modal.Footer>
      </Form>
    </Modal>
  );
};

EditClientModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  clientData: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  groupId: PropTypes.string.isRequired,
};

export default EditClientModal;
