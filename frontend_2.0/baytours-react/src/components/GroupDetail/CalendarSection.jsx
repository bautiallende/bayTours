import React, { useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Form, Row, Col, Spinner, Alert } from 'react-bootstrap';

/**
 * CalendarSection
 *
 * Props:
 *  - groupId: el id del grupo para cargar los eventos
 *  - initialDate: (opcional) "YYYY-MM-DD" para arrancar la vista en el mes correspondiente
 */
const CalendarSection = ({ groupId, initialDate }) => {
  const calendarRef = useRef(null);
  const [showHotels, setShowHotels] = useState(true);
  const [showActivities, setShowActivities] = useState(true);
  const [showPermits, setShowPermits] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Función pura para fetch de eventos, memorizada para evitar referencia nueva en cada render
  const fetchEvents = useCallback((fetchInfo, successCallback, failureCallback) => {
    fetch(`${process.env.REACT_APP_API_URL}/calendar/group/${groupId}`)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        console.log('Raw events:', data);
        // Mapear eventos para añadir un campo numérico de orden según timestamp
        const withSortKey = data.map(event => ({
          ...event,
          extendedProps: {
            ...event.extendedProps,
            sortStart: new Date(event.start).getTime(),
          },
        }));
        console.log('With sortStart:', withSortKey.map(e => ({ id: e.id, start: e.start, sortStart: e.extendedProps.sortStart })));
        // Ordenar globalmente por timestamp de inicio
        const sorted = withSortKey.sort((a, b) => a.extendedProps.sortStart - b.extendedProps.sortStart);
        console.log('Sorted events:', sorted.map(e => ({ id: e.id, start: e.start })));
        // Filtrar según toggles
        const filtered = sorted.filter(event => {
          if (event.type === 'hotel' && !showHotels) return false;
          if (event.type === 'optional' && !showActivities) return false;
          if (event.type === 'permit' && !showPermits) return false;
          return true;
        });
        console.log('Filtered events:', filtered.map(e => ({ id: e.id, start: e.start })));
        successCallback(filtered);
      })
      .catch(err => {
        console.error('Error loading events', err);
        setLoadError('No se pudieron cargar los eventos.');
        failureCallback(err);
      });
  }, [groupId, showHotels, showActivities, showPermits]);

  // Props base para FullCalendar
  const fcProps = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    events: fetchEvents,
    height: 'auto',
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    // Ordenar según la clave numérica que añadimos
    eventOrder: 'extendedProps.sortStart',
    slotEventOverlap: false,
    eventClassNames: ({ event }) => [`fc-type-${event.extendedProps.type}`],
    dayMaxEvents: false,
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    // Callbacks de estado
    loading: (isLoading) => setLoading(isLoading),
    eventFetchError: () => setLoadError('Error al cargar eventos'),
  };

  // Ajustar fecha inicial si viene por props
  if (initialDate) {
    const d = new Date(initialDate);
    if (!isNaN(d)) {
      fcProps.initialDate = d.toISOString().split('T')[0];
    }
  }

  return (
    <div className="calendar-section position-relative">
      {/* Filtros */}
      <Form className="mb-3">
        <Row>
          <Col xs="auto">
            <Form.Check
              type="checkbox"
              label="Hoteles"
              checked={showHotels}
              onChange={() => setShowHotels(!showHotels)}
            />
          </Col>
          <Col xs="auto">
            <Form.Check
              type="checkbox"
              label="Opcionales"
              checked={showActivities}
              onChange={() => setShowActivities(!showActivities)}
            />
          </Col>
          <Col xs="auto">
            <Form.Check
              type="checkbox"
              label="Permisos pendientes"
              checked={showPermits}
              onChange={() => setShowPermits(!showPermits)}
            />
          </Col>
        </Row>
      </Form>

      {/* Mensaje de error */}
      {loadError && <Alert variant="danger" className="mb-3">{loadError}</Alert>}

      {/* Spinner superpuesto durante carga */}
      {loading && (
        <div className="loader-overlay">
          <Spinner animation="border" />
        </div>
      )}

      {/* Calendario */}
      <FullCalendar
        ref={calendarRef}
        {...fcProps}
        height={900}
        contentHeight={900}
      />
    </div>
  );
};

export default CalendarSection;
