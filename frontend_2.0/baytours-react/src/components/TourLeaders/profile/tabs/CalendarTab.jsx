import React, { useMemo, useRef, useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { colorForCircuit } from '../utils';

/**
 * Calendario tipo Grupos (FullCalendar)
 * - Eventos multi-día para asignaciones e indisponibilidad
 */
export default function CalendarTab({ assignments = [], unavailability = [] }) {
  const calendarRef = useRef(null);
  const [showAssign, setShowAssign] = useState(true);
  const [showUnavail, setShowUnavail] = useState(true);

  const addOneDay = (iso) => {
    if (!iso) return undefined;
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const events = useMemo(() => {
    const evts = [];
    if (showAssign) {
      assignments.forEach(a => {
        const bg = colorForCircuit(a.circuit_name);
        evts.push({
          title: `${a.id_group}${a.circuit_name ? ' · ' + a.circuit_name : ''}`,
          start: a.start_date,
          end: addOneDay(a.end_date || a.start_date),
          allDay: true,
          backgroundColor: bg,
          borderColor: '#dee2e6',
          extendedProps: { type: 'assignment', ...a }
        });
      });
    }
    if (showUnavail) {
      unavailability.forEach(u => {
        evts.push({
          title: u.status || 'Indisponible',
          start: u.start_date,
          end: addOneDay(u.end_date || u.start_date),
          allDay: true,
          backgroundColor: '#f8d7da',
          borderColor: '#f5c2c7',
          extendedProps: { type: 'unavailability', ...u }
        });
      });
    }
    return evts;
  }, [assignments, unavailability, showAssign, showUnavail]);

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3 small">
          <Form.Check type="checkbox" id="cal-assign" label="Asignaciones"
                      checked={showAssign} onChange={(e)=>setShowAssign(e.target.checked)} />
          <Form.Check type="checkbox" id="cal-unavail" label="Indisponibilidad"
                      checked={showUnavail} onChange={(e)=>setShowUnavail(e.target.checked)} />
          <div className="d-flex align-items-center gap-2">
            <span className="badge" style={{ background: '#9ec5fe' }}>&nbsp;&nbsp;</span>
            <span className="text-muted">Circuitos</span>
            <span className="badge" style={{ background: '#f8d7da' }}>&nbsp;&nbsp;</span>
            <span className="text-muted">Indisp.</span>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events}
          editable={false}
          selectable={false}
          height="auto"
          dayMaxEvents
          displayEventEnd
        />
      </Card.Body>
    </Card>
  );
}