import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import countriesLib from 'i18n-iso-countries';

// registrar locales
countriesLib.registerLocale(require('i18n-iso-countries/langs/en.json'));
countriesLib.registerLocale(require('i18n-iso-countries/langs/es.json'));

const favoriteCodes = ['US', 'MX', 'CO', 'BR', 'AR'];

const ClientsFilterModal = ({ show, onHide, onApply, namesOptions, idGroup }) => {
  // estados de filtros
  const [names, setNames] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [sex, setSex] = useState('');
  const [ageOp, setAgeOp] = useState('gt');
  const [ageValue, setAgeValue] = useState('');
  const [dateOp, setDateOp] = useState('gt');
  const [birthDate, setBirthDate] = useState('');
  const [countryOptions, setCountryOptions] = useState([]);
  const [selectedNationality, setSelectedNationality] = useState(null);
  const [nationality, setNationality] = useState('');
  const [passportDate, setPassportDate] = useState('');
  const [passportOp, setPassportOp] = useState('gt');
  const [showed, setShowed] = useState('');
  const [packages, setPackages] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [options, setOptions] = useState([]);


  // opciones fijas
  const sexOptions = [ { value:'M', label:'Masculino' }, { value:'F', label:'Femenino' }, { value:'', label:'Otro' } ];

  // cargar listas iniciales
  useEffect(() => {
    if (show) {
      setOptions(namesOptions);
      setSelectedNames([]);

    fetch(`${process.env.REACT_APP_API_URL}/groups/get_possible_packages?id_group=${idGroup}`)
      .then(r=>r.json())
      .then(data=> setPackages(Array.isArray(data) ? data : []));
    
    fetch(`${process.env.REACT_APP_API_URL}/hotels_room/get_rooms_type`)
      .then(r=>r.json())
      .then(d=> setRoomTypes(Array.isArray(d.data) ? d.data : []));

    const all = countriesLib.getNames('en', { select: 'official' });
    const opts = Object.entries(all).map(([code, name]) => ({ value: code, label: name }));
    const fav = opts.filter(o => favoriteCodes.includes(o.value));
    const others = opts.filter(o => !favoriteCodes.includes(o.value));
    setCountryOptions([
      { label: 'Favoritos', options: fav },
      { label: 'Otros Países', options: others }
    ]);
    }
  }, [show, namesOptions]);

  const handleApply = () => {
    const filters = {};
    if(selectedNames.length) filters.names = selectedNames.map(o=>o.value);
    if(sex) filters.sex = sex;
    if(ageValue) filters[ageOp==='gt'?'min_age':'max_age'] = ageValue;
    if(birthDate) filters.date = { op: dateOp, value: birthDate };
    if (selectedNationality) filters.nationality = selectedNationality.value;
    if(passportDate) filters.vtc_passport = { op: passportOp, value: passportDate };
    if(selectedPackages.length) filters.packages = selectedPackages.map(o=>o.value);
    if(selectedRoomTypes.length) filters.room_type = selectedRoomTypes.map(o=>o.value);
    if (showed !== '') filters.shown = showed === 'true';
    onApply(filters);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton><Modal.Title>Filtrar Clientes</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Label>Nombres</Form.Label>
              <Select
                isMulti
                options={options}
                value={selectedNames}
                onChange={setSelectedNames}
                placeholder="Seleccione nombres..."
              />
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Sexo</Form.Label>
                <Form.Select value={sex} onChange={e => setSex(e.target.value)}>
                  {sexOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Asistió</Form.Label>
                <Form.Select value={showed} onChange={e => setShowed(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Edad</Form.Label>
                <div className="d-flex">
                  <Form.Select value={ageOp} onChange={e=>setAgeOp(e.target.value)}>
                    <option value="gt">Mayor que</option>
                    <option value="lt">Menor que</option>
                  </Form.Select>
                  <Form.Control type="number" min="0" value={ageValue} onChange={e=>setAgeValue(e.target.value)} />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fecha Nacimiento</Form.Label>
                <div className="d-flex">
                  <Form.Select value={dateOp} onChange={e=>setDateOp(e.target.value)}>
                    <option value="gt">Después de</option>
                    <option value="lt">Antes de</option>
                  </Form.Select>
                  <Form.Control type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nacionalidad</Form.Label>
                <Select
                  options={countryOptions}
                  value={selectedNationality}
                  onChange={setSelectedNationality}
                  placeholder="Buscar país..."
                  isClearable
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Venc. Pasaporte</Form.Label>
                <div className="d-flex">
                  <Form.Select value={passportOp} onChange={e=>setPassportOp(e.target.value)}>
                    <option value="gt">Después de</option>
                    <option value="lt">Antes de</option>
                  </Form.Select>
                  <Form.Control type="date" value={passportDate} onChange={e=>setPassportDate(e.target.value)} />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Paquetes</Form.Label>
                <Select
                  isMulti
                  options={packages.map(p=>({ value:p, label:`Paquete ${p}` }))}
                  value={selectedPackages}
                  onChange={setSelectedPackages}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Tipo Habitación</Form.Label>
                <Select
                  isMulti
                  options={roomTypes.map(rt=>({ value:rt, label:rt }))}
                  value={selectedRoomTypes}
                  onChange={setSelectedRoomTypes}
                />
              </Form.Group>
            </Col>
          </Row>

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={()=>{ onApply({}); onHide(); }}>
          Limpiar
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Aplicar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ClientsFilterModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  fetchNames: PropTypes.func.isRequired,
  idGroup: PropTypes.string.isRequired,
};

export default ClientsFilterModal;
