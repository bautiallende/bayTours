import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

/**
 * Función auxiliar para formatear una fecha al formato "YYYY-MM-DD".
 * Soporta:
 * - "DD/MM/YYYY" o "DD-MM-YYYY"
 * - "DD/MM" o "DD-MM", en cuyo caso se usará defaultYear si se proporciona.
 */
const formatDateForInput = (dateString, defaultYear = '') => {
  if (!dateString) return '';
  
  // Si la cadena contiene "/", asumimos formato "DD/MM/YYYY" o "DD/MM"
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    if (parts.length === 2 && defaultYear) {
      return `${defaultYear}-${parts[1]}-${parts[0]}`;
    }
  }
  
  // Si la cadena contiene "-", asumimos formato "DD-MM-YYYY" o "DD-MM"
  const partsDash = dateString.split('-');
  if (partsDash.length === 3 && partsDash[0].length === 2) {
    return `${partsDash[2]}-${partsDash[1]}-${partsDash[0]}`;
  }
  if (partsDash.length === 2 && defaultYear) {
    return `${defaultYear}-${partsDash[1]}-${partsDash[0]}`;
  }
  
  // Por defecto, intenta convertir usando Date
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toISOString().split('T')[0];
};

/**
 * Extrae el año de una fecha en formato "DD/MM/YYYY" o "DD-MM-YYYY".
 */
const getYearFromDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
  return parts.length === 3 ? parts[2] : '';
};

/**
 * HotelModal permite agregar o editar una asignación de hotel.
 *
 * Props:
 * - show: Booleano para mostrar/ocultar el modal.
 * - onHide: Callback para ocultar el modal.
 * - initialData: Objeto con los datos iniciales de la asignación. En edición debe contener "assignment_id".
 * - onSave: Callback que se invoca con el payload cuando se envía el formulario.
 * - onAddAnother: Callback para iniciar el flujo de agregar otra asignación para el mismo día.
 * - groupPax: Número total de pasajeros del grupo (para validación).
 */
