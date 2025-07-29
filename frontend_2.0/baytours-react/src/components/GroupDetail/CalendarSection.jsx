import React, { useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Form, Row, Col, Spinner, Alert, Overlay, Popover } from 'react-bootstrap';
import PermitEditModal from './modals/PermitEditModal';
import TransportEditModal from './modals/TransportEditModal';
import OptionalEditModal from './modals/OptionalEditModal';
import CreateTypeModal from './modals/CreateTypeModal';
import CreateTransportModal from './modals/CreateTransportModal';
import CreatePermitModal    from './modals/CreatePermitModal'

/**
 * CalendarSection
 * Props:
 *  - groupId: id del grupo para cargar los eventos
 *  - initialDate: (opcional) "YYYY-MM-DD" para arrancar la vista
 */
const CalendarSection = ({ groupId, initialDate }) => {
  const calendarRef = useRef(null);
  const [showHotels, setShowHotels] = useState(true);
  const [showActivities, setShowActivities] = useState(true);
  const [showPermits, setShowPermits] = useState(true);
  const [showTransport, setShowTransport] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Crear eventos
  const [showCreateType, setShowCreateType] = useState(false);
  const [creationDate, setCreationDate] = useState(null);

  // Tooltip
  const [hoverEvent, setHoverEvent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // Edit modals
  const [showPermitModal, setShowPermitModal] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [showOptionalModal, setShowOptionalModal] = useState(false);
  const [selectedOptional, setSelectedOptional] = useState(null);

  // Handler creación transporte
  const handleCreateTransport = payload => {
    // Reemplazar creationDate por id_day apropiado si es distinto
    fetch(`${process.env.REACT_APP_API_URL}/days/${groupId}/${creationDate}/transports_date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw res;
        return res.json();
      })
      .then(() => {
        calendarRef.current.getApi().refetchEvents();
        setShowTransportModal(false);
        setSelectedTransport(null);
      })
      .catch(err => {
        console.error('Error al crear transporte', err);
        alert('No se pudo crear el transporte.');
        setShowTransportModal(false);
        setSelectedTransport(null);
      });
  };


// Crear permiso
const handleCreatePermit = payload => {
  fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/permits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  .then(res => { if (!res.ok) throw res; return res.json(); })
  .then(() => {
    calendarRef.current.getApi().refetchEvents();
    setShowPermitModal(false);
    setSelectedPermit(null);
  })
  .catch(err => {
    console.error('Error al crear permiso', err);
    alert('No se pudo crear el permiso.');
    setShowPermitModal(false);
    setSelectedPermit(null);
  });
};

  /** fetchEvents: carga y transforma los eventos */
  const fetchEvents = useCallback((fetchInfo, successCallback, failureCallback) => {
    fetch(`${process.env.REACT_APP_API_URL}/calendar/group/${groupId}`)
      .then(res => { if (!res.ok) throw new Error('Network error'); return res.json(); })
      .then(data => {
        const mapped = data.map(event => {
          let adjustedEnd = event.end;
          if (event.type === 'permit' && event.end) {
            const d = new Date(event.end);
            d.setDate(d.getDate() + 1);
            adjustedEnd = d.toISOString().split('T')[0];
          }
          return {
            ...event,
            start: event.start,
            end: adjustedEnd,
            allDay: event.type === 'permit',
            extendedProps: { ...event.extendedProps, sortStart: new Date(event.start).getTime() },
          };
        });
        const sorted = [...mapped].sort((a, b) => a.extendedProps.sortStart - b.extendedProps.sortStart);
        const filtered = sorted.filter(evt => {
          if (evt.type === 'hotel' && !showHotels) return false;
          if (evt.type === 'optional' && !showActivities) return false;
          if (evt.type === 'permit' && !showPermits) return false;
          if (evt.type === 'transport' && !showTransport) return false;
          return true;
        });
        successCallback(filtered);
      })
      .catch(err => { console.error('Error loading events', err); setLoadError('No se pudieron cargar los eventos.'); failureCallback(err); });
  }, [groupId, showHotels, showActivities, showPermits, showTransport]);

  // Etiquetas
  const typeLabels = { hotel: 'Hotel', optional: 'Opcional', permit: 'Permiso', transport: 'Transporte', flight: 'Vuelo' };
  const statusLabels = { pending: 'Pendiente', submitted: 'Enviado', approved: 'Aprobado', rejected: 'Rechazado', confirmed: 'Aprobado', cancelled: 'Cancelado' };
  const formatTooltipDate = val => {
    const d = new Date(val);
    if (!isNaN(d)) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${dd}-${mm}-${d.getFullYear()}`;
    }
    return val;
  };

  // Tooltip handlers
  const handleEventMouseEnter = info => { setHoverEvent(info.event); setAnchorEl(info.el); };
  const handleEventMouseLeave = () => { setHoverEvent(null); setAnchorEl(null); };

  // Handler para crear
  const handleDateClick = info => {
    setCreationDate(info.dateStr);
    setShowCreateType(true);
  };

  const handleSelectType = type => {
    setShowCreateType(false);
    if (type === 'permit') {
      setSelectedPermit({ id: null, startStr: creationDate, endStr: creationDate, extendedProps: {} });
      setShowPermitModal(true);
    } else if (type === 'transport') {
      setSelectedTransport({ id: null, start: `${creationDate}T00:00:00`, end: `${creationDate}T00:00:00`, extendedProps: {} });
      setShowTransportModal(true);
    }
  };

  // Clic en evento existente
  const handleEventClick = clickInfo => {
    const evt = clickInfo.event;
    if (evt.extendedProps.type === 'permit') {
      setSelectedPermit(evt); setShowPermitModal(true);
    } else if (evt.extendedProps.type === 'transport') {
      setSelectedTransport(evt); setShowTransportModal(true);
    } else if (evt.extendedProps.type === 'optional') {
      setSelectedOptional(evt); setShowOptionalModal(true);
    }
  };

  // Guardar permisos, transporte, opcional...
  const handleSavePermit = updatedData => { /* PATCH logic */ };
  const handleSaveTransport = updatedData => { /* PATCH logic */ };
  const handleSaveOptional = updatedData => { /* PATCH logic */ };

  // FullCalendar props
  const fcProps = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
    events: fetchEvents,
    editable: false,
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    eventMouseEnter: handleEventMouseEnter,
    eventMouseLeave: handleEventMouseLeave,
    height: 'auto',
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    eventClassNames: ({ event }) => [`fc-type-${event.extendedProps.type}`],
    dayMaxEvents: false,
    loading: isLoading => setLoading(isLoading),
    eventDisplay: 'block'
  };

  if (initialDate) {
    const d = new Date(initialDate);
    if (!isNaN(d)) fcProps.initialDate = d.toISOString().split('T')[0];
  }

  return (
    <div className="calendar-section position-relative">
      <Form className="mb-3"><Row>
        <Col xs="auto"><Form.Check type="checkbox" label="Hoteles" checked={showHotels} onChange={() => setShowHotels(!showHotels)} /></Col>
        <Col xs="auto"><Form.Check type="checkbox" label="Opcionales" checked={showActivities} onChange={() => setShowActivities(!showActivities)} /></Col>
        <Col xs="auto"><Form.Check type="checkbox" label="Permisos pendientes" checked={showPermits} onChange={() => setShowPermits(!showPermits)} /></Col>
        <Col xs="auto"><Form.Check type="checkbox" label="Métodos de transporte" checked={showTransport} onChange={() => setShowTransport(!showTransport)} /></Col>
      </Row></Form>

      {loadError && <Alert variant="danger" className="mb-3">{loadError}</Alert>}
      {loading && <div className="loader-overlay"><Spinner animation="border" /></div>}

      <FullCalendar ref={calendarRef} {...fcProps} />

      <Overlay target={anchorEl} show={!!hoverEvent} placement="top">
        <Popover id="event-tooltip"><Popover.Header as="h3">Detalle del evento</Popover.Header><Popover.Body>
          {hoverEvent && (<>
            <div><strong>Tipo:</strong> {typeLabels[hoverEvent.extendedProps.type]}</div>
            {hoverEvent.extendedProps.Estado && (<div><strong>Estado:</strong> {statusLabels[hoverEvent.extendedProps.Estado]}</div>)}
            {Object.entries(hoverEvent.extendedProps).filter(([k]) => !['sortStart','type','Estado','id_optional','id_days','id_local_guide'].includes(k)).map(([key,value]) => (
              <div key={key}><strong>{key}:</strong> {typeof value==='string'&&/^\d{4}-\d{2}-\d{2}/.test(value)?formatTooltipDate(value):value??'—'}</div>
            ))}
          </>) }
        </Popover.Body></Popover>
      </Overlay>

      {/* Create Type Modal */}
      <CreateTypeModal show={showCreateType} onHide={() => setShowCreateType(false)} onSelect={handleSelectType} />

      {/* Edit Modals */}
      {/* {selectedPermit && <PermitEditModal show={showPermitModal} onHide={() => setShowPermitModal(false)} onSave={handleSavePermit} event={selectedPermit} />} */}
      {selectedPermit && (selectedPermit.id === null ? (
        <CreatePermitModal
          show={showPermitModal}
          onHide={() => setShowPermitModal(false)}
          onCreate={handleCreatePermit}
          groupId={groupId}
          creationDate={creationDate}
        />
      ) : (
        <PermitEditModal
          show={showPermitModal}
          onHide={() => setShowPermitModal(false)}
          onSave={handleSavePermit}
          event={selectedPermit}
        />))}
      {selectedTransport && (selectedTransport.id === null ? (
        <CreateTransportModal
          show={showTransportModal}
          onHide={() => setShowTransportModal(false)}
          onCreate={handleCreateTransport}
          creationDate={creationDate}
        />
      ) : (
        <TransportEditModal
          show={showTransportModal}
          onHide={() => setShowTransportModal(false)}
          onSave={handleSaveTransport}
          event={selectedTransport}
        />
      ))}
      {selectedOptional && <OptionalEditModal show={showOptionalModal} onHide={() => setShowOptionalModal(false)} onSave={handleSaveOptional} event={selectedOptional} />}
    </div>
  );
};

export default CalendarSection;
