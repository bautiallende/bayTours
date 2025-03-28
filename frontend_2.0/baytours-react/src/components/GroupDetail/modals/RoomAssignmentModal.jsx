import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

// Función para calcular la edad a partir de la fecha de nacimiento
const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const parseCheckDate = (dateStr, defaultTime) => {
  console.log('parseCheckDate: dateStr =', dateStr);
  if (!dateStr || dateStr.toLowerCase() === 'jj/mm/aaaa') {
    return { date: '', time: defaultTime };
  }
  // Suponemos que el formato es "dd/mm hh:mm" (con un espacio)
  const parts = dateStr.split(' ');
  if (parts.length === 2) {
    console.log('parseCheckDate: date: parts[0]', parts[0])
    return { date:new Date(parts[0]), time: parts[1] };
  }
  return { date: dateStr, time: defaultTime };
};




const RoomAssignmentModal = ({ show, onHide, initialData, onSave, availableHotels }) => {
  console.log(`RoomAssignmentModal: initialData =`, initialData);
  console.log(`RoomAssignmentModal: availableHotels =`, availableHotels);
  // Campos editables
  const [hotelId, setHotelId] = useState(initialData.id_hotel || '');
  const [hotelReservationId, setHotelReservationId] = useState(initialData.id_hotel_reservation || '');
  const [roomType, setRoomType] = useState(initialData.type || '');
  const [roomNumber, setRoomNumber] = useState(initialData.room_number || '');
  const [notes, setNotes] = useState('');
  const [validationMsg, setValidationMsg] = useState('');

  const [status, setStatus] = useState(initialData.status || 'Nuevo');

  // Opciones para tipos de habitación y datos asociados (precio, currency)
  const [roomTypeOptions, setRoomTypeOptions] = useState([]);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Estados para suplementos
  const [supplement, setSupplement] = useState('');
  const [supplementCurrency, setSupplementCurrency] = useState('');

  // Estados para los datos de check-in y check-out
  const [city, setCity] = useState(initialData.city || '');
  // Si existen datos en initialData, se separan; de lo contrario quedan vacíos (o se pueden asignar valores por defecto)
  const [checkInDate, setCheckInDate] = useState(
    ''
  );
  const [checkInTime, setCheckInTime] = useState(
    initialData.check_in_date ? parseCheckDate(initialData.check_in_date, '15:00').time : '15:00'
  );
  const [checkOutDate, setCheckOutDate] = useState(
    initialData.departure_date ? parseCheckDate(initialData.departure_date, '11:00').date : ''
  );
  const [checkOutTime, setCheckOutTime] = useState(
    initialData.departure_date ? parseCheckDate(initialData.departure_date, '11:00').time : '11:00'
  );

    // Effect para limpiar los campos editables cada vez que se abre el modal
    useEffect(() => {
      if (show) {
        setValidationMsg('');
        if (initialData && Object.keys(initialData).length > 0) {
          console.log('initialData.check_in_date:', initialData.check_in_date);
          console.log('initialData.departure_date:', initialData.departure_date);
          setHotelId(initialData.id_hotel || '');
          setHotelReservationId(initialData.id_hotel_reservation || '');
          setRoomType(initialData.type || '');
          setRoomNumber(initialData.room_number || '');
          setSelectedRoomId(initialData.id_room || null);
          setStatus(initialData.status || 'Nuevo');
          setNotes(initialData.comments || '');
          setSelectedRoomInfo(
            initialData.price != null ? { price: initialData.price, currency: initialData.currency } : null
          );
          setSupplement(initialData.supplements || '');
          setSupplementCurrency(initialData.supplements_currency || 'EUR');
          setCity(initialData.city || '');
          // Usamos las propiedades correctas:
          if (initialData.check_in_date) {
            const checkIn = parseCheckDate(initialData.check_in_date, '15:00');
            setCheckInDate(new Date(initialData.check_in_date).toISOString().slice(0, 10));
            setCheckInTime(checkIn.time);
            if (initialData.departure_date) {
              const checkOut = parseCheckDate(initialData.departure_date, '11:00');
              setCheckOutDate(new Date(initialData.departure_date).toISOString().slice(0, 10));
              setCheckOutTime(checkOut.time);
            } else {
              const nextDay = new Date(initialData.check_in_date);
              nextDay.setDate(nextDay.getDate() + 1);
              setCheckOutDate(nextDay.toISOString().slice(0, 10));
              setCheckOutTime('11:00');
            }
          } else {
            setCheckInDate(new Date().toISOString().slice(0, 10));
            const nextDay = new Date().toISOString().slice(0, 10);
            nextDay.setDate(nextDay.getDate() + 1);
            setCheckInTime('15:00');
            setCheckOutDate(nextDay.toISOString().slice(0, 10));
            setCheckOutTime('11:00');
          }
        } else {
          setHotelId('');
          setHotelReservationId('');
          setRoomType('');
          setRoomNumber('');
          setNotes('');
          setValidationMsg('');
          setRoomTypeOptions([]);
          setSelectedRoomInfo(null);
          setSelectedRoomId(null);
          setSupplement('');
          setSupplementCurrency('EUR');
          setCity('');
          setCheckInDate('');
          setCheckInTime('15:00');
          setCheckOutDate('');
          setCheckOutTime('11:00');
          setStatus('Nuevo');
        }
      }
    }, [show, initialData]);

  // Cuando se selecciona un hotel, actualizar las opciones de habitación y los datos de ciudad, check-in y check-out
  useEffect(() => {
    if (hotelId) {
      // Llamada al endpoint para obtener tipos de habitación para el hotel seleccionado
      fetch(`${process.env.REACT_APP_API_URL}/hotels_room/hotels_room?id_hotel=${hotelId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success' && Array.isArray(data.data)) {
            setRoomTypeOptions(data.data);
          } else {
            setRoomTypeOptions([]);
          }
        })
        .catch((err) => {
          console.error('Error al obtener tipos de habitación:', err);
          setRoomTypeOptions([]);
        });
      
      // Buscar en availableHotels los datos del hotel seleccionado
      const selectedHotel = availableHotels.find(h => h.id_hotel.toString() === hotelId);
      setNotes("");
      if (selectedHotel) {
        setCity(selectedHotel.city || '');
        // Actualizar las fechas: separamos la fecha y la hora (si existen), o usamos valores por defecto.
        if (selectedHotel.start_date) {
          const parts = selectedHotel.start_date.split('T');
          setCheckInDate(parts[0]);
          setCheckInTime(parts[1] ? parts[1].slice(0,5) : '15:00');
        } else {
          setCheckInDate('');
          setCheckInTime('15:00');
        }
        if (selectedHotel.end_date) {
          const parts = selectedHotel.end_date.split('T');
          setCheckOutDate(parts[0]);
          setCheckOutTime(parts[1] ? parts[1].slice(0,5) : '11:00');
        } else {
          setCheckOutDate('');
          setCheckOutTime('11:00');
        }
      }
    } else {
      setRoomTypeOptions([]);
      setSelectedRoomInfo(null);
      setSelectedRoomId(null);
    }
  }, [hotelId, availableHotels]);

  // Al seleccionar un tipo de habitación, actualizar automáticamente precio y divisa
  const handleRoomTypeChange = (e) => {
    const selectedType = e.target.value;
    setRoomType(selectedType);
    const selectedOption = roomTypeOptions.find(rt => rt.type === selectedType);
    setSelectedRoomInfo(selectedOption || null);
    setSelectedRoomId(selectedOption ? selectedOption.id_room : null);
  };

  // Función para combinar fecha y hora en formato ISO (sin zona horaria)
  const combineDateAndTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    // Asumimos que la zona horaria se manejará en el backend
    return `${dateStr}T${timeStr}:00Z`;
  };

  // Función para guardar la asignación
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hotelId) {
      setValidationMsg('Debe seleccionar un hotel.');
      return;
    }
    if (!roomType) {
      setValidationMsg('Debe seleccionar un tipo de habitación.');
      return;
    }
    const checkInCombined = combineDateAndTime(checkInDate, checkInTime);
    const checkOutCombined = combineDateAndTime(checkOutDate, checkOutTime);
    const payload = {
      id: initialData.id, // supondremos que viene en initialData
      id_hotel_reservation: hotelReservationId || 0,
      client_id: initialData.id_clients,
      id_room: parseInt(selectedRoomId),
      room_number: roomNumber,
      status: status,
      check_in_date: checkInCombined,
      departure_date: checkOutCombined,
      price: selectedRoomInfo ? selectedRoomInfo.price : null,
      currency: selectedRoomInfo ? selectedRoomInfo.currency : null,
      complement: supplement ? Number(supplement) : 0,
      complement_currency: supplementCurrency,
      comments: notes,
    };
    onSave(payload)
      .then(() => {
        onHide();
      })
      .catch((err) => {
        setValidationMsg(err.message || 'Error al guardar la asignación.');
      });
  };
  

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{initialData.id ? 'Editar Asignación de Cuarto' : 'Asignar Cuarto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Fila 1: Información del Cliente */}
          <Row className="mb-2">
            <Col>
              <strong>Cliente:</strong> {`${initialData.first_name || ''} ${initialData.second_name || ''} ${initialData.paternal_surname || ''} ${initialData.mother_surname || ''}`}
            </Col>
          </Row>
          {/* Fila 2: Datos Personales */}
          <Row className="mb-2">
            <Col md={4}>
              <strong>Edad:</strong> {calculateAge(initialData.birth_date)}
            </Col>
            <Col md={4}>
              <strong>Sexo:</strong> {initialData.sex || '-'}
            </Col>
            <Col md={4}>
              <strong>Pasaporte:</strong> {initialData.passport || '-'}
            </Col>
          </Row>
          {/* Fila 3: Fecha y Ciudad Original */}
          <Row className="mb-3">
            <Col md={6}>
              <strong>Fecha:</strong> {initialData.date}
            </Col>
          </Row>
          {/* Fila 4: Selección de Hotel */}
          <Form.Group controlId="editHotel" className="mb-3">
            <Form.Label>Hotel</Form.Label>
            <Form.Select value={hotelId} onChange={(e) => setHotelId(e.target.value)}>
              <option value="">Seleccione un hotel</option>
              {availableHotels.map((h) => (
                <option key={h.id_hotel} value={h.id_hotel}>
                  {h.hotel_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {/* Fila 5: Mostrar Ciudad y Fechas Actualizadas (solo lectura) */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="displayCity">
                <Form.Label className="fw-bold">Ciudad Actualizada</Form.Label>
                <Form.Control type="text" value={city} readOnly />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="displayCheckInDate">
                <Form.Label className="fw-bold">Check-in</Form.Label>
                <Form.Control type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} readOnly />
              </Form.Group>
            </Col>
            <Col md={4} className="text-end">
              <Form.Group controlId="displayCheckInTime">
                <Form.Label>Check-in (Hora)</Form.Label>
                <Form.Control type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3 justify-content-end">
            <Col md={4}>
              <Form.Group controlId="editStatus">
                <Form.Label className="fw-bold">Estado</Form.Label>
                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="New">Nuevo</option>
                  <option value="Provisional">Provisorio</option>
                  <option value="Confirmed">Confirmado</option>
                  <option value="Under review">En revision</option>                  
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="displayCheckOutDate">
                <Form.Label className="fw-bold">Check-out</Form.Label>
                <Form.Control type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} readOnly/>
              </Form.Group>
            </Col>
            <Col md={4} className="text-end">
              <Form.Group controlId="displayCheckOutTime">
                <Form.Label>Check-out (Hora)</Form.Label>
                <Form.Control type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          {/* Fila 6: Selección de Tipo de Habitación y visualización de Precio y Divisa */}
          <Row className="mb-3">
            <Col md={5}>
              <Form.Group controlId="editRoomType">
                <Form.Label>Tipo de Habitación</Form.Label>
                <Form.Select value={roomType} onChange={handleRoomTypeChange}>
                  <option value="">Seleccione un tipo</option>
                  {roomTypeOptions.map((rt) => (
                    <option key={rt.id_room} value={rt.type}>
                      {rt.type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="displayPrice">
                <Form.Label className="fw-bold">Precio</Form.Label>
                <Form.Control type="number" value={selectedRoomInfo ? selectedRoomInfo.price : ''} readOnly />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="displayCurrency">
                <Form.Label className="fw-bold">Divisa</Form.Label>
                <Form.Control type="text" value={selectedRoomInfo ? selectedRoomInfo.currency : ''} readOnly />
              </Form.Group>
            </Col>
          </Row>
          {/* Fila 7: Suplemento y Divisa de Suplemento */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="editSupplement">
                <Form.Label>Suplemento</Form.Label>
                <Form.Control type="number" value={supplement} onChange={(e) => setSupplement(e.target.value)} placeholder="Ingrese suplemento (opcional)" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="editSupplementCurrency">
                <Form.Label>Divisa Suplemento</Form.Label>
                <Form.Select value={supplementCurrency} onChange={(e) => setSupplementCurrency(e.target.value)}>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  {/* Más opciones si es necesario */}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {/* Fila 8: Número de Habitación */}
          <Form.Group controlId="editRoomNumber" className="mb-3">
            <Form.Label>Número de Habitación</Form.Label>
            <Form.Control type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="Ingrese el número de habitación" />
          </Form.Group>
          {/* Fila 9: Notas / Comentarios */}
          <Form.Group controlId="editNotes" className="mb-3">
            <Form.Label>Notas / Comentarios</Form.Label>
            <Form.Control as="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Form.Group>
          {validationMsg && <Alert variant="danger">{validationMsg}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button variant="primary" type="submit">Guardar Cambios</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

RoomAssignmentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  initialData: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  availableHotels: PropTypes.array.isRequired,
};

export default RoomAssignmentModal;