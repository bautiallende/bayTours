import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

/**
 * Función auxiliar para formatear una fecha al formato "YYYY-MM-DD".
 * Se espera que el string de fecha sea ISO o similar.
 */
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
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
 * - onSave: Callback que recibe el payload con los datos ingresados; el componente padre se encargará
 *           de llamar al endpoint POST /asign_hotel_same_day.
 * - groupPax: Número total de pasajeros del grupo (para validar el número de PAX asignados).
 */
const HotelAddAnotherModal = ({ show, onHide, initialData = {}, onSave, groupPax, assignedPaxTotal = 0, onAddAnother }) => {
  // Estados para los campos que se muestran o se pueden editar.
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [hotelsList, setHotelsList] = useState([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomingList, setRoomingList] = useState(false);
  const [proForma, setProForma] = useState(false);
  //const [currency, setCurrency] = useState('EUR');
  const [totalToPay, setTotalToPay] = useState(0);
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentDoneDate, setPaymentDoneDate] = useState('');
  const [factura, setFactura] = useState(false);
  const [iga, setIga] = useState(false);
  const [paxAssigned, setPaxAssigned] = useState(0);
  const [comment, setComment] = useState('');
  const [validationMsg, setValidationMsg] = useState('');

  // Al cambiar initialData, actualizamos los estados correspondientes.
  useEffect(() => {
    // Se asume que el padre nos pasa { city, date, id_group, paxAssigned } al abrir el modal.
    setCity(initialData.city || '');
    setDate(formatDateForInput(initialData.date));
    setPaxAssigned(initialData.paxAssigned || 0);
    // Los demás campos se inician en valores por defecto (o vacíos) para "agregar"
    setHotelId('');
    setHotelsList([]);
    setCheckIn('');
    setCheckOut('');
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
  }, [initialData]);

  // Cuando la fecha (initialData.date) esté disponible, calculamos automáticamente checkIn y checkOut
  useEffect(() => {
    if (date) {
      setCheckIn(date);
      const dt = new Date(date);
      dt.setDate(dt.getDate() + 1);
      setCheckOut(dt.toISOString().split('T')[0]);
    }
  }, [date]);

  // Al tener la ciudad, hacemos GET para obtener la lista de hoteles disponibles
  useEffect(() => {
    if (city) {
      fetch(`${process.env.REACT_APP_API_URL}/hotels/get_hotel_by_city?city=${encodeURIComponent(city)}`)
        .then((res) => res.json())
        .then((data) => {
          setHotelsList(data);
        })
        .catch((err) => console.error('Error al obtener hoteles:', err));
    }
  }, [city]);

  // Calcular la cantidad de PAX disponibles para asignar en este nuevo registro.
  // Es decir, el total del grupo menos los PAX ya asignados (assignedPaxTotal).
  console.log('PAX asignados total:', assignedPaxTotal);
  const availablePax = parseInt(groupPax, 10) - parseInt(assignedPaxTotal, 10);

  // Condición para habilitar el botón de "Guardar Cambios":
  // Debe ser mayor a 0 y menor o igual a los PAX disponibles.
  const isSaveEnabled =
  parseInt(paxAssigned, 10) > 0 && parseInt(paxAssigned, 10) <= availablePax;

  // Condición para habilitar el botón "Agregar otro hotel"
  const canAddAnother = availablePax > 0;

  console.log('PAX disponibles availablePax:', availablePax);
  console.log('paxAssigned nuevo hotel:', paxAssigned);
  console.log('assignedPaxTotal nuevo hotel:', assignedPaxTotal);
  console.log('groupPax nuevo hotel:', groupPax);



  // Función para manejar el envío del formulario (guardado)
  const handleSubmit = (e) => {
    e.preventDefault();
    const paxVal = parseInt(paxAssigned, 10);
    if (paxVal === 0) {
      setValidationMsg('El número de PAX asignados debe ser mayor que 0.');
      return;
    }
    if (paxVal > availablePax) {
      setValidationMsg(
        `El número de PAX asignados no puede superar los disponibles (${availablePax}).`
      );
      return;
    }
    // Construir el payload para enviar al backend
    const payload = {
      id_hotel: hotelId,
      id_group: initialData.id_group || '',
      id_day: initialData.id_day || '',
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
      updated_by: '',
    };
    console.log('Payload a enviar (add another):', payload);
    onSave(payload);
    onHide();
  };

  // Función para manejar el clic en "Agregar otro hotel para este día"
  const handleAddAnotherClick = () => {
    // Primero se guarda la asignación actual
    // Creamos un evento artificial para disparar handleSubmit
    handleSubmit(new Event('submit'));
    // Luego se invoca el callback para abrir el flujo de agregar otro hotel
    if (onAddAnother) {
      onAddAnother({
        city,
        date,
        paxAssigned: (paxAssigned),
        id_day: initialData.id_day || '',
        // Se pueden pasar otros campos si es necesario.
      });
    }
  };

  const [currency, setCurrency] = useState('EUR');
  const [allCurrencies, setAllCurrencies] = useState([]);

  useEffect(() => {
    // Simula la carga de todas las divisas desde una API o una lista estática
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
          <Modal.Title>Agregar otro hotel para este día</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Fila 1: Ciudad y Fecha (solo lectura) */}
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
          {/* Fila 2: Selección de Hotel */}
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
          {/* Fila 3: Check-in y Check-out */}
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
          {/* Fila 4: Switches para Rooming List y Pro Forma */}
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
          {/* Fila 5: Moneda, Total a Pagar y PAX Asignados */}
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
          {/* Fila 6: Fechas de Pago */}
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
          {/* Fila 7: Factura e IGA */}
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
          {/* Fila 8: Comentarios */}
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

export default HotelAddAnotherModal;