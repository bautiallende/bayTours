import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';

// Función para calcular la edad a partir de la fecha de nacimiento
const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const getCurrencySymbol = (currency) => {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    // Agrega más divisas según sea necesario
  };
  return currencySymbols[currency] || '-';
};

const statusMapping = {
  'New': 'Nuevo',
  'Under review': 'En revision',
  'Confirmed': 'Confirmado',
  'Provisional': 'Provisorio'
};

const RoomsTable = ({ roomAssignments, onEditAssignment }) => {
  // Agrupar asignaciones por id_clients
  const groups = roomAssignments.reduce((acc, assignment) => {
    const clientId = assignment.id_clients; // Se asume que "id_clients" es el identificador único del cliente
    if (!acc[clientId]) {
      acc[clientId] = [];
    }
    acc[clientId].push(assignment);
    return acc;
  }, {});

  // Convertir el objeto en un array de grupos
  const groupedAssignments = Object.values(groups);

  const getRowClass = (assignment) => {
    switch (assignment.status) {
      case 'New':
        return 'row-yellow';
      case 'Under review':
        return 'row-red';
      case 'Confirmed':
        return '';
      case 'Provisional':
        return 'row-yellow';
      default:
        return '';
    }
  };

  return (
    <Table responsive bordered>
      <thead>
        <tr>
          <th>Nombre Completo</th>
          <th>Edad</th>
          <th>Sexo</th>
          <th>Pasaporte</th>
          <th>Fecha</th>
          <th>Hotel</th>
          <th>Ciudad</th>
          <th>Tipo de Habitación</th>
          <th>Nº Habitación</th>
          <th>Precio</th>
          <th>Suplementos</th>
          <th>Divisa</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>Estado</th>
          <th>Notas</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {groupedAssignments.length ? (
          groupedAssignments.map((group) => {
            const first = group[0];
            const rowSpan = group.length;
            const fullName = `${first.first_name || ''} ${first.second_name || ''} ${first.paternal_surname || ''} ${first.mother_surname || ''}`.trim();
            const age = calculateAge(first.birth_date);
            return group.map((assignment, index) => (
              <tr key={`${assignment.id}-${index}`}  className={getRowClass(assignment)}>
                {index === 0 && (
                  <>
                    <td rowSpan={rowSpan}>{fullName}</td>
                    <td rowSpan={rowSpan}>{age}</td>
                    <td rowSpan={rowSpan}>{assignment.sex || '-'}</td>
                    <td rowSpan={rowSpan}>{assignment.passport || '-'}</td>
                  </>
                )}
                {/* Para la columna Fecha, usamos el campo "date" */}
                <td>{assignment.date ? assignment.date.split('T')[0] : '-'}</td>
                <td>{assignment.hotel_name || '-'}</td>
                <td>{assignment.city || '-'}</td>
                <td>{assignment.type || '-'}</td>
                <td>{assignment.room_number || '-'}</td>
                <td>{`${getCurrencySymbol(assignment.currency)}${assignment.price || ''}`}</td>
                <td>{`${getCurrencySymbol(assignment.supplements_currency)}${assignment.supplements || ''}`}</td>
                <td>{assignment.supplements_currency || '-'}</td>
                <td>{assignment.check_in_date ? assignment.check_in_date.split('T')[0] : '-'}</td>
                <td>{assignment.departure_date ? assignment.departure_date.split('T')[0] : '-'}</td>
                <td>{statusMapping[assignment.status] || assignment.status}</td>
                <td>{assignment.comments || '-'}</td>
                {/* En la columna de acciones, mostramos el botón sólo en la primera fila del grupo */}
                <td>
                    <Button variant="primary" size="sm" onClick={() => onEditAssignment(group[index])}>
                      Editar
                    </Button>
                </td>
              </tr>
            ));
          })
        ) : (
          <tr>
            <td colSpan="16" className="text-center">
              No hay asignaciones de cuartos.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

RoomsTable.propTypes = {
  roomAssignments: PropTypes.array.isRequired,
  onEditAssignment: PropTypes.func.isRequired,
};

export default RoomsTable;