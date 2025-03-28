import React, { useState, useEffect, useCallback } from 'react';
import { Button, Container, Row, Col, Tab, Nav, Spinner } from 'react-bootstrap';
import { useParams, useLocation, Link, useNavigate    } from 'react-router-dom';

// Importamos nuestros nuevos componentes refactorizados
import InfoGeneral from '../components/GroupDetail/InfoGeneral';
import ItinerarySection from '../components/GroupDetail/ItinerarySection';
import ContactSection from '../components/GroupDetail/ContactSection';

// Componentes principales para mostrar datos
import ClientsTable from '../components/ClientsTable';
import OptionalsSection from '../components/OptionalsSection';
import OptionalsFilterModal from '../components/OptionalsFilterModal';

import HotelAssignmentsTable from '../components/HotelAssignmentsTable'; // Placeholder para asignaciones de hoteles
import HotelModal from '../components/GroupDetail/modals/HotelModal';
// Importamos el modal para agregar otro hotel (HotelAddAnotherModal.jsx)
import HotelAddAnotherModal from '../components/GroupDetail/modals/HotelAddAnotherModal';
import HotelFilterModal from '../components/GroupDetail/modals/HotelFilterModal';


// Importar los modales para los cuartos 
import RoomsTable from '../components/GroupDetail/RoomsTable';
import CitySubMenu from '../components/GroupDetail/CitySubmenu';
import RoomAssignmentModal from '../components/GroupDetail/modals/RoomAssignmentModal';
import RoomFilterModal from '../components/GroupDetail/modals/RoomFilterModal';

// Modales para edición de información general
import EditGuideModal from '../components/GroupDetail/modals/EditGuideModal';
import EditBusModal from '../components/GroupDetail/modals/EditBusModal';
import EditQRModal from '../components/GroupDetail/modals/EditQRModal';

// Importar los nuevos modales
import EditOperationsAgentModal from '../components/GroupDetail/modals/EditOperationsAgentModal';
import EditAssistantModal from '../components/GroupDetail/modals/EditAssistantModal';
import EditResponsibleHotelsModal from '../components/GroupDetail/modals/EditResponsibleHotelsModal';

// Importar modales para opcionales (Add, Edit y Delete)
import AddOptionalModal from '../components/GroupDetail/modals/AddOptionalModal';
import EditOptionalModal from '../components/GroupDetail/modals/EditOptionalModal';
import DeleteOptionalModal from '../components/GroupDetail/modals/DeleteOptionalModal';

import OptionModal from '../components/GroupDetail/modals/OptionModal';
// ... otros modales que necesites


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
  const [showHotelFilterModal, setShowHotelFilterModal] = useState(false);

  // Estados para la sección de cuartos
  const [dayOptions, setDayOptions] = useState({}); 
  const [selectedCity, setSelectedCity] = useState('');
  const [roomAssignments, setRoomAssignments] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomModalData, setRoomModalData] = useState(null);
  const [availableHotels, setAvailableHotels] = useState([]);
  const [availableCity, setAvailableCity] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  
  // --- Función para obtener datos del grupo ---
  const fetchGroupData = useCallback(() => {
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
  }, [id , activeTab, filters]);

  // Actualizar datos cada vez que cambie el id, la pestaña activa o los filtros
  useEffect(() => {
    setLoading(true);
    fetchGroupData();
  }, [fetchGroupData]);

  // --- Callbacks para manejar modales de opcionales ---
  // Función para obtener las opciones de días (submenú de ciudades)
const fetchDayOptions = () => {
  fetch(`${process.env.REACT_APP_API_URL}/days/get_day_id?id_group=${groupData.id_group}`)
    .then(res => res.json())
    .then(data => {
      setDayOptions(data);
      // Si no hay ciudad seleccionada, elegir la primera clave
      const cities = Object.keys(data);
      if (cities.length > 0 && !selectedCity) {
        setSelectedCity(cities[0]);
      }
    })
    .catch(err => console.error('Error al obtener opciones de días:', err));
};

