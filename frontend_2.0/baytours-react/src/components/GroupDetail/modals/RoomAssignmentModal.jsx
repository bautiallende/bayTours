import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Row, Col, Alert, Table } from 'react-bootstrap';

// Helper para obtener el ID del cliente, sea en "id_clients" o "client_id"
const getClientId = (client) => client.id_clients || client.client_id;

// Función para calcular la edad a partir de la fecha de nacimiento
const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const parseCheckDate = (dateStr, defaultTime) => {
  if (!dateStr || dateStr.toLowerCase() === 'jj/mm/aaaa') {
    return { date: '', time: defaultTime };
  }
  if (dateStr.includes('/')) {
    const parts = dateStr.split(' ');
    const datePart = parts[0];
    const timePart = parts[1] || defaultTime;
    const [day, month, year] = datePart.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    const isoDateStr = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return { date: new Date(`${isoDateStr}T${timePart}:00`), time: timePart };
}
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { date: new Date(dateStr), time: defaultTime };
  }
  const parts = dateStr.split(' ');
  if (parts.length === 2) {
    return { date: new Date(parts[0]), time: parts[1] };
  }
  return { date: dateStr, time: defaultTime };
};

// Nuevo modal para agregar clientes de habitaciones individuales
const SoloClientsModal = ({ show, onHide, onSelectClient, id_days }) => {
  const [soloClients, setSoloClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      fetch(`${process.env.REACT_APP_API_URL}/rooms/get_solo_clients?id_days=${id_days}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success' && Array.isArray(data.data)) {
            setSoloClients(data.data);
          } else {
            setSoloClients([]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error al obtener solo clients:', err);
          setSoloClients([]);
          setLoading(false);
        });
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p>Cargando clientes...</p>
        ) : soloClients.length > 0 ? (
          <Table size="sm" bordered>
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>Pasaporte</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {soloClients.map((client) => {
                const fullName = `${client.first_name || ''} ${client.second_name || ''} ${client.paternal_surname || ''} ${client.mother_surname || ''}`.trim();
                const age = calculateAge(client.birth_date);
                return (
                  <tr key={client.client_id}>
                    <td>{fullName}</td>
                    <td>{age}</td>
                    <td>{client.sex || '-'}</td>
                    <td>{client.passport || '-'}</td>
                    <td>
                      <Button variant="success" size="sm" onClick={() => { onSelectClient(client); onHide(); }}>
                        Seleccionar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <p>No se encontraron clientes.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
      </Modal.Footer>
    </Modal>
  );
};

SoloClientsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSelectClient: PropTypes.func.isRequired,
};

const RoomAssignmentModal = ({ show, onHide, initialData, onSave, availableHotels }) => {
  console.log("initialData:", initialData);
  // Estados de la asignación
  const [hotelId, setHotelId] = useState(initialData.id_hotel || '');
  const [hotelReservationId, setHotelReservationId] = useState(initialData.id_hotel_reservation || '');
  const [roomType, setRoomType] = useState(initialData.type || '');
  const [roomNumber, setRoomNumber] = useState(initialData.room_number || '');
  const [notes, setNotes] = useState('');
  const [validationMsg, setValidationMsg] = useState('');
  const [status, setStatus] = useState(initialData.status || 'Nuevo');

  const [roomTypeOptions, setRoomTypeOptions] = useState([]);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Estado para sincronización del precio
  const [syncPrice, setSyncPrice] = useState(true);

  const [supplement, setSupplement] = useState('');
  const [supplementCurrency, setSupplementCurrency] = useState('');

  const [city, setCity] = useState(initialData.city || '');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkInTime, setCheckInTime] = useState(
    initialData.check_in_date ? parseCheckDate(initialData.check_in_date, '15:00').time : '15:00'
  );
  const [checkOutDate, setCheckOutDate] = useState(
    initialData.departure_date ? parseCheckDate(initialData.departure_date, '11:00').date : ''
  );
  const [checkOutTime, setCheckOutTime] = useState(
    initialData.departure_date ? parseCheckDate(initialData.departure_date, '11:00').time : '11:00'
  );

  // Estados para la distribución:
  // groupClients: lista completa obtenida mediante endpoint
  // selectedClientsState: IDs de clientes marcados para separar (se mostrarán en rojo)
  // newClients: lista de clientes agregados (se mostrarán en verde)
  const [groupClients, setGroupClients] = useState([]);
  const [selectedClientsState, setSelectedClientsState] = useState([]);
  const [newClients, setNewClients] = useState([]);
  
  // Estado para mostrar el modal de agregar cliente
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const [confirmedSeparatedClients, setConfirmedSeparatedClients] = useState([]);

  // Al abrir el modal, reinicializar campos y obtener groupClients si room_composition_id existe
  useEffect(() => {
    if (show) {
      setValidationMsg('');
      if (initialData && Object.keys(initialData).length > 0) {
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
        if (initialData.check_in_date) {
          const checkIn = parseCheckDate(initialData.check_in_date, '15:00');
          console.log("checkIn luego de la conversion:", checkIn);
          setCheckInDate(checkIn.date.toISOString().slice(0, 10));
          setCheckInTime(checkIn.time);
          if (initialData.departure_date) {
            const checkOut = parseCheckDate(initialData.departure_date, '11:00');
            setCheckOutDate(checkOut.date.toISOString().slice(0, 10));
            setCheckOutTime(checkOut.time);
          } else {
            const nextDay = new Date(initialData.check_in_date);
            nextDay.setDate(nextDay.getDate() + 1);
            setCheckOutDate(nextDay.toISOString().slice(0, 10));
            setCheckOutTime('11:00');
          }
        } else {
          setCheckInDate(new Date().toISOString().slice(0, 10));
          const nextDay = new Date();
          nextDay.setDate(nextDay.getDate() + 1);
          setCheckInTime('15:00');
          setCheckOutDate(nextDay.toISOString().slice(0, 10));
          setCheckOutTime('11:00');
        }
        setSelectedClientsState([]);
        setNewClients([]);
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
        setSelectedClientsState([]);
        setNewClients([]);
      }
    }
  }, [show, initialData]);

  // Obtener opciones de habitación al seleccionar hotel
  useEffect(() => {
    if (hotelId) {
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
      console.log("availableHotels:", availableHotels);
      const selectedHotel = availableHotels.find(h => h.id_hotel.toString() === hotelId);
      setNotes("");
      console.log("selectedHotel:", selectedHotel);
      if (selectedHotel) {
        setCity(selectedHotel.city || '');
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

  // Si existe room_composition_id, obtener groupClients mediante endpoint
  useEffect(() => {
    if (show && initialData && initialData.room_composition_id) {
      fetch(`${process.env.REACT_APP_API_URL}/rooms/get_clients_by_id?room_composition_id=${initialData.room_composition_id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success' && Array.isArray(data.data)) {
            setGroupClients(data.data);
          } else {
            setGroupClients([]);
          }
        })
        .catch((err) => {
          console.error('Error al obtener clientes del room:', err);
          setGroupClients([]);
        });
    } else {
      setGroupClients([initialData]);
    }
  }, [show, initialData]);

  // Maneja el cambio de tipo de habitación; si syncPrice está activo, se actualiza precio
  const handleRoomTypeChange = (e) => {
    const selectedType = e.target.value;
    setRoomType(selectedType);
    const selectedOption = roomTypeOptions.find(rt => rt.type === selectedType);
    if (syncPrice) {
      setSelectedRoomInfo(selectedOption || null);
      setSelectedRoomId(selectedOption ? selectedOption.id_room : null);
    }
  };

  // Combina fecha y hora en formato ISO
  const combineDateAndTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    return `${dateStr}T${timeStr}:00Z`;
  };

  // Función para guardar la asignación, enviando separatedClients y newClients
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
      id: initialData.id,
      id_hotel_reservation: hotelReservationId || hotelId,
      room_composition_id: initialData.room_composition_id || 0,
      id_days: initialData.id_days || 0,
      separatedClients: confirmedSeparatedClients, // IDs a separar
      newClients: newClients.map(c => getClientId(c)),                 // IDs nuevos a agregar
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

  // Manejo de selección de clientes para separar: se marca con checkbox y se colorea la fila en rojo
  const handleClientSelection = (e, client) => {
    const clientId = getClientId(client);
    if (e.target.checked) {
      setSelectedClientsState([...selectedClientsState, clientId]);
    } else {
      setSelectedClientsState(selectedClientsState.filter(id => id !== clientId));
    }
  };

  // Función para abrir el modal de agregar cliente
  const handleOpenAddClientModal = () => {
    setShowAddClientModal(true);
  };

  // Cuando se selecciona un cliente en el modal de solo clients, se agrega a newClients
  const handleSelectSoloClient = (client) => {
    const clientId = getClientId(client);
    if (!newClients.find(c => getClientId(c) === clientId)) {
      setNewClients([...newClients, client]);
    }
  };


  // Al presionar "Separar clientes seleccionados", se deja el registro (ya se colorea en rojo)
  const handleSeparateClients = () => {
    setConfirmedSeparatedClients(selectedClientsState);
    console.log("Clientes confirmados para separar:", selectedClientsState);
  };

  // Función para determinar el estilo de la fila en el resumen:
  // Si el cliente está en selectedClientsState → rojo; si está en newClients → verde; de lo contrario, sin estilo.
  const getRowStyle = (client) => {
    const clientId = getClientId(client);
    if (confirmedSeparatedClients.includes(clientId)) {
      return 'row-red'; // Aplica estilo rojo solo si ya se confirmó la separación
    }
    if (newClients.find(c => getClientId(c) === clientId)) {
      return 'row-green'; // Verde para los nuevos
    }
    return {};
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="xl">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{initialData.id ? 'Editar Asignación de Cuarto' : 'Asignar Cuarto'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Sección de resumen de clientes */}
            <Row className="mb-3">
              <Col>
                <h5>Clientes en la Asignación</h5>
                {groupClients && groupClients.length > 0 ? (
                  <Table size="sm" bordered>
                    <thead>
                      <tr>
                        <th>Seleccionar</th>
                        <th>Nombre Completo</th>
                        <th>Edad</th>
                        <th>Sexo</th>
                        <th>Pasaporte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupClients.map((client) => {
                        const fullName = `${client.first_name || ''} ${client.second_name || ''} ${client.paternal_surname || ''} ${client.mother_surname || ''}`.trim();
                        const age = calculateAge(client.birth_date);
                        return (
                          <tr key={getClientId(client)} className={getRowStyle(client)}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                value={getClientId(client)}
                                onChange={(e) => handleClientSelection(e, client)}
                                checked={selectedClientsState.includes(getClientId(client))}
                              />
                            </td>
                            <td>{fullName}</td>
                            <td>{age}</td>
                            <td>{client.sex || '-'}</td>
                            <td>{client.passport || '-'}</td>
                          </tr>
                        );
                      })}
                      {/* Renderizar clientes agregados nuevos en verde */}
                      {newClients.map((client) => {
                        const fullName = `${client.first_name || ''} ${client.second_name || ''} ${client.paternal_surname || ''} ${client.mother_surname || ''}`.trim();
                        const age = calculateAge(client.birth_date);
                        return (
                          <tr key={getClientId(client)} className={getRowStyle(client)}>
                            <td>Nuevo</td>
                            <td>{fullName}</td>
                            <td>{age}</td>
                            <td>{client.sex || '-'}</td>
                            <td>{client.passport || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                ) : (
                  <p>No hay datos de clientes.</p>
                )}
                <Button variant="warning" onClick={handleSeparateClients} className="me-2">
                  Separar clientes seleccionados
                </Button>
                <Button variant="success" onClick={handleOpenAddClientModal}>
                  Agregar cliente
                </Button>
              </Col>
            </Row>
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
                    <option value="Under review">En revisión</option>                  
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
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="syncPrice">
                  <Form.Check 
                    type="checkbox"
                    label="Mantener precio por defecto de la habitación seleccionada"
                    checked={syncPrice}
                    onChange={(e) => setSyncPrice(e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    Con el checkbox marcado, al cambiar el tipo se actualizará el precio. Si se desmarca, el precio no se actualizará.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
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
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="editRoomNumber" className="mb-3">
              <Form.Label>Número de Habitación</Form.Label>
              <Form.Control type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="Ingrese el número de habitación" />
            </Form.Group>
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

      {/* Modal para agregar nuevo cliente */}
      <SoloClientsModal 
        show={showAddClientModal} 
        onHide={() => setShowAddClientModal(false)} 
        onSelectClient={handleSelectSoloClient} 
        id_days={initialData.id_days}
      />
    </>
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