const HotelModal = ({
  show,
  onHide,
  initialData = {},
  onSave,
  onAddAnother,
  groupPax,
}) => {
  // Determina si estamos en modo edición (se asume que en edición initialData.assignment_id existe)
  const isEditing = Boolean(initialData.assignment_id);
  
  // Extraemos el año de la fecha principal para usarlo como valor por defecto en fechas incompletas
  const defaultYear = getYearFromDate(initialData.date);

  // Estados para los campos de la asignación
  const [city, setCity] = useState(initialData.city || '');
  const [id_day, setIdDay] = useState(initialData.id_day || '');
  const [assignedPax, setAssignedPax] = useState(initialData.assigned_pax || 0);
  const [date, setDate] = useState(formatDateForInput(initialData.date, defaultYear));
  const [hotelId, setHotelId] = useState(initialData.id_hotel || '');
  const [hotelsList, setHotelsList] = useState([]);
  const [checkIn, setCheckIn] = useState(
    initialData.check_in ? formatDateForInput(initialData.check_in, defaultYear) : ''
  );
  const [checkOut, setCheckOut] = useState(
    initialData.check_out ? formatDateForInput(initialData.check_out, defaultYear) : ''
  );
  const [roomingList, setRoomingList] = useState(
    typeof initialData.rooming_list === 'boolean' ? initialData.rooming_list : false
  );
  const [proForma, setProForma] = useState(
    typeof initialData.pro_forma === 'boolean' ? initialData.pro_forma : false
  );
  const [currency, setCurrency] = useState(initialData.currency || 'EUR');
  const [totalToPay, setTotalToPay] = useState(
    initialData.total_to_pay != null ? initialData.total_to_pay : 0
  );
  const [paymentDate, setPaymentDate] = useState(
    initialData.payment_date ? formatDateForInput(initialData.payment_date, defaultYear) : ''
  );
  const [paymentDoneDate, setPaymentDoneDate] = useState(
    formatDateForInput(initialData.payment_done_date, defaultYear)
  );
  const [factura, setFactura] = useState(
    typeof initialData.factura === 'boolean' ? initialData.factura : false
  );
  const [iga, setIga] = useState(
    typeof initialData.iga === 'boolean' ? initialData.iga : false
  );
  const [paxAssigned, setPaxAssigned] = useState(initialData.pax || 0);
  const [comment, setComment] = useState('');
  const [validationMsg, setValidationMsg] = useState('');

  // Calcula la cantidad máxima de PAX disponibles para esta asignación.
  // En modo edición: available = groupPax - (assignedPax - initialData.pax)
  // En modo agregar: available = groupPax.
  const availableForEditing = isEditing
    ? parseInt(groupPax, 10) - (parseInt(assignedPax, 10) - parseInt(initialData.pax || 0, 10))
    : parseInt(groupPax, 10);

  // Validación en tiempo real para PAX: si el valor ingresado excede el máximo, se muestra un mensaje.
  useEffect(() => {
    const paxVal = parseInt(paxAssigned, 10);
    if (paxVal > availableForEditing) {
      setValidationMsg(`El número de PAX asignados no puede superar los disponibles (${availableForEditing}).`);
    } else {
      setValidationMsg('');
    }
  }, [paxAssigned, availableForEditing]);

  // Actualiza los estados cuando initialData cambia
  useEffect(() => {
    setCity(initialData.city || '');
    setDate(formatDateForInput(initialData.date, defaultYear));
    setHotelId(initialData.id_hotel || '');
    setIdDay(initialData.id_day || '');
    setAssignedPax(initialData.assigned_pax || 0);
    if (initialData.city) {
      fetch(`${process.env.REACT_APP_API_URL}/hotels/get_hotel_by_city?city=${encodeURIComponent(initialData.city)}`)
        .then(res => res.json())
        .then(data => setHotelsList(data))
        .catch(err => console.error('Error al obtener hoteles:', err));
    }
    setCheckIn(initialData.check_in ? formatDateForInput(initialData.check_in, defaultYear) : '');
    setCheckOut(initialData.check_out ? formatDateForInput(initialData.check_out, defaultYear) : '');
    setPaxAssigned(initialData.pax || 0);
    setRoomingList(typeof initialData.rooming_list === 'boolean' ? initialData.rooming_list : false);
    setProForma(typeof initialData.pro_forma === 'boolean' ? initialData.pro_forma : false);
    setCurrency(initialData.currency || 'EUR');
    setTotalToPay(initialData.total_to_pay != null ? initialData.total_to_pay : 0);
    setPaymentDate(initialData.payment_date ? formatDateForInput(initialData.payment_date, defaultYear) : '');
    setPaymentDoneDate(formatDateForInput(initialData.payment_done_date, defaultYear));
    setFactura(typeof initialData.factura === 'boolean' ? initialData.factura : false);
    setIga(typeof initialData.iga === 'boolean' ? initialData.iga : false);
    setComment('');
    setValidationMsg('');
  }, [initialData, defaultYear]);

  // Si no hay valor para check-in, se calcula automáticamente a partir de la fecha
  useEffect(() => {
    if (date && (!initialData.check_in || initialData.check_in === '')) {
      setCheckIn(date);
      const dt = new Date(date);
      dt.setDate(dt.getDate() + 1);
      setCheckOut(dt.toISOString().split('T')[0]);
    }
  }, [date, initialData.check_in]);

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const paxVal = parseInt(paxAssigned, 10);
    if (paxVal === 0) {
      setValidationMsg('El número de PAX asignados debe ser mayor que 0.');
      return;
    }
    if (paxVal > availableForEditing) {
      setValidationMsg(`El número de PAX asignados no puede superar los disponibles para esta asignación (${availableForEditing}).`);
      return;
    }
    const payload = {
      id: initialData.assignment_id || '',
      id_hotel: parseInt(hotelId, 10),
      id_group: initialData.id_group || '',
      start_date: checkIn,
      end_date: checkOut,
      pax: paxVal,
      currency,
      total_to_pay: parseFloat(totalToPay),
      comment,
      rooming_list: roomingList,
      pro_forma: proForma,
      payment_date: paymentDate || null,
      payment_done_date: paymentDoneDate || null,
      payed_by: null,
      factura,
      iga,
    };
    try {
      await onSave(payload);
      onHide();
      return true;
    } catch (error) {
      // Si el backend retorna un error, lo mostramos en el modal
      if (error && error.detail) {
        setValidationMsg(error.detail);
      } else {
        setValidationMsg('Error al guardar la asignación.');
      }
      console.error('Error en onSave:', error);
      return false;
    }
  };

  // Maneja el clic en "Agregar otro hotel para este día"
  const handleAddAnotherClick = async () => {
    const saved = await handleSubmit(new Event('submit'));
    const newPax = parseInt(assignedPax, 10) - parseInt(initialData.pax || 0, 10) + parseInt(paxAssigned, 10);
    if (saved && onAddAnother) {
      onAddAnother({
        city,
        date,
        new_pax: newPax,
        id_day,
      });
    }
  };

  // Carga de divisas (simulada)
  const [allCurrencies, setAllCurrencies] = useState([]);
  useEffect(() => {
    const fetchCurrencies = async () => {
      const currencies = ['EUR', 'USD', 'CHF', 'GBP', 'ARS', 'JPY', 'CNY', 'INR', 'BRL', 'CAD'];
      setAllCurrencies(currencies);
    };
    fetchCurrencies();
  }, []);
  const favoriteCurrencies = ['EUR', 'USD', 'CHF', 'GBP'];

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {initialData.assignment_id ? 'Editar Asignación de Hotel' : 'Agregar Asignación de Hotel'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Row 1: Ciudad y Fecha (solo lectura) */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formCity">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control type="text" value={city} readOnly aria-label="Ciudad" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDate">
                <Form.Label>Fecha</Form.Label>
                <Form.Control type="date" value={date} readOnly aria-label="Fecha" />
              </Form.Group>
            </Col>
          </Row>
          {/* Row 2: Selección de Hotel */}
          <Form.Group controlId="formHotel">
            <Form.Label>Hotel</Form.Label>
            <Form.Select value={hotelId} onChange={(e) => setHotelId(e.target.value)} required aria-label="Seleccionar Hotel">
              <option value="">Seleccione un hotel</option>
              {hotelsList.map((hotel) => (
                <option key={hotel.id_hotel} value={hotel.id_hotel}>
                  {hotel.hotel_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {/* Row 3: Check-in y Check-out */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formCheckIn">
                <Form.Label>Check-in</Form.Label>
                <Form.Control
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  aria-label="Fecha de Check-in"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formCheckOut">
                <Form.Label>Check-out</Form.Label>
                <Form.Control
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  aria-label="Fecha de Check-out"
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Row 4: Switches para Rooming List y Pro Forma */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Check
                type="switch"
                id="formRoomingList"
                label="Rooming List Enviado"
                checked={roomingList}
                onChange={(e) => setRoomingList(e.target.checked)}
                aria-label="Activar Rooming List Enviado"
              />
            </Col>
            <Col md={4}>
              <Form.Check
                type="switch"
                id="formProForma"
                label="Pro Forma Enviado"
                checked={proForma}
                onChange={(e) => setProForma(e.target.checked)}
                aria-label="Activar Pro Forma Enviado"
              />
            </Col>
          </Row>
          {/* Row 5: Divisa, Total a Pagar y PAX Asignados */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="formCurrency">
                <Form.Label>Divisa</Form.Label>
                <Form.Select value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Seleccionar Divisa">
                  <optgroup label="Favoritas">
                    {favoriteCurrencies.map((favCurrency) => (
                      <option key={favCurrency} value={favCurrency}>
                        {favCurrency}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Todas las divisas">
                    {allCurrencies
                      .filter((curr) => !favoriteCurrencies.includes(curr))
                      .map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                  </optgroup>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formTotalToPay">
                <Form.Label>Total a Pagar</Form.Label>
                <Form.Control
                  type="number"
                  value={totalToPay}
                  onChange={(e) => setTotalToPay(e.target.value)}
                  required
                  aria-label="Total a Pagar"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formPAX">
                <Form.Label>PAX Asignados</Form.Label>
                <Form.Control
                  type="number"
                  value={paxAssigned}
                  onChange={(e) => setPaxAssigned(e.target.value)}
                  required
                  aria-label="PAX Asignados"
                />
                <Form.Text muted>
                  Disponible para esta asignación: {availableForEditing} (Total grupo: {groupPax})
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          {/* Row 6: Fechas de Pago */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPaymentDate">
                <Form.Label>Fecha A Pagar</Form.Label>
                <Form.Control
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  aria-label="Fecha A Pagar"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formPaymentDoneDate">
                <Form.Label>Fecha de Pago Realizado</Form.Label>
                <Form.Control
                  type="date"
                  value={paymentDoneDate}
                  onChange={(e) => setPaymentDoneDate(e.target.value)}
                  aria-label="Fecha de Pago Realizado"
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Row 7: Factura e IGA */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Check
                type="switch"
                id="formFactura"
                label="Factura Emitida"
                checked={factura}
                onChange={(e) => setFactura(e.target.checked)}
                aria-label="Activar Factura Emitida"
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="switch"
                id="formIGA"
                label="IGA Gestionado"
                checked={iga}
                onChange={(e) => setIga(e.target.checked)}
                aria-label="Activar IGA Gestionado"
              />
            </Col>
          </Row>
          {/* Row 8: Comentarios */}
          <Form.Group controlId="formNotes" className="mb-3">
            <Form.Label>Comentarios</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Escribe un nuevo comentario. Los anteriores quedarán registrados."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              aria-label="Comentarios"
            />
          </Form.Group>
          {validationMsg && <Alert variant="danger">{validationMsg}</Alert>}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            <Button variant="secondary" onClick={onHide}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="ms-2"
              disabled={parseInt(paxAssigned, 10) === 0 || parseInt(paxAssigned, 10) > availableForEditing}
            >
              Guardar Cambios
            </Button>
          </div>
          <Button
            variant="outline-primary"
            onClick={handleAddAnotherClick}
            disabled={parseInt(paxAssigned, 10) === 0 || parseInt(paxAssigned, 10) >= availableForEditing}
          >
            Agregar otro hotel para este día
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

HotelModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onAddAnother: PropTypes.func,
  groupPax: PropTypes.number.isRequired,
};

export default HotelModal;