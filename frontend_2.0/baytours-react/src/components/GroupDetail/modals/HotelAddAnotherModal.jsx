import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

/**
 * Extrae el año de una fecha en formato "DD/MM/YYYY" o "DD-MM-YYYY".
 */
const getYearFromDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
  return parts.length === 3 ? parts[2] : '';
};

/**
 * Función auxiliar para formatear una fecha al formato "YYYY-MM-DD".
 * Soporta:
 * - "DD/MM/YYYY" o "DD-MM-YYYY"
 * - "DD/MM" o "DD-MM", usando defaultYear si se proporciona.
 * - Cadenas en formato ISO u otro, usando Date.
 */
const formatDateForInput = (dateString, defaultYear = '') => {
  if (!dateString) return '';
  
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    if (parts.length === 2 && defaultYear) {
      return `${defaultYear}-${parts[1]}-${parts[0]}`;
    }
  }
  if (dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 2) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    if (parts.length === 2 && defaultYear) {
      return `${defaultYear}-${parts[1]}-${parts[0]}`;
    }
  }
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toISOString().split('T')[0];
};

/**
 * HotelAddAnotherModal permite agregar una nueva asignación de hotel para el mismo día.
 *
 * Props:
 * - show: Booleano que indica si el modal se muestra.
 * - onHide: Callback para ocultar el modal.
 * - initialData: Objeto que debe contener al menos { city, date, id_group, paxAssigned }.
 *                (La ciudad, fecha y PAX asignados se muestran en solo lectura.)
 * - onSave: Callback que recibe el payload con los datos ingresados; debe retornar una promesa.
 * - groupPax: Número total de pasajeros del grupo (para validar el número de PAX asignados).
 * - assignedPaxTotal: Número total de PAX ya asignados (según el backend).
 * - onAddAnother: Callback para iniciar el flujo de agregar otro hotel.
 */
