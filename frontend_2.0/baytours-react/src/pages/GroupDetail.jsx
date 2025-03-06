import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Card, Badge, Tab, Nav, Spinner } from 'react-bootstrap';
import { useParams, useLocation, Link, useNavigate    } from 'react-router-dom';

// Componentes principales para mostrar datos
import ClientsTable from '../components/ClientsTable';
import OptionalsSection from '../components/OptionalsSection';
import OptionalsFilterModal from '../components/OptionalsFilterModal';

import HotelAssignmentsTable from '../components/HotelAssignmentsTable'; // Placeholder para asignaciones de hoteles
import HotelModal from '../components/HotelModal';
// Importamos el modal para agregar otro hotel (HotelAddAnotherModal.jsx)
import HotelAddAnotherModal from '../components/HotelAddAnotherModal';


// Modales para edición de información general
import EditGuideModal from '../components/EditGuideModal';
import EditBusModal from '../components/EditBusModal';
import EditQRModal from '../components/EditQRModal';

// Importar los nuevos modales
import EditOperationsAgentModal from '../components/EditOperationsAgentModal';
import EditAssistantModal from '../components/EditAssistantModal';
import EditResponsibleHotelsModal from '../components/EditResponsibleHotelsModal';

// Importar modales para opcionales (Add, Edit y Delete)
import AddOptionalModal from '../components/AddOptionalModal';
import EditOptionalModal from '../components/EditOptionalModal';
import DeleteOptionalModal from '../components/DeleteOptionalModal';

import OptionModal from '../components/OptionModal';
// ... otros modales que necesites


// Si usas react-leaflet para el mapa (opcional)
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


const GroupDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Extraer parámetros de la query string: tabla activa y filtros
  const queryParams = new URLSearchParams(location.search);
  const initialTable = queryParams.get('table') || 'clientes';
  const filters = queryParams.get('filters') || null;

  // --- Estados locales ---

  // Estado de la pestaña activa (por defecto, la que viene en la URL)
  const [activeTab, setActiveTab] = useState(initialTable);

  // Estado para mostrar el modal de filtro (aplica a la tabla activa)
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Estados para almacenar los datos del grupo
  const [groupData, setGroupData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [clientAges, setClientAges] = useState({});
  const [loading, setLoading] = useState(true);

  // Estados para modales de información general
  const [showEditGuideModal, setShowEditGuideModal] = useState(false);
  const [showEditBusModal, setShowEditBusModal] = useState(false);
  const [showEditQRModal, setShowEditQRModal] = useState(false);

  // Estados para modales de contacto
  const [showEditOperationsAgentModal, setShowEditOperationsAgentModal] = useState(false);
  const [showEditAssistantModal, setShowEditAssistantModal] = useState(false);
  const [showEditResponsibleHotelsModal, setShowEditResponsibleHotelsModal] = useState(false);
  // Estados para modales de opcionales
  const [showAddOptionalModal, setShowAddOptionalModal] = useState(false);
  const [showEditOptionalModal, setShowEditOptionalModal] = useState(false);
  const [showDeleteOptionalModal, setShowDeleteOptionalModal] = useState(false);
  const [currentOptionalData, setCurrentOptionalData] = useState(null);

  // Datos para el modal de opcionales (cliente y día seleccionados)
  const [optionalClientData, setOptionalClientData] = useState({
    clientId: '',
    city: '',
    cityDays: [],
    clientName: '',
    dayId: ''
  });
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [currentOptionParams, setCurrentOptionParams] = useState({
    client: null,
    dayId: '',
    city: '',
    cityDays: [],
  });

  // Estado para el modal de hoteles
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [hotelInitialData, setHotelInitialData] = useState(null);

  // Estado para el modal de agregar otro hotel para el mismo día (nuevo)
  const [showHotelAddAnotherModal, setShowHotelAddAnotherModal] = useState(false);
  const [hotelAddAnotherInitialData, setHotelAddAnotherInitialData] = useState({});
  
  // --- Función para obtener datos del grupo ---
  const fetchGroupData = () => {
    const apiUrl = `${process.env.REACT_APP_API_URL}/groups/group_data`;
    // Se envía la pestaña activa (clientes, hoteles, etc.) en la variable "table"
    const params = new URLSearchParams({ id_group: id, table: activeTab });
    if (filters) {
      params.append('filters', filters);
    }
    fetch(`${apiUrl}?${params.toString()}`)
      .then(response => {
        if (!response.ok)
          throw new Error('Error al obtener los datos del grupo');
        return response.json();
      })
      .then(data => {
        setGroupData(data.group_data);
        setTableData(data.table_data);
        setItinerary(data.itinerary || []);
        setClientAges(data.client_ages || {});
      })
      .catch(error => console.error('Error al obtener el detalle del grupo:', error))
      .finally(() => setLoading(false));
  };

  // Actualizar datos cada vez que cambie el id, la pestaña activa o los filtros
  useEffect(() => {
    setLoading(true);
    fetchGroupData();
  }, [id, activeTab, filters]);

  // --- Callbacks para manejar modales de opcionales ---

  // Abre el modal intermedio de opciones (Editar, Agregar, Borrar) para un cliente en un día específico
  const handleOptionModal = (client, dayId, cityInfo, cityDays, optional = null) => {
    setCurrentOptionParams({
      client,
      dayId,
      city: cityInfo.city,
      cityDays,
    });
    // Si el cliente ya tiene opcionales para ese día, preselecciona el primero
    if (optional) {
      setCurrentOptionalData(optional);
    } else if (client.day_optionals && client.day_optionals[dayId] && client.day_optionals[dayId].length > 0) {
      setCurrentOptionalData(client.day_optionals[dayId][0]);
    } else {
      setCurrentOptionalData(null);
    }
    setShowOptionModal(true);
  };

  // Acción "Agregar" desde el modal de opciones
  const handleOptionModalAdd = () => {
    setOptionalClientData({
      clientId: currentOptionParams.client.id_clients,
      city: currentOptionParams.city,
      cityDays: currentOptionParams.cityDays,
      clientName: `${currentOptionParams.client.first_name} ${currentOptionParams.client.paternal_surname}`,
      dayId: currentOptionParams.dayId,
    });
    setShowAddOptionalModal(true);
  };

  // Acción "Editar" desde el modal de opciones
  const handleOptionModalEdit = () => {
    if (currentOptionalData) {
      setShowEditOptionalModal(true);
    } else {
      alert('No hay opcionales para editar en este día.');
    }
  };

  // Acción "Borrar" desde el modal de opciones
  const handleOptionModalDelete = () => {
    setCurrentOptionalData(currentOptionalData);
    setShowDeleteOptionalModal(true);
  };

  // Función para manejar la acción directa "Agregar" (sin pasar por el modal intermedio)
  const handleAddOptional = (client, dayId, city, cityDays) => {
    setOptionalClientData({
      clientId: client.id_clients,
      city,
      cityDays,
      clientName: `${client.first_name} ${client.paternal_surname}`,
      dayId
    });
    setShowAddOptionalModal(true);
  };

  // Función para manejar la acción directa "Editar" de un opcional
  const handleEditOptional = (client, dayId, optional) => {
    const cityFound = itinerary.find(ci => ci.days.some(d => d.id === dayId));
    const newOptionalClientData = {
      clientId: client.id_clients,
      city: cityFound ? cityFound.city : '',
      cityDays: cityFound ? cityFound.days : [],
      clientName: `${client.first_name} ${client.paternal_surname}`,
      dayId
    };
    setOptionalClientData(newOptionalClientData);
    setCurrentOptionParams({
      ...newOptionalClientData,
      client
    });
    setCurrentOptionalData(optional);
    setShowEditOptionalModal(true);
  };

  // Callback para aplicar filtros desde el modal de filtro
  const handleApplyFilter = (filtersObj) => {
    const filtersParam = encodeURIComponent(JSON.stringify(filtersObj));
    navigate(`/grupo/${groupData.id_group}?table=${activeTab}&filters=${filtersParam}`);
  };

  // Ejemplo de callback para abrir el modal de agregar otro hotel:
  const handleOpenHotelAddAnother = (assignmentData) => {
    // Aquí assignmentData puede provenir de la edición actual; se usará para precargar ciudad, fecha, id_group, etc.
    console.log('Datos de la asignación actual:', assignmentData);
    setHotelAddAnotherInitialData({
      city: assignmentData.city,
      date: assignmentData.date,
      id_group: groupData.id_group,
      new_pax: assignmentData.new_pax,
      id_day: assignmentData.id_day
      // Se pueden agregar otros campos si es necesario.
    });
    console.log('Datos iniciales para agregar otro hotel:', hotelAddAnotherInitialData);
    setShowHotelAddAnotherModal(true);
  };


  // --- Renderizado de la interfaz ---

  // Mientras se cargan los datos, se muestra un spinner
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  // Si no se encontró el grupo, se muestra un mensaje de error
  if (!groupData) {
    return <Container><p>Error: Grupo no encontrado.</p></Container>;
  }

  return (
    <Container fluid>
      {/* Título del Grupo */}
      <Row className="mt-1">
        <Col className="text-center">
          <h3 className="mt-1 mb-1">
            {groupData.id_group}: {groupData.nombre_circuito}
          </h3>
        </Col>
      </Row>

      {/* Sección de Información General */}
      <Row className="mt-3">
        <Col md={3}>
          <Card style={{ backgroundColor: '#BDD8F1', borderRadius: '10px' }}>
            <Card.Body className="p-2">
              <h5>Información General</h5>
              <Row>
                <Col>
                  <p><strong>ID Grupo:</strong> {groupData.id_group}</p>
                  <p>
                    <strong>Guía:</strong>{' '}
                    <span id="guideName">{groupData.guide_name || 'No asignado'}</span>
                    <Link className="ms-2 edit-icon" onClick={() => setShowEditGuideModal(true)} to="#">
                      <i className="fas fa-edit"></i>
                    </Link>
                  </p>
                  <p>
                    <strong>Bus:</strong>{' '}
                    <span id="busInfo">
                      {groupData.bus_company || 'No asignado'} {groupData.bus_code ? ' - ' + groupData.bus_code : ''}
                    </span>
                    <Link className="ms-2 edit-icon" onClick={() => setShowEditBusModal(true)} to="#">
                      <i className="fas fa-edit"></i>
                    </Link>
                  </p>
                </Col>
                <Col>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Badge pill bg="success" style={{ fontSize: '1rem', padding: '5px', marginLeft: '8px'}}>
                      {groupData.status.charAt(0).toUpperCase() + groupData.status.slice(1)}
                    </Badge>
                  </p>
                  <p>
                    <strong>QR:</strong>{' '}
                    <span id="qrStatus">{groupData.QR ? 'Sí' : 'No'}</span>
                    <Link className="ms-2 edit-icon" onClick={() => setShowEditQRModal(true)} to="#">
                      <i className="fas fa-edit"></i>
                    </Link>
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Sección de Itinerario */}
        <Col md={5}>
          <Card style={{ backgroundColor: '#BDD8F1', borderRadius: '10px' }}>
            <Card.Body className="p-2">
              <h5>Itinerario</h5>
              <Row>
                <Col>
                  <p><strong>Vuelo de Llegada:</strong> {groupData.start_flight || 'No asignado'}</p>
                  <p>
                    <strong>Fecha de Inicio:</strong>{' '}
                    <span id="fechaInicio">{groupData.start_date}</span>
                  </p>
                  <p><strong>Ciudad Actual:</strong> {groupData.ciudad_actual || 'N/A'}</p>
                </Col>
                <Col>
                  <p><strong>Vuelo de Regreso:</strong> {groupData.end_flight || 'No asignado'}</p>
                  <p>
                    <strong>Fecha de Regreso:</strong>{' '}
                    <span id="fechaRegreso">{groupData.end_date}</span>
                  </p>
                  <p><strong>Hotel Actual:</strong> {groupData.hotel_actual || 'N/A'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Sección de Contacto y Mapa Mini */}
        <Col md={4}>
          <Card style={{ backgroundColor: '#BDD8F1', borderRadius: '10px' }}>
            <Card.Body className="p-2">
              <Row>
                <Col xs={6}>
                  <h5>Contacto</h5>
                  <p>
                    <strong>Operaciones:</strong>{' '}
                    <span id="operationsAgentInfo">{groupData.operaciones_name || 'No asignado'}</span>
                    <Link className="ms-2 edit-icon" onClick={() => setShowEditOperationsAgentModal(true)} to="#">
                      <i className="fas fa-edit"></i>
                    </Link>
                  </p>
                  <p>
                    <strong>Asistente:</strong>{' '}
                    <span id="assistantInfo">{groupData.nombre_asistente || 'No asignado'}</span>
                    <Link className="ms-2 edit-icon" onClick={() => setShowEditAssistantModal(true)} to="#">
                      <i className="fas fa-edit"></i>
                    </Link>
                  </p>
                  <p>
                    <strong>Responsable de Hoteles:</strong>{' '}
                    <span id="responsibleHotelsInfo">{groupData.id_responsible_hotels || 'No asignado'}</span>
                    <Link className="ms-2 edit-icon" onClick={() => setShowEditResponsibleHotelsModal(true)} to="#">
                      <i className="fas fa-edit"></i>
                    </Link>
                  </p>
                </Col>
                <Col xs={6} className="d-flex align-items-start justify-content-center">
                  <Link onClick={() => { /* Lógica para abrir modal de mapa */ }} to="#">
                    <img
                      src="/assets/images/mini_mapa.png"
                      alt="Mapa"
                      className="img-fluid mini-map-img"
                      style={{ borderRadius: 0, maxWidth: '90%' }}
                    />
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pestañas de tablas y botones de filtro/exportación */}
      <Row className="mt-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            {/* Pestañas */}
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)} key={id}>
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="clientes" as={Link} to={`/grupo/${id}?table=clientes`}>
                    Clientes
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="hoteles" as={Link} to={`/grupo/${id}?table=hoteles`}>
                    Hoteles
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="cuartos" as={Link} to={`/grupo/${id}?table=cuartos`}>
                    Cuartos
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="opcionales" as={Link} to={`/grupo/${id}?table=opcionales`}>
                    Opcionales
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="liquidacion" as={Link} to={`/grupo/${id}?table=liquidacion`}>
                    Liquidación
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Tab.Container>
            {/* Botones a la derecha */}
            <div className="d-flex justify-content-end" style={{ marginLeft: 'auto' }}>
              <Button className="btn-custom me-2" onClick={() => setShowFilterModal(true)}>
                <i className="fas fa-filter"></i> Filtro
              </Button>
              <Button className="btn-custom" id="exportButton" onClick={() => { /* Lógica para exportar datos */ }}>
                <i className="fas fa-file-export"></i> Exportar Datos
              </Button>
            </div>
          </div>
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)} key={id}>
            <Tab.Content className="mt-3">
              <Tab.Pane eventKey="clientes">
                <ClientsTable data={tableData} />
              </Tab.Pane>
              <Tab.Pane eventKey="hoteles">
                <HotelAssignmentsTable
                  data={tableData}
                  groupPax={groupData.PAX}
                  onEditAssignment={(assignment) => {
                    setShowHotelModal(true);
                    setHotelInitialData(assignment);
                  }}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="cuartos">
                <p>Contenido de cuartos no implementado aún.</p>
              </Tab.Pane>
              <Tab.Pane eventKey="opcionales">
                <OptionalsSection
                  data={tableData}
                  itinerary={itinerary}
                  idGroup={id}
                  currentDate={Date.now()}
                  onAddOptional={handleAddOptional}
                  onEditOptional={handleEditOptional}
                  onOptionModal={handleOptionModal}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="liquidacion">
                <p>Contenido de liquidación no implementado aún.</p>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>

      {/* Modales */}
      <EditGuideModal
        show={showEditGuideModal}
        onHide={() => setShowEditGuideModal(false)}
        groupData={groupData}
        onGuideUpdated={(newGuide) => {
          setGroupData({ ...groupData, guide_name: newGuide.name });
        }}
      />
      <EditBusModal
        show={showEditBusModal}
        onHide={() => setShowEditBusModal(false)}
        groupData={groupData}
        onBusUpdated={(updatedBus) => {
          setGroupData({
            ...groupData,
            bus_company: updatedBus.company_name,
            bus_code: updatedBus.bus_code
          });
        }}
      />
      <EditQRModal
        show={showEditQRModal}
        onHide={() => setShowEditQRModal(false)}
        groupData={groupData}
        onQRUpdated={(newQR) => {
          setGroupData({ ...groupData, QR: newQR });
        }}
      />
      <EditOperationsAgentModal
        show={showEditOperationsAgentModal}
        onHide={() => setShowEditOperationsAgentModal(false)}
        groupData={groupData}
        onOperationsUpdated={(updatedOperations) => {
          setGroupData({
            ...groupData,
            id_operations: updatedOperations.id,
            operaciones_name: updatedOperations.name
          });
        }}
      />
      <EditAssistantModal
        show={showEditAssistantModal}
        onHide={() => setShowEditAssistantModal(false)}
        groupData={groupData}
        onAssistantUpdated={(updatedAssistant) => {
          setGroupData({
            ...groupData,
            id_assistant: updatedAssistant.id,
            nombre_asistente: updatedAssistant.name
          });
        }}
      />
      <EditResponsibleHotelsModal
        show={showEditResponsibleHotelsModal}
        onHide={() => setShowEditResponsibleHotelsModal(false)}
        groupData={groupData}
        onResponsibleUpdated={(updatedResponsible) => {
          setGroupData({ ...groupData, id_responsible_hotels: updatedResponsible.name });
        }}
      />
      {/* Modales para opcionales */}
      <AddOptionalModal
        show={showAddOptionalModal}
        onHide={() => setShowAddOptionalModal(false)}
        clientId={optionalClientData.clientId}
        groupId={groupData.id_group}
        city={optionalClientData.city}
        cityDays={optionalClientData.cityDays}
        clientName={optionalClientData.clientName}
        onOptionalAdded={(data) => {
          fetchGroupData();
        }}
        clientAge={clientAges[optionalClientData.clientId]}
      />
      <EditOptionalModal
        show={showEditOptionalModal}
        onHide={() => setShowEditOptionalModal(false)}
        clientId={currentOptionParams.client?.id_clients}
        groupId={groupData.id_group}
        currentOptionalData={currentOptionalData}
        optionalClientData={currentOptionParams}
        onOptionalUpdated={(data) => {
          fetchGroupData();
        }}
        clientAge={clientAges[optionalClientData.clientId]}
      />
      <DeleteOptionalModal
        show={showDeleteOptionalModal}
        onHide={() => setShowDeleteOptionalModal(false)}
        clientId={currentOptionParams.client?.id_clients}
        groupId={groupData.id_group}
        dayId={optionalClientData.dayId}
        optionalData={currentOptionalData}
        onOptionalDeleted={(data) => {
          fetchGroupData();
        }}
      />
      <OptionModal
        show={showOptionModal}
        onHide={() => setShowOptionModal(false)}
        client={currentOptionParams.client?.id_clients}
        dayId={currentOptionParams.dayId}
        city={currentOptionParams.city}
        groupId={groupData.id_group}
        cityDays={currentOptionParams.cityDays}
        onAdd={handleOptionModalAdd}
        onEdit={handleOptionModalEdit}
        onDelete={handleOptionModalDelete}
      />
      {activeTab === 'opcionales' && (
        <OptionalsFilterModal
          show={showFilterModal}
          onHide={() => setShowFilterModal(false)}
          idGroup={groupData.id_group}
          current_table={activeTab}
          onFiltersApplied={(filters) => {
            const filtersParam = encodeURIComponent(JSON.stringify(filters));
            navigate(`/grupo/${groupData.id_group}?table=${activeTab}&filters=${filtersParam}`);
          }}
        />
        
      )}
      <HotelModal
        show={showHotelModal}
        onHide={() => setShowHotelModal(false)}
        initialData={hotelInitialData || {}}
        groupPax={groupData.PAX}
        onSave={(payload) => {
          // Aquí se envía la solicitud PUT (o POST) al backend
          fetch(`${process.env.REACT_APP_API_URL}/hotels_reservation/update_hotel_reservation`, {
            method: hotelInitialData?.assignment_id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then(r => r.json())
            .then(data => {
              if (data.status === 'success') {
                fetchGroupData(); // Actualiza los datos del grupo
              } else {
                alert('Error al guardar la asignación: ' + data.message);
              }
            })
            .catch(error => {
              console.error('Error:', error);
              alert('Error al guardar la asignación.');
            });
        }}
        onAddAnother={handleOpenHotelAddAnother}
      />
      {/* Modal para Agregar Otro Hotel para el Mismo Día */}
      <HotelAddAnotherModal
        show={showHotelAddAnotherModal}
        onHide={() => setShowHotelAddAnotherModal(false)}
        initialData={hotelAddAnotherInitialData}
        groupPax={groupData.PAX}
        assignedPaxTotal={hotelAddAnotherInitialData.new_pax}
        onSave={(payload) => {
          // Llamar al endpoint para agregar otra asignación para el mismo día.
          fetch(`${process.env.REACT_APP_API_URL}/hotels_reservation/asign_hotel_same_day`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then(r => r.json())
            .then(data => {
              if (data.status === 'success') {
                fetchGroupData();
              } else {
                alert('Error al agregar asignación: ' + data.message);
              }
            })
            .catch(error => {
              console.error('Error:', error);
              alert('Error al agregar la asignación.');
            });
        }}
        onAddAnother={handleOpenHotelAddAnother}
        
      />
    </Container>
  );
};

export default GroupDetail;
