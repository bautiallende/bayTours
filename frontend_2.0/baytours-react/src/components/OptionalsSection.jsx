import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import OptionalRow from './OptionalRow';
import '../styles/_grupo_detalle.scss';

/**
 * OptionalsSection Component
 * 
 * Este componente muestra la sección de opcionales en la vista de detalle del grupo.
 * Renderiza una tabla con la información de cada cliente y sus opcionales, utilizando
 * datos del itinerario para generar las columnas correspondientes.
 * 
 * Props:
 *  - data: Array de clientes con opcionales (table_data).
 *  - itinerary: Información del itinerario (array de ciudades y días).
 *  - idGroup: ID del grupo (string o número).
 *  - currentDate: Timestamp o fecha actual para comparaciones.
 *  - onAddOptional: Callback para agregar un opcional.
 *  - onEditOptional: Callback para editar un opcional.
 *  - onOptionModal: Callback para abrir el modal de opciones (para editar, agregar o borrar).
 */
const OptionalsSection = ({
  data = [],
  itinerary = [],
  idGroup,
  currentDate = Date.now(),
  onAddOptional,
  onEditOptional,
  onOptionModal,
}) => {
  
  // Genera las columnas del header a partir del itinerario
  const headerColumns = [];
  itinerary.forEach(cityInfo => {
    cityInfo.days.forEach(day => {
      let dayClass = '';
      // Convierte la fecha de formato "dd-mm-yyyy" a un objeto Date
      const dayDate = new Date(day.date.split('-').reverse().join('-'));
      const current = new Date(currentDate);
      if (dayDate.toDateString() === current.toDateString()) {
        dayClass = 'current-city';
      } else if (dayDate < current) {
        dayClass = 'past-city';
      }
      headerColumns.push({
        city: cityInfo.city,
        date: day.date,
        dayId: day.id,
        className: dayClass,
      });
    });
  });

  // Calcula el total global de "Total Opcionales" para todos los clientes
  const globalTotal = data.reduce((total, client) => {
    const clientTotal = Object.values(client.day_optionals || {}).reduce((sum, optionals) => {
      return sum + optionals.reduce((s, opt) => s + (opt.total || 0), 0);
    }, 0);
    return total + clientTotal;
  }, 0);

  return (
    <div>
      <Table responsive hover className="table">
        <thead className="thead-custom">
          <tr>
            <th style={{ backgroundColor: '#BDD8F1' }}>PAX</th>
            <th style={{ backgroundColor: '#BDD8F1' }}>Nombre Completo</th>
            <th style={{ backgroundColor: '#BDD8F1' }}>Edad</th>
            <th style={{ backgroundColor: '#BDD8F1' }}>Sexo</th>
            {headerColumns.map((col, idx) => (
              <th key={idx} className={col.className} style={{ backgroundColor: '#BDD8F1' }}>
                {col.city}
                <br />
                <small>{col.date}</small>
              </th>
            ))}
            <th style={{ backgroundColor: '#BDD8F1' }}>Total Opcionales</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map(client => (
              <OptionalRow
                key={client.id_clients}
                client={client}
                itinerary={itinerary}
                idGroup={idGroup}
                currentDate={currentDate}
                onAddOptional={onAddOptional}
                onEditOptional={onEditOptional}
                onOptionModal={onOptionModal}
              />
            ))
          ) : (
            <tr>
              <td colSpan={3 + headerColumns.length + 1}>No se encontraron opcionales.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={3 + headerColumns.length + 1}
              style={{ textAlign: 'right', fontWeight: 'bold' }}
            >
              Total General: {globalTotal.toFixed(2)} €
            </td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
};

OptionalsSection.propTypes = {
  data: PropTypes.array.isRequired,
  itinerary: PropTypes.array,
  idGroup: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currentDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAddOptional: PropTypes.func.isRequired,
  onEditOptional: PropTypes.func.isRequired,
  onOptionModal: PropTypes.func.isRequired,
};

export default React.memo(OptionalsSection);