const HotelAddAnotherModal = ({
  show,
  onHide,
  initialData = {},
  onSave,
  groupPax,
  assignedPaxTotal = 0,
  onAddAnother,
}) => {
  // Estados para los campos editables y mostrados
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [hotelsList, setHotelsList] = useState([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomingList, setRoomingList] = useState(false);
  const [proForma, setProForma] = useState(false);
  const [currency, setCurrency] = useState('EUR');
  const [totalToPay, setTotalToPay] = useState(0);
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentDoneDate, setPaymentDoneDate] = useState('');
  const [factura, setFactura] = useState(false);
  const [iga, setIga] = useState(false);
  const [paxAssigned, setPaxAssigned] = useState(0);
  const [comment, setComment] = useState('');
  const [validationMsg, setValidationMsg] = useState('');

  // No usamos localAssignedPax; en su lugar, calculamos la disponibilidad directamente
  const groupPaxNum = parseInt(groupPax, 10) || 0;
  const availablePax = groupPaxNum - Number(assignedPaxTotal);
  useEffect(() => {
    console.log('groupPax:', groupPaxNum, 'assignedPaxTotal:', assignedPaxTotal, 'availablePax:', availablePax);
  }, [groupPaxNum, assignedPaxTotal, availablePax]);

  // Extraer el año de la fecha principal para usar en el formateo
  const defaultYear = getYearFromDate(initialData.date);

  // Cuando cambia initialData, actualizamos los estados correspondientes (sin reiniciar city y date)
  useEffect(() => {
    setCity(initialData.city || '');
    setDate(formatDateForInput(initialData.date, defaultYear));
    setPaxAssigned(initialData.paxAssigned || 0);
    // Reiniciamos los campos que deben limpiarse para agregar nueva asignación
    setHotelId('');
    setHotelsList([]);
    // No reiniciamos checkIn y checkOut para conservar el valor calculado si ya existe
    // setCheckIn('');
    // setCheckOut('');
    setRoomingList(false);
    setProForma(false);
    setCurrency('EUR');
    setTotalToPay(0);
    setPaymentDate('');
    setPaymentDoneDate('');
    setFactura(false);
    setIga(false);
    setComment('');
    setValidationMsg('');
    // Nota: No modificamos assignedPaxTotal aquí, se recibe de la prop.
  }, [initialData, defaultYear]);

  // Al abrir el modal, reiniciamos solo los campos editables que deben limpiarse, sin tocar city, date, checkIn, checkOut ni assignedPaxTotal
  useEffect(() => {
    if (show) {
      console.log('Modal abierto. initialData:', initialData);

      // Solo reiniciamos los campos editables y dejamos intactos "city" y "date"
      setHotelId('');
      setHotelsList([]);
      // Si checkIn y checkOut ya tienen valor, los dejamos
      if (!checkIn && date) {
        const dt = new Date(date);
        if (!isNaN(dt.getTime())) {
          setCheckIn(date);
          dt.setDate(dt.getDate() + 1);
          const computed = dt.toISOString().split('T')[0];
          setCheckOut(computed);
          console.log('Modal: Calculado checkIn:', date, 'checkOut:', computed);
        } else {
          console.error("Invalid date:", date);
          setCheckIn('');
          setCheckOut('');
        }
      }
      setRoomingList(false);
      setProForma(false);
      setCurrency('EUR');
      setTotalToPay(0);
      setPaymentDate('');
      setPaymentDoneDate('');
      setFactura(false);
      setIga(false);
      setComment('');
      setValidationMsg('');
      // Forzamos recargar la lista de hoteles si "city" existe
      if (city) {
        fetch(`${process.env.REACT_APP_API_URL}/hotels/get_hotel_by_city?city=${encodeURIComponent(city)}`)
          .then((res) => res.json())
          .then((data) => {
            setHotelsList(data);
            console.log('Recargados hoteles para', city, data);
          })
          .catch((err) => console.error('Error al obtener hoteles:', err));
      }
    }
  }, [show, city, date, checkIn]);

  // Cuando la fecha esté disponible, calcular checkIn y checkOut automáticamente
  useEffect(() => {
    if (date) {
      const dt = new Date(date);
      if (isNaN(dt.getTime())) {
        console.error("Invalid date value:", date);
        setCheckOut('');
        return;
      }
      setCheckIn(date);
      dt.setDate(dt.getDate() + 1);
      const computedCheckOut = dt.toISOString().split('T')[0];
      setCheckOut(computedCheckOut);
      console.log('Calculado checkIn:', date, 'checkOut:', computedCheckOut);
    }
  }, [date]);

  // Al tener la ciudad y si el modal está abierto, obtenemos la lista de hoteles disponibles
  useEffect(() => {
    if (city && show) {
      fetch(`${process.env.REACT_APP_API_URL}/hotels/get_hotel_by_city?city=${encodeURIComponent(city)}`)
        .then((res) => res.json())
        .then((data) => {
          setHotelsList(data);
          console.log('Hoteles disponibles para', city, data);
        })
        .catch((err) => console.error('Error al obtener hoteles:', err));
    }
  }, [city, show]);

  // Función para manejar el envío del formulario (guardado)
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const paxVal = parseInt(paxAssigned, 10);
    console.log('handleSubmit: paxAssigned:', paxAssigned, 'paxVal:', paxVal, 'availablePax:', availablePax);
    if (paxVal === 0) {
      setValidationMsg('El número de PAX asignados debe ser mayor que 0.');
      return;
    }
    if (paxVal > availablePax) {
      setValidationMsg(`El número de PAX asignados no puede superar los disponibles (${availablePax}).`);
      return;
    }
    // Construir el payload
    const payload = {
      id_hotel: parseInt(hotelId, 10),
      id_group: initialData.id_group || '',
      id_day: initialData.id_day || '',
      start_date: checkIn || null,
      end_date: checkOut || null,
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
      updated_by: '',
    };
    console.log('Payload a enviar (add another):', payload);
    return Promise.resolve(onSave(payload))
      .then(() => {
        onHide();
        return true;
      })
      .catch((error) => {
        if (error && error.detail) {
          setValidationMsg(error.detail);
        } else {
          setValidationMsg('Error al agregar la asignación.');
        }
        console.error('Error en onSave:', error);
        return false;
      });
  };
  
  // Función para manejar el clic en "Agregar otro hotel para este día"
  const handleAddAnotherClick = async () => {
    const saved = await handleSubmit();
    if (saved && onAddAnother) {
      // Calculamos el nuevo total acumulado de PAX asignados:
      const newTotal = Number(assignedPaxTotal) + Number(paxAssigned);
      // Llamamos al callback onAddAnother pasando el valor acumulado actualizado.
      onAddAnother({
        city,
        date,
        paxAssigned: newTotal, // Enviamos el total acumulado
        id_day: initialData.id_day || '',
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
      <Form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar otro hotel para este día</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Row 1: Ciudad y Fecha (solo lectura) */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formCity">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control type="text" value={city} readOnly />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDate">
                <Form.Label>Fecha</Form.Label>
                <Form.Control type="date" value={date} readOnly />
              </Form.Group>
            </Col>
          </Row>
          {/* Row 2: Selección de Hotel */}
          <Form.Group controlId="formHotel">
            <Form.Label>Hotel</Form.Label>
            <Form.Select value={hotelId} onChange={(e) => setHotelId(e.target.value)} required>
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
              />
            </Col>
            <Col md={4}>
              <Form.Check
                type="switch"
                id="formProForma"
                label="Pro Forma Enviado"
                checked={proForma}
                onChange={(e) => setProForma(e.target.checked)}
              />
            </Col>
          </Row>
          {/* Row 5: Moneda, Total a Pagar y PAX Asignados */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="formCurrency">
                <Form.Label>Divisa</Form.Label>
                <Form.Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
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
                />
                <Form.Text muted>
                  Disponible para asignar: {availablePax} (Total grupo: {groupPax})
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          {/* Row 6: Fechas de Pago */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPaymentDate">
                <Form.Label>Fecha de Pago</Form.Label>
                <Form.Control
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
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
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="switch"
                id="formIGA"
                label="IGA Gestionado"
                checked={iga}
                onChange={(e) => setIga(e.target.checked)}
              />
            </Col>
          </Row>
          {/* Row 8: Comentarios */}
          <Form.Group controlId="formComments" className="mb-3">
            <Form.Label>Comentarios</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Escribe un comentario para esta asignación..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>
          {validationMsg && <Alert variant="danger">{validationMsg}</Alert>}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={parseInt(paxAssigned, 10) === 0 || parseInt(paxAssigned, 10) > availablePax}
          >
            Guardar Cambios
          </Button>
          <Button
            variant="outline-primary"
            onClick={handleAddAnotherClick}
            disabled={parseInt(paxAssigned, 10) === 0 || parseInt(paxAssigned, 10) >= availablePax}
          >
            Agregar otro hotel para este día
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

HotelAddAnotherModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  groupPax: PropTypes.number.isRequired,
  assignedPaxTotal: PropTypes.number,
  onAddAnother: PropTypes.func,
};

export default HotelAddAnotherModal;