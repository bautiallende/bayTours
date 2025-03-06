import React from 'react';
import { Table } from 'react-bootstrap';
import OptionalRow from './OptionalRow';
import '../styles/_grupo_detalle.scss'; // Asegúrate de importar los estilos necesarios

/**
 * OptionalsSection recibe:
 *  - data: array de clientes con opcionales (table_data)
 *  - itinerary: información del itinerario (con ciudades y días)
 *  - idGroup: ID del grupo (para acciones, etc.)
 */
const OptionalsSection = ({ data, itinerary = [], idGroup, currentDate = Date.now(), onAddOptional, onEditOptional, onOptionModal }) => {
  // total_days se calcula sumando la cantidad de días de cada ciudad
  const totalDays = itinerary.reduce((acc, cityInfo) => acc + cityInfo.days.length, 0);

  // Para el header, generamos una lista de columnas a partir de itinerary
  const headerColumns = [];
  itinerary.forEach(cityInfo => {
    cityInfo.days.forEach(day => {
      // Determinar la clase según la fecha
      let dayClass = '';
      const dayDate = new Date(day.date.split('-').reverse().join('-')); // Asumiendo formato "dd-mm-yyyy"
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

  // Calcular el total global de "Total Opcionales" para todos los clientes
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
            data.map((client, index) => (
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
            <td colSpan={3 + headerColumns.length + 1} style={{ textAlign: 'right', fontWeight: 'bold' }}>
              Total General: {globalTotal.toFixed(2)} €
            </td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
};

export default OptionalsSection;