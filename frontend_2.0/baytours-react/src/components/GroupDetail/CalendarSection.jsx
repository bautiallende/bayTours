import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';


const CalendarSection = () => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    // podrías cargar eventos aquí
  }, []);

  return (
    <FullCalendar
      plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
      initialView="dayGridMonth"
      events={events}
      height="auto"
    />
  );
};

export default CalendarSection;