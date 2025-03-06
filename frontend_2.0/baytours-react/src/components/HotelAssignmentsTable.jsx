import React from 'react';
import { Table, Button } from 'react-bootstrap';

/**
 * HotelAssignmentsTable muestra en forma tabular las asignaciones de hoteles.
 * 
 * Props:
 * - data: Array con las asignaciones de hoteles.
 * - groupPax: Número total de pasajeros del grupo.
 * - onEditAssignment: Función callback que se invoca al presionar el botón "Editar"
 */
const HotelAssignmentsTable = ({ data, groupPax, onEditAssignment }) => {
  if (!data || data.length === 0) {
    return <p>No hay asignaciones de hoteles registradas.</p>;
  }

  // Función para determinar el estilo de la fila
  const getRowClass = (assignment) => {
    if (!assignment.hotel_name || assignment.hotel_name.trim() === "") {
      // console.log('No hay hotel asignado, se pinta de rojo:', assignment.hotel_name);
      return 'row-red';
    }
    if (typeof assignment.pax !== 'undefined' && assignment.assigned_pax < groupPax) {
      // console.log('PAX menor que el grupo, se pinta de amarillo:', assignment.assigned_pax);
      return 'row-yellow';
    }
    return '';
  };

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>Ciudad</th>
          <th>Fecha</th>
          <th>Hotel</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>PAX</th>
          <th>Rooming List</th>
          <th>Pro Forma</th>
          <th>Divisa</th>
          <th>Total a Pagar</th>
          <th>Fecha A Pagar</th>
          <th>Fecha de Pago Realizado</th>
          <th>Factura</th>
          <th>IGA</th>
          <th>Notas</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((assignment, index) => (
          <tr key={index} className={getRowClass(assignment)}>
            <td>{assignment.city}</td>
            <td>{assignment.date ? assignment.date.slice(0, 10) : ''}</td>
            <td>{assignment.hotel_name || '-'}</td>
            <td>{assignment.check_in || '-'}</td>
            <td>{assignment.check_out || '-'}</td>
            <td>{typeof assignment.pax !== 'undefined' ? assignment.pax : '-'}</td>
            <td>{assignment.rooming_list ? 'Sí' : 'No'}</td>
            <td>{assignment.pro_forma ? 'Sí' : 'No'}</td>
            <td>{assignment.currency || '-'}</td>
            <td>{assignment.total_to_pay != null ? assignment.total_to_pay : '-'}</td>
            <td>{assignment.payment_date ? assignment.payment_date.slice(0, 10) : '-'}</td>
            <td>{assignment.payment_done_date ? assignment.payment_done_date.slice(0, 10) : '-'}</td>
            <td>{assignment.factura ? 'Sí' : 'No'}</td>
            <td>{assignment.iga ? 'Sí' : 'No'}</td>
            <td>
            <div style={{ maxHeight: '50px', overflowY: 'auto' }}>
              {Array.isArray(assignment.notes) && assignment.notes.length > 0 ? (
                assignment.notes.map((note, idx) => (
                  <p key={idx} style={{ margin: 0 }}>{note}</p>
                ))
              ) : (
                <p style={{ margin: 0 }}>Sin comentarios</p>
              )}
            </div>
          </td>
            <td>
              <Button variant="primary" size="sm" onClick={() => onEditAssignment(assignment)}>
                Editar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default HotelAssignmentsTable;