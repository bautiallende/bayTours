import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

// Función auxiliar para formatear una fecha al formato "YYYY-MM-DD"
const formatDateForInput = (dateString) => {
  console.log('dateString:', dateString);
  if (!dateString) return '';
  // Si el string contiene guiones y la primera parte tiene 2 dígitos, asumimos formato "DD-MM-YYYY"
  const parts = dateString.split('/cd ');
  if (parts.length === 3 && parts[0].length === 2) {
    // Reordenar a "YYYY-MM-DD"
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  // Si ya está en formato ISO, intentamos convertirlo
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toISOString().split('T')[0];
};

/**
 * HotelModal permite agregar o editar una asignación de hotel.
 *
 * Props:
 * - show: Booleano para mostrar/ocultar el modal.
 * - onHide: Callback para ocultar el modal.
 * - initialData: Datos iniciales de la asignación (modo edición) o {} en modo agregar.
 * - onSave: Callback que se invoca con el payload cuando se envía el formulario.
 * - onAddAnother: Callback para agregar otra asignación para el mismo día.
 * - groupPax: Número total de pasajeros del grupo (para validar si se pueden asignar más).
 */
const HotelModal = ({
  show,
  onHide,
  initialData = {},
  onSave,
  onAddAnother,
  groupPax,
}) => {

  console.log('initialData modal:', initialData);
  // Determinamos si estamos en modo edición
  const isEditing = Boolean(initialData.assignment_id);

  // Estados para cada campo. Los campos Ciudad y Fecha se muestran en modo solo lectura.
  const [city, setCity] = useState(initialData.city || '');
  const [id_day, setIdDay] = useState(initialData.id_day || '');
  const [assigned_pax, setAssignedPax] = useState(initialData.assigned_pax || '');
  const [date, setDate] = useState(formatDateForInput(initialData.date));
  const [hotelId, setHotelId] = useState(initialData.id_hotel || '');
  const [hotelsList, setHotelsList] = useState([]);
  // Usamos tipo "date" para checkIn y checkOut (si solo se requiere fecha)
  const [checkIn, setCheckIn] = useState(initialData.check_in ? formatDateForInput(initialData.check_in) : '');
  const [checkOut, setCheckOut] = useState(initialData.check_out ? formatDateForInput(initialData.check_out) : '');

  const [roomingList, setRoomingList] = useState(
    typeof initialData.rooming_list === 'boolean' ? initialData.rooming_list : false
  );
  const [proForma, setProForma] = useState(
    typeof initialData.pro_forma === 'boolean' ? initialData.pro_forma : false
  );
  // Moneda por defecto EUR
  //const [currency, setCurrency] = useState(initialData.currency || 'EUR');
  const [totalToPay, setTotalToPay] = useState(
    initialData.total_to_pay != null ? initialData.total_to_pay : 0
  );
  const [paymentDate, setPaymentDate] = useState(formatDateForInput(initialData.payment_date));
  const [paymentDoneDate, setPaymentDoneDate] = useState(formatDateForInput(initialData.payment_done_date));
  const [factura, setFactura] = useState(
    typeof initialData.factura === 'boolean' ? initialData.factura : false
  );
  const [iga, setIga] = useState(
    typeof initialData.iga === 'boolean' ? initialData.iga : false
  );
  // PAX asignados para esta asignación (debe ser > 0)
  const [paxAssigned, setPaxAssigned] = useState(initialData.pax || 0);
  // Nuevo comentario que se va a agregar; en edición, se inicia en blanco.
  const [comment, setComment] = useState('');
  // Mensaje de validación
  const [validationMsg, setValidationMsg] = useState('');

  // Para modo edición, calculamos el máximo permitido para esta asignación:
  // availableForEditing = groupPax - (assigned_pax - initialData.pax)
  const availableForEditing = isEditing
    ? parseInt(groupPax, 10) - (parseInt(assigned_pax, 10) - parseInt(initialData.pax, 10))
    : parseInt(groupPax, 10);

  const new_pax = parseInt(assigned_pax, 10) - parseInt(initialData.pax, 10) + parseInt(paxAssigned, 10)

  console.log('PAX disponibles assigned_pax org:', assigned_pax);
  console.log('initialData.pax org:', initialData.pax);
  console.log('new_pax org:', new_pax);
  console.log('groupPax org:', groupPax);

  // Actualizar estados cuando initialData cambie
  useEffect(() => {
    setCity(initialData.city || '');
    setDate(formatDateForInput(initialData.date));
    setHotelId(initialData.id_hotel || '');
    setIdDay(initialData.id_day || '');
    setAssignedPax(initialData.assigned_pax || 0);
    // Realizamos GET de hoteles disponibles según la ciudad
    if (initialData.city) {
      fetch(`${process.env.REACT_APP_API_URL}/hotels/get_hotel_by_city?city=${encodeURIComponent(initialData.city)}`)
        .then(res => res.json())
        .then(data => {
          setHotelsList(data);
        })
        .catch(err => console.error('Error al obtener hoteles:', err));
    }
    setCheckIn(initialData.check_in ? formatDateForInput(initialData.check_in) : '');
    setCheckOut(initialData.check_out ? formatDateForInput(initialData.check_out) : '');
    setPaxAssigned(initialData.pax || 0);
    setRoomingList(typeof initialData.rooming_list === 'boolean' ? initialData.rooming_list : false);
    setProForma(typeof initialData.pro_forma === 'boolean' ? initialData.pro_forma : false);
    setCurrency(initialData.currency || 'EUR');
    setTotalToPay(initialData.total_to_pay != null ? initialData.total_to_pay : 0);
    setPaymentDate(formatDateForInput(initialData.payment_date));
    setPaymentDoneDate(formatDateForInput(initialData.payment_done_date));
    setFactura(typeof initialData.factura === 'boolean' ? initialData.factura : false);
    setIga(typeof initialData.iga === 'boolean' ? initialData.iga : false);
    // No precargamos el comentario para que inicie en blanco
    setComment('');
    setValidationMsg('');
  }, [initialData]);

  // Efecto para actualizar checkIn y checkOut cuando cambia la fecha (solo si no hay valor en initialData)
  useEffect(() => {
    if (date && !initialData.check_in) {
      setCheckIn(date);
      const dt = new Date(date);
      dt.setDate(dt.getDate() + 1);
      setCheckOut(dt.toISOString().split('T')[0]);
    }
  }, [date, initialData.check_in]);


  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validamos que el número de PAX asignados sea mayor a 0
    const paxVal = parseInt(paxAssigned, 10);
    if (paxVal === 0) {
      setValidationMsg('El número de PAX asignados debe ser mayor que 0.');
      return;
    }
    if (paxVal > availableForEditing) {
      setValidationMsg(
        `El número de PAX asignados no puede superar los disponibles para esta asignación (${availableForEditing}).`
      );
      return;
    }
    const payload = {
      id: initialData.assignment_id || '', // Si es edición, se envía el id
      id_hotel: parseInt(hotelId, 10),
      id_group: initialData.id_group || '',
      start_date: checkIn, // Se usa la fecha para ambas (asignación por día)
      end_date: checkOut,
      pax: parseInt(paxAssigned, 10),
      currency,
      total_to_pay: parseFloat(totalToPay),
      comment, // Comentario nuevo
      rooming_list: roomingList,
      pro_forma: proForma,
      payment_date: paymentDate || null,
      payment_done_date: paymentDoneDate || null,
      payed_by: null,
      factura,
      iga,
    };
    console.log('Payload a enviar:', payload);
    try {
      // Se asume que onSave retorna una promesa
      await onSave(payload);
      onHide(); // Cierra el modal si se guarda exitosamente
      return true;
    } catch (error) {
      console.error('Error en onSave:', error);
      return false;
    }
  };

  // Función para manejar "Agregar otro hotel para este día"
  const handleAddAnotherClick = async () => {
    // Primero se ejecuta onSave para guardar la asignación actual
    const saved = await handleSubmit(new Event('submit'));

    const new_pax = parseInt(assigned_pax, 10) - parseInt(initialData.pax, 10) + parseInt(paxAssigned, 10)
    console.log('new_pax', new_pax);

    // Luego se llama al callback onAddAnother para abrir el flujo de agregar otro hotel.
    if (saved && onAddAnother) {
      onAddAnother({
        city,
        date,
        new_pax,
        id_day,
        // puedes pasar otros campos que consideres necesarios
      });;
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
          <Modal.Title>
            {initialData.assignment_id ? 'Editar Asignación de Hotel' : 'Agregar Asignación de Hotel'}
          </Modal.Title>
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
                  Disponible para esta asignación: {availableForEditing} (Total grupo: {groupPax})
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          {/* Fila 6: Fechas de Pago */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPaymentDate">
                <Form.Label>Fecha A Pagar</Form.Label>
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
          {/* Fila 8: Comentarios (para agregar un nuevo comentario; los previos ya quedan guardados en la lista) */}
          <Form.Group controlId="formNotes" className="mb-3">
            <Form.Label>Comentarios</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Escribe un nuevo comentario. Los anteriores quedarán registrados."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
              disabled={
                parseInt(paxAssigned, 10) === 0 ||
                parseInt(paxAssigned, 10) > availableForEditing
              }
            >
              Guardar Cambios
            </Button>
          </div>
          <Button
            variant="outline-primary"
            onClick={handleAddAnotherClick}
            disabled={parseInt(paxAssigned, 10) === 0 ||
              parseInt(paxAssigned, 10) >= availableForEditing} 
          >
            Agregar otro hotel para este día
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default HotelModal;