// Función para obtener asignaciones de cuartos según id_days
const fetchRoomAssignments = () => {
  if (selectedCity && dayOptions[selectedCity]) {
    const id_days = dayOptions[selectedCity]; // Esto es un array de strings
    fetch(`${process.env.REACT_APP_API_URL}/rooms/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id_days),
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRoomAssignments(data);
        }
      })
      .catch(err => console.error('Error al obtener asignaciones de cuartos:', err));
  }
};

  useEffect(() => {
    if (groupData) {
      fetchDayOptions();
    }
  }, [groupData]);

  useEffect(() => {
    // Cada vez que cambia la ciudad seleccionada, actualizamos la tabla de cuartos
    if (selectedCity) {
      fetchRoomAssignments();
    }
  }, [selectedCity, dayOptions]);

  
  const handleEditRoom = (assignment) => {
    // Función para convertir la fecha de "DD/MM" a "YYYY-MM-DD"
    const formatDateToISO = (dateStr, year) => {
      const [day, month] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    };

    // Supongamos que assignment.date tiene el formato "DD/MM" y necesitas agregar el año
    const year = new Date().getFullYear(); // Puedes ajustar esto según sea necesario
    const formattedDate = formatDateToISO(assignment.date, year);
    
    // Asumiendo que assignment tiene, entre otros, "city" y "date"
    // Llama al endpoint para obtener los hoteles disponibles para esa ciudad y fecha
    fetch(`${process.env.REACT_APP_API_URL}/hotels_reservation/get_by_group_and_date?id_group=${groupData.id_group}&date_day=${formattedDate}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableHotels(data); 
        } else {
          setAvailableHotels([]);
        }
      })
      .catch(err => {
        console.error('Error al obtener hoteles disponibles:', err);
        setAvailableHotels([]);
      });
    
    setRoomModalData(assignment);
    setShowRoomModal(true);

    fetch(`${process.env.REACT_APP_API_URL}/rooms/city?id_days=${assignment.id_days}`)
      .then(res => res.json())
      .then(data => {
        console.log('Ciudades disponibles:', data);
        setAvailableCity(data);
      })
      .catch(err => console.error('Error al obtener Ciudades disponibles:', err));

    fetch(`${process.env.REACT_APP_API_URL}/rooms/room?id_days=${assignment.id_days}`)
      .then(res => res.json())
      .then(data => {
        console.log('Habitaciones disponibles:', data);
        setAvailableRooms(data);
      })
      .catch(err => console.error('Error al obtener Hbitaciones disponibles:', err));
  };

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

  const handleApplyHotelFilters = (filters) => {
    const filtersParam = encodeURIComponent(JSON.stringify(filters));
    navigate(`/grupo/${groupData.id_group}?table=hoteles&filters=${filtersParam}`);
  };

  // Ejemplo de callback para abrir el modal de agregar otro hotel:
  const handleOpenHotelAddAnother = (assignmentData) => {
    console.log('Datos de la asignación actual:', assignmentData);
    // Si el modal no está abierto, reiniciamos; de lo contrario, acumulamos
    setHotelAddAnotherInitialData((prev) => {
      if (!showHotelAddAnotherModal) {
        return {
          city: assignmentData.city,
          date: assignmentData.date,
          id_group: groupData.id_group,
          new_pax: Number(assignmentData.new_pax || 0),
          id_day: assignmentData.id_day,
        };
      } else {
        return {
          city: assignmentData.city,
          date: assignmentData.date,
          id_group: groupData.id_group,
          new_pax: Number(assignmentData.paxAssigned  || 0),
          id_day: assignmentData.id_day,
        };
      }
    });
    // O, alternativamente, forzar el reinicio cuando se cierra el modal
    setShowHotelAddAnotherModal(true);
  };

  const handleCloseHotelAddAnother = () => {
    setShowHotelAddAnotherModal(false);
    setHotelAddAnotherInitialData({});
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

      {/* Sección Superior: Información General, Itinerario y Contacto */}
      <Row className="mt-3">
        <Col md={3}>
          <InfoGeneral 
            groupData={groupData} 
            onEditGuide={() => {setShowEditGuideModal(true)}} 
            onEditBus={() => {setShowEditBusModal(true)}} 
            onEditQR={() => {setShowEditQRModal(true)}} 
          />
        </Col>
        <Col md={5}>
          <ItinerarySection groupData={groupData} />
        </Col>
        <Col md={4}>
          <ContactSection 
            groupData={groupData} 
            onEditOperations={() => {setShowEditOperationsAgentModal(true)}} 
            onEditAssistant={() => {setShowEditAssistantModal(true)}} 
            onEditResponsible={() => {setShowEditResponsibleHotelsModal(true)}} 
            onOpenMap={() => {/* Lógica para abrir modal de mapa */}} 
          />
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
                <Row className="mb-3">
                  <Col>
                    <CitySubMenu 
                      cities={Object.keys(dayOptions)}
                      selectedCity={selectedCity}
                      onSelectCity={setSelectedCity}
                    />
                  </Col>
                </Row>
                {/* Tabla de cuartos */}
                <Row>
                  <Col>
                    <RoomsTable 
                      roomAssignments={roomAssignments} 
                      onEditAssignment={handleEditRoom}
                    />
                  </Col>
                </Row>
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
          fetchGroupData();
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
      {activeTab === 'hoteles' && (
        <HotelFilterModal
          show={showFilterModal}
          idGroup={groupData.id_group}
          onHide={() => setShowFilterModal(false)}
          onApplyFilters={(filters) => {
            const filtersParam = encodeURIComponent(JSON.stringify(filters));
            navigate(`/grupo/${groupData.id_group}?table=${activeTab}&filters=${filtersParam}`);
          }}
        />
      )}
      {activeTab === 'cuartos' && (
        <RoomFilterModal
          show={showFilterModal}
          onHide={() => setShowFilterModal(false)}
          onApplyFilters={(filters) => {
            const filtersParam = encodeURIComponent(JSON.stringify(filters));
            navigate(`/grupo/${groupData.id_group}?table=cuartos&filters=${filtersParam}`);
          }}
          availableHotels={availableHotels}
          availableCities={availableCity}
          availableRoomTypes={availableRooms}
        />
      )
      }
      <HotelModal
        show={showHotelModal}
        onHide={() => setShowHotelModal(false)}
        initialData={hotelInitialData || {}}
        groupPax={groupData.PAX}
        onSave={(payload) => {
          return fetch(`${process.env.REACT_APP_API_URL}/hotels_reservation/update_hotel_reservation`, {
            method: hotelInitialData?.assignment_id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then(async (response) => {
              if (!response.ok) {
                const errorData = await response.json();
                // Lanza el error para que el modal lo capture y lo muestre
                throw errorData;
              }
              return response.json();
            })
            .then((data) => {
              if (data.status === 'success') {
                fetchGroupData(); // Actualiza los datos del grupo
              }
              return data;
            });
        }}
        onAddAnother={handleOpenHotelAddAnother}
      />
      {/* Modal para Agregar Otro Hotel para el Mismo Día */}
      <HotelAddAnotherModal
        show={showHotelAddAnotherModal}
        onHide={() => {
          setShowHotelAddAnotherModal(false);
          setHotelAddAnotherInitialData({}); // Reiniciamos si es necesario
        }}
        initialData={hotelAddAnotherInitialData}
        groupPax={groupData.PAX}
        assignedPaxTotal={hotelAddAnotherInitialData.new_pax || 0}
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
              return data;
            })
            .catch(error => {
              console.error('Error:', error);
              alert('Error al agregar la asignación.');
            });
        }}
        onAddAnother={handleOpenHotelAddAnother}
        
      />
      <RoomAssignmentModal
        show={showRoomModal}
        onHide={() => setShowRoomModal(false)}
        initialData={roomModalData || {}}
        onSave={(payload) => {
          // Aquí realizas la llamada al endpoint para guardar la modificación del cuarto.
          return fetch(`${process.env.REACT_APP_API_URL}/hotels_room/update_client_room`, {
            method: roomModalData?.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
            .then(res => res.json())
            .then(data => {
              if (data.status === 'success') {
                fetchRoomAssignments(); // Actualiza la tabla de cuartos
                return data;
              } else if(data.status_code === 400) {
                throw new Error(data.detail || 'Error al guardar la asignación');
              } else {
                throw new Error(data.message || 'Error al guardar la asignación');
              }
            });
        }}
        availableHotels={availableHotels}
      />
    </Container>
  );
};

export default GroupDetail;
